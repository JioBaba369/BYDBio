
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## IMPORTANT: How to Fix the Database Index Error

If you are seeing a `FirebaseError: The query requires an index` error when running the app, it means your live Firestore database is missing the required indexes to perform queries efficiently.

Your project's `firestore.indexes.json` file already contains all the correct index definitions. You just need to deploy them to your Firebase project.

### Easy Deployment Steps:

1.  **Install Firebase Tools:** If you haven't already, open your terminal and run:
    ```bash
    npm install -g firebase-tools
    ```

2.  **Log in to Firebase:** Connect the CLI to your Firebase account.
    ```bash
    firebase login
    ```
    This will open a browser window for you to sign in.

3.  **Deploy ONLY the Indexes:** Run the following command in your terminal. This is a fast way to update just your database indexes without deploying the entire website.
    ```bash
    firebase deploy --only firestore:indexes
    ```

After running this command, Firebase will start building the indexes. This can take a few minutes. Once it's complete, the error will be resolved. You can see the status of your indexes in the Firebase Console under **Firestore Database > Indexes**.
