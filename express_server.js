const express = require("express");
const app = express();
var cookieParser = require('cookie-parser');
const e = require("express");// why did I do this?
const PORT = 8080; // default port 8080


//Express Settings
app.set("view engine", "ejs"); // use ejs templating
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// Database (simulated)
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  if (users[getUserIDbyEmail(userEmail)].password === inputedPassword) {
    return true
  }
  return false
}


//Routing
app.get("/", (req, res) => {
  console.log('userIDis:', req.cookies.user_id)
  console.log('userOBJis:',typeof users[req.cookies.user_id], users[req.cookies.user_id])
  res.send("Hello!");
});

app.get("/register", (req, res) => {  
  const templateVars = { 
    username: users[req.cookies.user_id], 
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
// THOW SHALL NOT PASS ===*
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

  //Balrog cannot stop you, Create New User and return session cookie
  let newUserID = generateRandomString()
  users[newUserID] = {
    id: newUserID,
    email: req.body.email,
    password: req.body.password,
  }
  res.cookie('user_id', newUserID)

  // logs for logging
  console.log(users[req.cookies.user_id])
  console.log('--------------------------')
  console.log(users)

  res.redirect("/urls");
});



app.get("/login", (req, res) => {
  // THOW SHALL NOT PASS:::
  // Gaurd: Email not in DB
  
  
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
  // Cookies that have not been signed

  if (req.cookies.user_id) {
    res.clearCookie('user_id')
  } else {
    console.log('no cookie exists')
  }



  res.redirect("/login");
  next();
})








app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: users[req.cookies.user_id], };
    console.log('check cookie',req.cookies)
  res.render("urls_index", templateVars);
});

//Create new ShortUrl Route
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: users[req.cookies.user_id],};
  res.render("urls_new", templateVars );
});

app.post("/urls", (req, res) => {
  let newRandomString = generateRandomString();
  //this checks if the randomstring is not in the DB before adding it; but the functionality is not complete, it should generate a new random string and then re-try adding it, prolly should use a recursion here?
  if (!urlDatabase[newRandomString]) {
    urlDatabase[newRandomString] = req.body.longURL;
  }
  res.redirect("/urls/" + newRandomString);
});

//View individual URL object
app.get("/urls/:id", (req, res) => {
  console.log(urlDatabase)
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username: users[req.cookies.user_id],};
  res.render("urls_show", templateVars);
});

//Edit Route
app.post("/urls/:id", (req, res) => {
  console.log(urlDatabase);
  const updateKey = req.params.id;
  console.log(updateKey);
  urlDatabase[updateKey] = req.body.longURL;

  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username: users[req.cookies.user_id], };
  res.render("urls_show", templateVars);
});

//Delete Route 
app.post("/urls/:id/delete", (req, res) => {
  
  delete urlDatabase[req.params.id];
  const templateVars = { 
    urls: urlDatabase, 
    username: users[req.cookies.user_id],};
  res.render("urls_index", templateVars);
});



//Redirect short-url route
app.get("/u/:id", (req, res) => {
  console.log(req.params.id)
  const longURL = urlDatabase[req.params.id];
  console.log(urlDatabase)
  console.log(longURL)
  // const longURL = ...
  res.redirect(longURL);
});



//testing new branch commit


// Sample rout - can this be deleted?
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});