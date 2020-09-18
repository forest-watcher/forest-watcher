# Environment variables
In order to get your application running you'll need to setup some environment variables.

A sample env file is included [here](../../.env.sample).
This can be copied to `.env`, `.env.android`, and `.env.ios`, and the values filled in using the instructions below.

The following env vars are directly related to the app behaviour.

For the rest of the env vars go to:
- [OAuth variables](/mobile/environment-vars/oauth-variables.md)
- [Other third party variables](/mobile/environment-vars/other-third-party-variables.md)

## Application dependencies

Basic dependencies from the [RW API](https://resource-watch.github.io/doc-api/index-rw.html) and the values from some datasets.

```bash
API_URL=https://production-api.globalforestwatch.org/v1
DATASET_COUNTRIES=134caa0a-21f7-451d-a7fe-30db31a424aa
```
