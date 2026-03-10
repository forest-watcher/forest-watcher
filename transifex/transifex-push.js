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
  const content = fs.readFileSync(`${process.env.LOCALES_PATH}/en.json`, { encoding: "utf8" });

  await transifexApi.ResourceStringsAsyncUpload.upload({ resource, content });
  console.log("Translation successfully uploaded!");
})();