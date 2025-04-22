import React, { useState, useEffect } from "react";
import Connector from "../../../backend/connector";
import ChoresTab from "./ChoresTab";
import LeaderboardTab from "./LeaderboardTab";
import FriendsTab from "./FriendsTab";
import GamePlay from "./GamePlay";
import "./Dashboard.css";

const connector = new Connector();

function Dashboard({ userId }) {
  const [user, setUser] = useState(null);
  const [chores, setChores] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState("chores");
  const [showGame, setShowGame] = useState(false);

  const handleExitGame = (score) => {
    const updatedUser = { ...user };
    updatedUser.Score = (updatedUser.Score || 0) + (score || 0);
    connector.setUser(updatedUser);
    setUser(updatedUser);

    setShowGame(false);
  };

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

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-center">
            <h1>Welcome, {user?.FirstName || "User"}!</h1>
            <p className="user-points">Points: {user?.Score || 0}</p>
          </div>
        </div>
      </header>

      <div className="tab-buttons">
        <button onClick={() => setActiveTab("chores")}>Chores</button>
        <button onClick={() => setActiveTab("leaderboard")}>Leaderboard</button>
        <button onClick={() => setActiveTab("friends")}>Friends</button>
      </div>

      <div className="tab-content">
        {activeTab === "chores" && (
          <ChoresTab
            user={user}
            chores={chores}
            refreshData={() => connector.getChores().then(setChores)}
            updateUser={(updated) => {
              connector.setUser(updated);
              setUser(updated);
            }}
            setShowGame={setShowGame}
          />
        )}
        {activeTab === "leaderboard" && (
          <LeaderboardTab leaderboard={leaderboard} activeUser={userId} />
        )}
        {activeTab === "friends" && <FriendsTab userId={userId} />}
      </div>
      {showGame && (
        <div className="chore-overlay">
          <div className="overlay-content">
            <GamePlay onExit={(score) => handleExitGame(score)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
