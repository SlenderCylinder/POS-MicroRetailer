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
import { 
  BluetoothCheck,
  scanForDevices,
  connectPrinter,
  requestBluetoothConnectPermission,
  connectToDevice,
  setDevicesCallbacks, } from "./api/btprinter";



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
  const [activedeviceId, setActivedeviceId] = useState(null);


  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('rgba(0, 0, 0, 0.2)');


  useEffect(() => {
    const enableBluetooth = async () => {
      try {
        // Request the BLUETOOTH_CONNECT permission
        await requestBluetoothConnectPermission();
  
        // Permission granted, enable Bluetooth
        await BluetoothEnable();
        
        if (paired.length > 0) {
          const firstDevice = paired[0];
          const activeId = firstDevice.address;
          setActivedeviceId(activeId); // Update the state
          console.log("activedeviceId:", activeId);
          if (activeId){
            connectPrinter(activeId)
          }
          // You can use activedeviceId for further operations
        } else {
          console.log("No paired devices found.");
        }
      } catch (error) {
        Alert.alert('Bluetooth Connect Permission Denied');
        console.log('Bluetooth Connect Permission Denied:', error);
      }
    };
  
    enableBluetooth();
  }, [])


    // Event listener for device discovery
   // Event listener for device discovery
useEffect(() => {
  const deviceFoundListener = DeviceEventEmitter.addListener(
    BluetoothManager.EVENT_DEVICE_FOUND,
    (devices) => {
      // Handle found devices here
      // You can emit custom events or update state based on found devices
      // For example, update the state with the found devices
      console.log("Found devices:")
      console.log(devices);

    }
  );

  const deviceAlreadyPairedListener = DeviceEventEmitter.addListener(
    BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
    (devices) => {
      // Handle devices that are already paired
      // You can emit custom events or update state based on already paired devices
      // For example, update the state with the already paired devices
      console.log("Already paired devices:")
      console.log(devices);
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

  // Define the BluetoothEnable function
  const enableBluetooth = async () => {
    try {
      // Request the BLUETOOTH_CONNECT permission
      await requestBluetoothConnectPermission();
  
      // Permission granted, enable Bluetooth
      await BluetoothEnable();
    } catch (error) {
      Alert.alert('Bluetooth Connect Permission Denied');
      console.log('Bluetooth Connect Permission Denied:', error);
    }
  };

  var paired = [];
  
  const BluetoothEnable = async () => {
    try {
      const devices = await BluetoothManager.enableBluetooth();
      if (devices && devices.length > 0) {
        for (var i = 0; i < devices.length; i++) {
          try {
            paired.push(JSON.parse(devices[i]));
          } catch (e) {
            // Ignore any parsing errors
          }
        }
      }
      console.log("Paired devices:", paired);
    } catch (error) {
      Alert.alert(error); // Handle any errors that occur
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
    </PaperProvider>
  );
}

export default App;



