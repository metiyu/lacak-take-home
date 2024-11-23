import { Injectable } from '@nestjs/common'
import { TrieNode } from './trie.node'
import { TrieEntity } from '../entities/trie.entity';

@Injectable()
export class TrieService {
    private root: TrieNode;

    constructor() {
        // Initialize the root of the trie
        this.root = new TrieNode();
    }

    /**
     * Inserts a city into the trie.
     * @param city - Object containing city details: name, latitude, longitude, and population.
     */
    insert(city: TrieEntity): void {
        let currentNode = this.root;

        // Traverse through each character of the city name
        for (const char of city.name.toLowerCase()) {
            // Create a new TrieNode if it does not exist
            if (!currentNode.children.has(char)) {
                currentNode.children.set(char, new TrieNode());
            }
            // Move to the next node
            currentNode = currentNode.children.get(char)!;
            // Add the city to the list at the current node
            currentNode.cities.push(city);
        }

        // Mark the end of the word
        currentNode.isEndOfWord = true;
    }

    /**
     * Searches for cities matching the given prefix.
     * @param prefix - The prefix string to search for.
     * @returns An array of cities that match the prefix.
     */
    search(prefix: string): Array<TrieEntity> {
        let currentNode = this.root;

        // Traverse the trie using the characters of the prefix
        for (const char of prefix.toLowerCase()) {
            if (!currentNode.children.has(char)) {
                // Return an empty array if the prefix does not exist
                return [];
            }
            currentNode = currentNode.children.get(char)!;
        }

        // Return the list of cities matching the prefix
        return currentNode.cities;
    }
}
