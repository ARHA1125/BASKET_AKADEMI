import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Attendance } from './entities/attendance.entity';
import { Curriculum } from './entities/curriculum.entity';
import { CurriculumLevel } from './entities/curriculum-level.entity';
import { CurriculumMonth } from './entities/curriculum-month.entity';
import { CurriculumStatDomain, CurriculumWeekMaterial } from './entities/curriculum-week-material.entity';
import { Parent } from './entities/parent.entity';
import { PlayerAssessment } from './entities/player-assessment.entity';
import { Student, StudentCurriculumProfile } from './entities/student.entity';
import { TrainingClass } from './entities/training-class.entity';
import { Coach } from './entities/coach.entity';
import { StudentActivity } from './entities/student-activity.entity';
import { GamificationPointLedger } from './entities/gamification-point-ledger.entity';
import { BadgeCode, StudentBadge } from './entities/student-badge.entity';
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
import { CreateStudentActivityDto } from './dto/create-student-activity.dto';
import { UpdateStudentActivityDto } from './dto/update-student-activity.dto';
import { AwardPointsDto } from './dto/award-points.dto';
import * as bcrypt from 'bcrypt';
import { NotificationService } from '../notification-module/notification.service';
import { AttendanceStatus } from './entities/attendance.entity';
import { StudentActivityType } from './entities/student-activity.entity';

type GamificationCategoryKey =
  | 'lineup_selected'
  | 'match_ready'
  | 'training_engine'
  | 'skill_mastery'
  | 'discipline_lock'
  | 'team_spirit';

type GamificationBadgeView = {
  categoryKey: GamificationCategoryKey;
  badgeCode: string;
  title: string;
  description: string;
  tier: number;
  progressPoints: number;
  targetPoints: number;
  unlocked: boolean;
  featured: boolean;
  awardedAt?: Date;
};

type GamificationCategorySummary = {
  totalPoints: number;
  badge: GamificationBadgeView;
};

type GamificationProgressSummary = {
  totalPoints: number;
  weeklyPoints: number;
  categories: GamificationCategorySummary[];
  featuredBadge: GamificationBadgeView | null;
};

const GAMIFICATION_CATEGORY_CONFIG: Array<{
  key: GamificationCategoryKey;
  badgeCode: BadgeCode;
  title: string;
  description: string;
  targetPoints: [number, number, number];
  activityTypes: StudentActivityType[];
  ruleCodes?: string[];
  featured?: boolean;
}> = [
  {
    key: 'lineup_selected',
    badgeCode: BadgeCode.LINEUP_LEGEND,
    title: 'Lineup Legend',
    description: 'Gold trophy for players trusted in the highest-value lineup selections.',
    targetPoints: [20, 40, 60],
    activityTypes: [StudentActivityType.LINEUP_SELECTION],
    featured: true,
  },
  {
    key: 'match_ready',
    badgeCode: BadgeCode.MATCH_READY,
    title: 'Match Ready',
    description: 'Earned from event participation and proving match readiness over time.',
    targetPoints: [15, 30, 45],
    activityTypes: [StudentActivityType.EVENT_PARTICIPATION],
  },
  {
    key: 'training_engine',
    badgeCode: BadgeCode.TRAINING_ENGINE,
    title: 'Training Engine',
    description: 'Built from attendance consistency and showing up ready to work.',
    targetPoints: [20, 40, 60],
    activityTypes: [StudentActivityType.ATTENDANCE, StudentActivityType.PUNCTUALITY],
    ruleCodes: ['ATTENDANCE_PRESENT', 'ATTENDANCE_LATE'],
  },
  {
    key: 'skill_mastery',
    badgeCode: BadgeCode.SKILL_MASTERY,
    title: 'Skill Mastery',
    description: 'Unlocked through assessments, drills, and visible technical progress.',
    targetPoints: [25, 50, 75],
    activityTypes: [StudentActivityType.SKILL_PROGRESS, StudentActivityType.DRILL_COMPLETION, StudentActivityType.MINI_GAME],
    ruleCodes: ['ASSESSMENT_COMPLETED'],
  },
  {
    key: 'discipline_lock',
    badgeCode: BadgeCode.DISCIPLINE_LOCK,
    title: 'Discipline Lock',
    description: 'Rewards control, discipline, and trusted coach feedback moments.',
    targetPoints: [15, 30, 45],
    activityTypes: [StudentActivityType.DISCIPLINE, StudentActivityType.COACH_FEEDBACK],
  },
  {
    key: 'team_spirit',
    badgeCode: BadgeCode.TEAM_SPIRIT,
    title: 'Team Spirit',
    description: 'Tracks teamwork, collaboration, and positive impact on the group.',
    targetPoints: [15, 30, 45],
    activityTypes: [StudentActivityType.TEAMWORK],
  },
];

const COACH_GAMIFICATION_ACTIVITY_PRESETS: Record<
  StudentActivityType.LINEUP_SELECTION
  | StudentActivityType.EVENT_PARTICIPATION
  | StudentActivityType.DISCIPLINE
  | StudentActivityType.TEAMWORK
  | StudentActivityType.COACH_FEEDBACK
  | StudentActivityType.SKILL_PROGRESS,
  {
    title: string;
    points: number;
    ruleCode: string;
    reason: string;
  }
> = {
  [StudentActivityType.LINEUP_SELECTION]: {
    title: 'Lineup Selected',
    points: 20,
    ruleCode: 'LINEUP_SELECTED',
    reason: 'Selected into lineup +20',
  },
  [StudentActivityType.EVENT_PARTICIPATION]: {
    title: 'Event Participation',
    points: 15,
    ruleCode: 'EVENT_PARTICIPATION',
    reason: 'Participated in event +15',
  },
  [StudentActivityType.DISCIPLINE]: {
    title: 'Discipline Bonus',
    points: 5,
    ruleCode: 'DISCIPLINE_BONUS',
    reason: 'Discipline bonus +5',
  },
  [StudentActivityType.TEAMWORK]: {
    title: 'Teamwork Bonus',
    points: 5,
    ruleCode: 'TEAMWORK_BONUS',
    reason: 'Teamwork bonus +5',
  },
  [StudentActivityType.COACH_FEEDBACK]: {
    title: 'Coach Feedback Bonus',
    points: 5,
    ruleCode: 'COACH_FEEDBACK_BONUS',
    reason: 'Coach feedback bonus +5',
  },
  [StudentActivityType.SKILL_PROGRESS]: {
    title: 'Skill Progress Milestone',
    points: 10,
    ruleCode: 'SKILL_PROGRESS',
    reason: 'Skill progress milestone +10',
  },
};

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
    @InjectRepository(StudentActivity) private activityRepo: Repository<StudentActivity>,
    @InjectRepository(GamificationPointLedger) private pointLedgerRepo: Repository<GamificationPointLedger>,
    @InjectRepository(StudentBadge) private badgeRepo: Repository<StudentBadge>,
    @InjectRepository(TrainingClass) private trainingClassRepo: Repository<TrainingClass>,
    @InjectRepository(Coach) private coachRepo: Repository<Coach>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly notificationService: NotificationService,
  ) {}

  private getCurrentWeekKey(date = new Date()) {
    const current = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = current.getUTCDay() || 7;
    current.setUTCDate(current.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((current.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${current.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  }

  private getSeasonKey(date = new Date()) {
    return `${date.getFullYear()}-S1`;
  }

  private getProfileScale(profile?: StudentCurriculumProfile | string | null) {
    switch (profile) {
      case StudentCurriculumProfile.KU_10:
        return 0.85;
      case StudentCurriculumProfile.KU_12:
        return 1;
      case StudentCurriculumProfile.KU_14:
        return 1.08;
      case StudentCurriculumProfile.KU_17:
        return 1.15;
      default:
        return 1;
    }
  }

  private getCategoryDomainBonuses(category?: string | null) {
    const normalized = (category || '').toLowerCase();

    if (normalized.includes('body control') || normalized.includes('fast break')) {
      return { SPD: 0.15, PHY: 0.15 };
    }

    if (normalized.includes('moving without the ball')) {
      return { SPD: 0.18, DRI: 0.08 };
    }

    if (normalized.includes('ballhandling') || normalized.includes('dribbling')) {
      return { DRI: 0.2, SPD: 0.08 };
    }

    if (normalized.includes('passing')) {
      return { PAS: 0.2, DRI: 0.05 };
    }

    if (normalized.includes('shooting')) {
      return { SHO: 0.2, PHY: 0.05 };
    }

    if (normalized.includes('rebounding')) {
      return { PHY: 0.18, DEF: 0.1 };
    }

    if (normalized.includes('defense') || normalized.includes('man to man')) {
      return { DEF: 0.2, PHY: 0.08 };
    }

    if (normalized.includes('unit offense')) {
      return { PAS: 0.15, SHO: 0.1, DRI: 0.05 };
    }

    if (normalized.includes('karakter') || normalized.includes('kelas')) {
      return { CHR: 0.25 };
    }

    return {} as Record<string, number>;
  }

  private inferCurriculumStatDomain(category?: string | null, materialDescription?: string | null) {
    const haystack = `${category || ''} ${materialDescription || ''}`.toLowerCase();

    if (haystack.includes('shoot') || haystack.includes('layup') || haystack.includes('free throw') || haystack.includes('hook shot')) {
      return CurriculumStatDomain.SHOOTING;
    }

    if (haystack.includes('pass') || haystack.includes('catch') || haystack.includes('handoff')) {
      return CurriculumStatDomain.PASSING;
    }

    if (haystack.includes('dribble') || haystack.includes('ballhandling') || haystack.includes('crossover') || haystack.includes('spin')) {
      return CurriculumStatDomain.DRIBBLING;
    }

    if (haystack.includes('defense') || haystack.includes('pressure') || haystack.includes('denial') || haystack.includes('help & recover') || haystack.includes('rotasi')) {
      return CurriculumStatDomain.DEFENSE;
    }

    if (haystack.includes('body control') || haystack.includes('rebound') || haystack.includes('block out') || haystack.includes('jump')) {
      return CurriculumStatDomain.PHYSICAL;
    }

    if (haystack.includes('fast break') || haystack.includes('moving without the ball') || haystack.includes('change of pace') || haystack.includes('change of direction') || haystack.includes('start') || haystack.includes('step')) {
      return CurriculumStatDomain.SPEED;
    }

    if (haystack.includes('karakter') || haystack.includes('kelas')) {
      return CurriculumStatDomain.CHARACTER;
    }

    if (haystack.includes('unit offense') || haystack.includes('screen') || haystack.includes('pick & roll') || haystack.includes('pick & pop')) {
      return CurriculumStatDomain.PASSING;
    }

    return CurriculumStatDomain.CHARACTER;
  }

  private inferCurriculumStatWeight(category?: string | null, materialDescription?: string | null) {
    const haystack = `${category || ''} ${materialDescription || ''}`.toLowerCase();

    if (haystack.includes('body control') || haystack.includes('moving without the ball')) return 0.95;
    if (haystack.includes('ballhandling') || haystack.includes('dribbling')) return 1.15;
    if (haystack.includes('passing')) return 1.05;
    if (haystack.includes('shooting')) return 1.2;
    if (haystack.includes('rebounding')) return 1.05;
    if (haystack.includes('defense') || haystack.includes('man to man')) return 1.15;
    if (haystack.includes('fast break')) return 1.1;
    if (haystack.includes('unit offense')) return 1.1;
    if (haystack.includes('karakter') || haystack.includes('kelas')) return 0.9;

    return 1;
  }

  private inferCurriculumProfiles(levelName?: string | null, category?: string | null, materialDescription?: string | null) {
    const level = (levelName || '').toLowerCase();
    const haystack = `${category || ''} ${materialDescription || ''}`.toLowerCase();

    if (level.includes('fundamental')) {
      const KU_10Limited =
        haystack.includes('crossover dribble') ||
        haystack.includes('reverse/spin') ||
        haystack.includes('behind the back') ||
        haystack.includes('between the legs') ||
        haystack.includes('three point') ||
        haystack.includes('hook shot') ||
        haystack.includes('unit offense') ||
        haystack.includes('pick & roll') ||
        haystack.includes('pick & pop');

      return KU_10Limited
        ? [StudentCurriculumProfile.KU_12]
        : [StudentCurriculumProfile.KU_10, StudentCurriculumProfile.KU_12];
    }

    if (level.includes('intermediate')) {
      return [StudentCurriculumProfile.KU_14];
    }

    if (level.includes('advanced')) {
      return [StudentCurriculumProfile.KU_17];
    }

    return [
      StudentCurriculumProfile.KU_10,
      StudentCurriculumProfile.KU_12,
      StudentCurriculumProfile.KU_14,
      StudentCurriculumProfile.KU_17,
    ];
  }

  private normalizeCurriculumWeekMaterialInput(data: {
    category: string;
    materialDescription: string;
    competencyKey?: string;
    statDomain?: CurriculumStatDomain;
    statWeight?: number;
    curriculumProfiles?: string[];
    monthId?: string;
  }, levelName?: string | null) {
    return {
      ...data,
      competencyKey:
        data.competencyKey ||
        data.materialDescription
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, ''),
      statDomain: data.statDomain || this.inferCurriculumStatDomain(data.category, data.materialDescription),
      statWeight: data.statWeight ?? this.inferCurriculumStatWeight(data.category, data.materialDescription),
      curriculumProfiles:
        (data.curriculumProfiles && data.curriculumProfiles.length > 0 ? data.curriculumProfiles : undefined) ||
        this.inferCurriculumProfiles(levelName, data.category, data.materialDescription),
    };
  }

  private deriveAssessmentScores(material: CurriculumWeekMaterial, score: number, profile?: string | null) {
    const profileScale = this.getProfileScale(profile);
    const weightScale = Math.max(0.5, Number(material.statWeight || 1));
    const normalized = Math.round((score / 5) * 100 * profileScale);
    const bounded = Math.max(0, Math.min(99, normalized));
    const primaryScore = Math.max(0, Math.min(99, Math.round(bounded * Math.min(weightScale, 1.35))));

    const scores = {
      speedScore: 0,
      shootingScore: 0,
      passingScore: 0,
      dribblingScore: 0,
      defenseScore: 0,
      physicalScore: 0,
      consistencyScore: Math.round(bounded * 0.7),
      dominantStat: material.statDomain || CurriculumStatDomain.CHARACTER,
    };

    switch (material.statDomain) {
      case CurriculumStatDomain.SPEED:
        scores.speedScore = primaryScore;
        scores.dribblingScore = Math.round(primaryScore * 0.20);
        scores.physicalScore = Math.round(primaryScore * 0.10);
        break;
      case CurriculumStatDomain.SHOOTING:
        scores.shootingScore = primaryScore;
        scores.physicalScore = Math.round(primaryScore * 0.10);
        break;
      case CurriculumStatDomain.PASSING:
        scores.passingScore = primaryScore;
        scores.dribblingScore = Math.round(primaryScore * 0.15);
        break;
      case CurriculumStatDomain.DRIBBLING:
        scores.dribblingScore = primaryScore;
        scores.speedScore = Math.round(primaryScore * 0.25);
        scores.passingScore = Math.round(primaryScore * 0.12);
        break;
      case CurriculumStatDomain.DEFENSE:
        scores.defenseScore = primaryScore;
        scores.physicalScore = Math.round(primaryScore * 0.20);
        scores.speedScore = Math.round(primaryScore * 0.10);
        break;
      case CurriculumStatDomain.PHYSICAL:
        scores.physicalScore = primaryScore;
        scores.defenseScore = Math.round(primaryScore * 0.15);
        scores.speedScore = Math.round(primaryScore * 0.08);
        break;
      default:
        scores.consistencyScore = primaryScore;
        break;
    }

    const categoryBonuses = this.getCategoryDomainBonuses(material.category);
    scores.consistencyScore += Math.round(primaryScore * (categoryBonuses.CHR || 0));

    scores.speedScore = Math.min(99, scores.speedScore);
    scores.shootingScore = Math.min(99, scores.shootingScore);
    scores.passingScore = Math.min(99, scores.passingScore);
    scores.dribblingScore = Math.min(99, scores.dribblingScore);
    scores.defenseScore = Math.min(99, scores.defenseScore);
    scores.physicalScore = Math.min(99, scores.physicalScore);
    scores.consistencyScore = Math.min(99, scores.consistencyScore);

    const statValues = [
      scores.speedScore,
      scores.shootingScore,
      scores.passingScore,
      scores.dribblingScore,
      scores.defenseScore,
      scores.physicalScore,
      Math.round(scores.consistencyScore * 0.4),
    ];

    const weightedOverall = (
      scores.speedScore * 0.16 +
      scores.shootingScore * 0.18 +
      scores.passingScore * 0.16 +
      scores.dribblingScore * 0.18 +
      scores.defenseScore * 0.16 +
      scores.physicalScore * 0.12 +
      scores.consistencyScore * 0.04
    );

    scores['overallRating'] = Math.round(Math.max(weightedOverall, statValues.reduce((sum, value) => sum + value, 0) / statValues.length));

    return scores;
  }

  private async createGamificationActivityAndPoints(params: {
    studentId: string;
    title: string;
    activityType: StudentActivityType;
    description?: string;
    sourceRefId?: string;
    sourceRefType?: string;
    performanceValue?: number;
    createdBy?: string;
    points: number;
    ruleCode: string;
    reason: string;
  }) {
    const activity = await this.activityRepo.save(this.activityRepo.create({
      student: { id: params.studentId },
      title: params.title,
      activityType: params.activityType,
      description: params.description,
      sourceRefId: params.sourceRefId,
      sourceRefType: params.sourceRefType,
      performanceValue: params.performanceValue,
      createdBy: params.createdBy,
    }));

    await this.pointLedgerRepo.save(this.pointLedgerRepo.create({
      student: { id: params.studentId },
      activity: { id: activity.id },
      points: params.points,
      ruleCode: params.ruleCode,
      reason: params.reason,
      weekKey: this.getCurrentWeekKey(),
      seasonKey: this.getSeasonKey(),
      awardedBy: params.createdBy,
    }));

    return activity;
  }

  private async awardBadge(studentId: string, badgeCode: BadgeCode, title: string, description: string, sourceType?: string, sourceRefId?: string) {
    const existing = await this.badgeRepo.findOne({
      where: {
        student: { id: studentId },
        badgeCode,
      },
    });

    if (existing) {
      return existing;
    }

    const badge = this.badgeRepo.create({
      student: { id: studentId },
      badgeCode,
      title,
      description,
      sourceType,
      sourceRefId,
    });

    return this.badgeRepo.save(badge);
  }

  private resolveGamificationCategory(activityType?: StudentActivityType | null, ruleCode?: string | null): GamificationCategoryKey | null {
    const matchedByActivity = GAMIFICATION_CATEGORY_CONFIG.find((category) =>
      activityType ? category.activityTypes.includes(activityType) : false,
    );

    if (matchedByActivity) {
      return matchedByActivity.key;
    }

    const matchedByRule = GAMIFICATION_CATEGORY_CONFIG.find((category) =>
      ruleCode ? category.ruleCodes?.includes(ruleCode) : false,
    );

    return matchedByRule?.key || null;
  }

  private resolveTier(progressPoints: number, targets: [number, number, number]) {
    if (progressPoints >= targets[2]) return 3;
    if (progressPoints >= targets[1]) return 2;
    if (progressPoints >= targets[0]) return 1;
    return 0;
  }

  private buildBadgeDescription(category: typeof GAMIFICATION_CATEGORY_CONFIG[number], tier: number, progressPoints: number, targetPoints: number) {
    if (tier > 0) {
      return `${category.description} Tier ${tier} unlocked with ${progressPoints} points.`;
    }

    return `${category.description} ${Math.max(targetPoints - progressPoints, 0)} more points to unlock Tier 1.`;
  }

  private async getGamificationProgressSummary(studentId: string): Promise<GamificationProgressSummary> {
    const ledgerEntries = await this.pointLedgerRepo.find({
      where: { student: { id: studentId } },
      relations: ['activity'],
      order: { createdAt: 'DESC' },
    });

    const currentWeekKey = this.getCurrentWeekKey();
    const totalPoints = ledgerEntries.reduce((sum, entry) => sum + Number(entry.points || 0), 0);
    const weeklyPoints = ledgerEntries
      .filter((entry) => entry.weekKey === currentWeekKey)
      .reduce((sum, entry) => sum + Number(entry.points || 0), 0);

    const pointsByCategory = new Map<GamificationCategoryKey, number>();
    for (const category of GAMIFICATION_CATEGORY_CONFIG) {
      pointsByCategory.set(category.key, 0);
    }

    for (const entry of ledgerEntries) {
      const categoryKey = this.resolveGamificationCategory(entry.activity?.activityType, entry.ruleCode);
      if (!categoryKey) {
        continue;
      }

      pointsByCategory.set(categoryKey, (pointsByCategory.get(categoryKey) || 0) + Number(entry.points || 0));
    }

    const existingBadges = await this.badgeRepo.find({
      where: { student: { id: studentId } },
      order: { awardedAt: 'DESC' },
    });

    const categories = GAMIFICATION_CATEGORY_CONFIG.map((category) => {
      const progressPoints = pointsByCategory.get(category.key) || 0;
      const tier = this.resolveTier(progressPoints, category.targetPoints);
      const nextTierIndex = tier <= 0 ? 0 : Math.min(tier, 2);
      const targetPoints = category.targetPoints[nextTierIndex] ?? category.targetPoints[2];
      const unlockedBadge = existingBadges.find((badge) => badge.badgeCode === category.badgeCode);

      return {
        totalPoints: progressPoints,
        badge: {
          categoryKey: category.key,
          badgeCode: category.badgeCode,
          title: category.title,
          description: this.buildBadgeDescription(category, tier, progressPoints, targetPoints),
          tier,
          progressPoints,
          targetPoints,
          unlocked: tier > 0,
          featured: Boolean(category.featured),
          awardedAt: unlockedBadge?.awardedAt,
        },
      } as GamificationCategorySummary;
    });

    const featuredBadge =
      categories.find((entry) => entry.badge.featured && entry.badge.unlocked)?.badge ||
      [...categories]
        .sort((left, right) => {
          if (right.badge.tier !== left.badge.tier) {
            return right.badge.tier - left.badge.tier;
          }

          return right.totalPoints - left.totalPoints;
        })
        .find((entry) => entry.badge.unlocked)?.badge ||
      null;

    return {
      totalPoints,
      weeklyPoints,
      categories,
      featuredBadge,
    };
  }

  private async syncStudentBadges(studentId: string) {
    const progressSummary = await this.getGamificationProgressSummary(studentId);
    const activities = await this.activityRepo.find({
      where: { student: { id: studentId } },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    const latestAssessment = await this.assessmentRepo.findOne({
      where: { student: { id: studentId } },
      order: { assessedAt: 'DESC' },
    });

    const leaderboard = await this.pointLedgerRepo
      .createQueryBuilder('ledger')
      .leftJoin('ledger.student', 'student')
      .select('student.id', 'studentId')
      .addSelect('SUM(ledger.points)', 'weeklyPoints')
      .where('ledger.weekKey = :weekKey', { weekKey: this.getCurrentWeekKey() })
      .andWhere('student.ageClass = (SELECT s."ageClass" FROM "student" s WHERE s.id = :studentId)', { studentId })
      .groupBy('student.id')
      .orderBy('SUM(ledger.points)', 'DESC')
      .getRawMany<{ studentId: string; weeklyPoints: string }>();

    const currentRank = leaderboard.findIndex((entry) => entry.studentId === studentId) + 1 || null;
    const lineupCount = activities.filter((item) => item.activityType === StudentActivityType.LINEUP_SELECTION).length;
    const eventCount = activities.filter((item) => item.activityType === StudentActivityType.EVENT_PARTICIPATION).length;
    const attendanceCount = activities.filter((item) => item.activityType === StudentActivityType.ATTENDANCE).length;

    for (const category of progressSummary.categories) {
      if (!category.badge.unlocked) {
        continue;
      }

      await this.awardBadge(
        studentId,
        category.badge.badgeCode as BadgeCode,
        category.badge.title,
        category.badge.description,
        'gamification-category',
        category.badge.categoryKey,
      );
    }

    if (currentRank === 1) {
      await this.awardBadge(studentId, BadgeCode.TOP_PLAYER, 'Top Player', 'Leading this week leaderboard in your cohort.', 'leaderboard');
    } else if (currentRank && currentRank <= 3) {
      await this.awardBadge(studentId, BadgeCode.TOP_THREE, 'Top 3', 'Currently inside the weekly top 3 of your cohort.', 'leaderboard');
    }

    if (lineupCount > 0) {
      await this.awardBadge(studentId, BadgeCode.LINEUP_PICK, 'Lineup Pick', 'Selected into an event squad by the coach.', 'activity');
    }

    if (eventCount > 0) {
      await this.awardBadge(studentId, BadgeCode.EVENT_READY, 'Event Ready', 'Confirmed as participating in an academy event.', 'activity');
    }

    if (attendanceCount >= 3) {
      await this.awardBadge(studentId, BadgeCode.TRAINING_STREAK, 'Training Streak', 'Consistent attendance recorded in recent sessions.', 'activity');
    }

    if (latestAssessment?.overallRating && latestAssessment.overallRating >= 85) {
      await this.awardBadge(studentId, BadgeCode.ELITE_OVR, 'Elite OVR', 'Reached a strong FUT rating from curriculum assessment.', 'assessment', latestAssessment.id);
    }
  }

  private buildAcceptanceTargets(students: Student[]) {
    const groupedByParent = new Map<
      string,
      {
        parentPhone: string;
        parentFullName: string;
        approvedStudents: Array<{ name: string; className?: string | null }>;
      }
    >();

    for (const student of students) {
      const parent = student.parent;
      const parentUser = parent?.user;
      const parentId = parent?.id;
      const phone = parentUser?.phoneNumber?.trim() || parent?.phoneNumber?.trim();

      if (!parentId || !phone) {
        continue;
      }

      if (!groupedByParent.has(parentId)) {
        groupedByParent.set(parentId, {
          parentPhone: phone,
          parentFullName: parentUser?.fullName || 'Bapak/Ibu',
          approvedStudents: [],
        });
      }

      groupedByParent.get(parentId)?.approvedStudents.push({
        name: student.user?.fullName || 'Siswa',
        className: student.trainingClass?.name || '-',
      });
    }

    return Array.from(groupedByParent.values()).filter(
      (target) => target.approvedStudents.length > 0,
    );
  }

  async createAttendance(dto: CreateAttendanceDto) {
    const { studentId, ...rest } = dto;
    const attendance = this.attendanceRepo.create({
      ...rest,
      student: { id: studentId },
    });
    const savedAttendance = await this.attendanceRepo.save(attendance);

    if (savedAttendance.status === AttendanceStatus.PRESENT) {
      await this.createGamificationActivityAndPoints({
        studentId,
        title: 'Training attendance recorded',
        activityType: StudentActivityType.ATTENDANCE,
        description: 'Student attended scheduled training session.',
        sourceRefId: savedAttendance.id,
        sourceRefType: 'attendance',
        createdBy: 'system-attendance',
        points: 10,
        ruleCode: 'ATTENDANCE_PRESENT',
        reason: 'Attendance +10',
      });
      await this.syncStudentBadges(studentId);
    }

    if (savedAttendance.status === AttendanceStatus.LATE) {
      await this.createGamificationActivityAndPoints({
        studentId,
        title: 'Late attendance recorded',
        activityType: StudentActivityType.PUNCTUALITY,
        description: 'Student attended training but arrived late.',
        sourceRefId: savedAttendance.id,
        sourceRefType: 'attendance',
        createdBy: 'system-attendance',
        points: 5,
        ruleCode: 'ATTENDANCE_LATE',
        reason: 'Attendance with punctuality penalty baseline +5',
      });
      await this.syncStudentBadges(studentId);
    }

    return savedAttendance;
  }

  findAllAttendance() {
    return this.attendanceRepo.find({ relations: ['student'] });
  }

  async getAttendanceSummary(ageClass?: string) {
    const query = this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoin('attendance.student', 'student')
      .leftJoin('student.user', 'user')
      .select('student.id', 'studentId')
      .addSelect('user.fullName', 'fullName')
      .addSelect('student.ageClass', 'ageClass')
      .addSelect("COUNT(attendance.id)", 'totalSessions')
      .addSelect("COUNT(attendance.id) FILTER (WHERE attendance.status = 'PRESENT')", 'presentCount')
      .addSelect("COUNT(attendance.id) FILTER (WHERE attendance.status = 'LATE')", 'lateCount')
      .addSelect("COUNT(attendance.id) FILTER (WHERE attendance.status = 'ABSENT')", 'absentCount')
      .groupBy('student.id')
      .addGroupBy('user.fullName')
      .addGroupBy('student.ageClass')
      .orderBy('user.fullName', 'ASC');

    if (ageClass) {
      query.where('student.ageClass = :ageClass', { ageClass });
    }

    const rows = await query.getRawMany<{
      studentId: string;
      fullName: string;
      ageClass: string;
      totalSessions: string;
      presentCount: string;
      lateCount: string;
      absentCount: string;
    }>();

    return rows.map((row) => {
      const totalSessions = Number(row.totalSessions || 0);
      const presentCount = Number(row.presentCount || 0);
      const lateCount = Number(row.lateCount || 0);
      const absentCount = Number(row.absentCount || 0);

      return {
        studentId: row.studentId,
        fullName: row.fullName,
        ageClass: row.ageClass,
        totalSessions,
        presentCount,
        lateCount,
        absentCount,
        attendanceRate: totalSessions > 0 ? Math.round(((presentCount + lateCount) / totalSessions) * 100) : 0,
      };
    });
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

  async createCurriculumWeekMaterial(data: { monthId: string; weekNumber: number; category: string; materialDescription: string; competencyKey?: string; statDomain?: CurriculumStatDomain; statWeight?: number; curriculumProfiles?: string[] }) {
    const month = await this.curriculumMonthRepo.findOne({ where: { id: data.monthId }, relations: ['level'] });
    const normalized = this.normalizeCurriculumWeekMaterialInput(data, month?.level?.name);
    const material = this.curriculumWeekRepo.create({
      ...normalized,
      month: { id: data.monthId },
    });
    return this.curriculumWeekRepo.save(material);
  }

  async updateCurriculumWeekMaterial(id: string, data: Partial<{ weekNumber: number; category: string; materialDescription: string; competencyKey?: string; statDomain?: CurriculumStatDomain; statWeight?: number; curriculumProfiles?: string[] }>) {
    const existing = await this.curriculumWeekRepo.findOne({ where: { id }, relations: ['month', 'month.level'] });
    if (!existing) {
      throw new Error('Curriculum week material not found');
    }

    const merged = {
      weekNumber: data.weekNumber ?? existing.weekNumber,
      category: data.category ?? existing.category,
      materialDescription: data.materialDescription ?? existing.materialDescription,
      competencyKey: data.competencyKey ?? existing.competencyKey,
      statDomain: data.statDomain ?? existing.statDomain,
      statWeight: data.statWeight ?? Number(existing.statWeight || 1),
      curriculumProfiles: data.curriculumProfiles ?? existing.curriculumProfiles,
    };

    const normalized = this.normalizeCurriculumWeekMaterialInput(merged, existing.month?.level?.name);
    return this.curriculumWeekRepo.update(id, normalized);
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

    // Update User fields (fullName, email, phoneNumber)
    if (fullName || email || phoneNumber) {
      const parent = await this.parentRepo.findOne({
        where: { id },
        relations: ['user'],
      });

      if (parent && parent.user) {
        await this.userRepo.update(parent.user.id, {
          ...(fullName && { fullName }),
          ...(email && { email }),
          ...(phoneNumber && { phoneNumber }),
        });
      }
    }

    // Update Parent fields (phoneNumber, status, etc.)
    const parentUpdateData: any = { ...rest };
  
    if (phoneNumber) {
        parentUpdateData.phoneNumber = phoneNumber;
    }

    if (status) {
        parentUpdateData.status = status;
    }

    delete parentUpdateData.fullName;
    delete parentUpdateData.email;

    if (Object.keys(parentUpdateData).length > 0) {
      return this.parentRepo.update(id, parentUpdateData);
    }

    return { affected: 1 };
  }

  removeParent(id: string) {
    return this.parentRepo.delete(id);
  }

  async createPlayerAssessment(dto: CreatePlayerAssessmentDto) {
    const { studentId, weekMaterialId, score = 1, assessorName, ...rest } = dto;
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    const weekMaterial = await this.curriculumWeekRepo.findOne({ where: { id: weekMaterialId } });

    if (!student) {
      throw new Error('Student not found');
    }

    if (!weekMaterial) {
      throw new Error('Curriculum week material not found');
    }

    if (!weekMaterial.statDomain) {
      weekMaterial.statDomain = this.inferCurriculumStatDomain(weekMaterial.category, weekMaterial.materialDescription);
    }

    const derivedScores = this.deriveAssessmentScores(
      weekMaterial,
      score,
      student.curriculumProfile,
    );

    const assessment = this.assessmentRepo.create({
      ...rest,
      score,
      assessorName,
      ageClass: student.ageClass,
      curriculumProfile: student.curriculumProfile,
      student: { id: studentId },
      weekMaterial: { id: weekMaterialId },
      ...derivedScores,
    });
    const saved = await this.assessmentRepo.save(assessment);

    await this.createGamificationActivityAndPoints({
      studentId,
      title: 'Skill Assessment Completed',
      activityType: StudentActivityType.SKILL_PROGRESS,
      description: `Assessed on ${weekMaterial.category || 'Curriculum Material'}.`,
      sourceRefId: saved.id,
      sourceRefType: 'assessment',
      createdBy: assessorName || 'system',
      points: score >= 4 ? 20 : (score >= 3 ? 15 : 10),
      ruleCode: 'ASSESSMENT_COMPLETED',
      reason: `Coach assessment returned score ${score}/5`,
    });

    await this.syncStudentBadges(studentId);
    return saved;
  }

  findAllPlayerAssessment() {
    return this.assessmentRepo.find({ relations: ['student', 'student.user', 'weekMaterial'] });
  }

  findOnePlayerAssessment(id: string) {
    return this.assessmentRepo.findOne({ where: { id }, relations: ['student', 'student.user', 'weekMaterial'] });
  }

  async updatePlayerAssessment(id: string, dto: UpdatePlayerAssessmentDto) {
    if (dto.score !== undefined) {
      const existing = await this.assessmentRepo.findOne({
        where: { id },
        relations: ['weekMaterial', 'student'],
      });
      if (existing?.weekMaterial && existing?.student) {
        const material = existing.weekMaterial;
        if (!material.statDomain) {
          material.statDomain = this.inferCurriculumStatDomain(material.category, material.materialDescription);
        }
        const derivedScores = this.deriveAssessmentScores(material, dto.score, existing.student.curriculumProfile);
        return this.assessmentRepo.update(id, { ...dto, ...derivedScores });
      }
    }
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
      ageClass: dto.ageClass,
      curriculumProfile: dto.curriculumProfile,
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

  async createStudentActivity(dto: CreateStudentActivityDto) {
    const { studentId, ...rest } = dto;
    const activity = this.activityRepo.create({
      ...rest,
      student: { id: studentId },
    });
    const saved = await this.activityRepo.save(activity);
    await this.syncStudentBadges(studentId);
    return saved;
  }

  private isCoachGamificationActivityType(activityType: StudentActivityType) {
    return activityType in COACH_GAMIFICATION_ACTIVITY_PRESETS;
  }

  findAllStudentActivity(studentId?: string) {
    return this.activityRepo.find({
      where: studentId ? { student: { id: studentId } } : {},
      relations: ['student', 'student.user'],
      order: { createdAt: 'DESC' },
    }).then((activities) => activities.filter((activity) => this.isCoachGamificationActivityType(activity.activityType)));
  }

  private async syncLinkedActivityLedgers(activity: StudentActivity) {
    if (!this.isCoachGamificationActivityType(activity.activityType)) {
      return;
    }

    const preset = COACH_GAMIFICATION_ACTIVITY_PRESETS[activity.activityType];
    await this.pointLedgerRepo.update(
      { activity: { id: activity.id } },
      {
        points: preset.points,
        ruleCode: preset.ruleCode,
        reason: preset.reason,
      },
    );
  }

  private resolveUpdatedActivityTitle(activity: StudentActivity, dto: UpdateStudentActivityDto) {
    if (dto.title !== undefined) {
      return dto.title;
    }

    if (dto.activityType && this.isCoachGamificationActivityType(dto.activityType)) {
      return COACH_GAMIFICATION_ACTIVITY_PRESETS[dto.activityType].title;
    }

    return activity.title;
  }

  async updateStudentActivity(id: string, dto: UpdateStudentActivityDto) {
    const activity = await this.activityRepo.findOne({
      where: { id },
      relations: ['student'],
    });

    if (!activity) {
      throw new Error('Student activity not found');
    }

    if (dto.activityType !== undefined) {
      activity.activityType = dto.activityType;
    }

    activity.title = this.resolveUpdatedActivityTitle(activity, dto);

    if (dto.description !== undefined) {
      activity.description = dto.description;
    }

    const saved = await this.activityRepo.save(activity);
    await this.syncLinkedActivityLedgers(saved);
    await this.syncStudentBadges(activity.student.id);
    return saved;
  }

  async removeStudentActivity(id: string) {
    const activity = await this.activityRepo.findOne({
      where: { id },
      relations: ['student'],
    });

    if (!activity) {
      throw new Error('Student activity not found');
    }

    await this.pointLedgerRepo.delete({ activity: { id } });
    await this.activityRepo.delete(id);
    await this.syncStudentBadges(activity.student.id);

    return { success: true };
  }

  async awardGamificationPoints(dto: AwardPointsDto) {
    const ledger = this.pointLedgerRepo.create({
      points: dto.points,
      ruleCode: dto.ruleCode,
      reason: dto.reason,
      weekKey: this.getCurrentWeekKey(),
      seasonKey: this.getSeasonKey(),
      awardedBy: dto.awardedBy,
      student: { id: dto.studentId },
      activity: dto.activityId ? { id: dto.activityId } : undefined,
    });
    const saved = await this.pointLedgerRepo.save(ledger);
    await this.syncStudentBadges(dto.studentId);
    return saved;
  }

  findStudentBadges(studentId?: string) {
    return this.badgeRepo.find({
      where: studentId ? { student: { id: studentId } } : {},
      relations: ['student'],
      order: { awardedAt: 'DESC' },
    });
  }

  async getWeeklyLeaderboard(ageClass?: string) {
    const weekKey = this.getCurrentWeekKey();
    const query = this.pointLedgerRepo
      .createQueryBuilder('ledger')
      .leftJoin('ledger.student', 'student')
      .leftJoin('student.user', 'user')
      .select('student.id', 'studentId')
      .addSelect('user.fullName', 'fullName')
      .addSelect('student.ageClass', 'ageClass')
      .addSelect('student.curriculumProfile', 'curriculumProfile')
      .addSelect('SUM(ledger.points)', 'weeklyPoints')
      .where('ledger.weekKey = :weekKey', { weekKey })
      .groupBy('student.id')
      .addGroupBy('user.fullName')
      .addGroupBy('student.ageClass')
      .addGroupBy('student.curriculumProfile')
      .orderBy('SUM(ledger.points)', 'DESC');

    if (ageClass) {
      query.andWhere('student.ageClass = :ageClass', { ageClass });
    }

    const leaderboard = await query.getRawMany<{
      studentId: string;
      fullName: string;
      ageClass: string;
      curriculumProfile: string;
      weeklyPoints: string;
    }>();

    const results: any[] = [];
    for (const entry of leaderboard) {
      const assessments = await this.assessmentRepo.find({
        where: { student: { id: entry.studentId } },
        order: { assessedAt: 'DESC' },
      });
      
      const aggregated = this.aggregateAssessments(assessments);
      
      results.push({
        ...entry,
        weeklyPoints: Number(entry.weeklyPoints),
        overallRating: aggregated?.overallRating || 0,
        speedScore: aggregated?.speedScore || 0,
        shootingScore: aggregated?.shootingScore || 0,
        passingScore: aggregated?.passingScore || 0,
        dribblingScore: aggregated?.dribblingScore || 0,
        defenseScore: aggregated?.defenseScore || 0,
        physicalScore: aggregated?.physicalScore || 0,
      });
    }

    return results;
  }

  private aggregateAssessments(assessments: PlayerAssessment[]) {
    if (!assessments || assessments.length === 0) return null;

    const aggregated = { ...assessments[0] };
    
    aggregated.speedScore = Math.max(...assessments.map(a => a.speedScore || 0));
    aggregated.shootingScore = Math.max(...assessments.map(a => a.shootingScore || 0));
    aggregated.passingScore = Math.max(...assessments.map(a => a.passingScore || 0));
    aggregated.dribblingScore = Math.max(...assessments.map(a => a.dribblingScore || 0));
    aggregated.defenseScore = Math.max(...assessments.map(a => a.defenseScore || 0));
    aggregated.physicalScore = Math.max(...assessments.map(a => a.physicalScore || 0));
    aggregated.consistencyScore = Math.max(...assessments.map(a => a.consistencyScore || 0));

    const statValues = [
      aggregated.speedScore,
      aggregated.shootingScore,
      aggregated.passingScore,
      aggregated.dribblingScore,
      aggregated.defenseScore,
      aggregated.physicalScore,
      Math.round(aggregated.consistencyScore * 0.4),
    ];

    const weightedOverall = (
      aggregated.speedScore * 0.16 +
      aggregated.shootingScore * 0.18 +
      aggregated.passingScore * 0.16 +
      aggregated.dribblingScore * 0.18 +
      aggregated.defenseScore * 0.16 +
      aggregated.physicalScore * 0.12 +
      aggregated.consistencyScore * 0.04
    );

    aggregated.overallRating = Math.round(
      Math.max(weightedOverall, statValues.reduce((sum, value) => sum + value, 0) / statValues.length)
    );

    const statsMap: Record<string, number> = {
      SPEED: aggregated.speedScore,
      SHOOTING: aggregated.shootingScore,
      PASSING: aggregated.passingScore,
      DRIBBLING: aggregated.dribblingScore,
      DEFENSE: aggregated.defenseScore,
      PHYSICAL: aggregated.physicalScore,
    };

    let domStat = 'CHARACTER';
    let maxVal = -1;
    for (const [key, val] of Object.entries(statsMap)) {
      if (val > maxVal) {
        maxVal = val;
        domStat = key;
      }
    }
    aggregated.dominantStat = domStat;

    return aggregated;
  }

  async getStudentPerformanceSummaryByUserId(userId: string) {
    const student = await this.studentRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'parent', 'parent.user'],
    });

    if (!student) {
      throw new Error('Student profile not found');
    }

    const assessments = await this.assessmentRepo.find({
      where: { student: { id: student.id } },
      relations: ['student', 'student.user', 'weekMaterial'],
      order: { assessedAt: 'DESC' },
    });

    const activities = await this.activityRepo.find({
      where: { student: { id: student.id } },
      relations: ['student', 'student.user'],
      order: { createdAt: 'DESC' },
      take: 20,
    });

    const leaderboard = await this.getWeeklyLeaderboard(student.ageClass);
    const currentRank = leaderboard.findIndex((entry) => entry.studentId === student.id) + 1 || null;
    const gamification = await this.getGamificationProgressSummary(student.id);

    return {
      student,
      latestAssessment: this.aggregateAssessments(assessments),
      assessments,
      recentActivities: activities,
      badges: gamification.categories.map((entry) => entry.badge),
      gamification,
      leaderboard: {
        ageClass: student.ageClass,
        currentRank,
        weeklyPoints: gamification.weeklyPoints,
        totalPlayers: leaderboard.length,
      },
    };
  }

  async getParentChildrenPerformanceSummaryByUserId(userId: string) {
    const parent = await this.parentRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'students', 'students.user'],
    });

    if (!parent) {
      throw new Error('Parent profile not found');
    }

    const children = await Promise.all(
      (parent.students || []).map(async (student) => {
        const assessments = await this.assessmentRepo.find({
          where: { student: { id: student.id } },
          relations: ['student', 'student.user', 'weekMaterial'],
          order: { assessedAt: 'DESC' },
          take: 8,
        });

        const leaderboard = await this.getWeeklyLeaderboard(student.ageClass);
        const currentRank = leaderboard.findIndex((entry) => entry.studentId === student.id) + 1 || null;
        const gamification = await this.getGamificationProgressSummary(student.id);

        return {
          student,
          latestAssessment: this.aggregateAssessments(assessments),
          assessments,
          badges: gamification.categories.map((entry) => entry.badge),
          gamification,
          leaderboard: {
            ageClass: student.ageClass,
            currentRank,
            weeklyPoints: gamification.weeklyPoints,
            totalPlayers: leaderboard.length,
          },
        };
      }),
    );

    return {
      parent,
      children,
    };
  }

  async findAllStudent(page = 1, limit = 10, search = '', applicationOrder: 'ASC' | 'DESC' = 'DESC') {
    const query = this.studentRepo.createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('student.parent', 'parent')
      .leftJoinAndSelect('parent.user', 'parentUser')
      .leftJoinAndSelect('student.trainingClass', 'trainingClass');

    const normalizedOrder = applicationOrder === 'ASC' ? 'ASC' : 'DESC';

    if (search) {
      query.where(
        'user.fullName ILIKE :search OR user.email ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .clone()
      .orderBy('user.createdAt', normalizedOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const rawStats = await query
      .clone()
      .select('COUNT(student.id)', 'total')
      .addSelect("COUNT(student.id) FILTER (WHERE user.status = :pendingStatus)", 'pending')
      .addSelect("COUNT(student.id) FILTER (WHERE user.status = :activeStatus)", 'active')
      .setParameters({
        pendingStatus: 'Pending',
        activeStatus: 'Active',
      })
      .getRawOne<{ total: string; pending: string; active: string }>();

    const mappedData = data.map(student => ({
      ...student,
      parentName: student.parent?.user?.fullName || '-',
    }));

    return {
      data: mappedData,
      total,
      page,
      limit,
      stats: {
        total: Number(rawStats?.total ?? total),
        pending: Number(rawStats?.pending ?? 0),
        active: Number(rawStats?.active ?? 0),
      },
    };
  }

  async bulkApprovePendingStudents(search = '') {
    const query = this.studentRepo.createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('student.parent', 'parent')
      .leftJoinAndSelect('parent.user', 'parentUser')
      .leftJoinAndSelect('student.trainingClass', 'trainingClass')
      .where('user.status = :pendingStatus', { pendingStatus: 'Pending' });

    if (search) {
      query.andWhere(
        '(user.fullName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const pendingStudents = await query.getMany();

    if (pendingStudents.length === 0) {
      return { updated: 0 };
    }

    const studentUserIds = pendingStudents.map(student => student.user?.id).filter(Boolean);
    const parentUserIds = [...new Set(
      pendingStudents
        .map(student => student.parent?.user?.id)
        .filter(Boolean)
    )];

    if (studentUserIds.length > 0) {
      await this.userRepo.createQueryBuilder()
        .update(User)
        .set({ status: 'Active' })
        .where('id IN (:...ids)', { ids: studentUserIds })
        .execute();
    }

    if (parentUserIds.length > 0) {
      await this.userRepo.createQueryBuilder()
        .update(User)
        .set({ status: 'Active' })
        .where('id IN (:...ids)', { ids: parentUserIds })
        .execute();
    }

    const acceptanceTargets = this.buildAcceptanceTargets(pendingStudents);
    if (acceptanceTargets.length > 0) {
      await this.notificationService.sendAcceptanceMessages(acceptanceTargets);
    }

    return { updated: pendingStudents.length };
  }

  findOneStudent(id: string) {
    return this.studentRepo.findOne({
      where: { id },
      relations: ['user', 'parent', 'trainingClass'],
    });
  }

  async updateStudent(id: string, dto: UpdateStudentDto & { fullName?: string; email?: string; status?: string }) {
    const { parentId, trainingClassId, fullName, email, status, ...rest } = dto;
    let pendingToActiveStudent: Student | null = null;

    if (fullName || email || status) {
      const student = await this.studentRepo.findOne({
        where: { id },
        relations: ['user', 'parent', 'parent.user', 'trainingClass'],
      });

      if (student && student.user) {
        const isPendingToActive =
          status?.toLowerCase() === 'active' &&
          student.user.status?.toLowerCase() === 'pending';

        await this.userRepo.update(student.user.id, {
          ...(fullName && { fullName }),
          ...(email && { email }),
          ...(status && { status }),
        });

        if (status?.toLowerCase() === 'active' && student.parent?.user) {
          await this.userRepo.update(student.parent.user.id, { status: 'Active' });
        }

        if (isPendingToActive) {
          pendingToActiveStudent = student;
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
      const result = await this.studentRepo.update(id, updateData);

      if (pendingToActiveStudent) {
        const acceptanceTargets = this.buildAcceptanceTargets([pendingToActiveStudent]);
        if (acceptanceTargets.length > 0) {
          await this.notificationService.sendAcceptanceMessages(acceptanceTargets);
        }
      }

      return result;
    }

    if (pendingToActiveStudent) {
      const acceptanceTargets = this.buildAcceptanceTargets([pendingToActiveStudent]);
      if (acceptanceTargets.length > 0) {
        await this.notificationService.sendAcceptanceMessages(acceptanceTargets);
      }
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
