import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SuggestionsService } from './suggestions/suggestions.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const suggestionsService = app.get(SuggestionsService);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
