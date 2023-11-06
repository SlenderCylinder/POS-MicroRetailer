import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  ImageBackground,
  StatusBar,
} from "react-native";
import { Button, Icon } from "react-native-elements";
import Logo from "../assets/logo";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

export default function Home() {
  const navigation = useNavigation();
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const logoTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 0],
  });

  const buttonsTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
        <BlurView intensity={100} style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={["#87CEFA", "#87CEEB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          />
          <Animated.View
            style={[
              styles.logoContainer,
              { transform: [{ translateY: logoTranslateY }] },
            ]}
          >
            <Logo />
          </Animated.View>
          <Animated.View
            style={[
              styles.buttonContainer,
              { transform: [{ translateY: buttonsTranslateY }] },
            ]}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Scanner")}
            >
              <Icon
                style={{ marginRight: 10 }}
                color={"white"}
                name="qrcode"
                type="font-awesome"
              />
              <Text style={{ color: "white", fontSize: 20 }}>Scan QR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { marginTop: 20 }]}
              title="Pin"
              onPress={() => navigation.navigate("Pin")}
            >
              <Icon
                style={{ marginRight: 10 }}
                color={"white"}
                name="lock"
                type="font-awesome"
              />
              <Text style={{ color: "white", fontSize: 20 }}>Enter PIN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                { marginTop: 20, backgroundColor: "red"/* Customize button style */ },
                { width: 105, height: 50, borderRadius: 15, alignSelf: "flex-start", marginBottom: 5, marginLeft: 25, marginTop: 190 }
              ]}
              onPress={() => navigation.navigate("Admin" /* Replace with your screen name */)}
            >
              <Icon
                style={{ marginRight: 10 }}
                color={"white"}
                name="key" 
                type="font-awesome" 
              />
              <Text style={{ color: "white", fontSize: 15 }}>Admin</Text>
            </TouchableOpacity>
          </Animated.View>
        </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  logoContainer: {
    width: 200,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 10,
  },
  buttonContainer: {
    alignItems: "center",
  },
  button: {
    alignItems: "center",
    backgroundColor: "#007AFF",
    borderRadius: 30,
    width: 250,
    color: "white",
    height: 80,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
});
