import React, { useState, useEffect } from "react";
import api from "../api/api";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import CheckoutItem from "../components/CheckoutItem";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from 'react-native';
import { BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer';

export default function CartPage({
  selectedBeneficiary,
  retailer,
  cartItems,
  handleRemoveFromCart,
  setCartItems,
  setSelectedBeneficiary,
}) {
  const { amount, id } = selectedBeneficiary;
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigation = useNavigation();

  const handlePrintReceipt = () => {
    // Set alignment to CENTER for the header
    BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    BluetoothEscposPrinter.setBlob(0);
  
    // Print the header
    BluetoothEscposPrinter.printText("WFP - SCOPE\n\r", {
      encoding: 'GBK',
      codepage: 0,
      widthtimes: 3,
      heigthtimes: 3,
      fonttype: 1,
    });
  
    // Print "Receipt" text
    BluetoothEscposPrinter.setBlob(0);
    BluetoothEscposPrinter.printText("Receipt\n\r", {
      encoding: 'GBK',
      codepage: 0,
      widthtimes: 0,
      heigthtimes: 0,
      fonttype: 1,
    });
  
    // Set alignment to LEFT for the rest of the receipt
    BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
  
    // Print customer details, order number, and date
    BluetoothEscposPrinter.printText("Customer: 12345678\n\r", {});
    BluetoothEscposPrinter.printText("Order number: xsd201909210000001\n\r", {});
    BluetoothEscposPrinter.printText("Date: " + "\n\r", {});
    BluetoothEscposPrinter.printText("Retailer: ManthaiEast00001\n\r", {});
  
    // Print a separator line
    BluetoothEscposPrinter.printText("--------------------------------\n\r", {});
  
    // Define column widths for the item details
    let columnWidths = [12, 6, 6, 8];
  
    // Print column headers
    BluetoothEscposPrinter.printColumn(columnWidths, 
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
      ["Item", "Qty", "Price", "Amount"], {});
  
    // Loop through cart items and print each item's details
    cartItems.forEach((item) => {
      BluetoothEscposPrinter.printColumn(columnWidths, 
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
        [item.name, item.quantity.toString(), item.price.toString(), (item.price * item.quantity).toString()], {
          encoding: 'GBK'
        });
    });
  
    // Print an empty line
    BluetoothEscposPrinter.printText("\n\r", {});
  
    // Calculate and print the total
    let totalAmount = 0;
    cartItems.forEach((item) => {
      totalAmount += item.price * item.quantity;
    });
    BluetoothEscposPrinter.printColumn([12, 8, 12], 
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      ["Total", cartItems.length.toString(), totalAmount.toString()], {});
    BluetoothEscposPrinter.printText("\n\r", {});
  
    // Print additional details
    // BluetoothEscposPrinter.printText("Discount rate: 100%\n\r", {});
    BluetoothEscposPrinter.printText("Total amount: " + totalAmount.toFixed(2) + "\n\r", {});
    BluetoothEscposPrinter.printText("Member card payment: 0.00\n\r", {});
    BluetoothEscposPrinter.printText("Points redeemed: 0.00\n\r", {});
    BluetoothEscposPrinter.printText("Payment amount: " + totalAmount.toFixed(2) + "\n\r", {});
    BluetoothEscposPrinter.printText("Payment method: SCOPE Voucher\n\r", {});
    BluetoothEscposPrinter.printText("Notes: None\n\r", {});
    BluetoothEscposPrinter.printText("Tracking number: None\n\r", {});
  
    // Print printing timestamp and footer
    BluetoothEscposPrinter.printText("Printed on: " + "\n\r", {});
    BluetoothEscposPrinter.printText("--------------------------------\n\r", {});
    BluetoothEscposPrinter.printText("Phone: 0771769765 \n\r", {});
    BluetoothEscposPrinter.printText("Address: No: 2 Jawatte Ave, Colombo 00500\n\r", {});
  
    // Set alignment to CENTER for the thank you message
    BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
  
    // Print a thank you message
    BluetoothEscposPrinter.printText("Thank you for your visit       ", {});
  
    // Set alignment back to LEFT for any further printing
    BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
  
    // Finally, initiate the printing
    BluetoothEscposPrinter.printText("\n\r", {}, (success) => {
      if (success) {
        Alert.alert("Printing successful");
      } else {
        Alert.alert("Printing failed");
      }
    });
  };

  const handleCheckout = async () => {

    StatusBar.setHidden(true);


    setIsLoading(true);
    try {
      await api
        .post("/beneficiaries/updateCart", { cartItems, id,retailer })
        .then((response) => {
          setIsLoading(false);
          setIsSuccess(true);
          handleRemoveFromCart(null);
        })
        .catch((error) => {
          setIsLoading(false);
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }
  };
  const handleCloseSuccess = () => {
    navigation.navigate("Home");
    setIsSuccess(false);
    setSelectedBeneficiary(null);
    setCartItems([]);
  };

  useEffect(() => {
    // Load cartItems and index from cache on mount
    const loadCartData = async () => {
      try {
        const cartData = await AsyncStorage.getItem("cartData");
        if (cartData != null) {
          const { cartItems, index } = JSON.parse(cartData);
          if (index === id) {
            setCartItems(cartItems);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadCartData();
  }, []);

  return (
    <View style={styles.container}>
      {cartItems.map((item) => (
        <CheckoutItem
          key={`${item.name}-${item.quantity}`}
          handleRemoveFromCart={handleRemoveFromCart}
          item={item}
        />
      ))}
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total:</Text>
        <Text style={styles.totalPrice}>Rs {totalPrice.toFixed(2)}</Text>
      </View>
      {totalPrice > amount ? (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>Exceeds balance</Text>
        </View>
      ) : null}
      <TouchableOpacity
        style={[
          styles.checkoutButton,
          totalPrice === 0 || totalPrice > amount
            ? styles.disabledButton
            : null,
          isLoading ? styles.loadingButton : null,
        ]}
        onPress={handleCheckout}
        disabled={totalPrice === 0 || totalPrice > amount || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.checkoutText}>Checkout</Text>
        )}
      </TouchableOpacity>
            <TouchableOpacity
        style={styles.checkoutButton}
        onPress={handlePrintReceipt}
        // disabled={totalPrice === 0 || totalPrice > amount || isLoading}
      >
        <Text style={styles.checkoutText}>Print Receipt</Text>
      </TouchableOpacity>
      <Modal visible={isSuccess} animationType="slide" transparent={true}>
        <View style={styles.successContainer}>
          <AntDesign name="checkcircle" size={64} color="green" />
          <Text style={styles.successText}>Order placed successfully!</Text>
          <TouchableOpacity onPress={handleCloseSuccess}>
            <Text style={styles.closeText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
  },
  checkoutButton: {
    backgroundColor: "#007DBC",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  checkoutText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  loadingButton: {
    backgroundColor: "#cccccc",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  messageContainer: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  messageText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  successContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  successText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  closeText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    textDecorationLine: "underline",
  },
});
