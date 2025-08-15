import React, { useMemo, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, Star, DollarSign } from "lucide-react-native";
import { router } from "expo-router";
import { useLocation } from "@/providers/LocationProvider";
import { equipmentData } from "@/mocks/equipment";
import { useSupabase } from "@/providers/SupabaseProvider";
import type { EquipmentItem } from "@/types/equipment";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.7;
const CARD_SPACING = 16;

export default function HomeScreen() {
  const { currency } = useLocation();
  const { enabled, equipment } = useSupabase();
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const source: EquipmentItem[] = enabled && equipment.length > 0 ? equipment : (equipmentData as unknown as EquipmentItem[]);

  const featuredEquipment = useMemo(() => source.filter(item => item.featured), [source]);
  const popularEquipment = useMemo(() => source.filter(item => (item.rating ?? 0) >= 4.5), [source]);
  const nearbyEquipment = useMemo(() => source.slice(0, 8), [source]);
  const newListings = useMemo(() => source.slice(-6).reverse(), [source]);

  const renderEquipmentCard = ({ item }: { item: EquipmentItem }) => (
    <TouchableOpacity
      testID="equipment-card"
      style={styles.card}
      onPress={() => router.push(`/equipment/${item.id}` as any)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardCategory}>{item.category}</Text>
          <View style={styles.cardFooter}>
            <View style={styles.priceContainer}>
              <DollarSign size={14} color="#FF6B35" />
              <Text style={styles.cardPrice}>{currency} {item.dailyRate}/day</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.cardRating}>{item.rating}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderSection = (title: string, data: EquipmentItem[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        testID={`section-${title}`}
        data={data}
        renderItem={renderEquipmentCard}
        keyExtractor={(item) => `${title}-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
      />
    </View>
  );

  const renderHeroCard = () => (
    <TouchableOpacity 
      testID="hero-card"
      style={styles.heroContainer}
      onPress={() => router.push(`/equipment/${featuredEquipment[0]?.id}` as any)}
      activeOpacity={0.95}
    >
      <Image 
        source={{ uri: featuredEquipment[0]?.image ?? '' }} 
        style={styles.heroImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.heroGradient}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTag}>FEATURED</Text>
          <Text style={styles.heroTitle}>{featuredEquipment[0]?.name}</Text>
          <Text style={styles.heroDescription} numberOfLines={2}>
            {featuredEquipment[0]?.description}
          </Text>
          <View style={styles.heroFooter}>
            <View style={styles.heroLocation}>
              <MapPin size={16} color="#FF6B35" />
              <Text style={styles.heroLocationText}>{featuredEquipment[0]?.location}</Text>
            </View>
            <TouchableOpacity style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Rent Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['#0A0E27', 'rgba(10, 14, 39, 0.95)']}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>GearLink</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>GearLink</Text>
            <Text style={styles.tagline}>Professional Film Equipment Rental</Text>
          </View>
        </SafeAreaView>

        {featuredEquipment.length > 0 && renderHeroCard()}
        
        {renderSection("Popular Gear", popularEquipment)}
        {renderSection("Nearby Equipment", nearbyEquipment)}
        {renderSection("New Listings", newListings)}
        
        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  logoContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tagline: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  heroContainer: {
    height: 400,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  heroContent: {
    gap: 8,
  },
  heroTag: {
    color: '#FF6B35',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  heroDescription: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  heroLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroLocationText: {
    color: '#E0E0E0',
    fontSize: 14,
  },
  heroButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: CARD_SPACING,
  },
  card: {
    width: CARD_WIDTH,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1C1C2E',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  cardContent: {
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardCategory: {
    fontSize: 12,
    color: '#8E8E93',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardPrice: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardRating: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 20,
  },
});