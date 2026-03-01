import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme] = useState('dark');
    const [accentColor, setAccentColor] = useState(() => {
        return Cookies.get('app-accent') || '#1d4ed8'; // Default to blue hex
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Handle Theme (Fixed to dark)
        root.classList.remove('light', 'dark');
        root.classList.add('dark');

        // Handle Dynamic Accent Injection
        // We inject the hex color directly into the CSS variable
        root.style.setProperty('--accent-primary', accentColor);

        // Derive hover color (lighter version) - using CSS color-mix for simplicity in modern browsers
        // Or we can just set it to the same or calculate. 
        // For now, let's just let CSS handle the hover blending where possible or set a complementary var
        root.style.setProperty('--accent-primary-hover', `${accentColor}cc`); // 80% opacity for hover feel

        // Handle Glow (using hex)
        root.style.setProperty('--accent-glow', `${accentColor}80`); // 50% opacity

        Cookies.set('app-accent', accentColor, { expires: 365 });
    }, [accentColor]);

    const toggleTheme = () => {
        // Disabled
    };

    const changeAccent = (color) => {
        setAccentColor(color);
    };

    return (
        <ThemeContext.Provider value={{ theme: 'dark', toggleTheme, accentColor, changeAccent }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
