// btprinter.js

import { Alert, ActivityIndicator, Text, FlatList, TouchableOpacity, View, DeviceEventEmitter, Platform, PermissionsAndroid } from 'react-native';
import {
  BluetoothManager,
  BluetoothEscposPrinter,
  BluetoothTscPrinter,
} from 'react-native-bluetooth-escpos-printer';

let foundDevicesCallback = null;
let pairedDevicesCallback = null;
let setIsScanningCallback = null;

const setDevicesCallbacks = (foundDevices, pairedDevices, setIsScanning ) => {
  foundDevicesCallback = foundDevices;
  pairedDevicesCallback = pairedDevices;
  setIsScanningCallback = setIsScanning;
};

const connectedListener = DeviceEventEmitter.addListener(
    BluetoothManager.EVENT_CONNECTED,
    (response) => {
      console.log('Connected to device:', response);
      // Perform your printing actions here
      // Make sure to remove the listener to avoid memory leaks
      connectedListener.remove();
    }
  );

  const unableConnectListener = DeviceEventEmitter.addListener(
    BluetoothManager.EVENT_UNABLE_CONNECT,
    (error) => {
      console.log('Error connecting to device:', error);
      Alert.alert('Error connecting to device');
      // Make sure to remove the listener to avoid memory leaks
      unableConnectListener.remove();
    }
  );

  const requestBluetoothConnectPermission = async () => {
    try {
          if (Platform.OS === 'android') {
            console.log(Platform.OS);
        if (Platform.Version >30) {
          console.log(Platform.Version);
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
      }} else { const requestBluetoothPermissions = async () => {
        try {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN,
          ]);
          
          if (
            granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH] === PermissionsAndroid.RESULTS.GRANTED &&
            granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN] === PermissionsAndroid.RESULTS.GRANTED
          ) {
            console.log('Bluetooth permissions granted');
          } else {
            console.log('Bluetooth permissions denied');
            return Promise.reject('Bluetooth permissions denied');
          }
        } catch (err) {
          console.warn(err);
          return Promise.reject(err);
        }
      };}};
    } catch (err) {
      console.warn(err);
      return Promise.reject(err);
    }
  };

const enableBluetooth = () => {
  // Request the BLUETOOTH_CONNECT permission
  requestBluetoothConnectPermission()
    .then(() => {
        console.log("Bluetooth permissions granted.")
    })
    .catch((error) => {
      Alert.alert('Bluetooth Connect Permission Denied');
      console.log('Bluetooth Connect Permission Denied:', error);
    });
};

const BluetoothCheck = async () => {
  try {
    const enabled = await BluetoothManager.isBluetoothEnabled();
    Alert.alert('Bluetooth Status', enabled ? 'Enabled' : 'Disabled');
  } catch (error) {
    Alert.alert('Error', error);
  }
};

const BluetoothEnable = async () => {
    try {
        const devices = await BluetoothManager.getPairedDevices();
        var paired = [];
        if (devices && devices.length > 0) {
          for (var i = 0; i < devices.length; i++) {
            try {
              paired.push(JSON.parse(devices[i]));
            } catch (e) {
              // Ignore any parsing errors
            }
          }
        }
        console.log(JSON.stringify(paired));
        return paired;
      } catch (error) {
        Alert.alert('Error', error);
        return [];
    }
};

const scanForDevices = async () => {
    if (setIsScanningCallback) {
        setIsScanningCallback(true); // Set scanning state to false
      }
  try {
    // Request the BLUETOOTH_SCAN permission
    const granted= await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        
        {
          title: 'Bluetooth Scan Permission',
          message: 'App needs Bluetooth Scan permission for device discovery.',
          buttonPositive: 'OK',
        }
      );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      // Permission granted, proceed with scanning for devices
      BluetoothManager.scanDevices()
        .then((s) => {
          var ss = JSON.parse(s); // JSON string
          if (foundDevicesCallback && pairedDevicesCallback) {
            foundDevicesCallback(ss.found || []);
            console.log(foundDevicesCallback)
            pairedDevicesCallback(ss.paired || []);
            console.log(pairedDevicesCallback)
          }
        })
        .catch((er) => {
            if (setIsScanningCallback) {
                setIsScanningCallback(false); // Set scanning state to false
              }
          alert('error' + JSON.stringify(er));
        });
    } else {
      // Permission denied, handle it as needed
      if (setIsScanningCallback) {
        setIsScanningCallback(false); // Set scanning state to false
      }
      Alert.alert('Bluetooth Scan Permission Denied');
    }
  } catch (error) {
    console.error(error);
  } finally {
    if (setIsScanningCallback) {
        setIsScanningCallback(false); // Set scanning state to false
      }
  }
};

// const connectPrinter = (rowData) => {
//   // Your existing code for connecting to a printer
// };


    const connectToDevice = (device) => {
        console.log("Attempting to connect to the following device:")
        try {

    
            if (pairedDevice) {
            console.log("Attempting to connect to printer");
            try{
            connectPrinter(pairedDevice)
            } catch (error) {
                console.log("Ran into an error:")
                console.log(error)

            }


            }  else {
            Alert.alert('No device selected');
        }
        } catch (error) {
        Alert.alert('Error', error);
        console.error(error);
        }
  };



  const connectPrinter = (rowData) => {
    console.log("Trying to connect to printer", rowData)



    BluetoothManager.connect(rowData) // the device address scanned.
    .then((s) => {
        console.log(s);
        Alert.alert(s);
        // print();
        const textToPrint = "Hello from WFP!";
        BluetoothTscPrinter.printLabel({
          width: 40,
          height:30,
          gap: 20,
          direction: BluetoothTscPrinter.DIRECTION.FORWARD,
          reference: [0, 0],
          tear: BluetoothTscPrinter.TEAR.ON,
          text: [
            {
              text: textToPrint,
              x: 20, // Adjust the X position
              y: 20, // Adjust the Y position
              fonttype: BluetoothTscPrinter.FONTTYPE.FONT_1,
              rotation: BluetoothTscPrinter.ROTATION.ROTATION_0,
              xscal: BluetoothTscPrinter.FONTMUL.MUL_1,
              yscal: BluetoothTscPrinter.FONTMUL.MUL_1,
            },{
              text: 'Item 2',
              x: 20,
              y: 50,
              fonttype: BluetoothTscPrinter.FONTTYPE.SIMPLIFIED_CHINESE,
              rotation: BluetoothTscPrinter.ROTATION.ROTATION_0,
              xscal:BluetoothTscPrinter.FONTMUL.MUL_1,
              yscal: BluetoothTscPrinter.FONTMUL.MUL_1
          }
          ],
          qrcode: [{x: 20, y: 96, level: BluetoothTscPrinter.EEC.LEVEL_L, width: 3, rotation: BluetoothTscPrinter.ROTATION.ROTATION_0, code: 'show me the money'}],
          barcode: [{x: 120, y:96, type: BluetoothTscPrinter.BARCODETYPE.CODE128, height: 40, readable: 1, rotation: BluetoothTscPrinter.ROTATION.ROTATION_0, code: '1234567890'}],
        });
        // Notify the user that printing is complete
        Alert.alert('Printing successful');
      },
        // Perform your printing actions here
      (e) => {
        console.log('Error connecting to device:', e);
        Alert.alert('Error connecting to device');
      });
  };


export {
  enableBluetooth,
  BluetoothCheck,
  BluetoothEnable,
  scanForDevices,
  connectPrinter,
  requestBluetoothConnectPermission,
  connectToDevice,
  setDevicesCallbacks,
};
