import React, { useState, useEffect } from "react";
import Timer from "../../../backend/timer";
import Connector from "../../../backend/connector";
import ProgressBar from "./ProgressBar";
import "./Dashboard.css";

const connector = new Connector();

function Dashboard({ userId }) {
  const [user, setUser] = useState(null);
  const [chores, setChores] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [friends, setFriends] = useState([]);
  const [inactive, setInactive] = useState(true);

  // For chore management
  const [addingChore, setAddingChore] = useState(false);
  const [removingChores, setRemovingChores] = useState(false);
  const [selectedChores, setSelectedChores] = useState([]);
  const [choreTitle, setChoreTitle] = useState("");
  const [choreDescription, setChoreDescription] = useState("");
  const [chorePoints, setChorePoints] = useState("");
  const [timer, setTimer] = useState("");
  const [currentTimer, setCurrentTimer] = useState({});
  const [currentChore, setCurrentChore] = useState({});

  // For editing chores
  const [editing, setEditing] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPoints, setEditPoints] = useState("");
  const [editTimerMs, setEditTimerMs] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch the logged-in user’s data (including points)
        const userData = await connector.getUser(userId);
        setUser(userData);
        // Fetch the list of chores from the backend
        const choresData = await connector.getChores();
        setChores(choresData);

        const leaderboardData = await connector.getFriendsRanked(userId);
        setLeaderboard(leaderboardData);

        const friendsData = await connector.getFriends(userId);
        setFriends(friendsData);

        /*const timerData = {};
        choresData.forEach((chore) => {
          timerData[chore.ChoreID] = new Timer(chore.Timer * 60 * 1000);
        });
        setTimers(timerData);*/
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    }
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  // Refresh function to re-fetch data
  async function refreshData() {
    try {
      const id = userId.toString();
      const userData = await connector.getUser(id);
      setUser(userData);
      const choresData = await connector.getChores();
      setChores(choresData);
      const leaderboardData = await connector.getFriendsRanked(id);
      setLeaderboard(leaderboardData);
      const friendsData = await connector.getFriends(id);
      setFriends(friendsData);
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
    }
  }

  const handleAddChoreClick = () => {
    setAddingChore(true);
    setRemovingChores(false);
  };

  const handleAddChoreSubmit = async (e) => {
    e.preventDefault();
    try {
      // Generate a unique chore ID (using Date.now() for simplicity)
      const newChoreId = Number(
        BigInt.asUintN(31, BigInt(Date.now()) * 0x8000000080000001n)
      );
      const newChore = {
        ChoreID: newChoreId,
        Name: choreTitle,
        Description: choreDescription,
        Difficulty: parseInt(chorePoints, 10) || 0,
        Timer: parseInt(timer, 10) || 0,
      };

      const result = await connector.setChore(newChore);
      if (result && result.message === "Success") {
        // Reset form and mode
        setChoreTitle("");
        setChoreDescription("");
        setChorePoints("");
        setAddingChore(false);
        await refreshData();
      } else {
        console.error("Failed to add chore.");
      }
    } catch (error) {
      console.error("Error adding chore:", error);
    }
  };

  const handleRemoveChoreClick = () => {
    setRemovingChores(!removingChores);
    setAddingChore(false);
    setSelectedChores([]);
  };

  const handleChoreCheckboxChange = (choreId) => {
    if (selectedChores.includes(choreId)) {
      setSelectedChores(selectedChores.filter((id) => id !== choreId));
    } else {
      setSelectedChores([...selectedChores, choreId]);
    }
  };

  const handleConfirmRemove = async () => {
    try {
      for (const choreId of selectedChores) {
        await connector.deleteChore(choreId);
      }
      setSelectedChores([]);
      setRemovingChores(false);
      await refreshData();
    } catch (error) {
      console.error("Error removing chores:", error);
    }
  };

  const startChore = (chore) => {
    const durationMs = chore.Timer; /* ms */

    var tmr = new Timer(durationMs);
    setCurrentTimer(tmr);
    setCurrentChore(chore);
    setInactive(false);
  };

  const cancelChore = () => {
    setInactive(true);

    setCurrentTimer({});
    setCurrentChore({});
  };

  const handleFinishChore = async (chore) => {
    const choreTimer = currentTimer;
    if (!choreTimer) {
      alert("Please Start the timer first!");
      return;
    }

    if (!choreTimer.IsDone()) {
      const remMs = choreTimer.TimeRemaining();
      const remMin = Math.ceil(remMs / (1000 * 60));
      console.log(choreTimer.TimeRemaining());
      alert(
        `Please wait ${remMin} more minute(s) before finishing this chore.`
      );
      return;
    }

    try {
      const updatedUser = { ...user };
      const pts = parseInt(chore.Difficulty, 10) || 0;
      updatedUser.Score += pts;
      const userResult = await connector.setUser(updatedUser);
      if (!(userResult && userResult.message === "Success")) {
        console.error("Failed to update user points.");
        return;
      }
      setInactive(true);
      setCurrentTimer({});
      setCurrentChore({});

      //await connector.deleteChore(chore.ChoreID);
      await refreshData();
    } catch (err) {
      console.error("Error finishing chore:", err);
    }
  };

  const handleEditClick = (chore) => {
    setEditing(chore.ChoreID);
    setEditTitle(chore.Name);
    setEditDesc(chore.Description);
    setEditPoints(chore.Difficulty);
    setEditTimerMs(chore.Timer || 0);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await connector.setChore({
      ChoreID: editing,
      Name: editTitle,
      Description: editDesc,
      Difficulty: parseInt(editPoints, 10) || 0,
      Timer: parseInt(editTimerMs, 10) || 0,
    });
    setEditing(null);
    await refreshData();
  };

  return (
    <div className="dashboard-container">
      {!inactive && currentTimer != {} && (
        <div className="chore-overlay">
          <ProgressBar timer={currentTimer} />
          <button
            onClick={() => cancelChore(currentChore)}
            className="pill-button"
          >
            Cancel
          </button>
          <button
            onClick={() => handleFinishChore(currentChore)}
            className="pill-button finish-button"
          >
            Finish
          </button>
        </div>
      )}
      <div className="underlay">
        <header className="dashboard-header">
          <h1>Welcome, {user ? user.FirstName : "User"}!</h1>
          {user && <p className="user-points">Points: {user.Score || 0}</p>}
        </header>

        <div className="dashboard-main">
          <div className="section points-section">
            <h2>Your Points</h2>
            {user ? (
              <p className="points-value">{user.Score || 0}</p>
            ) : (
              <p>Loading points...</p>
            )}
          </div>
          <div className="section leaderboard-section">
            <h2>Leaderboard</h2>
            {leaderboard && leaderboard.length > 0 ? (
              <ul className="leaderboard-list">
                {leaderboard.map((entry, index) => (
                  <li key={entry.UserID} className="leaderboard-item">
                    <span className="rank">{index + 1}.</span>
                    {entry.FirstName || entry.FirstName}{" "}
                    {entry.LastName || entry.LastName} - {entry.Score || 0} pts
                  </li>
                ))}
              </ul>
            ) : (
              <p>No leaderboard data available.</p>
            )}
          </div>
          <div className="section friends-section">
            <h2>Friends</h2>
            {friends && friends.length > 0 ? (
              <ul className="friends-list">
                {friends.map((friend) => (
                  <li key={friend.UserID} className="friend-item">
                    {friend.FirstName || friend.FirstName}{" "}
                    {friend.LastName || friend.LastName} - {friend.Score || 0}{" "}
                    pts
                  </li>
                ))}
              </ul>
            ) : (
              <p>No friends available.</p>
            )}
          </div>
        </div>

        {/* Chores section with add/remove functionality */}
        <div className="chores-controls">
          <div className="chores-header">
            <h2>Chores</h2>
            <div className="buttons">
              <button className="pill-button" onClick={handleAddChoreClick}>
                +
              </button>
              <button className="pill-button" onClick={handleRemoveChoreClick}>
                –
              </button>
            </div>
          </div>
          {addingChore && (
            <form onSubmit={handleAddChoreSubmit} className="add-chore-form">
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={choreTitle}
                  onChange={(e) => setChoreTitle(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <input
                  type="text"
                  value={choreDescription}
                  onChange={(e) => setChoreDescription(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Points:</label>
                <input
                  type="number"
                  value={chorePoints}
                  onChange={(e) => setChorePoints(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Timer (ms):</label>
                <input
                  type="number"
                  value={timer}
                  onChange={(e) => setTimer(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <button type="submit" className="pill-button confirm-add">
                Confirm Add
              </button>
            </form>
          )}
          {removingChores && selectedChores.length > 0 && (
            <div
              className="pill-button confirm-remove"
              onClick={handleConfirmRemove}
            >
              Confirm Delete
            </div>
          )}
          <div className="chores-pills-container">
            {chores && chores.length > 0 ? (
              chores.map((chore) => (
                <div
                  key={chore.ChoreID}
                  className="chore-pill"
                  onClick={() => handleEditClick(chore)}
                >
                  <button
                    onClick={() => startChore(chore)}
                    className="pill-button"
                  >
                    Start
                  </button>
                  <span className="chore-title">{chore.Name}</span>
                  {removingChores && (
                    <input
                      type="checkbox"
                      checked={selectedChores.includes(chore.ChoreID)}
                      onChange={() => handleChoreCheckboxChange(chore.ChoreID)}
                      className="chore-checkbox"
                    />
                  )}
                  <span className="chore-description">{chore.Description}</span>
                  <span className="chore-points">{chore.Difficulty} pts</span>
                  <button
                    onClick={() => handleFinishChore(chore)}
                    className="pill-button finish-button"
                  >
                    Finished
                  </button>
                </div>
              ))
            ) : (
              <p>No chores available.</p>
            )}
            {editing && (
              <form onSubmit={handleEditSubmit} className="edit-chore-form">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <input
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
                <input
                  type="number"
                  value={editPoints}
                  onChange={(e) => setEditPoints(e.target.value)}
                />
                <input
                  type="number"
                  value={editTimerMs}
                  onChange={(e) => setEditTimerMs(e.target.value)}
                />
                <button type="submit"> Save Changes</button>
                <button onClick={() => setEditing(null)}>Cancel</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
