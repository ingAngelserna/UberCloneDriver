
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useContext, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LanguageContext } from '../context/LanguageContext';
import { RegistrationContext } from '../context/RegistrationContext';

export default function VehicleScreen() {
  const { setVehicleValidData } = useContext(RegistrationContext);
  const { t } = useContext(LanguageContext);
  
  const [form, setForm] = useState({ category: '', plate: '', brand: '', model: '', year: '', color: '', capacity: '', photo: null });
  const [errors, setErrors] = useState({ initial: true });

  const validateField = (field, value) => {
    let newForm = { ...form, [field]: value };
    setForm(newForm);
    let newErrors = { ...errors };
    delete newErrors.initial;

    if (field === 'category') {
      if (!value) newErrors.category = 'Obligatorio[cite: 2]';
      else delete newErrors.category;
      if (value === 'XL' && newForm.capacity && parseInt(newForm.capacity) < 6) newErrors.capacity = 'Mínimo 6 pasajeros[cite: 2]';
      else if (newForm.capacity) delete newErrors.capacity;
    }
    if (field === 'plate') {
      const upperPlate = value.toUpperCase();
      newForm.plate = upperPlate; 
      setForm(newForm);
      if (!/^[A-Z]{3}\d{3}$/.test(upperPlate)) newErrors.plate = 'Formato ABC123[cite: 2]';
      else delete newErrors.plate;
    }
    if (field === 'brand') {
      if (!value || value.length > 30) newErrors.brand = 'Máximo 30 caracteres[cite: 2]';
      else delete newErrors.brand;
    }
    if (field === 'model') {
      if (!value || value.length > 30) newErrors.model = 'Máximo 30 caracteres[cite: 2]';
      else delete newErrors.model;
    }
    if (field === 'year') {
      const currentYear = new Date().getFullYear();
      if (!/^\d{4}$/.test(value) || parseInt(value) > currentYear) newErrors.year = `Máximo ${currentYear}[cite: 2]`;
      else delete newErrors.year;
    }
    if (field === 'color') {
      if (!value) newErrors.color = 'Obligatorio[cite: 2]';
      else delete newErrors.color;
    }
    if (field === 'capacity') {
      if (!value || isNaN(value)) newErrors.capacity = 'Debe ser numérico[cite: 2]';
      else if (newForm.category === 'XL' && parseInt(value) < 6) newErrors.capacity = 'Mínimo 6 pasajeros[cite: 2]';
      else delete newErrors.capacity;
    }
    if (field === 'photo') {
      if (!value) newErrors.photo = 'Obligatorio[cite: 2]';
      else delete newErrors.photo;
    }

    setErrors(newErrors);

    const isComplete = newForm.category && newForm.plate && newForm.brand && newForm.model && newForm.year && newForm.color && newForm.capacity && newForm.photo;
    if (Object.keys(newErrors).length === 0 && isComplete) setVehicleValidData(newForm);
    else setVehicleValidData(null);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Error', 'Permiso de galería denegado.');
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.5 });
    if (!result.canceled) validateField('photo', result.assets[0].uri);
  };
// AI-assisted: see docs/AI_LOG.md+
  return (
    <ScrollView style={styles.container}>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={form.category} onValueChange={(v) => validateField('category', v)} itemStyle={styles.pickerItem}>
          <Picker.Item label={t('cat')} value="" color="#666" />
          <Picker.Item label={t('eco')} value="Económico" color="#000" />
          <Picker.Item label={t('xl')} value="XL" color="#000" />
          <Picker.Item label={t('prem')} value="Premium" color="#000" />
        </Picker>
      </View>
      {errors.category && <Text style={styles.error}>{errors.category}</Text>}
      <TextInput placeholder={t('plate')} placeholderTextColor="#666" autoCapitalize="characters" maxLength={6} style={styles.input} value={form.plate} onChangeText={(v) => validateField('plate', v)} />
      {errors.plate && <Text style={styles.error}>{errors.plate}</Text>}
      <TextInput placeholder={t('brand')} placeholderTextColor="#666" maxLength={30} style={styles.input} value={form.brand} onChangeText={(v) => validateField('brand', v)} />
      {errors.brand && <Text style={styles.error}>{errors.brand}</Text>}
      <TextInput placeholder={t('model')} placeholderTextColor="#666" maxLength={30} style={styles.input} value={form.model} onChangeText={(v) => validateField('model', v)} />
      {errors.model && <Text style={styles.error}>{errors.model}</Text>}
      <TextInput placeholder={t('year')} placeholderTextColor="#666" keyboardType="numeric" maxLength={4} style={styles.input} value={form.year} onChangeText={(v) => validateField('year', v)} />
      {errors.year && <Text style={styles.error}>{errors.year}</Text>}
      <View style={styles.pickerContainer}>
        <Picker selectedValue={form.color} onValueChange={(v) => validateField('color', v)} itemStyle={styles.pickerItem}>
          <Picker.Item label={t('color')} value="" color="#666" />
          <Picker.Item label={t('white')} value="Blanco" color="#000" />
          <Picker.Item label={t('black')} value="Negro" color="#000" />
          <Picker.Item label={t('grey')} value="Gris" color="#000" />
          <Picker.Item label={t('silver')} value="Plata" color="#000" />
          <Picker.Item label={t('red')} value="Rojo" color="#000" />
        </Picker>
      </View>
      {errors.color && <Text style={styles.error}>{errors.color}</Text>}
      <TextInput placeholder={t('cap')} placeholderTextColor="#666" keyboardType="numeric" maxLength={2} style={styles.input} value={form.capacity} onChangeText={(v) => validateField('capacity', v)} />
      {errors.capacity && <Text style={styles.error}>{errors.capacity}</Text>}
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {form.photo ? <Image source={{ uri: form.photo }} style={styles.image} /> : <Text style={styles.imageText}>{t('vPhoto')}</Text>}
      </TouchableOpacity>
      {errors.photo && <Text style={styles.error}>{errors.photo}</Text>}
      <View style={{height: 40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flex: 1 },
  input: { borderWidth: 1, borderColor: '#ccc', backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginTop: 10, color: '#000' },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', backgroundColor: '#f9f9f9', borderRadius: 8, marginTop: 10, overflow: 'hidden', justifyContent: 'center' },
  pickerItem: { height: 120, color: '#000', fontSize: 16 },
  error: { color: 'red', fontSize: 12, marginTop: 4, marginLeft: 5 },
  imagePicker: { height: 150, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8, marginTop: 10, overflow: 'hidden' },
  imageText: { color: '#666', fontWeight: 'bold' },
  image: { width: '100%', height: '100%' }
});