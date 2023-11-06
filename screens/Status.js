// Status.js
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  BluetoothStatus,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import DeviceInfo from "react-native-device-info";
import {BluetoothManager} from 'react-native-bluetooth-escpos-printer';


export default function Status() {
  const navigation = useNavigation();
  const [internetStatus, setInternetStatus] = useState("Checking...");
  const [bluetoothStatus, setBluetoothStatus] = useState("Checking...");
  const [deviceInfo, setDeviceInfo] = useState([]);

  useEffect(() => {
    // Check internet connectivity
    NetInfo.fetch().then((state) => {
      setInternetStatus(state.isConnected ? "Connected" : "Disconnected");
    });

    // // Check Bluetooth status
    // BluetoothStatus.getStatus().then((status) => {
    //   setBluetoothStatus(status);
    // });

    const fetchData = async () => {
        try {
            const androidId = await DeviceInfo.getAndroidId();
            const apiLevel = await DeviceInfo.getApiLevel();
            const applicationName = DeviceInfo.getApplicationName();
            const buildId = await DeviceInfo.getBuildId();
            const manufacturer = await DeviceInfo.getManufacturer()
            const model = await DeviceInfo.getModel();
            const bootloader = await DeviceInfo.getBootloader();
            const mac = DeviceInfo.getMacAddress()
            const buildNumber = DeviceInfo.getBuildNumber();
            const bundleId = DeviceInfo.getBundleId();
            const isCameraPresent = await DeviceInfo.isCameraPresent();
            const carrier = await DeviceInfo.getCarrier();
            const codename = await DeviceInfo.getCodename();
            const device = await DeviceInfo.getDevice();
            const deviceId = DeviceInfo.getDeviceId();
            const deviceType = DeviceInfo.getDeviceType();
            const display = await DeviceInfo.getDisplay();
            const deviceName = await DeviceInfo.getDeviceName();
            
            // You can add more properties as needed
    
            const deviceInfoArray = [
                { label: "Android ID", value: androidId },
                { label: "API Level", value: apiLevel },
                { label: "Application Name", value: applicationName },
                { label: "Build ID", value: buildId },
                { label: "Manufacturer", value: manufacturer },
                { label: "Model", value: model },
                { label: "Bootloader", value: bootloader },
                { label: "MAC Address", value: mac },
                { label: "Build Number", value: buildNumber },
                { label: "Bundle ID", value: bundleId },
                { label: "Camera Present", value: isCameraPresent },
                { label: "Carrier", value: carrier },
                { label: "Codename", value: codename },
                { label: "Device", value: device },
                { label: "Device ID", value: deviceId },
                { label: "Device Type", value: deviceType },
                { label: "Display", value: display },
                { label: "Device Name", value: deviceName },
                // Add more properties here
                // ...
            ];
        
            setDeviceInfo(deviceInfoArray);
        } catch(error) {
            console.log(error)
        }
    };
    
    fetchData();

    BluetoothManager.enableBluetooth()
    .then((r) => {

        var paired = [];
        if(r && r.length>0){
            for(var i=0;i<r.length;i++){
                try{
                    paired.push(JSON.parse(r[i])); // NEED TO PARSE THE DEVICE INFORMATION
                }catch(e){
                    //ignore
                }
            }
        }
        console.log("Bluetooth Devices", JSON.stringify(paired))
        setBluetoothStatus(`Enabled\nConnected Devices: ${(JSON.stringify(paired))}`)
    })
    .catch(error => {
      if (error.message === "EVENT_BLUETOOTH_NOT_SUPPORT") {
        setBluetoothStatus("Not supported by device")
        console.log("Bluetooth Error:", "Device does not support Bluetooth. This application needs Bluetooth to function.");
      } else {
        console.log("Bluetooth error:", error);
      }
    });



  }, []);

  return (
    <ScrollView style={styles.container}>
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.header}>Connectivity Check</Text>
      <View style={styles.statusItem}>
        <Text style={styles.label}>Internet Status:</Text>
        <Text style={styles.status}>{internetStatus}</Text>
      </View>
      <View style={styles.statusItem}>
        <Text style={styles.label}>Bluetooth Status:</Text>
        <Text style={styles.status}>{bluetoothStatus}</Text>
      </View> 
    <Text style={styles.header}>Device Information</Text>
    {deviceInfo.length === 0 ? (
      <Text>Loading device information...</Text>
    ) : (
      deviceInfo.map((item, index) => (
        <View key={index} style={styles.infoContainer}>
          <Text style={styles.label}>{item.label}:</Text>
          <Text style={styles.value}>
          {item.label === "Camera Present"
          ? item.value ? "Yes" : "No"
          : typeof item.value === 'object'
          ? JSON.stringify(item.value)
          : item.value}
        </Text>
        </View>
      ))
    )}
  </View>
  </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  statusItem: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
  },
  status: {
    fontSize: 16,
  },
  deviceInfo: {
    fontSize: 14,
    fontFamily: "monospace",
    marginLeft: 10,
  },
});
