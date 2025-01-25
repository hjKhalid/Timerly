import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SectionList,
  Modal,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "react-native-progress/Bar";
import { exportHistory, addToHistory,clearHistory } from "./historyUtils";

const HomeScreen = ({ navigation }) => {
  const [timers, setTimers] = useState([]);
  const [completedTimer, setCompletedTimer] = useState(null);
  const [alertModalVisible, setalertModalVisible] = useState(false);

  const [expandedCategories, setExpandedCategories] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [newTimer, setNewTimer] = useState({
    name: "",
    duration: "",
    category: "",
  });

  useEffect(() => {
    const loadTimers = async () => {
      const storedTimers = await AsyncStorage.getItem("timers");
      if (storedTimers) {
        setTimers(JSON.parse(storedTimers));
      }
    };
    loadTimers();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("timers", JSON.stringify(timers));
  }, [timers]);

  const addTimer = () => {
    if (!newTimer.name || !newTimer.duration || !newTimer.category) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const timer = {
      id: Date.now().toString(),
      name: newTimer.name,
      duration: parseInt(newTimer.duration),
      category: newTimer.category,
      remaining: parseInt(newTimer.duration),
      status: "Paused",
      halfwayAlert: false, // New field
      alertTriggered: false, // Tracks if the halfway alert was shown
    };
    setTimers([...timers, timer]);
    setNewTimer({ name: "", duration: "", category: "" });
    setModalVisible(false);
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleTimer = (id) => {
    setTimers((prev) =>
      prev.map((timer) => {
        if (timer.id === id) {
          if (timer.status === "Running") {
            clearInterval(timer.interval);
            return { ...timer, status: "Paused" };
          } else {
            const interval = setInterval(() => {
              setTimers((currentTimers) => {
                return currentTimers.map((t) => {
                  if (t.id === id) {
                    const remaining = t.remaining - 1;
                    if (remaining <= 0) {
                      clearInterval(interval);
                      addToHistory(t);
                      setCompletedTimer(t.name); // Set the name of the completed timer
                      setalertModalVisible(true);
                      return { ...t, remaining: 0, status: "Completed" };
                    }
                    return { ...t, remaining };
                  }
                  return t;
                });
              });
            }, 1000);
            return { ...timer, status: "Running", interval };
          }
        }
        return timer;
      })
    );
  };
  const resetTimer = (id) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id
          ? { ...timer, remaining: timer.duration, status: "Paused" }
          : timer
      )
    );
  };

  const groupedTimers = timers.reduce((groups, timer) => {
    const category = timer.category;
    if (!groups[category]) groups[category] = [];
    groups[category].push(timer);
    return groups;
  }, {});

  const sectionData = Object.keys(groupedTimers).map((category) => ({
    title: category,
    data: expandedCategories[category] ? groupedTimers[category] : [],
  }));
  const handleStartAll = (category) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.category === category && timer.status !== "Completed"
          ? {
              ...timer,
              status: "Running",
              interval: setInterval(() => {
                setTimers((currentTimers) =>
                  currentTimers.map((t) =>
                    t.id === timer.id
                      ? {
                          ...t,
                          remaining: Math.max(0, t.remaining - 1),
                          status: t.remaining <= 1 ? "Completed" : "Running",
                        }
                      : t
                  )
                );
              }, 1000),
            }
          : timer
      )
    );
  };

  const handlePauseAll = (category) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) => {
        if (timer.category === category && timer.status === "Running") {
          clearInterval(timer.interval);
          return { ...timer, status: "Paused" };
        }
        return timer;
      })
    );
  };

  const handleResetAll = (category) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.category === category
          ? { ...timer, remaining: timer.duration, status: "Paused" }
          : timer
      )
    );
  };
  const deleteTimer = (id) => {
    setTimers((prevTimers) => prevTimers.filter((timer) => timer.id !== id));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Add Timer</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("History")}
      >
        <Text style={styles.buttonText}>View History</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={exportHistory}>
        <Text style={styles.buttonText}>Export History</Text>
      </TouchableOpacity>
      <SectionList
        sections={sectionData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{item.name + ""}</Text>
            <ProgressBar
              progress={item.remaining / item.duration}
              width={200}
              color="blue"
            />
            <Text style={styles.timerText}>{item.remaining}s</Text>
            <Text style={styles.timerText}>{item.status}</Text>
            <View style={styles.timerActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => toggleTimer(item.id)}
              >
                <Text style={styles.buttonText}>
                  {item.status === "Running" ? "Pause" : "Start"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => resetTimer(item.id)}
              >
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#dc3545" }]} // Red button for delete
                onPress={() => deleteTimer(item.id)} // Call deleteTimer function
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <TouchableOpacity
            style={styles.sectionHeaderContainer}
            onPress={() => toggleCategory(title)}
          >
            <View style={styles.headingSection}>
              <Text style={styles.sectionHeader}>{title}</Text>
              <Text style={styles.sectionToggle}>
                {expandedCategories[title] ? "-" : "+"}
              </Text>
            </View>

            <View style={styles.bulkActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#007BFF" }]}
                onPress={() => handleStartAll(title)}
              >
                <Text style={styles.buttonText}>Start All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#FFC107" }]}
                onPress={() => handlePauseAll(title)}
              >
                <Text style={styles.buttonText}>Pause All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#DC3545" }]}
                onPress={() => handleResetAll(title)}
              >
                <Text style={styles.buttonText}>Reset All</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Timer</Text>
          <TextInput
            placeholder="Name"
            style={styles.input}
            value={newTimer.name}
            onChangeText={(text) =>
              setNewTimer((prev) => ({ ...prev, name: text }))
            }
          />
          <TextInput
            placeholder="Duration (seconds)"
            style={styles.input}
            keyboardType="numeric"
            value={newTimer.duration}
            onChangeText={(text) =>
              setNewTimer((prev) => ({ ...prev, duration: text }))
            }
          />
          <TextInput
            placeholder="Category"
            style={styles.input}
            value={newTimer.category}
            onChangeText={(text) =>
              setNewTimer((prev) => ({ ...prev, category: text }))
            }
          />
          <View style={styles.modalButton}>
            <TouchableOpacity style={styles.button} onPress={addTimer}>
              <Text style={styles.buttonTextModal}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonTextModal}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={alertModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Congratulations!</Text>
          <Text style={styles.timerText}>
            The timer "{completedTimer}" is complete!
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setalertModalVisible(!alertModalVisible)} // Close the modal
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9fafb", // Softer background for a modern look
  },
  button: {
    backgroundColor: "#007BFF", // Primary button color
    paddingVertical: 14, // Larger vertical padding
    paddingHorizontal: 24, // Prominent button
    borderRadius: 8, // Smooth rounded corners
    marginBottom: 12, // Consistent spacing
    alignItems: "center",
    justifyContent: "center",
    elevation: 4, // Subtle shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff", // White text for contrast
    fontSize: 16,
    fontWeight: "600", // Semi-bold for emphasis
    letterSpacing: 0.5, // Modern spacing
  },
  buttonTextModal: {
    width: 50,
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  timerContainer: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 10, // Smooth corners
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headingSection:{
    display:"flex",
    flexDirection:"row",
    justifyContent:"space-between"
  },
  timerText: {
    fontSize: 16,
    fontWeight: "500", // Medium weight for readability
    color: "#1f2937", // Dark gray for text
  },
  timerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dimmed modal background
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700", // Bold and prominent
    marginBottom: 20,
    color: "#1f2937", // Dark gray for focus
    textAlign: "center",
    letterSpacing: 0.5, // Balanced letter spacing
  },
  spinner: {
    marginVertical: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    width: "100%",
    marginBottom: 15,
    fontSize: 16,
    fontWeight: "400", // Normal weight for forms
    color: "#374151", // Neutral dark gray for text
    backgroundColor: "#f9fafb",
  },
  sectionHeaderContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#f1f5f9", // Light background for sections
    borderRadius: 8,
    marginTop: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600", // Medium-bold for titles
    color: "#1f2937",
    letterSpacing: 0.3, // Subtle spacing for elegance
  },
  sectionToggle: {
    fontSize: 20,
    fontWeight: "700", // Bold for toggles
    color: "#007BFF", // Blue accent
    textTransform: "uppercase", // Modern toggle design
  },
  bulkActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
});


export default HomeScreen;
