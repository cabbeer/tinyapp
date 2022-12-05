const bcrypt = require("bcryptjs");

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
    password: "123",
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





module.exports = { generateRandomString, getUserIDbyEmail, userEmailLookup, checkPassword, filterUrlDatabaseByUserID, urlDatabase, users };