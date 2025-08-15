import React, { useState, useMemo } from "react";
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
} from "react-native";
import { Search as SearchIcon, X, Filter, MapPin, Star } from "lucide-react-native";
import { router } from "expo-router";
import { equipmentData } from "@/mocks/equipment";
import { useLocation } from "@/providers/LocationProvider";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { currency } = useLocation();

  const categories = [
    "All",
    "Cameras",
    "Lenses",
    "Lighting",
    "Audio",
    "Drones",
  ];

  const filteredEquipment = useMemo(() => {
    let filtered = equipmentData;
    
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter(item =>
        item.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    
    return filtered;
  }, [searchQuery, selectedCategory]);

  const renderEquipmentItem = ({ item }: { item: typeof equipmentData[0] }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => router.push(`/equipment/${item.id}` as any)}
      activeOpacity={0.8}
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
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
        
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(item === "All" ? null : item)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === item && styles.categoryChipTextActive
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoriesContainer}
        />
      </View>

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
  categoriesContainer: {
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1C1C2E',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#FF6B35',
  },
  categoryChipText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryChipTextActive: {
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
});