/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'lexend': ['Lexend', 'sans-serif'],
            },
            colors: {
                'primary': '#136dec',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
            animation: {
                fadeIn: 'fadeIn 0.2s ease-out',
                slideIn: 'slideIn 0.3s ease-out',
            },
        },
    },
    plugins: [],
}
