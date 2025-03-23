import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import SignupForm from "./components/SignupForm";
import "./App.css";

function App() {
  // userId is null until the user authenticates or overrides
  const [userId, setUserId] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");

  // Called when login/signup is successful.
  const handleAuthSuccess = (authenticatedUserId) => {
    setUserId(authenticatedUserId);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setMessage("");
  };

  // Override function to bypass authentication.
  const overrideToDashboard = () => {
    // For example, using 0 as the guest user id.
    setUserId(0);
    setMessage("Override enabled. Using guest account.");
  };

  // If userId is set, show the Dashboard (home screen).
  if (userId !== null) {
    return <Dashboard userId={userId} />;
  }

  return (
    <div className="modal">
      <div className="card">
        <h1>Chore App</h1>
        <button className="toggle-button" onClick={toggleForm}>
          {isLogin ? "Switch to Signup" : "Switch to Login"}
        </button>
        {isLogin ? (
          <LoginForm onAuthSuccess={handleAuthSuccess} showMessage={setMessage} />
        ) : (
          <SignupForm onAuthSuccess={handleAuthSuccess} showMessage={setMessage} />
        )}
        {message && <p className="message">{message}</p>}
        <button className="override-button" onClick={overrideToDashboard}>
          Override: Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default App;
