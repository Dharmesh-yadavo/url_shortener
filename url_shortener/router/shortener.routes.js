import { Router } from "express";
import {
  getUrlShortener,
  postUrlShortener,
  redirectToShortLink,
  getShortenerEditPage,
  getShortenerDelete,
} from "../controllers/postUrlShortener.controllers.js";

const router = Router();

router.get("/", getUrlShortener);

//! ejs
// router.get("/report", (req, res) => {
//   const student = [
//     {
//       name: "Dharmesh",
//       grade: "12th",
//       favoriteSubject: "Math",
//     },
//     { name: "Aarav", grade: "10th", favoriteSubject: "Mathematics" },
//     { name: "Ishita", grade: "9th", favoriteSubject: "Science" },
//     { name: "Rohan", grade: "8th", favoriteSubject: "History" },
//     { name: "Meera", grade: "10th", favoriteSubject: "English" },
//     { name: "Kabir", grade: "11th", favoriteSubject: "Physics" },
//   ];
//   res.render("report", { student });
// });

router.post("/", postUrlShortener);

router.get("/:shortCode", redirectToShortLink);

router.route("/edit/:id").get(getShortenerEditPage);

router.route("/delete/:id").post(getShortenerDelete);

export const shortenedRoutes = router;
