
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Image, Platform, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { RegistrationContext } from '../context/RegistrationContext';
import { LanguageContext } from '../context/LanguageContext';
// AI-assisted: see docs/AI_LOG.md
export default function PersonalDataScreen() {
  const { setPersonalValidData } = useContext(RegistrationContext);
  const { appLang, changeLanguage, t } = useContext(LanguageContext);
  
  const [form, setForm] = useState({ photo: null, name: '', idDoc: '', phone: '', dob: new Date(), gender: '', email: '', lang: appLang });
  const [errors, setErrors] = useState({ initial: true });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateSelected, setDateSelected] = useState(false);

  useEffect(() => {
    setForm(prev => ({ ...prev, lang: appLang }));
  }, [appLang]);

  const pickImage = async (useCamera = false) => {
    let result;
    const options = { mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 };
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Error', 'Permiso de cámara denegado.');
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Error', 'Permiso de galería denegado.');
      result = await ImagePicker.launchImageLibraryAsync(options);
    }
    if (!result.canceled) validateField('photo', result.assets[0].uri);
  };

  const validateField = (field, value) => {
    let newForm = { ...form, [field]: value };
    setForm(newForm);
    let newErrors = { ...errors };
    delete newErrors.initial;

    if (field === 'lang' && value) {
      changeLanguage(value);
    }

    if (field === 'photo' && !value) newErrors.photo = 'Obligatorio[cite: 1]';
    else delete newErrors.photo;
    if (field === 'name') {
      if (!value || !/^[a-zA-Z\s]{1,50}$/.test(value)) newErrors.name = 'Máximo 50 caracteres, solo letras[cite: 1]';
      else delete newErrors.name;
    }
    if (field === 'idDoc') {
      if (!value || !/^\d{6,10}$/.test(value)) newErrors.idDoc = 'Entre 6 y 10 dígitos numéricos[cite: 1]';
      else delete newErrors.idDoc;
    }
    if (field === 'phone') {
      if (!value || !/^\d{10}$/.test(value)) newErrors.phone = '10 dígitos numéricos[cite: 1]';
      else delete newErrors.phone;
    }
    if (field === 'dob') {
      const age = new Date().getFullYear() - value.getFullYear();
      if (age < 18) newErrors.dob = 'Debe ser mayor de 18 años[cite: 1]';
      else delete newErrors.dob;
    }
    if (field === 'gender') {
      if (!value) newErrors.gender = 'Obligatorio[cite: 1]';
      else delete newErrors.gender;
    }
    if (field === 'email') {
      if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors.email = 'Formato inválido[cite: 2]';
      else delete newErrors.email;
    }
    if (field === 'lang') {
      if (!value) newErrors.lang = 'Obligatorio[cite: 2]';
      else delete newErrors.lang;
    }

    setErrors(newErrors);
    
    const isComplete = newForm.photo && newForm.name && newForm.idDoc && newForm.phone && dateSelected && newForm.gender && newForm.email && newForm.lang;
    if (Object.keys(newErrors).length === 0 && isComplete) setPersonalValidData(newForm);
    else setPersonalValidData(null);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateSelected(true);
      validateField('dob', selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.photoContainer}>
        {form.photo ? <Image source={{ uri: form.photo }} style={styles.image} /> : <View style={styles.imagePlaceholder}><Text style={{color: '#666'}}>{t('noPhoto')}</Text></View>}
        <View style={styles.photoButtons}>
          <TouchableOpacity onPress={() => pickImage(true)} style={styles.photoBtn}><Text style={styles.btnText}>{t('cam')}</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => pickImage(false)} style={styles.photoBtn}><Text style={styles.btnText}>{t('gal')}</Text></TouchableOpacity>
        </View>
      </View>
      {errors.photo && <Text style={styles.error}>{errors.photo}</Text>}
      <TextInput placeholder={t('name')} placeholderTextColor="#666" style={styles.input} maxLength={50} value={form.name} onChangeText={(v) => validateField('name', v)} />
      {errors.name && <Text style={styles.error}>{errors.name}</Text>}
      <TextInput placeholder={t('doc')} placeholderTextColor="#666" keyboardType="numeric" maxLength={10} style={styles.input} value={form.idDoc} onChangeText={(v) => validateField('idDoc', v)} />
      {errors.idDoc && <Text style={styles.error}>{errors.idDoc}</Text>}
      <TextInput placeholder={t('phone')} placeholderTextColor="#666" keyboardType="numeric" maxLength={10} style={styles.input} value={form.phone} onChangeText={(v) => validateField('phone', v)} />
      {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
        <Text style={{ color: dateSelected ? '#000' : '#666' }}>{dateSelected ? form.dob.toISOString().split('T')[0] : t('dob')}</Text>
      </TouchableOpacity>
      {showDatePicker && <DateTimePicker value={form.dob} mode="date" display="default" onChange={handleDateChange} maximumDate={new Date()} />}
      {errors.dob && <Text style={styles.error}>{errors.dob}</Text>}
      <View style={styles.pickerContainer}>
        <Picker selectedValue={form.gender} onValueChange={(v) => validateField('gender', v)} itemStyle={styles.pickerItem}>
          <Picker.Item label={t('gender')} value="" color="#666" />
          <Picker.Item label={t('m')} value="Masculino" color="#000" />
          <Picker.Item label={t('f')} value="Femenino" color="#000" />
          <Picker.Item label={t('o')} value="Otro" color="#000" />
        </Picker>
      </View>
      {errors.gender && <Text style={styles.error}>{errors.gender}</Text>}
      <TextInput placeholder={t('email')} placeholderTextColor="#666" autoCapitalize="none" keyboardType="email-address" style={styles.input} value={form.email} onChangeText={(v) => validateField('email', v)} />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}
      <View style={styles.pickerContainer}>
        <Picker selectedValue={form.lang} onValueChange={(v) => validateField('lang', v)} itemStyle={styles.pickerItem}>
          <Picker.Item label={t('lang')} value="" color="#666" />
          <Picker.Item label={t('es')} value="es" color="#000" />
          <Picker.Item label={t('en')} value="en" color="#000" />
        </Picker>
      </View>
      {errors.lang && <Text style={styles.error}>{errors.lang}</Text>}
      <View style={{height: 40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flex: 1 },
  photoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  imagePlaceholder: { height: 80, width: 80, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', borderRadius: 40 },
  image: { width: 80, height: 80, borderRadius: 40 },
  photoButtons: { marginLeft: 15, flexDirection: 'row' },
  photoBtn: { backgroundColor: '#007bff', padding: 10, borderRadius: 5, marginRight: 10 },
  btnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginTop: 10, color: '#000' },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', backgroundColor: '#f9f9f9', borderRadius: 8, marginTop: 10, overflow: 'hidden', justifyContent: 'center' },
  pickerItem: { height: 120, color: '#000', fontSize: 16 },
  error: { color: 'red', fontSize: 12, marginTop: 4, marginLeft: 5 }
});