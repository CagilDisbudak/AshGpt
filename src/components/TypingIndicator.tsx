import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const TypingIndicator = () => {
    const { colors } = useTheme();
    const dot1 = useRef(new Animated.Value(0.3)).current;
    const dot2 = useRef(new Animated.Value(0.3)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animateDot = (anim: Animated.Value, delay: number) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 0.3,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ])
            );

        const a1 = animateDot(dot1, 0);
        const a2 = animateDot(dot2, 150);
        const a3 = animateDot(dot3, 300);

        a1.start();
        a2.start();
        a3.start();

        return () => {
            a1.stop();
            a2.stop();
            a3.stop();
        };
    }, [dot1, dot2, dot3]);

    return (
        <View style={[styles.container, styles.assistantContainer]}>
            <View
                style={[
                    styles.bubble,
                    {
                        backgroundColor: colors.assistantBubble,
                        borderBottomLeftRadius: 4,
                    },
                ]}
            >
                <View style={styles.dotsRow}>
                    <Animated.Text style={[styles.dot, { color: colors.assistantBubbleText, opacity: dot1 }]}>.</Animated.Text>
                    <Animated.Text style={[styles.dot, { color: colors.assistantBubbleText, opacity: dot2 }]}>.</Animated.Text>
                    <Animated.Text style={[styles.dot, { color: colors.assistantBubbleText, opacity: dot3 }]}>.</Animated.Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 4,
        paddingHorizontal: 12,
        flexDirection: 'row',
    },
    assistantContainer: {
        justifyContent: 'flex-start',
    },
    bubble: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 20,
        minWidth: 52,
    },
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    dot: {
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 20,
    },
});

export default TypingIndicator;
