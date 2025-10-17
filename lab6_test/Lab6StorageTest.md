# Lab 6 Storage Test

Build a notes app that uses:
- AsyncStorage for app settings
- Secure Storage for user credentials
- SQLite for storing notes with tags and categories

##  Project Setup & Dependencies
- Create the project and run `npm reset project` to clean it
- add the AsyncStorage, SecureStore and SQLite dependencies
- add other needed dependencies

### Files and Folders structures

The database will handle all structured data: **notes**, **categories**, and **tags**.  
This section focuses on the `dbService.ts/js` file.

| Task | Detail |
|------|---------|
| **2.1 Initialize DB** | Create and export the `initDb()` function to open the database file (`notes_app.db`). |
| **2.2 Create Tables** | Implement `initDb` to create the following tables if they don't exist: categories, notes (with `category_id` FK), tags, and `note_tags` (junction table). |
| **2.3 CRUD: Categories** | Create functions to Add, Fetch, Update, and Delete note categories. |
| **2.4 CRUD: Notes** | Create functions to Add, Fetch (single and list), Update, and Delete notes. |
| **2.5 CRUD: Tags** | Create functions to manage tags (Add, Fetch all unique tags). |


## 3. App Settings (AsyncStorage)

Used for non-sensitive user preferences like theme and sorting.  
This section focuses on the `settingsService.ts/js` file.

| Task | Detail |
|------|---------|
| **3.1 Save Setting** | Create `saveSetting(key, value)` to store simple key-value pairs (e.g., `theme: 'dark'`). |
| **3.2 Load Setting** | Create `getSetting(key)` to retrieve settings, providing a default value if none is found. |
| **3.3 Implement Theme** | Use `getSetting` in `App/Index/.ts/js` to load the initial theme and update the app's style context. |


## 4. Security & Authentication (SecureStore)

Used for highly sensitive data like login tokens or app PINs.  
This section focuses on the `authService.ts/js` file.

| Task | Detail |
|------|---------|
| **4.1 Save Credential** | Create `saveCredential(key, value)` to store the user's API token or PIN securely. |
| **4.2 Load Credential** | Create `getCredential(key)` to retrieve the secure data. |
| **4.3 App Unlock** | Implement an initial screen check in `App/Index/....ts/js` that uses SecureStore to verify if an API token exists or if a saved PIN is needed to unlock the app. |
| **4.4 Clear Credential** | Create a function to delete credentials upon sign-out or app reset. |