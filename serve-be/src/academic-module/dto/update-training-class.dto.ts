import { PartialType } from "@nestjs/mapped-types";
import { CreateTrainingClassDto } from "./create-training-class.dto";
export class UpdateTrainingClassDto extends PartialType(CreateTrainingClassDto) {}