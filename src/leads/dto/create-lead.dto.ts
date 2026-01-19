import { IsString, IsEmail, IsOptional } from 'class-validator';

/**
 * Data Transfer Object (DTO) for Lead creation.
 * Defines the expected structure and validation rules for the payload.
 */
export class CreateLeadDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;
}