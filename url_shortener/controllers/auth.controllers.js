import {
  comparePassword,
  createUser,
  generateToken,
  getUserByEmail,
  hashPassword,
} from "../services/auth.services.js";
import {
  loginUserSchema,
  registerUserSchema,
} from "../validators/auth-validators.js";

export const getRegisterPage = (req, res) => {
  if (req.user) return res.redirect("/");
  return res.render("auth/register", { errors: req.flash("errors") });
};

export const postRegister = async (req, res) => {
  // console.log(req.body); // to get the data of form // expressJS way
  // const { name, email, password } = req.body;

  const { data, error } = registerUserSchema.safeParse(req.body);

  if (error) {
    const errors = error.issues[0].message;
    req.flash("errors", errors);
    // console.log(errors);
    return res.redirect("/register");
  }

  const { name, email, password } = data;

  const userExist = await getUserByEmail(email);
  console.log(userExist);

  // if (userExist) return res.redirect("/resgister");

  if (userExist) {
    req.flash("errors", "User already exists");
    return res.redirect("/register");
  }

  const hashedPassword = await hashPassword(password);

  const [user] = await createUser({ name, email, hashedPassword });
  console.log(user);

  res.redirect("/login");
};

export const getLoginPage = (req, res) => {
  if (req.user) return res.redirect("/");
  return res.render("auth/login", { errors: req.flash("errors") });
};

export const postLogin = async (req, res) => {
  if (req.user) return res.redirect("/");

  // const { email, password } = req.body;

  const { data, error } = loginUserSchema.safeParse(req.body);

  if (error) {
    const errors = error.issues[0].message;
    req.flash("errors", errors);
    // console.log(errors);
    return res.redirect("/login");
  }

  const { email, password } = data;

  const user = await getUserByEmail(email);
  console.log(user);

  // if (!user) return res.redirect("/login");
  if (!user) {
    req.flash("errors", "Invalid Email or Password");
    return res.redirect("/login");
  }

  // todo bcrypt.compare(plainTextPassword, hashPassword);
  const isPasswordValid = await comparePassword(password, user.password);

  // if (user.password !== password) return res.redirect("/login");

  // if (!isPasswordValid) return res.redirect("/login");
  if (!isPasswordValid) {
    req.flash("errors", "Invalid Email or Password");
    return res.redirect("/login");
  }

  // res.setHeader("Set-Cookie", "isLoggedIn=true; path=/;");
  // res.cookie("isLoggedIn", true);

  const token = generateToken({
    id: user.id,
    name: user.name,
    email: user.email,
  });
  res.cookie("access_token", token);
  res.redirect("/");
};

// Do you need to set path=/ manually ?
// Cookie-Parser and Express automatically set the path to / by default.

export const getMe = (req, res) => {
  if (!req.user) return res.send("Not logged in !");
  return res.send(`<h1>Hey, ${req.user.name} - ${req.user.email} </h1>`);
};

export const logoutUser = (req, res) => {
  res.clearCookie("access_token");
  res.redirect("/login");
};
