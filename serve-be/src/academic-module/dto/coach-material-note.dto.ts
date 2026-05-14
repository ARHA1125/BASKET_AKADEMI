import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateCoachMaterialNoteDto {
  @IsUUID()
  weekMaterialId: string;

  @IsString()
  @IsOptional()
  customNotes?: string;
}

export class UpdateCoachMaterialNoteDto {
  @IsString()
  @IsOptional()
  customNotes?: string;
}
