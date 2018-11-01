// Script to request all active languages on transifex and then fetch their respective translations
const fetch = require('node-fetch');
const fs = require('fs');
require('dotenv').config();

// Endpoint for fetching available languages
const langUrl = `${process.env.TRANSIFEX_URL}/${process.env.TRANSIFEX_PROJECT}/resource/${process.env.TRANSIFEX_SLUG}/?details`;

// Endpoint for fetching translations
const transUrl = `${process.env.TRANSIFEX_URL}/${process.env.TRANSIFEX_PROJECT}/resource/${process.env.TRANSIFEX_SLUG}/translation`;

// Fetch config
const fetchConfig = {
    headers: {
        Authorization: `Basic ${process.env.TRANSIFEX_API_TOKEN}`
    },
    method: 'GET'
}

// Lets start
console.log('Fetching available languages...');

fetch(langUrl, fetchConfig)
    .then(function(res) {
        if (res.ok) return res.json();
        throw new Error(res.statusText);
    })
    .then(function(json) {
        const languages = json.available_languages.map((language) => {
            return language.code;
        });
        return languages;
    })
    .then(function(languages) {
        languages.forEach((lang) => {
            fetch(`${transUrl}/${lang}`, fetchConfig)
                .then(function(res) {
                    return res.json();
                })
                .then(function(json) {
                    fs.writeFile(`${process.env.LOCALES_PATH}/${lang}.json`, JSON.stringify(JSON.parse(json.content), null, 4), (err) => {
                        if (err) throw err;
                        console.log(`Translations for ${lang} successfully saved!`);
                    });
                });
        });

    })
    .catch((err) => {
        console.log(err);
    });
