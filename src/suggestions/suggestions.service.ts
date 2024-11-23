import { Injectable } from '@nestjs/common';
import { TrieService } from './trie/trie.service';
import { CityRepository } from './repositories/city.repository';
import { SuggestionEntity } from './entities/suggestion.entity';

@Injectable()
export class SuggestionsService {
    constructor(
        private readonly trieService: TrieService,
        private readonly cityRepository: CityRepository,
    ) {
        console.log('TrieService in SuggestionsService:', this.trieService); // Debugging statement
    }

    /**
     * Loads city data from a TSV file into the trie structure for future suggestions.
     * @param filePath - The relative path to the TSV file containing city data.
     */
    async loadCities(filePath: string): Promise<void> {
        await this.cityRepository.loadCitiesFromFile(filePath);
    }

    /**
     * Retrieves a list of city suggestions based on a query and optional user location.
     * @param query - The prefix of the city name to search for.
     * @param latitude - Optional latitude of the user's location.
     * @param longitude - Optional longitude of the user's location.
     * @returns An array of suggested cities with their names, coordinates, and scores.
     */
    async getSuggestions(
        query: string,
        latitude?: number,
        longitude?: number,
    ): Promise<Array<SuggestionEntity>> {
        // Search for cities matching the query prefix
        const matchedCities = this.trieService.search(query);

        return matchedCities.map((city) => {
            // Calculate proximity score based on user's location
            const proximityScore = this.calculateProximityScore(city.latitude, city.longitude, latitude, longitude);
            // Calculate population score (normalized logarithm of population)
            const populationScore = city.population ? Math.log10(city.population) / 7 : 0;
            // Combine scores with equal weight
            const finalScore = (proximityScore + populationScore) / 2;

            return {
                name: city.name,
                latitude: city.latitude,
                longitude: city.longitude,
                score: finalScore,
            };
        }).sort((a, b) => b.score - a.score); // Sort by score in descending order
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
    ): number {
        if (userLatitude === undefined || userLongitude === undefined) return 0;

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
        // Assuming a maximum distance of 1000 km for scoring purposes
        const maxDistance = 1000;
        return Math.max(0, 1 - distance / maxDistance);
    }

    /**
     * Converts degrees to radians.
     * @param degrees - The angle in degrees to convert.
     * @returns The angle in radians.
     */
    private degreesToRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}
