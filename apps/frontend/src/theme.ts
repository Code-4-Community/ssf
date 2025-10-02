import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        white: { value: '#fff' },
        black: { value: '#000' },
        blue: { value: '#2B5061' },
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
  },
});

export const system = createSystem(defaultConfig, customConfig);