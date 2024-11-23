export class CityEntity {
    id: number;           // Unique identifier for the city
    name: string;         // Name of the city
    ascii: string;        // ASCII representation of the city name
    altName: string;      // Alternate names for the city
    lat: number;          // Latitude of the city
    long: number;         // Longitude of the city
    featClass: string;    // Feature class (e.g., P for populated place)
    featCode: string;     // Feature code
    country: string;      // Country code
    altCountry: string;   // Alternate country codes
    admin1: string;       // First-level administrative division code
    admin2: string;       // Second-level administrative division code
    admin3: string;       // Third-level administrative division code
    admin4: string;       // Fourth-level administrative division code
    population: number;   // Population of the city
    elevation: number;    // Elevation of the city in meters
    dem: number;          // Digital elevation model (DEM) value
    timezone: string;     // Timezone of the city
    modifiedAt: Date;     // Date of last modification

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.ascii = data.ascii;
        this.altName = data.alt_name;
        this.lat = parseFloat(data.lat);
        this.long = parseFloat(data.long);
        this.featClass = data.feat_class;
        this.featCode = data.feat_code;
        this.country = data.country;
        this.altCountry = data.cc2;
        this.admin1 = data.admin1;
        this.admin2 = data.admin2;
        this.admin3 = data.admin3;
        this.admin4 = data.admin4;
        this.population = parseInt(data.population, 10) || 0;
        this.elevation = parseFloat(data.elevation);
        this.dem = parseFloat(data.dem);
        this.timezone = data.tz;
        this.modifiedAt = new Date(data.modified_at);
    }
}
