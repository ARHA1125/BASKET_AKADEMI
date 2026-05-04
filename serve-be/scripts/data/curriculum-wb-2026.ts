type ActiveMonthWeeks = {
  month: number;
  weeks: number[];
};

type CurriculumScheduleItem = {
  category: string;
  material: string;
  competencyKey?: string;
  activeWeeks: ActiveMonthWeeks[];
};

type CurriculumLevelSeed = {
  name: string;
  description: string;
  colorCode: string;
  curriculumProfiles: string[];
  schedule: CurriculumScheduleItem[];
};

type CatalogSection = {
  category: string;
  materials: string[];
};

type CurriculumMatrix = Record<string, Record<string, ActiveMonthWeeks[]>>;

const weeks = (...weekNumbers: number[]) => weekNumbers;

const schedule = (
  ...entries: Array<[number, number[]]>
): ActiveMonthWeeks[] =>
  entries.map(([month, monthWeeks]) => ({ month, weeks: monthWeeks }));

const catalog: CatalogSection[] = [
  {
    category: 'Dasar Body Control',
    materials: [
      'Stance (Cara berdiri)',
      'Start (Mulai bergerak)',
      'Step (Langkah pergerakan kaki)',
      'Turn (Berputar)',
      'Stop (Berhenti)',
      'Jump (Jump)',
    ],
  },
  {
    category: 'Moving Without the Ball',
    materials: [
      'V cut',
      'L cut',
      'Back cut',
      'Breakaway',
      'Rear cut',
      'Front cut',
      'Decoy moves',
      'Shot moves',
      'Assigned moves',
      'Change of pace',
      'Change of direction',
    ],
  },
  {
    category: 'Ballhandling',
    materials: [
      'Around the waist',
      'Around the head',
      'Double leg-single leg',
      'Around the head, waist and leg',
      'Figure eight from the back',
      'Figure eight from the front',
      'Rhythm',
      'Figure eight with one bounce',
      'One hand around the leg with one bounce',
      'Figure eight speed dribble',
      'Blurr',
      'Front and rear crossover',
      'Big hole 1',
      'Big hole 2',
    ],
  },
  {
    category: 'Passing & Catching',
    materials: [
      'Chest Pass',
      'Bounce Pass',
      'Overhead Pass',
      'Baseball Pass',
      'One-hand push/Shoulder Pass',
      'Handoff Pass',
      'Hook Pass',
      'Behind the back Pass',
      'Under Hand Pass',
      'Two Hands Up',
      'Two Hands Down',
      'Block and Tuck',
      'One Two step',
      'Jump stop',
    ],
  },
  {
    category: 'Dribbling',
    materials: [
      'Low Dribble',
      'Power Dribble',
      'Speed Dribble',
      'Change of Pace Dribble',
      'Crossover Dribble',
      'Head and Shoulders move',
      'Head and Shoulders Crossover Drobble',
      'Reverse/Spin Dribble',
      'Back Dribble',
      'Behind the Back Dribble',
      'Between the Legs Dribble',
    ],
  },
  {
    category: 'Shooting',
    materials: [
      'BEEF (Triple Threat)',
      'Layup Shot',
      'One Hand set Shot',
      'One Hand Jump Shot',
      'Free Throw Shot',
      'Three Point Shot',
      'Hook Shot',
    ],
  },
  {
    category: 'Rebounding',
    materials: ['Offensive Rebound', 'Defensive Rebound', 'Block Out'],
  },
  {
    category: 'Man to Man Defense',
    materials: [
      'Footwork (Dasar)',
      'Ball Pressure',
      'Positioning (Strong side & Weak Side)',
      'Prevention of Penetration',
      'Line of the ball (Ball level)',
      'Passing line',
      'Distance',
      'Defense on the ball',
      'Defense off the ball',
      'Triangle Defense (Pistol Stance)',
      'Denial (Close Stance)',
      'Post defense (Fronting, Push Up/Down)',
      'On ball to off ball defense',
      'Off ball to on ball defense',
      'Fight Through',
      'Slide Through',
      'Open up',
      'Switch',
      'Help & recover',
      'Bump',
      'Trap/Doeble team',
      'Rotasi',
    ],
  },
  {
    category: 'Fast Break',
    materials: [
      'Cara lari',
      'Outlet Pass',
      'Tiga jalur',
      'Area Awal (Starting)',
      'Area Penyambung (Passing)',
      'Area Penyelesaian (Scoring)',
    ],
  },
  {
    category: 'Unit Offense',
    materials: [
      'Basic Screen',
      'Pick & Roll',
      'Pick & Pop Out',
      'Down Screen',
      'Back Screen',
      'Cross Screen',
      'Curl',
      'Double Screen',
      'Multiple Screen',
      'Screen to Screener',
    ],
  },
  {
    category: 'Karakter',
    materials: ['Kelas'],
  },
];

const setCategory = (
  matrix: CurriculumMatrix,
  category: string,
  schedule: ActiveMonthWeeks[],
) => {
  const section = catalog.find((item) => item.category === category);

  if (!section) {
    throw new Error(`Unknown curriculum category: ${category}`);
  }

  matrix[category] = Object.fromEntries(
    section.materials.map((material) => [material, schedule]),
  );
};

const buildSchedule = (matrix: CurriculumMatrix): CurriculumScheduleItem[] =>
  catalog.flatMap(({ category, materials }) => {
    const categoryMatrix = matrix[category] ?? {};

    return materials.flatMap((material) => {
      const activeWeeks = categoryMatrix[material] ?? [];

      if (activeWeeks.length === 0) {
        return [];
      }

      return {
        category,
        material,
        activeWeeks,
      } satisfies CurriculumScheduleItem;
    });
  });

const assertCatalogCoverage = (matrix: CurriculumMatrix, levelName: string) => {
  for (const section of catalog) {
    const mappedMaterials = matrix[section.category];

    if (!mappedMaterials) {
      throw new Error(
        `Missing curriculum category mapping for ${levelName}: ${section.category}`,
      );
    }

    for (const material of section.materials) {
      if (!(material in mappedMaterials)) {
        throw new Error(
          `Missing curriculum material mapping for ${levelName}: ${section.category} -> ${material}`,
        );
      }
    }
  }
};

const fundamentalMatrix: CurriculumMatrix = {};
setCategory(
  fundamentalMatrix,
  'Dasar Body Control',
  schedule([1, weeks(1, 2, 3, 4)]),
);
setCategory(
  fundamentalMatrix,
  'Moving Without the Ball',
  schedule([2, weeks(1, 2, 3, 4)], [3, weeks(1, 2)]),
);
setCategory(
  fundamentalMatrix,
  'Ballhandling',
  schedule([3, weeks(1, 2, 3, 4)], [4, weeks(1, 2)]),
);
setCategory(
  fundamentalMatrix,
  'Passing & Catching',
  schedule([3, weeks(3, 4)], [4, weeks(1, 2, 3, 4)]),
);
setCategory(
  fundamentalMatrix,
  'Dribbling',
  schedule([4, weeks(1, 2, 3, 4)], [5, weeks(1, 2)]),
);
setCategory(
  fundamentalMatrix,
  'Shooting',
  schedule([5, weeks(1, 2, 3, 4)], [6, weeks(1, 2)]),
);
setCategory(
  fundamentalMatrix,
  'Rebounding',
  schedule([5, weeks(3, 4)], [6, weeks(1, 2)]),
);
setCategory(
  fundamentalMatrix,
  'Man to Man Defense',
  schedule([5, weeks(1, 2, 3, 4)], [6, weeks(1, 2, 3, 4)]),
);
setCategory(
  fundamentalMatrix,
  'Fast Break',
  schedule([6, weeks(1, 2, 3)]),
);
setCategory(
  fundamentalMatrix,
  'Unit Offense',
  schedule([6, weeks(2, 3, 4)]),
);
setCategory(
  fundamentalMatrix,
  'Karakter',
  schedule(
    [1, weeks(1)],
    [2, weeks(1)],
    [3, weeks(1)],
    [4, weeks(1)],
    [5, weeks(1)],
    [6, weeks(1)],
  ),
);

const intermediateMatrix: CurriculumMatrix = {};
setCategory(
  intermediateMatrix,
  'Dasar Body Control',
  schedule([1, weeks(1, 2, 3, 4)]),
);
setCategory(
  intermediateMatrix,
  'Moving Without the Ball',
  schedule([1, weeks(2, 3, 4)], [2, weeks(1, 2)]),
);
setCategory(
  intermediateMatrix,
  'Ballhandling',
  schedule([2, weeks(1, 2, 3, 4)], [3, weeks(1, 2)]),
);
setCategory(
  intermediateMatrix,
  'Passing & Catching',
  schedule([2, weeks(3, 4)], [3, weeks(1, 2, 3)]),
);
setCategory(
  intermediateMatrix,
  'Dribbling',
  schedule([3, weeks(1, 2, 3, 4)], [4, weeks(1)]),
);
setCategory(
  intermediateMatrix,
  'Shooting',
  schedule([4, weeks(1, 2, 3, 4)]),
);
setCategory(
  intermediateMatrix,
  'Rebounding',
  schedule([4, weeks(3, 4)], [5, weeks(1)]),
);
setCategory(
  intermediateMatrix,
  'Man to Man Defense',
  schedule([4, weeks(1, 2, 3, 4)], [5, weeks(1, 2, 3, 4)]),
);
setCategory(
  intermediateMatrix,
  'Fast Break',
  schedule([5, weeks(2, 3, 4)]),
);
setCategory(
  intermediateMatrix,
  'Unit Offense',
  schedule([6, weeks(1, 2, 3, 4)]),
);
setCategory(
  intermediateMatrix,
  'Karakter',
  schedule(
    [1, weeks(1, 3)],
    [2, weeks(1, 3)],
    [3, weeks(1, 3)],
    [4, weeks(1, 3)],
    [5, weeks(1, 3)],
    [6, weeks(1, 3)],
  ),
);

const advancedMatrix: CurriculumMatrix = {};
setCategory(
  advancedMatrix,
  'Dasar Body Control',
  schedule([1, weeks(1, 2)]),
);
setCategory(
  advancedMatrix,
  'Moving Without the Ball',
  schedule([1, weeks(3, 4)], [2, weeks(1, 2, 3)]),
);
setCategory(
  advancedMatrix,
  'Ballhandling',
  schedule([2, weeks(1, 2, 3, 4)]),
);
setCategory(
  advancedMatrix,
  'Passing & Catching',
  schedule([2, weeks(3, 4)], [3, weeks(1, 2, 3)]),
);
setCategory(
  advancedMatrix,
  'Dribbling',
  schedule([3, weeks(1, 2, 3, 4)]),
);
setCategory(
  advancedMatrix,
  'Shooting',
  schedule([3, weeks(3, 4)], [4, weeks(1, 2, 3, 4)]),
);
setCategory(
  advancedMatrix,
  'Rebounding',
  schedule([4, weeks(3, 4)]),
);
setCategory(
  advancedMatrix,
  'Man to Man Defense',
  schedule([4, weeks(1, 2, 3, 4)], [5, weeks(1, 2, 3, 4)]),
);
setCategory(
  advancedMatrix,
  'Fast Break',
  schedule([5, weeks(2, 3, 4)]),
);
setCategory(
  advancedMatrix,
  'Unit Offense',
  schedule([5, weeks(4)], [6, weeks(1, 2, 3, 4)]),
);
setCategory(
  advancedMatrix,
  'Karakter',
  schedule(
    [1, weeks(2, 4)],
    [2, weeks(2, 4)],
    [3, weeks(2, 4)],
    [4, weeks(2, 4)],
    [5, weeks(2, 4)],
    [6, weeks(2, 4)],
  ),
);

assertCatalogCoverage(fundamentalMatrix, 'Fundamental');
assertCatalogCoverage(intermediateMatrix, 'Intermediate');
assertCatalogCoverage(advancedMatrix, 'Advanced');

export const wbCurriculum2026: CurriculumLevelSeed[] = [
  {
    name: 'Fundamental',
    description:
      'Semester I (Satu) untuk jalur Fundamental. KU-10 menempuh 6 bulan pada fase ini sebelum lanjut ke tahap berikutnya.',
    colorCode: '#20B8F2',
    curriculumProfiles: ['KU-10', 'KU-12'],
    schedule: buildSchedule(fundamentalMatrix),
  },
  {
    name: 'Intermediate',
    description:
      'Semester II (Dua) untuk jalur Intermediate. KU-14 menempuh 6 bulan pada fase ini.',
    colorCode: '#F5E327',
    curriculumProfiles: ['KU-14'],
    schedule: buildSchedule(intermediateMatrix),
  },
  {
    name: 'Advanced',
    description:
      'Semester III (Tiga) untuk jalur Advanced. KU-17 menempuh 6 bulan pada fase ini.',
    colorCode: '#8BCF4A',
    curriculumProfiles: ['KU-17'],
    schedule: buildSchedule(advancedMatrix),
  },
];

export type { CurriculumLevelSeed, CurriculumScheduleItem, ActiveMonthWeeks };
