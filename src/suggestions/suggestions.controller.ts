import { Controller, Get, Query } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { SuggestionEntity } from './entities/suggestion.entity';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';

/**
* @class
* @description
* Controller handling city suggestion endpoints.
* Provides REST API endpoints for city name autocomplete functionality
* with optional geolocation-based relevance.
*/
@Controller('suggestions')
export class SuggestionsController {
    constructor(private readonly suggestionsService: SuggestionsService) { }

    /**
    * Retrieves city suggestions based on search query and optional location
    * @param {CreateSuggestionDto} query - Query parameters
    * @param {string} query.q - Search text for city name
    * @param {number} [query.latitude] - User's latitude for location-based relevance
    * @param {number} [query.longitude] - User's longitude for location-based relevance
    * @returns {Promise<{suggestions: SuggestionEntity[]} | {error: string}>} 
    * Array of matched city suggestions or error message
    */
    @Get()
    async getSuggestions(
        @Query() query: CreateSuggestionDto
    ): Promise<{ suggestions: Array<SuggestionEntity> } | { error: string }> {
        const suggestions = await this.suggestionsService.getSuggestions(query);
        return { suggestions };
    }
}
