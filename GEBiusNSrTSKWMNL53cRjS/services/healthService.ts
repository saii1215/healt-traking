// Powered by OnSpace.AI
import { HealthMetric, Goal, DashboardStats } from '../types/health';

// Mock data service - In production, this would connect to your backend
class HealthService {
  private metrics: HealthMetric[] = [
    {
      id: '1',
      type: 'weight',
      value: 75.5,
      unit: 'kg',
      date: '2025-01-11',
      notes: 'Morning weight'
    },
    {
      id: '2',
      type: 'steps',
      value: 8500,
      unit: 'steps',
      date: '2025-01-11'
    },
    {
      id: '3',
      type: 'water',
      value: 6,
      unit: 'glasses',
      date: '2025-01-11'
    },
    {
      id: '4',
      type: 'heartRate',
      value: 72,
      unit: 'bpm',
      date: '2025-01-11'
    }
  ];

  private goals: Goal[] = [
    {
      id: '1',
      type: 'weight',
      target: 70,
      current: 75.5,
      unit: 'kg',
      deadline: '2025-03-01',
      isActive: true
    },
    {
      id: '2',
      type: 'steps',
      target: 10000,
      current: 8500,
      unit: 'steps',
      deadline: '2025-01-11',
      isActive: true
    }
  ];

  async getMetrics(): Promise<HealthMetric[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.metrics];
  }

  async addMetric(metric: Omit<HealthMetric, 'id'>): Promise<HealthMetric> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newMetric: HealthMetric = {
      ...metric,
      id: Date.now().toString()
    };
    this.metrics.push(newMetric);
    return newMetric;
  }

  async getGoals(): Promise<Goal[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...this.goals];
  }

  async addGoal(goal: Omit<Goal, 'id' | 'current'>): Promise<Goal> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      current: 0
    };
    this.goals.push(newGoal);
    return newGoal;
  }

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const goalIndex = this.goals.findIndex(g => g.id === goalId);
    if (goalIndex === -1) return null;
    
    this.goals[goalIndex] = { ...this.goals[goalIndex], ...updates };
    return this.goals[goalIndex];
  }

  async getDashboardStats(): Promise<DashboardStats> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const today = new Date().toISOString().split('T')[0];
    const todayMetrics = this.metrics.filter(m => m.date === today);
    
    return {
      todaySteps: todayMetrics.find(m => m.type === 'steps')?.value || 0,
      todayWater: todayMetrics.find(m => m.type === 'water')?.value || 0,
      lastWeight: this.metrics.filter(m => m.type === 'weight').pop()?.value || 0,
      lastHeartRate: this.metrics.filter(m => m.type === 'heartRate').pop()?.value || 0,
      weeklyProgress: 75 // Mock weekly progress percentage
    };
  }

  async getMetricsByType(type: string): Promise<HealthMetric[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.metrics.filter(m => m.type === type);
  }
}

export const healthService = new HealthService();