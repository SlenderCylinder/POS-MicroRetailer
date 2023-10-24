import { Alert, PermissionsAndroid, DeviceEventEmitter } from 'react-native';
import { BluetoothManager, BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer';

export const enableBluetooth = () => {
  requestBluetoothConnectPermission()
    .then(() => {
      BluetoothEnable();
    })
    .catch((error) => {
      Alert.alert('Bluetooth Connect Permission Denied');
      console.log('Bluetooth Connect Permission Denied:', error);
    });
};

export const checkBluetoothStatus = async () => {
  try {
    const enabled = await BluetoothManager.isBluetoothEnabled();
    Alert.alert('Bluetooth Status', enabled ? 'Bluetooth is enabled' : 'Bluetooth is disabled');
  } catch (error) {
    Alert.alert('Error', error);
  }
};

export const scanForDevices = (setBluetoothModalVisible, setFoundDevices, setPairedDevices, setIsScanning) => {
  setIsScanning(true);
  try {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: 'Bluetooth Scan Permission',
        message: 'App needs Bluetooth Scan permission for device discovery.',
        buttonPositive: 'OK',
      }
    ).then((granted) => {
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        BluetoothManager.scanDevices()
          .then((s) => {
            var ss = JSON.parse(s);
            setFoundDevices(ss.found || []);
            setPairedDevices(ss.paired || []);
          })
          .catch((er) => {
            setIsScanning(false);
            alert('error' + JSON.stringify(er));
          });
      } else {
        setIsScanning(false);
        Alert.alert('Bluetooth Scan Permission Denied');
      }
    });
  } catch (error) {
    console.error(error);
  } finally {
    setIsScanning(false);
  }
};

export const connectPrinter = (address, setBoundAddress) => {
  BluetoothManager.connect(address)
    .then(() => {
      setBoundAddress(address);
      // Perform your printing actions here
      // Notify the user that printing is complete
      Alert.alert('Printing successful');
    })
    .catch((e) => {
      console.log('Error connecting to device:', e);
      Alert.alert('Error connecting to device');
    });
};

// ... Other Bluetooth-related functions

// Function to request the BLUETOOTH_CONNECT permission
const requestBluetoothConnectPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: 'Bluetooth Connect Permission',
        message: 'App needs Bluetooth Connect permission for printer functionality.',
        buttonPositive: 'OK',
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Bluetooth Connect permission granted');
    } else {
      console.log('Bluetooth Connect permission denied');
      return Promise.reject('Bluetooth Connect permission denied');
    }
  } catch (err) {
    console.warn(err);
    return Promise.reject(err);
  }
};
