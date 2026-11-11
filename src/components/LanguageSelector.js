
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LanguageContext } from '../context/LanguageContext';

export default function LanguageSelector() {
  const { language, changeLanguage } = useContext(LanguageContext);
// AI-assisted: see docs/AI_LOG.md 
  return (
    <View style={styles.container}>
      <View style={styles.pillContainer}>
        <TouchableOpacity 
          onPress={() => changeLanguage('es')} 
          style={[styles.pillBtn, language === 'es' && styles.pillBtnActive]}
        >
          <Text style={[styles.pillText, language === 'es' && styles.pillTextActive]}>ES</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => changeLanguage('en')} 
          style={[styles.pillBtn, language === 'en' && styles.pillBtnActive]}
        >
          <Text style={[styles.pillText, language === 'en' && styles.pillTextActive]}>EN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 10,
    paddingBottom: 4
  },
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: '#EAEAEA',
    borderRadius: 20,
    padding: 3
  },
  pillBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16
  },
  pillBtnActive: {
    backgroundColor: '#000000'
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666'
  },
  pillTextActive: {
    color: '#FFFFFF'
  }
});