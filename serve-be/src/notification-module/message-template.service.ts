import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageTemplate, TemplateType } from './entities/message-template.entity';
import { CreateMessageTemplateDto, UpdateMessageTemplateDto } from './message-template.dto';

@Injectable()
export class MessageTemplateService {
  constructor(
    @InjectRepository(MessageTemplate)
    private readonly messageTemplateRepository: Repository<MessageTemplate>,
  ) {}

  async create(createDto: CreateMessageTemplateDto): Promise<MessageTemplate> {
    const template = this.messageTemplateRepository.create(createDto);
    return this.messageTemplateRepository.save(template);
  }

  async findAll(): Promise<MessageTemplate[]> {
    return this.messageTemplateRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<MessageTemplate> {
    const template = await this.messageTemplateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`MessageTemplate with ID ${id} not found`);
    }
    return template;
  }

  async findActiveByType(type: TemplateType): Promise<MessageTemplate | null> {
    return this.messageTemplateRepository.findOne({
      where: { type, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateDto: UpdateMessageTemplateDto): Promise<MessageTemplate> {
    const template = await this.findOne(id);
    Object.assign(template, updateDto);
    return this.messageTemplateRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.messageTemplateRepository.remove(template);
  }
}
