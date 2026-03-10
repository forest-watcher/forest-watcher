// Script to request all active languages on transifex and then fetch their respective translations
const fetch = require("node-fetch");
const fs = require("fs");
const { transifexApi } = require("@transifex/api");
require("dotenv").config();

transifexApi.setup({
  auth: process.env.TRANSIFEX_API_TOKEN
});

(async function () {
  const organization = await transifexApi.Organization.get({ slug: "WRI" });

  const projects = await organization.fetch("projects");
  const project = await projects.get({ slug: process.env.TRANSIFEX_PROJECT });

  const resources = await project.fetch("resources");
  const resource = await resources.get({ slug: process.env.TRANSIFEX_SLUG });

  const languages = await project.fetch("languages");
  await languages.fetch();

  const url = await transifexApi.ResourceStringsAsyncDownload.download({ resource });
  const response = await fetch(url);

  fs.writeFile(`${process.env.LOCALES_PATH}/en.json`, JSON.stringify(await response.json(), null, 4), err => {
    if (err) throw err;
    console.log(`Source string successfully saved!`);
  });

  for (const lang of languages.data) {
    const code = lang.get("code");
    const language = await transifexApi.Language.get({ code });
    const url = await transifexApi.ResourceTranslationsAsyncDownload.download({
      language,
      resource
    });
    const response = await fetch(url);

    fs.writeFile(`${process.env.LOCALES_PATH}/${code}.json`, JSON.stringify(await response.json(), null, 4), err => {
      if (err) throw err;
      console.log(`Translations for ${code} successfully saved!`);
    });
  }
})();