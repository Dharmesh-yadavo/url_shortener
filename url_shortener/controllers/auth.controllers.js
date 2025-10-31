import { createUser, getUserByEmail } from "../services/auth.services.js";

export const getRegisterPage = (req, res) => {
  return res.render("auth/register");
};

export const postRegister = async (req, res) => {
  // console.log(req.body); // to get the data of form // expressJS way
  const { name, email, password } = req.body;

  const userExist = await getUserByEmail(email);
  console.log(userExist);

  if (userExist) return res.redirect("/resgister");

  const [user] = await createUser({ name, email, password });
  console.log(user);

  res.redirect("/login");
};

export const getLoginPage = (req, res) => {
  return res.render("auth/login");
};

export const postLogin = (req, res) => {
  // res.setHeader("Set-Cookie", "isLoggedIn=true; path=/;");
  res.cookie("isLoggedIn", true);
  res.redirect("/");
};

// Do you need to set path=/ manually ?
// Cookie-Parser and Express automatically set the path to / by default.
