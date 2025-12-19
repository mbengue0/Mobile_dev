# Lab 1 

## Setup

Follow this guide if you need guidance on project setup

https://docs.expo.dev/tutorial/create-your-first-app

**React Core components and Docs** 
- https://reactnative.dev/docs/components-and-apis

- https://reactnative.dev/docs/style

**NB** : For each exercise you can create a separate component for example `Exercise1.tsx` and import it in the Index.tsx file.

## Exercise 1: The "Hello World" App

**Objective:** Create a basic React Native app and display text on the screen.

1.  **Project Setup:**
    * Create a new React Native project using Expo CLI and clean the boilerplate structure.
    * ```bash
      npx create-expo-app lab1 & cd lab1
      # Run 
      npm run reset-project
      ```
2.  **Code:**
    * Open `Index.tsx`.
    * Remove the default content and replace it with a `View` component containing a `Text` component.
    * Inside the `Text` component, display the text "Hello World!".

3.  **Styling:**
    * Use the `style` prop to add inline styles to the `View` component.
    * Give the `View` a `flex: 1` property to make it take up the full screen.
    * Use `justifyContent` and `alignItems` to center the text both vertically and horizontally.
    * Use the `style` prop on the `Text` component to change its `fontSize` to 24 and `fontWeight` to 'bold'.

***

## Exercise 2: The Profile Card

**Objective:** Use multiple components and apply styling using `StyleSheet`.

1.  **Code:**
    * Create a new component called `ProfileCard`. This component should be a `View` that acts as a container.
    * Inside the `ProfileCard` component, include the following:
        * An `Image` component. Use a placeholder image from a service like `https://placehold.co/100x100`.
        * A `Text` component for the user's name (e.g., "John Doe").
        * Another `Text` component for a short bio (e.g., "Software Developer").

2.  **Styling:**
    * **Import `StyleSheet` from `react-native`**. Instead of inline styles, create a `StyleSheet` object at the bottom of your `Exercise2.tsx` file.
    * Create a style for the main container (`profileCard`). Give it a `backgroundColor` of '#f0f0f0', `padding`, `margin`, and a `borderRadius`.
    * Create a style for the image (`profileImage`). Set its `width`, `height`, and `borderRadius` to make it circular.
    * Style the name text (`nameText`) with a larger `fontSize` and `fontWeight: 'bold'`.
    * Style the bio text (`bioText`) with a smaller `fontSize` and `color: '#666'`.
    * Apply these styles to the corresponding components using the `style` prop.

***

## Exercise 3: The Interactive Button

**Objective:** Introduce the `Button` and `TouchableOpacity` components and handle user interaction.

1.  **Code:**
    * Import the `useState` hook from React.
    * Create a state variable called `count` initialized to 0.
    * Add a `Text` component that displays the current value of `count`.
    * Below the text, add a `Button` component with the title "Increment".
    * Add an `onPress` prop to the `Button` that updates the `count` state.
    * **Bonus:** Replace the `Button` with a `TouchableOpacity` component. This component is more flexible for custom styling. Inside the `TouchableOpacity`, place a `Text` component with the title "Increment".

2.  **Styling:**
    * Style the `TouchableOpacity` to give it a background color, padding, and a border radius.
    * Style the text inside the `TouchableOpacity` to be white and centered.
    * **Challenge:** Use an **inline style** on the `Text` component to change its color to green when the `count` is even, and red when it's odd.
    * **Hint:**
      ```javascript
      style={[styles.baseStyle, { color: count % 2 === 0 ? 'green' : 'red' }]}
      ```

***

### Exercise 4: The Scrollable List

**Objective:** Use the `ScrollView` component to display a list of items that can be scrolled.

1.  **Code:**
    * Create an array of strings in your component, for example, a list of fruits: `['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape']`.
    * Wrap the entire list display within a `ScrollView` component.
    * Use the JavaScript `.map()` method to iterate over the array.
    * For each item in the array, render a `Text` component displaying the item's value.
    * **Remember to add a `key` prop** to each `Text` component when mapping over a list. The `key` should be a unique identifier, like the index.

2.  **Styling:**
    * Style the `ScrollView` to have a slight margin or padding to keep content from the edge.
    * Style the individual `Text` items. Give them some `padding`, a `borderBottomWidth` to create a visual separator between items, and a consistent `fontSize`.
    * Use a different background color for each item to make the list more visually appealing. **Hint:** Use the index in the `.map()` function to alternate colors. `index % 2 === 0`.
    * **Challenge:** Add a `Text` component at the end of the list that says "End of List" only if the list has more than 5 items.