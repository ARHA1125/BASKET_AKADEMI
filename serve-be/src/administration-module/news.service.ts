import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
  ) {}

  create(createNewsDto: CreateNewsDto) {
    const news = this.newsRepository.create(createNewsDto);
    return this.newsRepository.save(news);
  }

  findAll() {
    return this.newsRepository.find({ order: { createdAt: 'DESC' } });
  }

  findPublished() {
    return this.newsRepository.find({
      where: { status: 'published' },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }
    return news;
  }

  async findBySlug(slug: string) {
    const news = await this.newsRepository.findOne({ where: { slug } });
    if (!news) {
      throw new NotFoundException(`News with slug ${slug} not found`);
    }
    return news;
  }

  async update(id: string, updateNewsDto: UpdateNewsDto) {
    const news = await this.findOne(id);
    this.newsRepository.merge(news, updateNewsDto);
    return this.newsRepository.save(news);
  }

  async remove(id: string) {
    const news = await this.findOne(id);
    return this.newsRepository.remove(news);
  }
}
