export interface UserProfile {
    fullName: string;
    email: string;
    phoneNumber?: string;
    status?: string; 
}

export interface Student {
    id: string;
    user: UserProfile;
    birthDate?: string;
    height: number;
    weight: number;
    position: string;
    parent?: {
        id: string;
        user: UserProfile;
    };
    parentName?: string; 
}

export interface Parent {
    id: string;
    user: UserProfile;
    studentsCount: number;
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
}
