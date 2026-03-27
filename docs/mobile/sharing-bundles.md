# Sharing bundles

Sharing bundles allow users to export app content from their app as a bundle.
The bundle can then be imported into other app instances.
The feature was added in v2.0.0 of the app.

The sharing bundle is a zip file with the extension `.gfwbundle`. The bundle contains:
- A version number indicating which app version created it
    - This is to prevent incompatible data being imported
    - Users are **not** allowed to import bundles with incompatible version numbers from those supported by the app version they are running.
- A `bundle.json` file at the root. This is a JSON file containing:
    - Data payloads for each exported area, report etc. (usually taken directly from Redux)
    - A file manifest containing relative paths to other files contained within the bundle
- A directory of associated files referred to from the file manifest (e.g. layer files)
    - This contains layer files, basemap files, and report attachments.

Imported data lives alongside but is visually distinct from the user's own data. For instance, imported areas won't be synced to the user's account.
However, imported reports *can* be uploaded if the user so desires.

Imported data can be in turn exported and shared with other users.
We check the IDs of data when importing it to avoid the possibility of duplicate items.

## Exporting

1. In the UI, the user selects the items they would like to export.
    - Available items include areas, routes, reports, layers, and their associated files.
1. The export request is handled by `./app/helpers/sharing/exportBundle.js`
1. First, all the explicitly requested app data is extracted from Redux state in preparation for inclusion in `bundle.json`
1. Next, required standalone files are identified:
    - Layer files (such as tiles) are selected if the region they represent intersects any areas or routes in the bundle
    - Report attachments are selected if their associated report is in the bundle
1. We then make sure a layer or basemap metadata entry exists in the `bundle.json` for each of the copied layer files.
    - This is to ensure layer file is "tied" to a layer when imported, and not orphaned.
1. A staging directory is then created and all the identified files are copied into it.
1. The final `bundle.json` is created, and all the data within it is sanitised to remove paths and other device-specific data.
1. Finally, the staging bundle is compressed and stored.
1. The staging directory is deleted and the user is prompted to share the bundle.
    - The bundle can be shared to other devices via e-mail, bluetooth or any means available to the user through their device.

## Importing

1. The recipient user opens the bundle on their device. They are prompted to open it with the Forest Watcher app.
1. First, the bundle is unpacked into a staging directory.
1. The overall contents of the bundle are inspected, and the user is then taken to a special Import flow within the app.
    - This flow prompts them to select the data they want to import
    - If the bundle is incompatible with the app version then the user cannot proceed through the flow.
1. Once the user has completed the flow and an "import request" has been constructed, the request is handled by `./app/helpers/sharing/importBundle.js - importStagedBundle`
1. The user's selected data is stored into Redux state
    - Each item is flagged as imported so we can differentiate it in the user interface
    - Items with an identical ID as an existing item in Redux state are ignored, to avoid duplicates.
1. Next, relevant layer files and report attachments are copied into the correct location on the user's device 
1. Finally, the staging directory is deleted.
