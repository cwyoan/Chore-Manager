var mysql = require("mysql");

class Server {
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
    });
  }

  /**
   * Attempts to fetch a user's data.
   * @param {number} userID The ID of the user.
   * @returns {Dictionary|null} A dictionary of all information pertaining to a user, or *null* if no user was found.
   * @async
   */
  async getUser(userID) {
    return await this.query("select * from users where UserID = ?", [userID]);
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
    var allKeys = Object.keys(params);
    var vals = Object.values(params);

    if ((await this.getUser(id)).length != 0) {
      var sets = [];

      for (var keys in params) sets.push(keys + " = ?");

      var msg = `update users set ${sets} where UserID = ?`;
      vals.push(id);

      return (await this.#tryQuery(msg, vals))[0];
    }

    return (
      await this.#tryQuery("insert into users ? values ?", [[allKeys], [vals]])
    )[0];
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
   * @returns {Dictionary|null} A dictionary of a query's returned information, or *null* if the query failed.
   * @async
   */
  async query(sql, parameters = []) {
    var result = await this.#tryQuery(sql, parameters);

    if (!result[0]) return null;

    result = result[1];

    var data = {};

    for (var col in result[0]) data[col] = result[0][col];

    return data;
  }
}

module.exports = Server;
