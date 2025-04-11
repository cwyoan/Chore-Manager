import React, { useState } from "react";
import Connector from "../../../backend/connector";

const connector = new Connector();

function LoginForm({ onAuthSuccess, showMessage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await connector.matchLogin(email, password);
      if (result) {
        const users = await connector.getUsers();
        const loggedInUser = users.find(
          (u) => u.Email.toUpperCase() === email.toUpperCase()
        );

        if (loggedInUser) {
          showMessage("Login successful!");
          onAuthSuccess(loggedInUser.UserID);
        } else {
          showMessage("User record not found.");
        }
      } else {
        showMessage("Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      showMessage("Error during login. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Login</h2>
      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="form-input"
        />
      </div>
      <button type="submit" className="submit-button">
        Login
      </button>
    </form>
  );
}

export default LoginForm;
