import React, { useState, useEffect } from "react";
import Connector from "../../../backend/connector";
import ChoresTab from "./ChoresTab";
import LeaderboardTab from "./LeaderboardTab";
import FriendsTab from "./FriendsTab";
import "./Dashboard.css";

const connector = new Connector();

function Dashboard({ userId }) {
    const [user, setUser] = useState(null);
    const [chores, setChores] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [friends, setFriends] = useState([]);
    const [activeTab, setActiveTab] = useState("chores");

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

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {user?.FirstName || "User"}!</h1>
        <p className="user-points">Points: {user?.Score || 0}</p>
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
          />
        )}
        {activeTab === "leaderboard" && <LeaderboardTab leaderboard={leaderboard} />}
        {activeTab === "friends" && <FriendsTab friends={friends} />}
      </div>
    </div>
  );
}

export default Dashboard;
