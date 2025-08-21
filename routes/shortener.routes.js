import { Router } from "express";

//!
import {
  postUrlShortener,
  getUrlShortener,
  redirectToShortLink,
} from "../controllers/postUrlShortener.controller.js";

const router = Router();

// const DATA_FILE = path.join("data", "links.json");

// const serveFile = async (res, filePath, contentType) => {
//   try {
//     const data = await readFile(filePath);
//     res.writeHead(200, { "content-type": contentType });
//     res.end(data);
//   } catch (error) {
//     res.writeHead(404, { "Content-type": "text/plain" });
//     res.end("404 page not found");
//   }
// };

// const loadLinks = async () => {
//   try {
//     const data = await readFile(DATA_FILE, "utf-8");
//     return JSON.parse(data);
//   } catch (error) {
//     if (error.code === "ENOENT") {
//       await writeFile(DATA_FILE, JSON.stringify({}));
//       return {};
//     }
//     throw error;
//   }
// };

// const saveLinks = async (links) => {
//   await writeFile(DATA_FILE, JSON.stringify(links, null, 2));
// };

router.get("/", getUrlShortener);

// router.get("/", async (req, res) => {
//   try {
//     const file = await readFile(path.join("views", "index.html"));
//     const links = await loadLinks();

//     const content = file.toString().replaceAll(
//       "{{ shortened_urls }}",
//       Object.entries(links)
//         .map(
//           ([shortCode, url]) =>
//             `<li><a href = "/${shortCode}" target = "_blank"> ${req.host} / ${shortCode} </a> - ${url}</li>`
//         )
//         .join(" ")
//     );
//     return res.send(content);
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send("Internal server error");
//   }
// });

router.post("/", postUrlShortener);

// router.post("/", async (req, res) => {
//   try {
//     const { url, shortCode } = req.body;
//     const links = await loadLinks();

//     const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

//     if (links[finalShortCode]) {
//       return res
//         .status(400)
//         .send("Short code already exists. Please choose another. ");
//     }

//     links[finalShortCode] = url;
//     await saveLinks(links);
//   } catch (error) {
//     console.log(error);
//   }
// });

router.get("/:shortCode", redirectToShortLink);

// router.get("/:shortCode", async (req, res) => {
//   try {
//     const { shortCode } = req.params;
//     const links = await loadLinks();

//     if (!links[shortCode]) return res.status(404).send("404 error occoured");

//     return res.redirect(links[shortCode]);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Internal server error");
//   }
// });

//! default export
// export default router;

//! Named export

export const shortenerRoutes = router;
