import {
  authenticateUser,
  celarUserSession,
  clearVerifyEmailTokens,
  comparePassword,
  createUser,
  findUserById,
  findVerificationEmailToken,
  getAllShortLinks,
  getUserByEmail,
  hashPassword,
  sendNewVerifyEmailLink,
  verifyUserEmailAndUpdate,
} from "../services/auth.services.js";

import {
  loginUserSchema,
  registerUserSchema,
  verifyEmailSchema,
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
  // console.log(userExist);

  // if (userExist) return res.redirect("/resgister");

  if (userExist) {
    req.flash("errors", "User already exists");
    return res.redirect("/register");
  }

  const hashedPassword = await hashPassword(password);

  const [user] = await createUser({ name, email, hashedPassword });
  // console.log(user);

  // res.redirect("/login");
  //! code for directly login after register ... copy paste postLogin access_token and refresh_token part

  await authenticateUser({ req, res, user, name, email });

  //! Send Email Verification After User Registration
  await sendNewVerifyEmailLink({ userId: user.id, email });

  res.redirect("/");
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
  // console.log(user);

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

  //! old jwt (using only jwt)
  // const token = generateToken({
  //   id: user.id,
  //   name: user.name,
  //   email: user.email,
  // });
  // res.cookie("access_token", token);

  //! new method: Hybrid Authentication
  // we need to create a session

  await authenticateUser({ req, res, user });

  res.redirect("/");
};

// Do you need to set path=/ manually ?
// Cookie-Parser and Express automatically set the path to / by default.

export const getMe = (req, res) => {
  if (!req.user) return res.send("Not logged in !");
  return res.send(`<h1>Hey, ${req.user.name} - ${req.user.email} </h1>`);
};

export const logoutUser = async (req, res) => {
  await celarUserSession(req.user.sessionId);
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.redirect("/login");
};

// getProfilePage

export const getProfilePage = async (req, res) => {
  if (!req.user) return res.send("Not logged in");

  const user = await findUserById(req.user.id);
  if (!user) return res.redirect("/login");

  const userShortLinks = await getAllShortLinks(user.id);

  return res.render("auth/profile", {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailValid: user.isEmailValid,
      createdAt: user.createdAt,
      links: userShortLinks,
    },
  });
};

// getVerifyEmailPage
export const getVerifyEmailPage = async (req, res) => {
  // if (!req.user || req.user.isEmailValid) return res.redirect("/");

  if (!req.user) return res.redirect("/");

  const user = await findUserById(req.user.id);

  if (!user || user.isEmailValid) return res.redirect("/");

  return res.render("auth/verify-email", {
    email: req.user.email,
  });
};

// resendVerificationLink

export const resendVerificationLink = async (req, res) => {
  if (!req.user) return res.redirect("/");

  const user = await findUserById(req.user.id);

  if (!user || user.isEmailValid) return res.redirect("/");

  await sendNewVerifyEmailLink({ userId: req.user.id, email: req.user.email });

  res.redirect("/verify-email");
};

// verifyEmailToken

// export const verifyEmailToken = async (req, res) => {
//   const { data, error } = verifyEmailSchema.safeParse(req.query);
//   if (error) {
//     return res.send("Verification link invalid or expired!");
//   }

//   // const token = await findVerificationEmailToken(data); // without joins
//   const [token] = await findVerificationEmailToken(data); // with joins

//   // const results = await findVerificationEmailToken(data);
//   // const token = results[0]; // Get the first (and only expected) result
//   console.log("🚀 ~ verifyEmailToken ~ token̥:", token);
//   if (!token) res.send("Verification link invalid or expired!");
//   // 1: token - same
//   // 2: expire
//   // 3: userId - email find

//   const ress = await verifyUserEmailAndUpdate(token.email);
//   // 1: to find email - vupdate the is emial ValidityState

//   console.log(ress);

//   // clearVerifyEmailTokens(token.email).catch(console.error);
//   clearVerifyEmailTokens(token.userId).catch(console.error);

//   return res.redirect("/profile");
// };

export const verifyEmailToken = async (req, res) => {
  const { data, error } = verifyEmailSchema.safeParse(req.query);
  if (error) {
    return res.send("Verification link invalid or expired!");
  }

  // const token = await findVerificationEmailToken(data); // without joins
  const [token] = await findVerificationEmailToken(data); // with joins
  console.log("🚀 ~ verifyEmailToken ~ token̥:", token);
  if (!token) res.send("Verification link invalid or expired!");
  // 1: token - same
  // 2: expire
  // 3: userId - email find

  await verifyUserEmailAndUpdate(token.email);
  // 1: to find email - vupdate the is emial ValidityState

  // clearVerifyEmailTokens(token.email).catch(console.error);
  clearVerifyEmailTokens(token.userId).catch(console.error);

  return res.redirect("/profile");
};
