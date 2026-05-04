export interface WeekMaterial {
  id: string;
  weekNumber: number;
  category: string;
  materialDescription: string;
  competencyKey?: string;
  statDomain?: string;
  statWeight?: number;
  curriculumProfiles?: string[];
}

export interface Month {
  id: string;
  monthNumber: number;
  title: string;
  weekMaterials: WeekMaterial[];
}

export interface Level {
  id: string;
  name: string;
  description: string;
  colorCode: string;
  months: Month[];
}
