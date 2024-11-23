import { Injectable } from '@nestjs/common';
import { TrieService } from './trie/trie.service';
import { CityRepository } from './repositories/city.repository';
import { SuggestionEntity } from './entities/suggestion.entity';
import * as FuzzySet from 'fuzzyset.js';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { CityEntity } from './entities/city.entity';

@Injectable()
export class SuggestionsService {
    private fuzzySet: FuzzySet;
    private cities: CityEntity[]; // This should be your city data source

    constructor(
        private readonly trieService: TrieService,
        private readonly cityRepository: CityRepository,
    ) {
        this.fuzzySet = new FuzzySet();
    }

    async onModuleInit() {
        await this.initializeCities();
    }

    private async initializeCities() {
        try {
            this.cities = await this.cityRepository.getAllCities();
            if (this.cities && this.cities.length > 0) {
                this.cities.forEach(city => {
                    this.fuzzySet.add(city.name);
                });
            }
        } catch (error) {
            console.error("Error initializing cities:", error);
            throw new Error("Failed to load cities");
        }
    }

    /**
     * Loads city data from a TSV file into the trie structure for future suggestions.
     * @param filePath - The relative path to the TSV file containing city data.
     */
    async loadCities(filePath: string): Promise<void> {
        try {
            await this.cityRepository.loadCitiesFromFile(filePath);
            await this.initializeCities(); // Implement this method in CityRepository
        } catch (error) {
            console.error("Error loading cities:", error);
            throw new Error("Failed to load cities");
        }
    }

    /**
     * Retrieves a list of city suggestions based on a query and optional user location.
     * @param query - The prefix of the city name to search for.
     * @param latitude - Optional latitude of the user's location.
     * @param longitude - Optional longitude of the user's location.
     * @returns An array of suggested cities with their names, coordinates, and scores.
     */
    async getSuggestions(
        query: CreateSuggestionDto,
    ): Promise<Array<SuggestionEntity>> {
        if (!this.cities) {
            await this.initializeCities();
        }

        if (!this.cities || this.cities.length === 0) {
            throw new Error("Failed to load cities");
        }

        // Search for cities matching the query prefix
        const suggestions: SuggestionEntity[] = [];
        const hasQuery = !!query.q;
        const hasCoordinates = query.latitude !== undefined && query.longitude !== undefined;

        // Case 1: Both q and coordinates exist
        if (hasQuery && hasCoordinates) {
            const fuzzyMatches = await this.getFuzzyMatches(query.q);
            if (fuzzyMatches.length === 0) {
                // If no fuzzy matches, try prefix matching
                const prefixMatches = this.cities.filter(city =>
                    city.name.toLowerCase().startsWith(query.q.toLowerCase())
                );
                for (const city of prefixMatches) {
                    const proximityScore = this.calculateProximityScore(
                        city.latitude,
                        city.longitude,
                        query.latitude,
                        query.longitude,
                    ).score;

                    suggestions.push({
                        name: this.formatCityName(city),
                        latitude: city.latitude,
                        longitude: city.longitude,
                        score: this.combineScores(1, proximityScore),
                    });
                }
            } else {
                for (const match of fuzzyMatches) {
                    const cityDetails = await this.getCityDetails(match[1]);
                    if (!cityDetails) continue;

                    const fuzzyScore = match[0];
                    const proximityScore = this.calculateProximityScore(
                        cityDetails.latitude,
                        cityDetails.longitude,
                        query.latitude,
                        query.longitude,
                    ).score;
                    const finalScore = this.combineScores(fuzzyScore, proximityScore);

                    suggestions.push({
                        name: this.formatCityName(cityDetails),
                        latitude: cityDetails.latitude,
                        longitude: cityDetails.longitude,
                        score: finalScore,
                    });
                }
            }
        }

        // Case 2: Only q exists
        if (hasQuery && !hasCoordinates) {
            const prefixMatches = this.cities.filter(city =>
                city.name.toLowerCase().startsWith(query.q.toLowerCase())
            );

            for (const city of prefixMatches) {
                suggestions.push({
                    name: this.formatCityName(city),
                    latitude: city.latitude,
                    longitude: city.longitude,
                    score: 1, // Exact prefix match gets highest score
                });
            }

            if (suggestions.length === 0) {
                const fuzzyMatches = await this.getFuzzyMatches(query.q);
                for (const match of fuzzyMatches) {
                    const cityDetails = await this.getCityDetails(match[1]);
                    if (!cityDetails) continue;

                    suggestions.push({
                        name: this.formatCityName(cityDetails),
                        latitude: cityDetails.latitude,
                        longitude: cityDetails.longitude,
                        score: match[0],
                    });
                }
            }
        }

        // Case 3: Only coordinates exist
        if (!hasQuery && hasCoordinates) {
            const nearbyCitiesWithScores = await this.getNearbyCities(query.latitude, query.longitude);
            for (const { city, score } of nearbyCitiesWithScores) {
                suggestions.push({
                    name: this.formatCityName(city),
                    latitude: city.latitude,
                    longitude: city.longitude,
                    score,
                });
            }
        }

        return this.sortSuggestions(suggestions);
    }

    private formatCityName(city: CityEntity): string {
        return `${city.name}${city.country ? `, ${city.country}` : ''}${city.timezone ? `, ${city.timezone}` : ''}`;
    }

    private async getFuzzyMatches(query: string): Promise<[]> {
        const matches = this.fuzzySet.get(query);
        return matches || [];
    }

    private async getCityDetails(cityName: string): Promise<CityEntity> {
        const city = this.cities.find(c => c.name === cityName);
        return city || null;
    }

    private async getNearbyCities(latitude: number, longitude: number, radius: number = 100): Promise<{ city: CityEntity; score: number }[]> {
        const nearbyCitiesWithScores = this.cities
            .map(city => {
                const { distance, score } = this.calculateProximityScore(city.latitude, city.longitude, latitude, longitude);
                return { city, score, distance };
            })
            .filter(({ distance }) => distance <= radius); // Filter cities within the specified radius

        return nearbyCitiesWithScores;
    }

    /**
     * Calculates a proximity score based on the Haversine formula.
     * @param cityLatitude - Latitude of the city.
     * @param cityLongitude - Longitude of the city.
     * @param userLatitude - Latitude of the user's location (optional).
     * @param userLongitude - Longitude of the user's location (optional).
     * @returns A score between 0 and 1, where 1 is the closest proximity.
     */
    private calculateProximityScore(
        cityLatitude: number,
        cityLongitude: number,
        userLatitude?: number,
        userLongitude?: number,
    ): { distance: number; score: number } {
        if (userLatitude === undefined || userLongitude === undefined) {
            return { distance: Infinity, score: 0 }; // Return a high distance and low score if no coordinates are provided
        }

        const earthRadiusKm = 6371; // Radius of Earth in kilometers
        const deltaLatitude = this.degreesToRadians(cityLatitude - userLatitude);
        const deltaLongitude = this.degreesToRadians(cityLongitude - userLongitude);

        // Haversine formula to calculate distance
        const a =
            Math.sin(deltaLatitude / 2) ** 2 +
            Math.cos(this.degreesToRadians(userLatitude)) *
            Math.cos(this.degreesToRadians(cityLatitude)) *
            Math.sin(deltaLongitude / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = earthRadiusKm * c; // Distance in kilometers

        // Normalize the distance to a score between 0 and 1
        const maxDistance = 1000; // Assuming a maximum distance of 1000 km for scoring purposes
        const score = Math.max(0, 1 - distance / maxDistance);

        return { distance, score };
    }

    /**
     * Converts degrees to radians.
     * @param degrees - The angle in degrees to convert.
     * @returns The angle in radians.
     */
    private degreesToRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    private combineScores(fuzzyScore: number, additionalScore: number): number {
        const fuzzyWeight = 0.6; // Weight for fuzzy score
        const additionalWeight = 0.4; // Weight for proximity score
        return (fuzzyScore * fuzzyWeight) + (additionalScore * additionalWeight);
    }

    private sortSuggestions(suggestions: SuggestionEntity[]): SuggestionEntity[] {
        return suggestions.sort((a, b) => b.score - a.score);
    }
}
