// import { createServer } from "http";
import express from "express";
import { shortenerRoutes } from "./routes/shortener.routes";

const app = express();

const PORT = 3001;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// express router
// app.use(router);
app.use(shortenerRoutes);

app.listen(PORT, () => {
  console.log(`Server runing at https://localhost:${PORT}`);
});
