export interface UserProfile {
    fullName: string;
    email: string;
    phoneNumber?: string;
    status?: string; 
    createdAt?: string;
}

export interface Student {
    id: string;
    user: UserProfile;
    birthDate?: string;
    height: number;
    weight: number;
    position: string;
    ageClass?: 'KU-10' | 'KU-12' | 'KU-14' | 'KU-17';
    curriculumProfile?: 'KU-10' | 'KU-12' | 'KU-14' | 'KU-17';
    parent?: {
        id: string;
        user: UserProfile;
    };
    parentName?: string; 
}

export interface StudentActivity {
    id: string;
    title: string;
    description?: string;
    activityType: string;
    performanceValue?: number;
    createdBy?: string;
    createdAt: string;
    student: Student;
}

export interface PlayerAssessment {
    id: string;
    score: number;
    status: string;
    assessorName?: string;
    curriculumProfile?: string;
    ageClass?: string;
    dominantStat?: string;
    speedScore: number;
    shootingScore: number;
    passingScore: number;
    dribblingScore: number;
    defenseScore: number;
    physicalScore: number;
    consistencyScore: number;
    overallRating: number;
    coachNote?: string;
    assessedAt: string;
    weekMaterial?: {
        id: string;
        category: string;
        materialDescription: string;
        competencyKey?: string;
        statDomain?: string;
    };
    student: Student;
}

export interface Parent {
    id: string;
    user: UserProfile;
    studentsCount: number;
    status: string; // 'approved' | 'pending'
}

export interface Coach {
    id: string;
    user: UserProfile;
    specialization: string;
    contractStatus: string;
}

export interface StudentFormData {
    fullName: string;
    email: string;
    position: string;
    height: string;
    weight: string;
    birthDate: string;
    parentId: string;
    ageClass: string;
    curriculumProfile: string;
}

export interface AttendanceRecord {
    id: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    date: string;
    checkInTime?: string;
    checkOutTime?: string;
    student: Student;
}

export interface StudentBadge {
    id?: string;
    categoryKey?: string;
    badgeCode: string;
    title: string;
    description: string;
    tier?: number;
    progressPoints?: number;
    targetPoints?: number;
    unlocked?: boolean;
    featured?: boolean;
    sourceType?: string;
    sourceRefId?: string;
    awardedAt: string;
}

export interface GamificationCategorySummary {
    totalPoints: number;
    badge: StudentBadge;
}

export interface GamificationSummary {
    totalPoints: number;
    weeklyPoints: number;
    categories: GamificationCategorySummary[];
    featuredBadge: StudentBadge | null;
}
