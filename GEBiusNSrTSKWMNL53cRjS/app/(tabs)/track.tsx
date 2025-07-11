// Powered by OnSpace.AI
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { healthService } from '../../services/healthService';
import { HealthMetric } from '../../types/health';

type MetricType = 'weight' | 'bloodPressure' | 'heartRate' | 'steps' | 'sleep' | 'water';

interface MetricConfig {
  type: MetricType;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  unit: string;
  placeholder: string;
  hasSecondaryValue?: boolean;
  secondaryPlaceholder?: string;
}

const metricConfigs: MetricConfig[] = [
  {
    type: 'weight',
    title: 'Weight',
    icon: 'monitor-weight',
    color: '#FF6B6B',
    unit: 'kg',
    placeholder: 'Enter weight (kg)',
  },
  {
    type: 'bloodPressure',
    title: 'Blood Pressure',
    icon: 'favorite',
    color: '#FF69B4',
    unit: 'mmHg',
    placeholder: 'Systolic (e.g., 120)',
    hasSecondaryValue: true,
    secondaryPlaceholder: 'Diastolic (e.g., 80)',
  },
  {
    type: 'heartRate',
    title: 'Heart Rate',
    icon: 'favorite-border',
    color: '#E74C3C',
    unit: 'bpm',
    placeholder: 'Enter heart rate (bpm)',
  },
  {
    type: 'steps',
    title: 'Steps',
    icon: 'directions-walk',
    color: '#50C878',
    unit: 'steps',
    placeholder: 'Enter step count',
  },
  {
    type: 'sleep',
    title: 'Sleep',
    icon: 'bedtime',
    color: '#9370DB',
    unit: 'hours',
    placeholder: 'Enter sleep hours',
  },
  {
    type: 'water',
    title: 'Water Intake',
    icon: 'local-drink',
    color: '#1E90FF',
    unit: 'glasses',
    placeholder: 'Enter glasses of water',
  },
];

export default function TrackScreen() {
  const [selectedMetric, setSelectedMetric] = useState<MetricConfig | null>(null);
  const [value, setValue] = useState('');
  const [secondaryValue, setSecondaryValue] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedMetric || !value) {
      Alert.alert('Error', 'Please select a metric and enter a value');
      return;
    }

    const numValue = parseFloat(value);
    const numSecondaryValue = secondaryValue ? parseFloat(secondaryValue) : undefined;

    if (isNaN(numValue) || (selectedMetric.hasSecondaryValue && secondaryValue && isNaN(numSecondaryValue!))) {
      Alert.alert('Error', 'Please enter valid numbers');
      return;
    }

    setLoading(true);

    try {
      const metric: Omit<HealthMetric, 'id'> = {
        type: selectedMetric.type,
        value: numValue,
        secondaryValue: numSecondaryValue,
        unit: selectedMetric.unit,
        date: new Date().toISOString().split('T')[0],
        notes: notes.trim() || undefined,
      };

      await healthService.addMetric(metric);
      
      Alert.alert('Success', 'Metric logged successfully!');
      
      // Reset form
      setValue('');
      setSecondaryValue('');
      setNotes('');
      setSelectedMetric(null);
    } catch (error) {
      console.error('Failed to log metric:', error);
      Alert.alert('Error', 'Failed to log metric. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderMetricSelector = () => (
    <View style={styles.selectorSection}>
      <Text style={styles.sectionTitle}>Select Metric to Track</Text>
      <View style={styles.metricsGrid}>
        {metricConfigs.map((config) => (
          <TouchableOpacity
            key={config.type}
            style={[
              styles.metricOption,
              selectedMetric?.type === config.type && {
                backgroundColor: config.color,
                borderColor: config.color,
              },
            ]}
            onPress={() => setSelectedMetric(config)}
          >
            <MaterialIcons
              name={config.icon}
              size={32}
              color={selectedMetric?.type === config.type ? '#FFFFFF' : config.color}
            />
            <Text
              style={[
                styles.metricOptionText,
                selectedMetric?.type === config.type && { color: '#FFFFFF' },
              ]}
            >
              {config.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderInputForm = () => {
    if (!selectedMetric) return null;

    return (
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>Log {selectedMetric.title}</Text>
        
        <View style={styles.inputContainer}>
          <MaterialIcons name={selectedMetric.icon} size={24} color={selectedMetric.color} />
          <TextInput
            style={styles.input}
            placeholder={selectedMetric.placeholder}
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            placeholderTextColor="#999999"
          />
          <Text style={styles.unitText}>{selectedMetric.unit}</Text>
        </View>

        {selectedMetric.hasSecondaryValue && (
          <View style={styles.inputContainer}>
            <MaterialIcons name={selectedMetric.icon} size={24} color={selectedMetric.color} />
            <TextInput
              style={styles.input}
              placeholder={selectedMetric.secondaryPlaceholder}
              value={secondaryValue}
              onChangeText={setSecondaryValue}
              keyboardType="numeric"
              placeholderTextColor="#999999"
            />
            <Text style={styles.unitText}>{selectedMetric.unit}</Text>
          </View>
        )}

        <View style={styles.notesContainer}>
          <MaterialIcons name="note" size={24} color="#666666" />
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Add notes (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            placeholderTextColor="#999999"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: selectedMetric.color }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <MaterialIcons name="check" size={24} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            {loading ? 'Logging...' : 'Log Metric'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const backgroundTap = Platform.OS !== 'web' ? (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={StyleSheet.absoluteFillObject} />
    </TouchableWithoutFeedback>
  ) : null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        {backgroundTap}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Track Your Health</Text>
            <Text style={styles.subtitle}>Log your daily health metrics</Text>
          </View>

          {renderMetricSelector()}
          {renderInputForm()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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
  selectorSection: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricOption: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  metricOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginTop: 8,
    textAlign: 'center',
  },
  inputSection: {
    padding: 20,
    paddingTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  unitText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notesInput: {
    textAlignVertical: 'top',
    minHeight: 60,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});