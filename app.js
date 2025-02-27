const Server = require("./server.js");

async function main() {
  var server = new Server();

  // Tests the connection
  console.log(await server.checkConnection());

  // Standard SQL query
  console.log(await server.query("show tables"));

  // Get info of user with UserID = 2
  console.log(await server.getUser(2));

  // Create/Update user
  console.log(
    await server.setUser({
      UserID: 2,
      FirstName: "Mary",
      LastName: "Jane",
      Email: "m.jane@chores.com",
      Pass: "poppins!",
      Score: 0,
      Friends: "",
      Age: 30,
    })
  );

  // Update user
  console.log(
    await server.setUser({
      UserID: 1,
      Score: 40,
    })
  );

  process.exit();
}

main();
