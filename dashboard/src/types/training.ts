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

export interface TrainingClass {
  id: string;
  name: string;
  schedule?: string;
  ageClass?: string;
  coach?: {
    id: string;
    fullName: string;
    email: string;
  };
  curriculumLevel?: {
    id: string;
    name: string;
    description?: string;
    colorCode?: string;
    months?: Array<{
      id: string;
      monthNumber: number;
      title: string;
      weekMaterials?: WeekMaterial[];
    }>;
  };
  activeMonth?: {
    id: string;
    monthNumber: number;
    title: string;
  };
  students?: Array<{
    id: string;
    user?: {
      id: string;
      fullName: string;
    };
    ageClass?: string;
  }>;
}

export interface StudentTrainingClassView {
  student: {
    id: string;
    fullName?: string;
    ageClass?: string;
  };
  trainingClass?: TrainingClass;
}
