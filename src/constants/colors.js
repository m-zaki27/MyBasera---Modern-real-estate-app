// Design tokens: the single source of truth for colors.
// Plain CommonJS so tailwind.config.js can require it; app code imports it via
// `@/constants/colors` when a raw value is needed (e.g. tintColor, placeholderTextColor).
// In className, prefer the Tailwind names: `bg-primary`, `text-muted dark:text-muted-dark`, etc.
//
// Brand colors come from the MyBasera logo: a coral sunset over deep teal hills.
// - primary (coral): buttons, links, prices. DEFAULT keeps white text at ≥4.5:1 (WCAG AA).
//   As *text* on dark backgrounds use `dark:text-primary-300` — the DEFAULT is too dim there.
// - teal: hero gradients and deep brand surfaces (not for text in dark mode).

const colors = {
  primary: {
    50: '#FDF0EC',
    100: '#FADCD3',
    200: '#F5B8A6',
    300: '#EF8F75',
    400: '#E66A4C',
    500: '#C2472B',
    600: '#A63B22',
    700: '#86301C',
    800: '#662516',
    900: '#45190F',
    DEFAULT: '#C2472B',
  },
  teal: {
    50: '#E8F2F4',
    100: '#CFE3E7',
    300: '#6FA5AF',
    500: '#1F5D69',
    700: '#164751',
    900: '#0F3A42',
    DEFAULT: '#12404A',
  },
  /** The logo's sunset coral, for gradients only (white text on it is below AA). */
  sunset: { DEFAULT: '#E2664A' },
  // Semantic surface/text tokens. `DEFAULT` is light mode; pair with `dark:*-dark`.
  background: { DEFAULT: '#FFFFFF', dark: '#0A0A0A' },
  surface: { DEFAULT: '#F6F4F2', dark: '#171717' },
  border: { DEFAULT: '#E7E3DF', dark: '#2A2A2A' },
  foreground: { DEFAULT: '#14171A', dark: '#FAFAFA' },
  muted: { DEFAULT: '#6B7075', dark: '#A3A3A3' },
  danger: { DEFAULT: '#E5484D', soft: '#FDECEC', 'soft-dark': '#3B1214', text: '#B42318', 'text-dark': '#FCA5A5' },
  success: { DEFAULT: '#16A34A' },
  rating: { DEFAULT: '#F5A524' },
  white: '#FFFFFF',
  black: '#000000',
};

module.exports = { colors };
