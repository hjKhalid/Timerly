Timer App

This is a Timer App built with React Native, featuring the ability to create, manage, and delete multiple timers. Each timer can be started, paused, reset, and deleted individually, providing a user-friendly interface for time management.

Features

Create Timers: Add multiple timers with custom names and durations.

Start/Pause Timers: Control the timer's state with simple start and pause functionality.

Reset Timers: Reset a timer back to its original duration.

Delete Timers: Remove a timer from the list.

Visual Progress Bar: Track timer progress with a dynamic progress bar.

Prerequisites

Before you begin, ensure you have the following installed on your development environment:

Node.js

React Native CLI or Expo CLI

A code editor like VS Code

An Android or iOS emulator, or a physical device with debugging enabled

Installation

Clone this repository:

git clone https://github.com/hkhalid/Timerly.git
cd Timerly

Install dependencies:

npm install

Run the app:

For Expo:

expo start

For React Native CLI:

npx react-native run-android # For Android
npx react-native run-ios    # For iOS

How to Use

Add a Timer:

Enter the name and duration of the timer.

Press the "Add Timer" button to create it.

Manage Timers:

Use the Start button to begin the timer.

Use the Pause button to stop the timer temporarily.

Use the Reset button to reset the timer to its original duration.

Delete a Timer:

Press the Delete button next to the timer to remove it from the list.

Code Overview

Key Components

Timer Management:

Timers are managed using a state variable:

const [timers, setTimers] = useState([]);

Each timer object includes:

id: Unique identifier

name: Timer name

duration: Total duration of the timer

remaining: Remaining time

status: Current status (Running or Paused)

Core Functions:

addTimer: Adds a new timer to the list.

toggleTimer: Starts or pauses a timer.

resetTimer: Resets the timer to its original duration.

deleteTimer: Removes a timer by its id.

Dynamic Timer Display:

Rendered with FlatList for smooth performance.

Each timer includes buttons for start, pause, reset, and delete.

Progress Bar

A simple progress bar is used to show the timer's progress visually:

<ProgressBar
  progress={item.remaining / item.duration}
  width={200}
  color="blue"
/>

File Structure

.
├── components
│       HistoryScreen.js # Timer component for individual timer logic
│   └── HomeScreen.js    # Form for creating a new timer
├── index.js                 # Main app entry point
├── styles.js              # Centralized styling
└── README.md              # Documentation

Dependencies

React Native

React Native Progress Bar (for visual progress):

npm install react-native-progress

Future Enhancements

Notification Support: Add local notifications to alert when a timer ends.

Persistent Timers: Store timers in local storage or a database to save them across app restarts.

Custom Styling: Allow users to customize timer colors or themes.

License

This project is licensed under the MIT License.

Contact

For questions or suggestions, feel free to contact:

Email: your-email@example.com

GitHub: hjkhalid



