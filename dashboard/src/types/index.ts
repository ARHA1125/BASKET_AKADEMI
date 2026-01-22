export interface AssignedPerson {
  name: string;
  initials: string;
}

export interface Project {
  company: string;
  size: string;
  probability: string;
  duration: string;
  status: "Drafted" | "Sent" | "Closed";
  assigned: AssignedPerson[];
}

export interface Region {
  region: string;
  project: Project[];
}

export interface DataChart {
  date: string;
  "Current year": number;
  "Same period last year": number;
}

export interface DataChart2 {
  date: string;
  Quotes: number;
  "Total deal size": number;
}

export interface DataChart3 {
  date: string;
  Addressed: number;
  Unrealized: number;
}

export interface DataChart4 {
  date: string;
  Density: number;
}

export interface Progress {
  current: number;
  total: number;
}

export interface AuditDate {
  date: string;
  auditor: string;
}

export interface Document {
  name: string;
  status: "OK" | "Needs update" | "In audit";
}

export interface Section {
  id: string;
  title: string;
  certified: string;
  progress: Progress;
  status: "complete" | "warning";
  auditDates: AuditDate[];
  documents: Document[];
}
