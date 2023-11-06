import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const AdminLogin = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const hardcodedUsernames = ["admin1", "admin2"];
    const hardcodedPasswords = ["password1", "password2"];

    const isMatch =
      hardcodedUsernames.includes(username) &&
      hardcodedPasswords[hardcodedUsernames.indexOf(username)] === password;

    if (isMatch) {
      navigation.navigate("Admin Dashboard");
    } else {

        ToastAndroid.show("Incorrect Username/Password", ToastAndroid.LONG);
        console.log("Invalid username or password");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Admin Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={(text) => setUsername(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        onChangeText={(text) => setPassword(text)}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: 250,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 30,
    width: 150,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default AdminLogin;
