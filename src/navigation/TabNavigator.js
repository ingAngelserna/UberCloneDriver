import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PersonalDataScreen from '../screens/PersonalDataScreen';
import VehicleScreen from '../screens/VehicleScreen';
import DocumentsScreen from '../screens/DocumentsScreen'; // <- Aquí importamos la pantalla de documentos real
import { LanguageContext } from '../context/LanguageContext';

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