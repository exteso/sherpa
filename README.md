## Local Development server accessing PROD data
Run `ionic serve` for a dev server. Navigate to `http://localhost:8100/`. The app will automatically reload if you change any of the source files.

## Development server using firebase emulator
Run `firebase emulators:start --project test`
Navigate to `http://localhost:5000/`. 

Note: to force your application to call local firebase database and functions you need to enable the custom providers in the app.module.ts file

## Publish on the server
Run `firebase deploy --only functions --project test` to deploy functions on firestore server
