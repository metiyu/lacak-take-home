import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SuggestionsService } from './suggestions/suggestions.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const suggestionsService = app.get(SuggestionsService);

  // Load city data from a TSV file
  const CITY_FILE_PATH = 'data/cities_canada-usa.tsv'
  await suggestionsService.loadCities(CITY_FILE_PATH);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
