import { Router } from "express";
import * as authControllers from "../controllers/auth.controllers.js";

const router = Router();

// router.get("/register", authControllers.getRegisterPage);

// router.get("/login", authControllers.getLoginPage);
// router.post("/login", authControllers.postLogin);

router
  .route("/register")
  .get(authControllers.getRegisterPage)
  .post(authControllers.postRegister);

//* instead of doing two different, do in one
router
  .route("/login")
  .get(authControllers.getLoginPage)
  .post(authControllers.postLogin);

router.route("/profile").get(authControllers.getProfilePage);

router.route("/Me").get(authControllers.getMe);
router.route("/logout").get(authControllers.logoutUser);

export const authoRoutes = router;
