import crypto from "crypto";
import { loadLinks, saveLinks } from "../models/shortener.model.js";
import { readFile } from "fs/promises";
import path from "path";

export const getUrlShortener = async (req, res) => {
  try {
    const file = await readFile(path.join("views", "index.html"));
    const links = await loadLinks();

    const content = file.toString().replaceAll(
      "{{ shortened_urls }}",
      Object.entries(links)
        .map(([shortCode, url]) => {
          return `<li><a href = "/${shortCode}" target = "_blank"> ${req.host} / ${shortCode} </a> - ${url}</li>`;
        })
        .join(" ")
    );
    return res.send(content);
  } catch (error) {
    console.log(error);
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

    links[finalShortCode] = url;
    await saveLinks(links);
  } catch (error) {
    console.log(error);
  }
};

export const redirectToShortLink = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const links = await loadLinks();

    if (!links[shortCode]) return res.status(404).send("404 error occoured");

    return res.redirect(links[shortCode]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};
