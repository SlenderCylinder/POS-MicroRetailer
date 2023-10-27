import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";

function BluetoothDeviceList({ devices, onSelect }) {
  return (
    <View>
      <Text>Paired Devices:</Text>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.address}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onSelect(item.address)}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

export default BluetoothDeviceList;
