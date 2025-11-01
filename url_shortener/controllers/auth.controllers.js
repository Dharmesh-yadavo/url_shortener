import {
  comparePassword,
  createUser,
  generateToken,
  getUserByEmail,
  hashPassword,
} from "../services/auth.services.js";

export const getRegisterPage = (req, res) => {
  return res.render("auth/register");
};

export const postRegister = async (req, res) => {
  // console.log(req.body); // to get the data of form // expressJS way
  const { name, email, password } = req.body;

  const userExist = await getUserByEmail(email);
  console.log(userExist);

  if (userExist) return res.redirect("/resgister");

  const hashedPassword = await hashPassword(password);

  const [user] = await createUser({ name, email, hashedPassword });
  console.log(user);

  res.redirect("/login");
};

export const getLoginPage = (req, res) => {
  return res.render("auth/login");
};

export const postLogin = async (req, res) => {
  const { email, password } = req.body;

  const user = await getUserByEmail(email);
  console.log(user);

  if (!user) return res.redirect("/login");
  // todo bcrypt.compare(plainTextPassword, hashPassword);
  const isPasswordValid = await comparePassword(password, user.password);

  // if (user.password !== password) return res.redirect("/login");
  if (!isPasswordValid) return res.redirect("/login");

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
