function LeaderboardTab({ leaderboard }) {
    return (
      <div className="section leaderboard-section">
        <h2>Leaderboard</h2>
        {leaderboard.length > 0 ? (
          <ul className="leaderboard-list">
            {leaderboard.map((entry, index) => (
              <li key={entry.UserID} className="leaderboard-item">
                <span className="rank">{index + 1}.</span>{" "}
                {entry.FirstName} {entry.LastName} - {entry.Score} pts
              </li>
            ))}
          </ul>
        ) : (
          <p>No leaderboard data available.</p>
        )}
      </div>
    );
  }
  
  export default LeaderboardTab;
  