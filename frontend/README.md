# StockGuard frontend

## Run locally

1. Copy `.env.example` to `../.env.local` (Vite loads the repository-root env directory).
2. Set `VITE_FIREBASE_API_KEY` to the web API key from the Firebase project.
3. Start the AI service in a second terminal using the steps in `../AI-service/README.md`.
4. From this directory, run `npm install` and `npm run dev`.

Firebase Authentication and Firestore use the StockGuard Firebase project configured in `src/firebase.js`. Users can access the app as soon as they register. Firestore security rules should allow authenticated users to manage their own profile and inventory documents associated with their UID. The forecast, ordering, and expiry pages use the local AI service at `http://localhost:8001`; set `VITE_AI_API_URL` if it runs elsewhere. Add each medicine's average daily usage in inventory, or provide dispensing history, so the demand estimates have usage data.

Other API integrations, including forecasts, remain behind the frontend service boundary for the API team.
