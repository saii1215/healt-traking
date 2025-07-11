// Powered by OnSpace.AI
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useBluetooth } from '../hooks/useBluetooth';
import { ConnectedDevice } from '../services/bluetoothService';

export default function DevicesScreen() {
  const {
    devices,
    connectedDevices,
    scanning,
    initialized,
    scanForDevices,
    connectToDevice,
    disconnectDevice,
    syncDeviceData,
    stopScanning,
    refreshConnectedDevices,
  } = useBluetooth();

  const [connecting, setConnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (initialized) {
      refreshConnectedDevices();
    }
  }, [initialized]);

  const handleScanDevices = () => {
    if (!initialized) {
      Alert.alert(
        'Bluetooth Required',
        'Please enable Bluetooth and grant permissions to scan for devices'
      );
      return;
    }
    scanForDevices();
  };

  const handleConnect = async (deviceId: string) => {
    setConnecting(deviceId);
    try {
      const success = await connectToDevice(deviceId);
      if (success) {
        Alert.alert('Success', 'Device connected successfully!');
      } else {
        Alert.alert('Error', 'Failed to connect to device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to device');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (deviceId: string) => {
    try {
      await disconnectDevice(deviceId);
      Alert.alert('Success', 'Device disconnected');
    } catch (error) {
      Alert.alert('Error', 'Failed to disconnect device');
    }
  };

  const handleSync = async () => {
    if (connectedDevices.length === 0) {
      Alert.alert('No Devices', 'Please connect a device first');
      return;
    }

    setSyncing(true);
    try {
      const data = await syncDeviceData();
      Alert.alert('Success', `Synced ${data.length} health records`);
    } catch (error) {
      Alert.alert('Error', 'Failed to sync device data');
    } finally {
      setSyncing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshConnectedDevices();
    setRefreshing(false);
  };

  const getDeviceIcon = (type: ConnectedDevice['type']) => {
    switch (type) {
      case 'smartwatch':
        return 'watch';
      case 'fitness_tracker':
        return 'fitness-center';
      case 'heart_rate_monitor':
        return 'favorite';
      default:
        return 'bluetooth';
    }
  };

  const renderConnectedDevice = (device: ConnectedDevice) => (
    <View key={device.id} style={styles.deviceCard}>
      <View style={styles.deviceHeader}>
        <View style={styles.deviceInfo}>
          <MaterialIcons 
            name={getDeviceIcon(device.type)} 
            size={24} 
            color="#4A90E2" 
          />
          <View style={styles.deviceDetails}>
            <Text style={styles.deviceName}>{device.name}</Text>
            <Text style={styles.deviceType}>
              {device.type.replace('_', ' ')} • Connected
            </Text>
          </View>
        </View>
        <View style={styles.deviceActions}>
          <MaterialIcons name="check-circle" size={24} color="#50C878" />
        </View>
      </View>
      
      <View style={styles.deviceControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => handleSync()}
        >
          <MaterialIcons name="sync" size={20} color="#4A90E2" />
          <Text style={styles.controlButtonText}>Sync Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, styles.disconnectButton]}
          onPress={() => handleDisconnect(device.id)}
        >
          <MaterialIcons name="bluetooth-disabled" size={20} color="#FF6B6B" />
          <Text style={[styles.controlButtonText, { color: '#FF6B6B' }]}>
            Disconnect
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAvailableDevice = (device: ConnectedDevice) => (
    <View key={device.id} style={styles.deviceCard}>
      <View style={styles.deviceHeader}>
        <View style={styles.deviceInfo}>
          <MaterialIcons 
            name={getDeviceIcon(device.type)} 
            size={24} 
            color="#666666" 
          />
          <View style={styles.deviceDetails}>
            <Text style={styles.deviceName}>{device.name}</Text>
            <Text style={styles.deviceType}>
              {device.type.replace('_', ' ')} • Available
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.connectButton}
          onPress={() => handleConnect(device.id)}
          disabled={connecting === device.id}
        >
          {connecting === device.id ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.connectButtonText}>Connect</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Smart Devices</Text>
        <Text style={styles.subtitle}>Connect and sync your health devices</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Connected Devices */}
        {connectedDevices.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Connected Devices</Text>
              <TouchableOpacity
                style={styles.syncButton}
                onPress={handleSync}
                disabled={syncing}
              >
                {syncing ? (
                  <ActivityIndicator size="small" color="#4A90E2" />
                ) : (
                  <>
                    <MaterialIcons name="sync" size={20} color="#4A90E2" />
                    <Text style={styles.syncButtonText}>Sync All</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            {connectedDevices.map(renderConnectedDevice)}
          </View>
        )}

        {/* Available Devices */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Devices</Text>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={scanning ? stopScanning : handleScanDevices}
              disabled={!initialized}
            >
              {scanning ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.scanButtonText}>Scanning...</Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="bluetooth-searching" size={20} color="#FFFFFF" />
                  <Text style={styles.scanButtonText}>Scan</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {!initialized && (
            <View style={styles.warningContainer}>
              <MaterialIcons name="warning" size={24} color="#FF9500" />
              <Text style={styles.warningText}>
                Bluetooth permissions required to connect devices
              </Text>
            </View>
          )}

          {devices.length === 0 && !scanning && initialized && (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="bluetooth" size={48} color="#CCCCCC" />
              <Text style={styles.emptyText}>No devices found</Text>
              <Text style={styles.emptySubtext}>
                Tap scan to search for nearby health devices
              </Text>
            </View>
          )}

          {devices.filter(d => !d.connected).map(renderAvailableDevice)}
        </View>

        {/* Device Types Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supported Devices</Text>
          <View style={styles.supportedDevices}>
            <View style={styles.supportedDevice}>
              <MaterialIcons name="watch" size={32} color="#4A90E2" />
              <Text style={styles.supportedDeviceText}>Smart Watches</Text>
            </View>
            <View style={styles.supportedDevice}>
              <MaterialIcons name="fitness-center" size={32} color="#50C878" />
              <Text style={styles.supportedDeviceText}>Fitness Trackers</Text>
            </View>
            <View style={styles.supportedDevice}>
              <MaterialIcons name="favorite" size={32} color="#FF69B4" />
              <Text style={styles.supportedDeviceText}>Heart Rate Monitors</Text>
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
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scanButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A90E2',
    marginLeft: 6,
  },
  deviceCard: {
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
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceDetails: {
    marginLeft: 12,
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  deviceType: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  deviceActions: {
    marginLeft: 12,
  },
  connectButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  deviceControls: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  disconnectButton: {
    borderColor: '#FFE5E5',
    backgroundColor: '#FFF8F8',
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4A90E2',
    marginLeft: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#FF9500',
    marginLeft: 12,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 4,
  },
  supportedDevices: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  supportedDevice: {
    alignItems: 'center',
    flex: 1,
  },
  supportedDeviceText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
});