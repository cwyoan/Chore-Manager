const Server = require("./server.js");

async function main() {
  var server = new Server();

  // Tests the connection
  console.log(await server.checkConnection());

  // Standard SQL query
  console.log(await server.query("show tables"));
  //console.log(await server.query("select * from users"));

  // Get info of user with UserID = 2
  console.log(await server.getUser(2));

  console.log(await server.getFriends(4));

  // Create/Update user
  console.log(
    await server.setUser({
      UserID: 4,
      FirstName: "Kathy",
      LastName: "Carty",
      Email: "kcvictory@chores.com",
      Pass: "trE_3@s",
      Score: 500,
      Age: 22,
    })
  );

  // Update user
  /*console.log(
    await server.setUser({
      UserID: 1,
      Score: 40,
    })
  );*/

  console.log(await server.getFriendsRanked(3));
  //console.log(await server.acceptFriendRequest(3, 4));

  console.log(
    await server.setChore({
      ChoreID: 1,
      Name: "Do the Dishes",
      Difficulty: 1,
      Timer: 10,
    })
  );

  server.close();

  process.exit();
}

main();
