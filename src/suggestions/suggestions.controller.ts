import { Controller, Get, Query } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { SuggestionEntity } from './entities/suggestion.entity';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';

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
        @Query() query: CreateSuggestionDto
    ): Promise<{ suggestions: Array<SuggestionEntity> } | { error: string }> {
        // Fetch suggestions from the service
        const suggestions = await this.suggestionsService.getSuggestions(query);

        // Return the suggestions in a structured response
        return { suggestions };
    }
}
