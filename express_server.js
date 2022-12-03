const express = require("express");
const app = express();
var cookieParser = require('cookie-parser');
const e = require("express");// why did I do this?
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");

//Express Settings
app.set("view engine", "ejs"); // use ejs templating
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//Functions
function generateRandomString () {
   let randomString = '';
   let validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   for (let x=0; x < 6; x++) {
    randomString += validChars.charAt(Math.floor(Math.random() * validChars.length));
   }
   return randomString
}

// If the user exists ? returns a string with the User ID :  else returns false
function getUserIDbyEmail(checkEmail) {
  for (let user in users) { 
    if (users[user].email === checkEmail) {
      return users[user].id
    }
  }
 return false
} 

function userEmailLookup (doesEmailExist) { 
  if (typeof getUserIDbyEmail(doesEmailExist) === 'string') {
    return true
  }
 return false
}

function checkPassword(userEmail, inputedPassword) {
  if (bcrypt.compareSync(inputedPassword, users[getUserIDbyEmail(userEmail)].password)) {
    return true
  }
  return false
}

function filterUrlDatabaseByUserID (userID) {
  let userDatabase ={};

  for (let links in urlDatabase) {
    if (urlDatabase[links].userID === userID) {
      userDatabase[links] = {
        longURL: urlDatabase[links].longURL,
        userID: urlDatabase[links].userID,
      } 
    }
  }
  return userDatabase
}

//Routing
app.get("/", (req, res) => {
  //logs 
  console.log('userIDis:', req.cookies.user_id)
  console.log('userOBJis:',typeof users[req.cookies.user_id], users[req.cookies.user_id])
  
  res.send("Hello!");
});

app.get("/register", (req, res) => {  
//userAuthorization
  if (req.cookies.user_id) {
    return res.redirect("/urls");
  }

  const templateVars = { 
    username: users[req.cookies.user_id], };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
// YOU SHALL NOT PASS ===*
  // Gaurd: Email is empty String
  if (req.body.email === '') {
    return res.status(400).send('Username Can\'t be empty')
  } 
  // Gaurd: Password is empty String
  if (req.body.password === '') {
    return res.status(400).send('Password Can\'t be empty')
  } 
  //Gaurd: Email Exists in DB
  if (userEmailLookup(req.body.email)) {
    return res.status(400).send('An account with this email exists \n please visit this link tinyapp.com/login to sign in')
  }
//Create New User and return session cookie
  let newUserID = generateRandomString()
  users[newUserID] = {
    id: newUserID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  }
  res.cookie('user_id', newUserID)

  // logs for logging
  console.log(users[req.cookies.user_id])
  console.log('--------------------------')
  console.log(users)

  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  //userAuthorization
  if (req.cookies.user_id) {
    return res.redirect("/urls");
  }

  //logs
  console.log('check cookie',req.cookies)
  
  const templateVars = {};
  res.render("login", templateVars);
});

app.post('/login', function (req, res) {
  // Check if Email exists in BD
  if (!userEmailLookup(req.body.email)) {
    return res.status(403).send('Sorry, this user doesn\'t seem to exists \n visit tinyapp.com/register to create a new account')
  }
  // Check password ? Set session cookie : return 403 error
  if (checkPassword(req.body.email, req.body.password)) {
    res.cookie('user_id', getUserIDbyEmail(req.body.email))
  } else {
    res.status(403).send('Incorrect password, please try again')
  }

  res.redirect("/urls");
  next();
})

app.post('/logout', function (req, res) {

  if (req.cookies.user_id) {
    res.clearCookie('user_id')
  } else {
    console.log('no cookie exists')
  }

  res.redirect("/login");
  next();
})

app.get("/urls", (req, res) => {

  if (!req.cookies.user_id) {
    return res.redirect("/login");
  }


  const templateVars = { 
    urls: filterUrlDatabaseByUserID(req.cookies.user_id),
    username: users[req.cookies.user_id], };
    console.log('check cookie',req.cookies)
  res.render("urls_index", templateVars);
});

//Create new ShortUrl Route
app.get("/urls/new", (req, res) => {
  //userAuthorization
  if (!req.cookies.user_id) {
    return res.redirect("/login");
  }

  const templateVars = { 
    username: users[req.cookies.user_id],};
  res.render("urls_new", templateVars );
});

app.post("/urls", (req, res) => {
  //userAuthorization
  if (!req.cookies.user_id) {
    return res.status(403).send('Please create an account or login to use tinyapp')
  }

  // Create new Short URL
  let newUrlId = generateRandomString();
  //this checks if the randomstring is not in the DB before adding it; but the functionality is not complete, it should generate a new random string and then re-try adding it, but what are the odds that this is actually needed 
  if (!urlDatabase[newUrlId]) {
    urlDatabase[newUrlId] = {
      longURL: req.body.longURL,
      userID: req.cookies.user_id
    }
  }

  res.redirect("/urls/" + newUrlId);
});

//View individual URL object
app.get("/urls/:id", (req, res) => {
//userAuthorization
  //Not logged in
  if (!req.cookies.user_id) {
    return res.status(403).send('Please login to view this page')
  }
  //Not owner
  if (urlDatabase[req.params.id].userID !== req.cookies.user_id) {
    return res.status(403).send('Sorry, only the creator can view this page')
  }

  console.log(urlDatabase)
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL,
    username: users[req.cookies.user_id],};
  res.render("urls_show", templateVars);
});

//Edit Route
app.post("/urls/:id", (req, res) => {
//userAuthorization
  //Not logged in
  if (!req.cookies.user_id) {
    return res.status(403).send('Please login to view this page')
  }
  //Not owner
  if (urlDatabase[req.params.id].userID !== req.cookies.user_id) {
    return res.status(403).send('Sorry, only the creator can edit this page')
  }
  // object not found in DB
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('Sorry, file not found')
  }

  //edit function
  urlDatabase[req.params.id].longURL = req.body.longURL;


  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL,
    username: users[req.cookies.user_id], };
  res.render("urls_show", templateVars);
});

//Delete Route 
app.post("/urls/:id/delete", (req, res) => {
//userAuthorization
  //Not logged in
  if (!req.cookies.user_id) {
    return res.status(403).send('Please login to view this page')
  }
  //Not owner
  if (urlDatabase[req.params.id].userID !== req.cookies.user_id) {
    return res.status(403).send('Sorry, only the creator can edit this page')
  }
  // object not found in DB
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('Sorry, file not found')
  }
  
  //delete function
  delete urlDatabase[req.params.id];
  
  res.redirect("/urls");
});

//Redirect short-url route
app.get("/u/:id", (req, res) => {

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Our apologies. \n We\'re unable to find the page you\'re looking for. - tinyapp"
    )
  }


  console.log(req.params.id)
  const longURL = urlDatabase[req.params.id].longURL;
  console.log(urlDatabase)
  console.log(longURL)
  // const longURL = ...
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});