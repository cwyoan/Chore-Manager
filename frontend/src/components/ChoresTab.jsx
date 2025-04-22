import React, { useState } from "react";
import Timer from "../../../backend/timer";
import Connector from "../../../backend/connector";
import ProgressBar from "./ProgressBar";

const connector = new Connector();

function ChoresTab({ user, chores, refreshData, updateUser, setShowGame }) {
  const [addingChore, setAddingChore] = useState(false);
  const [removingChores, setRemovingChores] = useState(false);
  const [selectedChores, setSelectedChores] = useState([]);
  const [choreTitle, setChoreTitle] = useState("");
  const [choreDescription, setChoreDescription] = useState("");
  const [chorePoints, setChorePoints] = useState("");
  const [timer, setTimer] = useState("");

  const [currentTimer, setCurrentTimer] = useState(null);
  const [currentChore, setCurrentChore] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPoints, setEditPoints] = useState("");
  const [editTimerMs, setEditTimerMs] = useState("");

  const handleAddChoreClick = () => {
    setAddingChore(true);
    setRemovingChores(false);
  };

  const handleAddChoreSubmit = async (e) => {
    e.preventDefault();
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
    if (result?.message === "Success") {
      setChoreTitle("");
      setChoreDescription("");
      setChorePoints("");
      setTimer("");
      setAddingChore(false);
      refreshData();
    }
  };

  const handleRemoveChoreClick = () => {
    setRemovingChores(!removingChores);
    setAddingChore(false);
    setSelectedChores([]);
  };

  const handleChoreCheckboxChange = (choreId) => {
    setSelectedChores((prev) =>
      prev.includes(choreId)
        ? prev.filter((id) => id !== choreId)
        : [...prev, choreId]
    );
  };

  const handleConfirmRemove = async () => {
    for (const choreId of selectedChores) {
      await connector.deleteChore(choreId);
    }
    setSelectedChores([]);
    setRemovingChores(false);
    refreshData();
  };

  const startChore = (chore) => {
    setCurrentTimer(new Timer(chore.Timer));
    setCurrentChore(chore);
  };

  const cancelChore = () => {
    setCurrentTimer(null);
    setCurrentChore(null);
  };

  const handleFinishChore = async () => {
    if (!currentTimer?.IsDone()) {
      alert(`Please wait until time is up!`);
      return;
    }
    setShowGame(true);

    const updatedUser = {
      ...user,
      Score: (user.Score || 0) + (currentChore.Difficulty || 0),
    };

    cancelChore();

    try {
      const result = await connector.setUser(updatedUser);
      if (result?.message !== "Success") {
        alert("Failed to update user score.");
      }

      updateUser(updatedUser);
      await refreshData();

    } catch (err) {
      console.error("Error finishing chore:", err);
      alert("Something went wrong while finishing the chore.");
    }
  };

  const handleEditClick = (chore) => {
    setEditing(chore.ChoreID);
    setEditTitle(chore.Name);
    setEditDesc(chore.Description);
    setEditPoints(chore.Difficulty);
    setEditTimerMs(chore.Timer);
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
    refreshData();
  };

  return (
    <div className="chores-tab">
      {currentTimer && currentChore && (
        <div className="chore-overlay">
          <div className="overlay-content">
            <h2 className="chore-title-overlay">{currentChore.Name}</h2>
            <ProgressBar timer={currentTimer} />
            <div className="button-row">
              <button onClick={cancelChore} className="pill-button">
                Cancel
              </button>
              <button onClick={handleFinishChore} className="pill-button">
                Finish
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="chores-controls">
        <div className="chores-header">
          <h2>Chores</h2>
          {user && user.UserID == 1 && (
            <div className="buttons">
              <button className="pill-button" onClick={handleAddChoreClick}>
                +
              </button>
              <button className="pill-button" onClick={handleRemoveChoreClick}>
                –
              </button>
            </div>
          )}
        </div>

        {addingChore && (
          <form onSubmit={handleAddChoreSubmit} className="add-chore-form">
            <input
              value={choreTitle}
              onChange={(e) => setChoreTitle(e.target.value)}
              placeholder="Title"
              required
            />
            <input
              value={choreDescription}
              onChange={(e) => setChoreDescription(e.target.value)}
              placeholder="Description"
              required
            />
            <input
              type="number"
              value={chorePoints}
              onChange={(e) => setChorePoints(e.target.value)}
              placeholder="Points"
              required
            />
            <input
              type="number"
              value={timer}
              onChange={(e) => setTimer(e.target.value)}
              placeholder="Timer (ms)"
              required
            />
            <button type="submit" className="pill-button confirm-add">
              Confirm Add
            </button>
          </form>
        )}

        {removingChores && selectedChores.length > 0 && (
          <button
            className="pill-button confirm-remove"
            onClick={handleConfirmRemove}
          >
            Confirm Delete
          </button>
        )}

        <div className="chores-pills-container">
          {chores.length > 0 ? (
            chores.map((chore) => (
              <div key={chore.ChoreID} className="chore-pill">
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
                {user && user.UserID == 1 && (
                  <button
                    onClick={() => handleEditClick(chore)}
                    className="pill-button"
                  >
                    Edit
                  </button>
                )}
              </div>
            ))
          ) : (
            <p>No chores available.</p>
          )}
        </div>

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
            <button type="submit">Save Changes</button>
            <button onClick={() => setEditing(null)}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ChoresTab;
