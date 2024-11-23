export class TrieEntity {
    name: string;         // Name of the city
    latitude: number;     // Latitude of the city
    longitude: number;    // Longitude of the city
    population: number;   // Population of the city

    constructor(data: any) {
        this.name = data.name;
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.population = data.population;
    }
}
