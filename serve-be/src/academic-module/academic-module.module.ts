import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicModuleService } from './academic-module.service';
import { AcademicModuleController } from './academic-module.controller';

// Entities
import { Attendance } from './entities/attendance.entity';
import { Curriculum } from './entities/curriculum.entity';
import { Parent } from './entities/parent.entity';
import { PlayerAssessment } from './entities/player-assessment.entity';
import { Student } from './entities/student.entity';
import { TrainingClass } from './entities/training-class.entity';
import { Coach } from './entities/coach.entity';
import { User } from '../auths-module/entities/user.entity';

import { PublicAppController } from './public-app.controller';
import { PublicAppService } from './public-app.service';

@Module({
  imports: [
    // Register all entities so the Service can inject their Repositories
    TypeOrmModule.forFeature([
      Attendance,
      Curriculum,
      Parent,
      PlayerAssessment,
      Student,
      TrainingClass,
      Coach,
      User,
    ]),
  ],
  controllers: [AcademicModuleController, PublicAppController],
  providers: [AcademicModuleService, PublicAppService],
  exports: [AcademicModuleService],
})
export class AcademicModuleModule {}