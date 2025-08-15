import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Star, MapPin, Shield, MessageCircle, Package } from "lucide-react-native";
import { equipmentData } from "@/mocks/equipment";

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams();
  
  // Mock user data
  const user = {
    id: userId,
    name: 'Alex Johnson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rating: 4.8,
    reviews: 127,
    verified: true,
    location: 'Kampala, Uganda',
    memberSince: 'March 2023',
    bio: 'Professional cinematographer with 10+ years of experience. I take great care of my equipment and expect the same from renters.',
    responseTime: '< 1 hour',
    responseRate: '98%',
  };

  const userEquipment = equipmentData.filter(item => item.ownerId === userId);

  const renderEquipmentItem = ({ item }: { item: typeof equipmentData[0] }) => (
    <TouchableOpacity
      style={styles.equipmentCard}
      onPress={() => router.push(`/equipment/${item.id}` as any)}
    >
      <Image source={{ uri: item.image }} style={styles.equipmentImage} />
      <Text style={styles.equipmentName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.equipmentPrice}>${item.dailyRate}/day</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        
        <View style={styles.badges}>
          {user.verified && (
            <View style={styles.verifiedBadge}>
              <Shield size={16} color="#4CAF50" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
          <View style={styles.locationBadge}>
            <MapPin size={16} color="#FF6B35" />
            <Text style={styles.locationText}>{user.location}</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <View style={styles.statValue}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.statNumber}>{user.rating}</Text>
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.reviews}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userEquipment.length}</Text>
            <Text style={styles.statLabel}>Listings</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bio}>{user.bio}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Member since</Text>
          <Text style={styles.infoValue}>{user.memberSince}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Response time</Text>
          <Text style={styles.infoValue}>{user.responseTime}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Response rate</Text>
          <Text style={styles.infoValue}>{user.responseRate}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Equipment ({userEquipment.length})</Text>
        <FlatList
          data={userEquipment}
          renderItem={renderEquipmentItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.equipmentList}
        />
      </View>

      <TouchableOpacity
        style={styles.contactButton}
        onPress={() => router.push(`/chat/${userId}` as any)}
      >
        <MessageCircle size={20} color="#FFFFFF" />
        <Text style={styles.contactButtonText}>Contact {user.name}</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C2E',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  locationText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#1C1C2E',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C2E',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  bio: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 22,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  equipmentList: {
    gap: 12,
  },
  equipmentCard: {
    width: 150,
    marginRight: 12,
  },
  equipmentImage: {
    width: 150,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  equipmentPrice: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B35',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 20,
  },
});