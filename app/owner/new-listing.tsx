import React, { useMemo, useState, useCallback } from 'react';
import { Stack, router } from 'expo-router';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import {
  ImagePlus,
  DollarSign,
  Tag,
  MapPin,
  FileText,
  Calendar,
  X,
  ChevronDown,
  Cpu,
  Aperture,
  Battery,
  Zap,
  HardDrive,
  Ruler,
} from 'lucide-react-native';
import { useUser } from '@/providers/UserProvider';

interface ListingForm {
  title: string;
  category: CategoryKey | '';
  description: string;
  dailyRate: string;
  weeklyRate: string;
  location: string;
  deposit: string;
  availabilityFrom: string;
  availabilityTo: string;
  photos: string[];
  attributes: Record<string, string>;
}

type FieldType = 'text' | 'number' | 'select';

interface DynamicField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

type CategoryKey =
  | 'Camera Bodies'
  | 'Lenses'
  | 'Lighting'
  | 'Audio'
  | 'Grip & Support'
  | 'Drones'
  | 'Monitors & Recorders'
  | 'Power'
  | 'Accessories';

interface CategoryConfig {
  isElectronic: boolean;
  fields: DynamicField[];
}

const CATEGORY_CONFIG: Record<CategoryKey, CategoryConfig> = {
  'Camera Bodies': {
    isElectronic: true,
    fields: [
      { key: 'brand', label: 'Brand', type: 'select', required: true, options: ['Canon', 'Sony', 'Blackmagic', 'RED', 'Nikon', 'Panasonic', 'Fujifilm'] },
      { key: 'model', label: 'Model', type: 'text', required: true, placeholder: 'e.g., C70, A7S III' },
      { key: 'mount', label: 'Lens Mount', type: 'select', required: true, options: ['EF', 'RF', 'E-Mount', 'PL', 'L-Mount', 'Micro Four Thirds'] },
      { key: 'sensor', label: 'Sensor Type', type: 'select', required: true, options: ['Full Frame', 'Super 35', 'APS-C', 'Micro Four Thirds'] },
      { key: 'resolution', label: 'Max Resolution', type: 'select', options: ['4K', '5.7K', '6K', '8K'] },
      { key: 'bitDepth', label: 'Bit Depth', type: 'select', options: ['8-bit', '10-bit', '12-bit'] },
    ],
  },
  Lenses: {
    isElectronic: false,
    fields: [
      { key: 'brand', label: 'Brand', type: 'select', required: true, options: ['Canon', 'Sony', 'Sigma', 'Zeiss', 'Cooke', 'Fujinon', 'Tokina'] },
      { key: 'model', label: 'Model', type: 'text', required: true, placeholder: 'e.g., 24-70mm f/2.8' },
      { key: 'mount', label: 'Mount', type: 'select', required: true, options: ['EF', 'RF', 'E-Mount', 'PL', 'L-Mount', 'Micro Four Thirds'] },
      { key: 'focalLength', label: 'Focal Length', type: 'text', placeholder: 'e.g., 24-70mm' },
      { key: 'aperture', label: 'Max Aperture', type: 'select', options: ['T1.5', 'T2.0', 'T2.9', 'f/1.4', 'f/2.8', 'f/4'] },
    ],
  },
  Lighting: {
    isElectronic: true,
    fields: [
      { key: 'brand', label: 'Brand', type: 'select', required: true, options: ['Aputure', 'Godox', 'Nanlite', 'ARRI'] },
      { key: 'model', label: 'Model', type: 'text', required: true },
      { key: 'type', label: 'Light Type', type: 'select', options: ['LED COB', 'Panel', 'Tube', 'HMI', 'Tungsten'] },
      { key: 'power', label: 'Output (W)', type: 'number', placeholder: 'e.g., 300' },
      { key: 'colorTemp', label: 'Color Temp (K)', type: 'number', placeholder: 'e.g., 5600' },
    ],
  },
  Audio: {
    isElectronic: true,
    fields: [
      { key: 'brand', label: 'Brand', type: 'select', required: true, options: ['Sennheiser', 'Rode', 'Zoom', 'Tascam', 'Sony'] },
      { key: 'model', label: 'Model', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['Shotgun Mic', 'Lavalier', 'Recorder', 'Wireless Kit', 'Boom Pole'] },
      { key: 'connectivity', label: 'Connectivity', type: 'select', options: ['XLR', '3.5mm', 'USB', 'Wireless'] },
    ],
  },
  'Grip & Support': {
    isElectronic: false,
    fields: [
      { key: 'type', label: 'Type', type: 'select', required: true, options: ['Tripod', 'Gimbal', 'Slider', 'C-Stand', 'Rig'] },
      { key: 'brand', label: 'Brand', type: 'select', options: ['Manfrotto', 'DJI', 'Tilta', 'SmallRig', 'Sachtler'] },
      { key: 'model', label: 'Model', type: 'text' },
      { key: 'payload', label: 'Payload (kg)', type: 'number' },
    ],
  },
  Drones: {
    isElectronic: true,
    fields: [
      { key: 'brand', label: 'Brand', type: 'select', required: true, options: ['DJI', 'Autel', 'Skydio'] },
      { key: 'model', label: 'Model', type: 'text', required: true },
      { key: 'camera', label: 'Camera', type: 'select', options: ['1/2.3"', '1" CMOS', 'Micro 4/3'] },
      { key: 'range', label: 'Max Range (km)', type: 'number' },
    ],
  },
  'Monitors & Recorders': {
    isElectronic: true,
    fields: [
      { key: 'brand', label: 'Brand', type: 'select', required: true, options: ['Atomos', 'Blackmagic', 'SmallHD'] },
      { key: 'model', label: 'Model', type: 'text', required: true },
      { key: 'size', label: 'Screen Size (in)', type: 'number' },
      { key: 'resolution', label: 'Resolution', type: 'select', options: ['1080p', '4K DCI', 'UHD 4K'] },
    ],
  },
  Power: {
    isElectronic: true,
    fields: [
      { key: 'type', label: 'Type', type: 'select', required: true, options: ['V-Mount Battery', 'Gold-Mount Battery', 'NP-F Battery', 'Charger', 'Power Adapter'] },
      { key: 'capacity', label: 'Capacity (Wh)', type: 'number' },
      { key: 'output', label: 'Max Output (A)', type: 'number' },
    ],
  },
  Accessories: {
    isElectronic: false,
    fields: [
      { key: 'type', label: 'Type', type: 'select', options: ['Media', 'Cables', 'Filters', 'Cases', 'Adapters'] },
      { key: 'compatibility', label: 'Compatibility', type: 'text', placeholder: 'e.g., EF to E-Mount' },
    ],
  },
};

const categories = Object.keys(CATEGORY_CONFIG) as CategoryKey[];

function RequiredBadge() {
  return (
    <View style={styles.requiredBadge}>
      <Text style={styles.requiredBadgeText}>Required</Text>
    </View>
  );
}

function FieldIcon({ fieldKey }: { fieldKey: string }) {
  const iconColor = '#FF6B35' as const;
  switch (fieldKey) {
    case 'sensor':
      return <Cpu size={18} color={iconColor} />;
    case 'mount':
      return <Aperture size={18} color={iconColor} />;
    case 'resolution':
      return <Ruler size={18} color={iconColor} />;
    case 'power':
    case 'capacity':
    case 'output':
      return <Zap size={18} color={iconColor} />;
    case 'batteryLife':
      return <Battery size={18} color={iconColor} />;
    default:
      return <Tag size={18} color={iconColor} />;
  }
}

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
    attributes: {},
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectModal, setSelectModal] = useState<{ visible: boolean; field?: DynamicField } | null>({ visible: false });
  const [activeSelectFilter, setActiveSelectFilter] = useState<string>('');

  const categoryConfig = useMemo<CategoryConfig | null>(() => {
    if (!form.category) return null;
    return CATEGORY_CONFIG[form.category];
  }, [form.category]);

  const dynamicFields = useMemo<DynamicField[]>(() => {
    const base: DynamicField[] = categoryConfig?.fields ?? [];
    if ((categoryConfig?.isElectronic ?? false) && !base.find(f => f.key === 'batteryLife')) {
      base.push({ key: 'batteryLife', label: 'Battery Life (hrs)', type: 'number', placeholder: 'e.g., 5' });
    }
    return base;
  }, [categoryConfig]);

  const requiredDynamicMissing = useMemo(() => {
    const missing = dynamicFields.filter(f => f.required).some(f => {
      const v = form.attributes[f.key];
      return !v || String(v).trim().length === 0;
    });
    return missing;
  }, [dynamicFields, form.attributes]);

  const canSubmit = useMemo(() => {
    const baseValid =
      form.title.trim().length > 2 &&
      String(form.category).trim().length > 0 &&
      form.description.trim().length > 10 &&
      !!parseFloat(form.dailyRate) &&
      form.location.trim().length > 2 &&
      form.photos.length > 0;
    return baseValid && !requiredDynamicMissing;
  }, [form, requiredDynamicMissing]);

  const pickImage = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        console.log('[NewListing] web file picker opened');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        const files: string[] = await new Promise((resolve) => {
          input.onchange = async () => {
            const target = input as HTMLInputElement;
            const selected = Array.from(target.files ?? []).slice(0, 5);
            const readers = selected.map((file) =>
              new Promise<string>((res, rej) => {
                const reader = new FileReader();
                reader.onload = () => res(String(reader.result ?? ''));
                reader.onerror = (err) => rej(err);
                reader.readAsDataURL(file);
              })
            );
            try {
              const dataUrls = await Promise.all(readers);
              resolve(dataUrls);
            } catch {
              resolve([]);
            }
          };
          input.click();
        });
        if (files.length > 0) {
          setForm((prev) => ({ ...prev, photos: [...prev.photos, ...files].slice(0, 8) }));
        }
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

  const openSelect = useCallback((field: DynamicField) => {
    setActiveSelectFilter('');
    setSelectModal({ visible: true, field });
  }, []);

  const closeSelect = useCallback(() => {
    setSelectModal({ visible: false });
    setActiveSelectFilter('');
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
      console.log('[NewListing] submitting payload', JSON.stringify(form));
      await new Promise(res => setTimeout(res, 800));
      Alert.alert('Listing created', 'Your listing has been created successfully.');
      router.back();
    } catch (e: unknown) {
      console.error('[NewListing] submit error', e);
      Alert.alert('Error', 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  }, [user, canSubmit, form]);

  const renderDynamicField = useCallback(
    (field: DynamicField) => {
      const val = form.attributes[field.key] ?? '';
      const setVal = (v: string) => setForm(s => ({ ...s, attributes: { ...s.attributes, [field.key]: v } }));
      const disabled = !form.category;

      if (field.type === 'select') {
        return (
          <TouchableOpacity
            key={field.key}
            testID={`attr-${field.key}`}
            style={[styles.inputRow, disabled && styles.disabled]}
            onPress={() => !disabled && openSelect(field)}
            disabled={disabled}
          >
            <FieldIcon fieldKey={field.key} />
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>{field.label}{field.required ? ' *' : ''}</Text>
              <Text style={[styles.selectText, !val && { color: '#8E8E93' }]}>
                {val || 'Select'}
              </Text>
            </View>
            <ChevronDown size={18} color="#8E8E93" />
          </TouchableOpacity>
        );
      }

      return (
        <View key={field.key} style={styles.inputRow}>
          <FieldIcon fieldKey={field.key} />
          <TextInput
            testID={`attr-${field.key}`}
            style={styles.input}
            placeholder={`${field.label}${field.required ? ' *' : ''}`}
            placeholderTextColor="#8E8E93"
            keyboardType={field.type === 'number' ? 'numeric' : 'default'}
            value={val}
            onChangeText={setVal}
          />
        </View>
      );
    },
    [form.attributes, form.category, openSelect]
  );

  const currentOptions = useMemo<string[]>(() => {
    const f = selectModal?.field;
    if (!f || !f.options) return [];
    const q = activeSelectFilter.trim().toLowerCase();
    return f.options.filter(o => o.toLowerCase().includes(q));
  }, [selectModal, activeSelectFilter]);

  const onSelectOption = useCallback((opt: string) => {
    if (selectModal?.field) {
      setForm(s => ({ ...s, attributes: { ...s.attributes, [selectModal.field!.key]: opt } }));
    }
    closeSelect();
  }, [selectModal, closeSelect]);

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: 'New Listing' }} />

        <Text style={styles.header}>Create New Listing</Text>

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

        <Text style={styles.sectionTitle}>Basic Info</Text>
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

        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.chips}>
          {categories.map((c) => {
            const active = form.category === c;
            return (
              <TouchableOpacity
                key={c}
                testID={`chip-${c}`}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => {
                  console.log('[NewListing] category selected', c);
                  setForm(s => ({ ...s, category: c, attributes: {} }));
                }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
                {active && <RequiredBadge />}
              </TouchableOpacity>
            );
          })}
        </View>

        {form.category ? (
          <>
            <Text style={styles.sectionTitle}>Details</Text>
            {dynamicFields.map(renderDynamicField)}
            {requiredDynamicMissing && (
              <Text style={styles.validationText}>Fill all required fields marked with *</Text>
            )}
          </>
        ) : (
          <Text style={styles.helperText}>Pick a category to see relevant fields.</Text>
        )}

        <Text style={styles.sectionTitle}>Description</Text>
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

        <Text style={styles.sectionTitle}>Pricing</Text>
        <View style={styles.row}>
          <View style={[styles.rowItem, { marginRight: 8 }]}> 
            <DollarSign size={18} color="#FF6B35" />
            <TextInput
              testID="daily-rate-input"
              style={styles.input}
              placeholder="Daily rate *"
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

        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.inputRow}>
          <MapPin size={18} color="#FF6B35" />
          <TextInput
            testID="location-input"
            style={styles.input}
            placeholder="Pickup location (City, Area) *"
            placeholderTextColor="#8E8E93"
            value={form.location}
            onChangeText={(t: string) => setForm(s => ({ ...s, location: t }))}
          />
        </View>

        <Text style={styles.sectionTitle}>Availability</Text>
        <View style={styles.row}>
          <View style={[styles.rowItem, { marginRight: 8 }]}> 
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
          <View style={[styles.rowItem, { marginLeft: 8 }]}> 
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

      <Modal visible={!!(selectModal?.visible && selectModal.field)} transparent animationType="fade" onRequestClose={closeSelect}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectModal?.field?.label}</Text>
            <View style={styles.inputRow}>
              <Tag size={18} color="#FF6B35" />
              <TextInput
                testID="select-filter"
                style={styles.input}
                placeholder="Search options"
                placeholderTextColor="#8E8E93"
                value={activeSelectFilter}
                onChangeText={setActiveSelectFilter}
              />
            </View>
            <FlatList
              testID="select-options"
              data={currentOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.optionItem} onPress={() => onSelectOption(item)}>
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.helperText}>No options</Text>}
              style={{ maxHeight: 300 }}
            />
            <TouchableOpacity style={styles.modalClose} onPress={closeSelect}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27' },
  content: { padding: 20 },
  header: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1C1C2E', padding: 12, borderRadius: 12, marginBottom: 12 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 16 },
  inputLabel: { color: '#8E8E93', fontSize: 12, marginBottom: 2 },
  selectText: { color: '#FFFFFF', fontSize: 16 },
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
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#1C1C2E', borderWidth: 1, borderColor: '#2A2A3B', flexDirection: 'row', alignItems: 'center', gap: 8 },
  chipActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  chipText: { color: '#8E8E93', fontWeight: '600' },
  chipTextActive: { color: '#0A0E27' },
  requiredBadge: { backgroundColor: '#0A0E27', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  requiredBadgeText: { color: '#FFD7CC', fontSize: 10, fontWeight: '700' },
  submitBtn: { marginTop: 16, backgroundColor: '#FF6B35', padding: 16, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#0A0E27', fontWeight: 'bold', fontSize: 16 },
  helperText: { color: '#8E8E93', marginBottom: 12 },
  validationText: { color: '#FFB4A2', marginTop: 4 },
  disabled: { opacity: 0.6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { width: '100%', backgroundColor: '#12142A', borderRadius: 16, padding: 16, maxWidth: 520 },
  modalTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  optionItem: { paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#2A2A3B' },
  optionText: { color: '#FFFFFF', fontSize: 16 },
  modalClose: { marginTop: 12, alignSelf: 'flex-end', backgroundColor: '#FF6B35', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  modalCloseText: { color: '#0A0E27', fontWeight: '700' },
});
