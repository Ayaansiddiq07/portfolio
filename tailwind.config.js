/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./js/**/*.js"
    ],
    theme: {
        extend: {
            fontFamily: {
                mono: ['Space Mono', 'monospace'],
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
