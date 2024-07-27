### Updating configs and data-files

-   Whenever a change has been made to one of the org super config in google sheets. You can run `npm run configs:download` to pull those changes locally.
-   Once those changes are you, you should run `npm run test` to see if there are any issues. There is a config test for each org at the moment.
-   If the tests pass or the snapshot changes look okay, open a pr with the changes.
-   Once that merges, you then need to manually add the updates to the db. Connect to prod db and run `npm run configs:add-to-db`
-   if you are fixing a bug with a patient's config, then you will need to manually bump them to the latest version config for their org.

### I added a new assessment question to the config (qaConfig or backOffice), but it isn't showing up in the app.

-   config files are saved to the db for the org. You need to run setup again to seed the db
