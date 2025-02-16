const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontSize: {
        xs: ["0.79rem", "0.95rem"],
        sm: ["0.89rem", "1rem"],
        base: "0.93rem",
        xl: "1rem",
        "2xl": "1.163rem",
        "3xl": "1.253rem",
        "4xl": "1.41rem",
        "5xl": "1.652rem",
      },
      colors: {
        "blue-gray": {
          50: "#f0f3f4",
        },
      },
      fontWeight: {
        semibold: "800",
        medium: "600",
      },
      button: {
        defaultProps: {
          variant: "filled",
          size: "md",
          color: "blue",
          fullWidth: false,
          ripple: true,
        },
      },
    },
    fontFamily: {
      inter: ["Inter", "sans-serif"],
      sans: ["Inter", "sans-serif"],
      serif: ["Inter", "sans-serif"],
    },
  },
  plugins: [],
});
