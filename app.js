const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const bcrypt = require("bcrypt");

let db = null;
const dbPath = path.join(__dirname, "userData.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("server running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API 1: user registration
app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const userCheckingQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const existingUser = await db.get(userCheckingQuery);
  if (existingUser === undefined) {
    if (password.length >= 5) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const createUserQuery = `
    INSERT INTO user(username, name, password, gender, location)
    VALUES
    ('${username}', '${name}', '${hashedPassword}','${gender}', '${location}');`;
      await db.run(createUserQuery);
      response.send(" Successful registration of the registrant");
      console.log(`${username} user registered successfully`);
    } else {
      response.status(400);
      response.send("Password is too short");
    }
  } else {
    response.status(400);
    response.send("User already exists");
    console.log(`${existingUser.username} user already exits`);
  }
});
