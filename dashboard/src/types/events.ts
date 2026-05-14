export enum EventType {
  TOURNAMENT = 'TOURNAMENT',
  SPARRING = 'SPARRING',
  TRYOUT = 'TRYOUT',
}

export enum SquadStatus {
  DRAFT = 'DRAFT',
  FINALIZED = 'FINALIZED',
}

export interface Event {
  id: string;
  name: string;
  type: EventType;
  date: Date | string;
  location?: string;
  description?: string;
  createdAt: Date | string;
}

export interface SquadPlayer {
  id: string;
  user: {
    id: string;
    fullName: string;
  };
}

export interface Squad {
  id: string;
  name: string;
  event: Event;
  players: SquadPlayer[];
  coachName?: string;
  isFinalized: boolean;
  status: SquadStatus;
  finalizedAt?: Date | string;
  finalizedBy?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface StudentEventRoster {
  event: Event;
  squad: Squad;
  isInRoster: boolean;
  rosterStatus: SquadStatus;
}
