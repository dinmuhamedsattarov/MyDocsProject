# Collaborative Docs Pro 📝

A lightweight, real-time collaborative document editor inspired by Google Docs. This application allows multiple users to type in the same document simultaneously, track each other's cursors in real-time, and manage permissions through a personalized dashboard.

## 🚀 Key Features

- **Real-time Synchronization**: Powered by **Socket.io**, ensuring text updates across all clients instantly without refreshing.
- **Live Cursor Tracking**: See exactly where your collaborators are working with color-coded remote cursors.
- **Secure Authentication**: User registration and login system using **SQLite**.
- **Document Management**: Create, delete, and view documents you own or that have been shared with you.
- **Granular Sharing**: Share documents by username to grant immediate access to other registered users.

## 🛠️ Tech Stack

- **Backend**: Python (Flask)
- **Real-time Communication**: Flask-SocketIO (WebSockets)
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3 (Google Docs UI style), Vanilla JavaScript

## 📦 Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/CollaborativeDocs.git](https://github.com/YOUR_USERNAME/CollaborativeDocs.git)
   cd CollaborativeDocs
Install Dependencies: Ensure you have Python installed, then run:

Bash

pip install flask flask-socketio
Initialize the Database: The app will automatically create database.db on its first run.

Run the Application:

Bash

python app.py
Access the App: Open your browser and navigate to http://127.0.0.1:5000

📂 Project Structure
app.py: The Flask server, API routes, and Socket.io event handling.

index.html: The login/registration gateway.

dashboard.html: User home where documents are managed.

editor.html: The collaborative workspace.

editor-script.js: Handles real-time text and cursor logic.

editor-style.css: The "Google Docs" paginated look and feel.
