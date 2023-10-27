import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Alert } from "react-native";
import api from "../api/api";
import { activeId } from "../App"
import { isPrinterOk } from "../api/btprinter";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import CheckoutItem from "../components/CheckoutItem";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from 'react-native';
import { connectPrinter } from "../api/btprinter";
import { BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer';
import { retailerId } from "../App";

export default function CartPage({
  selectedBeneficiary,
  retailer,
  cartItems,
  handleRemoveFromCart,
  setCartItems,
  setSelectedBeneficiary,
}) {
  const { amount, balance, id } = selectedBeneficiary;
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const [isLoading, setIsLoading] = useState(false);
  const [ loadingState, setloadingState ] = useState("Processing");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigation = useNavigation();
  const [assignedRetailer, setAssignedRetailer] = useState(null);
  const [items, setItems] = useState([]); 
  const [isReceiptPrinted, setIsReceiptPrinted] = useState(false);
  const [checkoutInitiated, setCheckoutInitiated] = useState(false);
  const [CheckoutSuccess, setIsCheckoutSuccess] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (checkoutInitiated) {
        navigation.setOptions({
          gestureEnabled: false, // Disable swipe gestures to navigate away
        });
      }
    }));

    useFocusEffect(
      useCallback(() => {
        const unsubscribe = navigation.addListener("beforeRemove", (e) => {
          e.preventDefault();
          Alert.alert("Not allowed:", "Transaction already processed. Please logout when done");
        });
        return unsubscribe;
      }, [setIsCheckoutSuccess])
    );
  

  // Fetch items from the API and cache them
  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Check if data is cached in AsyncStorage
        const cachedData = await AsyncStorage.getItem("cachedItems");
  
        if (cachedData) {
          // If cached data exists, use it
          setItems(JSON.parse(cachedData));
        } else {
          // If no cached data, fetch from the API
          const response = await api.get('/commodities');
          const fetchedData = response.data;
  
          // Store fetched data in state
          setItems(fetchedData);
  
          // Cache the fetched data in AsyncStorage for future use
          await AsyncStorage.setItem("cachedItems", JSON.stringify(fetchedData));
        }
      } catch (error) {
        console.error("Error fetching items: ", error);
      }
    };
  
    fetchItems();
  }, []);
  

  function generateOrderID(selectedBeneficiary) {
    // Get the current date and time
    const currentDate = new Date();
    
    // Format the date and time components (e.g., YYYYMMDDHHMMSS)
    const year = currentDate.getFullYear().toString();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
    const day = currentDate.getDate().toString().padStart(2, '0');
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const seconds = currentDate.getSeconds().toString().padStart(2, '0');
    
    // Get the beneficiary's ID
    const beneficiaryID = selectedBeneficiary.id;
    
    // Combine the components to create the order ID
    const orderID = `${hours}${minutes}${seconds}-${year}${month}${day}-${beneficiaryID}`;
    
    return orderID;
  }

  useEffect(() => {
    const fetchRetailers = async () => {
      try {
        const response = await api.get("/retailers");
        const retailers = response.data;
        console.log(retailers)
        console.log(retailerId)

        const assignedRetailer = retailers.find((retailer) => retailer.retailerId === retailerId);
        console.log(assignedRetailer)

        if (assignedRetailer) {
          setAssignedRetailer(assignedRetailer);
        } else {
          console.log("Retailer not found with ID: ", retailerId);
        }
      } catch (error) {
        console.error("Error fetching retailers: ", error);
      }
    };

    // Call the function to fetch retailers when the component mounts
    fetchRetailers();
  }, [retailerId]);

  const handlePrintReceipt = async () => {
    const orderID = generateOrderID(selectedBeneficiary);
    console.log("Order ID:", orderID);

    try {

      const currentDate = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Colombo", // Set the time zone to Sri Lanka
      });

      let bal = null;
      let cycle = null;

      const fetchBeneficiaryBal = async () => {
        try {
          const response = await api.get(`/beneficiary/${selectedBeneficiary.id}`);
          const beneficiary = response.data;
          console.log(beneficiary.amount)
          console.log(beneficiary.currentCycle)
          bal = beneficiary.amount
          cycle = beneficiary.currentCycle
          } catch (error) {
          console.error("Error beneficiary balance: ", error);
        }
      };


      await fetchBeneficiaryBal();
      setIsLoading(false);


      // Use the "amount" in your code as needed

      try {
          // Set alignment to CENTER for the header
          BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
          BluetoothEscposPrinter.setBlob(0);
        
          // Print the header
          BluetoothEscposPrinter.printText("WFP - DSD\n\r", {
            encoding: 'GBK',
            codepage: 0,
            widthtimes: 0,
            heigthtimes: 0,
            fonttype: 1,
          });

          // Set alignment to CENTER for the header
          BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
          BluetoothEscposPrinter.setBlob(0);
        
          // Print the header
          BluetoothEscposPrinter.printText("Mini\n\r", {
            encoding: 'GBK',
            codepage: 0,
            widthtimes: 0,
            heigthtimes: 0,
            fonttype: 1,
          });

          
          // Set alignment to CENTER for the header
          BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
          BluetoothEscposPrinter.setBlob(0);
        
          // Print the header
          BluetoothEscposPrinter.printText("Food-City\n\r", {
            encoding: 'GBK',
            codepage: 0,
            widthtimes: 0,
            heigthtimes: 0,
            fonttype: 1,
          });
                  
        
          // Print "Receipt" text
          BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
          BluetoothEscposPrinter.setBlob(0);
          BluetoothEscposPrinter.printText("Receipt\n\r", {
            encoding: 'GBK',
            codepage: 0,
            widthtimes: 0,
            heigthtimes: 0,
            fonttype: 1,
          });
          BluetoothEscposPrinter.printText("--------------------------------\n\r", {});
        
          // Set alignment to LEFT for the rest of the receipt
          BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
        
          // Print customer details, order number, and date
          if (selectedBeneficiary.id) {
            if (assignedRetailer){
            assignedRetailer.name = "Test Retailer"
            assignedRetailer.dsDivision = "T.DS"
            assignedRetailer.gnDivision = "T.GN"}
            else {!assignedRetailer} {
              setAssignedRetailer({"name":"n/a","dsDivision":"n/a","retailerId":"n/a","gnDivision":"n/a"})
            }
          } else if (!selectedBeneficiary) { selectedBeneficiary.name = " "; };

          BluetoothEscposPrinter.printText("Customer: " + selectedBeneficiary.id + "\n\r", {});

          BluetoothEscposPrinter.printText("Order#: "+orderID+"\n\r", {});
          BluetoothEscposPrinter.printText("Date: " + currentDate + "\n\r", {});
    
          // Print a separator line
          BluetoothEscposPrinter.printText("--------------------------------\n\r", {});
        
          BluetoothEscposPrinter.printColumn(
            [16, 7, 9], // Adjust column widths as needed
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.CENTER,
              BluetoothEscposPrinter.ALIGN.RIGHT,
            ],
            ["Item", "Qty", "Amount"], // Column headers
            {}
          );
          
          // Print an empty line
          BluetoothEscposPrinter.printText("\n\r", {});
          
          // Loop through cart items and print each item's details, including the unit and amount
          cartItems.forEach((item) => {
            const itemEng = items.find(i => i.tam === item.name) || items.find(i => i.sin === item.name);
            const itemName = itemEng ? (itemEng.eng || itemEng.sin) : item.name;
            const unit = item.unit || '';
            const itemquantity = (item.Rquantity*item.quantity);
            const amount = (item.price * item.quantity).toFixed(2); // Calculate the total amount for the item
            BluetoothEscposPrinter.printColumn(
              [16, 7, 9], // Adjust column widths as needed
              [
                BluetoothEscposPrinter.ALIGN.LEFT,
                BluetoothEscposPrinter.ALIGN.CENTER,
                BluetoothEscposPrinter.ALIGN.RIGHT,
              ],
              [itemName.toString(), `${itemquantity}${unit}`, amount], {
                encoding: 'UTF8'
              }
            );
          });
          
          // Print an empty line
          BluetoothEscposPrinter.printText("\n\r", {});
          
          // Calculate and print the total quantity and total amount
          let totalQuantity = 0;
          let totalAmount = 0;
          const totalItems = cartItems.length;
          
          cartItems.forEach((item) => {
            totalQuantity += item.quantity;
            totalAmount += item.price * item.quantity;
          });
          
          BluetoothEscposPrinter.printColumn(
            [16, 7, 9], // Adjust column widths as needed
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.CENTER,
              BluetoothEscposPrinter.ALIGN.RIGHT,
            ],
            ["Total", totalItems.toString(), totalAmount.toFixed(2)], {
              encoding: 'UTF8',
              codepage: 11,
            }
          );          


          BluetoothEscposPrinter.printText("\n\r", {});
          BluetoothEscposPrinter.printText("--------------------------------\n\r", {});
        
          // Print additional details
          // BluetoothEscposPrinter.printText("Discount rate: 100%\n\r", {});
          BluetoothEscposPrinter.printText("Total amount: " + totalAmount.toFixed(2) + "\n\r", {});
          BluetoothEscposPrinter.printText("Paid: " + totalAmount.toFixed(2) + "\n\r", {});
          BluetoothEscposPrinter.printText("Voucher Balance: " + bal + "\n\r", {});
          // Print printing timestamp and footer
          if(!assignedRetailer){
            assignedRetailer.name = "N/A"
            assignedRetailer.gnDivision = "N/A"
            assignedRetailer.dsDivision = "N/A"

          }
          BluetoothEscposPrinter.printText("--------------------------------\n\r", {});
          // Check if assignedRetailer.name is null and provide a default value
          console.log("Retailer name ", assignedRetailer.name)
          const retailerName = assignedRetailer.name ? assignedRetailer.name : "n/a";
          BluetoothEscposPrinter.printText("Retailer: " + retailerName + "\n\r", {});

          // Check if assignedRetailer.gnDivision and assignedRetailer.dsDivision are null and provide default values
          const gnDivision = assignedRetailer.gnDivision ? assignedRetailer.gnDivision : "n/a";
          const dsDivision = assignedRetailer.dsDivision ? assignedRetailer.dsDivision : "n/a";
          BluetoothEscposPrinter.printText(gnDivision + " - " + dsDivision + "\n\r", {});
          BluetoothEscposPrinter.printText("--------------------------------\n\r", {});
        
          // Set alignment to CENTER for the thank you message
          BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
        
          // Print a thank you message
          BluetoothEscposPrinter.printText("Thank you for your visit\n\r", {});
          BluetoothEscposPrinter.printText("Voucher expires on " + cycle.to, {});
          BluetoothEscposPrinter.printText("\n\r", {});
          BluetoothEscposPrinter.printText("\n\r", {});
          BluetoothEscposPrinter.printText("\n\r", {});
          BluetoothEscposPrinter.printText("\n\r", {});
          BluetoothEscposPrinter.printText("\n\r", {});
          BluetoothEscposPrinter.printText("\n\r", {});
          BluetoothEscposPrinter.printText("\n\r", {}); }
          catch (warning) {
            console.log("Printer Warning", warning)
          }
  } catch (error) { 
        console.log(error);
        return
    }
  };

  const handleCheckout = async () => {

    setCheckoutInitiated(true)

    navigation.setOptions({
      gestureEnabled: false,
    });


    setloadingState("Processing")

    let retryCount = 0;

    StatusBar.setHidden(true);


    setIsLoading(true);
    
    if (isReceiptPrinted) {
            try {
              setloadingState("Reprinting");
              await handlePrintReceipt();
              setIsLoading(false);
              Alert.alert("Receipt reprinted.")
            } catch (printError) {
              console.error("Error printing receipt:", printError);
              if (retryCount < 5) {
                console.log("Retrying");
                retryCount++;
                // You can add more retries or other logic here.
              } else {
                console.error("Printing failed after multiple retries.");
                setIsLoading(false);
                return;
              }
            }
          } else {
            try {
              setloadingState("Pushing data");
              await api
                .post("/beneficiaries/updateCart", { cartItems, id, retailer })
                .then(async (response) => {
                  setTimeout(async () => {
                    setloadingState("Printing");
                    setIsReceiptPrinted(true);
                    if (isPrinterOk) {
                      try {
                        await connectPrinter(activeId);
                        await delay(3000); // Wait for the printer connection
                      } catch (error) {
                        console.log("Printer error:", error);
                        Alert.alert("Printer disconnected. Check printer and reprint");
                        setIsLoading(false);
                        return; // Stop execution if there's a printer error
                      }
                    } else {
                      console.log("No paired devices found.");
                      Alert.alert("Printer disconnected. Check printer and reprint");
                      setIsLoading(false);
                      setIsCheckoutSuccess(true);
                      return; // Stop execution if there are no paired devices
                    }
                    try {
                      await handlePrintReceipt();
                      setIsCheckoutSuccess(true);
                      Alert.alert("Order placed successfully!") 
                    } catch (printError) {
                      console.error("Error printing receipt:", printError);
                      if (retryCount < 5) {
                        console.log("Retrying");
                        retryCount++;
                        // You can add more retries or other logic here.
                      } else {
                        console.error("Printing failed after multiple retries.");
                        setIsLoading(false);
                        return;
                      }
                    }
                    // Introduce a 2-second delay before setting the loading state back to false
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                    setIsLoading(false);
                  }, 4000);
                  handleRemoveFromCart(null);
                })
                .catch((error) => {
                  console.error(error);
                });
            } catch (error) {
              console.error(error);
            }       
      }
  };

  const handleCloseSuccess = () => {
    navigation.navigate("Home");
    setIsSuccess(false);
    setSelectedBeneficiary(null);
    setCartItems([]);
  };

  const handleReprintReceipt = async () => {
    setIsLoading(true)
    handleCheckout()
  };

  const handleLogoutPress = async () => {
    setIsSuccess(true);
  }


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
    <ScrollView style={styles.container}>
    <View style={styles.container}>
      {cartItems.map((item) => (
        <CheckoutItem
          key={`${item.name}-${item.quantity}`}
          handleRemoveFromCart={checkoutInitiated ? null : handleRemoveFromCart}
          item={item}
          removable={!checkoutInitiated}
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
        onPress={checkoutInitiated ? handleReprintReceipt : handleCheckout}
        disabled={totalPrice === 0 || totalPrice > amount || isLoading}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text style={styles.loadingText}>{loadingState}</Text>
          </View>
        ) : (
          <Text style={styles.checkoutText}>
            {checkoutInitiated ? "Reprint" : "Checkout & Print"}
          </Text>
        )}
      </TouchableOpacity>
      {CheckoutSuccess && (
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleCloseSuccess}
              
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      <Modal visible={isSuccess} animationType="slide" transparent={true}>
        <View style={styles.successContainer}>
          <AntDesign name="checkcircle" size={64} color="green" />
          <Text style={styles.successText}>Thank you!</Text>
          <TouchableOpacity
              style={[
                styles.checkoutButton, // Use the same styles as the "Checkout & Print" button
                isLoading ? styles.loadingButton : null,
              ]}
              onPress={handleCloseSuccess}
            >
              <Text style={styles.checkoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
      </Modal>
      </View>
      </ScrollView>
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
  logoutButton: {
    backgroundColor: "#ff0000",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    justifyContent: 'center'
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', 
  },
  logoutContainer: {
    color: '#ff0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', 
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    textAlign: 'center',
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center', 
  },

});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}