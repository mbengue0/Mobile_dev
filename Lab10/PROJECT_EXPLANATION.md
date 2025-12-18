# 📱 Lab 10: Device Features App - Explained!

Hello! 👋 This document explains how this app works in simple terms. Think of this app as a "showcase" of what your phone can do—like seeing where you are, checking your battery, or taking a picture—all built with code!

---

## 🏗️ The Building Blocks

We used **React Native** with **Expo**.
*   **React Native**: Allows us to write code in JavaScript (a web language) and turn it into a real app for iPhone and Android.
*   **Expo**: A set of tools that makes building React Native apps much easier. It gives us pre-made "lego blocks" for things like the Camera and GPS so we don't have to build them from scratch.

### 📂 Project Structure (How files are organized)

We are using **Expo Router**, which is a modern way to handle screens. Instead of writing complex code to say "go to this screen," we just create files in the `app/` folder.

*   **`app/`**: This is the heart of our app.
    *   **`_layout.js`**: This is the "master frame" of the app. It sets up the **Tabs** at the bottom (Sensors, Media, Data). It's like the menu bar that stays there while you switch screens.
    *   **`sensors.js`**: The code for the "Sensors" tab.
    *   **`media.js`**: The code for the "Media" tab.
    *   **`data.js`**: The code for the "Data" tab.
    *   **`index.js`**: A hidden helper that just says "When the app opens, go straight to the Sensors tab."

---

## 🛠️ How We Built Each Feature

Here is a breakdown of every feature and the "magic" behind it.

### 1. 📍 Sensors Tab (`app/sensors.js`)

This screen shows data from your phone's physical sensors.

*   **Accelerometer**:
    *   **What it is**: Measures how you are moving or tilting the phone (X, Y, Z axes).
    *   **How it works**: We use a "listener" that constantly asks the phone "Did we move?" and updates the numbers on the screen instantly.
*   **GPS Location**:
    *   **What it is**: Finds your Latitude and Longitude.
    *   **How it works**: We first **ask for permission** (privacy first!). If you say yes, we ask the satellite "Where am I?" and show the coordinates.
*   **Battery**:
    *   **What it is**: Shows your battery % and if you are charging.
    *   **How it works**: We ask the phone for the battery level (0.0 to 1.0) and multiply by 100 to get the percentage.

### 2. 📸 Media Tab (`app/media.js`)

This screen is about sights and feelings.

*   **Camera**:
    *   **What it is**: A preview of what your camera sees.
    *   **How it works**: We use a component called `<CameraView>`. It's like a TV screen that shows the camera feed. We added a button to flip between the front (selfie) and back cameras by changing a simple variable called `facing`.
*   **Vibration (Haptics)**:
    *   **What it is**: Makes the phone buzz.
    *   **How it works**: We use `Haptics`. When you press a button, we send a command like "do a heavy impact" or "do a success buzz," and the phone's motor vibrates.

### 3. 📇 Data Tab (`app/data.js`)

This screen handles personal data and security.

*   **Biometrics (FaceID / TouchID)**:
    *   **What it is**: Unlocking with your face or fingerprint.
    *   **How it works**: We use `LocalAuthentication`. The code says "Hey phone, scan the user's face." If the phone says "Match confirmed!", we show a "Success" message.
*   **Contacts**:
    *   **What it is**: A list of people in your phone book.
    *   **How it works**:
        1.  Ask for permission.
        2.  Fetch the list of contacts.
        3.  Use a `<FlatList>` (a scrolling list component) to show them one by one.

---

## 🧩 Key Concepts Used

*   **Components**: These are the visual building blocks.
    *   `<View>`: A box or container (like a `div` in HTML).
    *   `<Text>`: Displays words.
    *   `<Button>`: Something you can click.
    *   `<ScrollView>`: Allows the page to scroll if content is too long.
*   **State (`useState`)**: This is the app's "short-term memory." For example, `const [facing, setFacing] = useState('back')` remembers which way the camera is pointing. When we change it, the screen automatically updates.
*   **Effects (`useEffect`)**: This allows us to run code **automatically** when the screen loads. We use this to start listening to the accelerometer or ask for permissions right when you open the tab.
*   **Async/Await**: Some things take time (like finding your GPS location). We use `await` to tell the code "Pause here and wait for the answer before moving on."

---

I hope this helps you understand the project! It's a mix of asking the phone for information and showing it nicely on the screen. 🚀
