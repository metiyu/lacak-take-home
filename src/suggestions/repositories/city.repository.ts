import path from "path";
import fs from "fs";
import { TrieService } from "../trie/trie.service";
import { CityEntity } from "../entities/city.entity";
import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { TrieEntity } from "../entities/trie.entity";

@Injectable()
export class CityRepository {
    private cities: Array<CityEntity> = [];

    constructor(
        @Inject(forwardRef(() => TrieService)) private readonly trieService: TrieService
    ) {
        console.log('TrieService in CityRepository:', this.trieService); // Debugging statement
    }

    /**
     * Loads city data from a TSV (Tab-Separated Values) file and inserts it into the Trie.
     * @param filePath - The relative path to the TSV file containing city data.
     * @returns A promise that resolves when the data is fully loaded.
     */
    async loadCitiesFromFile(filePath: string): Promise<void> {
        const path = require('path');
        const fs = require('fs');

        // Resolve the absolute path to the TSV file
        const absolutePath = path.join(process.cwd(), filePath);

        // Read the file contents as a string
        const data = await fs.promises.readFile(absolutePath, "utf-8");

        // Split the file contents into lines
        const lines = data.trim().split("\n");

        // Extract the header line and split it into individual field names
        const header = lines[0].split("\t");

        // Process each subsequent line of data
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].split("\t");
            const cityData: Record<string, string> = {};

            // Map each field in the line to its corresponding header
            header.forEach((field, index) => {
                cityData[field.trim()] = line[index].trim();
            });

            // Create a CityEntity instance from the parsed data
            const city = new CityEntity(cityData);
            this.cities.push(city);

            // Insert the city into the Trie for quick retrieval
            this.trieService.insert(new TrieEntity({
                name: city.name,
                latitude: city.latitude,
                longitude: city.longitude,
                population: city.population,
            }), "name")
            // this.trieService.insert({
            //     name: city.name,
            //     latitude: city.lat,
            //     longitude: city.long,
            //     population: city.population,
            // });
        }
    }

    // In city.repository.ts
    async getAllCities(): Promise<CityEntity[]> {
        // Implement logic to return all cities as an array of CityEntity
        // This could be a simple return of the cities you have loaded
        return this.cities; // Assuming you have a 'cities' array holding all CityEntity instances
    }
}
