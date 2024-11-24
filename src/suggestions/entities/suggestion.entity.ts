/**
 * @class
 * @description
 * Entity representing a city suggestion with geographical coordinates and confidence score.
 * Used for location search and autocomplete functionality.
 */
export class SuggestionEntity {
    /**
     * Name of the city or location
     */
    name: string;

    /**
     * Latitude coordinate in decimal degrees (WGS84)
     */
    latitude: number;

    /**
     * Longitude coordinate in decimal degrees (WGS84)
     */
    longitude: number;

    /**
     * Confidence score for the suggestion (0-1)
     * Higher values indicate better matches
     */
    score: number;

    /**
     * Creates a new SuggestionEntity instance
     * @param {object} data - Raw suggestion data
     * @param {string} data.name - Name of the city
     * @param {number} data.latitude - Latitude coordinate
     * @param {number} data.longitude - Longitude coordinate
     * @param {number} data.score - Confidence score
     */
    constructor(data: any) {
        this.name = data.name;
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.score = data.score;
    }
}