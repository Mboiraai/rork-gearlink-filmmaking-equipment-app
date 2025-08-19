import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  MapPin,
  Star,
  Calendar,
  MessageCircle,
  Phone,
  Shield,
  ChevronLeft,
} from "lucide-react-native";
import { equipmentData } from "@/mocks/equipment";
import { reviewsMock } from "@/mocks/reviews";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";
import type { Review } from "@/types/review";
import { useLocation } from "@/providers/LocationProvider";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");

export default function EquipmentDetailScreen() {
  const { id } = useLocalSearchParams();
  const { currency } = useLocation();
  const equipment = useMemo(() => equipmentData.find(item => String(item.id) === String(id)), [id]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [reviews, setReviews] = useState<Review[]>(() => reviewsMock.filter(r => r.equipmentId === String(id)));

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return equipment?.rating ?? 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating ?? 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews, equipment]);
  
  if (!equipment) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Equipment not found</Text>
      </View>
    );
  }

  const images = [equipment.image, ...equipment.additionalImages];

  const handleContact = (method: 'chat' | 'whatsapp') => {
    if (method === 'chat') {
      router.push(`/chat/${equipment.ownerId}` as any);
    } else {
      // Handle WhatsApp contact
      console.log('Opening WhatsApp...');
    }
  };

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      onPress={() => setSelectedImageIndex(index)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item }} style={styles.thumbnailImage} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: images[selectedImageIndex] }} style={styles.mainImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)']}
            style={styles.imageOverlay}
          />
          <SafeAreaView edges={['top']} style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <FlatList
          data={images}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailList}
        />

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{equipment.name}</Text>
            <Text style={styles.category}>{equipment.category}</Text>
            
            <View style={styles.metaInfo}>
              <View style={styles.ratingContainer}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={styles.rating}>{averageRating}</Text>
                <Text style={styles.reviews}>({reviews.length} reviews)</Text>
              </View>
              <View style={styles.locationContainer}>
                <MapPin size={16} color="#FF6B35" />
                <Text style={styles.location}>{equipment.location}</Text>
              </View>
            </View>
          </View>

          <View style={styles.priceSection}>
            <View>
              <Text style={styles.priceLabel}>Daily Rate</Text>
              <Text style={styles.price}>{currency} {equipment.dailyRate}</Text>
            </View>
            <View>
              <Text style={styles.priceLabel}>Weekly Rate</Text>
              <Text style={styles.price}>{currency} {equipment.weeklyRate}</Text>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{equipment.description}</Text>
          </View>

          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <ReviewList reviews={reviews} />
          </View>

          <View style={styles.writeReviewSection}>
            <ReviewForm equipmentId={String(equipment.id)} onSubmit={(rev) => {
              console.log('[EquipmentDetail] new review', rev);
              setReviews((prev) => [rev, ...prev]);
            }} />
          </View>

          <View style={styles.specsSection}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            {equipment.specifications.map((spec, index) => (
              <View key={index} style={styles.specItem}>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.ownerSection}>
            <Text style={styles.sectionTitle}>Owner</Text>
            <TouchableOpacity
              style={styles.ownerCard}
              onPress={() => router.push(`/profile/${equipment.ownerId}` as any)}
            >
              <Image source={{ uri: equipment.ownerAvatar }} style={styles.ownerAvatar} />
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerName}>{equipment.ownerName}</Text>
                <View style={styles.ownerMeta}>
                  <Shield size={14} color="#4CAF50" />
                  <Text style={styles.verifiedText}>Verified</Text>
                  <Text style={styles.dot}>•</Text>
                  <Star size={14} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.ownerRating}>{equipment.ownerRating}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.availabilitySection}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <Text style={styles.availabilityText}>{equipment.availability}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => handleContact('chat')}
        >
          <MessageCircle size={20} color="#FFFFFF" />
          <Text style={styles.contactButtonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactButton, styles.whatsappButton]}
          onPress={() => handleContact('whatsapp')}
        >
          <Phone size={20} color="#FFFFFF" />
          <Text style={styles.contactButtonText}>WhatsApp</Text>
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
  imageContainer: {
    height: 400,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  headerButtons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailList: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  reviews: {
    fontSize: 14,
    color: '#8E8E93',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  priceSection: {
    flexDirection: 'row',
    gap: 40,
    backgroundColor: '#1C1C2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 22,
  },
  reviewsSection: {
    marginBottom: 16,
  },
  writeReviewSection: {
    marginBottom: 20,
    backgroundColor: '#0A0E27',
  },
  specsSection: {
    marginBottom: 20,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C2E',
  },
  specLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  specValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  ownerSection: {
    marginBottom: 20,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C2E',
    padding: 12,
    borderRadius: 12,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ownerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  dot: {
    color: '#8E8E93',
  },
  ownerRating: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  availabilitySection: {
    marginBottom: 100,
  },
  availabilityText: {
    fontSize: 14,
    color: '#E0E0E0',
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
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 50,
  },
});