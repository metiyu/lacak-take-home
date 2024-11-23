import { TrieEntity } from "../entities/trie.entity";

export class TrieNode {
    /**
     * Children of the current node, where the key is a character
     * and the value is the corresponding TrieNode.
     */
    children: Map<string, TrieNode>;

    /**
     * Indicates whether this node marks the end of a word.
     */
    // isEndOfWord: boolean;

    /**
     * List of cities associated with this node.
     */
    // cities: Array<TrieEntity>;
    cities: Array<{ city: TrieEntity; weight: number }>;

    /**
     * Constructor to initialize a TrieNode.
     */
    constructor() {
        this.children = new Map(); // Initialize children as an empty map
        // this.isEndOfWord = false; // Default is not the end of a word
        this.cities = []; // Initialize cities as an empty array
    }
}
