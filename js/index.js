      // Login Form Handler
      document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const messageDiv = document.getElementById('loginMessage');

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                messageDiv.className = 'alert alert-success';
                messageDiv.textContent = data.message;
                // Close modal after 2 seconds
                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                    modal.hide();
                    window.location.reload();
                }, 2000);
            } else {
                messageDiv.className = 'alert alert-danger';
                messageDiv.textContent = data.message;
            }
        } catch (error) {
            messageDiv.className = 'alert alert-danger';
            messageDiv.textContent = 'An error occurred. Please try again.';
        }
    });

    // Logout function
    function logout() {
        fetch('http://localhost:3000/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => {
            window.location.reload();
        });
    }

    // Check login status and update UI
    function updateAuthUI() {
        fetch('http://localhost:3000/check-login')
            .then(response => response.json())
            .then(data => {
                const authButtons = document.getElementById('authButtons');
                const userInfo = document.getElementById('userInfo');
                
                if (data.isLoggedIn) {
                    authButtons.style.display = 'none';
                    userInfo.style.display = 'block';
                } else {
                    authButtons.style.display = 'block';
                    userInfo.style.display = 'none';
                }
            });
    }

    // Call this when page loads
    document.addEventListener('DOMContentLoaded', updateAuthUI);

    // Signup Form Handler
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const favouriteTeam = document.getElementById('favouriteTeam').value;
        const messageDiv = document.getElementById('signupMessage');

        try {
            const response = await fetch('http://localhost:3000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, favouriteTeam })
            });

            const data = await response.json();
            
            if (response.ok) {
                messageDiv.className = 'alert alert-success';
                messageDiv.textContent = data.message;
                // Close modal after 2 seconds
                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
                    modal.hide();
                }, 2000);
            } else {
                messageDiv.className = 'alert alert-danger';
                messageDiv.textContent = data.message;
            }
        } catch (error) {
            messageDiv.className = 'alert alert-danger';
            messageDiv.textContent = 'An error occurred. Please try again.';
        }
    });