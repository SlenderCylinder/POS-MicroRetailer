import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Animated, Text } from "react-native";
import { ActivityIndicator, Button } from "react-native-paper";

export default function Loading({ navigation, retailer }) {
  const logoPosition = useRef(new Animated.Value(0)).current;
  const textPosition = new Animated.Value(500);
  const innovationPosition = useRef(new Animated.Value(0)).current;
  const [innovationText, setInnovationText] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const innovationAnimation = useRef(null);
  const textAnimation = useRef(null);

  useEffect(() => {
    const logoAnimation = Animated.timing(logoPosition, {
      toValue: -100,
      duration: 600,
      useNativeDriver: true,
    });
    logoAnimation.start(() => {
      textAnimation.current = Animated.timing(textPosition, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      });
      textAnimation.current.start(() => {
        setInnovationText("Resilience");
      });
    });

    return () => {
      logoAnimation.stop();
      textAnimation.current.stop();
    };
  }, []);

  useEffect(() => {
    innovationAnimation.current = Animated.timing(innovationPosition, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    });
    innovationAnimation.current.start(() => {
      setTimeout(() => {
        Animated.timing(innovationPosition, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start(() => {
          switch (innovationText) {
            case "Resilience":
              setInnovationText("Food");
              break;
            case "Food":
              setInnovationText("Nutrition");
              break;
            case "Nutrition":
              setInnovationText("Innovation");
              break;
            case "Innovation":
              setInnovationText("Hope");
              break;
            case "Hope":
              checkInternetConnectivity();
              // setInnovationText("Resilience");
              break;
            default:
              break;
          }
        });
      }, 800);
    });

    return () => {
      innovationAnimation.current.stop();
    };
  }, [innovationText]);

  useEffect(() => {
    if (
      innovationText === "Resilience" ||
      innovationText === "Food" ||
      innovationText === "Nutrition"
    ) {
      innovationPosition.setValue(0);
      innovationAnimation.current.start();
    }
  }, [innovationText]);

  const handleRetryButtonPress = async () => {
    setShowRetryButton(false);
    setShowSpinner(true);
    setInnovationText("Resilience");
  };

  //TODO: Add a proper connectivity check 

  const checkInternetConnectivity = async () => {
    try {
      const response = true; //removing network connectivity check temporarily
      if (response) {
          navigation.navigate("Home");
      } else {
        //setShowRetryButton(true);
        navigation.navigate("Home");
      }
    } catch (error) {
      //setShowRetryButton(true);
      navigation.navigate("Home");
    }
  };

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/wfp_white_logo.png")}
        style={[
          styles.logo,
          {
            transform: [
              {
                translateY: logoPosition,
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.textContainer,
          {
            transform: [{ translateX: textPosition }],
          },
        ]}
      >
        <Text style={styles.deliverText}>We Deliver</Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: innovationPosition,
          },
        ]}
      >
        <Text style={styles.innovationText}>{innovationText}</Text>
      </Animated.View>
      {showSpinner && (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator animating={true} color={"#FFFFFF"} />
        </View>
      )}
      {showRetryButton && (
        <View style={styles.retryButtonContainer}>
          <Button mode="contained" onPress={handleRetryButtonPress}>
            No Internet. Retry?
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A6EB4",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    alignSelf: "center",
  },
  textContainer: {
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  deliverText: {
    fontSize: 24,
    // fontWeight: "bold",
    color: "#FFFFFF",
  },
  innovationText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 20,
  },
  spinnerContainer: {
    position: "absolute",
    bottom: 50,
  },
  retryButtonContainer: {
    position: "absolute",
    bottom: 50,
  },
});
