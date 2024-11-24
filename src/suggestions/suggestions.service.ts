import { Injectable } from '@nestjs/common';
import { TrieService } from './trie/trie.service';
import { CityRepository } from './repositories/city.repository';
import { SuggestionEntity } from './entities/suggestion.entity';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { CityEntity } from './entities/city.entity';
import { FuzzyService } from './fuzzy/fuzzy.service';
import { MAX_DISTANCE_KM, MAX_SUGGESTIONS, POPULATION_WEIGHT, PROXIMITY_WEIGHT } from '../common/constants';

/**
* @class
* @description
* Service handling city suggestions based on text search and geographical proximity.
* Combines trie-based prefix matching, fuzzy search, and location-based filtering
* to provide relevant city suggestions.
*/
@Injectable()
export class SuggestionsService {
    constructor(
        private readonly trieService: TrieService,
        private readonly fuzzyService: FuzzyService,
        private readonly cityRepository: CityRepository,
    ) { }

    /** Initializes the service by loading and indexing cities */
    async onModuleInit() {
        await this.initializeCities();
    }

    /**
    * Loads cities from repository and initializes search indexes
    * @private
    * @throws {Error} If city loading fails
    */
    private async initializeCities() {
        try {
            const cities = await this.cityRepository.getAllCities();
            cities.forEach(city => {
                this.trieService.insert(city);
                this.fuzzyService.addCity(city);
            });
        } catch (error) {
            console.error("Error initializing cities:", error);
            throw new Error("Failed to load cities");
        }
    }

    /**
    * Retrieves city suggestions based on search criteria
    * @param {CreateSuggestionDto} query - Search parameters including text query and/or coordinates
    * @returns {Promise<SuggestionEntity[]>} Ranked list of city suggestions
    */
    async getSuggestions(query: CreateSuggestionDto): Promise<SuggestionEntity[]> {
        const suggestions = new Set<SuggestionEntity>();
        const hasQuery = !!query.q;
        const hasCoordinates = query.latitude !== undefined && query.longitude !== undefined;

        // Case 1: Both query and coordinates exist
        if (hasQuery && hasCoordinates) {
            await this.handleQueryWithLocation(
                query.q,
                query.latitude,
                query.longitude,
                suggestions
            );
        }
        // Case 2: Only query exists
        else if (hasQuery && !hasCoordinates) {
            await this.handleQueryOnly(query.q, suggestions);
        }
        // Case 3: Only coordinates exist
        else if (!hasQuery && hasCoordinates) {
            await this.handleLocationOnly(
                query.latitude,
                query.longitude,
                suggestions
            );
        }

        return this.rankAndLimitSuggestions(Array.from(suggestions.values()));
    }

    /**
    * Handles search with both text query and location
    * @private
    * @param {string} query - Text search query
    * @param {number} latitude - User's latitude
    * @param {number} longitude - User's longitude
    * @param {Set<SuggestionEntity>} suggestions - Set to store matching suggestions
    */
    private async handleQueryWithLocation(
        query: string,
        latitude: number,
        longitude: number,
        suggestions: Set<SuggestionEntity>
    ): Promise<void> {
        // First try prefix matches: Trie
        const trieMatches = this.trieService.search(query);

        if (trieMatches.length > 0) {
            trieMatches.forEach(({ city, weight }) => {
                suggestions.add(this.createSuggestion(
                    city,
                    weight,
                    latitude,
                    longitude
                ));
            });
        } else {
            // If no prefix matches: Fuzzy Matching
            const fuzzyMatches = this.fuzzyService.findMatches(query);
            fuzzyMatches.forEach(({ city, similarity }) => {
                suggestions.add(this.createSuggestion(
                    city,
                    similarity,
                    latitude,
                    longitude
                ));
            });
        }
    }

    /**
    * Handles search with only text query
    * @private
    * @param {string} query - Text search query
    * @param {Set<SuggestionEntity>} suggestions - Set to store matching suggestions
    */
    private async handleQueryOnly(
        query: string,
        suggestions: Set<SuggestionEntity>
    ): Promise<void> {
        const trieMatches = this.trieService.search(query);
        const processedCities = new Set<number>();

        if (trieMatches.length > 0) {
            trieMatches.forEach(({ city, weight }) => {
                suggestions.add(this.createSuggestion(
                    city,
                    weight
                ));
                processedCities.add(city.id);
            });
        }

        // If few results, try fuzzy matching
        if (suggestions.size < MAX_SUGGESTIONS) {
            const fuzzyMatches = this.fuzzyService.findMatches(query)
                .filter(match => !processedCities.has(match.city.id));
            fuzzyMatches.forEach(({ city, similarity }) => {
                suggestions.add(this.createSuggestion(
                    city,
                    similarity
                ));
            });
        }
    }

    /**
    * Handles search with only location
    * @private
    * @param {number} latitude - User's latitude
    * @param {number} longitude - User's longitude
    * @param {Set<SuggestionEntity>} suggestions - Set to store matching suggestions
    */
    private async handleLocationOnly(
        latitude: number,
        longitude: number,
        suggestions: Set<SuggestionEntity>
    ): Promise<void> {
        const nearbyCities = await this.getNearbyCities(latitude, longitude);
        nearbyCities.forEach(({ city, score }) => {
            suggestions.add(this.createSuggestion(
                city,
                score,
                latitude,
                longitude
            ));
        });
    }

    /**
    * Retrieves and ranks cities near a given location
    * @private
    * @param {number} latitude - Reference point latitude
    * @param {number} longitude - Reference point longitude
    * @returns {Promise<Array<{ city: CityEntity; score: number }>>} Array of nearby cities with proximity scores
    */
    private async getNearbyCities(
        latitude: number,
        longitude: number
    ): Promise<Array<{ city: CityEntity; score: number }>> {
        const cities = await this.cityRepository.getAllCities();
        return cities
            .map(city => {
                const { distance, score } = this.calculateProximityScore(
                    city.latitude,
                    city.longitude,
                    latitude,
                    longitude
                );
                return { city, score, distance };
            })
            .filter(({ distance }) => distance <= MAX_DISTANCE_KM)
            .sort((a, b) => b.score - a.score)
            .slice(0, MAX_SUGGESTIONS);
    }

    /**
    * Creates a suggestion entity with combined text and proximity scores
    * @private
    * @param {CityEntity} city - City to create suggestion for
    * @param {number} textMatchScore - Text matching score (0-1)
    * @param {number} [userLat] - Optional user latitude for proximity scoring
    * @param {number} [userLon] - Optional user longitude for proximity scoring
    * @returns {SuggestionEntity} Formatted suggestion with combined score
    */
    private createSuggestion(
        city: CityEntity,
        textMatchScore: number,
        userLat?: number,
        userLon?: number
    ): SuggestionEntity {
        const { additionalScore, weight } =
            userLat !== undefined && userLon !== undefined
                ? {
                    additionalScore: this.calculateProximityScore(city.latitude, city.longitude, userLat, userLon).score,
                    weight: PROXIMITY_WEIGHT
                }
                : {
                    additionalScore: this.calculatePopulationScore(city),
                    weight: POPULATION_WEIGHT
                };


        return {
            name: this.formatCityName(city),
            latitude: city.latitude,
            longitude: city.longitude,
            score: this.combineScores(textMatchScore, additionalScore, weight)
        };
    }

    /**
    * Customize the city string that will be displayed in the suggestions
    * @private
    * @param {CityEntity} city - Cities that will be processed for display
    * @returns {string} Formatted city name
    */
    private formatCityName(city: CityEntity): string {
        return `${city.name}${city.country ? `, ${city.country}` : ''}${city.timezone ? `, ${city.timezone}` : ''}`;
    }

    /**
    * Calculates proximity score between two geographical points
    * @private
    * @param {number} cityLatitude - City's latitude
    * @param {number} cityLongitude - City's longitude
    * @param {number} userLatitude - User's latitude
    * @param {number} userLongitude - User's longitude
    * @returns {{ distance: number; score: number }} Distance in km and normalized score
    */
    private calculateProximityScore(
        cityLatitude: number,
        cityLongitude: number,
        userLatitude: number,
        userLongitude: number
    ): { distance: number; score: number } {
        const earthRadiusKm = 6371;
        const deltaLat = this.degreesToRadians(cityLatitude - userLatitude);
        const deltaLon = this.degreesToRadians(cityLongitude - userLongitude);

        const a =
            Math.sin(deltaLat / 2) ** 2 +
            Math.cos(this.degreesToRadians(userLatitude)) *
            Math.cos(this.degreesToRadians(cityLatitude)) *
            Math.sin(deltaLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = earthRadiusKm * c;

        const score = Math.max(0, 1 - distance / MAX_DISTANCE_KM);

        return { distance, score };
    }

    /**
     * Converts degrees to radians.
     * @private
     * @param {number} degrees - Degrees to be converted
     * @returns {number} Radians
     */
    private degreesToRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * Calculates a normalized population score for a city.
     * @private
     * @param {CityEntity} city - The city entity for which the population score is calculated.
     * @returns {number} The population score, normalized based on the maximum population among all cities.
     */
    private calculatePopulationScore(city: CityEntity): number {
        const divisor = Math.ceil(Math.log10(this.cityRepository.getMaxPopulation()));
        return city.population ? Math.log10(city.population) / divisor : 0;
    }

    /**
     * Combines text matching and proximity scores to produce a final score.
     * Weights are applied to each component score to reflect their relative importance.
     * @private
     * @param {number} textMatchScore - Score representing the text matching confidence (0-1).
     * @param {number} proximityScore - Score representing the proximity confidence (0-1).
     * @returns {number} The combined score, weighted by the configured constants.
     */
    private combineScores(textMatchScore: number, additionalScore: number, weight: number): number {
        return (textMatchScore * (1 - weight)) +
            (additionalScore * weight);
    }

    private rankAndLimitSuggestions(suggestions: SuggestionEntity[]): SuggestionEntity[] {
        return suggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, MAX_SUGGESTIONS);
    }
}
