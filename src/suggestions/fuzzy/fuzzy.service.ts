import { Injectable } from '@nestjs/common';
import * as FuzzySet from 'fuzzyset.js';
import { CityEntity } from '../entities/city.entity';

/**
 * @class
 * @description
 * Service handling fuzzy string matching for city names.
 * Provides functionality to index city names and perform similarity-based searches
 * using the FuzzySet algorithm. Supports primary names, ASCII names, and alternative names.
 */
@Injectable()
export class FuzzyService {
    /**
     * FuzzySet instance for performing similarity matches
     * @private
     */
    private fuzzySet: FuzzySet;

    /**
    * Map storing city entities indexed by their various names
    * @private
    */
    private cityMap: Map<string, CityEntity>;

    constructor() {
        this.fuzzySet = FuzzySet();
        this.cityMap = new Map();
    }

    /**
     * Adds a city to the fuzzy search index
     * Indexes the primary name, ASCII name, and all alternative names
     * @param {CityEntity} city - The city entity to be indexed
     */
    addCity(city: CityEntity): void {
        this.fuzzySet.add(city.name);
        this.cityMap.set(city.name, city);

        if (city.ascii) {
            this.fuzzySet.add(city.ascii);
            this.cityMap.set(city.ascii, city);
        }

        if (city.altName) {
            const altNames = city.altName.split(',');
            altNames.forEach(name => {
                const trimmedName = name.trim();
                this.fuzzySet.add(trimmedName);
                this.cityMap.set(trimmedName, city);
            });
        }
    }

    /**
     * Finds cities matching the search query using fuzzy matching
     * @param {string} query - The search query string
     * @returns {Array<{city: CityEntity; similarity: number}>} Array of matches with similarity scores
     * Each match contains the city entity and a similarity score (0-1)
     */
    findMatches(query: string): Array<{ city: CityEntity; similarity: number }> {
        const matches = this.fuzzySet.get(query) || [];
        return matches
            .map(([similarity, name]) => ({
                city: this.cityMap.get(name),
                similarity
            }))
            .filter(match => match.city !== undefined);
    }
}
