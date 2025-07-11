// Powered by OnSpace.AI
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import MetricCard from '../../components/MetricCard';
import ProgressCircle from '../../components/ProgressCircle';
import { healthService } from '../../services/healthService';
import { DashboardStats } from '../../types/health';

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const dashboardStats = await healthService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading your health data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Good Evening!</Text>
          <Text style={styles.subtitle}>Here's your health summary</Text>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.progressGrid}>
            <ProgressCircle
              progress={(stats?.todaySteps || 0) / 100}
              size={120}
              strokeWidth={8}
              color="#4A90E2"
              title="Steps"
              subtitle={`${stats?.todaySteps || 0} / 10,000`}
            />
            <ProgressCircle
              progress={(stats?.todayWater || 0) * 12.5}
              size={120}
              strokeWidth={8}
              color="#50C878"
              title="Water"
              subtitle={`${stats?.todayWater || 0} / 8 glasses`}
            />
          </View>
        </View>

        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Latest Metrics</Text>
          
          <MetricCard
            title="Weight"
            value={stats?.lastWeight?.toString() || '0'}
            unit="kg"
            icon="monitor-weight"
            color="#FF6B6B"
            subtitle="Last recorded"
          />

          <MetricCard
            title="Heart Rate"
            value={stats?.lastHeartRate?.toString() || '0'}
            unit="bpm"
            icon="favorite"
            color="#FF69B4"
            subtitle="Resting rate"
          />

          <MetricCard
            title="Weekly Progress"
            value={stats?.weeklyProgress?.toString() || '0'}
            unit="%"
            icon="trending-up"
            color="#32CD32"
            subtitle="Goal completion"
          />
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <View style={styles.actionCard}>
              <MaterialIcons name="add" size={32} color="#4A90E2" />
              <Text style={styles.actionText}>Log Weight</Text>
            </View>
            <View style={styles.actionCard}>
              <MaterialIcons name="directions-walk" size={32} color="#50C878" />
              <Text style={styles.actionText}>Track Steps</Text>
            </View>
            <View style={styles.actionCard}>
              <MaterialIcons name="local-drink" size={32} color="#1E90FF" />
              <Text style={styles.actionText}>Add Water</Text>
            </View>
            <View style={styles.actionCard}>
              <MaterialIcons name="bedtime" size={32} color="#9370DB" />
              <Text style={styles.actionText}>Log Sleep</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  progressSection: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricsSection: {
    padding: 20,
    paddingTop: 10,
  },
  quickActions: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginTop: 8,
  },
});