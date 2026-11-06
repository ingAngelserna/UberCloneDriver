
import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PersonalDataScreen from '../screens/PersonalDataScreen';
import VehicleScreen from '../screens/VehicleScreen';
import { View, Text } from 'react-native';
import { LanguageContext } from '../context/LanguageContext';

const DocumentsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Pestaña de Documentos</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { t } = useContext(LanguageContext);

  return (
    <Tab.Navigator>
      <Tab.Screen name="Datos" component={PersonalDataScreen} options={{ tabBarLabel: t('tab1'), title: t('tab1') }} />
      <Tab.Screen name="Vehículo" component={VehicleScreen} options={{ tabBarLabel: t('tab2'), title: t('tab2') }} />
      <Tab.Screen name="Documentos" component={DocumentsScreen} options={{ tabBarLabel: t('tab3'), title: t('tab3') }} />
    </Tab.Navigator>
  );
}