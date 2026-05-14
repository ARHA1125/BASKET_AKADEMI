export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  photo_url?: string;
  role: string;
  status?: string;
  studentProfile?: any;
  parentProfile?: any;
  coachProfile?: any;
}

export interface UpdateProfileData {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface StudentProfileData {
  dateOfBirth?: string;
  parentContact?: string;
  emergencyContact?: string;
  address?: string;
}

export interface ParentProfileData {
  relationshipToStudent?: string;
  occupation?: string;
}

export interface CoachProfileData {
  certifications?: string;
  specialization?: string;
  yearsOfExperience?: number;
}
