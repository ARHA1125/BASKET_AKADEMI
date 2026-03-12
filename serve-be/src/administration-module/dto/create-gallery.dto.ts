import { IsString, IsOptional } from 'class-validator';

export class CreateGalleryDto {
  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsString()
  category: string;

  @IsString()
  date: string;

  @IsString()
  @IsOptional()
  cover?: string;

  @IsString()
  description: string;

  @IsString()
  photos: string; // JSON stringified GalleryPhoto[]

  @IsString()
  @IsOptional()
  status?: string;
}
