import crypto from "crypto";
import {
  loadLinks,
  saveLinks,
  getLinkByShortCode,
} from "../models/shortener.model.js";
// import { readFile } from "fs/promises";
// import path from "path";

export const getUrlShortener = async (req, res) => {
  try {
    // const file = await readFile(path.join("views", "index.html"));
    const links = await loadLinks();
    // const content = file.toString().replaceAll("{{ shortened_urls }}");
    return res.render("index", { links, host: req.host });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

export const postUrlShortener = async (req, res) => {
  try {
    const { url, shortCode } = req.body;
    const links = await loadLinks();

    const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

    if (links[finalShortCode]) {
      return res
        .status(400)
        .send("Short code already exists. Please choose another. ");
    }

    // links[finalShortCode] = url;
    // await saveLinks(links);

    await saveLinks({ url, shortCode });

    return res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

export const redirectToShortLink = async (req, res) => {
  try {
    const { shortCode } = req.params;
    // const links = await loadLinks();
    const links = await getLinkByShortCode(shortCode);

    // if(!links[shortCode]) return res.redirect("/404");
    if (!links) return res.redirect("/404");

    // return res.redirect(links[shortCode]);
    return res.redirect(links.url);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};
