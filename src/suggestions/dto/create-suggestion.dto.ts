import { IsOptional, IsString, IsNumber } from 'class-validator';

/**
 * @class
 * @description
 * Used to validate and transfer suggestion request data.
 * All fields are optional to support different search scenarios:
 * - Text-only search (using just 'q')
 * - Location-only search (using coordinates)
 * - Combined search (using both)
 */
export class CreateSuggestionDto {
    /**
     * Optional search query string.
     * Used for text-based filtering of suggestions.
     * @type {string}
     * @optional
     */
    @IsOptional()
    @IsString()
    q?: string;

    /**
     * Optional latitude coordinate.
     * Must be provided together with longitude for location-based suggestions.
     * @type {number}
     * @optional
     */
    @IsOptional()
    @IsNumber()
    latitude?: number;

    /**
     * Optional longitude coordinate.
     * Must be provided together with latitude for location-based suggestions.
     * @type {number}
     * @optional
     */
    @IsOptional()
    @IsNumber()
    longitude?: number;
}