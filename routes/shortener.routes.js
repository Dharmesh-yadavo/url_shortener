import crypto from "crypto";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { Router } from "express";

const router = Router();

const DATA_FILE = path.join("data", "links.json");

const serveFile = async (res, filePath, contentType) => {
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { "content-type": contentType });
    res.end(data);
  } catch (error) {
    res.writeHead(404, { "Content-type": "text/plain" });
    res.end("404 page not found");
  }
};

const loadLinks = async () => {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeFile(DATA_FILE, JSON.stringify({}));
      return {};
    }
    throw error;
  }
};

const saveLinks = async (links) => {
  await writeFile(DATA_FILE, JSON.stringify(links, null, 2));
};

router.get("/report", (req, res) => {
  const student = [
    {
      name: "Dharmesh",
      grade: "10",
      favouriteSubject: "Mathematics",
    },
    {
      name: "Dheeraj",
      grade: "10",
      favouriteSubject: "English",
    },
    {
      name: "Jai",
      grade: "8",
      favouriteSubject: "Science",
    },
  ];
  return res.render("report", { student });
});

router.get("/", async (req, res) => {
  try {
    const file = await readFile(path.join("views", "index.html"));
    const links = await loadLinks();

    const content = file.toString().replaceAll(
      "{{ shortened_urls }}",
      Object.entries(links)
        .map(
          ([shortCode, url]) =>
            `<li><a href = "/${shortCode}" target = "_blank"> ${req.host} / ${shortCode} </a> - ${url}</li>`
        )
        .join(" ")
    );
    return res.send(content);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

router.post("/", async (req, res) => {
  try {
    const { url, shortCode } = req.body;
    const links = await loadLinks();

    const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

    if (links[finalShortCode]) {
      return res
        .status(400)
        .send("Short code already exists. Please choose another. ");
    }

    links[finalShortCode] = url;
    await saveLinks(links);
  } catch (error) {
    console.log(error);
  }
});

router.get("/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;
    const links = await loadLinks();

    if (!links[shortCode]) return res.status(404).send("404 error occoured");

    return res.redirect(links[shortCode]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

// const server = createServer(async (req, res) => {
//   if (req.method === "GET") {
//     if (req.url === "/") {
//       //   try {
//       //     const data = await readFile(path.join("public", "index.html"));
//       //     res.writeHead(200, { "content-type": "text/html" });
//       //     res.end(data);
//       //   } catch (error) {
//       //     res.writeHead(404, { "Content-type": "text/html" });
//       //     res.end("404 page not found");
//       //   }
//       return serveFile(res, path.join("public", "index.html"), "text/html");
//     } else if (req.url === "/links") {
//       const links = await loadLinks();

//       res.writeHead(200, { "Content-Type": "application/json" });
//       res.end(JSON.stringify(links));
//     } else {
//       const links = await loadLinks();
//       const shortCode = req.url.slice(1);
//       console.log("links red.", req.url);

//       if (links[shortCode]) {
//         res.writeHead(302, { location: links[shortCode] });
//         return res.end();
//       }

//       res.writeHead(404, { "Content-type": "text/plain" });
//       return res.end("Shortened URL is not found");
//     }
//   }

//   if (req.method === "POST" && req.url === "/shorten") {
//     const links = await loadLinks();
//     let body = "";
//     req.on("data", (chunk) => {
//       body += chunk;
//     });
//     req.on("end", async () => {
//       const { url, shortCode } = JSON.parse(body);

//       if (!url) {
//         res.writeHead(400, { "Content-Type": "text/plain" });
//         return res.end("URL required");
//       }

//       const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

//       if (links[finalShortCode]) {
//         res.writeHead(400, { "Content-Type": "text/plain" });
//         return res.end("Short code already exists. Please choose another. ");
//       }

//       links[finalShortCode] = url;
//       await saveLinks(links);

//       res.writeHead(200, { "Content-Type": "application/json" });
//       res.end();
//     });
//   }
// });

// server.listen(PORT, () => {
//   console.log(`Server runing at https://localhost:${PORT}`);
// });

//! default export
// export default router;

//! Named export
export const shortenerRoutes = router;
