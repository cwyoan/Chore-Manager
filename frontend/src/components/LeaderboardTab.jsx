function LeaderboardTab({ leaderboard, activeUser }) {
  return (
    <div className="section leaderboard-section">
      <h2>Leaderboard</h2>
      {leaderboard.length > 0 ? (
        <ul className="leaderboard-list">
          {leaderboard.map((entry, index) => (
            <li
              key={entry.UserID}
              className={
                "leaderboard-item " +
                (index == 0
                  ? "first-place"
                  : index == 1
                  ? "second-place"
                  : index == 2
                  ? "third-place"
                  : "")
              }
            >
              <span
                className={
                  "rank " +
                  (index == 0
                    ? "first-place"
                    : index == 1
                    ? "second-place"
                    : index == 2
                    ? "third-place"
                    : "")
                }
              >
                {index + 1}.
              </span>{" "}
              <span
                className={entry.UserID == activeUser ? "self-leaderboard" : ""}
              >
                {entry.FirstName} {entry.LastName}
              </span>
              <span> - {entry.Score} pts</span>
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
