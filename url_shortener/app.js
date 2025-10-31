// import { connectDb } from "./config/db-client.js";
import { authoRoutes } from "./router/auth.routes.js";
import { shortenedRoutes } from "./router/shortener.routes.js";
import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//! EJS Template Engine in Express.js
//? In Express.js, a template engine is a tool that lets you embed dynamic content into HTML files
//? and render them on the server before sending them to the client. It allows you to create reusable
//?  templates, making it easier to generate dynamic web pages with minimal code.

app.set("view engine", "ejs"); // it by default access what is there in views
// app.set("views", "./views"); // so, add this if ur file is not in views

//add this before authoRoutes
app.use(cookieParser());

//! added
app.use(authoRoutes);
app.use(shortenedRoutes);

const PORT = 3003;

try {
  // await connectDb();
  app.listen(PORT, () => {
    console.log(`Server runing at https://localhost:${PORT}`);
  });
} catch (error) {
  console.log(error);
}
