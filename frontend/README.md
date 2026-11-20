# StockGuard frontend

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_FIREBASE_API_KEY` to the web API key from the Firebase project.
3. From this directory, run `npm install` and `npm run dev`.

Firebase Authentication and Firestore use the StockGuard Firebase project configured in `src/firebase.js`. Users can access the app as soon as they register. Firestore security rules should allow authenticated users to manage their own profile and inventory documents associated with their UID.

Other API integrations, including forecasts, remain behind the frontend service boundary for the API team.
