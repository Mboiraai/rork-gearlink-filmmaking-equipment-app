import React, { useMemo, useState, useCallback } from 'react';
import { Stack, router } from 'expo-router';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Image, Platform, Alert, ActivityIndicator } from 'react-native';
import { Camera, ImagePlus, DollarSign, Tag, MapPin, FileText, Calendar, X, Check, Upload, ChevronLeft } from 'lucide-react-native';
import { useUser } from '@/providers/UserProvider';

interface ListingForm {
  title: string;
  category: string;
  description: string;
  dailyRate: string;
  weeklyRate: string;
  location: string;
  deposit: string;
  availabilityFrom: string;
  availabilityTo: string;
  photos: string[];
}

const categories = [
  'Camera Bodies',
  'Lenses',
  'Lighting',
  'Audio',
  'Grip & Support',
  'Drones',
  'Monitors & Recorders',
  'Power',
  'Accessories',
] as const;

export default function NewListingScreen() {
  const { user } = useUser();
  const [form, setForm] = useState<ListingForm>({
    title: '',
    category: '',
    description: '',
    dailyRate: '',
    weeklyRate: '',
    location: '',
    deposit: '',
    availabilityFrom: '',
    availabilityTo: '',
    photos: [],
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  const canSubmit = useMemo(() => {
    return (
      form.title.trim().length > 2 &&
      form.category.trim().length > 0 &&
      form.description.trim().length > 10 &&
      !!parseFloat(form.dailyRate) &&
      form.location.trim().length > 2 &&
      form.photos.length > 0
    );
  }, [form]);

  const pickImage = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert('Upload not available', 'Use a mobile device for image uploads in this demo.');
        return;
      }
      const ImagePicker = await import('expo-image-picker');
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission required', 'We need access to your photos to add images.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5,
      });
      if (!result.canceled) {
        const uris = result.assets?.map(a => a.uri).filter(Boolean) as string[];
        setForm(prev => ({ ...prev, photos: [...prev.photos, ...uris].slice(0, 8) }));
      }
    } catch (e: unknown) {
      console.error('[NewListing] pickImage error', e);
      Alert.alert('Error', 'Failed to pick images');
    }
  }, []);

  const removePhoto = useCallback((uri: string) => {
    setForm(prev => ({ ...prev, photos: prev.photos.filter(p => p !== uri) }));
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      if (!user) {
        Alert.alert('Not signed in', 'Please sign in to create a listing.');
        return;
      }
      if (!canSubmit) {
        Alert.alert('Missing info', 'Please complete all required fields.');
        return;
      }
      setSubmitting(true);
      await new Promise(res => setTimeout(res, 800));
      Alert.alert('Listing created', 'Your listing has been created successfully.');
      router.back();
    } catch (e: unknown) {
      console.error('[NewListing] submit error', e);
      Alert.alert('Error', 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  }, [user, canSubmit]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'New Listing' }} />

      <Text style={styles.header}>Create New Listing</Text>

      <View style={styles.inputRow}>
        <Tag size={18} color="#FF6B35" />
        <TextInput
          testID="title-input"
          style={styles.input}
          placeholder="Title (e.g., Canon C70 Cinema Camera)"
          placeholderTextColor="#8E8E93"
          value={form.title}
          onChangeText={(t: string) => setForm(s => ({ ...s, title: t }))}
        />
      </View>

      <View style={styles.inputRow}>
        <FileText size={18} color="#FF6B35" />
        <TextInput
          testID="description-input"
          style={[styles.input, styles.multiline]}
          placeholder="Detailed description, included accessories, usage notes"
          placeholderTextColor="#8E8E93"
          multiline
          numberOfLines={5}
          value={form.description}
          onChangeText={(t: string) => setForm(s => ({ ...s, description: t }))}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.rowItem, { marginRight: 8 }]}> 
          <DollarSign size={18} color="#FF6B35" />
          <TextInput
            testID="daily-rate-input"
            style={styles.input}
            placeholder="Daily rate"
            placeholderTextColor="#8E8E93"
            keyboardType="numeric"
            value={form.dailyRate}
            onChangeText={(t: string) => setForm(s => ({ ...s, dailyRate: t }))}
          />
        </View>
        <View style={[styles.rowItem, { marginLeft: 8 }]}> 
          <Calendar size={18} color="#FF6B35" />
          <TextInput
            testID="weekly-rate-input"
            style={styles.input}
            placeholder="Weekly rate (optional)"
            placeholderTextColor="#8E8E93"
            keyboardType="numeric"
            value={form.weeklyRate}
            onChangeText={(t: string) => setForm(s => ({ ...s, weeklyRate: t }))}
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <MapPin size={18} color="#FF6B35" />
        <TextInput
          testID="location-input"
          style={styles.input}
          placeholder="Pickup location (City, Area)"
          placeholderTextColor="#8E8E93"
          value={form.location}
          onChangeText={(t: string) => setForm(s => ({ ...s, location: t }))}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.rowItem, { marginRight: 8 }]}> 
          <DollarSign size={18} color="#FF6B35" />
          <TextInput
            testID="deposit-input"
            style={styles.input}
            placeholder="Security deposit (optional)"
            placeholderTextColor="#8E8E93"
            keyboardType="numeric"
            value={form.deposit}
            onChangeText={(t: string) => setForm(s => ({ ...s, deposit: t }))}
          />
        </View>
        <View style={[styles.rowItem, { marginLeft: 8 }]}> 
          <Calendar size={18} color="#FF6B35" />
          <TextInput
            testID="availability-from-input"
            style={styles.input}
            placeholder="Available from (YYYY-MM-DD)"
            placeholderTextColor="#8E8E93"
            value={form.availabilityFrom}
            onChangeText={(t: string) => setForm(s => ({ ...s, availabilityFrom: t }))}
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <Calendar size={18} color="#FF6B35" />
        <TextInput
          testID="availability-to-input"
          style={styles.input}
          placeholder="Available to (YYYY-MM-DD)"
          placeholderTextColor="#8E8E93"
          value={form.availabilityTo}
          onChangeText={(t: string) => setForm(s => ({ ...s, availabilityTo: t }))}
        />
      </View>

      <Text style={styles.sectionTitle}>Photos</Text>
      <View style={styles.photosRow}>
        {form.photos.map((uri) => (
          <View key={uri} style={styles.photoItem}>
            <Image source={{ uri }} style={styles.photo} />
            <TouchableOpacity testID={`remove-photo-${uri}`} onPress={() => removePhoto(uri)} style={styles.removeBtn}>
              <X size={14} color="#0A0E27" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity testID="add-photo" style={styles.addPhoto} onPress={pickImage}>
          <ImagePlus size={20} color="#8E8E93" />
          <Text style={styles.addPhotoText}>Add Photos</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Category</Text>
      <View style={styles.chips}>
        {categories.map((c) => {
          const active = form.category === c;
          return (
            <TouchableOpacity
              key={c}
              testID={`chip-${c}`}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setForm(s => ({ ...s, category: c }))}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        testID="submit-listing"
        style={[styles.submitBtn, { opacity: canSubmit && !submitting ? 1 : 0.6 }]}
        onPress={handleSubmit}
        disabled={!canSubmit || submitting}
      >
        {submitting ? <ActivityIndicator color="#0A0E27" /> : <Text style={styles.submitText}>Create Listing</Text>}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27' },
  content: { padding: 20 },
  header: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1C1C2E', padding: 12, borderRadius: 12, marginBottom: 12 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 16 },
  multiline: { minHeight: 120, textAlignVertical: 'top' as const },
  row: { flexDirection: 'row', marginBottom: 12 },
  rowItem: { flex: 1, backgroundColor: '#1C1C2E', padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginTop: 8, marginBottom: 8 },
  photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoItem: { width: 90, height: 90, borderRadius: 10, overflow: 'hidden', position: 'relative' as const },
  photo: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 6, right: 6, backgroundColor: '#FF6B35', borderRadius: 12, padding: 4 },
  addPhoto: { width: 90, height: 90, borderRadius: 10, borderWidth: 1, borderColor: '#2A2A3B', alignItems: 'center', justifyContent: 'center', gap: 6 },
  addPhotoText: { color: '#8E8E93', fontSize: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#1C1C2E', borderWidth: 1, borderColor: '#2A2A3B' },
  chipActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  chipText: { color: '#8E8E93', fontWeight: '600' },
  chipTextActive: { color: '#0A0E27' },
  submitBtn: { marginTop: 16, backgroundColor: '#FF6B35', padding: 16, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#0A0E27', fontWeight: 'bold', fontSize: 16 },
});
