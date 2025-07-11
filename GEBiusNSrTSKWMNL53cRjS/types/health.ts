// Powered by OnSpace.AI
export interface HealthMetric {
  id: string;
  type: 'weight' | 'bloodPressure' | 'heartRate' | 'steps' | 'sleep' | 'water';
  value: number;
  secondaryValue?: number; // For blood pressure (diastolic)
  unit: string;
  date: string;
  notes?: string;
}

export interface Goal {
  id: string;
  type: 'weight' | 'steps' | 'water' | 'sleep';
  target: number;
  current: number;
  unit: string;
  deadline: string;
  isActive: boolean;
}

export interface DashboardStats {
  todaySteps: number;
  todayWater: number;
  lastWeight: number;
  lastHeartRate: number;
  weeklyProgress: number;
}