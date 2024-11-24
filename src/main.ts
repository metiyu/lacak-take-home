import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SuggestionsService } from './suggestions/suggestions.service';
import { ThrottlerGuard } from '@nestjs/throttler';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const suggestionsService = app.get(SuggestionsService);

    app.enableCors();

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
