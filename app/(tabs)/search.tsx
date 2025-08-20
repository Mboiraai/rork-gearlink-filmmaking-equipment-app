import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { Search as SearchIcon, X, MapPin, Star } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { equipmentData } from "@/mocks/equipment";
import type { EquipmentItem } from "@/types/equipment";
import { geminiRankEquipment } from "@/lib/gemini";
import { useLocation } from "@/providers/LocationProvider";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth } = Dimensions.get("window");
const TILE_SIZE = (screenWidth - 60) / 2;

interface CategoryTile {
  id: string;
  name: string;
  image: string;
  gradient: string[];
  count: number;
}

const categoryTiles: CategoryTile[] = [
  {
    id: "cameras",
    name: "Cameras & Support",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
    gradient: ["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"] as string[],
    count: 156,
  },
  {
    id: "lenses",
    name: "Lenses & Accessories",
    image: "https://images.unsplash.com/photo-1519183071298-a2962be96f83?w=800",
    gradient: ["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"] as string[],
    count: 243,
  },
  {
    id: "lighting",
    name: "Lighting & Grip",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
    gradient: ["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"] as string[],
    count: 189,
  },
  {
    id: "audio",
    name: "Audio & Sound",
    image: "https://images.unsplash.com/photo-1512173141860-5a9ec2fbe33e?w=800",
    gradient: ["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"] as string[],
    count: 97,
  },
  {
    id: "drones",
    name: "Drones & Aerial",
    image: "https://images.unsplash.com/photo-1473187983305-f615310e7daa?w=800&auto=format",
    gradient: ["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"] as string[],
    count: 64,
  },
  {
    id: "monitors",
    name: "Monitors & Assist",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
    gradient: ["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"] as string[],
    count: 82,
  },
  {
    id: "power",
    name: "Power & Batteries",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
    gradient: ["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"] as string[],
    count: 134,
  },
  {
    id: "storage",
    name: "Data & Storage",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
    gradient: ["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"] as string[],
    count: 76,
  },
  {
    id: "effects",
    name: "Special Effects",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    gradient: ["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"] as string[],
    count: 45,
  },
  {
    id: "transport",
    name: "Transport & Safety",
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
    gradient: ["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"] as string[],
    count: 58,
  },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { currency } = useLocation();
  const params = useLocalSearchParams();
  const initialCategory = typeof params.category === 'string' ? params.category : null;

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const [rankedIds, setRankedIds] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string>("");
  const filteredEquipment = useMemo(() => {
    let filtered: EquipmentItem[] = equipmentData as unknown as EquipmentItem[];

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((item) =>
        item.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (rankedIds.length > 0 && searchQuery.trim().length > 0) {
      const order = new Map(rankedIds.map((id, idx) => [id, idx] as const));
      filtered = filtered
        .slice()
        .sort((a, b) => (order.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.id) ?? Number.MAX_SAFE_INTEGER));
    }

    return filtered;
  }, [searchQuery, selectedCategory, rankedIds]);

  const renderEquipmentItem = ({ item }: { item: typeof equipmentData[0] }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => router.push(`/equipment/${item.id}` as any)}
      activeOpacity={0.8}
      testID={`search-item-${item.id}`}
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemContent}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
        <View style={styles.itemDetails}>
          <View style={styles.locationContainer}>
            <MapPin size={12} color="#8E8E93" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Star size={12} color="#FFD700" fill="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        <Text style={styles.itemPrice}>{currency} {item.dailyRate}/day</Text>
      </View>
    </TouchableOpacity>
  );

  const showGrid = !searchQuery && !selectedCategory;

  const runAIRanking = useCallback(async (q: string) => {
    try {
      setAiError("");
      if (q.trim().length < 2) {
        setRankedIds([]);
        return;
      }
      const results = await geminiRankEquipment(q, equipmentData as unknown as EquipmentItem[]);
      setRankedIds(results.map((r) => r.id));
    } catch (e: unknown) {
      console.log('[Search] AI ranking error', e);
      setAiError('AI ranking unavailable');
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      void runAIRanking(searchQuery);
    }, 300);
    return () => clearTimeout(id);
  }, [searchQuery, runAIRanking]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search equipment..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            testID="search-input"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} testID="search-clear">
              <X size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {aiError ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          <Text style={{ color: '#FFB4A2', fontSize: 12 }}>{aiError}</Text>
        </View>
      ) : null}

      {showGrid ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Equipment Categories</Text>
            <Text style={styles.subtitle}>Browse by equipment type</Text>
          </View>

          <View style={styles.grid}>
            {categoryTiles.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.tileContainer}
                onPress={() => setSelectedCategory(category.name)}
                activeOpacity={0.9}
                testID={`category-${category.id}`}
              >
                <View style={styles.tile}>
                  <Image source={{ uri: category.image }} style={styles.tileImage} />
                  <LinearGradient
                    colors={category.gradient as [string, string, ...string[]]}
                    style={styles.tileOverlay}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <View style={styles.tileContent}>
                    <Text style={styles.tileName}>{category.name}</Text>
                    <Text style={styles.tileCount}>{category.count} items</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      ) : (
        <FlatList
          data={filteredEquipment}
          renderItem={renderEquipmentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <SearchIcon size={48} color="#8E8E93" />
              <Text style={styles.emptyText}>No equipment found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search</Text>
            </View>
          }
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C2E',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#1C1C2E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemImage: {
    width: 120,
    height: 120,
  },
  itemContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  itemCategory: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  itemDetails: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  // Category grid styles (from former categories screen)
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 20,
  },
  tileContainer: {
    width: TILE_SIZE,
    height: TILE_SIZE,
  },
  tile: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1C1C2E',
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  tileOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  tileContent: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
  },
  tileName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tileCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  bottomSpacing: {
    height: 20,
  },
});