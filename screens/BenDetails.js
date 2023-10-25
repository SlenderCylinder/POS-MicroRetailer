import React, { useState } from "react";
import { Text, View, StyleSheet, ScrollView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import items from "../api/comodities";
import Card from "../components/Card";
import CartButton from "../components/CartButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Menu, Divider } from "react-native-paper";
export default function BeneficiaryDetails({
  selectedBeneficiary,
  cartItems,
  setSelectedBeneficiary,
  setLanguage,
  language,
  setCartItems,
  handleAddToCart,
}) {
  const navigation = useNavigation();
  const amount = selectedBeneficiary ? selectedBeneficiary.amount : 0;
  const nic = selectedBeneficiary ? selectedBeneficiary.nic : 0;
  const [menuVisible, setMenuVisible] = useState(false);
  const handleCartPress = () => {
    navigation.navigate("Cart");
  };
  // Show confirmation dialog when the user presses the back button
  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = navigation.addListener("beforeRemove", (e) => {
        e.preventDefault();
        Alert.alert(
          "Confirm",
          "Are you sure you want to go back?",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => {},
            },
            {
              text: "Logout",
              style: "destructive",
              onPress: () => {
                setSelectedBeneficiary(null);
                setCartItems([]);
                navigation.dispatch(e.data.action);
              },
            },
          ],
          { cancelable: false }
        );
      });
      return unsubscribe;
    }, [navigation, setSelectedBeneficiary, setCartItems])
  );
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setMenuVisible(false);
  };
  return (
    <View style={styles.container}>
      <LinearGradient colors={["#007DBC", "#6FB9E8"]} style={styles.card}>
        <Text style={styles.balanceText}>Balance: Rs. {amount}</Text>
      </LinearGradient>
      <View style={styles.header}>
        <Text style={styles.nic}>NIC - {nic}</Text>
        <MaterialCommunityIcons
          name="earth"
          size={30}
          color="#007DBC"
          onPress={() => setMenuVisible(true)}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <MaterialCommunityIcons
              name="earth"
              size={30}
              color="#007DBC"
              style={{ opacity: 0 }}
            />
          }
        >
          <Menu.Item
            onPress={() => handleLanguageChange("eng")}
            title="English"
            icon={language === "eng" ? "check" : "circle-outline"}
          />
          <Divider />
          <Menu.Item
            onPress={() => handleLanguageChange("tam")}
            title="தமிழ்"
            icon={language === "tam" ? "check" : "circle-outline"}
          />
          <Divider />
          <Menu.Item
            onPress={() => handleLanguageChange("sin")}
            title="සිංහල"
            icon={language === "sin" ? "check" : "circle-outline"}
          />
        </Menu>
      </View>
      <ScrollView style={styles.scrollView}>
        {items.map((item, index) => {
          if (index % 2 === 0) {
            return (
              <View key={index} style={styles.cardRow}>
                <Card
                  name={item[language]}
                  price={item.price}
                  Rquantity={item.quantity}
                  max={item.max}
                  unit={item.unit}
                  image={item.image}
                  onAddToCart={handleAddToCart}
                />
                {items[index + 1] && (
                  <Card
                    name={items[index + 1][language]}
                    price={items[index + 1].price}
                    Rquantity={items[index + 1].quantity}
                    unit={items[index + 1].unit}
                    max={items[index + 1].max}
                    image={items[index + 1].image}
                    onAddToCart={handleAddToCart}
                  />
                )}
              </View>
            );
          }
        })}
      </ScrollView>
      <CartButton
        balance={amount}
        onPress={handleCartPress}
        cartItems={cartItems}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  nic: {
    textAlign: "left",
    color: "#007DBC",
    marginRight: 50,
    fontSize: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginVertical: 10,
    alignSelf: "flex-end",
    textAlign: "center",
  },
  card: {
    borderRadius: 10,
    padding: 20,
    margin: 20,
    marginTop: 25,
    width: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  balanceText: {
    fontFamily: "Roboto",
    fontSize: 20,
    fontWeight: "400",
    color: "#fff",
  },
  scrollView: {
    width: "100%",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});