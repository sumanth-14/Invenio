/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                invenio: {
                    teal: '#014D4E', // Updated Dark Teal Green
                    hover: '#013a3b', // Slightly darker for hover
                }
            }
        },
    },
    plugins: [],
}
