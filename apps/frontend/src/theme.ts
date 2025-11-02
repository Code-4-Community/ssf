import { createSystem, defaultConfig, defineConfig, defineTextStyles } from '@chakra-ui/react';

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
      fontWeight: '400'
    },
  },
  h2: {
    value: {
      fontFamily: 'ibm',
      fontSize: '28px',
    },
  },
  h3: {
    value: {
      fontFamily: 'ibm',
      fontSize: '24px',
    },
  },
  h4: {
    value: {
      fontFamily: 'inter',
      fontSize: '20px',
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
          100: { value: '#bee3f8' },
        },
        red: { value: '#CC3538' },
        yellow: { value: '#F89E19' },
        cyan: { value: '#2795A5' },
        neutral: {
          50: { value: '#FAFAFA' },
          100: { value: '#E7E7E7' },
          200: { value: '#CFCFCF' },
          600: { value: '#707070' },
          700: { value: '#585858' },
          800: { value: '#414141' },
          900: { value: '#212529' },
        },
        gray: { value: '#515151' },
        teal: {
          400: { value: '#A9D5DB' },
          100: { value: '#E9F4F6' },
        }
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
    'body': {
      bg: '#FAFAFA',
    },
  },
});

export const system = createSystem(defaultConfig, customConfig); 