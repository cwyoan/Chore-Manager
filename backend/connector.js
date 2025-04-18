import axios from "axios";

class Connector {
  /**
   * @constructor Creates a front to backend connection.
   */
  constructor() {}

  /**
   * Attempts to fetch a list of chores.
   * @returns {Dictionary|null} A list of dictionaries of chore data.
   * @async
   */
  async getChores() {
    return (
      await axios.get("http://localhost:8080/api/chores", {
        headers: {
          server: true,
        },
      })
    ).data;
  }

  /**
   * Attempts to fetch a list of users.
   * @returns {Dictionary|null} A list of dictionaries of user data.
   * @async
   */
  async getUsers() {
    return (
      await axios.get("http://localhost:8080/api/users", {
        headers: {
          server: true,
        },
      })
    ).data;
  }

  /**
   * Attempts to set a user's data.
   * @param {Dictionary} params A dictionary of the user's information.
   * @returns {boolean} Whether the operation succeeded or failed.
   * @async
   */
  async setUser(params) {
    return (
      await axios.put(
        "http://localhost:8080/api/users",
        { columns: params },
        {
          headers: {
            server: true,
          },
        }
      )
    ).data;
  }

  /**
   * Attempts to delete a chore.
   * @param {Number} id The chore's ChoreID.
   * @returns {boolean} Whether the operation succeeded or failed.
   * @async
   */
  async deleteChore(id) {
    return (
      await axios.delete(
        "http://localhost:8080/api/chores",
        {},
        {
          headers: {
            server: true,
          },
          params: { id: id },
        }
      )
    ).data;
  }

  /**
   * Attempts to delete a user.
   * @param {Number} id The user's ChoreID.
   * @returns {boolean} Whether the operation succeeded or failed.
   * @async
   */
  async deleteUser(id) {
    return (
      await axios.delete("http://localhost:8080/api/users", {
        headers: {
          server: true,
        },
        params: { id: id },
      })
    ).data;
  }

  /**
   * Attempts to set a chore's data.
   * @param {Dictionary} params A dictionary of the chore's information.
   * @returns {boolean} Whether the operation succeeded or failed.
   * @async
   */
  async setChore(params) {
    return (
      await axios.put(
        "http://localhost:8080/api/chores",
        {
          columns: params,
        },
        {
          headers: {
            server: true,
          },
        }
      )
    ).data;
  }

  /**
   * Returns a list of a user's friends.
   * @param {number} userID The ID of the user.
   * @returns A list of user dictionaries.
   * @async
   */
  async getFriends(userID) {
    return (
      await axios.get(
        "http://localhost:8080/api/users/" + userID + "/friends",
        {
          headers: {
            server: true,
          },
        }
      )
    ).data;
  }

  /**
   * Returns the friend status between two users.
   * @param {number} userID1
   * @param {number} userID2
   * @return {string} REQ_0, REQ_1, BLK_0, BLK_1, ACCPT, EMPTY.
   * @async
   */
  async getFriendStatus(userID1, userID2) {
    return (
      await axios.get(
        "http://localhost:8080/api/users/" + userID1 + "/friends/" + userID2,
        {
          headers: {
            server: true,
          },
        }
      )
    ).data;
  }

  /**
   * Send a friend request between two users.
   * @param {number} userID1 The user sending the request.
   * @param {number} userID2 The user receiving the request.
   * @return {boolean} Whether the request was successfully sent.
   * @async
   */
  async sendFriendRequest(userID1, userID2) {
    return (
      await axios.put(
        "http://localhost:8080/api/users/" + userID1 + "/friends",
        {},
        {
          headers: {
            server: true,
          },
          params: {
            type: "REQ",
            other: userID2,
          },
        }
      )
    ).data;
  }

  /**
   * Block a user as another user.
   * @param {number} userID1 The user sending the block.
   * @param {number} userID2 The user receiving the block.
   * @return {boolean} Whether the block was successfully sent.
   * @async
   */
  async sendBlockRequest(userID1, userID2) {
    return (
      await axios.put(
        "http://localhost:8080/api/users/" + userID1 + "/friends",
        {},
        {
          headers: {
            server: true,
          },
          params: {
            type: "BLOCK",
            other: userID2,
          },
        }
      )
    ).data;
  }

  /**
   * Accept a friend request.
   * @param {number} userID1 The user accepting the request.
   * @param {number} userID2 The user sending the request.
   * @returns {boolean} Whether the request was successfully accepted.
   * @async
   */
  async acceptFriendRequest(userID1, userID2) {
    return (
      await axios.put(
        "http://localhost:8080/api/users/" + userID1 + "/friends",
        {},
        {
          headers: {
            server: true,
          },
          params: {
            type: "ACCPT",
            other: userID2,
          },
        }
      )
    ).data;
  }

  /**
   * Clears the friend status between two users.
   * @param {number} userID1
   * @param {number} userID2
   * @returns Whether the friend status was successfully cleared.
   * @async
   */
  async clearFriendStatus(userID1, userID2) {
    return (
      await axios.delete(
        "http://localhost:8080/api/users/" + userID1 + "/friends/" + userID2,
        {
          headers: {
            server: true,
          },
        }
      )
    ).data;
  }

  /**
   * Returns a list of a user's friends, including themselves, ordered by score.
   * @param {number} userID The ID of the user.
   * @returns A list of user dictionaries.
   * @async
   */
  async getFriendsRanked(userID) {
    return (
      await axios.get("http://localhost:8080/api/users/" + userID + "/ranks", {
        headers: {
          server: true,
        },
      })
    ).data;
  }

  /**
   * Attempts to fetch a user's data.
   * @param {number} userID The ID of the user.
   * @returns {Dictionary|null} A dictionary of all information pertaining to a user, or *null* if no user was found.
   * @async
   */
  async getUser(userID) {
    return (
      await axios.get("http://localhost:8080/api/users/" + userID, {
        headers: {
          server: true,
        },
      })
    ).data;
  }

  /**
   * Attempts to fetch a chore's data.
   * @param {number} choreID The ID of the chore.
   * @returns {Dictionary|null} A dictionary of all information pertaining to a chore, or *null* if no chore was found.
   * @async
   */
  async getChore(choreID) {
    return (
      await axios.get("http://localhost:8080/api/chores/" + choreID, {
        headers: {
          server: true,
        },
      })
    ).data;
  }

  /**
   * Checks if a username and password match.
   * @param {string} email An email.
   * @param {string} password A password.
   * @returns {boolean} True if the email and password match.
   * @async
   */
  async matchLogin(email, password) {
    return (
      await axios.get("http://localhost:8080/api/login", {
        headers: {
          server: true,
        },
        params: {
          email: email,
          password: password,
        },
      })
    ).data;
  }
}

export default Connector;
