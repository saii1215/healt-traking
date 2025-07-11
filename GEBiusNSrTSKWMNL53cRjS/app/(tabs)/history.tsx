// Powered by OnSpace.AI
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { healthService } from '../../services/healthService';
import { HealthMetric } from '../../types/health';

const metricColors: Record<string, string> = {
  weight: '#FF6B6B',
  bloodPressure: '#FF69B4',
  heartRate: '#E74C3C',
  steps: '#50C878',
  sleep: '#9370DB',
  water: '#1E90FF',
};

const metricIcons: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  weight: 'monitor-weight',
  bloodPressure: 'favorite',
  heartRate: 'favorite-border',
  steps: 'directions-walk',
  sleep: 'bedtime',
  water: 'local-drink',
};

export default function HistoryScreen() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filterOptions = [
    { key: 'all', label: 'All' },
    { key: 'weight', label: 'Weight' },
    { key: 'bloodPressure', label: 'Blood Pressure' },
    { key: 'heartRate', label: 'Heart Rate' },
    { key: 'steps', label: 'Steps' },
    { key: 'sleep', label: 'Sleep' },
    { key: 'water', label: 'Water' },
  ];

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await healthService.getMetrics();
      // Sort by date (newest first)
      const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setMetrics(sortedData);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMetrics = selectedFilter === 'all' 
    ? metrics 
    : metrics.filter(metric => metric.type === selectedFilter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatValue = (metric: HealthMetric) => {
    if (metric.type === 'bloodPressure' && metric.secondaryValue) {
      return `${metric.value}/${metric.secondaryValue}`;
    }
    return metric.value.toString();
  };

  const renderMetricItem = ({ item }: { item: HealthMetric }) => {
    const color = metricColors[item.type] || '#666666';
    const icon = metricIcons[item.type] || 'health-and-safety';

    return (
      <View style={styles.metricItem}>
        <View style={styles.metricHeader}>
          <View style={styles.metricInfo}>
            <MaterialIcons name={icon} size={24} color={color} />
            <View style={styles.metricDetails}>
              <Text style={styles.metricType}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Text>
              <Text style={styles.metricDate}>{formatDate(item.date)}</Text>
            </View>
          </View>
          <View style={styles.metricValue}>
            <Text style={[styles.valueText, { color }]}>
              {formatValue(item)}
            </Text>
            <Text style={styles.unitText}>{item.unit}</Text>
          </View>
        </View>
        {item.notes && (
          <Text style={styles.notesText}>{item.notes}</Text>
        )}
      </View>
    );
  };

  const renderFilterButton = (option: { key: string; label: string }) => (
    <TouchableOpacity
      key={option.key}
      style={[
        styles.filterButton,
        selectedFilter === option.key && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(option.key)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === option.key && styles.filterButtonTextActive,
        ]}
      >
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading your history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health History</Text>
        <Text style={styles.subtitle}>Track your progress over time</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterOptions.map(renderFilterButton)}
      </ScrollView>

      <FlatList
        data={filteredMetrics}
        renderItem={renderMetricItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>No metrics recorded yet</Text>
            <Text style={styles.emptySubtext}>
              Start tracking your health metrics to see them here
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  filterContainer: {
    maxHeight: 60,
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  filterButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  metricItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricDetails: {
    marginLeft: 12,
    flex: 1,
  },
  metricType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  metricDate: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  metricValue: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  unitText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  notesText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 12,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 250,
  },
});