import 'reflect-metadata';
import { AppDataSource } from '../src/data-source';
import { CurriculumLevel } from '../src/academic-module/entities/curriculum-level.entity';
import { CurriculumMonth } from '../src/academic-module/entities/curriculum-month.entity';
import {
  CurriculumStatDomain,
  CurriculumWeekMaterial,
} from '../src/academic-module/entities/curriculum-week-material.entity';
import {
  wbCurriculum2026,
  type CurriculumScheduleItem,
} from './data/curriculum-wb-2026';

const monthTitles: Record<number, string> = {
  1: 'Bulan Pertama',
  2: 'Bulan Kedua',
  3: 'Bulan Ketiga',
  4: 'Bulan Keempat',
  5: 'Bulan Kelima',
  6: 'Bulan Keenam',
};

const inferStatDomain = (
  category: string,
  material: string,
): CurriculumStatDomain | null => {
  const normalizedCategory = category.toLowerCase();
  const normalizedMaterial = material.toLowerCase();

  if (normalizedCategory.includes('shoot')) {
    return CurriculumStatDomain.SHOOTING;
  }

  if (normalizedCategory.includes('pass')) {
    return CurriculumStatDomain.PASSING;
  }

  if (
    normalizedCategory.includes('dribbl') ||
    normalizedCategory.includes('ballhandl')
  ) {
    return CurriculumStatDomain.DRIBBLING;
  }

  if (
    normalizedCategory.includes('defense') ||
    normalizedMaterial.includes('defense') ||
    normalizedMaterial.includes('switch') ||
    normalizedMaterial.includes('trap') ||
    normalizedMaterial.includes('recover')
  ) {
    return CurriculumStatDomain.DEFENSE;
  }

  if (
    normalizedCategory.includes('fast break') ||
    normalizedMaterial.includes('speed') ||
    normalizedMaterial.includes('pace') ||
    normalizedMaterial.includes('lari')
  ) {
    return CurriculumStatDomain.SPEED;
  }

  if (
    normalizedCategory.includes('body control') ||
    normalizedMaterial.includes('jump') ||
    normalizedMaterial.includes('stance')
  ) {
    return CurriculumStatDomain.PHYSICAL;
  }

  if (normalizedCategory.includes('karakter') || normalizedMaterial.includes('kelas')) {
    return CurriculumStatDomain.CHARACTER;
  }

  return null;
};

const buildCompetencyKey = (category: string, material: string): string =>
  `${category}:${material}`
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

async function upsertWeekMaterial(
  month: CurriculumMonth,
  item: CurriculumScheduleItem,
  weekNumber: number,
  curriculumProfiles: string[],
) {
  const weekRepository = AppDataSource.getRepository(CurriculumWeekMaterial);
  const existing = await weekRepository.findOne({
    where: {
      month: { id: month.id },
      weekNumber,
      category: item.category,
      materialDescription: item.material,
    },
    relations: ['month'],
  });

  const statDomain = inferStatDomain(item.category, item.material) ?? undefined;

  const payload = {
    month,
    weekNumber,
    category: item.category,
    materialDescription: item.material,
    competencyKey: buildCompetencyKey(item.category, item.material),
    statDomain,
    statWeight: 1,
    curriculumProfiles,
  };

  if (existing) {
    weekRepository.merge(existing, payload);
    await weekRepository.save(existing);
    return 'updated';
  }

  await weekRepository.save(weekRepository.create(payload));
  return 'created';
}

async function seed() {
  await AppDataSource.initialize();

  const levelRepository = AppDataSource.getRepository(CurriculumLevel);
  const monthRepository = AppDataSource.getRepository(CurriculumMonth);

  let created = 0;
  let updated = 0;

  for (const levelSeed of wbCurriculum2026) {
    let level = await levelRepository.findOne({
      where: { name: levelSeed.name },
    });

    if (!level) {
      level = await levelRepository.save(
        levelRepository.create({
          name: levelSeed.name,
          description: levelSeed.description,
          colorCode: levelSeed.colorCode,
        }),
      );
      created += 1;
    } else {
      levelRepository.merge(level, {
        description: levelSeed.description,
        colorCode: levelSeed.colorCode,
      });
      await levelRepository.save(level);
      updated += 1;
    }

    for (let monthNumber = 1; monthNumber <= 6; monthNumber += 1) {
      let month = await monthRepository.findOne({
        where: {
          level: { id: level.id },
          monthNumber,
        },
        relations: ['level'],
      });

      const title = monthTitles[monthNumber] ?? `Bulan ${monthNumber}`;

      if (!month) {
        month = await monthRepository.save(
          monthRepository.create({
            level,
            monthNumber,
            title,
          }),
        );
        created += 1;
      } else {
        monthRepository.merge(month, { title });
        await monthRepository.save(month);
        updated += 1;
      }
    }

    const months = await monthRepository.find({
      where: { level: { id: level.id } },
      relations: ['level'],
    });

    const monthMap = new Map(months.map((month) => [month.monthNumber, month]));

    for (const item of levelSeed.schedule) {
      for (const activeMonth of item.activeWeeks) {
        const month = monthMap.get(activeMonth.month);

        if (!month) {
          throw new Error(
            `Missing month ${activeMonth.month} for level ${levelSeed.name}`,
          );
        }

        for (const weekNumber of activeMonth.weeks) {
          const result = await upsertWeekMaterial(
            month,
            item,
            weekNumber,
            levelSeed.curriculumProfiles,
          );

          if (result === 'created') {
            created += 1;
          } else {
            updated += 1;
          }
        }
      }
    }
  }

  console.log(
    `WB curriculum seeding finished. Created: ${created}, Updated: ${updated}`,
  );
}

seed()
  .catch((error) => {
    console.error('Failed to seed WB curriculum:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });
