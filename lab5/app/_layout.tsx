import React from 'react';
import { CartProvider } from '@/contexts/CartContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <CartProvider>
      <Stack>
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
      </Stack>
    </CartProvider>
  );
}