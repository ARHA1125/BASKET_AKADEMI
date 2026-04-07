import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sponsor } from './entities/sponsor.entity';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

@Injectable()
export class AdministrationService {
  constructor(
    @InjectRepository(Sponsor)
    private sponsorsRepository: Repository<Sponsor>,
  ) {}

  create(createSponsorDto: CreateSponsorDto) {
    const sponsor = this.sponsorsRepository.create(createSponsorDto);
    return this.sponsorsRepository.save(sponsor);
  }

  findAll() {
    return this.sponsorsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const sponsor = await this.sponsorsRepository.findOne({ where: { id } });
    if (!sponsor) {
      throw new NotFoundException(`Sponsor with ID ${id} not found`);
    }
    return sponsor;
  }

  async update(id: string, updateSponsorDto: UpdateSponsorDto) {
    const sponsor = await this.findOne(id);
    this.sponsorsRepository.merge(sponsor, updateSponsorDto);
    return this.sponsorsRepository.save(sponsor);
  }

  async remove(id: string) {
    const sponsor = await this.findOne(id);
    return this.sponsorsRepository.remove(sponsor);
  }
}
