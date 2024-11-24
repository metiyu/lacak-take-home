import { Injectable } from '@nestjs/common'
import { TrieNode } from './trie.node'
import { CityEntity } from '../entities/city.entity';
import { ALT_NAME_WEIGHT, ASCII_WEIGHT, NAME_WEIGHT } from '../../common/constants';

/**
* @class
* @description
* Service implementing a Trie data structure for efficient city name lookups.
* Handles insertion and searching of city names with weighted relevance for
* primary names, ASCII names, and alternative names.
*/
@Injectable()
export class TrieService {
    /**
    * Root node of the Trie structure
    * @private
    */
    private root: TrieNode;

    constructor() {
        this.root = new TrieNode();
    }

    /**
    * Inserts a city into the Trie with different weights for different name types
    * @param {CityEntity} city - The city entity to insert
    */
    insert(city: CityEntity): void {
        this.insertWord(city.name.toLowerCase(), city, NAME_WEIGHT);

        if (city.ascii) {
            this.insertWord(city.ascii.toLowerCase(), city, ASCII_WEIGHT);
        }

        if (city.altName) {
            const alternateNames = city.altName.split(',');
            alternateNames.forEach(name =>
                this.insertWord(name.trim().toLowerCase(), city, ALT_NAME_WEIGHT)
            );
        }
    }

    /**
    * Inserts a word into the Trie with associated city data and weight
    * @param {string} word - The word to insert
    * @param {CityEntity} city - The city associated with this word
    * @param {number} weight - The weight value for ranking
    * @private
    */
    private insertWord(word: string, city: CityEntity, weight: number): void {
        let current = this.root;

        for (const char of word) {
            if (!current.children.has(char)) {
                current.children.set(char, new TrieNode());
            }
            current = current.children.get(char);
        }

        current.isEndOfWord = true;
        current.weight = weight;
        current.city = city;
    }

    /**
    * Searches the Trie for cities matching the given prefix
    * @param {string} prefix - The prefix to search for
    * @returns {Array<{city: CityEntity; weight: number}>} Matching cities with their weights
    */
    search(prefix: string): Array<{ city: CityEntity; weight: number }> {
        prefix = prefix.toLowerCase();
        let current = this.root;

        for (const char of prefix) {
            if (!current.children.has(char)) {
                return [];
            }
            current = current.children.get(char);
        }

        const results: Array<{ city: CityEntity; weight: number }> = [];
        this.collectWords(current, results);
        return results;
    }

    /**
    * Recursively collects all words/cities from a given node
    * @param {TrieNode} node - Current node in the Trie
    * @param {Array<{city: CityEntity; weight: number}>} results - Array to store results
    * @private
    */
    private collectWords(
        node: TrieNode,
        results: Array<{ city: CityEntity; weight: number }>
    ): void {
        if (node.isEndOfWord) {
            results.push({ city: node.city, weight: node.weight });
        }

        for (const child of node.children.values()) {
            this.collectWords(child, results);
        }
    }
}
