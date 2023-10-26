import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  ActivityIndicator,
  Animated,
  Alert,
  ToastAndroid,
  Easing,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useNavigation } from "@react-navigation/native";
import api from "../api/api";

const Scanner = React.memo(({ setSelectedBeneficiary, retailerId }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
      if (status == "granted"){
        ToastAndroid.show('Position QR code in the middle', ToastAndroid.LONG);
      } else {
        ToastAndroid.show('Position allow Camera access', ToastAndroid.LONG);
      }
    })();

  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    try {
      const beneficiary = (await api.get(`/beneficiary/${data}`)).data;
      if (beneficiary) {
        console.log(`Text/PIN input is used to login. Used ID: ${data}`)
        console.log("APK_Assigned_retailer:", retailerId)
        console.log("Retailer assigned:", beneficiary.retailerAssigned);
        if(beneficiary.retailerAssigned == retailerId){
          setSelectedBeneficiary(beneficiary);
          navigation.navigate("BeneficiaryDetails");
        }
        else if (beneficiary.id == "12345678"){
          ToastAndroid.show('Skipping retailer check for test beneficiary', ToastAndroid.SHORT);
          setSelectedBeneficiary(beneficiary);
          navigation.navigate("BeneficiaryDetails");
        }
        else{
          Alert.alert(`Beneficiary not assigned to this retailer.\nAssigned retailer: ${beneficiary.retailerAssigned}`)
        }

      } else {
        Alert.alert("Beneficiary not found");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error finding beneficiary");
    } finally {
      setIsLoading(false);
    }
  };

  // Update this function to use the pop method
  const handleGoBack = () => {
    navigation.pop();
  };

  useEffect(() => {
    Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [animation]);

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.cameraFrame}>
          <View style={styles.cameraFrameRow} />
          <View style={styles.cameraFrameRow}>
            <View style={styles.cameraFrameCol} />
            <View style={styles.cameraFrameCol}>
              <Animated.View
                style={[
                  styles.scannerLine,
                  {
                    transform: [
                      {
                        translateY: animation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 150],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
            <View style={styles.cameraFrameCol} />
          </View>
          <View style={styles.cameraFrameRow} />
        </View>
      </View>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0A6EB4" />
        </View>
      ) : scanned ? (
        <View style={styles.scanResultContainer}>
          <Button title={"Tap to Scan Again"} onPress={handleGoBack} />
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraContainer: {
    position: "relative",
    width: "80%",
    height: "50%",
  },
  cameraFrame: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: "#0A6EB4",
    borderRadius: 10,
    overflow: "hidden",
  },
  cameraFrameRow: {
    flex: 1,
    flexDirection: "row",
  },
  cameraFrameCol: {
    flex: 1,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "#0A6EB4",
    position: "relative",
  },
  scannerLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#0A6EB4",
  },
  scanResultContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 15,
    alignItems: "center",
  },
  loaderContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Scanner;
