
import React, { createContext, useState } from 'react';

export const RegistrationContext = createContext();

export const RegistrationProvider = ({ children }) => {
  const [personalValidData, setPersonalValidData] = useState(null);
  const [vehicleValidData, setVehicleValidData] = useState(null);
  const [documentsValidData, setDocumentsValidData] = useState(null);

  return (
    <RegistrationContext.Provider value={{
      personalValidData, setPersonalValidData,
      vehicleValidData, setVehicleValidData,
      documentsValidData, setDocumentsValidData
    }}>
      {children}
    </RegistrationContext.Provider>
  );
};