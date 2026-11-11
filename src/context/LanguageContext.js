import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LanguageContext = createContext();

const translations = {
  es: {
    // Generales & Header
    appName: 'Uber Conductor',
    langEs: 'ES',
    langEn: 'EN',
    cancel: 'Cancelar',
    done: 'Listo',
    selectDate: 'Seleccionar fecha',
    photoUploaded: '✓ Cargada',
    completeThreeTabs: 'Completa las 3 pestañas para enviar',
    submitRegistration: 'Enviar registro →',
    permissionTitle: 'Permiso denegado',
    permissionMsg: 'Se requiere acceso a la galería.',
    regSuccessTitle: 'Solicitud enviada',
    regSuccessBody: 'Tus documentos han sido registrados en la nube. Tu cuenta se encuentra en estado Pendiente de aprobación.',

    // Pestaña 1: Personal
    personalTitle: 'Información personal',
    personalSubtitle: 'Ingresa tus datos oficiales tal como figuran en tu documento de identidad.',
    addPhoto: 'Añadir',
    profilePhotoTitle: 'Foto de perfil',
    profilePhotoHint: 'Rostro descubierto, fondo claro y buena iluminación.',
    idDocLabel: 'Número de documento de identidad',
    idDocPlaceholder: 'Cédula de ciudadanía o extranjería',
    fullNameLabel: 'Nombre completo',
    fullNamePlaceholder: 'Nombres y apellidos',
    phoneLabel: 'Teléfono celular',
    phonePlaceholder: 'Ej: 3001234567',
    dobLabel: 'Fecha de nacimiento',
    dobSelectPlaceholder: 'Seleccionar fecha (Mínimo 18 años)',
    dobModalTitle: 'Fecha de nacimiento',
    genderLabel: 'Género',
    genderM: 'Masculino',
    genderF: 'Femenino',
    genderO: 'Otro',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'correo@ejemplo.com',

    // Errores Pestaña 1
    errIdRequired: 'El documento de identidad es obligatorio',
    errIdLength: 'Debe contener entre 6 y 10 dígitos numéricos',
    errNameRequired: 'Ingrese su nombre y apellido completo',
    errPhoneInvalid: 'Ingrese un número celular válido (10 dígitos)',
    errDobRequired: 'La fecha de nacimiento es obligatoria',
    errUnderage: 'Debes tener al menos 18 años para conducir en la plataforma',
    errEmailInvalid: 'Correo electrónico inválido',
    errPhotoRequired: 'La fotografía de perfil es obligatoria',

    // Pestaña 2: Vehículo
    vehicleTitle: 'Detalles del vehículo',
    vehicleSubtitle: 'Configura el automóvil con el que prestarás servicio en la plataforma.',
    serviceCategory: 'Categoría del servicio',
    catDescX: 'Estándar 4 puestos',
    catDescComfort: 'Modelos recientes',
    catDescXL: 'SUV hasta 6 puestos',
    plateLabel: 'Número de placa',
    brandLabel: 'Marca',
    modelLabel: 'Línea / Modelo',
    yearLabel: 'Año de fabricación',
    colorLabel: 'Color',
    passengersLabel: 'Capacidad de pasajeros',
    vPhotoLabel: 'Fotografía del vehículo',
    vehiclePhotoHint: 'Donde se aprecie la carrocería completa y la placa frontal visible.',
    uploadVehiclePhoto: 'Subir foto frontal/lateral',
    formatSupport: 'PNG o JPG (máximo 5 MB)',
    
    // Placeholders Vehículo
    placeholderPlate: 'Ej: ABC123',
    placeholderBrand: 'Ej: Chevrolet',
    placeholderModel: 'Ej: Spark',
    placeholderYear: 'Ej: 2018',
    placeholderColor: 'Ej: Blanco',
    placeholderPassengers: 'Ej: 4',
    
    // Botones de Siguiente
    btnNextDocs: 'Siguiente paso: Documentos →',
    btnCompleteData: 'Completa los datos para continuar',

    // Errores Pestaña 2
    errPlateRequired: 'La placa es obligatoria',
    errPlateFormat: 'Formato de placa inválido (Ej: ABC123 o ABC12D)',
    errRequired: 'Campo obligatorio',
    errYearLength: 'Ingrese un año de 4 dígitos',
    errYearRange: 'Año fuera del rango permitido',
    errCapacityRange: 'Capacidad permitida entre 1 y 15 pasajeros',
    errVPhotoRequired: 'Fotografía del vehículo obligatoria',
    errPassengersRequired: 'Ingrese la capacidad de pasajeros',
    errUberXLSeats: 'La categoría UberXL requiere mínimo 6 puestos',
    errUberXSeats: 'Se requiere un mínimo de 4 puestos',

    // Pestaña 3: Documentos
    docsTitle: 'Documentos requeridos',
    docsSubtitle: 'Sube fotos legibles de tus permisos vigentes para validar tu cuenta de socio conductor.',
    licTitle: 'Licencia de conducción',
    licDesc: 'Categoría habilitada para transporte',
    licNumLabel: 'Número de licencia',
    licNumPlaceholder: '10 dígitos numéricos',
    expirationDateLabel: 'Fecha de vencimiento',
    licPhotoLabel: 'Foto del documento',
    uploadFrontal: 'Subir foto frontal',
    soatTitle: 'Póliza SOAT',
    soatDesc: 'Seguro obligatorio contra accidentes',
    soatPhotoLabel: 'Foto de la póliza',
    uploadSoatProof: 'Subir comprobante SOAT',
    tecnoTitle: 'Revisión Técnico-Mecánica',
    tecnoRequiredDesc: 'Obligatorio para autos de 5+ años',
    tecnoExemptDesc: 'Exento por modelo reciente',
    tecnoPhotoLabel: 'Certificado CDA',
    uploadCda: 'Subir certificado',
    tecnoExemptBanner: 'Tu vehículo no requiere revisión técnico-mecánica vigente por antigüedad menor a 5 años.',
    mpAccountTitle: 'Cuenta de transferencias',
    mpAccountDesc: 'Para la dispersión semanal de ganancias netas',
    mpEmailLabel: 'Correo de Mercado Pago',
    termsTextPrefix: 'Acepto las políticas de la plataforma y el esquema del ',
    termsCommission: '20% de comisión',
    termsTextSuffix: ' por cada servicio completado.',

    // Errores Pestaña 3
    errLicNumRequired: 'El número de licencia es obligatorio',
    errLicNumLength: 'Debe contener exactamente 10 dígitos numéricos',
    errFutureDate: 'La fecha de vencimiento debe ser posterior al día de hoy',
    errDocPhotoRequired: 'Debe adjuntar la fotografía del documento',
    errTermsRequired: 'Debe aceptar los términos de la plataforma y el porcentaje de comisión'
  },
  en: {
    // General & Header
    appName: 'Uber Driver',
    langEs: 'ES',
    langEn: 'EN',
    cancel: 'Cancel',
    done: 'Done',
    selectDate: 'Select date',
    photoUploaded: '✓ Uploaded',
    completeThreeTabs: 'Complete all 3 tabs to submit',
    submitRegistration: 'Submit registration →',
    permissionTitle: 'Permission denied',
    permissionMsg: 'Media library access is required.',
    regSuccessTitle: 'Application submitted',
    regSuccessBody: 'Your documents have been stored in the cloud. Your account is currently Pending Approval.',

    // Tab 1: Personal
    personalTitle: 'Personal Information',
    personalSubtitle: 'Enter your official information as shown on your government ID.',
    addPhoto: 'Add',
    profilePhotoTitle: 'Profile Photo',
    profilePhotoHint: 'Clear face, neutral background, and good lighting.',
    idDocLabel: 'National Identity Number',
    idDocPlaceholder: 'National ID or Passport number',
    fullNameLabel: 'Full Legal Name',
    fullNamePlaceholder: 'First and last name',
    phoneLabel: 'Mobile Phone',
    phonePlaceholder: 'E.g., 3001234567',
    dobLabel: 'Date of Birth',
    dobSelectPlaceholder: 'Select date (Minimum 18 years old)',
    dobModalTitle: 'Date of Birth',
    genderLabel: 'Gender',
    genderM: 'Male',
    genderF: 'Female',
    genderO: 'Other',
    emailLabel: 'Email Address',
    emailPlaceholder: 'driver@example.com',

    // Errors Tab 1
    errIdRequired: 'Identity document is required',
    errIdLength: 'Must contain between 6 and 10 numeric digits',
    errNameRequired: 'Enter your full legal name',
    errPhoneInvalid: 'Enter a valid 10-digit mobile number',
    errDobRequired: 'Date of birth is required',
    errUnderage: 'You must be at least 18 years old to drive on the platform',
    errEmailInvalid: 'Invalid email address',
    errPhotoRequired: 'Profile photo is required',

    // Tab 2: Vehicle
    vehicleTitle: 'Vehicle Details',
    vehicleSubtitle: 'Configure the vehicle you will use to provide transportation services.',
    serviceCategory: 'Service Tier',
    catDescX: 'Standard 4 seats',
    catDescComfort: 'Newer models',
    catDescXL: 'SUV up to 6 seats',
    plateLabel: 'License Plate',
    brandLabel: 'Make / Brand',
    modelLabel: 'Model / Line',
    yearLabel: 'Manufacturing Year',
    colorLabel: 'Color',
    passengersLabel: 'Passenger Capacity',
    vPhotoLabel: 'Vehicle Photograph',
    vehiclePhotoHint: 'Full exterior view showing the front license plate clearly.',
    uploadVehiclePhoto: 'Upload front/side photo',
    formatSupport: 'PNG or JPG (5 MB maximum)',
    
    // Placeholders Vehicle
    placeholderPlate: 'Ex: ABC123',
    placeholderBrand: 'Ex: Chevrolet',
    placeholderModel: 'Ex: Spark',
    placeholderYear: 'Ex: 2018',
    placeholderColor: 'Ex: White',
    placeholderPassengers: 'Ex: 4',
    
    // Next Buttons
    btnNextDocs: 'Next step: Documents →',
    btnCompleteData: 'Complete the data to continue',

    // Errors Tab 2
    errPlateRequired: 'License plate is required',
    errPlateFormat: 'Invalid plate format (E.g., ABC123 or ABC12D)',
    errRequired: 'Required field',
    errYearLength: 'Enter a 4-digit year',
    errYearRange: 'Year out of allowed range',
    errCapacityRange: 'Allowed capacity between 1 and 15 passengers',
    errVPhotoRequired: 'Vehicle photo is required',
    errPassengersRequired: 'Enter passenger capacity',
    errUberXLSeats: 'UberXL requires at least 6 seats',
    errUberXSeats: 'A minimum of 4 seats is required',

    // Tab 3: Documents
    docsTitle: 'Required Documents',
    docsSubtitle: 'Upload clear pictures of your active permits to verify your driver account.',
    licTitle: 'Driver License',
    licDesc: 'Authorized category for passenger transport',
    licNumLabel: 'Driver License Number',
    licNumPlaceholder: '10 numeric digits',
    expirationDateLabel: 'Expiration Date',
    licPhotoLabel: 'Document Photo',
    uploadFrontal: 'Upload front photo',
    soatTitle: 'SOAT Mandatory Insurance',
    soatDesc: 'Compulsory traffic accident insurance policy',
    soatPhotoLabel: 'Insurance Policy Photo',
    uploadSoatProof: 'Upload SOAT voucher',
    tecnoTitle: 'Mechanical Inspection Certificate',
    tecnoRequiredDesc: 'Mandatory for vehicles 5+ years old',
    tecnoExemptDesc: 'Exempt due to recent vehicle model',
    tecnoPhotoLabel: 'CDA Certificate',
    uploadCda: 'Upload certificate',
    tecnoExemptBanner: 'Your vehicle does not require mechanical inspection due to being newer than 5 years.',
    mpAccountTitle: 'Payout Account',
    mpAccountDesc: 'For weekly distribution of net earnings',
    mpEmailLabel: 'Mercado Pago Account Email',
    termsTextPrefix: 'I accept the platform policies and the ',
    termsCommission: '20% platform commission',
    termsTextSuffix: ' deduction scheme per completed trip.',

    // Errors Tab 3
    errLicNumRequired: 'Driver license number is required',
    errLicNumLength: 'Must contain exactly 10 numeric digits',
    errFutureDate: 'Expiration date must be strictly after today',
    errDocPhotoRequired: 'Document photograph is required',
    errTermsRequired: 'You must accept the platform terms and commission fee'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('es');

  useEffect(() => {
    AsyncStorage.getItem('@user_language').then((savedLang) => {
      if (savedLang) setLanguage(savedLang);
    });
  }, []);

  const changeLanguage = async (newLang) => {
    setLanguage(newLang);
    await AsyncStorage.setItem('@user_language', newLang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['es']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};