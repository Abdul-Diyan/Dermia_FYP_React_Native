import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

interface AuthHeaderProps {
    title: string;
    subtitle: string;
}

export const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => (
    <LinearGradient
        colors={["#57A6FF", "#006BE6"]}
        style={styles.header}
    >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
    </LinearGradient>
);

const styles = StyleSheet.create({
    header: {
        height: 395,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        paddingTop: 40,
    },
    title: {
        fontSize: 48,

        fontFamily: 'Inter-Bold',
        color: '#FFFFFF',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        fontFamily: 'Inter-Regular',
        color: '#FFFFFF',
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 24,
    },
});