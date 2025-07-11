// Powered by OnSpace.AI
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { router } from 'expo-router';

export default function AuthScreen() {
  const { signInWithGoogle, signInWithFacebook, loading } = useAuth();
  const [signingIn, setSigningIn] = useState<'google' | 'facebook' | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn('google');
      const user = await signInWithGoogle();
      if (user) {
        Alert.alert('Success', `Welcome ${user.name}!`);
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
    } finally {
      setSigningIn(null);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setSigningIn('facebook');
      const user = await signInWithFacebook();
      if (user) {
        Alert.alert('Success', `Welcome ${user.name}!`);
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Facebook. Please try again.');
    } finally {
      setSigningIn(null);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialIcons name="health-and-safety" size={80} color="#4A90E2" />
          <Text style={styles.title}>HealthTracker</Text>
          <Text style={styles.subtitle}>
            Track your health journey with ease
          </Text>
        </View>

        <View style={styles.authSection}>
          <Text style={styles.authTitle}>Sign in to sync your data</Text>
          <Text style={styles.authSubtitle}>
            Connect your account to backup and sync your health data across devices
          </Text>

          <TouchableOpacity
            style={[styles.authButton, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {signingIn === 'google' ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons name="login" size={24} color="#FFFFFF" />
                <Text style={styles.authButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.authButton, styles.facebookButton]}
            onPress={handleFacebookSignIn}
            disabled={loading}
          >
            {signingIn === 'facebook' ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons name="facebook" size={24} color="#FFFFFF" />
                <Text style={styles.authButtonText}>Continue with Facebook</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>Why sign in?</Text>
          
          <View style={styles.featureItem}>
            <MaterialIcons name="cloud-sync" size={24} color="#4A90E2" />
            <Text style={styles.featureText}>Sync data across devices</Text>
          </View>
          
          <View style={styles.featureItem}>
            <MaterialIcons name="backup" size={24} color="#4A90E2" />
            <Text style={styles.featureText}>Automatic data backup</Text>
          </View>
          
          <View style={styles.featureItem}>
            <MaterialIcons name="bluetooth" size={24} color="#4A90E2" />
            <Text style={styles.featureText}>Connect smart watches</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
  },
  authSection: {
    alignItems: 'center',
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 300,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
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
  googleButton: {
    backgroundColor: '#DB4437',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
  },
  features: {
    paddingBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
  },
});