import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Scanner from "./screens/Scanner";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "./screens/Home";
import Pin from "./screens/Pin";
import BeneficiaryDetails from "./screens/BenDetails";
import CartPage from "./screens/CartPage";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import Loading from "./screens/Loading";
import Retailer from "./screens/Retailer";
import LanguageSelectionScreen from "./screens/Lang";
import { Alert, ActivityIndicator, PermissionsAndroid, StatusBar } from 'react-native';
import { NativeModules, Button, Modal, View, Text, FlatList, TouchableOpacity, DeviceEventEmitter, Platform } from 'react-native';
const Stack = createStackNavigator();
import {BluetoothManager,BluetoothEscposPrinter,BluetoothTscPrinter} from 'react-native-bluetooth-escpos-printer';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [language, setLanguage] = useState("tam");
  const [retailer, setRetailer] = useState(null);
  const [isBluetoothModalVisible, setBluetoothModalVisible] = useState(false);
  const [foundDevices, setFoundDevices] = useState([]);  
  const [pairedDevices, setPairedDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [boundAddress, setBoundAddress] = useState([]);

  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('rgba(0, 0, 0, 0.2)');

  const enableBluetooth = () => {
    // Request the BLUETOOTH_CONNECT permission
    requestBluetoothConnectPermission()
      .then(() => {
        // Permission granted, enable Bluetooth
        BluetoothEnable();
      })
      .catch((error) => {
        Alert.alert('Bluetooth Connect Permission Denied');
        console.log('Bluetooth Connect Permission Denied:', error);
      });
  };

    // Event listener for device discovery
   // Event listener for device discovery
useEffect(() => {
  const deviceFoundListener = DeviceEventEmitter.addListener(
    BluetoothManager.EVENT_DEVICE_FOUND,
    (devices) => {
      // Handle found devices here
      // You can emit custom events or update state based on found devices
      // For example, update the state with the found devices
      console.log("Found devices:", devices);

    }
  );

  const deviceAlreadyPairedListener = DeviceEventEmitter.addListener(
    BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
    (devices) => {
      // Handle devices that are already paired
      // You can emit custom events or update state based on already paired devices
      // For example, update the state with the already paired devices
      console.log("Already paired devices:", devices);
    }
  );

  const deviceDiscoverDoneListener = DeviceEventEmitter.addListener(
    BluetoothManager.EVENT_DEVICE_DISCOVER_DONE,
    () => {
      // Handle device discovery done
      console.log("Device discovery done");
      // You can emit a custom event or perform any necessary actions here
      setIsScanning(false);
    }
  );

  // Clean up the event listeners when the component unmounts
  return () => {
    deviceFoundListener.remove();
    deviceDiscoverDoneListener.remove();
    deviceAlreadyPairedListener.remove();
  };
}, []);

  // const openPrinter = () => {
  //   const PX400PrinterModule = NativeModules.PX400PrinterModule;
  //   PX400PrinterModule.openPrinter((error, message) => {
  //     if (error) {
  //       console.error(error);
  //     } else {
  //       console.log(message);
  //     }
  //   });
  // };

  // useEffect(() => {
  //   console.log("Attempting to open printer")
  //   openPrinter(); // Call openPrinter when the component mounts
  // }, []); 

  //const { PX400PrinterModule } = NativeModules;


  const handleAddToCart = (name, quantity, price) => {
    const newItem = { name, quantity, price };
    setCartItems([...cartItems, newItem]);
  };

  const handleRemoveFromCart = (item) => {
    const newCartItems = cartItems.filter((cartItem) => cartItem !== item);
    setCartItems(newCartItems);
  };

  // const onPress = () => {
  //   console.log('Invoking native android module');
  //         // Call the open method
  //     PX400PrinterModule.open();

  //     // Call the printText method
  //     PX400PrinterModule.printText('Hello, this is a test text!');

  //     // Call the printHtml method
  //     PX400PrinterModule.printHtml('sample.html', () => {
  //       console.log('Printing HTML finished.');
  //     });

  //     // Call the printQrCode method
  //     PX400PrinterModule.printQrCode('Your QR Code Data', (error) => {
  //       if (error) {
  //         console.error('Error printing QR Code:', error);
  //       } else {
  //         console.log('Printing QR Code succeeded.');
  //       }
  //     });

  //     // Call the close method
  //     PX400PrinterModule.close();
  // };

  
  const onPress = async () => {
    Alert.alert("You pressed it");
    try {
      // You can add your printer testing code here
      // For example, you can use the BluetoothEscposPrinter API to print something
      // Here's a simple example to print a text
      await BluetoothEscposPrinter.printText("Hello, this is a test print.", {}, () => {
        Alert.alert("Printing successful");
      });
    } catch (error) {
      Alert.alert("Printing error:", error);
    }
  };

  const checkBluetoothStatus = () => {
    BluetoothCheck();
  };


  // Define the BluetoothEnable function
  const BluetoothCheck = async () => {
    try {
      const enabled = await BluetoothManager.isBluetoothEnabled();
      Alert.alert("enabled"); // Display the Bluetooth status
    } catch (error) {
      Alert.alert(error); // Handle any errors that occur
    }
  };

  // Define the BluetoothEnable function
  const BluetoothEnable = async () => {
    try {
      const devices = await BluetoothManager.enableBluetooth();
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
    } catch (error) {
      Alert.alert(error); // Handle any errors that occur
    }
  };

  const scanForDevices = async () => {
    setIsScanning(true);
    try {
      // Request the BLUETOOTH_SCAN permission
      const granted = await PermissionsAndroid.request(
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
            setFoundDevices(ss.found || []);
            setPairedDevices(ss.paired || []);
          })
          .catch((er) => {
            setIsScanning(false);
            alert('error' + JSON.stringify(er));
          });
      } else {
        // Permission denied, handle it as needed
        setIsScanning(false);
        Alert.alert('Bluetooth Scan Permission Denied');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsScanning(false);
    }
  };

  const connectPrinter = (rowData) => {

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

    BluetoothManager.connect(rowData.address) // the device address scanned.
    .then((s) => {
        console.log(s);
        Alert.alert(s);
        setBoundAddress(rowData.address);
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

  const connectToDevice = (device) => {
    console.log("Attempting to connect to the following device:")
    try {
      if (device) {
        console.log(device)
        console.log("All paired devices:")
        console.log(pairedDevices)
        console.log("Checking for matches.")
        // Check if the selected device exists in the scanned devices
        const pairedDevice = pairedDevices.find(d => d.address === device.address);
        console.log("Match found:")
        console.log(pairedDevice)
  
        if (pairedDevice) {
          console.log("Attempting to connect to printer");
          try{
          connectPrinter(pairedDevice)
          } catch (error) {
            console.log("Ran into an error:")
            console.log(error)

          }


        } else {
          Alert.alert('Device not found in the scanned devices');
        }
      } else {
        Alert.alert('No device selected');
      }
    } catch (error) {
      Alert.alert('Error', error);
      console.error(error);
    }
  };
  
  
  

  useEffect(() => {
    const getLanguage = async () => {
      try {
        const lang = await AsyncStorage.getItem("selectedLanguage");
        const retailerCache = await AsyncStorage.getItem("retailer");
        console.log(retailerCache);
        if (lang !== null) {
          setLanguage("tam");
        }
        if (retailer !== null) {
          setRetailer(retailerCache);
        }
      } catch (error) {
        console.error(error);
      }
    };
    getLanguage();
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Loading" options={{ headerShown: false }}>
            {(props) => (
              <Loading
                {...props}
                lang={language}
                retailer={retailer}
                setLanguage={setLanguage}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Pin">
            {(props) => (
              <Pin {...props} setSelectedBeneficiary={setSelectedBeneficiary} />
            )}
          </Stack.Screen>
          <Stack.Screen name="Retailer" options={{headerShown: false}}>
            {(props) => <Retailer {...props} setRetailer={setRetailer} />}
          </Stack.Screen>
          <Stack.Screen name="Scanner">
            {(props) => (
              <Scanner
                {...props}
                setSelectedBeneficiary={setSelectedBeneficiary}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Cart">
            {(props) => (
              <CartPage
                {...props}
                cartItems={cartItems}
                setSelectedBeneficiary={setSelectedBeneficiary}
                setCartItems={setCartItems}
                retailer={retailer}
                selectedBeneficiary={selectedBeneficiary}
                handleRemoveFromCart={handleRemoveFromCart}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="BeneficiaryDetails"
            options={{ title: "Beneficiary Details", headerShown: false }}
          >
            {(props) => (
              <BeneficiaryDetails
                {...props}
                cartItems={cartItems}
                selectedBeneficiary={selectedBeneficiary}
                setSelectedBeneficiary={setSelectedBeneficiary}
                setCartItems={setCartItems}
                setLanguage={setLanguage}
                handleAddToCart={handleAddToCart}
                language={language}
                handleRemoveFromCart={handleRemoveFromCart}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="LanguageSelection"
            component={LanguageSelectionScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Button title="Test Printer" onPress={onPress} />
      <Button title="Check Bluetooth Status" onPress={checkBluetoothStatus} />
      <Button title="Enable Bluetooth" onPress={enableBluetooth} />
      <Button title="Scan for Devices" onPress={() => {
          setBluetoothModalVisible(true); // Show the modal
          scanForDevices(); // Trigger the device scanning
        }} />
      <Modal visible={isBluetoothModalVisible} animationType="slide" transparent={false}>
      <View>
        {isScanning ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <React.Fragment>
            <Text>Found Devices</Text>
            <FlatList
              data={foundDevices}
              keyExtractor={(item) => item.address}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => connectToDevice(item)}>
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <Text>Paired Devices</Text>
            <FlatList
              data={pairedDevices}
              keyExtractor={(item) => item.address}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => connectToDevice(item)}>
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
              </React.Fragment>
              )}
            <Button title="Close" onPress={() => setBluetoothModalVisible(false)} />
          </View>
      </Modal>
    </PaperProvider>
  );
}

export default App;


// Function to request the BLUETOOTH_CONNECT permission
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