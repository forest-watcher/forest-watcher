
## Forest Watcher API

Endpoints used:
* `/area/<area_id> [DELETE]`
    * Deletes a user's area
* `/area/<area_id> [PATCH]`
    * Updates the name or datasets for the user's area
    * `name` and `datasets` are sent as `FormData`
    * See `app/types/areas.types.js` for dataset model
* `/contextual-layer [GET]`
    * Retrieves a list of the contextual layers affecting a user
    * This may include custom layers the user has added in FW Web
    * See `app/types/layers.types.js` for area model
* `/download-tiles/<geostore_id>/<zoom_start>/<zoom_end> [GET]`
    * Bundles a minimal set of tiles overlapping an area from a specified tile server
    * The tiles are returned in a zip archive
    * The app then unpacks and stores them locally
* `/forest-watcher/area [GET, POST]`
    * Creates or retrieves a FW area
    * See `app/types/areas.types.js` for area model
* `/fw-alerts/<dataset_id>/<geostore_id> [GET]`
    * Fetches the VIIRS or GLAD alerts affecting an area
    * `dataset_id` is either `viirs` or `umd_as_it_happens`
    * Accepts two query parameters:
        * `range` is either 365 (for GLAD) or 7 (for VIIRS)
        * `output` is always `csv`
* `/query/<dataset_id> [GET]`
    * Executes an SQL query against a particular dataset
* `/reports/default [GET]`
    * Get the default template for this user
* `/reports/<template_id>/answers [POST]`
    * Send a report
    


