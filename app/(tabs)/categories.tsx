import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");
const TILE_SIZE = (screenWidth - 60) / 2;

interface Category {
  id: string;
  name: string;
  image: string;
  gradient: string[];
  count: number;
}

const categories: Category[] = [
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

export default function CategoriesScreen() {
  const handleCategoryPress = (category: Category) => {
    router.push({
      pathname: "/(tabs)/search" as any,
      params: { category: category.name },
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Equipment Categories</Text>
        <Text style={styles.subtitle}>Browse by equipment type</Text>
      </View>

      <View style={styles.grid}>
        {categories.map((category) => {
          return (
            <TouchableOpacity
              key={category.id}
              style={styles.tileContainer}
              onPress={() => handleCategoryPress(category)}
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
          );
        })}
      </View>

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