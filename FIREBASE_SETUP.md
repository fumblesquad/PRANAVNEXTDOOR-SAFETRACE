# Firebase Setup Guide for SafeTrace

This guide walks you through setting up Firebase for SafeTrace, which handles authentication, data storage, and evidence file uploads.

## Prerequisites
- A Google account
- SafeTrace cloned locally

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter project name: `safetrace` (or your choice)
4. Accept the terms and click **"Create project"**
5. Wait for the project to be created, then click **"Continue"**

## Step 2: Enable Firestore Database

Firestore stores incident reports, case information, and user data.

1. In the Firebase Console, click **"Firestore Database"** in the left menu
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development; tighten security rules in production)
4. Select region: **`us-central1`** (or nearest to your users)
5. Click **"Create"**
6. Once created, click the **"Rules"** tab and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

Click **"Publish"**.

## Step 3: Enable Firebase Authentication

Auth handles user sign-in (Google OAuth + Email/Password).

1. Click **"Authentication"** in the left menu
2. Click **"Get started"**
3. Under **"Sign-in method"**, enable:
   - **Email/Password**: Click the method, toggle **"Enable"**, click **"Save"**
   - **Google**: Click the method, toggle **"Enable"**, add your project name and support email, click **"Save"**

## Step 4: Enable Cloud Storage

Storage holds uploaded evidence files (images, audio).

1. Click **"Storage"** in the left menu
2. Click **"Get started"**
3. Choose **"Start in test mode"** (development only)
4. Select region: **`us-central1`**
5. Click **"Create"**
6. Click the **"Rules"** tab and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /evidence/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

Click **"Publish"**.

## Step 5: Get Your Firebase Config

1. In Firebase Console, click the gear icon (⚙) → **"Project settings"**
2. Under **"Your apps"**, click the web icon `</>` to create a web app
3. Register the app as `safetrace-web`
4. Copy the Firebase config object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "safetrace-xxxxx.firebaseapp.com",
  projectId: "safetrace-xxxxx",
  storageBucket: "safetrace-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcd1234..."
};
```

## Step 6: Get Your Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Make sure you're in the same Firebase project
3. Click **"APIs & Services"** → **"Credentials"**
4. Click **"Create Credentials"** → **"OAuth Client ID"**
5. Choose **"Web application"**
6. Add authorized origins:
   - `http://localhost:5173` (development)
   - Your production domain
7. Click **"Create"** and copy your **Client ID**

## Step 7: Configure SafeTrace

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in `.env` with your Firebase config values:

```env
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=safetrace-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=safetrace-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=safetrace-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcd1234...
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

## Step 8: Test the App

```bash
npm run dev
```

Visit `http://localhost:5173` and test:
- **Anonymous report**: Report → submit (no login)
- **Sign up**: Sign in → Register → email/password
- **Google login**: Sign in → Continue with Google
- **Evidence locker**: Sign in → Evidence tab

## Firestore Data Structure

```
/reports
  ├── {docId}
  │   ├── caseId: "ST-M1K2L3-AB4C"
  │   ├── type: "harassment"
  │   ├── description: "..."
  │   ├── location: { lat: 13.0827, lng: 80.2707 }
  │   ├── status: "Submitted"
  │   ├── createdAt: "2026-03-30T..."
  │   ├── userId: "uid..." (optional)
  │   └── evidenceUrls: [
  │       { name: "photo.jpg", url: "...", hash: "sha256..." }
  │     ]
```

## Security Rules (Production)

**Firestore:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{document=**} {
      allow read: if true;
      allow create: if request.resource.data.caseId != null;
      allow update: if resource.data.userId == request.auth.uid;
    }
  }
}
```

**Storage:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /evidence/{allPaths=**} {
      allow read: if true;
      allow write: if request.resource.size < 50 * 1024 * 1024;
    }
  }
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Firebase config invalid | Verify `.env` values match Firebase console |
| Permission denied | Update Firestore/Storage rules |
| Google OAuth fails | Check `VITE_GOOGLE_CLIENT_ID` and authorized origins |
| Evidence upload fails | Check Storage rules and file size < 50MB |

## Next Steps

- Deploy to production (Firebase Hosting, Vercel, Netlify)
- Tighten security rules for production
- Monitor usage in Firebase Console
