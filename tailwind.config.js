/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9dffd",
          300: "#7cc4fc",
          400: "#4a90e2",
          500: "#1976d2",
          600: "#1565c0",
          700: "#1a3a52",
          800: "#0d47a1",
          900: "#01579b",
        },
        secondary: {
          50: "#f3f8fa",
          100: "#e7f1f5",
          200: "#cfe3eb",
          300: "#a7cbd9",
          400: "#7bafc4",
          500: "#2c5f7c",
          600: "#1e4a61",
          700: "#19404f",
          800: "#153642",
          900: "#122d36",
        },
        accent: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#4a90e2",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
success: "#28a745",
        warning: "#ffc107", 
        error: "#dc3545",
        info: "#17a2b8",
        admin: {
          50: "#fef2f2",
          100: "#fee2e2", 
          500: "#ef4444",
          700: "#b91c1c",
          800: "#991b1b"
        },
        user: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1", 
          600: "#4f46e5",
          700: "#4338ca"
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}