import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Card = ({ index }: { index: number }) => {
    return (
        <View style={[styles.card, { backgroundColor: index % 2 === 0 ? '#FE4775' : '#757575' }]}>
            <Text style={styles.text}>Card {index + 1}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: 300,
        height: 400,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    text: {
        fontSize: 32,
        color: 'white',
        fontWeight: 'bold',
    },
});

export default Card;
