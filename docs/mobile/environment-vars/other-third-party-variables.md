# Other third party variables

## Map dependencies

To be able to use the map we need to create tokens for:

- Mapbox, used for all mapping functionality, [follow this instructions](https://www.mapbox.com/help/how-access-tokens-work/#creating-and-managing-access-tokens) to generate your own key.

```bash
MAPBOX_BASE_URL=
MAPBOX_TOKEN=
```





## Translations dependencies

We are using Transifex to sync and manage the translations, please see the documentation [here](https://docs.transifex.com/api/introduction) to fill the following variables.

```bash
TRANSIFEX_URL=
TRANSIFEX_PROJECT=
TRANSIFEX_SLUG=
TRANSIFEX_API_TOKEN=
```

## Crash Reporting

We are using [Sentry](https://sentry.io/welcome/) to handle crashes. Setup a project on Sentry to get a DSN.

Also make sure you copy `sentry.properties` into the `./android` and `./ios` folders.

```bash
SENTRY_DSN=
```
