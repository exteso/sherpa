## Local Development server accessing PROD data
Run `ionic serve` for a dev server. Navigate to `http://localhost:8100/`. The app will automatically reload if you change any of the source files.

## Development server using firebase emulator

Run `npm install`
Run `cd functions && npm install && npm run build && cd ..`

Run `firebase emulators:start --project grom`
Open a new terminal and 
Run `ionic serve`
Navigate to `http://localhost:8100/`. 

Note: to force your application to call local firebase database and functions you need to enable the custom providers in the app.module.ts file

## Publish on the server
Run `git push -u github grom` to synch with github and trigger Github actions
Run `firebase deploy --only functions --project grom` to deploy functions on firestore server
