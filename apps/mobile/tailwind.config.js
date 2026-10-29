/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx}", "./src/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DMSans_400Regular"],
        "sans-medium": ["DMSans_500Medium"],
        "sans-bold": ["DMSans_700Bold"],
        "sans-semi-bold": ["DMSans_600SemiBold"],
        display: ["BricolageGrotesque_800ExtraBold"],
      },
      colors: {
        primary: "#1f73bd",
        navy: "#103b60",
        ink: "#0f2233",
        muted: "#4a5b6b",
        line: "#c9d6e2",
        stage: "#e7f0f8",
        success: "#2a7230",
        secondary: "#4A5B6B"
      },
    },
  },
  plugins: [],
};
