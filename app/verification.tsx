import React, { useCallback, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router } from "expo-router";
import {
  Upload,
  User,
  CreditCard,
  Home,
  Check,
  AlertCircle,
} from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';
import { useUser } from "@/providers/UserProvider";
import { getSupabaseEnv } from "@/constants/supabaseConfig";
import { getAccessToken } from "@/lib/supabaseRest";

interface VerificationStep {
  id: 'id' | 'kin' | 'address';
  title: string;
  description: string;
  icon: any;
  completed: boolean;
}

interface PickedFile {
  uri: string;
  name: string;
  type: string;
}

export default function VerificationScreen() {
  const { setVerified, user } = useUser();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [steps, setSteps] = useState<VerificationStep[]>([
    {
      id: 'id',
      title: 'National ID / Passport',
      description: 'Upload a clear photo of your ID',
      icon: CreditCard,
      completed: false,
    },
    {
      id: 'kin',
      title: 'Next of Kin Details',
      description: 'Provide emergency contact information',
      icon: User,
      completed: false,
    },
    {
      id: 'address',
      title: 'Proof of Address',
      description: 'Upload utility bill or bank statement',
      icon: Home,
      completed: false,
    },
  ]);

  const [kinDetails, setKinDetails] = useState<{ name: string; relationship: string; phone: string; idNumber: string; }>({
    name: '',
    relationship: '',
    phone: '',
    idNumber: '',
  });
  const [idFile, setIdFile] = useState<PickedFile | null>(null);
  const [addressFile, setAddressFile] = useState<PickedFile | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const canContinue = useMemo(() => {
    if (steps[currentStep]?.id === 'id') return !!idFile;
    if (steps[currentStep]?.id === 'kin') return kinDetails.name.trim().length > 0 && kinDetails.relationship.trim().length > 0 && kinDetails.phone.trim().length > 0 && kinDetails.idNumber.trim().length > 0;
    if (steps[currentStep]?.id === 'address') return !!addressFile;
    return false;
  }, [steps, currentStep, idFile, addressFile, kinDetails]);

  const pickImage = useCallback(async (target: 'id' | 'address') => {
    try {
      console.log('[Verification] pickImage start', target);
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission required', 'Please grant access to your photo library to upload documents.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.9,
      });
      if (result.canceled) {
        console.log('[Verification] image selection canceled');
        return;
      }
      const asset = result.assets[0];
      const name = asset.fileName ?? `${target}-${Date.now()}.jpg`;
      const type = asset.mimeType ?? 'image/jpeg';
      const file: PickedFile = { uri: asset.uri, name, type };
      if (target === 'id') setIdFile(file); else setAddressFile(file);
    } catch (e) {
      console.error('[Verification] pickImage error', e);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  }, []);

  const uploadToSupabase = useCallback(async (file: PickedFile, pathPrefix: string): Promise<string> => {
    const env = getSupabaseEnv();
    if (!env) {
      throw new Error('Storage not configured');
    }
    const bucket = 'verifications';
    const objectPath = `${pathPrefix}/${user?.id ?? 'anonymous'}/${Date.now()}-${file.name}`;
    const url = `${env.url}/storage/v1/object/${bucket}/${encodeURI(objectPath)}`;
    console.log('[Verification] uploadToSupabase', url);

    const res = await fetch(file.uri);
    const blob = await res.blob();

    const bearer = (await getAccessToken()) ?? env.anonKey;

    const uploadRes = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: env.anonKey,
        Authorization: `Bearer ${bearer}`,
        'Content-Type': file.type || blob.type || 'application/octet-stream',
      },
      body: blob,
    });
    if (!uploadRes.ok) {
      const text = await uploadRes.text();
      console.error('[Verification] upload error', uploadRes.status, text);
      throw new Error(text || 'Upload failed');
    }
    const publicUrl = `${env.url}/storage/v1/object/public/${bucket}/${encodeURI(objectPath)}`;
    return publicUrl;
  }, [user]);

  const handleStepComplete = useCallback(async () => {
    try {
      if (!canContinue) {
        Alert.alert('Incomplete', 'Please complete this step before continuing.');
        return;
      }
      const updatedSteps = [...steps];
      updatedSteps[currentStep].completed = true;
      setSteps(updatedSteps);

      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        await handleSubmit();
      }
    } catch (e) {
      console.error('[Verification] handleStepComplete error', e);
      Alert.alert('Error', e instanceof Error ? e.message : 'Something went wrong.');
    }
  }, [canContinue, steps, currentStep]);

  const handleSubmit = useCallback(async () => {
    try {
      setSubmitting(true);
      const env = getSupabaseEnv();
      let idUrl: string | null = null;
      let addressUrl: string | null = null;

      if (idFile && env) {
        idUrl = await uploadToSupabase(idFile, 'id');
      }
      if (addressFile && env) {
        addressUrl = await uploadToSupabase(addressFile, 'address');
      }

      Alert.alert(
        'Verification Submitted',
        'Your documents have been submitted for review. You will be notified once approved.',
        [
          {
            text: 'OK',
            onPress: () => {
              void setVerified(true);
              router.back();
            },
          },
        ]
      );
      console.log('[Verification] submitted payload', {
        idUrl,
        addressUrl,
        kinDetails,
        platform: Platform.OS,
      });
    } catch (e) {
      console.error('[Verification] submit error', e);
      Alert.alert('Submit failed', e instanceof Error ? e.message : 'Could not submit verification.');
    } finally {
      setSubmitting(false);
    }
  }, [idFile, addressFile, kinDetails, uploadToSupabase, setVerified]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <TouchableOpacity
              style={styles.uploadBox}
              testID="upload-id"
              onPress={() => pickImage('id')}
              disabled={submitting}
            >
              {idFile ? (
                <>
                  <Image source={{ uri: idFile.uri }} style={styles.preview} />
                  <Text style={styles.uploadText}>{idFile.name}</Text>
                </>
              ) : (
                <>
                  <Upload size={48} color="#FF6B35" />
                  <Text style={styles.uploadText}>Tap to upload ID</Text>
                  <Text style={styles.uploadSubtext}>JPG or PNG (Max ~5MB)</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContent}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#8E8E93"
              value={kinDetails.name}
              onChangeText={(text) => setKinDetails({ ...kinDetails, name: text })}
              testID="kin-name"
            />
            <TextInput
              style={styles.input}
              placeholder="Relationship"
              placeholderTextColor="#8E8E93"
              value={kinDetails.relationship}
              onChangeText={(text) => setKinDetails({ ...kinDetails, relationship: text })}
              testID="kin-relationship"
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#8E8E93"
              value={kinDetails.phone}
              onChangeText={(text) => setKinDetails({ ...kinDetails, phone: text })}
              keyboardType="phone-pad"
              testID="kin-phone"
            />
            <TextInput
              style={styles.input}
              placeholder="ID Number"
              placeholderTextColor="#8E8E93"
              value={kinDetails.idNumber}
              onChangeText={(text) => setKinDetails({ ...kinDetails, idNumber: text })}
              testID="kin-id-number"
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <TouchableOpacity
              style={styles.uploadBox}
              testID="upload-address"
              onPress={() => pickImage('address')}
              disabled={submitting}
            >
              {addressFile ? (
                <>
                  <Image source={{ uri: addressFile.uri }} style={styles.preview} />
                  <Text style={styles.uploadText}>{addressFile.name}</Text>
                </>
              ) : (
                <>
                  <Upload size={48} color="#FF6B35" />
                  <Text style={styles.uploadText}>Tap to upload proof of address</Text>
                  <Text style={styles.uploadSubtext}>Utility bill or bank statement (image)</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Account Verification</Text>
          <Text style={styles.subtitle}>
            Complete these steps to start renting equipment
          </Text>
        </View>

        <View style={styles.progressContainer}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <View key={step.id} style={styles.progressItem}>
                <View style={[
                  styles.progressCircle,
                  step.completed && styles.progressCircleCompleted,
                  index === currentStep && styles.progressCircleActive,
                ]}>
                  {step.completed ? (
                    <Check size={20} color="#FFFFFF" />
                  ) : (
                    <Icon size={20} color={index === currentStep ? '#FF6B35' : '#8E8E93'} />
                  )}
                </View>
                {index < steps.length - 1 && (
                  <View style={[
                    styles.progressLine,
                    step.completed && styles.progressLineCompleted,
                  ]} />
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.currentStepInfo}>
          <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
          <Text style={styles.stepDescription}>{steps[currentStep].description}</Text>
        </View>

        {renderStepContent()}

        <View style={styles.infoBox}>
          <AlertCircle size={20} color="#FF6B35" />
          <Text style={styles.infoText}>
            Your information is encrypted and will only be used for verification purposes
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.back()}
          testID="skip-button"
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, !canContinue && { opacity: 0.6 }]}
          onPress={handleStepComplete}
          disabled={!canContinue || submitting}
          testID="continue-button"
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>
              {currentStep === steps.length - 1 ? 'Submit' : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginVertical: 32,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleActive: {
    backgroundColor: '#FF6B35',
  },
  progressCircleCompleted: {
    backgroundColor: '#4CAF50',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#1C1C2E',
    marginHorizontal: 8,
  },
  progressLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  currentStepInfo: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  stepContent: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  uploadBox: {
    backgroundColor: '#1C1C2E',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
    padding: 40,
    alignItems: 'center',
  },
  preview: {
    width: 160,
    height: 100,
    borderRadius: 8,
  },
  uploadText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 8,
  },
  input: {
    backgroundColor: '#1C1C2E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 100,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#FF6B35',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#0A0E27',
    borderTopWidth: 1,
    borderTopColor: '#1C1C2E',
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B35',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});