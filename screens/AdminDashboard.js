import React, { useState } from "react";
import { View, Text, TextInput, Switch, StyleSheet } from "react-native";

const AdminDashboard = () => {
  const [onlineMode, setOnlineMode] = useState(false);
  const [printingOn, setPrintingOn] = useState(false);
  const [householdID, setHouseholdID] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Admin Dashboard</Text>

      <View style={styles.switchContainer}>
        <Text>Online Mode:</Text>
        <Switch
          value={onlineMode}
          onValueChange={(value) => setOnlineMode(value)}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text>Printing:</Text>
        <Switch
          value={printingOn}
          onValueChange={(value) => setPrintingOn(value)}
        />
      </View>

      <View style={styles.householdIDContainer}>
        <Text>Household ID:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Household ID"
          value={householdID}
          onChangeText={(text) => setHouseholdID(text)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  householdIDContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
});

export default AdminDashboard;
