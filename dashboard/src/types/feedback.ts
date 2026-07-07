export interface SystemFeedback {
  id: string;
  content: string;
  category: 'BUG' | 'FEATURE_REQUEST' | 'GENERAL' | 'OTHER';
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  adminNotes?: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}
