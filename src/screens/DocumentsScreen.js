
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Image, Platform, Alert, ActivityIndicator,Modal,KeyboardAvoidingView} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Checkbox from 'expo-checkbox';
import { RegistrationContext } from '../context/RegistrationContext';
import { LanguageContext } from '../context/LanguageContext';
import { addDriver } from '../services/dbServices';
import LanguageSelector from '../components/LanguageSelector';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'mx6tjm8g';
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'uber_preset';

export default function DocumentsScreen() {
  const { personalValidData, vehicleValidData, documentsValidData, setDocumentsValidData } = useContext(RegistrationContext);
  const { t } = useContext(LanguageContext);
  
  const currentYear = new Date().getFullYear();
  const vehicleYear = vehicleValidData?.year ? parseInt(vehicleValidData.year, 10) : currentYear;
  const requiresTecno = (currentYear - vehicleYear) >= 5;

  const [form, setForm] = useState(documentsValidData || {
    licNum: '', 
    licDate: null, 
    licPhoto: null,
    soatDate: null, 
    soatPhoto: null,
    tecnoDate: null, 
    tecnoPhoto: null,
    mpEmail: '', 
    terms: false
  });

  const [errors, setErrors] = useState({});
  const [picker, setPicker] = useState({ type: null, show: false });
  const [tempDate, setTempDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [loading, setLoading] = useState(false);

  const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
  tomorrow.setHours(0, 0, 0, 0);
// AI-assisted: véase docs/AI_LOG.md #27
  useEffect(() => {
    if (documentsValidData) {
      setForm(documentsValidData);
    }
  }, [documentsValidData]);

  const validateField = (field, value) => {
    let processedValue = value;
    let newErrors = { ...errors };

    if (field === 'licNum') {
      processedValue = String(value).replace(/[^0-9]/g, '').slice(0, 10);
      if (!processedValue) {
        newErrors.licNum = t('errLicNumRequired') || 'El número de licencia es obligatorio';
      } else if (processedValue.length !== 10) {
        newErrors.licNum = t('errLicNumLength') || 'Debe contener exactamente 10 dígitos numéricos';
      } else {
        delete newErrors.licNum;
      }
    }

    if (['licDate', 'soatDate', 'tecnoDate'].includes(field)) {
      if (field === 'tecnoDate' && !requiresTecno) {
        delete newErrors.tecnoDate;
      } else if (!processedValue || processedValue <= tomorrow) {
        newErrors[field] = t('errFutureDate') || 'La fecha de vencimiento debe ser posterior al día de hoy';
      } else {
        delete newErrors[field];
      }
    }

    if (['licPhoto', 'soatPhoto', 'tecnoPhoto'].includes(field)) {
      if (field === 'tecnoPhoto' && !requiresTecno) {
        delete newErrors.tecnoPhoto;
      } else if (!processedValue) {
        newErrors[field] = t('errDocPhotoRequired') || 'Debe adjuntar la fotografía del documento';
      } else {
        delete newErrors[field];
      }
    }

    if (field === 'mpEmail') {
      if (!processedValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(processedValue)) {
        newErrors.mpEmail = t('errEmailInvalid') || 'Ingrese un correo electrónico válido';
      } else {
        delete newErrors.mpEmail;
      }
    }

    if (field === 'terms') {
      if (!processedValue) {
        newErrors.terms = t('errTermsRequired') || 'Debe aceptar los términos de la plataforma y el porcentaje de comisión';
      } else {
        delete newErrors.terms;
      }
    }

    const newForm = { ...form, [field]: processedValue };
    setForm(newForm);
    setErrors(newErrors);

    const isLicValid = newForm.licNum && newForm.licNum.length === 10 && newForm.licDate && newForm.licPhoto;
    const isSoatValid = newForm.soatDate && newForm.soatPhoto;
    const isTecnoValid = !requiresTecno || (newForm.tecnoDate && newForm.tecnoPhoto);
    const isMpValid = newForm.mpEmail && !newErrors.mpEmail;
    const isTermsValid = newForm.terms;

    if (Object.keys(newErrors).length === 0 && isLicValid && isSoatValid && isTecnoValid && isMpValid && isTermsValid) {
      setDocumentsValidData(newForm);
    } else {
      setDocumentsValidData(null);
    }
  };

  const pickImage = (field) => {
    Alert.alert(
      t('photoOptionsTitle') || 'Opciones de fotografía',
      t('photoOptionsMsg') || '¿Cómo deseas subir el documento?',
      [
        { 
          text: t('takePhoto') || 'Tomar foto', 
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              return Alert.alert(t('permissionTitle') || 'Permiso denegado', t('cameraPermissionMsg') || 'Se requiere acceso a la cámara.');
            }
            const result = await ImagePicker.launchCameraAsync({
              quality: 0.7 
            });
            if (!result.canceled && result.assets && result.assets[0]) {
              validateField(field, result.assets[0].uri);
            }
          } 
        },
        { 
          text: t('chooseGallery') || 'Elegir de la galería', 
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              return Alert.alert(t('permissionTitle') || 'Permiso denegado', t('permissionMsg') || 'Se requiere acceso a la galería.');
            }
            const result = await ImagePicker.launchImageLibraryAsync({ 
              mediaTypes: ImagePicker.MediaTypeOptions.Images, 
              quality: 0.7 
            });
            if (!result.canceled && result.assets && result.assets[0]) {
              validateField(field, result.assets[0].uri);
            }
          } 
        },
        { text: t('cancel') || 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const uploadToCloudinary = async (imageUri) => {
    if (!imageUri) return null;
    if (imageUri.startsWith('http')) return imageUri;

    const response = await fetch(imageUri);
    const blob = await response.blob();

    const data = new FormData();
    data.append('file', blob, 'documento.jpg');
    data.append('upload_preset', UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: data,
    });

    const file = await res.json();
    if (!file.secure_url) {
      throw new Error(file.error?.message || 'Error al procesar la imagen en Cloudinary');
    }
    return file.secure_url;
  };

  const openDatePicker = (field) => {
    const initialDate = form[field] ? new Date(form[field]) : tomorrow;
    setTempDate(initialDate);
    setPicker({ type: field, show: true });
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setPicker({ type: null, show: false });
      if (selectedDate && picker.type) validateField(picker.type, selectedDate);
    } else {
      if (selectedDate) setTempDate(selectedDate);
    }
  };

  const confirmIosDate = () => {
    if (picker.type) validateField(picker.type, tempDate);
    setPicker({ type: null, show: false });
  };

  const submitRegistration = async () => {
    setLoading(true);
    try {
      const uploadTasks = [
        uploadToCloudinary(form.licPhoto),
        uploadToCloudinary(form.soatPhoto)
      ];

      if (requiresTecno && form.tecnoPhoto) {
        uploadTasks.push(uploadToCloudinary(form.tecnoPhoto));
      } else {
        uploadTasks.push(Promise.resolve(null));
      }

      const [licUrl, soatUrl, tecnoUrl] = await Promise.all(uploadTasks);

      let profilePhotoUrl = personalValidData?.photo;
      if (profilePhotoUrl && !profilePhotoUrl.startsWith('http')) {
        profilePhotoUrl = await uploadToCloudinary(profilePhotoUrl);
      }

      let vehiclePhotoUrl = vehicleValidData?.vPhoto || vehicleValidData?.photo;
      if (vehiclePhotoUrl && !vehiclePhotoUrl.startsWith('http')) {
        vehiclePhotoUrl = await uploadToCloudinary(vehiclePhotoUrl);
      }

      const driverData = {
        personalData: {
          ...personalValidData,
          photo: profilePhotoUrl || null,
          dob: personalValidData?.dob instanceof Date ? personalValidData.dob.toISOString() : personalValidData?.dob
        },
        vehicleData: {
          ...vehicleValidData,
          vPhoto: vehiclePhotoUrl || null,
        },
        documentsData: {
          licNum: form.licNum,
          licDate: form.licDate ? (form.licDate instanceof Date ? form.licDate.toISOString() : form.licDate) : null,
          licPhoto: licUrl,
          soatDate: form.soatDate ? (form.soatDate instanceof Date ? form.soatDate.toISOString() : form.soatDate) : null,
          soatPhoto: soatUrl,
          tecnoDate: requiresTecno && form.tecnoDate ? (form.tecnoDate instanceof Date ? form.tecnoDate.toISOString() : form.tecnoDate) : null,
          tecnoPhoto: tecnoUrl,
          mpEmail: form.mpEmail,
          terms: form.terms
        }
      };

      await addDriver(driverData);
      Alert.alert(
        t('regSuccessTitle') || 'Solicitud enviada', 
        t('regSuccessBody') || 'Tus documentos han sido registrados en la nube. Tu cuenta se encuentra en estado Pendiente de aprobación.'
      );
    } catch (error) {
      console.error('Error durante el registro:', error);
      Alert.alert('Error', error.message || 'No fue posible completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  const isFormReady = personalValidData && vehicleValidData && documentsValidData;

  const formatDateDisplay = (dateVal) => {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    return d.toISOString().split('T')[0];
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#F6F6F6' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 85 : 0} 
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 140, flexGrow: 1 }} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true} 
      >
        <LanguageSelector />

        <View style={styles.headerBlock}>
          <Text style={styles.mainTitle}>{t('docsTitle') || 'Documentos requeridos'}</Text>
          <Text style={styles.subtitle}>{t('docsSubtitle') || 'Sube fotos legibles de tus permisos vigentes para validar tu cuenta de socio conductor.'}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}><Text style={styles.iconEmoji}>🪪</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{t('licTitle') || 'Licencia de conducción'}</Text>
              <Text style={styles.cardDesc}>{t('licDesc') || 'Categoría habilitada para transporte'}</Text>
            </View>
          </View>

          <Text style={styles.label}>{t('licNumLabel') || 'Número de licencia'}</Text>
          <TextInput 
            placeholder={t('licNumPlaceholder') || '10 dígitos numéricos'} 
            placeholderTextColor="#999" 
            style={[styles.input, errors.licNum && styles.inputError]} 
            value={form.licNum} 
            keyboardType="numeric"
            maxLength={10}
            onChangeText={(v) => validateField('licNum', v)} 
          />
          {errors.licNum && <Text style={styles.errorText}>{errors.licNum}</Text>}

          <Text style={styles.label}>{t('expirationDateLabel') || 'Fecha de vencimiento'}</Text>
          <TouchableOpacity onPress={() => openDatePicker('licDate')} style={[styles.dateSelector, errors.licDate && styles.inputError]}>
            <Text style={{ color: form.licDate ? '#000' : '#888', fontWeight: form.licDate ? '600' : 'normal' }}>
              {formatDateDisplay(form.licDate) || (t('selectDate') || 'Seleccionar fecha')}
            </Text>
            <Text style={styles.selectorArrow}>📅</Text>
          </TouchableOpacity>
          {errors.licDate && <Text style={styles.errorText}>{errors.licDate}</Text>}

          <Text style={styles.label}>{t('licPhotoLabel') || 'Foto del documento'}</Text>
          <TouchableOpacity onPress={() => pickImage('licPhoto')} style={[styles.uploadBox, form.licPhoto && styles.uploadBoxDone, errors.licPhoto && styles.inputError]}>
            {form.licPhoto ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: form.licPhoto }} style={styles.imagePreview} />
                <View style={styles.badgeSuccess}><Text style={styles.badgeSuccessText}>{t('photoUploaded') || '✓ Cargada'}</Text></View>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadIconText}>📷</Text>
                <Text style={styles.uploadText}>{t('uploadFrontal') || 'Subir foto frontal'}</Text>
              </View>
            )}
          </TouchableOpacity>
          {errors.licPhoto && <Text style={styles.errorText}>{errors.licPhoto}</Text>}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}><Text style={styles.iconEmoji}>🛡️</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{t('soatTitle') || 'Póliza SOAT'}</Text>
              <Text style={styles.cardDesc}>{t('soatDesc') || 'Seguro obligatorio contra accidentes'}</Text>
            </View>
          </View>

          <Text style={styles.label}>{t('expirationDateLabel') || 'Fecha de vencimiento'}</Text>
          <TouchableOpacity onPress={() => openDatePicker('soatDate')} style={[styles.dateSelector, errors.soatDate && styles.inputError]}>
            <Text style={{ color: form.soatDate ? '#000' : '#888', fontWeight: form.soatDate ? '600' : 'normal' }}>
              {formatDateDisplay(form.soatDate) || (t('selectDate') || 'Seleccionar fecha')}
            </Text>
            <Text style={styles.selectorArrow}>📅</Text>
          </TouchableOpacity>
          {errors.soatDate && <Text style={styles.errorText}>{errors.soatDate}</Text>}

          <Text style={styles.label}>{t('soatPhotoLabel') || 'Foto de la póliza'}</Text>
          <TouchableOpacity onPress={() => pickImage('soatPhoto')} style={[styles.uploadBox, form.soatPhoto && styles.uploadBoxDone, errors.soatPhoto && styles.inputError]}>
            {form.soatPhoto ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: form.soatPhoto }} style={styles.imagePreview} />
                <View style={styles.badgeSuccess}><Text style={styles.badgeSuccessText}>{t('photoUploaded') || '✓ Cargada'}</Text></View>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadIconText}>📷</Text>
                <Text style={styles.uploadText}>{t('uploadSoatProof') || 'Subir comprobante SOAT'}</Text>
              </View>
            )}
          </TouchableOpacity>
          {errors.soatPhoto && <Text style={styles.errorText}>{errors.soatPhoto}</Text>}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}><Text style={styles.iconEmoji}>🔧</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{t('tecnoTitle') || 'Revisión Técnico-Mecánica'}</Text>
              <Text style={styles.cardDesc}>
                {requiresTecno 
                  ? (t('tecnoRequiredDesc') || 'Obligatorio para autos de 5+ años') 
                  : (t('tecnoExemptDesc') || 'Exento por modelo reciente')}
              </Text>
            </View>
          </View>

          {requiresTecno ? (
            <>
              <Text style={styles.label}>{t('expirationDateLabel') || 'Fecha de vencimiento'}</Text>
              <TouchableOpacity onPress={() => openDatePicker('tecnoDate')} style={[styles.dateSelector, errors.tecnoDate && styles.inputError]}>
                <Text style={{ color: form.tecnoDate ? '#000' : '#888', fontWeight: form.tecnoDate ? '600' : 'normal' }}>
                  {formatDateDisplay(form.tecnoDate) || (t('selectDate') || 'Seleccionar fecha')}
                </Text>
                <Text style={styles.selectorArrow}>📅</Text>
              </TouchableOpacity>
              {errors.tecnoDate && <Text style={styles.errorText}>{errors.tecnoDate}</Text>}

              <Text style={styles.label}>{t('tecnoPhotoLabel') || 'Certificado CDA'}</Text>
              <TouchableOpacity onPress={() => pickImage('tecnoPhoto')} style={[styles.uploadBox, form.tecnoPhoto && styles.uploadBoxDone, errors.tecnoPhoto && styles.inputError]}>
                {form.tecnoPhoto ? (
                  <View style={styles.previewContainer}>
                    <Image source={{ uri: form.tecnoPhoto }} style={styles.imagePreview} />
                    <View style={styles.badgeSuccess}><Text style={styles.badgeSuccessText}>{t('photoUploaded') || '✓ Cargada'}</Text></View>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Text style={styles.uploadIconText}>📷</Text>
                    <Text style={styles.uploadText}>{t('uploadCda') || 'Subir certificado'}</Text>
                  </View>
                )}
              </TouchableOpacity>
              {errors.tecnoPhoto && <Text style={styles.errorText}>{errors.tecnoPhoto}</Text>}
            </>
          ) : (
            <View style={styles.exemptContainer}>
              <Text style={styles.exemptIcon}>✓</Text>
              <Text style={styles.exemptText}>
                {t('tecnoExemptBanner') || `Tu vehículo no requiere revisión técnico-mecánica vigente por antigüedad menor a 5 años.`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}><Text style={styles.iconEmoji}>💳</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{t('mpAccountTitle') || 'Cuenta de transferencias'}</Text>
              <Text style={styles.cardDesc}>{t('mpAccountDesc') || 'Para la dispersión semanal de ganancias netas'}</Text>
            </View>
          </View>

          <Text style={styles.label}>{t('mpEmailLabel') || 'Correo de Mercado Pago'}</Text>
          <TextInput 
            placeholder="conductor@correo.com" 
            placeholderTextColor="#999" 
            autoCapitalize="none" 
            keyboardType="email-address" 
            style={[styles.input, errors.mpEmail && styles.inputError]} 
            value={form.mpEmail} 
            onChangeText={(v) => validateField('mpEmail', v)} 
          />
          {errors.mpEmail && <Text style={styles.errorText}>{errors.mpEmail}</Text>}
        </View>

        <View style={styles.termsCard}>
          <Checkbox 
            value={form.terms} 
            onValueChange={(v) => validateField('terms', v)} 
            color={form.terms ? '#000' : undefined}
            style={styles.checkbox}
          />
          <Text style={styles.termsText}>
            {t('termsTextPrefix') || 'Acepto las políticas de la plataforma y el esquema del '}<Text style={styles.boldText}>{t('termsCommission') || '20% de comisión'}</Text>{t('termsTextSuffix') || ' por cada servicio completado.'}
          </Text>
        </View>
        {errors.terms && <Text style={[styles.errorText, { marginLeft: 10 }]}>{errors.terms}</Text>}

        {Platform.OS === 'ios' && (
          <Modal visible={picker.show} transparent animationType="fade">
            <View style={styles.modalBackdrop}>
              <View style={styles.modalSheet}>
                <View style={styles.modalBar}>
                  <TouchableOpacity onPress={() => setPicker({ type: null, show: false })}>
                    <Text style={styles.modalActionCancel}>{t('cancel') || 'Cancelar'}</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalHeading}>{t('selectDate') || 'Seleccionar fecha'}</Text>
                  <TouchableOpacity onPress={confirmIosDate}>
                    <Text style={styles.modalActionConfirm}>{t('done') || 'Listo'}</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker 
                  value={tempDate} 
                  mode="date" 
                  display="spinner" 
                  minimumDate={tomorrow} 
                  themeVariant="light"
                  textColor="#000000"
                  onChange={handleDateChange} 
                  style={{ height: 210, backgroundColor: '#ffffff' }}
                />
              </View>
            </View>
          </Modal>
        )}

        {Platform.OS === 'android' && picker.show && (
          <DateTimePicker 
            value={tempDate} 
            mode="date" 
            display="default" 
            minimumDate={tomorrow} 
            onChange={handleDateChange} 
          />
        )}

        <TouchableOpacity 
          style={[styles.mainButton, (!isFormReady || loading) && styles.mainButtonDisabled]} 
          onPress={submitRegistration} 
          disabled={!isFormReady || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.mainButtonText}>
              {!isFormReady 
                ? (t('completeThreeTabs') || 'Completa las 3 pestañas para enviar') 
                : (t('submitRegistration') || 'Enviar registro →')}
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  headerBlock: { marginVertical: 14 },
  mainTitle: { fontSize: 24, fontWeight: '800', color: '#000', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#555', marginTop: 6, lineHeight: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18, marginBottom: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconEmoji: { fontSize: 18 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#000' },
  cardDesc: { fontSize: 12, color: '#777', marginTop: 2 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E2E2E2', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#000' },
  inputError: { borderColor: '#E11900', backgroundColor: '#FFF7F6' },
  errorText: { color: '#E11900', fontSize: 12, marginTop: 4, fontWeight: '500' },
  dateSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E2E2E2', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13 },
  selectorArrow: { fontSize: 16 },
  uploadBox: { height: 90, borderWidth: 1.5, borderColor: '#D4D4D4', borderStyle: 'dashed', borderRadius: 12, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  uploadBoxDone: { borderStyle: 'solid', borderColor: '#E2E2E2', padding: 0 },
  uploadPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  uploadIconText: { fontSize: 20, marginBottom: 2 },
  uploadText: { fontSize: 13, fontWeight: '600', color: '#444' },
  previewContainer: { width: '100%', height: '100%', position: 'relative' },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  badgeSuccess: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(255, 255, 255, 0.95)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeSuccessText: { fontSize: 11, fontWeight: '700', color: '#008a05' },
  exemptContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EBF8EE', padding: 12, borderRadius: 10, marginTop: 6, gap: 10 },
  exemptIcon: { fontSize: 16, color: '#008a05', fontWeight: 'bold' },
  exemptText: { fontSize: 13, color: '#008a05', fontWeight: '600', flex: 1 },
  termsCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF', padding: 14, borderRadius: 12, marginBottom: 8 },
  checkbox: { borderRadius: 4, marginRight: 12, marginTop: 2 },
  termsText: { flex: 1, fontSize: 13, color: '#444', lineHeight: 18 },
  boldText: { fontWeight: '700', color: '#000' },
  mainButton: { backgroundColor: '#000000', borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  mainButtonDisabled: { backgroundColor: '#CCCCCC' },
  mainButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingBottom: 25 },
  modalBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalHeading: { fontSize: 16, fontWeight: '700', color: '#000' },
  modalActionCancel: { fontSize: 15, color: '#666' },
  modalActionConfirm: { fontSize: 15, fontWeight: '700', color: '#000' }
});