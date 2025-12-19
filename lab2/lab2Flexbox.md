# Lab2Flexbox

## Part 1
Follow this official guide as a refecence on FLexbox with React Native

https://reactnative.dev/docs/flexbox

## Part 2

### Exercise 1: Login / Signup Form Layout

Goal: Practice form layout with inputs, buttons, and alignment using flexbox.

#### Instructions:

Build a component called AuthForm.
The screen should have:
- A title at the top: e.g. “Login” or “Sign Up” (Text).
- Two TextInput fields: one for email/username, one for password.
- "Forgot Password?" link (Text) aligned to the right under the password input.
- A Picker (or Picker-like component)  for “Role” (e.g. student vs teacher)
- A switch toggle for “Remember me” 
- A button (TouchableOpacity or Button) for Submit.

Use flexbox styles to center the form vertically and horizontally within the screen.

Use paddings / margins so it's nicely spaced.

### Exercise 2 : Mini Facebook-like Feed Page

Goal: Combine header, list of posts, each post with image + text, footer; practice nested flex layouts.

#### Instructions:

Build a component SocialFeed.

The layout should include:
- A Header at top: with a logo / title (could be Text) and maybe an icon (Image or TouchableOpacity).
- A scrollable list of “posts” (use ScrollView or FlatList). Each post has:
    - The user info (avatar image + user name + timestamp) in a row.
    - The post content (text).
    - Possibly one image under the text (some post are text only, others with images).
    - A row of action buttons: like / comment / share icons or text.

### Exercise 3: Movie/Product Card Gallery

Goal: Create a grid-like layout of cards, combining flexbox for the overall grid with nested flexbox for the card content. This exercise is perfect for a product list or a movie gallery page.

#### Instructions:
Build a component called GalleryGrid.

The layout should display a grid of cards, with each card representing a movie or product. Use a FlatList with numColumns={2} to create a two-column grid.

Each individual card component should use flexbox to structure its content:

- Image: The top section of the card should be an image of the movie poster or product.
- Title and Price/Rating: Below the image, place the item's title and a price or star rating. These should be in a row, with the title on the left and the price/rating aligned to the right. Use justifyContent: 'space-between'.
- Description: A short, truncated description of the item below the title and price.
- Buy/Details Button: A call-to-action button at the bottom of the card.

Ensure the cards have consistent spacing and a uniform appearance. Use flexbox to handle the alignment and distribution of elements within each card, making the entire gallery both functional and visually appealing.