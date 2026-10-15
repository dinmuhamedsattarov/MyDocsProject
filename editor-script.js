const socket = io();
const pathParts = window.location.pathname.split('/');
const docId = pathParts[pathParts.length - 1];
const editor = document.getElementById('editor');
const status = document.getElementById('status');

// Join the document room. The server already knows who you are!
socket.emit('join', { doc_id: docId });

async function loadDocument() {
    try {
        // Securely fetch docs without passing a username in the URL
        const response = await fetch('/api/my_docs');
        const docs = await response.json();
        const currentDoc = docs.find(d => d.id == docId);
        if (currentDoc) {
            document.getElementById('docTitle').value = currentDoc.title;
            editor.innerHTML = currentDoc.content || '';
        }
    } catch (err) { console.error("Load error:", err); }
}

editor.addEventListener('input', () => {
    socket.emit('edit', { doc_id: docId, content: editor.innerHTML });
});

socket.on('update_text', (data) => {
    // We only receive other users' edits because the backend uses include_self=False
    editor.innerHTML = data.content;
});

editor.addEventListener('mousemove', (e) => {
    const rect = editor.getBoundingClientRect();
    socket.emit('cursor', {
        doc_id: docId,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    });
});

socket.on('update_cursor', (data) => {
    // The server securely injects data.username from the Session Cookie!
    let cursor = document.getElementById('cursor-' + data.username);
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = 'cursor-' + data.username;
        cursor.className = 'remote-cursor';
        cursor.innerHTML = `<span class="cursor-label">${data.username}</span>`;
        editor.appendChild(cursor);
    }
    cursor.style.left = data.x + 'px';
    cursor.style.top = data.y + 'px';
});

function formatText(command) {
    document.execCommand(command, false, null);
    editor.focus();
}

async function shareDocument() {
    const targetUser = prompt("Enter username to share with:");
    if (!targetUser) return;
    const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc_id: docId, username: targetUser })
    });
    if (response.ok) alert(`Shared with ${targetUser}!`);
    else alert("Error sharing document.");
}

async function saveDocument() {
    status.textContent = 'Saving...';
    socket.emit('edit', { doc_id: docId, content: editor.innerHTML });
    setTimeout(() => { status.textContent = 'Saved'; }, 1000);
}

loadDocument();