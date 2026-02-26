import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineTextStyles,
} from '@chakra-ui/react';

const textStyles = defineTextStyles({
  body: {
    value: {
      color: 'neutral.900',
    },
  },
  h1: {
    value: {
      fontFamily: 'instrument',
      fontSize: '32px',
      fontWeight: '400',
    },
  },
  h2: {
    value: {
      fontFamily: 'ibm',
      fontSize: '28px',
      fontWeight: '600',
    },
  },
  h3: {
    value: {
      fontFamily: 'ibm',
      fontSize: '24px',
      fontWeight: '600',
    },
  },
  h4: {
    value: {
      fontFamily: 'inter',
      fontSize: '20px',
      fontWeight: '400',
    },
  },
  p: {
    value: {
      fontFamily: 'inter',
      fontSize: '16px',
      fontWeight: '500',
    },
  },
  p2: {
    value: {
      fontFamily: 'inter',
      fontSize: '14px',
      fontWeight: '400',
    },
  },
});

const customConfig = defineConfig({
  theme: {
    textStyles,
    tokens: {
      colors: {
        white: { value: '#fff' },
        black: { value: '#000' },
        blue: {
          ssf: { value: '#2B5061' },
          core: { value: '#2B4E60' },
          hover: { value: '#213C4A' },
          100: { value: '#bee3f8' },
          200: { value: '#D5DCDF' },
        },
        red: { value: '#CC3538' },
        yellow: {
          ssf: { value: '#F89E19' },
          hover: { value: '#9C5D00' },
          200: { value: '#FEECD1' },
        },
        cyan: { value: '#2795A5' },
        neutral: {
          50: { value: '#FAFAFA' },
          100: { value: '#E7E7E7' },
          200: { value: '#CFCFCF' },
          300: { value: '#B8B8B8' },
          500: { value: '#888' },
          600: { value: '#707070' },
          700: { value: '#585858' },
          800: { value: '#414141' },
          900: { value: '#212529' },
        },
        gray: {
          light: { value: '#515151' },
          dark: { value: '#111' },
        },
        teal: {
          100: { value: '#E9F4F6' },
          200: { value: '#D4EAED' },
          400: { value: '#A9D5DB' },
          hover: { value: '#19717D' },
        },
      },
      fonts: {
        instrument: { value: `'Instrument Serif', serif` },
        ibm: { value: `'IBM Plex Sans', sans-serif` },
        inter: { value: `'Inter', sans-serif` },
      },
    },
  },
  globalCss: {
    'html, body': {
      fontFamily: 'body',
    },
    'h1, h2, h3, h4, h5, h6': {
      fontFamily: 'heading',
    },
    body: {
      bg: '#FFF',
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
