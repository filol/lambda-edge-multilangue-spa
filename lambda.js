const path = require("path");

const AVAILABLE_LANGUAGES = ["en", "fr"];
const DEFAULT = "en";

exports.handler = async (event, _context, callback) => {
  const { request } = event.Records[0].cf;
  const { headers } = request;

  console.log("Path: ", request.uri);
  // only if we are at domain root
  if (request.uri === "/") {
    // We check if the browser give us a default lang to use
    if (typeof headers["accept-language"] !== "undefined") {
      const supportedLanguages = headers["accept-language"][0].value;
      console.log("Supported languages:", supportedLanguages);
      AVAILABLE_LANGUAGES.forEach((lang) => {
        if (supportedLanguages.startsWith(lang)) {
          callback(null, redirect(`/${lang}/index.html`));
        }
      });
      callback(null, redirect(`/${DEFAULT}/index.html`));
    } else {
      callback(null, redirect(`/${DEFAULT}/index.html`));
    }
  } else if (!path.extname(request.uri)) {
    // user come with predefined language
    AVAILABLE_LANGUAGES.forEach((lang) => {
      if (request.uri.startsWith(`/${lang}`)) {
        request.uri = `/${lang}/index.html`;
        callback(null, request);
      }
    });
    request.uri = `/${DEFAULT}/index.html`;
    callback(null, request);
  } else {
    callback(null, request);
  }
};

function redirect(to) {
  return {
    status: "301",
    statusDescription: "redirect to browser language",
    headers: {
      location: [{ key: "Location", value: to }],
    },
  };
}
