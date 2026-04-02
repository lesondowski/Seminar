/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Backgrounds */
        'primary-bg': '#FFFFFF',
        'secondary-bg': '#F5F5F5',
        'tertiary-bg': '#EAEAEA',
        
        /* Text Colors */
        'primary-text': '#212121',
        'secondary-text': '#757575',
        'header-text': '#000000',
        
        /* Buttons */
        'primary-btn': '#333333',
        'primary-btn-hover': '#444444',
        'secondary-btn': '#FFFFFF',
        
        /* Borders */
        'primary-border': '#DDDDDD',
        'border-hover': '#212121',
        
        /* Links */
        'primary-link': '#212121',
        'link-hover': '#333333',
        
        /* Status Colors */
        'success': '#28A745',
        'warning': '#FFC107',
        'error': '#DC3545',
        
        /* Inputs */
        'input-bg': '#FFFFFF',
        'input-border': '#DDDDDD',
        'input-text': '#212121',
        'input-placeholder': '#757575',
      },
      backgroundColor: {
        'primary-bg': '#FFFFFF',
        'secondary-bg': '#F5F5F5',
        'tertiary-bg': '#EAEAEA',
      },
      textColor: {
        'primary-text': '#212121',
        'secondary-text': '#757575',
        'header-text': '#000000',
      },
      borderColor: {
        'primary-border': '#DDDDDD',
        'border-hover': '#212121',
      },
    },
  },
  plugins: [],
}