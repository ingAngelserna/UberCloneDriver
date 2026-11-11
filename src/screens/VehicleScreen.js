
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Image, Platform, Alert,KeyboardAvoidingView} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { RegistrationContext } from '../context/RegistrationContext';
import { LanguageContext } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

export default function VehicleDataScreen({ navigation }) {
  const { vehicleValidData, setVehicleValidData } = useContext(RegistrationContext);
  const { t } = useContext(LanguageContext);

  const tr = (key, fallback) => {
    const translated = t(key);
    return (translated && translated !== key) ? translated : fallback;
  };

  const [form, setForm] = useState(vehicleValidData || {
    category: 'UberX',
    plate: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    passengers: '4',
    vPhoto: null
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (vehicleValidData) {
      setForm(vehicleValidData);
    }
  }, [vehicleValidData]);

  const validateField = (field, value) => {
    let processed = value;
    let newErrors = { ...errors };
    let updatedForm = { ...form, [field]: processed };

    if (field === 'plate') {
      processed = String(value).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      updatedForm.plate = processed;
      if (!processed || processed.length < 5) {
        newErrors.plate = tr('errPlateRequired', 'Ingrese una placa válida (ej: ABC123)');
      } else {
        delete newErrors.plate;
      }
    }

    if (field === 'brand') {
      if (!processed || processed.trim().length < 2) {
        newErrors.brand = tr('errBrandRequired', 'La marca es obligatoria');
      } else {
        delete newErrors.brand;
      }
    }

    if (field === 'model') {
      if (!processed || processed.trim().length < 2) {
        newErrors.model = tr('errModelRequired', 'El modelo es obligatorio');
      } else {
        delete newErrors.model;
      }
    }

    if (field === 'year') {
      processed = String(value).replace(/[^0-9]/g, '').slice(0, 4);
      updatedForm.year = processed;
      const currentYear = new Date().getFullYear();
      if (!processed || processed.length !== 4) {
        newErrors.year = tr('errYearInvalid', 'Ingrese un año válido de 4 dígitos');
      } else if (parseInt(processed, 10) < 2004 || parseInt(processed, 10) > currentYear + 1) {
        newErrors.year = tr('errYearRange', `El año debe estar entre 2004 y ${currentYear + 1}`);
      } else {
        delete newErrors.year;
      }
    }

    if (field === 'color') {
      if (!processed || processed.trim().length < 3) {
        newErrors.color = tr('errColorRequired', 'El color es obligatorio');
      } else {
        delete newErrors.color;
      }
    }

    if (field === 'category' || field === 'passengers') {
      if (field === 'passengers') {
        processed = String(value).replace(/[^0-9]/g, '').slice(0, 2);
        updatedForm.passengers = processed;
      }
      
      const cat = updatedForm.category;
      const passNum = parseInt(updatedForm.passengers, 10);

      if (!updatedForm.passengers || isNaN(passNum)) {
        newErrors.passengers = tr('errPassengersRequired', 'Ingrese la capacidad de pasajeros');
      } else if (cat === 'UberXL' && passNum < 6) {
        newErrors.passengers = tr('errUberXLSeats', 'La categoría UberXL requiere mínimo 6 puestos');
      } else if (passNum < 4) {
        newErrors.passengers = tr('errUberXSeats', 'Se requiere un mínimo de 4 puestos');
      } else {
        delete newErrors.passengers;
      }
    }

    if (field === 'vPhoto') {
      if (!processed) {
        newErrors.vPhoto = tr('errVPhotoRequired', 'La fotografía del vehículo es obligatoria');
      } else {
        delete newErrors.vPhoto;
      }
    }

    setForm(updatedForm);
    setErrors(newErrors);

    const isComplete = (
      updatedForm.category &&
      updatedForm.plate && !newErrors.plate &&
      updatedForm.brand && !newErrors.brand &&
      updatedForm.model && !newErrors.model &&
      updatedForm.year && !newErrors.year &&
      updatedForm.color && !newErrors.color &&
      updatedForm.passengers && !newErrors.passengers &&
      updatedForm.vPhoto
    );

    if (isComplete && Object.keys(newErrors).length === 0) {
      setVehicleValidData(updatedForm);
    } else {
      setVehicleValidData(null);
    }
  };

  const pickVehiclePhoto = () => {
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
              aspect: [16, 9],
              quality: 0.7
            });
            if (!result.canceled && result.assets && result.assets[0]) {
              validateField('vPhoto', result.assets[0].uri);
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
              aspect: [16, 9],
              quality: 0.7
            });
            if (!result.canceled && result.assets && result.assets[0]) {
              validateField('vPhoto', result.assets[0].uri);
            }
          } 
        },
        { text: tr('cancel', 'Cancelar'), style: 'cancel' }
      ]
    );
  };

  const handleNext = () => {
    if (navigation) {
      const routeNames = navigation.getState?.()?.routeNames || [];
      const target = routeNames.find(r => r === 'tab3' || r === 'DocumentsTab' || r.toLowerCase().includes('doc')) || routeNames[2] || 'tab3';
      navigation.navigate(target);
    }
  };

  const isTabReady = !!vehicleValidData;

  const categories = [
    { id: 'UberX', title: 'UberX', desc: tr('catDescX', 'Estándar 4 puestos') },
    { id: 'Comfort', title: 'Comfort', desc: tr('catDescComfort', 'Modelos recientes') },
    { id: 'UberXL', title: 'UberXL', desc: tr('catDescXL', 'SUV hasta 6 puestos') }
  ];

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
          <Text style={styles.mainTitle}>{tr('vehicleTitle', 'Detalles del vehículo')}</Text>
          <Text style={styles.subtitle}>{tr('vehicleSubtitle', 'Configura el automóvil con el que prestarás servicio en la plataforma.')}</Text>
        </View>

        <View style={styles.categoryCard}>
          <Text style={styles.label}>{tr('serviceCategory', 'Categoría del servicio')}</Text>
          <View style={styles.categoryRow}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryBtn, form.category === cat.id && styles.categoryBtnActive]}
                onPress={() => validateField('category', cat.id)}
              >
                <Text style={[styles.categoryTitle, form.category === cat.id && styles.categoryTextActive]}>
                  {cat.title}
                </Text>
                <Text style={[styles.categoryDesc, form.category === cat.id && styles.categoryTextActive]}>
                  {cat.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{tr('plateLabel', 'Número de placa')}</Text>
          <TextInput 
            placeholder={tr('placeholderPlate', 'Ej: ABC123')} 
            placeholderTextColor="#999" 
            autoCapitalize="characters"
            maxLength={6}
            style={[styles.input, errors.plate && styles.inputError]} 
            value={form.plate} 
            onChangeText={(v) => validateField('plate', v)} 
          />
          {errors.plate && <Text style={styles.errorText}>{errors.plate}</Text>}

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>{tr('brandLabel', 'Marca')}</Text>
              <TextInput 
                placeholder={tr('placeholderBrand', 'Ej: Chevrolet')} 
                placeholderTextColor="#999" 
                style={[styles.input, errors.brand && styles.inputError]} 
                value={form.brand} 
                onChangeText={(v) => validateField('brand', v)} 
              />
              {errors.brand && <Text style={styles.errorText}>{errors.brand}</Text>}
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>{tr('modelLabel', 'Línea / Modelo')}</Text>
              <TextInput 
                placeholder={tr('placeholderModel', 'Ej: Spark')} 
                placeholderTextColor="#999" 
                style={[styles.input, errors.model && styles.inputError]} 
                value={form.model} 
                onChangeText={(v) => validateField('model', v)} 
              />
              {errors.model && <Text style={styles.errorText}>{errors.model}</Text>}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>{tr('yearLabel', 'Año de fabricación')}</Text>
              <TextInput 
                placeholder={tr('placeholderYear', 'Ej: 2018')} 
                placeholderTextColor="#999" 
                keyboardType="numeric"
                maxLength={4}
                style={[styles.input, errors.year && styles.inputError]} 
                value={form.year} 
                onChangeText={(v) => validateField('year', v)} 
              />
              {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>{tr('colorLabel', 'Color')}</Text>
              <TextInput 
                placeholder={tr('placeholderColor', 'Ej: Blanco')} 
                placeholderTextColor="#999" 
                style={[styles.input, errors.color && styles.inputError]} 
                value={form.color} 
                onChangeText={(v) => validateField('color', v)} 
              />
              {errors.color && <Text style={styles.errorText}>{errors.color}</Text>}
            </View>
          </View>

          <Text style={styles.label}>{tr('passengersLabel', 'Capacidad de pasajeros')}</Text>
          <TextInput 
            placeholder={tr('placeholderPassengers', 'Ej: 4')} 
            placeholderTextColor="#999" 
            keyboardType="numeric"
            maxLength={2}
            style={[styles.input, errors.passengers && styles.inputError]} 
            value={form.passengers} 
            onChangeText={(v) => validateField('passengers', v)} 
          />
          {errors.passengers && <Text style={styles.errorText}>{errors.passengers}</Text>}

          <Text style={styles.label}>{tr('vPhotoLabel', 'Fotografía del vehículo')}</Text>
          <TouchableOpacity onPress={pickVehiclePhoto} style={[styles.uploadBox, form.vPhoto && styles.uploadBoxDone, errors.vPhoto && styles.inputError]}>
            {form.vPhoto ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: form.vPhoto }} style={styles.imagePreview} />
                <View style={styles.badgeSuccess}><Text style={styles.badgeSuccessText}>{tr('photoUploaded', '✓ Cargada')}</Text></View>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadIconText}>🚗</Text>
                <Text style={styles.uploadText}>{tr('uploadVehiclePhoto', 'Subir foto frontal/lateral')}</Text>
              </View>
            )}
          </TouchableOpacity>
          {errors.vPhoto && <Text style={styles.errorText}>{errors.vPhoto}</Text>}
        </View>

        <TouchableOpacity 
          style={[styles.nextButton, !isTabReady && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!isTabReady}
        >
          <Text style={styles.nextButtonText}>
            {isTabReady ? tr('btnNextDocs', 'Siguiente paso: Documentos →') : tr('btnCompleteData', 'Completa los datos para continuar')}
          </Text>
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
  categoryCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18, marginBottom: 16, elevation: 2 },
  categoryRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  categoryBtn: { flex: 1, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E2E2E2', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  categoryBtnActive: { backgroundColor: '#000', borderColor: '#000' },
  categoryTitle: { fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 4, textAlign: 'center' },
  categoryDesc: { fontSize: 10, color: '#777', textAlign: 'center', lineHeight: 12 },
  categoryTextActive: { color: '#FFF' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18, marginBottom: 16, elevation: 2 },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E2E2E2', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#000' },
  inputError: { borderColor: '#E11900', backgroundColor: '#FFF7F6' },
  errorText: { color: '#E11900', fontSize: 12, marginTop: 4, fontWeight: '500' },
  uploadBox: { height: 120, borderWidth: 1.5, borderColor: '#D4D4D4', borderStyle: 'dashed', borderRadius: 12, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginTop: 8 },
  uploadBoxDone: { borderStyle: 'solid', borderColor: '#E2E2E2', padding: 0 },
  uploadPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  uploadIconText: { fontSize: 24, marginBottom: 4 },
  uploadText: { fontSize: 13, fontWeight: '600', color: '#444' },
  previewContainer: { width: '100%', height: '100%', position: 'relative' },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  badgeSuccess: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(255, 255, 255, 0.95)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeSuccessText: { fontSize: 11, fontWeight: '700', color: '#008a05' },
  nextButton: { backgroundColor: '#000000', borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  nextButtonDisabled: { backgroundColor: '#CCCCCC' },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});