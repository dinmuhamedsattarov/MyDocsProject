from flask import Flask, request, jsonify, render_template, session, redirect, url_for, send_from_directory
from flask_socketio import SocketIO, emit, join_room, disconnect
from functools import wraps
import sqlite3
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")

app = Flask(__name__, template_folder='.', static_folder='.')
app.secret_key = 'super_secret_docs_key_2026'  # This locks session cookies
socketio = SocketIO(app, cors_allowed_origins="*")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    try:
        conn.execute('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)')
        conn.execute('CREATE TABLE IF NOT EXISTS docs (id INTEGER PRIMARY KEY, title TEXT, content TEXT, owner TEXT)')
        conn.execute('CREATE TABLE IF NOT EXISTS permissions (doc_id INTEGER, username TEXT)')
        conn.commit()
    finally:
        conn.close() # CRITICAL: Releases the file immediately

init_db()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            return redirect(url_for('home'))
        return f(*args, **kwargs)
    return decorated_function

# --- PAGE ROUTES ---
@app.route('/')
def home():
    return render_template('index.html')
@app.route('/dashboard')
@login_required
def dashboard_view():
    return render_template('dashboard.html', username=session['username'])

@app.route('/editor/<int:doc_id>')
@login_required          # <-- THE BOUNCER
def editor_view(doc_id):
    return render_template('editor.html', doc_id=doc_id)

# --- AUTH API ---

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    conn = get_db()
    try:
        conn.execute('INSERT INTO users (username, password) VALUES (?, ?)',
                     (data['username'], data['password']))
        conn.commit()
        return jsonify({"status": "success"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"status": "fail", "message": "User exists"}), 400
    finally:
        conn.close()


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    conn = get_db()
    try:
        # Check if a row exists with this exact username and password
        user = conn.execute('SELECT * FROM users WHERE username = ? AND password = ?',
                            (username, password)).fetchone()

        if user:  # If a match is found in the database
            session['username'] = username  # Give the user their Session Cookie!
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "message": "Invalid credentials"}), 401
    finally:
        conn.close()

@app.route('/logout')
def logout():
    session.pop('username', None) # Removes the user from the session
    return redirect(url_for('home'))

# --- DOCUMENT API ---
@app.route('/api/create_doc', methods=['POST'])
@login_required  # <-- Add the bouncer here too!
def create_doc():
    data = request.json
    username = session['username']  # <-- Read securely from the Session Cookie
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute('INSERT INTO docs (title, content, owner) VALUES (?, ?, ?)',
                    (data['title'], '', username))
        doc_id = cur.lastrowid
        conn.commit()
        return jsonify({"doc_id": doc_id})
    finally:
        conn.close()

@app.route('/api/my_docs')
@login_required
def get_docs():
    username = session['username'] # <-- Securely gets the name from the Cookie!
    conn = get_db()
    try:
        docs = conn.execute('''SELECT * FROM docs WHERE owner = ? 
                               OR id IN (SELECT doc_id FROM permissions WHERE username = ?)''',
                            (username, username)).fetchall()
        return jsonify([dict(d) for d in docs])
    finally:
        conn.close()

@app.route('/api/delete_doc/<int:doc_id>', methods=['DELETE'])
def delete_doc(doc_id):
    conn = get_db()
    try:
        conn.execute('DELETE FROM docs WHERE id = ?', (doc_id,))
        conn.commit()
        return jsonify({"status": "success"})
    finally:
        conn.close()

# FIX: Sharing route placed ABOVE static route to avoid 405 error
@app.route('/api/share', methods=['POST'])
def share_doc():
    data = request.json
    conn = get_db()
    try:
        user = conn.execute('SELECT * FROM users WHERE username = ?', (data['username'],)).fetchone()
        if not user: return jsonify({"status": "fail", "message": "User not found"}), 404
        conn.execute('INSERT INTO permissions (doc_id, username) VALUES (?, ?)',
                     (data['doc_id'], data['username']))
        conn.commit()
        return jsonify({"status": "success"}), 200
    finally:
        conn.close()

# --- SOCKET EVENTS ---
@socketio.on('join')
def on_join(data):
    if 'username' not in session:
        disconnect()
        return
    join_room(str(data['doc_id']))

@socketio.on('edit')
def on_edit(data):
    if 'username' not in session:
        disconnect()
        return
    room = str(data['doc_id'])
    conn = get_db()
    try:
        conn.execute('UPDATE docs SET content = ? WHERE id = ?', (data['content'], data['doc_id']))
        conn.commit()
    finally:
        conn.close()
    emit('update_text', data, room=room, include_self=False)

@socketio.on('cursor')
def on_cursor(data):
    if 'username' not in session:
        disconnect()
        return
    # The server safely attaches the real username from the cookie!
    data['username'] = session['username']
    emit('update_cursor', data, room=str(data['doc_id']), include_self=False)

# Catch-all static route at the absolute bottom
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(BASE_DIR, filename)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', debug=True, port=5001)