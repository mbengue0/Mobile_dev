import React, { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import Card from './Card';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface DraggableCardProps {
    index: number;
    onDismiss: () => void;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ index, onDismiss }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);

    // Reset position when index changes (card recycling)
    useEffect(() => {
        translateX.value = 0;
        translateY.value = 0;
        scale.value = 1;
    }, [index]);

    const pan = Gesture.Pan()
        .onChange((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;
        })
        .onFinalize(() => {
            // If dragged far enough, dismiss
            if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
                const direction = translateX.value > 0 ? 1 : -1;
                translateX.value = withTiming(direction * SCREEN_WIDTH * 1.5, {}, () => {
                    runOnJS(onDismiss)();
                });
            } else {
                // Spring back
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            }
        });

    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
        });

    const composed = Gesture.Race(doubleTap, pan);

    const rStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            translateX.value,
            [-SCREEN_WIDTH / 2, SCREEN_WIDTH / 2],
            [-15, 15],
            Extrapolation.CLAMP
        );

        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotate: `${rotate}deg` },
                { scale: scale.value }
            ],
            zIndex: -index, // Stack visually
        };
    });

    return (
        <GestureDetector gesture={composed}>
            <Animated.View style={[styles.container, rStyle]}>
                <Card index={index} />
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default DraggableCard;
