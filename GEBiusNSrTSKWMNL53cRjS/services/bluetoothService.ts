// Powered by OnSpace.AI
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { BleManager, Device, Characteristic, Service } from 'react-native-ble-plx';

export interface SmartWatchData {
  heartRate?: number;
  steps?: number;
  calories?: number;
  distance?: number;
  sleepMinutes?: number;
  timestamp: string;
}

export interface ConnectedDevice {
  id: string;
  name: string;
  type: 'fitness_tracker' | 'smartwatch' | 'heart_rate_monitor';
  connected: boolean;
  batteryLevel?: number;
}

class BluetoothService {
  private bleManager: BleManager;
  private connectedDevices: Map<string, Device> = new Map();
  private isScanning = false;

  constructor() {
    this.bleManager = new BleManager();
  }

  async initialize(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        const allGranted = Object.values(granted).every(
          status => status === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          Alert.alert('Permission Required', 'Bluetooth permissions are required to connect to smart watches');
          return false;
        }
      }

      const state = await this.bleManager.state();
      if (state !== 'PoweredOn') {
        Alert.alert('Bluetooth Required', 'Please enable Bluetooth to connect to smart watches');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Bluetooth initialization error:', error);
      return false;
    }
  }

  async scanForDevices(onDeviceFound: (device: ConnectedDevice) => void): Promise<void> {
    if (this.isScanning) return;

    try {
      this.isScanning = true;
      
      this.bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          this.isScanning = false;
          return;
        }

        if (device && device.name && this.isHealthDevice(device)) {
          const connectedDevice: ConnectedDevice = {
            id: device.id,
            name: device.name,
            type: this.getDeviceType(device.name),
            connected: false,
          };
          onDeviceFound(connectedDevice);
        }
      });

      // Stop scanning after 10 seconds
      setTimeout(() => {
        this.stopScanning();
      }, 10000);
    } catch (error) {
      console.error('Scan start error:', error);
      this.isScanning = false;
    }
  }

  async stopScanning(): Promise<void> {
    try {
      this.bleManager.stopDeviceScan();
      this.isScanning = false;
    } catch (error) {
      console.error('Stop scan error:', error);
    }
  }

  async connectToDevice(deviceId: string): Promise<boolean> {
    try {
      const device = await this.bleManager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      
      this.connectedDevices.set(deviceId, device);
      
      // Start monitoring device data
      this.startDataMonitoring(device);
      
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      return false;
    }
  }

  async disconnectDevice(deviceId: string): Promise<void> {
    try {
      const device = this.connectedDevices.get(deviceId);
      if (device) {
        await device.cancelConnection();
        this.connectedDevices.delete(deviceId);
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  async getConnectedDevices(): Promise<ConnectedDevice[]> {
    const devices: ConnectedDevice[] = [];
    
    for (const [id, device] of this.connectedDevices) {
      try {
        const isConnected = await device.isConnected();
        if (isConnected) {
          devices.push({
            id,
            name: device.name || 'Unknown Device',
            type: this.getDeviceType(device.name || ''),
            connected: true,
          });
        } else {
          this.connectedDevices.delete(id);
        }
      } catch (error) {
        console.error('Device check error:', error);
        this.connectedDevices.delete(id);
      }
    }
    
    return devices;
  }

  private async startDataMonitoring(device: Device): Promise<void> {
    try {
      // Heart Rate Service UUID
      const heartRateServiceUUID = '180D';
      const heartRateMeasurementUUID = '2A37';
      
      // Fitness Machine Service UUID (for steps, calories, etc.)
      const fitnessServiceUUID = '1826';
      
      // Monitor heart rate if available
      try {
        device.monitorCharacteristicForService(
          heartRateServiceUUID,
          heartRateMeasurementUUID,
          (error, characteristic) => {
            if (error) {
              console.log('Heart rate monitoring error:', error);
              return;
            }
            
            if (characteristic?.value) {
              const heartRate = this.parseHeartRateData(characteristic.value);
              this.onDataReceived({
                heartRate,
                timestamp: new Date().toISOString(),
              });
            }
          }
        );
      } catch (error) {
        console.log('Heart rate service not available');
      }

      // Monitor other fitness data
      this.monitorFitnessData(device);
    } catch (error) {
      console.error('Data monitoring setup error:', error);
    }
  }

  private async monitorFitnessData(device: Device): Promise<void> {
    // This would be implemented based on specific device protocols
    // For now, we'll simulate periodic data updates
    setInterval(() => {
      // Simulate receiving data from device
      const mockData: SmartWatchData = {
        steps: Math.floor(Math.random() * 1000) + 5000,
        calories: Math.floor(Math.random() * 200) + 300,
        distance: Math.floor(Math.random() * 5000) + 2000,
        timestamp: new Date().toISOString(),
      };
      
      this.onDataReceived(mockData);
    }, 30000); // Every 30 seconds
  }

  private parseHeartRateData(data: string): number {
    // Parse BLE heart rate data format
    const buffer = Buffer.from(data, 'base64');
    if (buffer.length >= 2) {
      return buffer.readUInt16LE(1);
    }
    return 0;
  }

  private isHealthDevice(device: Device): boolean {
    const name = device.name?.toLowerCase() || '';
    const healthKeywords = [
      'fitbit', 'garmin', 'apple watch', 'samsung', 'huawei', 'amazfit',
      'polar', 'suunto', 'withings', 'mi band', 'honor', 'fossil'
    ];
    
    return healthKeywords.some(keyword => name.includes(keyword));
  }

  private getDeviceType(deviceName: string): ConnectedDevice['type'] {
    const name = deviceName.toLowerCase();
    
    if (name.includes('watch')) {
      return 'smartwatch';
    } else if (name.includes('band') || name.includes('fit')) {
      return 'fitness_tracker';
    } else if (name.includes('heart')) {
      return 'heart_rate_monitor';
    }
    
    return 'fitness_tracker';
  }

  private onDataReceived(data: SmartWatchData): void {
    // This callback would be used to update the health service
    console.log('Received health data:', data);
    // In a real implementation, this would sync with your health service
  }

  async syncDeviceData(): Promise<SmartWatchData[]> {
    // Mock sync - in reality this would fetch stored data from connected devices
    const mockSyncData: SmartWatchData[] = [
      {
        heartRate: 72,
        steps: 8500,
        calories: 450,
        distance: 6200,
        sleepMinutes: 420,
        timestamp: new Date().toISOString(),
      }
    ];
    
    return mockSyncData;
  }
}

export const bluetoothService = new BluetoothService();