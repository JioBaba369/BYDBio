# BYD.Bio - Build Your Dream Bio

Welcome to BYD.Bio, your all-in-one professional hub. This platform allows you to create a dynamic public profile, share a link-in-bio page, post content, manage events, and much more. It's designed to be the central point for your online presence.

## Key Features

- **Dynamic User Profiles**: Create a rich, public-facing profile with your bio, links, and contact information.
- **Content Feeds**: Share status updates, articles, and thoughts in a "Following" and "Discovery" feed.
- **AI Bio Assistant**: Leverage generative AI to craft the perfect professional bio from a few keywords.
- **Digital Business Card**: Generate a scannable QR code that links to a digital vCard, perfect for networking.
- **Link-in-Bio**: Manage a customizable page of all your important links.
- **Content Creation**: Post listings, job opportunities, events, and special offers to the community.
- **Community Interaction**: Follow other users, like posts, and RSVP to events.
- **BYD BioTAG**: A physical NFC tag that links directly to your digital business card.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Authentication & Database**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Storage)

## Getting Started

To run this project locally, you'll need to have Node.js and the Firebase CLI installed.

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [Firebase Tools](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
- A Firebase project with Authentication, Firestore, and Storage enabled.

### 2. Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <repo-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    Create a `.env.local` file in the root of the project and add your Firebase project configuration keys. You can get these from your Firebase project settings.

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://127.0.0.1:9002`.

### 3. Deploying Firestore Indexes

The application requires specific Firestore indexes to query data efficiently. You must deploy these indexes to your live Firebase project to avoid errors.

1.  **Log in to Firebase:**
    ```bash
    firebase login
    ```

2.  **Deploy ONLY the indexes:**
    This command is fast and will only update your database configuration.
    ```bash
    firebase deploy --only firestore:indexes
    ```
    The indexing process can take a few minutes. You can monitor its status in the Firebase Console under **Firestore Database > Indexes**.

## Deployment

To deploy the application to Firebase Hosting, you can run the full deployment command, which includes Firestore rules, indexes, and hosting:

```bash
npm run deploy
```

Alternatively, if you only want to deploy the web application itself, use:
```bash
firebase deploy --only hosting
```
