const express = require("express");
const app = express();
var cookieParser = require('cookie-parser');
const e = require("express");
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
   let rString = '';
   let validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   for (let x=0; x < 6; x++) {
    rString += validChars.charAt(Math.floor(Math.random() * validChars.length));
   }
   return rString
}


//Routing

app.post('/login', function (req, res) {
  // Cookies that have not been signed

  if (req.cookies.username === undefined) {
    res.cookie('username', req.body.username)
  } else {
    console.log('cookie already exists')
  }
  res.redirect("/urls");
  next();
})

app.post('/logout', function (req, res) {
  // Cookies that have not been signed

  if (req.cookies.username) {
    res.clearCookie('username', req.body.username)
  } else {
    console.log('no cookie exists')
  }
  res.redirect("/urls");
  next();
})






app.get("/", (req, res) => {
  console.log('userIDis:', req.cookies.user_id)
  console.log('userOBJis:',typeof users['req.cookies.user_id'], users['req.cookies.user_id'])
  res.send("Hello!");
});

app.get("/register", (req, res) => {  
  const templateVars = { 
    username: req.cookies["username"], 
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  // console.log('bodyIS', req.body )
  // console.log('emailIs:', req.body.email)
  // console.log('passwordIS', req.body.password)
  
  let newUserID = generateRandomString()

  users[newUserID] = {
    id: "userRandomID",
    email: req.body.email,
    password: req.body.password,
  }

  res.cookie('user_id', newUserID)

 console.log(users[newUserID])
 console.log('--------------------------')
 console.log(users)
  
  const templateVars = { 
    username: req.cookies["username"], 
  };
  res.redirect("/urls");
});






app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"], };
    console.log('check cookie',req.cookies)
  res.render("urls_index", templateVars);
});

//Create new ShortUrl Route
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],};
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
    username: req.cookies["username"],};
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
    username: req.cookies["username"], };
  res.render("urls_show", templateVars);
});

//Delete Route 
app.post("/urls/:id/delete", (req, res) => {
  
  delete urlDatabase[req.params.id];
  const templateVars = { 
    urls: urlDatabase, 
    username: req.cookies["username"],};
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