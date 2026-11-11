
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Image, Platform, Alert,Modal,KeyboardAvoidingView} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RegistrationContext } from '../context/RegistrationContext';
import { LanguageContext } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

export default function PersonalDataScreen({ navigation }) {
  const { personalValidData, setPersonalValidData } = useContext(RegistrationContext);
  const { t } = useContext(LanguageContext);

  const tr = (key, fallback) => {
    const translated = t(key);
    return (translated && translated !== key) ? translated : fallback;
  };
// AI-assisted: véase docs/AI_LOG.md 
  const [form, setForm] = useState(personalValidData || {
    idDoc: '',
    fullName: '',
    phone: '',
    dob: null,
    gender: 'M',
    email: '',
    photo: null
  });

  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(form.dob ? new Date(form.dob) : new Date(2000, 0, 1));

  useEffect(() => {
    if (personalValidData) {
      setForm(personalValidData);
    }
  }, [personalValidData]);

  const validateField = (field, value) => {
    let processed = value;
    let newErrors = { ...errors };

    if (field === 'idDoc') {
      processed = String(value).replace(/[^0-9]/g, '').slice(0, 10);
      if (!processed) {
        newErrors.idDoc = tr('errIdRequired', 'El documento de identidad es obligatorio');
      } else if (processed.length < 6 || processed.length > 10) {
        newErrors.idDoc = tr('errIdLength', 'Debe contener entre 6 y 10 dígitos numéricos');
      } else {
        delete newErrors.idDoc;
      }
    }

    if (field === 'fullName') {
      if (!processed || processed.trim().length < 5) {
        newErrors.fullName = tr('errNameRequired', 'Ingrese su nombre y apellido completo');
      } else {
        delete newErrors.fullName;
      }
    }

    if (field === 'phone') {
      processed = String(value).replace(/[^0-9]/g, '').slice(0, 10);
      if (!processed || processed.length !== 10) {
        newErrors.phone = tr('errPhoneInvalid', 'Ingrese un número celular válido (10 dígitos)');
      } else {
        delete newErrors.phone;
      }
    }

    if (field === 'dob') {
      if (!processed) {
        newErrors.dob = tr('errDobRequired', 'La fecha de nacimiento es obligatoria');
      } else {
        const today = new Date();
        const birth = new Date(processed);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        
        if (age < 18) {
          newErrors.dob = tr('errUnderage', 'Debes tener al menos 18 años para conducir en la plataforma');
        } else {
          delete newErrors.dob;
        }
      }
    }

    if (field === 'email') {
      if (!processed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(processed)) {
        newErrors.email = tr('errEmailInvalid', 'Correo electrónico inválido');
      } else {
        delete newErrors.email;
      }
    }

    if (field === 'photo') {
      if (!processed) {
        newErrors.photo = tr('errPhotoRequired', 'La fotografía de perfil es obligatoria');
      } else {
        delete newErrors.photo;
      }
    }

    const updatedForm = { ...form, [field]: processed };
    setForm(updatedForm);
    setErrors(newErrors);

    const isComplete = (
      updatedForm.idDoc && !newErrors.idDoc &&
      updatedForm.fullName && !newErrors.fullName &&
      updatedForm.phone && !newErrors.phone &&
      updatedForm.dob && !newErrors.dob &&
      updatedForm.email && !newErrors.email &&
      updatedForm.photo
    );

    if (isComplete && Object.keys(newErrors).length === 0) {
      setPersonalValidData(updatedForm);
    } else {
      setPersonalValidData(null);
    }
  };

  const pickPhoto = () => {
    Alert.alert(
      tr('photoOptionsTitle', 'Opciones de fotografía'),
      tr('photoOptionsMsg', '¿Cómo deseas subir la imagen?'),
      [
        { 
          text: tr('takePhoto', 'Tomar foto'), 
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              return Alert.alert(tr('permissionTitle', 'Permiso denegado'), tr('cameraPermissionMsg', 'Se requiere acceso a la cámara.'));
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7
            });
            if (!result.canceled && result.assets && result.assets[0]) {
              validateField('photo', result.assets[0].uri);
            }
          } 
        },
        { 
          text: tr('chooseGallery', 'Elegir de la galería'), 
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              return Alert.alert(tr('permissionTitle', 'Permiso denegado'), tr('permissionMsg', 'Se requiere acceso a la galería.'));
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7
            });
            if (!result.canceled && result.assets && result.assets[0]) {
              validateField('photo', result.assets[0].uri);
            }
          } 
        },
        { text: tr('cancel', 'Cancelar'), style: 'cancel' }
      ]
    );
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate) validateField('dob', selectedDate);
    } else {
      if (selectedDate) setTempDate(selectedDate);
    }
  };

  const confirmIosDate = () => {
    validateField('dob', tempDate);
    setShowDatePicker(false);
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    return d.toISOString().split('T')[0];
  };

  const handleNext = () => {
    if (navigation) {
      const routeNames = navigation.getState?.()?.routeNames || [];
      const target = routeNames.find(r => r === 'tab2' || r === 'VehicleTab' || r.toLowerCase().includes('vehic')) || routeNames[1] || 'tab2';
      navigation.navigate(target);
    }
  };

  const isTabReady = !!personalValidData;

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
          <Text style={styles.mainTitle}>{tr('personalTitle', 'Información personal')}</Text>
          <Text style={styles.subtitle}>{tr('personalSubtitle', 'Ingresa tus datos oficiales tal como figuran en tu documento de identidad.')}</Text>
        </View>

        <View style={styles.profileCard}>
          <TouchableOpacity onPress={pickPhoto} style={styles.avatarButton}>
            {form.photo ? (
              <Image source={{ uri: form.photo }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarIcon}>👤</Text>
                <Text style={styles.avatarText}>{tr('addPhoto', 'Añadir')}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.profileMeta}>
            <Text style={styles.profileTitle}>{tr('profilePhotoTitle', 'Foto de perfil')}</Text>
            <Text style={styles.profileHint}>{tr('profilePhotoHint', 'Rostro descubierto, fondo claro y buena iluminación.')}</Text>
          </View>
        </View>
        {errors.photo && <Text style={[styles.errorText, { marginBottom: 10 }]}>{errors.photo}</Text>}

        <View style={styles.card}>
          <Text style={styles.label}>{tr('idDocLabel', 'Número de documento de identidad')}</Text>
          <TextInput 
            placeholder={tr('idDocPlaceholder', 'Máximo 10 dígitos')} 
            placeholderTextColor="#999" 
            keyboardType="numeric"
            maxLength={10}
            style={[styles.input, errors.idDoc && styles.inputError]} 
            value={form.idDoc} 
            onChangeText={(v) => validateField('idDoc', v)} 
          />
          {errors.idDoc && <Text style={styles.errorText}>{errors.idDoc}</Text>}

          <Text style={styles.label}>{tr('fullNameLabel', 'Nombre completo')}</Text>
          <TextInput 
            placeholder={tr('fullNamePlaceholder', 'Nombres y apellidos')} 
            placeholderTextColor="#999" 
            style={[styles.input, errors.fullName && styles.inputError]} 
            value={form.fullName} 
            onChangeText={(v) => validateField('fullName', v)} 
          />
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

          <Text style={styles.label}>{tr('phoneLabel', 'Teléfono celular')}</Text>
          <TextInput 
            placeholder={tr('phonePlaceholder', 'Ej: 3001234567')} 
            placeholderTextColor="#999" 
            keyboardType="phone-pad"
            maxLength={10}
            style={[styles.input, errors.phone && styles.inputError]} 
            value={form.phone} 
            onChangeText={(v) => validateField('phone', v)} 
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

          <Text style={styles.label}>{tr('dobLabel', 'Fecha de nacimiento')}</Text>
          <TouchableOpacity 
            onPress={() => setShowDatePicker(true)} 
            style={[styles.selector, errors.dob && styles.inputError]}
          >
            <Text style={{ color: form.dob ? '#000' : '#888', fontWeight: form.dob ? '600' : 'normal' }}>
              {formatDate(form.dob) || tr('dobSelectPlaceholder', 'Seleccionar fecha (Mínimo 18 años)')}
            </Text>
            <Text style={styles.selectorIcon}>📅</Text>
          </TouchableOpacity>
          {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

          <Text style={styles.label}>{tr('genderLabel', 'Género')}</Text>
          <View style={styles.genderRow}>
            {[
              { key: 'M', label: tr('genderM', 'Masculino') },
              { key: 'F', label: tr('genderF', 'Femenino') },
              { key: 'O', label: tr('genderO', 'Otro') }
            ].map((item) => (
              <TouchableOpacity 
                key={item.key} 
                onPress={() => validateField('gender', item.key)}
                style={[styles.genderBtn, form.gender === item.key && styles.genderBtnActive]}
              >
                <Text style={[styles.genderText, form.gender === item.key && styles.genderTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{tr('emailLabel', 'Correo electrónico')}</Text>
          <TextInput 
            placeholder={tr('emailPlaceholder', 'correo@ejemplo.com')} 
            placeholderTextColor="#999" 
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, errors.email && styles.inputError]} 
            value={form.email} 
            onChangeText={(v) => validateField('email', v)} 
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <TouchableOpacity 
          style={[styles.nextButton, !isTabReady && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!isTabReady}
        >
          <Text style={styles.nextButtonText}>
            {isTabReady ? tr('btnNextDocs', 'Siguiente paso: Vehículo →') : tr('btnCompleteData', 'Completa los datos para continuar')}
          </Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <Modal visible={showDatePicker} transparent animationType="fade">
            <View style={styles.modalBackdrop}>
              <View style={styles.modalSheet}>
                <View style={styles.modalBar}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.modalActionCancel}>{tr('cancel', 'Cancelar')}</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalHeading}>{tr('dobModalTitle', 'Fecha de nacimiento')}</Text>
                  <TouchableOpacity onPress={confirmIosDate}>
                    <Text style={styles.modalActionConfirm}>{tr('done', 'Listo')}</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker 
                  value={tempDate} 
                  mode="date" 
                  display="spinner" 
                  maximumDate={new Date()} 
                  themeVariant="light"
                  textColor="#000000"
                  onChange={handleDateChange} 
                  style={{ height: 210, backgroundColor: '#ffffff' }}
                />
              </View>
            </View>
          </Modal>
        )}

        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker 
            value={form.dob ? new Date(form.dob) : new Date(2000, 0, 1)} 
            mode="date" 
            display="default" 
            maximumDate={new Date()} 
            onChange={handleDateChange} 
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  headerBlock: { marginVertical: 14 },
  mainTitle: { fontSize: 24, fontWeight: '800', color: '#000', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#555', marginTop: 6, lineHeight: 20 },
  profileCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 14, elevation: 2 },
  avatarButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#EFEFEF', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: '100%', height: '100%' },
  avatarPlaceholder: { alignItems: 'center' },
  avatarIcon: { fontSize: 24 },
  avatarText: { fontSize: 10, color: '#666', fontWeight: '700', marginTop: 2 },
  profileMeta: { marginLeft: 16, flex: 1 },
  profileTitle: { fontSize: 16, fontWeight: '700', color: '#000' },
  profileHint: { fontSize: 12, color: '#777', marginTop: 2, lineHeight: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 14, padding: 18, marginBottom: 16, elevation: 2 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E2E2E2', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#000' },
  inputError: { borderColor: '#E11900', backgroundColor: '#FFF7F6' },
  errorText: { color: '#E11900', fontSize: 12, marginTop: 4, fontWeight: '500' },
  selector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E2E2E2', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13 },
  selectorIcon: { fontSize: 16 },
  genderRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  genderBtn: { flex: 1, paddingVertical: 11, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E2E2E2', borderRadius: 10, alignItems: 'center' },
  genderBtnActive: { backgroundColor: '#000', borderColor: '#000' },
  genderText: { fontSize: 13, fontWeight: '600', color: '#555' },
  genderTextActive: { color: '#FFF' },
  nextButton: { backgroundColor: '#000000', borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  nextButtonDisabled: { backgroundColor: '#CCCCCC' },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingBottom: 25 },
  modalBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalHeading: { fontSize: 16, fontWeight: '700', color: '#000' },
  modalActionCancel: { fontSize: 15, color: '#666' },
  modalActionConfirm: { fontSize: 15, fontWeight: '700', color: '#000' }
});