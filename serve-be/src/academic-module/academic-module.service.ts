import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Attendance } from './entities/attendance.entity';
import { Curriculum } from './entities/curriculum.entity';
import { CurriculumLevel } from './entities/curriculum-level.entity';
import { CurriculumMonth } from './entities/curriculum-month.entity';
import { CurriculumWeekMaterial } from './entities/curriculum-week-material.entity';
import { Parent } from './entities/parent.entity';
import { PlayerAssessment } from './entities/player-assessment.entity';
import { Student } from './entities/student.entity';
import { TrainingClass } from './entities/training-class.entity';
import { Coach } from './entities/coach.entity';
import { User, UserRole } from '../auths-module/entities/user.entity';

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
import * as bcrypt from 'bcrypt';

@Injectable()
export class AcademicModuleService {
  constructor(
    @InjectRepository(Attendance) private attendanceRepo: Repository<Attendance>,
    @InjectRepository(Curriculum) private curriculumRepo: Repository<Curriculum>,
    @InjectRepository(CurriculumLevel) private curriculumLevelRepo: Repository<CurriculumLevel>,
    @InjectRepository(CurriculumMonth) private curriculumMonthRepo: Repository<CurriculumMonth>,
    @InjectRepository(CurriculumWeekMaterial) private curriculumWeekRepo: Repository<CurriculumWeekMaterial>,
    @InjectRepository(Parent) private parentRepo: Repository<Parent>,
    @InjectRepository(PlayerAssessment) private assessmentRepo: Repository<PlayerAssessment>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(TrainingClass) private trainingClassRepo: Repository<TrainingClass>,
    @InjectRepository(Coach) private coachRepo: Repository<Coach>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async createAttendance(dto: CreateAttendanceDto) {
    const { studentId, ...rest } = dto;
    const attendance = this.attendanceRepo.create({
      ...rest,
      student: { id: studentId },
    });
    return this.attendanceRepo.save(attendance);
  }

  findAllAttendance() {
    return this.attendanceRepo.find({ relations: ['student'] });
  }

  findOneAttendance(id: string) {
    return this.attendanceRepo.findOne({ where: { id }, relations: ['student'] });
  }

  updateAttendance(id: string, dto: UpdateAttendanceDto) {
    return this.attendanceRepo.update(id, dto);
  }

  removeAttendance(id: string) {
    return this.attendanceRepo.delete(id);
  }

  async createUnifiedCoach(dto: CreateUnifiedCoachDto) {
    const existingUser = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      password: hashedPassword,
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      role: UserRole.COACH,
    });
    const savedUser = await this.userRepo.save(user);

    const coach = this.coachRepo.create({
      specialization: dto.specialization,
      contractStatus: dto.contractStatus,
      user: { id: savedUser.id },
    });

    return this.coachRepo.save(coach);
  }

  async createCoach(dto: CreateCoachDto) {
    const { userId, ...rest } = dto;
    const coach = this.coachRepo.create({
      ...rest,
      user: { id: userId },
    });
    return this.coachRepo.save(coach);
  }

  async findAllCoach(page = 1, limit = 10, search = '') {
    const query = this.coachRepo.createQueryBuilder('coach')
      .leftJoinAndSelect('coach.user', 'user');

    if (search) {
      query.where(
        'user.fullName ILIKE :search OR user.email ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  findOneCoach(id: string) {
    return this.coachRepo.findOne({ where: { id }, relations: ['user'] });
  }

  updateCoach(id: string, dto: UpdateCoachDto) {
    return this.coachRepo.update(id, dto);
  }

  removeCoach(id: string) {
    return this.coachRepo.delete(id);
  }

  async createCurriculum(dto: CreateCurriculumDto) {
    const curriculum = this.curriculumRepo.create(dto);
    return this.curriculumRepo.save(curriculum);
  }

  findAllCurriculum() {
    return this.curriculumRepo.find();
  }

  findOneCurriculum(id: string) {
    return this.curriculumRepo.findOneBy({ id });
  }

  updateCurriculum(id: string, dto: UpdateCurriculumDto) {
    return this.curriculumRepo.update(id, dto);
  }

  removeCurriculum(id: string) {
    return this.curriculumRepo.delete(id);
  }

  // --- Curriculum Hierarchy CRUD ---

  async createCurriculumLevel(data: { name: string; description?: string; colorCode?: string }) {
    const level = this.curriculumLevelRepo.create(data);
    return this.curriculumLevelRepo.save(level);
  }

  findAllCurriculumLevels() {
    return this.curriculumLevelRepo.find({ relations: ['months', 'months.weekMaterials'] });
  }

  findOneCurriculumLevel(id: string) {
    return this.curriculumLevelRepo.findOne({ where: { id }, relations: ['months', 'months.weekMaterials'] });
  }

  updateCurriculumLevel(id: string, data: Partial<{ name: string; description: string; colorCode: string }>) {
    return this.curriculumLevelRepo.update(id, data);
  }

  removeCurriculumLevel(id: string) {
    return this.curriculumLevelRepo.delete(id);
  }

  async createCurriculumMonth(data: { levelId: string; monthNumber: number; title?: string }) {
    const month = this.curriculumMonthRepo.create({
      ...data,
      level: { id: data.levelId },
    });
    return this.curriculumMonthRepo.save(month);
  }

  updateCurriculumMonth(id: string, data: Partial<{ monthNumber: number; title: string }>) {
    return this.curriculumMonthRepo.update(id, data);
  }

  removeCurriculumMonth(id: string) {
    return this.curriculumMonthRepo.delete(id);
  }

  async createCurriculumWeekMaterial(data: { monthId: string; weekNumber: number; category: string; materialDescription: string }) {
    const material = this.curriculumWeekRepo.create({
      ...data,
      month: { id: data.monthId },
    });
    return this.curriculumWeekRepo.save(material);
  }

  updateCurriculumWeekMaterial(id: string, data: Partial<{ weekNumber: number; category: string; materialDescription: string }>) {
    return this.curriculumWeekRepo.update(id, data);
  }

  removeCurriculumWeekMaterial(id: string) {
    return this.curriculumWeekRepo.delete(id);
  }

  async createUnifiedParent(dto: CreateUnifiedParentDto) {
    const existingUser = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      password: hashedPassword,
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      role: UserRole.PARENT,
    });
    const savedUser = await this.userRepo.save(user);

    const parent = this.parentRepo.create({
      phoneNumber: dto.phoneNumber,
      user: { id: savedUser.id },
    });

    return this.parentRepo.save(parent);
  }

  async createParent(dto: CreateParentDto) {
    const { userId, ...rest } = dto;
    const parent = this.parentRepo.create({
      ...rest,
      user: { id: userId },
    });
    return this.parentRepo.save(parent);
  }

  async findAllParent(page = 1, limit = 10, search = '') {
    const query = this.parentRepo.createQueryBuilder('parent')
      .leftJoinAndSelect('parent.user', 'user')
      .loadRelationCountAndMap('parent.studentsCount', 'parent.students');

    if (search) {
      query.where(
        'user.fullName ILIKE :search OR user.email ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  findOneParent(id: string) {
    return this.parentRepo.findOne({ where: { id }, relations: ['user', 'students'] });
  }

  async updateParent(id: string, dto: UpdateParentDto & { fullName?: string; email?: string; status?: string; phoneNumber?: string }) {
    const { fullName, email, status, phoneNumber, ...rest } = dto;


    if (fullName || email || status || phoneNumber) {
      const parent = await this.parentRepo.findOne({
        where: { id },
        relations: ['user'],
      });

      if (parent && parent.user) {
        await this.userRepo.update(parent.user.id, {
          ...(fullName && { fullName }),
          ...(email && { email }),
          ...(status && { status }),
          ...(phoneNumber && { phoneNumber }),
        });
      }
    }


    const parentUpdateData: any = { ...rest };
  
    if (phoneNumber) {
        parentUpdateData.phoneNumber = phoneNumber;
    }

    delete parentUpdateData.fullName;
    delete parentUpdateData.email;
    delete parentUpdateData.status;

    if (Object.keys(parentUpdateData).length > 0) {
      return this.parentRepo.update(id, parentUpdateData);
    }

    return { affected: 1 };
  }

  removeParent(id: string) {
    return this.parentRepo.delete(id);
  }

  async createPlayerAssessment(dto: CreatePlayerAssessmentDto) {
    const { studentId, weekMaterialId, ...rest } = dto;
    const assessment = this.assessmentRepo.create({
      ...rest,
      student: { id: studentId },
      weekMaterial: { id: weekMaterialId },
    });
    return this.assessmentRepo.save(assessment);
  }

  findAllPlayerAssessment() {
    return this.assessmentRepo.find({ relations: ['student'] });
  }

  findOnePlayerAssessment(id: string) {
    return this.assessmentRepo.findOne({ where: { id }, relations: ['student'] });
  }

  updatePlayerAssessment(id: string, dto: UpdatePlayerAssessmentDto) {
    return this.assessmentRepo.update(id, dto);
  }

  removePlayerAssessment(id: string) {
    return this.assessmentRepo.delete(id);
  }

  async createUnifiedStudent(dto: CreateUnifiedStudentDto) {
    const existingUser = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      password: hashedPassword,
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      role: UserRole.STUDENT,
    });
    const savedUser = await this.userRepo.save(user);

    let parentId: string | undefined = undefined;
    if (dto.parentEmail) {
      const parentUser = await this.userRepo.findOne({
        where: { email: dto.parentEmail },
        relations: ['parentProfile'],
      });

      if (parentUser) {
        const parentRecord = await this.parentRepo.findOne({
          where: { user: { id: parentUser.id } },
        });
        if (parentRecord) {
          parentId = parentRecord.id;
        }
      }
    }

    const student = this.studentRepo.create({
      birthDate: dto.birthDate,
      height: dto.height,
      weight: dto.weight,
      position: dto.position,
      user: { id: savedUser.id },
      parent: parentId ? { id: parentId } : undefined,
    });

    return this.studentRepo.save(student);
  }

  async createStudent(dto: CreateStudentDto) {
    const { userId, parentId, trainingClassId, ...rest } = dto;

    const student = this.studentRepo.create({
      ...rest,
      user: { id: userId },
      parent: parentId ? { id: parentId } : undefined,
      trainingClass: trainingClassId ? { id: trainingClassId } : undefined,
    });
    return this.studentRepo.save(student);
  }

  async findAllStudent(page = 1, limit = 10, search = '') {
    const query = this.studentRepo.createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('student.parent', 'parent')
      .leftJoinAndSelect('parent.user', 'parentUser')
      .leftJoinAndSelect('student.trainingClass', 'trainingClass');

    if (search) {
      query.where(
        'user.fullName ILIKE :search OR user.email ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const mappedData = data.map(student => ({
      ...student,
      parentName: student.parent?.user?.fullName || '-',
    }));

    return { data: mappedData, total, page, limit };
  }

  findOneStudent(id: string) {
    return this.studentRepo.findOne({
      where: { id },
      relations: ['user', 'parent', 'trainingClass'],
    });
  }

  async updateStudent(id: string, dto: UpdateStudentDto & { fullName?: string; email?: string; status?: string }) {
    const { parentId, trainingClassId, fullName, email, status, ...rest } = dto;

    if (fullName || email || status) {
      const student = await this.studentRepo.findOne({
        where: { id },
        relations: ['user', 'parent', 'parent.user'],
      });

      if (student && student.user) {
        await this.userRepo.update(student.user.id, {
          ...(fullName && { fullName }),
          ...(email && { email }),
          ...(status && { status }),
        });

        if (status?.toLowerCase() === 'active' && student.parent?.user) {
          await this.userRepo.update(student.parent.user.id, { status: 'Active' });
        }
      }
    }

    const updateData: any = { ...rest };

    if (parentId !== undefined) {
      updateData.parent = parentId ? { id: parentId } : null;
    }

    if (trainingClassId !== undefined) {
      updateData.trainingClass = trainingClassId ? { id: trainingClassId } : null;
    }

    if (Object.keys(updateData).length > 0) {
      return this.studentRepo.update(id, updateData);
    }

    return { affected: 1 };
  }

  removeStudent(id: string) {
    return this.studentRepo.delete(id);
  }

  async createTrainingClass(dto: CreateTrainingClassDto) {
    const { coachId, curriculumLevelId, activeMonthId, ...rest } = dto;
    const trainingClass = this.trainingClassRepo.create({
      ...rest,
      coach: coachId ? { id: coachId } : undefined,
      curriculumLevel: curriculumLevelId ? { id: curriculumLevelId } : undefined,
      activeMonth: activeMonthId ? { id: activeMonthId } : undefined,
    });
    return this.trainingClassRepo.save(trainingClass);
  }

  findAllTrainingClass() {
    return this.trainingClassRepo.find({ relations: ['coach', 'students'] });
  }

  findOneTrainingClass(id: string) {
    return this.trainingClassRepo.findOne({
      where: { id },
      relations: ['coach', 'students'],
    });
  }

  updateTrainingClass(id: string, dto: UpdateTrainingClassDto) {
    return this.trainingClassRepo.update(id, dto);
  }

  removeTrainingClass(id: string) {
    return this.trainingClassRepo.delete(id);
  }
}
