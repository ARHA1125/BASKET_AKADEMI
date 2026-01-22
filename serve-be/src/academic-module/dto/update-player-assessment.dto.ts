import { PartialType } from "@nestjs/mapped-types";
import { CreatePlayerAssessmentDto } from "./create-player-assessment.dto";
export class UpdatePlayerAssessmentDto extends PartialType(CreatePlayerAssessmentDto) {}