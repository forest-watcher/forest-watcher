# Forest Watcher Changelog

## [v1.0.0] - 2017-09-08
- Production ready!

## [v1.0.0rc9] - 2017-09-07
- Fix infinite spinner on first load
- Update translations

## [v1.0.0rc8-3] - 2017-09-07
- Fix mapbox basemap requests

## [v1.0.0rc8-2] - 2017-09-07
- Fix google sign in android store

## [v1.0.0rc8-1] - 2017-09-06
- Includes offline maps tile rescaling both in Android and iOS
- Fixes walkthrough images order.
- Fixes connectivity changes being squashed by persisted state.

## [v1.0.0rc8] - 2017-09-05
- Fix sync modal opening twice in some cases.
- Fix question text-detail (text that prompts on select _other_) has the label again.
- Removes legend from map sidebar when creating an area
- Fixes texts in some places that we're getting cut off.
- Sliding on walkthrough now also leads you to login page.
- Adds skip button to walkthrough.
- If logging in with no areas now you have the option to logout.
- Contextual layers sidebar now has scroll enabled.
- When selecting multiple neighbour alerts and then zooming out: neighbour alerts are removed.
- When assigning a custom template to an area the alerts stop showing: fixed on the backend.
- On contextual layers now you have available the 2014/2015 Loss Layer: added on the backend.

## [v1.0.0rc7] - 2017-08-30
- Fix click on arrow in area-list not doing anything.
- Adds active state to switch component.
- Includes app walkthrough on start.
- Fix polygon on area creation doesn't update correctly.
- Improves areas image loading.
- Updates app icons.
- Includes contextual layers on area creation map.
- Update static texts: includes ToS and FAQ sections.
- Fix reporting offline shows wrong button text.
- Fix reporting offline sets report status to uploaded.

## [v1.0.0rc6] - 2017-08-24
- Includes the possibility of switching coordinates formats between decimal and degrees.
- Fixes regression on make area available offline feature.
- Fixes area not zooming in properly on enter.
- Major performance improvement on iOS map.
- Updates splash screen and app logos.
- iOS support for area caching.
- Remove cached data when deleting an area.
- Fix area creation on iOS.
- Creating an area over 3G no longer causes a crash.

## [v1.0.0rc5] - 2017-08-17
- Improve download cache status progress bar
- Fix breaks in area creation
- Save area images properly
- Fix custom reports reponses
- Fix sync missing templates
- Fix rollback on report upload

## [v1.0.0rc4] - 2017-08-11
- User position saved properly
- Prevents adding areas if no internet connection
- Fix iOS map updates
- Dashboard re-style with recache posibility
- Download progress bar more fluid
- Use android high resolution icons

## [v1.0.0rc3] - 2017-08-04
- Cache areas on demand
- Fix offline rollback actions
- Clear offline actions pending on logout

## [v1.0.0rc2] - 2017-08-01
- Sort report by last date
- iOS release
- Fixed infinite sync page

## [v1.0.0rc1] - 2017-07-28

### Added

- Custom basemap with mapbox attribution
- Makes the map a lot faster
- Contextual layers sidebar
- Clear cache on version upgrade
- Map legend for alerts
- Multiselect alerts
- Show reported alerts in different color
- New camera implementation with option of choosing images from library
- New home screen design
- Logout improvements
- Review uploaded report
- Report review images edit and delete
- Support multiple images in report review
- Custom area templates support
- Cache basemap and contextual layers
- Zip basemap cache to zoom level 17
- Alerts incremental sync
- Download alerts speed improvements
- Sync areas, layers and alerts on each app open
- RN 0.45 update
- Fix offline map date filter
- Production error tracking
- Compass fixes
- Remove alerts on zoom out

## [beta] - 2017-06-21

### Added

- Switch tiles to markers for alerts that makes the report task much much easier.
- New alert interaction (multiselection comming soon).
- New sync page to keep everything synced with the app, online requests will be stored until the phone has connection.
- Include VIIRS layers and timeframes.
- Alert area status saved in the API.
- Login/Logout to use multiple accounts.
- New multilanguage reports.
- Improve map performance when reporting.
- Update about static page.
- Update literals and translations.
- Bugs fixing.
