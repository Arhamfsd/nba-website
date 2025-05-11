let currentUser = null;

        // Function to show alert message
        function showAlert(message, type) {
            const alertDiv = document.getElementById('alertMessage');
            alertDiv.style.display = 'block';
            alertDiv.className = `alert alert-${type}`;
            alertDiv.textContent = message;
            
            // Hide alert after 3 seconds
            setTimeout(() => {
                alertDiv.style.display = 'none';
            }, 3000);
        }

        // Function to toggle between view and edit modes
        function toggleEditMode() {
            const viewMode = document.getElementById('viewMode');
            const editMode = document.getElementById('editMode');
            
            if (viewMode.style.display !== 'none') {
                viewMode.style.display = 'none';
                editMode.style.display = 'block';
                
                // Populate edit form with current values
                document.getElementById('editName').value = currentUser.name;
                document.getElementById('editEmail').value = currentUser.email;
                document.getElementById('editTeam').value = currentUser.favouriteTeam;
                
                // Clear password fields
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
            } else {
                viewMode.style.display = 'block';
                editMode.style.display = 'none';
            }
        }

        // Load user data
        window.addEventListener('DOMContentLoaded', async () => {
            try {
                const res = await fetch("http://localhost:3000/userinfo");
                if (!res.ok) {
                    if (res.status === 401) {
                        window.location.href = 'index.html';
                        return;
                    }
                    throw new Error('Failed to load user data');
                }
                
                currentUser = await res.json();
                document.getElementById("profileName").textContent = currentUser.name;
                document.getElementById("profileEmail").textContent = currentUser.email;
                document.getElementById("profileTeam").textContent = currentUser.favouriteTeam;
            } catch (err) {
                showAlert("Error loading user data. Please try again.", "danger");
            }
        });

        // Handle profile update
        document.getElementById('updateProfileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Validate password fields if any are filled
            if (currentPassword || newPassword || confirmPassword) {
                if (!currentPassword || !newPassword || !confirmPassword) {
                    showAlert("Please fill all password fields", "danger");
                    return;
                }
                if (newPassword !== confirmPassword) {
                    showAlert("New passwords do not match", "danger");
                    return;
                }
            }

            const updatedData = {
                name: document.getElementById('editName').value,
                email: document.getElementById('editEmail').value,
                favouriteTeam: document.getElementById('editTeam').value
            };

            // Add password fields if they are filled
            if (currentPassword && newPassword) {
                updatedData.currentPassword = currentPassword;
                updatedData.newPassword = newPassword;
            }

            try {
                const res = await fetch("http://localhost:3000/update-profile", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedData)
                });

                const data = await res.json();
                
                if (res.ok) {
                    showAlert(data.message || "Profile updated successfully!", "success");
                    currentUser = {
                        name: updatedData.name,
                        email: updatedData.email,
                        favouriteTeam: updatedData.favouriteTeam
                    };
                    
                    // Update view mode display
                    document.getElementById("profileName").textContent = updatedData.name;
                    document.getElementById("profileEmail").textContent = updatedData.email;
                    document.getElementById("profileTeam").textContent = updatedData.favouriteTeam;
                    
                    // Switch back to view mode
                    toggleEditMode();
                } else {
                    showAlert(data.message || "Error updating profile", "danger");
                }
            } catch (err) {
                showAlert("Error updating profile. Please try again.", "danger");
            }
        });