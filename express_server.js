//Project Global
const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
var cookieSession = require("cookie-session");

//Express Settings  [note: BCrypt declared in helpers.js file]
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "user_id",
    keys: [
      "Pneumonoultramicroscopicsilicovolcanoconiosis",
      "Floccinaucinihilipilification",
    ],
    maxAge: 24 * 60 * 60 * 1000,
  })
);
app.use(express.static("views/styles"));

//DB
const { users, urlDatabase } = require("./database.js");

//Helper Functions
const {
  generateRandomString,
  getUserIDbyEmail,
  userEmailLookup,
  checkPassword,
  filterUrlDatabaseByUserID,
} = require("./helpers.js");

/*
## Routing Overview

### GET
    |-> /
    |-> /register
    |-> /login
    |-> /urls
    |-> /urls/new     
    |-> /urls/:id
    |-> /u/:id [short-url > redirect route]
### POST
    |-> /register
    |-> /login
    |-> /logout
    |-> /urls [create new short-url]
    |-> /urls:id [short-url > edit]
    |-> /urls:id:delete [short-url > delete]

*/

/*
 *
 * GET ROUTS BEGIN
 *
 */
app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  //userAuthorization
  if (req.session.user_id) {
    return res.redirect("/urls");
  }

  const templateVars = {
    username: users[req.session.user_id],
  };

  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  //userAuthorization
  if (req.session.user_id) {
    return res.redirect("/urls");
  }

  const templateVars = {
    username: users[req.session.user_id],
  };
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send("Please login to view this page");
    // return res.redirect("/login");
  }

  const templateVars = {
    urls: filterUrlDatabaseByUserID(req.session.user_id),
    username: users[req.session.user_id],
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  //userAuthorization
  if (!req.session.user_id) {
    return res.redirect("/login");
  }

  const templateVars = {
    username: users[req.session.user_id],
  };

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  //userAuthorization
  //Not logged in
  if (!req.session.user_id) {
    return res.status(403).send("Please login to view this page");
  }

  //short id does not exist
  if (urlDatabase[req.params.id] === undefined) {
    return res.status(404).send("Sorry, this short URL does not exist.");
  }

  //Not owner
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.status(403).send("Sorry, only the creator can view this page");
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    username: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res
      .status(404)
      .send(
        "Our apologies. \n We're unable to find the page you're looking for. - tinyapp"
      );
  }

  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

/*
 *
 * POST ROUTS BEGIN
 *
 */

app.post("/register", (req, res) => {
  // YOU SHALL NOT PASS ===*
  // Gaurd: Email is empty String
  if (req.body.email === "") {
    return res.status(400).send("Username or Password Can't be empty");
  }
  // Gaurd: Password is empty String
  if (req.body.password === "") {
    return res.status(400).send("Username or Password Can't be empty");
  }
  //Gaurd: Email Exists in DB
  if (userEmailLookup(req.body.email)) {
    return res
      .status(400)
      .send(
        "An account with this email exists \n please visit this link tinyapp.com/login to sign in"
      );
  }
  //Create New User and return session cookie
  let newUserID = generateRandomString();
  users[newUserID] = {
    id: newUserID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  };
  req.session.user_id = newUserID;

  res.redirect("/urls");
});

app.post("/login", function (req, res) {
  // Check if Email exists in BD
  if (!userEmailLookup(req.body.email)) {
    return res
      .status(403)
      .send(
        "Sorry, this user doesn't seem to exists \n visit tinyapp.com/register to create a new account"
      );
  }
  // Check password ? Set session cookie : return 403 error
  if (checkPassword(req.body.email, req.body.password)) {
    req.session.user_id = getUserIDbyEmail(req.body.email);
  } else {
    res.status(403).send("Incorrect password, please try again");
  }

  res.redirect("/urls");
  next();
});

app.post("/logout", function (req, res) {
  if (req.session.user_id) {
    res.clearCookie("user_id");
  }

  res.redirect("/login");
  next();
});

app.post("/urls", (req, res) => {
  //userAuthorization
  if (!req.session.user_id) {
    return res
      .status(403)
      .send("Please create an account or login to use tinyapp");
  }

  // Create new Short URL
  let newUrlId = generateRandomString();
  if (!urlDatabase[newUrlId]) {
    urlDatabase[newUrlId] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
  }

  res.redirect("/urls/" + newUrlId);
});

app.post("/urls/:id", (req, res) => {
  //userAuthorization
  //Not logged in
  if (!req.session.user_id) {
    return res.status(403).send("Please login to view this page");
  }
  //Not owner
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.status(403).send("Sorry, only the creator can edit this page");
  }

  //edit function
  urlDatabase[req.params.id].longURL = req.body.longURL;

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    username: users[req.session.user_id],
  };

  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  //userAuthorization
  //Not logged in
  if (!req.session.user_id) {
    return res.status(403).send("Please login to view this page");
  }
  //Not owner
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.status(403).send("Sorry, only the creator can edit this page");
  }
  // object not found in DB
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Sorry, file not found");
  }

  delete urlDatabase[req.params.id];

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
