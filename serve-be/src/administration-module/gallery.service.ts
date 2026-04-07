import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gallery } from './entities/gallery.entity';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(Gallery)
    private galleryRepository: Repository<Gallery>,
  ) {}

  create(dto: CreateGalleryDto) {
    const gallery = this.galleryRepository.create(dto);
    return this.galleryRepository.save(gallery);
  }

  findAll() {
    return this.galleryRepository.find({ order: { createdAt: 'DESC' } });
  }

  findPublished() {
    return this.galleryRepository.find({
      where: { status: 'published' },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const gallery = await this.galleryRepository.findOne({ where: { id } });
    if (!gallery) throw new NotFoundException(`Gallery with ID ${id} not found`);
    return gallery;
  }

  async findBySlug(slug: string) {
    const gallery = await this.galleryRepository.findOne({ where: { slug } });
    if (!gallery) throw new NotFoundException(`Gallery with slug ${slug} not found`);
    return gallery;
  }

  async update(id: string, dto: UpdateGalleryDto) {
    const gallery = await this.findOne(id);
    this.galleryRepository.merge(gallery, dto);
    return this.galleryRepository.save(gallery);
  }

  async remove(id: string) {
    const gallery = await this.findOne(id);
    return this.galleryRepository.remove(gallery);
  }
}
