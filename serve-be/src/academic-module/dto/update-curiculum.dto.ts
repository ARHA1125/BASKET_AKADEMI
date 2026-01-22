import { PartialType } from "@nestjs/mapped-types";
import { CreateCurriculumDto } from "./create-curiculum.dto";

export class UpdateCurriculumDto extends PartialType(CreateCurriculumDto) {}