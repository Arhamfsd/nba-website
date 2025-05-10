window.onload = function() {
    // Check login status
    fetch('http://localhost:3000/check-login')
        .then(response => response.json())
        .then(data => {
            if (!data.isLoggedIn) {
                window.location.href = 'index.html';
                return;
            }
            // If logged in, proceed with loading leaderboard data
            loadLeaderboardData();
        })
        .catch(error => {
            console.error('Error checking login status:', error);
            window.location.href = 'index.html';
        });
};