var mysql = require("mysql");

class Database {
  #connection = null;

  /**
   * @constructor Starts an SQL server connection.
   */
  constructor() {
    this.#connection = mysql.createConnection({
      host: "choredatabase.mysql.database.azure.com",
      user: "choredev",
      password: "0!ChoreAdmin",
      database: "choredata",
      port: 3306,
    });

    this.#connection.connect();
  }

  /**
   * Close the server connection.
   */
  close() {
    this.#connection.end();
  }

  /**
   * Attempts to connect to the server and return its status.
   * @returns An error message or "Connected".
   */
  checkConnection() {
    return new Promise((resolve, reject) => {
      this.#connection.connect(function (err) {
        if (err) return reject(err);
        return resolve("Connected");
      });
    }).catch((error) => {
      return error;
    });
  }

  /**
   * Attempts to fetch a user's data.
   * @param {number} userID The ID of the user.
   * @returns {Dictionary|null} A dictionary of all information pertaining to a user, or *null* if no user was found.
   * @async
   */
  async getUser(userID) {
    var user = await this.query("select * from users where UserID = ?", [
      userID,
    ]);

    if (user.length == 0) return null;

    return user[0];
  }

  /**
   * Attempts to set a user's data.
   * @param {Dictionary} params A dictionary of the user's information.
   * @returns {boolean} Whether the operation succeeded or failed.
   * @async
   */
  async setUser(params) {
    if (!("UserID" in params)) return false;

    var id = params["UserID"];

    if (await this.getUser(id))
      return (
        await this.#tryQuery("update users set ? where UserID = ?", [
          params,
          id,
        ])
      )[0];

    return (await this.#tryQuery("insert into users set ?", [params]))[0];
  }

  /**
   * Returns a list of a user's friends.
   * @param {number} userID The ID of the user.
   * @returns A list of user dictionaries.
   * @async
   */
  async getFriends(userID) {
    return await this.query(
      "select * from users where users.UserID in ((select UserID from friends where FriendID = ? and Status = 'ACCPT') union (select FriendID from friends where UserID = ? and Status = 'ACCPT'))",
      [userID, userID]
    );
  }

  /**
   * Returns a list of a user's friends, including themselves, ordered by score.
   * @param {number} userID The ID of the user.
   * @returns A list of user dictionaries.
   * @async
   */
  async getFriendsRanked(userID) {
    return await this.query(
      "select * from users where users.UserID in ((select UserID from friends where FriendID = ? and Status = 'ACCPT') union (select FriendID from friends where UserID = ? and Status = 'ACCPT') union (select UserID from users where UserID = ?)) order by score desc",
      [userID, userID, userID]
    );
  }

  /**
   * Returns the friend status between two users.
   * @param {number} userID1
   * @param {number} userID2
   * @return {string} REQ_0, REQ_1, BLK_0, BLK_1, ACCPT, EMPTY.
   * @async
   */
  async getFriendStatus(userID1, userID2) {
    var result = await this.query(
      "select Status from friends where UserID = ? and FriendID = ?",
      [Math.min(userID1, userID2), Math.max(userID1, userID2)]
    );

    if (result.length == 0) return "EMPTY";

    return result[0]["Status"];
  }

  /**
   * Send a friend request between two users.
   * @param {number} userID1 The user sending the request.
   * @param {number} userID2 The user receiving the request.
   * @return {boolean} Whether the request was successfully sent.
   * @async
   */
  async sendFriendRequest(userID1, userID2) {
    if (userID1 == userID2) return false;

    var status = await this.getFriendStatus(userID1, userID2);

    if (status == "BLK_0" || status == "BLK_1" || status == "ACCPT")
      return false;

    var reqType = "REQ_0";

    if (userID1 > userID2) reqType = "REQ_1";

    if (status == reqType) return true;

    if (status == "EMPTY")
      return (
        await this.#tryQuery("insert into friends values (?, ?, ?)", [
          Math.min(userID1, userID2),
          Math.max(userID1, userID2),
          reqType,
        ])
      )[0];

    return await this.acceptFriendRequest(userID1, userID2);
  }

  /**
   * Block a user as another user.
   * @param {number} userID1 The user sending the block.
   * @param {number} userID2 The user receiving the block.
   * @return {boolean} Whether the block was successfully sent.
   * @async
   */
  async sendBlockRequest(userID1, userID2) {
    if (userID1 == userID2) return false;

    var status = await this.getFriendStatus(userID1, userID2);

    var reqType = "BLK_0";

    if (userID1 > userID2) reqType = "BLK_1";

    if (status == "Empty")
      return (
        await this.#tryQuery("insert into friends values (?, ?, ?)", [
          Math.min(userID1, userID2),
          Math.max(userID1, userID2),
          reqType,
        ])
      )[0];

    return (
      await this.#tryQuery(
        "update friends set Status = ? where UserID = ? and FriendID = ?",
        [reqType, Math.min(userID1, userID2), Math.max(userID1, userID2)]
      )
    )[0];
  }

  /**
   * Accept a friend request.
   * @param {number} userID1 The user accepting the request.
   * @param {number} userID2 The user sending the request.
   * @returns {boolean} Whether the request was successfully accepted.
   * @async
   */
  async acceptFriendRequest(userID1, userID2) {
    if (userID1 == userID2) return false;

    var status = await this.getFriendStatus(userID1, userID2);
    var reqType = "REQ_1";

    if (userID1 > userID2) reqType = "REQ_0";

    if (status != reqType) return false;

    return (
      await this.#tryQuery(
        "update friends set Status = ? where UserID = ? and FriendID = ?",
        ["ACCPT", Math.min(userID1, userID2), Math.max(userID1, userID2)]
      )
    )[0];
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
      await this.#tryQuery(
        "delete from friends where UserID = ? and FriendID = ?",
        [Math.min(userID1, userID2), Math.max(userID1, userID2)]
      )
    )[0];
  }

  /**
   * Attempts to fetch a list of chores.
   * @returns {Dictionary|null} A list of dictionaries of chore data.
   * @async
   */
  async getChores() {
    var chore = await this.query("select * from chores");

    return chore;
  }

  /**
   * Attempts to fetch a chore's data.
   * @param {number} choreID The ID of the chore.
   * @returns {Dictionary|null} A dictionary of all information pertaining to a chore, or *null* if no chore was found.
   * @async
   */
  async getChore(choreID) {
    var chore = await this.query("select * from chores where ChoreID = ?", [
      choreID,
    ]);

    if (chore.length == 0) return null;

    return chore[0];
  }

  /**
   * Attempts to set a chore's data.
   * @param {Dictionary} params A dictionary of the chore's information.
   * @returns {boolean} Whether the operation succeeded or failed.
   * @async
   */
  async setChore(params) {
    if (!("ChoreID" in params)) return false;

    var id = params["ChoreID"];

    if (await this.getChore(id))
      return (
        await this.#tryQuery("update chores set ? where ChoreID = ?", [
          params,
          id,
        ])
      )[0];

    return (await this.#tryQuery("insert into chores set ?", [params]))[0];
  }

  /**
   * Attempts to delete a chore.
   * @param {Number} id The chore's ChoreID.
   * @returns {boolean} Whether the operation succeeded or failed.
   * @async
   */
  async deleteChore(id) {
    return await this.query("delete from chores where ChoreID = ?", [id]);
  }

  /**
   * Attempts to delete a user.
   * @param {Number} id The user's ChoreID.
   * @returns {boolean} Whether the operation succeeded or failed.
   * @async
   */
  async deleteUser(id) {
    return await this.query("delete from users where UserID = ?", [id]);
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
      (
        await this.query("select * from users where email = ? and pass = ?", [
          email,
          password,
        ])
      ).length != 0
    );
  }

  /**
   * Attempts to send a query.
   * @param {string} sql Query message.
   * @param {list} parameters An optional list of values to fill placeholders.
   * @returns {Promise<[boolean, RowDataPacket|string]>} A promise of a list with success/fail and result/error.
   */
  #tryQuery(sql, parameters = []) {
    return new Promise((resolve, reject) => {
      this.#connection.query(sql, parameters, function (err, result, fields) {
        if (err) return reject([false, err]);
        return resolve([true, result]);
      });
    }).catch((error) => {
      return [false, error];
    });
  }

  /**
   * Attempts to send a query and parse the results.
   * @param {string} sql Query message.
   * @param {list} parameters An optional list of values to fill placeholders.
   * @returns {List<Dictionary>} A list of dictionaries of returned row data, or an empty list if the query failed.
   * @async
   */
  async query(sql, parameters = []) {
    var result = await this.#tryQuery(sql, parameters);

    if (!result[0]) return [];

    var data;
    var dictList = [];

    result = result[1];

    for (var i in result) {
      data = {};

      for (var col in result[i]) data[col] = result[i][col];
      dictList.push(data);
    }

    return dictList;
  }
}

module.exports = Database;
