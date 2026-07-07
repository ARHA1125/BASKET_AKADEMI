import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemFeedback } from './entities/system-feedback.entity';
import { CreateSystemFeedbackDto } from './dto/create-system-feedback.dto';
import { UpdateSystemFeedbackDto } from './dto/update-system-feedback.dto';
import { User } from '../auths-module/entities/user.entity';

@Injectable()
export class SystemFeedbackService {
  constructor(
    @InjectRepository(SystemFeedback)
    private readonly feedbackRepository: Repository<SystemFeedback>,
  ) {}

  async create(user: User, dto: CreateSystemFeedbackDto): Promise<SystemFeedback> {
    const feedback = this.feedbackRepository.create({
      content: dto.content,
      category: dto.category,
      user: user,
    });
    return this.feedbackRepository.save(feedback);
  }

  async findAll(): Promise<SystemFeedback[]> {
    return this.feedbackRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findMyFeedbacks(userId: string): Promise<SystemFeedback[]> {
    return this.feedbackRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateSystemFeedbackDto): Promise<SystemFeedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!feedback) {
      throw new NotFoundException(`System feedback with ID ${id} not found`);
    }

    if (dto.status !== undefined) {
      feedback.status = dto.status;
    }
    if (dto.adminNotes !== undefined) {
      feedback.adminNotes = dto.adminNotes;
    }

    feedback.updatedAt = new Date();
    return this.feedbackRepository.save(feedback);
  }

  async remove(id: string): Promise<void> {
    const result = await this.feedbackRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`System feedback with ID ${id} not found`);
    }
  }
}
