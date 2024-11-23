export class SuggestionEntity {
    name: string;         // Name of the city
    latitude: number;     // Latitude of the city
    longitude: number;    // Longitude of the city
    score: number;        // Confidence level for the suggestion

    constructor(data: any) {
        this.name = data.name;
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.score = data.score;
    }
}
