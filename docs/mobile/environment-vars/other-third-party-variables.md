# Other third party variables

## Map dependencies

To be able to use the map we need to create tokens for:

- Mapbox, used for all mapping functionality, [follow this instructions](https://www.mapbox.com/help/how-access-tokens-work/#creating-and-managing-access-tokens) to generate your own key.

```bash
MAPBOX_BASE_URL=
MAPBOX_TOKEN=
```

### Android Mapbox Maven Repository

For Android builds, you also need to configure the Mapbox Maven password to download Mapbox SDK dependencies. This should **NOT** be committed to git.

**Option 1: Use local.properties (Recommended)**
Create `android/local.properties` (this file is already gitignored) and add:
```properties
MAPBOX_MAVEN_PASSWORD=your_mapbox_secret_token_here
```

**Option 2: Use environment variable**
Set the environment variable before building:
```bash
export ORG_GRADLE_PROJECT_MAPBOX_MAVEN_PASSWORD=your_mapbox_secret_token_here
```

**Option 3: User-level gradle.properties**
Add to `~/.gradle/gradle.properties`:
```properties
MAPBOX_MAVEN_PASSWORD=your_mapbox_secret_token_here
```

To get your Mapbox secret token, see [Mapbox's documentation on Maven credentials](https://docs.mapbox.com/android/maps/guides/install/#configure-credentials).


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
