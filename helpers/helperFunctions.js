// generates random string that is used for a new shortURL
function generateRandomString() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 6;
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

const findUserById = function (id, users) {
  for (let key in users) {
    if (key === id) {
      return users[key];
    }
  }
  return null;
};

const findUserByEmail = function (email, users) {
  for (let key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return null;
};

const passwordCheck = function (user, password) {
  if (user.password === password) {
    return true;
  }
  return false;
};

const dbCheckForShortURL = function (url, urlDatabase) {
  for (let key in urlDatabase) {
    if (key === url) {
      return true;
    }
  }
  return null;
};

// returns urls that belongs to a logged in user
const urlsForUser = (id, urlDatabase) => {
  const result = {};
  for (let shorturl in urlDatabase) {
    if (urlDatabase[shorturl].userID === id) {
      result[shorturl] = urlDatabase[shorturl];
    }
  }
  return result;
};

const checkShortUrlBelongsToUser = function (url, id, database) {
  for (let key in database) {
    if (key === url) {
      if (database[key].userID === id) {
        return true;
      }
    }
  }
  return null;
};

// checks that user can only delete a url that they create
const canDelete = function (url, id, database) {
  for (let key in database) {
    if (key === url) {
      if (database[key].userID === id) {
        return true;
      }
    }
  }
  return null;
};

module.exports = {
  generateRandomString,
  findUserById,
  findUserByEmail,
  passwordCheck,
  dbCheckForShortURL,
  urlsForUser,
  checkShortUrlBelongsToUser,
  canDelete,
};
