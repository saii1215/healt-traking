// Powered by OnSpace.AI
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { healthService } from '../../services/healthService';
import { Goal } from '../../types/health';

type GoalType = 'weight' | 'steps' | 'water' | 'sleep';

const goalConfigs = {
  weight: { title: 'Weight Goal', icon: 'monitor-weight' as const, color: '#FF6B6B', unit: 'kg' },
  steps: { title: 'Daily Steps', icon: 'directions-walk' as const, color: '#50C878', unit: 'steps' },
  water: { title: 'Daily Water', icon: 'local-drink' as const, color: '#1E90FF', unit: 'glasses' },
  sleep: { title: 'Sleep Goal', icon: 'bedtime' as const, color: '#9370DB', unit: 'hours' },
};

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGoalType, setNewGoalType] = useState<GoalType>('steps');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await healthService.getGoals();
      setGoals(data);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoalTarget || !newGoalDeadline) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const target = parseFloat(newGoalTarget);
    if (isNaN(target) || target <= 0) {
      Alert.alert('Error', 'Please enter a valid target value');
      return;
    }

    try {
      const newGoal = {
        type: newGoalType,
        target,
        unit: goalConfigs[newGoalType].unit,
        deadline: newGoalDeadline,
        isActive: true,
      };

      await healthService.addGoal(newGoal);
      await loadGoals();
      
      setModalVisible(false);
      setNewGoalTarget('');
      setNewGoalDeadline('');
      Alert.alert('Success', 'Goal created successfully!');
    } catch (error) {
      console.error('Failed to create goal:', error);
      Alert.alert('Error', 'Failed to create goal. Please try again.');
    }
  };

  const calculateProgress = (goal: Goal) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderGoalCard = (goal: Goal) => {
    const config = goalConfigs[goal.type];
    const progress = calculateProgress(goal);
    const daysRemaining = getDaysRemaining(goal.deadline);

    return (
      <View key={goal.id} style={[styles.goalCard, { borderLeftColor: config.color }]}>
        <View style={styles.goalHeader}>
          <View style={styles.goalInfo}>
            <MaterialIcons name={config.icon} size={24} color={config.color} />
            <Text style={styles.goalTitle}>{config.title}</Text>
          </View>
          <View style={styles.goalStatus}>
            <Text style={[styles.progressText, { color: config.color }]}>
              {Math.round(progress)}%
            </Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: config.color },
            ]}
          />
        </View>

        <View style={styles.goalDetails}>
          <Text style={styles.goalProgress}>
            {goal.current} / {goal.target} {goal.unit}
          </Text>
          <Text style={styles.goalDeadline}>
            {daysRemaining > 0 
              ? `${daysRemaining} days left`
              : daysRemaining === 0
              ? 'Due today'
              : 'Overdue'
            }
          </Text>
        </View>

        <Text style={styles.deadlineDate}>
          Target: {formatDate(goal.deadline)}
        </Text>
      </View>
    );
  };

  const renderAddGoalModal = () => {
    const backgroundTap = Platform.OS !== 'web' ? (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={StyleSheet.absoluteFillObject} />
      </TouchableWithoutFeedback>
    ) : null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            style={styles.modalContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {backgroundTap}
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Goal</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <MaterialIcons name="close" size={24} color="#666666" />
                </TouchableOpacity>
              </View>

              <View style={styles.goalTypeSelector}>
                <Text style={styles.sectionLabel}>Goal Type</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.typeScroll}
                >
                  {Object.entries(goalConfigs).map(([type, config]) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        newGoalType === type && {
                          backgroundColor: config.color,
                          borderColor: config.color,
                        },
                      ]}
                      onPress={() => setNewGoalType(type as GoalType)}
                    >
                      <MaterialIcons
                        name={config.icon}
                        size={20}
                        color={newGoalType === type ? '#FFFFFF' : config.color}
                      />
                      <Text
                        style={[
                          styles.typeOptionText,
                          newGoalType === type && { color: '#FFFFFF' },
                        ]}
                      >
                        {config.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.sectionLabel}>Target Value</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder={`Enter target ${goalConfigs[newGoalType].unit}`}
                    value={newGoalTarget}
                    onChangeText={setNewGoalTarget}
                    keyboardType="numeric"
                    placeholderTextColor="#999999"
                  />
                  <Text style={styles.inputUnit}>{goalConfigs[newGoalType].unit}</Text>
                </View>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.sectionLabel}>Deadline</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="YYYY-MM-DD"
                  value={newGoalDeadline}
                  onChangeText={setNewGoalDeadline}
                  placeholderTextColor="#999999"
                />
              </View>

              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: goalConfigs[newGoalType].color }]}
                onPress={handleAddGoal}
              >
                <MaterialIcons name="add" size={24} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading your goals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Goals</Text>
        <Text style={styles.subtitle}>Set and track your health objectives</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {goals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="track-changes" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>No goals set yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first health goal to start tracking progress
            </Text>
          </View>
        ) : (
          goals.map(renderGoalCard)
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {renderAddGoalModal()}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 8,
  },
  goalStatus: {
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalProgress: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  goalDeadline: {
    fontSize: 14,
    color: '#666666',
  },
  deadlineDate: {
    fontSize: 12,
    color: '#999999',
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
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  goalTypeSelector: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  typeScroll: {
    maxHeight: 60,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  typeOptionText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 6,
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  inputUnit: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  dateInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});