import { CityEntity } from "../entities/city.entity";

/**
* @class
* @description
* Node class for the Trie data structure used in city name autocomplete.
* Each node represents a character in the city name and can store city data,
* weights for ranking, and alternative names for the city.
*/
export class TrieNode {
    /**
    * Map of child nodes, where key is the character and value is the child TrieNode
    */
    children: Map<string, TrieNode>;

    /**
     * Indicates if this node represents the end of a valid city name
     */
    isEndOfWord: boolean;

    /**
     * Weight value used for ranking suggestions (higher values indicate higher relevance)
     */
    weight: number;

    /**
     * Reference to the complete city data associated with this node
     */
    city: CityEntity;

    /**
     * Collection of alternative names associated with the city
     */
    alternateNames: string[];

    /**
    * Creates a new TrieNode instance with default values
    */
    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
        this.weight = 0;
        this.city = null;
        this.alternateNames = [];
    }
}
