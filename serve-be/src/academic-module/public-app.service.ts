import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../auths-module/entities/user.entity';
import { Student } from './entities/student.entity';
import { Parent } from './entities/parent.entity';
import { PublicApplicationDto } from './dto/public-application.dto';

@Injectable()
export class PublicAppService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Parent)
    private parentRepo: Repository<Parent>,
  ) {}

  async processApplication(dto: PublicApplicationDto) {
    // 1. Handle Parent
    let parentUser = await this.userRepo.findOne({ where: { email: dto.parentEmail } });
    let parentProfile: Parent;

    if (!parentUser) {
      // Create new Parent User (Pending)
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('ChangeMe123!', salt); // Temporary password

      parentUser = this.userRepo.create({
        email: dto.parentEmail,
        fullName: dto.parentName,
        password: hashedPassword,
        role: UserRole.PARENT,
        phoneNumber: dto.parentPhone,
        status: 'Pending', // New parents are also Pending
      });
      await this.userRepo.save(parentUser);

      // Create Parent Profile
      parentProfile = this.parentRepo.create({
        user: parentUser,
      });
      await this.parentRepo.save(parentProfile);
    } else {
      // Existing parent user, finding profile
      const existingProfile = await this.parentRepo.findOne({ where: { user: { id: parentUser.id } } });
      if (!existingProfile) {
         // Should not happen for valid parents, but safely create if missing
         parentProfile = this.parentRepo.create({ user: parentUser });
         await this.parentRepo.save(parentProfile);
      } else {
        parentProfile = existingProfile;
      }
    }

    // 2. Handle Student
    // Check if student email already exists (if provided)
    if (dto.studentEmail) {
        const existingStudent = await this.userRepo.findOne({ where: { email: dto.studentEmail } });
        if (existingStudent) {
            throw new ConflictException('Student email already registered');
        }
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('ChangeMe123!', salt);

    // Generate a placeholder email if none provided to satisfy unique constraint
    const studentEmail = dto.studentEmail || `pending.${Date.now()}@example.com`;

    const studentUser = this.userRepo.create({
      email: studentEmail,
      fullName: dto.studentName,
      password: hashedPassword,
      role: UserRole.STUDENT,
      status: 'Pending',
    });
    await this.userRepo.save(studentUser);

    const studentProfile = this.studentRepo.create({
      user: studentUser,
      birthDate: dto.studentDob,
      height: dto.studentHeight,
      weight: dto.studentWeight,
      position: dto.studentPosition,
      parent: parentProfile,
    });
    
    return this.studentRepo.save(studentProfile);
  }
}
