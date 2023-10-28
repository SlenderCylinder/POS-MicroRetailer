import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from "@react-navigation/native";

const Other = ({ setCartItems }) => {
    const [totalAmount, setTotalAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();
    const buttonRef = useRef(null);

    const handleAddToCart = () => {
        setIsLoading(true);
        const newItem = { name: "Other", quantity: 1, price: totalAmount, id: "27", unit: "LOT", Rquantity: 1 };
        setCartItems((prevCartItems) => [...prevCartItems, newItem]);
        console.log("Adding to cart:", newItem);
        setTimeout(() => {
            setIsLoading(false);
            navigation.navigate("Cart");
        }, 2000);
    };

    const handleTotalAmountChange = (value) => {
        if (value === '' || (value >= 0 && value <= 691)) {
            setTotalAmount(value);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Total Other Amount:</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={totalAmount}
                onChangeText={handleTotalAmountChange}
            />
            <TouchableOpacity
                style={styles.button}
                onPress={handleAddToCart}
                disabled={isLoading}
                ref={buttonRef}
            >
                <Text style={styles.buttonText}>Add to Cart</Text>
            </TouchableOpacity>
            {isLoading && <ActivityIndicator style={styles.spinner} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    label: {
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
        width: '100%',
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#4CAF50',
        borderRadius: 4,
        padding: 12,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    spinner: {
        marginTop: 16,
    },
});

export default Other;