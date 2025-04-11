import React, { useState, useEffect } from "react";
import Connector from "../../../backend/connector";
import "./Dashboard.css";

const connector = new Connector();

function Dashboard({ userId }) {
  const [user, setUser] = useState(null);
  const [chores, setChores] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [friends, setFriends] = useState([]);

  // For chore management
  const [addingChore, setAddingChore] = useState(false);
  const [removingChores, setRemovingChores] = useState(false);
  const [selectedChores, setSelectedChores] = useState([]);
  const [choreTitle, setChoreTitle] = useState("");
  const [choreDescription, setChoreDescription] = useState("");
  const [chorePoints, setChorePoints] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch the logged-in user’s data (including points)
        const userData = await connector.getUser(userId);
        setUser(userData);
        // Fetch the list of chores from the backend
        const choresData = await connector.getChores();
        setChores(choresData);

        const leaderboardData = await connector.getFriendsRanked(id);
        setLeaderboard(leaderboardData);

        const friendsData = await connector.getFriends(id);
        setFriends(friendsData);
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

  // ----------------------------
  // Add Chore Logic
  // ----------------------------
  const handleAddChoreClick = () => {
    setAddingChore(true);
    setRemovingChores(false);
  };

  const handleAddChoreSubmit = async (e) => {
    e.preventDefault();
    try {
      // Generate a unique chore ID (using Date.now() for simplicity)
      const newChoreId = Date.now();
      const newChore = {
        ChoreID: newChoreId,
        title: choreTitle,
        description: choreDescription,
        points: parseInt(chorePoints, 10) || 0,
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

  const handleFinishChore = async (chore) => {
    try {
      if (!user) return console.error("User not loaded.");
      // Update user points by adding chore points
      const updatedUser = { ...user };
      const cp = parseInt(chore.points, 10) || 0;
      updatedUser.score = (updatedUser.score || 0) + cp;
      const userResult = await connector.setUser(updatedUser);
      if (!(userResult && userResult.message === "Success")) {
        console.error("Failed to update user points.");
        return;
      }
      // Delete the chore after finishing it
      await connector.deleteChore(chore.ChoreID);
      await refreshData();
    } catch (error) {
      console.error("Error finishing chore:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {user ? user.firstName : "User"}!</h1>
        {user && <p className="user-points">Points: {user.score || 0}</p>}
      </header>

      <div className="dashboard-main">
        <div className="section points-section">
          <h2>Your Points</h2>
          {user ? (
            <p className="points-value">{user.score || 0}</p>
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
                  {entry.firstName || entry.firstname} {entry.lastName || entry.lastname} - {entry.score || 0} pts
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
                  {friend.firstName || friend.firstname} {friend.lastName || friend.lastname} - {friend.score || 0} pts
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
            <button className="pill-button" onClick={handleAddChoreClick}>+</button>
            <button className="pill-button" onClick={handleRemoveChoreClick}>–</button>
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
            <button type="submit" className="pill-button confirm-add">Confirm Add</button>
          </form>
        )}
        {removingChores && selectedChores.length > 0 && (
          <div className="pill-button confirm-remove" onClick={handleConfirmRemove}>
            Confirm Delete
          </div>
        )}
        <div className="chores-pills-container">
          {chores && chores.length > 0 ? (
            chores.map((chore) => (
              <div key={chore.ChoreID} className="chore-pill">
                {removingChores && (
                  <input
                    type="checkbox"
                    checked={selectedChores.includes(chore.ChoreID)}
                    onChange={() => handleChoreCheckboxChange(chore.ChoreID)}
                    className="chore-checkbox"
                  />
                )}
                <span className="chore-title">{chore.title || chore.name || "Untitled"}</span>
                <span className="chore-description">{chore.description}</span>
                <span className="chore-points">{chore.points} pts</span>
                <button onClick={() => handleFinishChore(chore)} className="pill-button finish-button">
                  Finished
                </button>
              </div>
            ))
          ) : (
            <p>No chores available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
