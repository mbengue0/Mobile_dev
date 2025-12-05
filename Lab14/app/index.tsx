import React, { useState } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
// DraggableCard is in ../components relative to app/index.tsx
import DraggableCard from '../components/DraggableCard';

const INITIAL_CARDS = Array.from({ length: 5 }, (_, i) => i);

export default function Index() {
    const [cards, setCards] = useState(INITIAL_CARDS);
    console.log("Expo Router Index mounted");

    const handleDismiss = (cardIndex: number) => {
        setCards((prevCards) => prevCards.filter((c) => c !== cardIndex));
    };

    const handleReset = () => {
        setCards(INITIAL_CARDS);
    };

    return (
        <View style={styles.container}>
            <Text style={{ marginTop: 50, fontSize: 18, fontWeight: 'bold' }}>Lab 14 Gestures (Router)</Text>
            <View style={styles.cardContainer}>
                {cards.length > 0 ? (
                    cards.map((cardIndex, index) => {
                        return (
                            <DraggableCard
                                key={cardIndex}
                                index={index}
                                onDismiss={() => handleDismiss(cardIndex)}
                            />
                        );
                    }).reverse()
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No more cards!</Text>
                        <Button title="Reset Deck" onPress={handleReset} />
                    </View>
                )
                }
            </View>
        </View>
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
