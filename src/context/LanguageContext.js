
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';
// AI-assisted: see docs/AI_LOG.md
export const LanguageContext = createContext();

const translations = {
  es: {
    tab1: 'Datos', tab2: 'Vehículo', tab3: 'Documentos',
    noPhoto: 'Sin Foto', cam: 'Cámara', gal: 'Galería',
    name: 'Nombre completo', doc: 'Documento de identidad', phone: 'Número de celular',
    dob: 'Seleccionar Fecha de Nacimiento', gender: 'Seleccione Género', m: 'Masculino', f: 'Femenino', o: 'Otro',
    email: 'Correo electrónico', lang: 'Seleccione Idioma', es: 'Español', en: 'Inglés',
    cat: 'Seleccione Categoría', eco: 'Económico', xl: 'XL', prem: 'Premium',
    plate: 'Placa (ABC123)', brand: 'Marca ', model: 'Modelo ', year: 'Año',
    color: 'Seleccione Color', white: 'Blanco', black: 'Negro', grey: 'Gris', silver: 'Plata', red: 'Rojo',
    cap: 'Capacidad de pasajeros', vPhoto: 'Subir Foto del Vehículo (Placa visible)'
  },
  en: {
    tab1: 'Data', tab2: 'Vehicle', tab3: 'Documents',
    noPhoto: 'No Photo', cam: 'Camera', gal: 'Gallery',
    name: 'Full Name', doc: 'Identity Document', phone: 'Phone Number',
    dob: 'Select Date of Birth', gender: 'Select Gender', m: 'Male', f: 'Female', o: 'Other',
    email: 'Email', lang: 'Select Language', es: 'Spanish', en: 'English',
    cat: 'Select Category', eco: 'Economy', xl: 'XL', prem: 'Premium',
    plate: 'Plate (ABC123)', brand: 'Brand ', model: 'Model ', year: 'Year',
    color: 'Select Color', white: 'White', black: 'Black', grey: 'Grey', silver: 'Silver', red: 'Red', 
    cap: 'Passenger Capacity', vPhoto: 'Upload Vehicle Photo (Plate visible)'
  }
};

export const LanguageProvider = ({ children }) => {
  const [appLang, setAppLang] = useState('es');

  useEffect(() => {
    const loadLang = async () => {
      const savedLang = await AsyncStorage.getItem('driverLang'); // Solo preferencias en AsyncStorage[cite: 3]
      if (savedLang) setAppLang(savedLang);
    };
    loadLang();
  }, []);

  const changeLanguage = async (newLang) => {
    if (!newLang) return;
    setAppLang(newLang);
    await AsyncStorage.setItem('driverLang', newLang);
  };

  const t = (key) => translations[appLang][key] || key;

  return (
    <LanguageContext.Provider value={{ appLang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};