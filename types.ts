
export interface ElementData {
  z: number;
  symbol: string;
  name: string;
  mass: number;
  neutrons: number;
  state: string;
  category: string;
  physical: string;
  natural: string;
  applications: string;
}

export interface StudentInfo {
  student_id: string;
  student_name: string;
  group: string;
}

export interface BuildingResult {
  protons: number;
  neutrons: number;
  electrons: number;
  score: number;
  timeTaken: number;
  elementName: string;
}

export interface LeaderboardEntry extends BuildingResult {
  student_name: string;
  group: string;
  date: string;
}

export type View = 'LOGIN' | 'BUILDER' | 'RESULTS';
