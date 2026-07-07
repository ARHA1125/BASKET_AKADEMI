import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from './entities/testimonial.entity';
import { Parent } from '../academic-module/entities/parent.entity';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { UserRole } from '../auths-module/entities/user.entity';

@Injectable()
export class TestimonialService {
  constructor(
    @InjectRepository(Testimonial)
    private testimonialRepository: Repository<Testimonial>,
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
  ) {}

  async createForParent(userId: string, dto: CreateTestimonialDto) {
    // 1. Find parent profile
    const parent = await this.parentRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!parent) {
      throw new NotFoundException('Parent profile not found');
    }

    // 2. Check if testimonial already exists for this parent
    const existing = await this.testimonialRepository.findOne({
      where: { parentId: parent.id },
    });
    if (existing) {
      throw new BadRequestException('You have already submitted a testimonial. Please update your existing testimonial instead.');
    }

    // 3. Create testimonial
    const testimonial = this.testimonialRepository.create({
      content: dto.content,
      rating: dto.rating ?? 5,
      status: 'pending', // Parent submissions always start as pending
      parent,
      parentId: parent.id,
    });

    return this.testimonialRepository.save(testimonial);
  }

  async createForParentByAdmin(dto: CreateTestimonialDto) {
    if (!dto.parentId) {
      throw new BadRequestException('parentId is required');
    }

    // 1. Find parent profile
    const parent = await this.parentRepository.findOne({
      where: { id: dto.parentId },
    });
    if (!parent) {
      throw new NotFoundException('Parent profile not found');
    }

    // 2. Check if testimonial already exists for this parent
    const existing = await this.testimonialRepository.findOne({
      where: { parentId: parent.id },
    });
    if (existing) {
      throw new BadRequestException('A testimonial already exists for this parent.');
    }

    // 3. Create testimonial
    const testimonial = this.testimonialRepository.create({
      content: dto.content,
      rating: dto.rating ?? 5,
      status: dto.status ?? 'approved', // Admin submissions default to approved
      parent,
      parentId: parent.id,
    });

    return this.testimonialRepository.save(testimonial);
  }

  async findAll() {
    return this.testimonialRepository.find({
      relations: ['parent', 'parent.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findMyTestimonial(userId: string) {
    const parent = await this.parentRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!parent) {
      throw new NotFoundException('Parent profile not found');
    }

    return this.testimonialRepository.findOne({
      where: { parentId: parent.id },
      relations: ['parent'],
    });
  }

  async findPublicApproved() {
    return this.testimonialRepository.find({
      where: { status: 'approved' },
      relations: ['parent', 'parent.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const testimonial = await this.testimonialRepository.findOne({
      where: { id },
      relations: ['parent', 'parent.user'],
    });
    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }
    return testimonial;
  }

  async update(id: string, dto: UpdateTestimonialDto, user: { id: string; role: string }) {
    const testimonial = await this.findOne(id);

    // If parent is updating, verify ownership and prevent changing status
    if (user.role === UserRole.PARENT) {
      if (testimonial.parent.user.id !== user.id) {
        throw new ForbiddenException('You can only update your own testimonial.');
      }
      
      // Reset status to pending on update so admin can review it again
      this.testimonialRepository.merge(testimonial, {
        content: dto.content,
        rating: dto.rating,
        status: 'pending',
      });
    } else if (user.role === UserRole.ADMIN) {
      // Admin can update anything, including status
      this.testimonialRepository.merge(testimonial, dto);
    } else {
      throw new ForbiddenException('Unauthorized to update testimonial');
    }

    return this.testimonialRepository.save(testimonial);
  }

  async remove(id: string, user: { id: string; role: string }) {
    const testimonial = await this.findOne(id);

    // If parent is deleting, verify ownership
    if (user.role === UserRole.PARENT) {
      if (testimonial.parent.user.id !== user.id) {
        throw new ForbiddenException('You can only delete your own testimonial.');
      }
    } else if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Unauthorized to delete testimonial');
    }

    return this.testimonialRepository.remove(testimonial);
  }
}
