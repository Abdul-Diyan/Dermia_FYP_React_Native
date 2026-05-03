import React from 'react';
import { StyleSheet, View } from 'react-native';

export const AuthModal = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.modalContainer}>
        <View style={styles.card}>{children}</View>
    </View>
);

const styles = StyleSheet.create({
    modalContainer: {
        alignItems: 'center',
        marginTop: -120, // Overlaps the header as seen in your screenshot
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#FFFFFF',
        width: 352,
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,

    },
});