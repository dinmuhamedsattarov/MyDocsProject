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
- **Frontend**: HTML5, CSS3, Vanilla JavaScript

## 🗄️ Database Management
The project uses a persistent **SQLite** database (`database.db`). 
For manual data inspection:
1. Open **DBeaver**.
2. Create a new SQLite connection.
3. Point the file path to `database.db` in the project folder.

## 📦 Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/CollaborativeDocs.git](https://github.com/YOUR_USERNAME/CollaborativeDocs.git)
   cd CollaborativeDocs
Install Dependencies:

Bash

pip install flask flask-socketio
Run the Application:

Bash

python app.py
Access the App: Open http://127.0.0.1:5000 in your browser.

📂 Project Structure
app.py: Flask server & Socket.io logic.

index.html: Login/Registration page.

dashboard.html: Document management hub.

editor.html: Collaborative workspace.

editor-script.js: Real-time text and cursor syncing.
