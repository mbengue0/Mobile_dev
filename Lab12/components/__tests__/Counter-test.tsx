import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Counter from '../Counter';

describe('Counter Component', () => {
    it('renders correctly with initial count of 0', () => {
        const { getByTestId } = render(<Counter />);
        const countText = getByTestId('count-text');
        expect(countText.props.children).toBe(0);
    });

    it('increments count when increment button is pressed', () => {
        const { getByTestId } = render(<Counter />);
        const incrementButton = getByTestId('increment-button');
        const countText = getByTestId('count-text');

        fireEvent.press(incrementButton);
        expect(countText.props.children).toBe(1);
    });

    it('decrements count when decrement button is pressed', () => {
        const { getByTestId } = render(<Counter />);
        const decrementButton = getByTestId('decrement-button');
        const countText = getByTestId('count-text');

        // Initial is 0, decrement should make it -1
        fireEvent.press(decrementButton);
        expect(countText.props.children).toBe(-1);
    });
});
