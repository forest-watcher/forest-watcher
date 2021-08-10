// Pushes the current language.json files from LOCALES_PATH to transifex. Does NOT override
// en.json. This must be done using transifex-push!
const fetch = require('node-fetch');
const fs = require('fs');
require('dotenv').config();

// Endpoint for fetching available languages
const langUrl = `${process.env.TRANSIFEX_URL}/${process.env.TRANSIFEX_PROJECT}/resource/${process.env.TRANSIFEX_SLUG}/?details`;

// Endpoint for fetching translations
const transUrl = `${process.env.TRANSIFEX_URL}/${process.env.TRANSIFEX_PROJECT}/resource/${process.env.TRANSIFEX_SLUG}/translation`;

// Lets start
console.log('Fetching available languages...');

const headers = {
    Authorization: `Basic ${process.env.TRANSIFEX_API_TOKEN}`,
    'Content-Type': 'application/json'
};

fetch(langUrl, {
    headers,
    method: 'GET'
})
    .then(function(res) {
        if (res.ok) return res.json();
        throw new Error(res.statusText);
    })
    .then(function(json) {
        const languages = json.available_languages.map((language) => {
            return language.code;
        }).filter(language => language !== "en");
        return languages;
    })
    .then(function(languages) {
        languages.forEach((lang) => {

            fs.readFile(`app/locales/${lang}.json`, 'utf-8', (err, translations) => {

                const jsonTranslations = JSON.parse(translations);

                const langURL = `${transUrl}/${lang}`;
                // Request config
                const json = {
                    "content": JSON.stringify(jsonTranslations)
                };
                const fetchConfig = {
                    headers: {
                        Authorization: `Basic ${process.env.TRANSIFEX_API_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    method: 'PUT',
                    body: JSON.stringify(json)
                };
                fetch(langURL, fetchConfig)
                    .then(function(res) {
                        return res.json();
                    })
                    .then(function(json) {
                        console.log(json);
                        console.log(`${lang}.json Translation successfully uploaded!`);
                    })
                    .catch((err) => {
                        console.error(err);
                    })
            });
        });

    })
    .catch((err) => {
        console.log(err);
    });


// // PUT en.json
// fetch(url, fetchConfig)
//     .then(function(res) {
//         return res.json();
//     })
//     .then(function(json) {
//         console.log(json);
//         console.log('Translation successfully uploaded!');
//     })
//     .catch((err) => {
//         console.log(err);
//     })