import React, { useState } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableCard from './components/DraggableCard';

const INITIAL_CARDS = Array.from({ length: 5 }, (_, i) => i);

export default function App() {
  const [cards, setCards] = useState(INITIAL_CARDS);
  console.log("App mounted - Debugging Lab 14");

  const handleDismiss = (cardIndex: number) => {
    setCards((prevCards) => prevCards.filter((c) => c !== cardIndex));
  };

  const handleReset = () => {
    setCards(INITIAL_CARDS);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={{ marginTop: 50, fontSize: 18, fontWeight: 'bold' }}>Lab 14 Gestures Debug</Text>
      <View style={styles.cardContainer}>
        {cards.length > 0 ? (
          cards.map((cardIndex, index) => {
            // Only render the top few cards for performance if needed, 
            // but here we just render them all. 
            // Reverse order so first in array is at bottom? 
            // Actually, last in array is visually on top usually in default RN, 
            // unless we control zIndex.
            // Let's render in reverse order so that index 0 is at bottom, 
            // or render normally and rely on absolute positioning + zIndex in DraggableCard

            // DraggableCard uses zIndex: -index. 
            // If cards array is [0, 1, 2, 3, 4]
            // Card 0 has zIndex 0. 
            // Card 1 has zIndex -1.
            // So Card 0 is on top. THIS MATCHES logic.

            return (
              <DraggableCard
                key={cardIndex}
                index={index}
                onDismiss={() => handleDismiss(cardIndex)}
              />
            );
          }).reverse() // Reverse so that the one with index 0 (top) is rendered last in DOM-like structure?
          // Wait, if using zIndex, rendering order matters less for distinct zIndices.
          // However, GestureDetector might depend on view hierarchy order for hit testing?
          // Actually, if we use absolute positioning and they overlap, the one with higher zIndex captures touch.
          // Card 0: zIndex 0. Card 1: zIndex -1.
          // Card 0 should be on top.
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No more cards!</Text>
            <Button title="Reset Deck" onPress={handleReset} />
          </View>
        )
        }
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    marginBottom: 20,
  }
});
