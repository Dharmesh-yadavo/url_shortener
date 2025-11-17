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
  findShortLink,
  editShortLink,
  deleteShortLink,
} from "../services/shortener.services.js";
import z from "zod";
import { shortenerSearchParamsSchema } from "../validators/shortener-validators.js";

// import { urls } from "../schema/url_schema.js";

export const getUrlShortener = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");
    // const file = await readFile(path.join("views", "index.html"));
    //!
    // const links = await loadLinks(req.user.id);
    // const links = await urls.find(); //! using mongoose

    const searchParams = shortenerSearchParamsSchema.parse(req.query);

    const { shortLinks, totalCount } = await loadLinks({
      userId: req.user.id,
      limit: 10,
      offset: (searchParams.page - 1) * 10,
    });

    const totalPages = Math.ceil(totalCount / 10);

    //!using cookies
    // let isLoggedIn = req.headers.cookie;
    // isLoggedIn = isLoggedIn
    //   ?.split(";")
    //   ?.find((cookie) => cookie.trim().startsWith("isLoggedIn"))
    //   ?.split("=")[1];
    // console.log(isLoggedIn);

    //! now with the help of cookie-parser
    let isLoggedIn = req.cookies.isLoggedIn;

    return res.render("index", {
      links: shortLinks,
      host: req.host,
      isLoggedIn,
      currentPage: searchParams.page,
      totalPages: totalPages,
      errors: req.flash("errors"),
    });
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
      // return res
      //   .status(400)
      //   .send("Short code already exists. Please choose another. ");
      req.flash(
        "errors",
        "URL with that shortcode already exists, please choose another"
      );
      return res.redirect("/");
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

export const getShortenerEditPage = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);
  if (error) return res.redirect("/404");

  try {
    const shortLink = await findShortLink(id);
    if (!shortLink) return res.redirect("/404");

    res.render("edit-shortLink", {
      id: shortLink.id,
      url: shortLink.url,
      shortCode: shortLink.shortCode,
      errors: req.flash("errors"),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

export const postShortenerEditPage = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);
  if (error) return res.redirect("/404");

  const { url, shortCode } = req.body;

  try {
    await editShortLink({ id, url, shortCode });
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

export const getShortenerDelete = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);
  if (error) return res.redirect("/404");

  try {
    await deleteShortLink(id);
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};
