// AI-assisted: see docs/AI_LOG.md #17
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

/**
 * Función auxiliar para limpiar objetos antes de enviarlos a Firestore.
 * Convierte cualquier valor 'undefined' en 'null' de forma recursiva.
 */
const cleanDataForFirestore = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj === undefined ? null : obj;
  }
  
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  const cleanedObj = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      cleanedObj[key] = value === undefined ? null : cleanDataForFirestore(value);
    }
  }
  
  return cleanedObj;
};

export const addDriver = async (driverData) => {
  try {
    // Validar que exista el documento de identidad para usarlo como ID
    const docId = driverData?.personalData?.idDoc;
    
    if (!docId) {
      throw new Error("No se proporcionó un documento de identidad válido para el registro.");
    }

    // Limpiar los datos para evitar el error "Unsupported field value: undefined"
    const safeData = cleanDataForFirestore(driverData);

    // Preparar el documento final agregando estado y fechas de servidor
    const driverRecord = {
      ...safeData,
      status: 'Pendiente de aprobación',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Referencia al documento en la colección 'Conductores' usando la cédula como ID
    const driverRef = doc(db, 'Conductores', docId);

    // Guardar en Firestore
    await setDoc(driverRef, driverRecord);
    
    return true;
  } catch (error) {
    console.error("Error en addDriver: ", error);
    throw error;
  }
};