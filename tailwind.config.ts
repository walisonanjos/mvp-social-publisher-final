import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Mudança para uma forma mais abrangente
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;