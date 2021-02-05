## Local Development server accessing PROD data
Run `ionic serve` for a dev server. Navigate to `http://localhost:8100/`. The app will automatically reload if you change any of the source files.

## Development server using firebase emulator


Important: at the moment calling the functions on the server using sherpa.firebase.com doesn't work
Try calling https://sherpa.firebaseapp.com/sherpa-30d3a/us-central1/prepareOrder to see if a warmed up function works!
I have to run functions emulator locally to fill the Grom page

Run `npm install`
Run `cd functions && npm install && npm run build && cd ..`

Run `firebase emulators:start --project test`
Open a new terminal and 
Run `ionic serve`
Navigate to `http://localhost:8100/`. 

Note: to force your application to call local firebase database and functions you need to enable the custom providers in the app.module.ts file

## Publish on the server
Run `firebase deploy --only functions --project test` to deploy functions on firestore server
