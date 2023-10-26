import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function CheckoutItem({ item, handleRemoveFromCart }) {
  const { name, quantity, price,id } = item;
  const total = quantity * price;

  return (
    <View style={styles.container}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{`${id}. ${name}`}</Text>
        <Text style={styles.itemQuantity}>x {quantity}</Text>
      </View>
      <View style={styles.itemPrice}>
        <Text style={styles.itemTotal}>Rs {total.toFixed(2)}</Text>
        <TouchableOpacity onPress={() => handleRemoveFromCart(item)}>
          <MaterialIcons name="delete" size={24} color="#ff0000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    paddingVertical: 10,
  },
  itemDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  itemQuantity: {
    fontSize: 16,
  },
  itemPrice: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
});
