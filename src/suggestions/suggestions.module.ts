import { Module } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { SuggestionsController } from './suggestions.controller';
import { TrieService } from './trie/trie.service';
import { CityRepository } from './repositories/city.repository';
import { FuzzyService } from './fuzzy/fuzzy.service';

@Module({
    imports: [],
    controllers: [SuggestionsController,],
    providers: [TrieService, SuggestionsService, CityRepository, FuzzyService,],
    exports: []
})
export class SuggestionsModule { }
