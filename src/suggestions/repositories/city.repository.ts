import { CityEntity } from "../entities/city.entity";
import { Injectable } from "@nestjs/common";
import { CITY_FILE_PATH } from '../../common/constants';


/**
* @class
* @description
* Repository handling city data loading and storage.
* Manages loading city data from TSV files and provides access to the city collection
* and related statistics like maximum population.
*/
@Injectable()
export class CityRepository {
    /**
    * Collection of loaded city entities
    * @private
    */
    private cities: Array<CityEntity> = [];

    /**
     * Tracks the highest population among all loaded cities
     * @private
     */
    private maxPopulation: number = 0;

    /**
    * Loads and parses city data from a TSV file
    * @param {string} filePath - Path to the TSV file containing city data
    * @throws {Error} If file cannot be read or parsed
    */
    async loadCitiesFromFile(filePath: string): Promise<void> {
        const path = require('path');
        const fs = require('fs');

        // const absolutePath = path.join(process.cwd(), filePath);
        const absolutePath = path.join(process.cwd(), 'data', 'cities_canada-usa.tsv');
        const data = await fs.promises.readFile(absolutePath, "utf-8");
        const lines = data.trim().split("\n");
        const header = lines[0].split("\t");

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].split("\t");
            const cityData: Record<string, string> = {};

            header.forEach((field, index) => {
                cityData[field.trim()] = line[index].trim();
            });

            const city = new CityEntity(cityData);
            this.cities.push(city);
            if (this.maxPopulation < city.population) {
                this.maxPopulation = city.population;
            }
        }
    }

    /**
    * Retrieves all loaded city entities
    * @returns {Promise<CityEntity[]>} Array of all city entities
    */
    async getAllCities(): Promise<CityEntity[]> {
        await this.loadCitiesFromFile(CITY_FILE_PATH);
        return this.cities;
    }

    /**
    * Gets the maximum population value among all loaded cities
    * @returns {number} Maximum population value
    */
    getMaxPopulation(): number {
        return this.maxPopulation;
    }
}
