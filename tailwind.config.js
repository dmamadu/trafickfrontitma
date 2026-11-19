/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,scss}"
  ],
  theme: {
    extend: {
      colors: {
        customBlue: '#082D8C',
        // Charte INVODIS (voir src/styles/invodis-ui.scss) : bg-inv-primary, text-inv-secondary…
        inv: {
          primary: '#245363',
          'primary-700': '#1b404c',
          'primary-50': '#eef4f6',
          secondary: '#D45C00',
          'secondary-700': '#a84900',
          'secondary-50': '#fdf3eb',
          project: 'var(--inv-project)',
        },
        // Ajoutez d'autres couleurs personnalisées ici si nécessaire
      },
    },
  },
  plugins: [],
}




