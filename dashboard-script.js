// --- Dashboard Logic ---

/**
 * Fetches all documents owned by or shared with the current user using the secure session cookie.
 */
async function loadDocuments() {
    const grid = document.getElementById('docGrid');

    try {
        // Securely fetch docs. No username in the URL; the server reads the Cookie!
        const response = await fetch('/api/my_docs');
        const docs = await response.json();

        // Clear spinner
        grid.innerHTML = '';

        if (docs.length === 0) {
            grid.innerHTML = '<p style="color: #666; grid-column: 1/-1; text-align: center; margin-top: 50px;">No documents yet. Click the + button to start.</p>';
            return;
        }

        grid.innerHTML = docs.map(doc => `
            <div class="doc-card" onclick="window.location.href='/editor/${doc.id}'">
                <div class="doc-preview">📄</div>
                <div class="doc-info">
                    <span class="doc-name" title="${doc.title}">${doc.title}</span>
                    <div class="doc-actions">
                        <span class="doc-date">Owner: ${doc.owner}</span>
                        <button class="delete-btn" onclick="event.stopPropagation(); deleteDoc(${doc.id})" title="Delete document">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error loading documents:", error);
        grid.innerHTML = '<p style="color: #d93025; grid-column: 1/-1; text-align: center;">Error connecting to server.</p>';
    }
}

/**
 * Triggers a prompt for a new document title and calls the secure API.
 */
async function createNewDoc() {
    const title = prompt("Enter Document Title:");
    if (!title || title.trim() === "") return;

    try {
        const response = await fetch('/api/create_doc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Removed the username here! The server reads the Session Cookie instead.
            body: JSON.stringify({
                title: title.trim()
            })
        });

        if (response.ok) {
            const data = await response.json();
            // Move to the Editor with the new database ID
            window.location.href = `/editor/${data.doc_id}`;
        } else {
            alert("Failed to create document. Please try again.");
        }
    } catch (err) {
        console.error("Creation error:", err);
    }
}

/**
 * Deletes a document by ID.
 * @param {number} id The document primary key.
 */
async function deleteDoc(id) {
    if (!confirm("Delete this document permanently?")) return;

    try {
        const response = await fetch(`/api/delete_doc/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Refresh the grid
            loadDocuments();
        } else {
            alert("Could not delete the file.");
        }
    } catch (err) {
        console.error("Delete error:", err);
    }
}

// --- Initial Execution ---
document.addEventListener('DOMContentLoaded', loadDocuments);