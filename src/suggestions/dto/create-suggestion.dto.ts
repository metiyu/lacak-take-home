import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateSuggestionDto {
    @IsOptional()
    @IsString()
    q?: string;

    @IsOptional()
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @IsNumber()
    longitude?: number;
}