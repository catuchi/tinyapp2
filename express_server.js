const express = require("express");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
var cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const {
  generateRandomString,
  findUserById,
  findUserByEmail,
  passwordCheck,
  dbCheckForShortURL,
  urlsForUser,
  checkShortUrlBelongsToUser,
  canDelete,
} = require("./helpers/helperFunctions");
const { urlDatabase } = require("./helpers/database");
const { users } = require("./helpers/users");

app.set("view engine", "ejs");
app.use(cookieParser());

app.use(
  cookieSession({
    name: "session",
    keys: [process.env.KEY],

    maxAge: 24 * 60 * 60 * 1000,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;

  // check if user exists and logged in
  if (!userId) {
    const templateVars = { user: null, error: "Please Log in" };
    return res.render("urls_index", templateVars);
  }
  const templateVars = {
    error: null,
    user: findUserById(userId, users),
    urls: urlsForUser(userId, urlDatabase),
  };
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;

  // check if user exists and logged in
  if (!userId) {
    res.redirect("/login");
  }
  const templateVars = { user: findUserById(userId, users) };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.id;

  // check db to see if url exist
  if (dbCheckForShortURL(shortURL, urlDatabase) === null) {
    res
      .status(403)
      .send("<html><body><b>Short URL</b> does not exist</body></html>");
    res.end();
  }

  const urlOwner = urlDatabase[shortURL].userID;

  // check if user exists
  if (!userId) {
    const templateVars = { user: null, error: "Please Log in" };
    return res.render("urls_show", templateVars);
  }

  // check if url belongs to logged in user
  if (urlOwner !== userId) {
    const templateVars = {
      user: users[userId],
      error: "Can't access this URL. Please create your own URL",
    };
    return res.render("urls_show", templateVars);
  }

  const templateVars = {
    error: null,
    user: findUserById(userId, users),
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;

  // check db to see if shortURL exists
  if (dbCheckForShortURL(shortURL, urlDatabase) === null) {
    res
      .status(403)
      .send("<html><body><b>Short URL</b> does not exist</body></html>");
    res.end();
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURL, userID: userId };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.id;
  if (canDelete(shortURL, userId, urlDatabase)) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const url = req.params.id;
  if (!userId) {
    const templateVars = { user: null, error: "<h4>Please Log in</h4>" };
    res.render("urls_index", templateVars);
  }
  if (checkShortUrlBelongsToUser(url, userId, urlDatabase) === null) {
    const templateVars = {
      error: "<h4>Short URL does not exist</h4>",
      user: findUserById(userId, users),
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
    };
    res.render("urls_show", templateVars);
  }
  if (canDelete(url, userId, urlDatabase)) {
    const shortURL = req.params.id;
    const longURL = req.body.longURL;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const loggedInUser = findUserByEmail(email, users);
  if (!loggedInUser) {
    res.status(403).send("User not found. Please enter valid Email");
    res.end();
  }
  if (bcrypt.compareSync(password, loggedInUser.password) === false) {
    res.status(403).send("Error: Please enter valid Email/Password");
    res.end();
  }
  req.session.user_id = loggedInUser.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  req.session = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect("/urls");
  }
  const templateVars = { user: findUserById(userId, users) };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("Please enter valid email or password");
    res.end();
  }
  const user = findUserByEmail(email, users);
  if (user) {
    res.status(400).send("Email already exist please enter new email");
    res.end();
  }
  const newUserId = generateRandomString();
  users[newUserId] = {
    id: newUserId,
    email: email,
    password: bcrypt.hashSync(password, 10),
  };
  req.session.user_id = newUserId;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect("/urls");
  }
  const templateVars = { user: findUserById(userId, users) };
  res.render("login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
