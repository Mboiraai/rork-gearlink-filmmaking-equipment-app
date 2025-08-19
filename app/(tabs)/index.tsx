import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Easing,
  Pressable,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, Star, DollarSign, Heart } from "lucide-react-native";
import { router } from "expo-router";
import { useLocation } from "@/providers/LocationProvider";
import { equipmentData } from "@/mocks/equipment";

import type { EquipmentItem } from "@/types/equipment";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.7;
const CARD_SPACING = 16;

type Category = { key: string; title: string; image: string };

const CATEGORIES: Category[] = [
  { key: "Camera", title: "Cameras", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop" },
  { key: "Lens", title: "Lenses", image: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?q=80&w=1200&auto=format&fit=crop" },
  { key: "Lighting", title: "Lighting", image: "https://images.unsplash.com/photo-1517817748490-58f3e5d0a9f1?q=80&w=1200&auto=format&fit=crop" },
  { key: "Audio", title: "Audio", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop" },
  { key: "Stabilizer", title: "Stabilizers", image: "https://images.unsplash.com/photo-1597687223078-41b1d41a4756?q=80&w=1200&auto=format&fit=crop" },
  { key: "Drone", title: "Drones", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop" },
];

export default function HomeScreen() {
  const { currency } = useLocation();

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const headerShrink = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0.92],
    extrapolate: "clamp",
  });

  const heroAppear = useRef(new Animated.Value(0)).current;
  const searchFocusAnim = useRef(new Animated.Value(0)).current;
  const typingDot1 = useRef(new Animated.Value(0)).current;
  const typingDot2 = useRef(new Animated.Value(0)).current;
  const typingDot3 = useRef(new Animated.Value(0)).current;

  const source: EquipmentItem[] = equipmentData as unknown as EquipmentItem[];

  const featuredEquipment = useMemo(() => source.filter((item) => item.featured), [source]);
  const popularEquipment = useMemo(() => source.filter((item) => (item.rating ?? 0) >= 4.5), [source]);
  const nearbyEquipment = useMemo(() => source.slice(0, 8), [source]);
  const newListings = useMemo(() => source.slice(-6).reverse(), [source]);

  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const EquipmentCard = React.memo(({ item, index }: { item: EquipmentItem; index: number }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const favScale = useRef(new Animated.Value(1)).current;
    const appear = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(appear, {
        toValue: 1,
        duration: 450,
        delay: index * 60,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, [appear, index]);

    const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
    const onPressOut = () => Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();

    const onToggleFav = () => {
      Animated.sequence([
        Animated.spring(favScale, { toValue: 1.3, useNativeDriver: true }),
        Animated.spring(favScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
      toggleFavorite(String(item.id));
    };

    const isFav = favorites.has(String(item.id));

    return (
      <Animated.View
        style={{
          transform: [
            { scale },
            { translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
          ],
          opacity: appear,
        }}
      >
        <Pressable
          testID="equipment-card"
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={() => router.push(`/equipment/${item.id}` as any)}
          style={styles.card}
        >
          <Image source={{ uri: item.image }} style={styles.cardImage} />
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.cardGradient}>
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
          <Animated.View style={[styles.heartButton, { transform: [{ scale: favScale }] }]} pointerEvents="box-none">
            <Pressable onPress={onToggleFav} accessibilityRole="button" testID="favorite-toggle">
              <Heart size={20} color={isFav ? '#FF6B35' : '#FFFFFF'} fill={isFav ? '#FF6B35' : 'transparent'} />
            </Pressable>
          </Animated.View>
        </Pressable>
      </Animated.View>
    );
  });

  const renderSection = (title: string, data: EquipmentItem[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        testID={`section-${title}`}
        data={data}
        renderItem={({ item, index }) => (
          <EquipmentCard item={item} index={typeof index === 'number' ? index : 0} />
        )}
        keyExtractor={(item) => `${title}-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
      />
    </View>
  );

  const heroParallax = scrollY.interpolate({
    inputRange: [-100, 0, 300],
    outputRange: [-20, 0, 60],
    extrapolate: "clamp",
  });

  useEffect(() => {
    Animated.timing(heroAppear, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [heroAppear]);

  const FeaturedCarousel = React.memo(({ items }: { items: EquipmentItem[] }) => {
    const listRef = useRef<FlatList<EquipmentItem> | null>(null);
    const indexRef = useRef<number>(0);
    const ITEM_WIDTH = screenWidth;

    useEffect(() => {
      if (!items || items.length === 0) return;
      const id = setInterval(() => {
        indexRef.current = (indexRef.current + 1) % items.length;
        const nextIndex = indexRef.current;
        console.log('Carousel auto-scroll to index', nextIndex);
        listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      }, 3500);
      return () => clearInterval(id);
    }, [items]);

    if (!items || items.length === 0) return null;

    const renderItem = ({ item }: { item: EquipmentItem }) => (
      <View style={{ width: ITEM_WIDTH }}>
        <Pressable testID="hero-card" onPress={() => router.push(`/equipment/${item.id}` as any)} style={styles.heroContainer}>
          <Animated.Image source={{ uri: item.image }} style={[styles.heroImage, { transform: [{ translateY: heroParallax }] }]} />
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.9)"]} style={styles.heroGradient}>
            <Animated.View
              style={[
                styles.heroContent,
                {
                  opacity: heroAppear,
                  transform: [{ translateY: heroAppear.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
                },
              ]}
            >
              <Text style={styles.heroTag}>FEATURED</Text>
              <Text style={styles.heroTitle}>{item.name}</Text>
              <Text style={styles.heroDescription} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.heroFooter}>
                <View style={styles.heroLocation}>
                  <MapPin size={16} color="#FF6B35" />
                  <Text style={styles.heroLocationText}>{item.location}</Text>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.heroButton, pressed && { opacity: 0.9 }]}
                  onPress={() => router.push(`/equipment/${item.id}` as any)}
                  accessibilityRole="button"
                  testID="rent-now-button"
                >
                  <Text style={styles.heroButtonText}>Rent Now</Text>
                </Pressable>
              </View>
            </Animated.View>
          </LinearGradient>
        </Pressable>
      </View>
    );

    return (
      <Animated.View style={{ opacity: heroAppear }}>
        <FlatList
          ref={listRef as any}
          data={items}
          keyExtractor={(it) => `featured-${it.id}`}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          getItemLayout={(_, index) => ({ length: ITEM_WIDTH, offset: ITEM_WIDTH * index, index })}
          initialScrollIndex={0}
          onScrollToIndexFailed={(info) => {
            console.log('onScrollToIndexFailed', info);
            try {
              listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
            } catch (e) {
              console.log('fallback scrollToOffset failed', e);
            }
          }}
        />
      </Animated.View>
    );
  });

  const [query, setQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.trim().length > 0 || isFocused) setIsSearching(true);
      else setIsSearching(false);
    }, 250);
    return () => clearTimeout(handler);
  }, [query, isFocused]);

  useEffect(() => {
    if (isSearching) {
      const a1 = Animated.loop(
        Animated.sequence([
          Animated.timing(typingDot1, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(typingDot1, { toValue: 0.2, duration: 300, useNativeDriver: true }),
        ])
      );
      a1.start();
      const a2Timeout = setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(typingDot2, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(typingDot2, { toValue: 0.2, duration: 300, useNativeDriver: true }),
          ])
        ).start();
      }, 150);
      const a3Timeout = setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(typingDot3, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(typingDot3, { toValue: 0.2, duration: 300, useNativeDriver: true }),
          ])
        ).start();
      }, 300);
      return () => {
        try {
          (a1 as any)?.stop?.();
        } catch {}
        clearTimeout(a2Timeout);
        clearTimeout(a3Timeout);
      };
    }
    return () => undefined;
  }, [isSearching, typingDot1, typingDot2, typingDot3]);

  const onFocusSearch = () => {
    setIsFocused(true);
    Animated.timing(searchFocusAnim, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  };
  const onBlurSearch = () => {
    setIsFocused(false);
    Animated.timing(searchFocusAnim, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  };

  const searchPadding = searchFocusAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 16] });
  const searchBorder = searchFocusAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ scale: headerShrink }] }]} pointerEvents="none">
        <LinearGradient colors={["#0A0E27", "rgba(10, 14, 39, 0.95)"]} style={styles.headerGradient}>
          <Text style={styles.headerTitle}>GearLink</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>GearLink</Text>
            <Text style={styles.tagline}>Professional Film Equipment Rental</Text>
            <Animated.View style={[styles.searchBar, { paddingHorizontal: searchPadding, borderWidth: searchBorder }]} testID="home-search-bar">
              <TextInput
                testID="search-input"
                style={styles.searchInput as any}
                placeholder="Search cameras, lenses, lighting…"
                placeholderTextColor="#6B6F8A"
                value={query}
                onChangeText={(t: string) => setQuery(t)}
                onFocus={onFocusSearch}
                onBlur={onBlurSearch}
                returnKeyType="search"
              />
              {isSearching && (
                <View style={styles.typingDots}>
                  <Animated.View style={[styles.dot, { opacity: typingDot1 }]} />
                  <Animated.View style={[styles.dot, { opacity: typingDot2 }]} />
                  <Animated.View style={[styles.dot, { opacity: typingDot3 }]} />
                </View>
              )}
            </Animated.View>
          </View>
        </SafeAreaView>

        <FeaturedCarousel items={featuredEquipment} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={CATEGORIES}
            keyExtractor={(c) => c.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => <CategoryCard item={item} />}
          />
        </View>

        {renderSection("Popular Gear", popularEquipment)}
        {renderSection("Nearby Equipment", nearbyEquipment)}
        {renderSection("New Listings", newListings)}

        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </View>
  );
}

const CategoryCard = React.memo(({ item }: { item: Category }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.categoryCard}
        testID={`category-${item.key}`}
        accessibilityRole="button"
        onPress={() => {
          console.log('Category pressed', item.key, item.title);
          router.push(`/search?category=${encodeURIComponent(item.title)}` as any);
        }}
      >
        <Image source={{ uri: item.image }} style={styles.categoryImage} />
        <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]} style={styles.categoryGradient}>
          <Text style={styles.categoryTitle}>{item.title}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E27",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 0,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: "transparent",
  },
  logoContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  tagline: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
  },
  heroContainer: {
    height: 400,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "60%",
    justifyContent: "flex-end",
    padding: 20,
  },
  heroContent: {
    gap: 8,
  },
  heroTag: {
    color: "#FF6B35",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  heroDescription: {
    fontSize: 14,
    color: "#E0E0E0",
    lineHeight: 20,
  },
  heroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  heroLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroLocationText: {
    color: "#E0E0E0",
    fontSize: 14,
  },
  heroButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  heroButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
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
    overflow: "hidden",
    backgroundColor: "#1C1C2E",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
    justifyContent: "flex-end",
    padding: 12,
  },
  cardContent: {
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  cardCategory: {
    fontSize: 12,
    color: "#8E8E93",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardPrice: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardRating: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  heartButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 8,
    borderRadius: 999,
  },
  searchBar: {
    marginTop: 14,
    width: "100%",
    backgroundColor: "#14172F",
    borderColor: "#273079",
    borderRadius: 12,
    height: 46,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  searchInput: {
    flex: 1,
    color: "#E0E0E0",
    fontSize: 14,
  },
  typingDots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF6B35",
  },
  categoryCard: {
    width: 140,
    height: 90,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1C1C2E",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 8,
  },
  categoryTitle: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  bottomSpacing: {
    height: 20,
  },
});
