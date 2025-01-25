import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

export const addToHistory = async (completedTimer) => {
  const storedHistory = await AsyncStorage.getItem("history");
  const history = storedHistory ? JSON.parse(storedHistory) : [];
  const newHistory = [
    ...history,
    { name: completedTimer.name, completionTime: new Date().toLocaleString() },
  ];
  await AsyncStorage.setItem("history", JSON.stringify(newHistory));
};

export const exportHistory = async () => {
  const storedHistory = await AsyncStorage.getItem("history");
  const history = storedHistory ? JSON.parse(storedHistory) : [];
  const fileUri = FileSystem.documentDirectory + "timer_history.json";
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(history));
  alert(`History exported to: ${fileUri}`);
};

// Clears the history from AsyncStorage
export const clearHistory = async () => {
  try {
    const storedHistory = await AsyncStorage.removeItem("history");
    console.log("History before clearing:", storedHistory);

    await AsyncStorage.clear();

    const historyAfterClear = await AsyncStorage.getItem("history");
    console.log("History after clearing:", historyAfterClear); // Should be null
  } catch (error) {
    console.error("Failed to clear history:", error);
  }
}
