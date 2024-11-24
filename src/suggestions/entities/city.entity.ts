/**
 * @class
 * @description
 * Entity class representing a geographical location from the GeoNames database.
 * Contains detailed information about cities and other geographical points
 * including location coordinates, administrative divisions, and demographic data.
 * @see {@link http://download.geonames.org/export/dump/} GeoNames Data Source
 */
export class CityEntity {
    /**
     * Unique identifier from GeoNames database
     */
    id: number;

    /**
     * Official name of the geographical point (UTF-8)
     */
    name: string;

    /**
     * Name of geographical point in plain ASCII characters
     */
    ascii: string;

    /**
     * Alternative names, comma separated
     */
    altName: string;

    /**
     * Latitude in decimal degrees (WGS84)
     */
    latitude: number;

    /**
     * Longitude in decimal degrees (WGS84)
     */
    longitude: number;

    /**
     * Feature class (e.g., P for populated place)
     * @see {@link http://www.geonames.org/export/codes.html}
     */
    featClass: string;

    /**
     * Detailed feature code
     * @see {@link http://www.geonames.org/export/codes.html}
     */
    featCode: string;

    /**
     * ISO-3166 2-letter country code
     */
    country: string;

    /**
     * Alternate country codes, comma separated (ISO-3166)
     */
    altCountry: string;

    /**
     * First-level administrative division code (FIPS or ISO)
     */
    admin1: string;

    /**
     * Second-level administrative division code
     */
    admin2: string;

    /**
     * Third-level administrative division code
     */
    admin3: string;

    /**
     * Fourth-level administrative division code
     */
    admin4: string;

    /**
     * Population count
     */
    population: number;

    /**
     * Elevation in meters
     */
    elevation: number;

    /**
     * Digital elevation model value in meters (SRTM3 or GTOPO30)
     * Average elevation of 3''x3'' (ca 90mx90m) or 30''x30'' (ca 900mx900m) area
     */
    dem: number;

    /**
     * Timezone identifier
     */
    timezone: string;

    /**
     * Last modification date
     */
    modifiedAt: Date;

    /**
     * Creates a new CityEntity instance
     * @param {any} data - Raw data from GeoNames database
     */
    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.ascii = data.ascii;
        this.altName = data.alt_name;
        this.latitude = parseFloat(data.lat);
        this.longitude = parseFloat(data.long);
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