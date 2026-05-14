export type UserRole = 'ADMIN' | 'STUDENT' | 'PARENT' | 'COACH' | string;

export interface UserProfileStudent {
  id: string;
}

export interface UserProfileParent {
  id: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string;
  photo_url?: string;
  createdAt: string;
  studentProfile?: UserProfileStudent | null;
  parentProfile?: UserProfileParent | null;
}
