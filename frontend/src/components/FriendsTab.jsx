import React, { useEffect, useState } from "react";
import Connector from "../../../backend/connector";
import "./FriendsTab.css";

const connector = new Connector();

function FriendsTab({ userId }) {
  const [friends,     setFriends]     = useState([]);
  const [allUsers,    setAllUsers]    = useState([]);
  const [pendingReqs, setPendingReqs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    if (!userId) return;
    try {
      // accepted friends
      const friendsList = await connector.getFriends(userId);
      setFriends(friendsList);

      // all other users
      const users = await connector.getUsers();
      const others = users.filter(u => u.UserID !== userId);
      setAllUsers(others);

      setPendingReqs([]);

      // fetch status for each other user
      for (const u of others) {
        const waitStatus = await connector.getFriendStatus(userId, u.UserID);
        if (waitStatus?.startsWith("REQ")) {
          setPendingReqs(prev => [...prev, { ...u, waitStatus }]);
        }
      }
    } catch (err) {
      console.error("Error fetching friends data:", err);
    }
  };

  // initial load & whenever userId changes
  useEffect(() => {
    fetchData();
  }, [userId]);


  const handleRemoveFriend = async (friendId) => {
    try {
      await connector.clearFriendStatus(userId, friendId);
      await fetchData();
    } catch (err) {
      console.error("Error removing friend:", err);
    }
  };

  const handleSendFriendRequest = async (targetId) => {
    try {
      await connector.sendFriendRequest(userId, targetId);
      alert("Friend request sent!");
      await fetchData();
    } catch (err) {
      console.error("Error sending friend request:", err);
    }
  };

  const handleAcceptFriend = async (requesterId) => {
    try {
      // current user (userId) accepts requesterId
      await connector.acceptFriendRequest(userId, requesterId);
      await fetchData();
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  const handleDeclineFriend = async (requesterId) => {
    try {
      // current user (userId) clears status with requesterId
      await connector.clearFriendStatus(userId, requesterId);
      await fetchData();
    } catch (err) {
      console.error("Error declining request:", err);
    }
  };

  // filter for search
  const filteredUsers = allUsers.filter(u => {
    const name = `${u.FirstName} ${u.LastName}`.toLowerCase();
    return (
      name.includes(searchQuery.toLowerCase()) ||
      u.Email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="friends-tab">
      <h2>Your Friends</h2>
      {friends.length === 0 ? (
        <p>You have no friends yet.</p>
      ) : (
        <ul className="friends-list">
          {friends.map(f => (
            <li key={f.UserID} className="friend-item">
              {f.FirstName} {f.LastName} ({f.Email})
              <button
                className="pill-button remove"
                onClick={() => handleRemoveFriend(f.UserID)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2>Pending Requests</h2>
      {pendingReqs.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <ul className="pending-list">
          {pendingReqs.map(req => {
            // isOutgoing if current user sent it
            const isOutgoing =
              (req.status === "REQ_0" && userId < req.UserID) ||
              (req.status === "REQ_1" && userId > req.UserID);

            return (
              <li key={req.UserID}>
                {req.FirstName} {req.LastName} ({req.Email}){" "}
                {isOutgoing ? (
                  <span className="status-label">Pending</span>
                ) : (
                  <>
                    <button
                      className="pill-button"
                      onClick={() => handleAcceptFriend(req.UserID)}
                    >
                      Accept
                    </button>
                    <button
                      className="pill-button remove"
                      onClick={() => handleDeclineFriend(req.UserID)}
                    >
                      Decline
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <h2>Search Users</h2>
      <input
        type="text"
        placeholder="Search by name or email..."
        className="form-input"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <ul className="search-results">
          {filteredUsers.length === 0 ? (
            <li>No users found.</li>
          ) : (
            filteredUsers.map(u => (
              <li key={u.UserID}>
                {u.FirstName} {u.LastName} ({u.Email})
                <button
                  className="pill-button"
                  onClick={() => handleSendFriendRequest(u.UserID)}
                >
                  Add Friend
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default FriendsTab;
