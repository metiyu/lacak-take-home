import { Controller, Get, Query } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { SuggestionEntity } from './entities/suggestion.entity';

@Controller('suggestions')
export class SuggestionsController {
    constructor(private readonly suggestionsService: SuggestionsService) { }

    /**
     * Endpoint to fetch city suggestions based on a query and optional user location.
     * @param query - The prefix of the city name to search for (required).
     * @param latitude - Optional latitude of the user's location.
     * @param longitude - Optional longitude of the user's location.
     * @returns A response containing an array of suggestions or an error message.
     */
    @Get()
    async getSuggestions(
        @Query('q') query: string,
        @Query('latitude') latitude?: string,
        @Query('longitude') longitude?: string,
    ): Promise<{ suggestions: Array<SuggestionEntity> } | { error: string }> {
        // Validate the required query parameter
        if (!query) {
            return { error: 'Query parameter "q" is required' };
        }

        // Parse latitude and longitude if provided
        const userLatitude = latitude ? parseFloat(latitude) : undefined;
        const userLongitude = longitude ? parseFloat(longitude) : undefined;

        // Fetch suggestions from the service
        const suggestions = await this.suggestionsService.getSuggestions(query, userLatitude, userLongitude);

        // Return the suggestions in a structured response
        return { suggestions };
    }
}
