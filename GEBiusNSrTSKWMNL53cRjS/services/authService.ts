// Powered by OnSpace.AI
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google' | 'facebook';
}

class AuthService {
  private user: User | null = null;

  // Google Auth Configuration
  private googleRequest = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });

  // Facebook Auth Configuration
  private facebookRequest = Facebook.useAuthRequest({
    clientId: 'YOUR_FACEBOOK_APP_ID',
  });

  async signInWithGoogle(): Promise<User | null> {
    try {
      const [request, response, promptAsync] = this.googleRequest;
      
      if (request) {
        const result = await promptAsync();
        
        if (result.type === 'success') {
          const { authentication } = result;
          
          // Get user info from Google
          const userInfoResponse = await fetch(
            `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${authentication?.accessToken}`
          );
          const userInfo = await userInfoResponse.json();
          
          const user: User = {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            provider: 'google'
          };
          
          await this.storeUser(user);
          this.user = user;
          return user;
        }
      }
      return null;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw new Error('Failed to sign in with Google');
    }
  }

  async signInWithFacebook(): Promise<User | null> {
    try {
      const [request, response, promptAsync] = this.facebookRequest;
      
      if (request) {
        const result = await promptAsync();
        
        if (result.type === 'success') {
          const { authentication } = result;
          
          // Get user info from Facebook
          const userInfoResponse = await fetch(
            `https://graph.facebook.com/me?access_token=${authentication?.accessToken}&fields=id,name,email,picture`
          );
          const userInfo = await userInfoResponse.json();
          
          const user: User = {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture?.data?.url,
            provider: 'facebook'
          };
          
          await this.storeUser(user);
          this.user = user;
          return user;
        }
      }
      return null;
    } catch (error) {
      console.error('Facebook sign in error:', error);
      throw new Error('Failed to sign in with Facebook');
    }
  }

  async signOut(): Promise<void> {
    try {
      await AsyncStorage.removeItem('user');
      this.user = null;
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.user) return this.user;
    
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        this.user = JSON.parse(userData);
        return this.user;
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  private async storeUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Store user error:', error);
      throw new Error('Failed to store user data');
    }
  }
}

export const authService = new AuthService();