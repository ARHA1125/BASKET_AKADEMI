import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommunityModuleDto } from './dto/create-community-module.dto';
import { UpdateCommunityModuleDto } from './dto/update-community-module.dto';
import { Event } from './entities/event.entity';
import { Squad, SquadStatus } from './entities/squad.entity';
import { Student } from '../academic-module/entities/student.entity';
import {
  StudentActivity,
  StudentActivityType,
} from '../academic-module/entities/student-activity.entity';
import { GamificationPointLedger } from '../academic-module/entities/gamification-point-ledger.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateSquadDto } from './dto/create-squad.dto';
import { FinalizeSquadDto } from './dto/finalize-squad.dto';

@Injectable()
export class CommunityModuleService {
  constructor(
    @InjectRepository(Event) private readonly eventRepo: Repository<Event>,
    @InjectRepository(Squad) private readonly squadRepo: Repository<Squad>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(StudentActivity)
    private readonly activityRepo: Repository<StudentActivity>,
    @InjectRepository(GamificationPointLedger)
    private readonly pointLedgerRepo: Repository<GamificationPointLedger>,
  ) {}

  private getCurrentWeekKey(date = new Date()) {
    const current = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = current.getUTCDay() || 7;
    current.setUTCDate(current.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil(
      ((current.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    );
    return `${current.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  }

  private getSeasonKey(date = new Date()) {
    return `${date.getFullYear()}-S1`;
  }

  private async awardSelectionPoints(
    studentIds: string[],
    payload: {
      title: string;
      activityType: StudentActivityType;
      points: number;
      ruleCode: string;
      reason: string;
      sourceRefId?: string;
      sourceRefType?: string;
      awardedBy?: string;
    },
  ) {
    for (const studentId of studentIds) {
      const activity = await this.activityRepo.save(
        this.activityRepo.create({
          student: { id: studentId },
          title: payload.title,
          activityType: payload.activityType,
          sourceRefId: payload.sourceRefId,
          sourceRefType: payload.sourceRefType,
          createdBy: payload.awardedBy,
        }),
      );

      await this.pointLedgerRepo.save(
        this.pointLedgerRepo.create({
          student: { id: studentId },
          activity: { id: activity.id },
          points: payload.points,
          ruleCode: payload.ruleCode,
          reason: payload.reason,
          weekKey: this.getCurrentWeekKey(),
          seasonKey: this.getSeasonKey(),
          awardedBy: payload.awardedBy,
        }),
      );
    }
  }

  async createEvent(dto: CreateEventDto) {
    const event = this.eventRepo.create({
      ...dto,
      date: new Date(dto.date),
    });
    return this.eventRepo.save(event);
  }

  findAllEvents() {
    return this.eventRepo.find({ order: { date: 'DESC' } });
  }

  async createSquad(dto: CreateSquadDto) {
    const players = await this.studentRepo.findByIds(dto.playerIds);
    const squad = new Squad();
    squad.name = dto.name;
    squad.coachName = dto.coachName || (null as any);
    squad.isFinalized = dto.isFinalized || false;
    squad.status = dto.isFinalized ? SquadStatus.FINALIZED : SquadStatus.DRAFT;
    squad.finalizedAt = dto.isFinalized ? new Date() : (null as any);
    squad.finalizedBy = dto.isFinalized
      ? dto.coachName || (null as any)
      : (null as any);
    squad.event = { id: dto.eventId } as Event;
    squad.players = players;

    const savedSquad = await this.squadRepo.save(squad);

    await this.awardSelectionPoints(dto.playerIds, {
      title: 'Selected into event squad',
      activityType: StudentActivityType.LINEUP_SELECTION,
      points: 20,
      ruleCode: 'LINEUP_SELECTED',
      reason: 'Selected into lineup +20',
      sourceRefId: savedSquad.id,
      sourceRefType: 'squad',
      awardedBy: dto.coachName,
    });

    return this.findOneSquad(savedSquad.id);
  }

  findAllSquads() {
    return this.squadRepo.find({
      relations: ['event', 'players', 'players.user'],
      order: { createdAt: 'DESC' },
    });
  }

  findOneSquad(id: string) {
    return this.squadRepo.findOne({
      where: { id },
      relations: ['event', 'players', 'players.user'],
    });
  }

  async finalizeSquad(dto: FinalizeSquadDto) {
    const squad = await this.squadRepo.findOne({
      where: { id: dto.squadId },
      relations: ['players'],
    });
    if (!squad) {
      throw new Error('Squad not found');
    }

    squad.isFinalized = dto.isFinalized ?? true;
    squad.status = squad.isFinalized
      ? SquadStatus.FINALIZED
      : SquadStatus.DRAFT;
    squad.finalizedAt = squad.isFinalized ? new Date() : (null as any);
    squad.finalizedBy = squad.isFinalized
      ? dto.awardedBy || (null as any)
      : (null as any);
    const saved = await this.squadRepo.save(squad);

    if (saved.isFinalized) {
      await this.awardSelectionPoints(
        (squad.players || []).map((player) => player.id),
        {
          title: 'Participating in finalized event squad',
          activityType: StudentActivityType.EVENT_PARTICIPATION,
          points: 15,
          ruleCode: 'EVENT_PARTICIPATION',
          reason: 'Participated in event +15',
          sourceRefId: saved.id,
          sourceRefType: 'squad',
          awardedBy: dto.awardedBy,
        },
      );
    }

    return this.findOneSquad(saved.id);
  }

  create(createCommunityModuleDto: CreateCommunityModuleDto) {
    return 'This action adds a new communityModule';
  }

  findAll() {
    return `This action returns all communityModule`;
  }

  findOne(id: number) {
    return `This action returns a #${id} communityModule`;
  }

  update(id: number, updateCommunityModuleDto: UpdateCommunityModuleDto) {
    return `This action updates a #${id} communityModule`;
  }

  remove(id: number) {
    return `This action removes a #${id} communityModule`;
  }
}
