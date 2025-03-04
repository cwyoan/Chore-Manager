const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
  origin: ["http://localhost:8080"],
};

const path = require("path");

const PORT = 8080;

const Database = require("./database");

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.use(cors(corsOptions));

var db = new Database();

// Auth check
app.use("/api/*", (req, res, next) => {
  if (!req.headers["server"]) return res.status(403).redirect("/403");
  next();
});

app.get("/api/users", async (req, res) => {
  res.send(await db.query("select * from users"));
});

app.get("/api/users/:id", async (req, res) => {
  res.send(await db.getUser(req.params.id));
});

app.get("/api/users/:id/friends", async (req, res) => {
  res.send(await db.getFriends(req.params.id));
});

app.get("/api/users/:id/ranks", async (req, res) => {
  res.send(await db.getFriendsRanked(req.params.id));
});

app.get("/api/users/:id/friends/:otherid", async (req, res) => {
  res.send(await db.getFriendStatus(req.params.id, req.params.otherid));
});

app.get("/api/chores", async (req, res) => {
  res.send(await db.query("select * from chores"));
});

app.get("/api/chores/:id", async (req, res) => {
  res.send(await db.getChore(req.params.id));
});

app.put("/api/users", async (req, res) => {
  if (await db.setUser(req.body["columns"]))
    return res.json({ message: "Success" });
  else return res.json({ message: "Failure" });
});

app.put("/api/chores", async (req, res) => {
  if (await db.setChore(req.body["columns"]))
    return res.json({ message: "Success" });
  else return res.json({ message: "Failure" });
});

app.put("/api/users/:id/friends", async (req, res) => {
  var type = req.query.type;
  var user1 = req.params.id;
  var user2 = req.query.other;

  if (type == "REQ") return res.send(await db.sendFriendRequest(user1, user2));
  else if (type == "ACCPT")
    return res.send(await db.acceptFriendRequest(user1, user2));
  else if (type == "BLOCK")
    return res.send(await db.sendBlockRequest(user1, user2));
  else return res.send(false);
});

app.delete("/api/users", async (req, res) => {
  return res.json(await db.deleteUser(req.query["id"]));
});

app.delete("/api/chores", async (req, res) => {
  return res.json(await db.deleteChore(req.query["id"]));
});

app.delete("/api/users/:id/friends/:otherid", async (req, res) => {
  return res.send(
    await db.clearFriendStatus(req.params.id, req.params.otherid)
  );
});

// Catch-all for endpoints
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/`);
});
