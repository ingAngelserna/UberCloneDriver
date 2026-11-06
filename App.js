
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './src/navigation/TabNavigator';
import { RegistrationProvider } from './src/context/RegistrationContext';
import { LanguageProvider } from './src/context/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <RegistrationProvider>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </RegistrationProvider>
    </LanguageProvider>
  );
}