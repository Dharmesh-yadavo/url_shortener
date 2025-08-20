// import { createServer } from "http";
import express from "express";
import { shortenerRoutes } from "./routes/shortener.routes.js";

const app = express();

const PORT = 3001;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
// as by default folder for view engine is views .... if file is not in views then we have to give default as down code
// app.set("views", "./views");

// express router
// app.use(router);
app.use(shortenerRoutes);

app.listen(PORT, () => {
  console.log(`Server runing at https://localhost:${PORT}`);
});
