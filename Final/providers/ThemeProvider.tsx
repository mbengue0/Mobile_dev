import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeColors {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    danger: string;
    success: string;
}

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    colors: ThemeColors;
    isDarkMode: boolean;
}

const LightColors: ThemeColors = {
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    border: '#eeeeee',
    primary: '#007AFF', // Standard Blue
    danger: '#FF3B30',
    success: '#34C759'
};

const DarkColors: ThemeColors = {
    background: '#132439', // Navy Blue
    card: '#1e3a5f', // Lighter Navy
    text: '#ffffff',
    textSecondary: '#aab8c2',
    border: '#2c3e50',
    primary: '#40C4FF', // Vibrant Teal / Sky Blue (Modern Tech Look)
    danger: '#FF453A',
    success: '#30D158'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useColorScheme();
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('user_theme');
            if (savedTheme) {
                setTheme(savedTheme as Theme);
            } else if (systemScheme) {
                // Default to system, but ideally we want manual control for this app
                // setTheme(systemScheme); 
                setTheme('light'); // Default to light
            }
        } catch (error) {
            console.error('Failed to load theme:', error);
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        try {
            await AsyncStorage.setItem('user_theme', newTheme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    const colors = theme === 'light' ? LightColors : DarkColors;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, colors, isDarkMode: theme === 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
