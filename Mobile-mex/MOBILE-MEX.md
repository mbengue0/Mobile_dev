# MOBILE MEX - Fall 2025

### Exercise 1 : Mini Facebook-like Feed Page

Build a component SocialFeed.

The layout should include:

- A Header at top: with a logo / title (could be Text) and maybe an icon (Image or TouchableOpacity).
- A scrollable list of “posts” (use ScrollView or FlatList). Each post has:
    - The user info (avatar image + user name + timestamp) in a row.
    - The post content (text).
    - Possibly one image under the text (some post are text only, others with images).
    - A row of action buttons: like / comment / share icons or text.


## Exercise 2: Theme Switcher

Build a simple app that demonstrates the Context API by implementing a global theme (light/dark mode) that persists across multiple screens.


### Requirements

Create an app with:
- Global theme state (light/dark mode)
- Theme toggle functionality
- 3 simple screens that all respect the theme
- No complex navigation (single stack is fine)


### Instructions

#### Step 1: Create Theme Context
**File:** `context/ThemeContext.ts`

**Requirements:**
- Create a context with `createContext()`
- Define two theme objects (light and dark) with colors:
  - background
  - text
  - card
  - primary
- Use `useState` to track current theme ('light' or 'dark')
- Provide functions:
  - `toggleTheme()` - switches between light and dark
  - `theme` - current theme object
  - `isDark` - boolean for current mode

**Theme Objects Example:**
```javascript
const themes = {
  light: {
    background: '#ffffff',
    text: '#000000',
    card: '#f0f0f0',
    primary: '#007AFF',
  },
  dark: {
    background: '#000000',
    text: '#ffffff',
    card: '#1c1c1e',
    primary: '#0A84FF',
  },
};
```

#### Step 2: Wrap App with Theme Provider
**File:** `app/_layout.txs`

- Import and wrap the entire app with `ThemeProvider`
- Use basic Stack navigation

#### Step 3: Create Home Screen
**File:** `app/index.tsx`

**Display:**
- Welcome message
- Current theme mode indicator
- Theme toggle button/switch
- Button to navigate to Profile screen
- Button to navigate to Settings screen

**Styling:**
- Use `useContext(ThemeContext)` to get theme colors
- Apply theme colors to all elements
- Style button with theme.primary color

#### Step 4: Create Profile Screen
**File:** `app/profile.tsx`

**Display:**
- User profile card with dummy data (name, email)
- Theme toggle button
- Back button

**Requirements:**
- Use theme colors for all styling
- Show how theme changes affect this screen too

#### Step 5: Create Settings Screen
**File:** `app/settings.tsx`

**Display:**
- Settings list (3-4 dummy settings)
- Theme toggle switch
- Current theme mode text
- Back button

**Requirements:**
- Use theme colors consistently
- Each setting item should have theme-aware styling

## Deliverables 

- A github repository for each exerxise
- Links to the exercises sent via email