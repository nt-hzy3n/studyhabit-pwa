import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studyhabit.survey',
  appName: 'StudyHabit',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    Camera: {
      presentationStyle: 'fullscreen',
    },
    Network: {},
  },
};

export default config;
