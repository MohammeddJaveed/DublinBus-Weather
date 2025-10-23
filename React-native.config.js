module.exports = {
  dependencies: {
    'react-native-maps': {
      platforms: {
        android: null, // disable Android platform, other platforms will still autolink if provided
      },
    },
  },
  assets: ['./src/assets/fonts/'], // if you have custom fonts
};