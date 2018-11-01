# Contextual layers

These are overlay layers for the map that provide context information.

The following ones are included in the app by default:
- protectedAreas
- treeCoverLoss2015
- treeCoverLoss2016
- treeCoverLoss2017

There is also some GFW layers available in `/settings/layers` page
- oilPalm
- managedForests
- woodFiber
- mining

You can find the GFW layers configuration on the wri carto account in the `fw_contextual_layers` table.

How to generate the GFW layers [using carto named](https://carto.com/docs/carto-engine/maps-api/named-maps/) maps is saved in `config/forest_watcher_ctx_layers_nm.json`.

## Custom contextual layers

If you want to create another layer we also provide the option for creating custom ones following this [how to](https://docs.google.com/document/d/1HZLhzy8lJwhSVemVZMQqdnw8iu9NYqVwUJHNQMtNuJQ/edit).
