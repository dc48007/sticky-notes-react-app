# Sticky Notes AI ✨

A feature-rich, interactive sticky notes application built with React, allowing users to create, manage, and customize notes with AI-powered enhancements. Notes can be dragged, dropped, and their appearance (colors, fonts) can be personalized.

## Author

Deepak chaudhary, SDET In Celsior technologies

![Sticky Notes App Screenshot Placeholder](https://via.placeholder.com/800x450.png?text=App+Screenshot+Here)
*(Suggestion: Replace the placeholder above with an actual screenshot or GIF of your app!)*

## Table of Contents
1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Project Setup](#project-setup)
    * [Prerequisites](#prerequisites)
    * [Cloning](#cloning)
    * [Installation](#installation)
    * [Environment Variables](#environment-variables)
    * [Firebase Configuration](#firebase-configuration)
    * [Gemini API Key](#gemini-api-key)
    * [Running the App](#running-the-app)
4. [Available Scripts](#available-scripts)
5. [Key Components Structure](#key-components-structure)
6. [Contributing](#contributing)
7. [License](#license)

## Features

* **📝 Create & Manage Notes:** Add, edit, and delete sticky notes.
* **🎨 Customization:**
    * Change note background colors.
    * Customize font colors and sizes (Small, Medium, Large, XL).
* **✨ AI-Powered Enhancements (via Gemini API):**
    * **Generate Note from Topic:** Input a topic and let AI generate the note content.
    * **Summarize Note:** Get a concise summary of longer notes.
    * **Expand Note:** Elaborate on existing note content for more detail.
* **🔄 Undo Functionality:** Revert your last action (add, delete, update note properties including position).
* **✅ Strike-Through:** Mark notes as completed.
* **🖐️ Drag & Drop:** Freely move and arrange notes within the container. Notes remember their positions.
* **🔥 Real-time Sync:** Notes are saved and synced in real-time using Firebase Firestore.
* **🔐 Authentication:** Uses Firebase Anonymous Authentication to give each user their own set of notes.
* **💅 Styling:** Modern UI styled with Tailwind CSS.
* **🛡️ Error Handling:** Includes basic error boundaries and user feedback for API/Firebase errors.
* **↔️ Overlapping Layout:** Notes are displayed in an overlapping stack, with the focused note brought to the front.

## Technology Stack

* **Frontend:**
    * [React](https://reactjs.org/) (v19+)
    * [Tailwind CSS](https://tailwindcss.com/) (v4+) - For styling.
    * [Lucide React](https://lucide.dev/) - For icons.
    * [react-draggable](https://github.com/react-grid-layout/react-draggable) - For note dragging functionality.
* **Backend & Database:**
    * [Firebase](https://firebase.google.com/):
        * **Firestore:** NoSQL database for storing notes.
        * **Firebase Authentication:** For anonymous user sign-in.
* **AI Integration:**
    * [Google Gemini API](https://ai.google.dev/) - For generative AI features.
* **Build Tool:**
    * Create React App (`react-scripts`)

## Project Setup

Follow these instructions to set up the project for local development.

### Prerequisites
* [Node.js](https://nodejs.org/) (v16.x or later recommended)
* `npm` (usually comes with Node.js) or `yarn`

### Cloning
1.  Clone the repository to your local machine:
    ```bash
    git clone [https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git)
    cd YOUR_REPOSITORY_NAME
    ```
    *(Replace `YOUR_USERNAME/YOUR_REPOSITORY_NAME` with your actual GitHub username and repository name.)*

### Installation
1.  Install the project dependencies:
    ```bash
    npm install
    ```
    (Or `yarn install` if you prefer Yarn)

### Environment Variables
This project requires API keys and configuration details for Firebase and the Gemini API. These should be stored in an environment file.

1.  **Create a `.env` file** in the root directory of the project.
2.  Add the following variables to your `.env` file, replacing the placeholder values with your actual keys and configuration:

    ```env
    REACT_APP_FIREBASE_CONFIG='{"apiKey":"YOUR_FIREBASE_API_KEY","authDomain":"YOUR_FIREBASE_AUTH_DOMAIN","projectId":"YOUR_FIREBASE_PROJECT_ID","storageBucket":"YOUR_FIREBASE_STORAGE_BUCKET","messagingSenderId":"YOUR_FIREBASE_MESSAGING_SENDER_ID","appId":"YOUR_FIREBASE_APP_ID"}'
    REACT_APP_APP_ID_STICKY_NOTES="YOUR_FIREBASE_APP_ID"
    REACT_APP_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    ```

    **Important Notes:**
    * The entire JSON for `REACT_APP_FIREBASE_CONFIG` must be on a **single line** and enclosed in **single quotes**.
    * Ensure your `.env` file is listed in your `.gitignore` file to prevent committing sensitive keys.

### Firebase Configuration
You need to set up a Firebase project to get the `REACT_APP_FIREBASE_CONFIG` and `REACT_APP_APP_ID_STICKY_NOTES` values.

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  **Create a new Firebase project** (or use an existing one).
3.  **Add a Web App** to your Firebase project:
    * From your project's dashboard, click the Web icon (`</>`) or "Add app".
    * Register your app (give it a nickname).
    * Firebase will provide you with a `firebaseConfig` object. Use these values for `REACT_APP_FIREBASE_CONFIG` in your `.env` file. The `appId` from this object is also used for `REACT_APP_APP_ID_STICKY_NOTES`.
4.  **Enable Firestore Database:**
    * In the Firebase console, go to "Firestore Database" and click "Create database".
    * Start in **test mode** for easier initial setup (you can secure it with rules later).
    * Choose a Firestore location.
5.  **Enable Anonymous Authentication:**
    * In the Firebase console, go to "Authentication".
    * Click on the "Sign-in method" tab.
    * Enable "Anonymous" sign-in from the list of providers.

### Gemini API Key
You need an API key to use the Gemini AI features.

1.  Go to [Google AI Studio](https://aistudio.google.com/).
2.  Sign in and click on **"Get API key"** or **"Create API key"**.
    * You might need to create a new Google Cloud project or associate it with an existing one.
3.  Copy the generated API key and use it for `REACT_APP_GEMINI_API_KEY` in your `.env` file.
4.  Ensure the **"Generative Language API"** (or "Gemini API") is enabled in the Google Cloud Console project associated with your API key. You can check this under "APIs & Services" > "Library".

### Running the App
Once dependencies are installed and your `.env` file is configured:

1.  Start the development server:
    ```bash
    npm start
    ```
2.  Open [http://localhost:3000](http://localhost:3000) (or the port specified in your terminal) to view the app in your browser.

## Available Scripts

In the project directory, you can run:

* `npm start`: Runs the app in development mode.
* `npm test`: Launches the test runner in interactive watch mode.
* `npm run build`: Builds the app for production to the `build` folder.
* `npm run eject`: Removes the single build dependency from your project (use with caution).

## Key Components Structure

* **`src/App.js`**: The main application component, managing state, Firebase interactions, AI calls, and overall layout.
* **`src/NoteItem.js`**: Represents a single draggable sticky note, handling its display and interactions.
* **`src/ErrorBoundary.js`**: A React component to catch JavaScript errors and display a fallback UI.
* **Constants & Helpers**: Defined within `App.js` or could be moved to separate utility files for larger projects.

*(You can expand this section if you have more distinct components or a more complex structure.)*

## Contributing

This is currently a personal project. If you'd like to contribute, please fork the repository and open a pull request with your proposed changes.
*(Adjust this section based on whether you want contributions or not.)*

## License

*(Choose a license if you want to make your project open source, e.g., MIT License. You can add a `LICENSE` file to your repository.)*

This project is currently not licensed.

---

**Before committing this `README.md` file:**
* Replace placeholder URLs (like `https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git`).
* Consider adding an actual screenshot.
* Choose and add a license if desired.

This README should give a good overview and setup instructions for your project!