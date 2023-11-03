// btprinter.js

import { activeId } from '../App';
import { Alert, ActivityIndicator, Text, FlatList, TouchableOpacity, View, DeviceEventEmitter, Platform, PermissionsAndroid } from 'react-native';
import {
  BluetoothManager,
  BluetoothEscposPrinter,
  BluetoothTscPrinter,
} from 'react-native-bluetooth-escpos-printer';

let foundDevicesCallback = null;
let pairedDevicesCallback = null;
let setIsScanningCallback = null;
let isPrinterOk = null;


const setDevicesCallbacks = (foundDevices, pairedDevices, setIsScanning ) => {
  foundDevicesCallback = foundDevices;
  pairedDevicesCallback = pairedDevices;
  setIsScanningCallback = setIsScanning;
};

const connectedListener = DeviceEventEmitter.addListener(
    BluetoothManager.EVENT_CONNECTED,
    (response) => {
      console.log('Connected to device:', response);
      connectedListener.remove();
    }
  );

  const unableConnectListener = DeviceEventEmitter.addListener(
    BluetoothManager.EVENT_UNABLE_CONNECT,
    (error) => {
      console.log('Error connecting to printer:', error);
      // Remove listener if cannot connect
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
              console.log("Error", e)

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
        setIsScanningCallback(true); 
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
                setIsScanningCallback(false); 
              }
          Alert.alert('error' + JSON.stringify(er));
        });
    } else {
      // Permission denied, handle it as needed
      if (setIsScanningCallback) {
        setIsScanningCallback(false); 
      }
      Alert.alert('Bluetooth Scan Permission Denied');
    }
  } catch (error) {
    console.error(error);
  } finally {
    if (setIsScanningCallback) {
        setIsScanningCallback(false); 
      }
  }
};

// const connectPrinter = (rowData) => {
//   // Your existing code for connecting to a printer
// };


    const connectToDevice = (pairedDevice) => {
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
         isPrinterOk = true;
        // Uncomment if you need a test printout at connect

        // console.log(s);        // print();
        // const textToPrint = "PRNT CON. OK";
        // BluetoothTscPrinter.printLabel({
        //   width: 40,
        //   height:30,
        //   gap: 20,
        //   direction: BluetoothTscPrinter.DIRECTION.FORWARD,
        //   reference: [0, 0],
        //   tear: BluetoothTscPrinter.TEAR.ON,
        //   text: [
        //     {
        //       text: textToPrint,
        //       x: 20, // Adjust the X position
        //       y: 20, // Adjust the Y position
        //       fonttype: BluetoothTscPrinter.FONTTYPE.FONT_1,
        //       rotation: BluetoothTscPrinter.ROTATION.ROTATION_0,
        //       xscal: BluetoothTscPrinter.FONTMUL.MUL_1,
        //       yscal: BluetoothTscPrinter.FONTMUL.MUL_1,
        //     },
        //   ]
        // });
      },
        // Perform your printing actions here
      (e) => {
        isPrinterOk = false;
        console.log('Error connecting to printer:', e);
        setTimeout(() => {
        }, 3000);
      });
  };


export {
  enableBluetooth,
  isPrinterOk,
  BluetoothCheck,
  BluetoothEnable,
  scanForDevices,
  connectPrinter,
  requestBluetoothConnectPermission,
  connectToDevice,
  setDevicesCallbacks,
};
