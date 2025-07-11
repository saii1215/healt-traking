// Powered by OnSpace.AI
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut, isAuthenticated } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              Alert.alert('Success', 'You have been signed out successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleSignIn = () => {
    router.push('/auth');
  };

  const menuItems = [
    {
      title: 'Health Data Export',
      icon: 'file-download',
      onPress: () => Alert.alert('Coming Soon', 'Export feature will be available soon'),
    },
    {
      title: 'Privacy Settings',
      icon: 'privacy-tip',
      onPress: () => Alert.alert('Coming Soon', 'Privacy settings will be available soon'),
    },
    {
      title: 'Notifications',
      icon: 'notifications',
      onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon'),
    },
    {
      title: 'Units & Preferences',
      icon: 'settings',
      onPress: () => Alert.alert('Coming Soon', 'Preferences will be available soon'),
    },
    {
      title: 'Help & Support',
      icon: 'help',
      onPress: () => Alert.alert('Support', 'For support, please email: support@healthtracker.com'),
    },
    {
      title: 'About',
      icon: 'info',
      onPress: () => Alert.alert('About', 'HealthTracker v1.0.0\nBuilt with React Native & Expo'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
        </View>

        {/* User Profile Section */}
        <View style={styles.profileSection}>
          {isAuthenticated && user ? (
            <View style={styles.userProfile}>
              <View style={styles.avatarContainer}>
                {user.picture ? (
                  <Image source={{ uri: user.picture }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <MaterialIcons name="person" size={40} color="#FFFFFF" />
                  </View>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.providerBadge}>
                  <MaterialIcons 
                    name={user.provider === 'google' ? 'login' : 'facebook'} 
                    size={16} 
                    color="#4A90E2" 
                  />
                  <Text style={styles.providerText}>
                    {user.provider === 'google' ? 'Google' : 'Facebook'}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.signInPrompt}>
              <MaterialIcons name="person-outline" size={48} color="#CCCCCC" />
              <Text style={styles.signInTitle}>Sign in to sync your data</Text>
              <Text style={styles.signInSubtitle}>
                Connect your account to backup and access your health data across devices
              </Text>
              <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
                <MaterialIcons name="login" size={20} color="#FFFFFF" />
                <Text style={styles.signInButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <MaterialIcons name={item.icon} size={24} color="#4A90E2" />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#CCCCCC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        {isAuthenticated && (
          <View style={styles.signOutSection}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <MaterialIcons name="logout" size={20} color="#FF6B6B" />
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>HealthTracker v1.0.0</Text>
          <Text style={styles.appInfoSubtext}>Made with ❤️ for your health journey</Text>
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
  profileSection: {
    margin: 20,
    marginTop: 10,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  providerText: {
    fontSize: 12,
    color: '#4A90E2',
    marginLeft: 4,
    fontWeight: '500',
  },
  signInPrompt: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signInTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
  },
  signInSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  menuSection: {
    margin: 20,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  signOutSection: {
    margin: 20,
    marginTop: 10,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6B6B',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  appInfoText: {
    fontSize: 14,
    color: '#999999',
  },
  appInfoSubtext: {
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 4,
  },
});