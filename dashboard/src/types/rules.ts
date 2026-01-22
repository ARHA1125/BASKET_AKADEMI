export interface AutomationRule {
  id: string;
  name: string;
  keyword: string;
  response: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  hits?: number;
}
