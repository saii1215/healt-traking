// Powered by OnSpace.AI
import { useState, useEffect } from 'react';
import { bluetoothService, ConnectedDevice, SmartWatchData } from '../services/bluetoothService';

export function useBluetooth() {
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initializeBluetooth();
    loadConnectedDevices();
  }, []);

  const initializeBluetooth = async () => {
    try {
      const success = await bluetoothService.initialize();
      setInitialized(success);
    } catch (error) {
      console.error('Bluetooth initialization error:', error);
      setInitialized(false);
    }
  };

  const scanForDevices = async () => {
    if (!initialized || scanning) return;

    try {
      setScanning(true);
      setDevices([]);

      await bluetoothService.scanForDevices((device) => {
        setDevices(prev => {
          const exists = prev.find(d => d.id === device.id);
          if (!exists) {
            return [...prev, device];
          }
          return prev;
        });
      });
    } catch (error) {
      console.error('Scan error:', error);
    } finally {
      setTimeout(() => setScanning(false), 10000);
    }
  };

  const connectToDevice = async (deviceId: string) => {
    try {
      const success = await bluetoothService.connectToDevice(deviceId);
      if (success) {
        await loadConnectedDevices();
        // Update the device in the devices list
        setDevices(prev => 
          prev.map(device => 
            device.id === deviceId 
              ? { ...device, connected: true }
              : device
          )
        );
      }
      return success;
    } catch (error) {
      console.error('Connect error:', error);
      return false;
    }
  };

  const disconnectDevice = async (deviceId: string) => {
    try {
      await bluetoothService.disconnectDevice(deviceId);
      await loadConnectedDevices();
      // Update the device in the devices list
      setDevices(prev => 
        prev.map(device => 
          device.id === deviceId 
            ? { ...device, connected: false }
            : device
        )
      );
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const loadConnectedDevices = async () => {
    try {
      const connected = await bluetoothService.getConnectedDevices();
      setConnectedDevices(connected);
    } catch (error) {
      console.error('Load connected devices error:', error);
    }
  };

  const syncDeviceData = async (): Promise<SmartWatchData[]> => {
    try {
      return await bluetoothService.syncDeviceData();
    } catch (error) {
      console.error('Sync data error:', error);
      return [];
    }
  };

  const stopScanning = async () => {
    try {
      await bluetoothService.stopScanning();
      setScanning(false);
    } catch (error) {
      console.error('Stop scan error:', error);
    }
  };

  return {
    devices,
    connectedDevices,
    scanning,
    initialized,
    scanForDevices,
    connectToDevice,
    disconnectDevice,
    syncDeviceData,
    stopScanning,
    refreshConnectedDevices: loadConnectedDevices,
  };
}