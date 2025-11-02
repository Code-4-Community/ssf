import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const customConfig = defineConfig({
  theme: {
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
          800: { value: '#414141' },
          700: { value: '#585858' },
          600: { value: '#707070' },
          200: { value: '#CFCFCF' },
          100: { value: '#E7E7E7' },
          50: { value: '#FAFAFA' },
        },
        gray: { value: '#515151' },
        teal: {
          400: { value: '#A9D5DB' },
          100: { value: '#E9F4F6' },
        }
      },
      fonts: {
        heading: { value: `'Instrument Serif', serif` },
        body: { value: `'Inter', sans-serif` },
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