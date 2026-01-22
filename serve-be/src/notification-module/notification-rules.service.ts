import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationRule } from './entities/notification-rule.entity';

@Injectable()
export class NotificationRulesService {
  constructor(
    @InjectRepository(NotificationRule)
    private rulesRepository: Repository<NotificationRule>,
  ) {}

  async create(createRuleDto: Partial<NotificationRule>) {
    const rule = this.rulesRepository.create(createRuleDto);
    return this.rulesRepository.save(rule);
  }

  async findAll() {
    return this.rulesRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    return this.rulesRepository.findOneBy({ id });
  }

  async update(id: string, updateRuleDto: Partial<NotificationRule>) {
    await this.rulesRepository.update(id, updateRuleDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.rulesRepository.delete(id);
    return { deleted: true };
  }

  async findMatchingRule(messageText: string): Promise<NotificationRule | null> {
    // Simple keyword match (case-insensitive)
    // In future, could support regex or exact match
    const rules = await this.rulesRepository.find({ where: { isActive: true } });
    
    // Check for exact match or contains
    // For now, let's do simple "message contains keyword" or "exact match" 
    // depending on requirement. Customarily "keyword" implies contains.
    // The user asked for "Greetings immediately", implying checking if message IS "Hi" or contains "Hi".
    
    // Priority: Exact/Contains Match > Catch-All (No Keyword)
    // Sort rules: Specific keywords first
    
    // 1. Try to find specific match
    const specificMatch = rules.find(rule => 
        rule.keyword && rule.keyword.trim() !== '' && messageText.toLowerCase().includes(rule.keyword.toLowerCase())
    );

    if (specificMatch) return specificMatch;

    // 2. Fallback to Catch-All (Empty/Null keyword)
    const catchAll = rules.find(rule => !rule.keyword || rule.keyword.trim() === '');
    
    return catchAll || null;
  }
}
