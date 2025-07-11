// Powered by OnSpace.AI
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressCircleProps {
  progress: number; // 0-100
  size: number;
  strokeWidth: number;
  color: string;
  title: string;
  subtitle: string;
}

export default function ProgressCircle({ 
  progress, 
  size, 
  strokeWidth, 
  color, 
  title, 
  subtitle 
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={styles.svgContainer}>
        {/* Background circle */}
        <View
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: '#E5E5EA',
            },
          ]}
        />
        {/* Progress circle */}
        <View
          style={[
            styles.progressCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svgContainer: {
    position: 'absolute',
  },
  circle: {
    position: 'absolute',
  },
  progressCircle: {
    position: 'absolute',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#999999',
  },
});