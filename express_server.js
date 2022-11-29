const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


//Express Settings
app.set("view engine", "ejs"); // use ejs templating
app.use(express.urlencoded({ extended: true }));


// Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

generateRandomString();



//Routing
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});





app.get("/urls/:id", (req, res) => {
  console.log(urlDatabase)
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});











app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});