const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const register = (req, res) => {
  const { username, password, email } = req.body;

  //save password as hash

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const newuser = new User({
    username,
    password: hash,
    email,
    role: "user",
  });

  newuser
    .save()
    .then((user) => {
      res.status(201).json({ user });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // compare hash of password with password in db

      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // if password matches then create a token using jwt and return X-Auth-Token as token

      const token = jwt.sign(
        { _id: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" }
      );

      // X-Auth-Token
      res.set("x-auth-token", token);

      res.status(200).json({ user });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

module.exports = {
  login,
  register,
};
