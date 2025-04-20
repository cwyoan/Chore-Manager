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

  const [timeEndsAt, setTimeEndsAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const handleExitGame = (score) => {
    const nextPlayTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
    localStorage.setItem(`gameCooldownEndsAt-${userId}`, nextPlayTime.toISOString());
    setTimeEndsAt(nextPlayTime);

    const updatedUser = { ...user };
    updatedUser.Score = (updatedUser.Score || 0) + (score || 0);
    connector.setUser(updatedUser);
    setUser(updatedUser);

    const totalSec = Math.floor(nextPlayTime - new Date() / 1000);
    const days = Math.floor(totalSec / (24 * 3600));
    const hours = Math.floor((totalSec % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    setTimeLeft({ days, hours, minutes, seconds });

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

    const stored = localStorage.getItem(`gameCooldownEndsAt-${userId}`);
    if (stored && new Date(stored) > new Date()) {
      setTimeEndsAt(new Date(stored));
    }

  }, [userId]);

  useEffect(() => {
    const stored = localStorage.getItem(`gameCooldownEndsAt-${userId}`);
    if (stored) {
      const date = new Date(stored);
      if (date > new Date()) {
        setTimeEndsAt(date);
      }
    }
  }, []);

  useEffect(() => {
    if (!timeEndsAt) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = timeEndsAt - now;

      if (diff <= 0) {
        setTimeEndsAt(null);
        setTimeLeft(null);
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const days = Math.floor(totalSec / (24 * 3600));
      const hours = Math.floor((totalSec % (24 * 3600)) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [timeEndsAt]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-center">
            <h1>Welcome, {user?.FirstName || "User"}!</h1>
            <p className="user-points">Points: {user?.Score || 0}</p>
          </div>
          <div className="header-right">
            {timeLeft ? (
                <div className="cooldown-timer">
                  <p style={{ fontWeight: "bold", color: "#999" }}> Play again in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</p>
                </div>
            ) : (
                <button onClick={() => setShowGame(true)} className="play-game-button">Play Game</button>
            )}
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
              <GamePlay onExit={(score) => handleExitGame(score)}/>
            </div>
          </div>
      )}
    </div>
  );
}

export default Dashboard;
