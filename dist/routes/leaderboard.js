export function renderLeaderboard(res, baseDir) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Leaderboard - GameCounter</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }

        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }

        header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }

        header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .trophy-icon {
          font-size: 3em;
          margin-bottom: 10px;
        }

        .content {
          padding: 30px;
        }

        .leaderboard {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 30px;
        }

        .leaderboard-entry {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          background: #f8f9fa;
          border-radius: 8px;
          transition: all 0.3s ease;
          border-left: 5px solid #e0e0e0;
        }

        .leaderboard-entry:hover {
          transform: translateX(5px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .rank {
          font-size: 1.8em;
          font-weight: 700;
          min-width: 50px;
          text-align: center;
          margin-right: 15px;
        }

        .rank.first {
          color: #ffd700;
        }

        .rank.second {
          color: #c0c0c0;
        }

        .rank.third {
          color: #cd7f32;
        }

        .leaderboard-entry.first {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
          border-left-color: #ffd700;
        }

        .leaderboard-entry.second {
          background: linear-gradient(135deg, rgba(192, 192, 192, 0.1), rgba(192, 192, 192, 0.05));
          border-left-color: #c0c0c0;
        }

        .leaderboard-entry.third {
          background: linear-gradient(135deg, rgba(205, 127, 50, 0.1), rgba(205, 127, 50, 0.05));
          border-left-color: #cd7f32;
        }

        .player-info {
          flex: 1;
        }

        .player-name {
          font-size: 1.2em;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .player-score {
          font-size: 2em;
          font-weight: 700;
          color: #667eea;
          text-align: right;
          min-width: 100px;
        }

        .score-bar {
          background: #e0e0e0;
          border-radius: 4px;
          height: 8px;
          margin-top: 8px;
          overflow: hidden;
        }

        .score-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 30px;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 1em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
          transform: translateY(-2px);
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #999;
        }

        .empty-state p {
          font-size: 1.1em;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <div class="trophy-icon">🏆</div>
          <h1>Leaderboard</h1>
        </header>

        <div class="content">
          <div id="leaderboardContainer" class="leaderboard"></div>
          <div id="emptyState" class="empty-state" style="display: none;">
            <p>No players yet</p>
          </div>

          <div class="buttons">
            <button class="btn btn-secondary" onclick="goHome()">Back Home</button>
            <button class="btn btn-primary" onclick="newGame()">New Game</button>
          </div>
        </div>
      </div>

      <script>
        let maxScore = 0;

        async function loadLeaderboard() {
          try {
            const resp = await fetch("/api/leaderboard");
            if (!resp.ok) return;

            const players = await resp.json();
            const container = document.getElementById("leaderboardContainer");
            const emptyState = document.getElementById("emptyState");

            if (players.length === 0) {
              emptyState.style.display = "block";
              container.innerHTML = "";
              return;
            }

            emptyState.style.display = "none";
            maxScore = Math.max(...players.map((p) => p.score || 0));

            container.innerHTML = "";
            players.forEach((player, idx) => {
              const rank = idx + 1;
              let rankClass = "";
              let medalEmoji = "▪️";

              if (rank === 1) {
                rankClass = "first";
                medalEmoji = "🥇";
              } else if (rank === 2) {
                rankClass = "second";
                medalEmoji = "🥈";
              } else if (rank === 3) {
                rankClass = "third";
                medalEmoji = "🥉";
              } else {
                medalEmoji = rank;
              }

              const percentage = maxScore > 0 ? (player.score / maxScore) * 100 : 0;

              const entry = document.createElement("div");
              entry.className = "leaderboard-entry " + rankClass;
              entry.innerHTML = \`
                <div class="rank \${rankClass}">\${medalEmoji}</div>
                <div class="player-info">
                  <div class="player-name">\${escapeHtml(player.name)}</div>
                  <div class="score-bar">
                    <div class="score-bar-fill" style="width: \${percentage}%"></div>
                  </div>
                </div>
                <div class="player-score">\${player.score}</div>
              \`;
              container.appendChild(entry);
            });
          } catch (e) {
            console.error("Error loading leaderboard:", e);
          }
        }

        function escapeHtml(text) {
          const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
          return text.replace(/[&<>"']/g, (m) => map[m]);
        }

        function goHome() {
          window.location.href = "/";
        }

        async function newGame() {
          try {
            // Fetch current players from leaderboard
            const resp = await fetch("/api/leaderboard");
            if (!resp.ok) {
              window.location.href = "/";
              return;
            }
            
            const players = await resp.json();
            // Reset scores to 0 for each player
            const resetPlayers = players.map(p => ({ name: p.name, score: 0 }));
            
            // Store players in sessionStorage to pass to enterNames page
            sessionStorage.setItem("__initialPlayers", JSON.stringify(resetPlayers));
            window.location.href = "/enterNames";
          } catch (e) {
            console.error("Error in newGame:", e);
            window.location.href = "/";
          }
        }

        loadLeaderboard();
      </script>
    </body>
    </html>
  `);
}
export async function getLeaderboard(res) {
    try {
        const { getGame } = await import("../gameManager.js");
        const game = getGame();
        if (!game) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify([]));
            return;
        }
        const players = game.getPlayers();
        const sorted = players
            .map((p) => ({ name: p.name, score: p.getScore() }))
            .sort((a, b) => b.score - a.score);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(sorted));
    }
    catch (e) {
        console.error("Error getting leaderboard:", e);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to get leaderboard" }));
    }
}
//# sourceMappingURL=leaderboard.js.map