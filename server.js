const http = require('http');

const server = http.createServer((req, res) => {
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        return res.end();
    }

    // Leaderboard GET
    if (req.url === "/leaderboard" && req.method === "GET") {
        const leaderboardData = {
            mvp: ["Player Abc", "Player B", "Player C"],
            topScorer: ["Player Xyz", "Player Y", "Player Z"],
            rookie: ["Player Lebron", "Player M", "Player N"],
            east: ["Team miami", "Team B", "Team Z"],
            west: ["Team laker", "Team Y", "Team Z"]
        };

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(leaderboardData));
        return; // ✅ stop here
    }

    // Feedback POST
    if (req.method === 'POST' && req.url === '/feedback') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            console.log('Received Feedback:', body);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Feedback received successfully!' }));
        });

        return; // ✅ stop here to avoid 404 below
    }

    // 404 for all other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not Found' }));
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
