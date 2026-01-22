import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  Query
} from '@nestjs/common';
import { AcademicModuleService } from './academic-module.service';


import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CreateCurriculumDto } from './dto/create-curiculum.dto';
import { UpdateCurriculumDto } from './dto/update-curiculum.dto';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { CreatePlayerAssessmentDto } from './dto/create-player-assessment.dto';
import { UpdatePlayerAssessmentDto } from './dto/update-player-assessment.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateTrainingClassDto } from './dto/create-training-class.dto';
import { UpdateTrainingClassDto } from './dto/update-training-class.dto';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import { CreateUnifiedStudentDto } from './dto/create-unified-student.dto';
import { CreateUnifiedParentDto } from './dto/create-unified-parent.dto';
import { CreateUnifiedCoachDto } from './dto/create-unified-coach.dto';
import { Roles } from '../common/decorators/role.decorator';
import { UserRole } from '../auths-module/entities/user.entity';

@Roles(UserRole.ADMIN, UserRole.COACH)
@Controller('academic')
export class AcademicModuleController {
  constructor(private readonly academicService: AcademicModuleService) {}


  createAttendance(@Body() dto: CreateAttendanceDto) {
    return this.academicService.createAttendance(dto);
  }

  @Get('attendance')
  findAllAttendance() {
    return this.academicService.findAllAttendance();
  }

  @Get('attendance/:id')
  findOneAttendance(@Param('id') id: string) {
    return this.academicService.findOneAttendance(id);
  }

  @Patch('attendance/:id')
  updateAttendance(@Param('id') id: string, @Body() dto: UpdateAttendanceDto) {
    return this.academicService.updateAttendance(id, dto);
  }

  @Delete('attendance/:id')
  removeAttendance(@Param('id') id: string) {
    return this.academicService.removeAttendance(id);
  }

  @Post('unified/coaches')
  createUnifiedCoach(@Body() dto: CreateUnifiedCoachDto) {
    return this.academicService.createUnifiedCoach(dto);
  }

  @Post('coaches')
  createCoach(@Body() dto: CreateCoachDto) {
    return this.academicService.createCoach(dto);
  }

  @Get('coaches')
  findAllCoach(
    @Query('page') page?: number, 
    @Query('limit') limit?: number, 
    @Query('search') search?: string
  ) {
    return this.academicService.findAllCoach(page, limit, search);
  }

  @Get('coaches/:id')
  findOneCoach(@Param('id') id: string) {
    return this.academicService.findOneCoach(id);
  }

  @Patch('coaches/:id')
  updateCoach(@Param('id') id: string, @Body() dto: UpdateCoachDto) {
    return this.academicService.updateCoach(id, dto);
  }

  @Delete('coaches/:id')
  removeCoach(@Param('id') id: string) {
    return this.academicService.removeCoach(id);
  }


  @Post('curriculum')
  createCurriculum(@Body() dto: CreateCurriculumDto) {
    return this.academicService.createCurriculum(dto);
  }

  @Get('curriculum')
  findAllCurriculum() {
    return this.academicService.findAllCurriculum();
  }

  @Get('curriculum/:id')
  findOneCurriculum(@Param('id') id: string) {
    return this.academicService.findOneCurriculum(id);
  }

  @Patch('curriculum/:id')
  updateCurriculum(@Param('id') id: string, @Body() dto: UpdateCurriculumDto) {
    return this.academicService.updateCurriculum(id, dto);
  }

  @Delete('curriculum/:id')
  removeCurriculum(@Param('id') id: string) {
    return this.academicService.removeCurriculum(id);
  }

  @Post('unified/parents')
  createUnifiedParent(@Body() dto: CreateUnifiedParentDto) {
    return this.academicService.createUnifiedParent(dto);
  }

  @Post('parents')
  createParent(@Body() dto: CreateParentDto) {
    return this.academicService.createParent(dto);
  }

  @Get('parents')
  findAllParent(
    @Query('page') page?: number, 
    @Query('limit') limit?: number, 
    @Query('search') search?: string
  ) {
    return this.academicService.findAllParent(page, limit, search);
  }

  @Get('parents/:id')
  findOneParent(@Param('id') id: string) {
    return this.academicService.findOneParent(id);
  }

  @Patch('parents/:id')
  updateParent(@Param('id') id: string, @Body() dto: UpdateParentDto) {
    return this.academicService.updateParent(id, dto);
  }

  @Delete('parents/:id')
  removeParent(@Param('id') id: string) {
    return this.academicService.removeParent(id);
  }


  @Post('assessments')
  createPlayerAssessment(@Body() dto: CreatePlayerAssessmentDto) {
    return this.academicService.createPlayerAssessment(dto);
  }

  @Get('assessments')
  findAllPlayerAssessment() {
    return this.academicService.findAllPlayerAssessment();
  }

  @Get('assessments/:id')
  findOnePlayerAssessment(@Param('id') id: string) {
    return this.academicService.findOnePlayerAssessment(id);
  }

  @Patch('assessments/:id')
  updatePlayerAssessment(@Param('id') id: string, @Body() dto: UpdatePlayerAssessmentDto) {
    return this.academicService.updatePlayerAssessment(id, dto);
  }

  @Delete('assessments/:id')
  removePlayerAssessment(@Param('id') id: string) {
    return this.academicService.removePlayerAssessment(id);
  }

  @Post('unified/students')
  createUnifiedStudent(@Body() dto: CreateUnifiedStudentDto) {
    return this.academicService.createUnifiedStudent(dto);
  }

  @Post('students')
  createStudent(@Body() dto: CreateStudentDto) {
    return this.academicService.createStudent(dto);
  }

  @Get('students')
  findAllStudent(
    @Query('page') page?: number, 
    @Query('limit') limit?: number, 
    @Query('search') search?: string
  ) {
    return this.academicService.findAllStudent(page, limit, search);
  }

  @Get('students/:id')
  findOneStudent(@Param('id') id: string) {
    return this.academicService.findOneStudent(id);
  }

  @Patch('students/:id')
  updateStudent(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.academicService.updateStudent(id, dto);
  }

  @Delete('students/:id')
  removeStudent(@Param('id') id: string) {
    return this.academicService.removeStudent(id);
  }

  @Post('classes')
  createTrainingClass(@Body() dto: CreateTrainingClassDto) {
    return this.academicService.createTrainingClass(dto);
  }

  @Get('classes')
  findAllTrainingClass() {
    return this.academicService.findAllTrainingClass();
  }

  @Get('classes/:id')
  findOneTrainingClass(@Param('id') id: string) {
    return this.academicService.findOneTrainingClass(id);
  }

  @Patch('classes/:id')
  updateTrainingClass(@Param('id') id: string, @Body() dto: UpdateTrainingClassDto) {
    return this.academicService.updateTrainingClass(id, dto);
  }

  @Delete('classes/:id')
  removeTrainingClass(@Param('id') id: string) {
    return this.academicService.removeTrainingClass(id);
  }
}