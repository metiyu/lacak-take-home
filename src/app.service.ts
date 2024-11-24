import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
    constructor(private readonly configService: ConfigService) { }

    getHello(): string {
        const env = this.configService.get<string>('NODE_ENV') ?? 'development';
        return `Hello from ${env} environment!`;
    }
}
