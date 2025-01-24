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
