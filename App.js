import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Scanner from "./screens/Scanner";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "./screens/Home";
import Pin from "./screens/Pin";
import BeneficiaryDetails from "./screens/BenDetails";
import CartPage from "./screens/CartPage";
import { NavigationContainer } from "@react-navigation/native";
import Loading from "./screens/Loading";
import LanguageSelectionScreen from "./screens/Lang";
import { Alert, StatusBar } from 'react-native';
import { DeviceEventEmitter } from 'react-native';
const Stack = createStackNavigator();
import {BluetoothManager} from 'react-native-bluetooth-escpos-printer';
import { connectPrinter, requestBluetoothConnectPermission } from "./api/btprinter";
import { getComodities } from "./api/comodities";

let activeId = null;
const retailerId = "0001";


function App() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [language, setLanguage] = useState("tam");
  const [retailer, setRetailer] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
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
        
        //Check for already paired devices
        if (paired.length > 0) {
          const firstDevice = paired[0];
          activeId = firstDevice.address;
          setActivedeviceId(activeId); 
          console.log("activedeviceId:", activeId);
          if (activeId){
            connectPrinter(activeId)
          }
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


  useEffect(() => {
    const deviceFoundListener = DeviceEventEmitter.addListener(
      BluetoothManager.EVENT_DEVICE_FOUND,
      (devices) => {
        console.log("Found devices:")
        console.log(devices);

      }
    );

  const deviceAlreadyPairedListener = DeviceEventEmitter.addListener(
    BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
    (devices) => {
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

  return () => {
    deviceFoundListener.remove();
    deviceDiscoverDoneListener.remove();
    deviceAlreadyPairedListener.remove();
  };
}, []);


const keepAliveInterval = setInterval(() => {
  try {
    console.log("Sending printer wake up signal")
    connectPrinter(activeId)
  } catch (error) {
    console.log("Keep-alive error: ", error);
    clearInterval(keepAliveInterval);
  }
}, 2 * 60 * 1000);



  const handleAddToCart = (name, quantity, price,id) => {
    const newItem = { name, quantity, price ,id};
    setCartItems([...cartItems, newItem]);
    console.log(cartItems)
  };

  const handleRemoveFromCart = (item) => {
    const newCartItems = cartItems.filter((cartItem) => cartItem !== item);
    setCartItems(newCartItems);
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
            console.log("Parsing error", e)
          }
        }
      }
      console.log("Paired devices:", paired);
    } catch (error) {
      Alert.alert(error); 
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
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Loading" options={{ headerShown: false }}>
            {(props) => (
              <Loading
                {...props}
                lang={language}
                retailerId={retailerId}
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
              <Pin {...props} retailerId= {retailerId} setSelectedBeneficiary={setSelectedBeneficiary} />
            )}
          </Stack.Screen>
          <Stack.Screen name="Scanner">
            {(props) => (
              <Scanner
                {...props}
                retailerId= {retailerId} setSelectedBeneficiary={setSelectedBeneficiary}
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
                retailerId={retailerId}
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
  );
}

export default App;

export { activeId, retailerId };



