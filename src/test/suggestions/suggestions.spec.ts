import { Test, TestingModule } from '@nestjs/testing';
import { CityRepository } from '../../suggestions/repositories/city.repository';
import { SuggestionsService } from '../../suggestions/suggestions.service';
import { TrieService } from '../../suggestions/trie/trie.service';
import { CreateSuggestionDto } from '../../suggestions/dto/create-suggestion.dto';
import { FuzzyService } from '../../suggestions/fuzzy/fuzzy.service';

/**
 * Unit tests for the `SuggestionsService` in a NestJS application.
 *
 * These tests ensure the `SuggestionsService` behaves as expected, including:
 * - Retrieving suggestions based on query strings and coordinates.
 * - Handling cases with no matches or invalid queries.
 * - Integrating mocked dependencies such as `CityRepository`, `TrieService`, and `FuzzyService`.
 */
describe('SuggestionsService', () => {
    let service: SuggestionsService;
    let cityRepository: CityRepository;

    // Mocked data for testing
    const mockCities = [
        {
            name: 'Toronto',
            latitude: 43.70011,
            longitude: -79.4163,
            population: 2731571,
            country: 'CA',
            timezone: 'America/Toronto'
        },
        {
            name: 'North York',
            latitude: 43.76681,
            longitude: -79.4163,
            population: 636000,
            country: 'CA',
            timezone: 'America/Toronto'
        },
        {
            name: 'Los Angeles',
            latitude: 34.0522,
            longitude: -118.2437,
            population: 3898747,
            country: 'US',
            timezone: 'America/Los_Angeles'
        }
    ];

    /**
     * Sets up the testing module with mocked dependencies and initializes the service.
     */
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SuggestionsService,
                {
                    provide: CityRepository,
                    useValue: {
                        getAllCities: jest.fn().mockResolvedValue(mockCities),
                        loadCitiesFromFile: jest.fn().mockResolvedValue(undefined),
                        getMaxPopulation: jest.fn().mockReturnValue(Math.max(...mockCities.map(city => city.population))),
                    },
                },
                {
                    provide: TrieService,
                    useValue: {
                        insert: jest.fn(),
                        search: jest.fn().mockImplementation((prefix) => {
                            if (!prefix) return mockCities;
                            return mockCities.filter(city =>
                                city.name.toLowerCase().startsWith(prefix.toLowerCase())
                            ).map(city => ({ city, weight: 1 }));
                        }),
                    },
                },
                {
                    provide: FuzzyService,
                    useValue: {
                        addCity: jest.fn(),
                        findMatches: jest.fn().mockImplementation((query) => {
                            return mockCities.filter(city =>
                                city.name.toLowerCase().includes(query.toLowerCase())
                            ).map(city => ({
                                city,
                                similarity: 1,
                            }));
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<SuggestionsService>(SuggestionsService);
        cityRepository = module.get<CityRepository>(CityRepository);

        await service.onModuleInit();
    });

    describe('getSuggestions', () => {
        /**
         * Ensures that suggestions are returned for a valid query without coordinates.
         */
        it('should return suggestions for a valid query without coordinates', async () => {
            const query: CreateSuggestionDto = { q: 'Toronto' };
            const result = await service.getSuggestions(query);
            expect(result).toBeDefined();
            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject({
                name: expect.stringContaining('Toronto'),
                latitude: expect.any(Number),
                longitude: expect.any(Number)
            });
        });

        /**
         * Ensures that an empty array is returned when no matches are found.
         */
        it('should return an empty array for a query with no matches', async () => {
            const query: CreateSuggestionDto = { q: 'SomeRandomCity' };
            const result = await service.getSuggestions(query);
            expect(result).toBeDefined();
            expect(result).toHaveLength(0); // Expecting no suggestions
        });

        /**
        * Ensures that an empty query is handled correctly.
        */
        it('should handle empty query', async () => {
            const query: CreateSuggestionDto = { q: '' };
            const result = await service.getSuggestions(query);
            expect(result).toBeDefined();
            expect(result).toHaveLength(0); // Expecting no suggestions for empty query
        });

        /**
         * Ensures that suggestions are returned based on both query and coordinates.
         */
        it('should handle coordinates with query', async () => {
            const query: CreateSuggestionDto = {
                q: 'Toronto',
                latitude: 43.70011,
                longitude: -79.4163
            };
            const result = await service.getSuggestions(query);
            expect(result).toBeDefined();
            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject({
                name: 'Toronto, CA, America/Toronto',
                latitude: 43.70011,
                longitude: -79.4163,
                score: 1,
            });
        });

        /**
         * Ensures that proximity-based suggestions are returned when only coordinates are provided.
         */
        it('should return suggestions based on proximity when coordinates are provided', async () => {
            const query: CreateSuggestionDto = {
                latitude: 43.70011,
                longitude: -79.4163,
            };
            const result = await service.getSuggestions(query);
            expect(result).toBeDefined();
            expect(result).toHaveLength(2);
            expect(result[0]).toMatchObject({
                name: 'Toronto, CA, America/Toronto',
                latitude: 43.70011,
                longitude: -79.4163,
                score: 1,
            });
            expect(result[1]).toMatchObject({
                name: 'North York, CA, America/Toronto',
                latitude: 43.76681,
                longitude: -79.4163,
                score: expect.any(Number),
            });
        });
    });
});
