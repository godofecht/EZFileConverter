/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./public/**/*.{html,js}'],
    theme: {
        extend: {},
    },
    plugins: [require('daisyui')],
    daisyui: {
        themes: [
            'light',
            'dark',
            'cupcake',
            {
                cyberpunk: {
                    primary: '#ff7598',
                    secondary: '#75d1f0',
                    accent: '#c07eec',
                    neutral: '#1a1a1a',
                    'base-100': '#000000',
                    'base-200': '#0d0d0d',
                    'base-300': '#1a1a1a',
                    info: '#75d1f0',
                    success: '#00ff9f',
                    warning: '#ff9f00',
                    error: '#ff2e2e',
                },
                forest: {
                    primary: '#2d4a22',
                    secondary: '#8b5e34',
                    accent: '#5c913b',
                    neutral: '#2c2c2c',
                    'base-100': '#ffffff',
                    'base-200': '#f7f7f7',
                    'base-300': '#e0e0e0',
                    info: '#4aa5ff',
                    success: '#3a8c3a',
                    warning: '#d4a72c',
                    error: '#d13030',
                },
                neon: {
                    primary: '#0fff0f',
                    secondary: '#f700ff',
                    accent: '#0ff0ff',
                    neutral: '#101010',
                    'base-100': '#000000',
                    'base-200': '#050505',
                    'base-300': '#101010',
                    info: '#0ff0ff',
                    success: '#0fff0f',
                    warning: '#ffff00',
                    error: '#ff0000',
                },
            },
        ],
    },
}; 