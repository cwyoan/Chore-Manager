import React, { useState, useEffect } from "react";
import Connector from "../../../backend/connector";
import "./Dashboard.css";

function Dashboard({ userId }) {
  const [user, setUser] = useState(null);
  const [chores, setChores] = useState([]);
  const connector = new Connector();

  useEffect(() => {
    async function fetchData() {
      try {
        const userData = await connector.getUser(userId);
        setUser(userData);
        const choresData = await connector.getChores();
        setChores(choresData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    }
    if (userId) {
      fetchData();
    }
  }, [userId]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {user ? user.firstName : "User"}!</h1>
        {user && <p>Points: {user.score || 0}</p>}
      </header>
      <section className="chores-section">
        <h2>Your Chores</h2>
        {chores && chores.length > 0 ? (
          <ul className="chores-list">
            {chores.map((chore) => (
              <li key={chore.ChoreID} className="chore-item">
                <h3>{chore.title || chore.name || "Untitled Chore"}</h3>
                <p>{chore.description}</p>
                <p>Points: {chore.points}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No chores available.</p>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
