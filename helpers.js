const bcrypt = require("bcryptjs");
var cookieSession = require("cookie-session");

const {
  users,
  urlDatabase,
} = require("./database.js");

//Functions
function generateRandomString() {
  let randomString = "";
  let validChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let x = 0; x < 6; x++) {
    randomString += validChars.charAt(
      Math.floor(Math.random() * validChars.length)
    );
  }
  return randomString;
}

// If the user exists ? returns a string with the User ID :  else returns false
function getUserIDbyEmail(checkEmail) {
  for (let user in users) {
    if (users[user].email === checkEmail) {
      return users[user].id;
    }
  }
  return false;
}

function userEmailLookup(doesEmailExist) {
  if (typeof getUserIDbyEmail(doesEmailExist) === "string") {
    return true;
  }
  return false;
}

function checkPassword(userEmail, inputedPassword) {
  if (
    bcrypt.compareSync(
      inputedPassword,
      users[getUserIDbyEmail(userEmail)].password
    )
  ) {
    return true;
  }
  return false;
}

function filterUrlDatabaseByUserID(userID) {
  let userDatabase = {};

  for (let links in urlDatabase) {
    if (urlDatabase[links].userID === userID) {
      userDatabase[links] = {
        longURL: urlDatabase[links].longURL,
        userID: urlDatabase[links].userID,
      };
    }
  }
  return userDatabase;
}

module.exports = {
  generateRandomString,
  getUserIDbyEmail,
  userEmailLookup,
  checkPassword,
  filterUrlDatabaseByUserID,
  urlDatabase,
  users,
};