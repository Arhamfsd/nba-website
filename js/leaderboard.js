function loadLeaderboardData() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:3000/leaderboard", true);

    xhr.onload = function() {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            console.log("data received");
            
            const mvpDiv = document.getElementById("mvp-ranking");
            data.mvp.forEach((player, index) => {
                mvpDiv.innerHTML += `<p>${index + 1}. ${player}</p>`;
            });

            const scorerDiv = document.getElementById("top-scorer");
            data.topScorer.forEach((player, index) => {
                scorerDiv.innerHTML += `<p>${index + 1}. ${player}</p>`;
            });

            const rookieDiv = document.getElementById("rookie");
            data.rookie.forEach((player, index) => {
                rookieDiv.innerHTML += `<p>${index + 1}. ${player}</p>`;
            });

            const eastDiv = document.getElementById("east");
            data.east.forEach((team, index) => {
                eastDiv.innerHTML += `<p>${index + 1}. ${team}</p>`;
            });

            const westDiv = document.getElementById("west");
            data.west.forEach((team, index) => {
                westDiv.innerHTML += `<p>${index + 1}. ${team}</p>`;
            });
        }
    };

    xhr.send();
}
window.onload = function() {
    fetch('http://localhost:3000/check-login')
    .then(response => response.json())
    .then(data => {
        if (!data.isLoggedIn) {
            window.location.href = 'index.html';
            return;
        }
       
    })
    .catch(error => {
        console.error('Error checking login status:', error);
        window.location.href = 'index.html';
    });
    loadLeaderboardData()
}