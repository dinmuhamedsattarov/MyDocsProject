// --- Global State & Elements ---
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// --- Helper for Messages (Matches index.html logic) ---
function showMessage(elementId, text, type) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = text;
    el.className = `message message-${type}`;
    el.style.display = 'block';
}

// --- Login Logic ---
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const msg = document.getElementById('loginMessage');

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                // Save session for Dashboard and Editor
                localStorage.setItem('currentUser', username);
                showMessage('loginMessage', 'Success! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 800);
            } else {
                const data = await response.json();
                showMessage('loginMessage', data.message || 'Invalid username or password', 'error');
            }
        } catch (err) {
            showMessage('loginMessage', 'Server connection failed', 'error');
        }
    });
}

// --- Register Logic ---
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirm = document.getElementById('registerConfirmPassword').value;
        const msg = document.getElementById('registerMessage');

        if (password !== confirm) {
            showMessage('registerMessage', 'Passwords do not match', 'error');
            return;
        }

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                showMessage('registerMessage', 'Account created! Please sign in.', 'success');
                setTimeout(() => {
                    // Trigger the toggle back to login
                    document.getElementById('showLogin').click();
                }, 2000);
            } else {
                const data = await response.json();
                showMessage('registerMessage', data.message || 'Registration failed', 'error');
            }
        } catch (err) {
            showMessage('registerMessage', 'Server connection failed', 'error');
        }
    });
}