import crypto from "crypto";
// import {
//   getLinkByShortCode,
//   loadLinks,
//   saveLinks,
// } from "../model/shortener.model.js";

import {
  getLinkByShortCode,
  loadLinks,
  saveLinks,
} from "../services/shortener.services.js";

// import { urls } from "../schema/url_schema.js";

export const getUrlShortener = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");
    // const file = await readFile(path.join("views", "index.html"));
    //!
    const links = await loadLinks(req.user.id);
    // const links = await urls.find(); //! using mongoose

    //!using cookies
    // let isLoggedIn = req.headers.cookie;
    // isLoggedIn = isLoggedIn
    //   ?.split(";")
    //   ?.find((cookie) => cookie.trim().startsWith("isLoggedIn"))
    //   ?.split("=")[1];
    // console.log(isLoggedIn);

    //! now with the help of cookie-parser
    let isLoggedIn = req.cookies.isLoggedIn;

    return res.render("index", { links, host: req.host, isLoggedIn });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

export const postUrlShortener = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");
    // const { url, shortCode } = req.body;
    const { url, shortCode } = req.body; //
    const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex"); //

    // const links = await loadLinks();
    // const links = await urls.find(); //! using mongoose
    const links = await getLinkByShortCode(shortCode);

    if (links) {
      return res
        .status(400)
        .send("Short code already exists. Please choose another. ");
    }
    // links[finalShortCode] = url;
    // await saveLinks(links);

    await saveLinks({ url, shortCode: finalShortCode, userId: req.user.id });
    // await urls.insertOne({ url, shortCode }); //! using mongoose

    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

export const redirectToShortLink = async (req, res) => {
  try {
    const { shortCode } = req.params;
    // console.log("shortCode:" + shortCode);
    // const links = await loadLinks();
    const links = await getLinkByShortCode(shortCode);
    // const links = await urls.findOne({ shortCode: shortCode }); //! using mongoose

    // if (!links[shortCode]) return res.status(404).send("404 error occured");
    if (!links) return res.redirect("/404");

    // return res.redirect(links[shortCode]);
    return res.redirect(links.url);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};
