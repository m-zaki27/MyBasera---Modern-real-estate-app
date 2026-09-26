// Design tokens: the single source of truth for colors.
// Plain CommonJS so tailwind.config.js can require it; app code imports it via
// `@/constants/colors` when a raw value is needed (e.g. tintColor, placeholderTextColor).
// In className, prefer the Tailwind names: `bg-primary`, `text-muted dark:text-muted-dark`, etc.

const colors = {
  primary: {
    50: '#EBF2FF',
    100: '#D6E4FF',
    200: '#ADC9FF',
    300: '#7AA8FF',
    400: '#3D82FF',
    500: '#0061FF',
    600: '#0052D9',
    700: '#0043B3',
    800: '#00358C',
    900: '#002766',
    DEFAULT: '#0061FF',
  },
  // Semantic surface/text tokens. `DEFAULT` is light mode; pair with `dark:*-dark`.
  background: { DEFAULT: '#FFFFFF', dark: '#0A0A0A' },
  surface: { DEFAULT: '#F5F7FA', dark: '#171717' },
  border: { DEFAULT: '#E5E7EB', dark: '#2A2A2A' },
  foreground: { DEFAULT: '#0A0A0A', dark: '#FAFAFA' },
  muted: { DEFAULT: '#6B7280', dark: '#A3A3A3' },
  danger: { DEFAULT: '#E5484D', soft: '#FDECEC', 'soft-dark': '#3B1214', text: '#B42318', 'text-dark': '#FCA5A5' },
  success: { DEFAULT: '#16A34A' },
  rating: { DEFAULT: '#F5A524' },
  white: '#FFFFFF',
  black: '#000000',
};

module.exports = { colors };
