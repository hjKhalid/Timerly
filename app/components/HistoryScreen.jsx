import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearHistory } from "./historyUtils";

const HistoryScreen = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      const storedHistory = await AsyncStorage.getItem("history");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    };
    loadHistory();
  }, []);
  const handleClearHistory = async () => {
    try {
      await clearHistory(); // Clear the history using the utility function
      console.log("History has been cleared.");
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };
  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyText}>{item.name}</Text>
      <Text style={styles.historyText}>{item.completionTime}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.historyTitle}>Timer History</Text>
      <FlatList
        data={history}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderHistoryItem}
      />
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: "#DC3545" }]} // Red button for clear history
        onPress={()=>handleClearHistory()}
      >
        <Text style={styles.buttonText}>Clear History</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  historyItem: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 10,
    elevation: 2,
  },
  historyText: {
    fontSize: 16,
  },
  actionButton: {
    backgroundColor: "#28a745", // Success green color
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff", // White text for contrast
    fontSize: 16,
    fontWeight: "600", // Semi-bold for emphasis
    letterSpacing: 0.5, // Modern spacing
  },
});

export default HistoryScreen;
