import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Camera,
  Aperture,
  Lightbulb,
  Mic,
  Plane,
  Monitor,
  Battery,
  HardDrive,
  Sparkles,
  Truck,
} from "lucide-react-native";
import { router } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");
const TILE_SIZE = (screenWidth - 60) / 2;

interface Category {
  id: string;
  name: string;
  icon: any;
  gradient: string[];
  count: number;
}

const categories: Category[] = [
  {
    id: "cameras",
    name: "Cameras & Support",
    icon: Camera,
    gradient: ["#667eea", "#764ba2"],
    count: 156,
  },
  {
    id: "lenses",
    name: "Lenses & Accessories",
    icon: Aperture,
    gradient: ["#f093fb", "#f5576c"],
    count: 243,
  },
  {
    id: "lighting",
    name: "Lighting & Grip",
    icon: Lightbulb,
    gradient: ["#ffd89b", "#19547b"],
    count: 189,
  },
  {
    id: "audio",
    name: "Audio & Sound",
    icon: Mic,
    gradient: ["#4facfe", "#00f2fe"],
    count: 97,
  },
  {
    id: "drones",
    name: "Drones & Aerial",
    icon: Plane,
    gradient: ["#43e97b", "#38f9d7"],
    count: 64,
  },
  {
    id: "monitors",
    name: "Monitors & Assist",
    icon: Monitor,
    gradient: ["#fa709a", "#fee140"],
    count: 82,
  },
  {
    id: "power",
    name: "Power & Batteries",
    icon: Battery,
    gradient: ["#30cfd0", "#330867"],
    count: 134,
  },
  {
    id: "storage",
    name: "Data & Storage",
    icon: HardDrive,
    gradient: ["#a8edea", "#fed6e3"],
    count: 76,
  },
  {
    id: "effects",
    name: "Special Effects",
    icon: Sparkles,
    gradient: ["#ff9a9e", "#fecfef"],
    count: 45,
  },
  {
    id: "transport",
    name: "Transport & Safety",
    icon: Truck,
    gradient: ["#fbc2eb", "#a6c1ee"],
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
          const Icon = category.icon;
          return (
            <TouchableOpacity
              key={category.id}
              style={styles.tileContainer}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={category.gradient as [string, string, ...string[]]}
                style={styles.tile}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.tileContent}>
                  <Icon size={32} color="#FFFFFF" />
                  <Text style={styles.tileName}>{category.name}</Text>
                  <Text style={styles.tileCount}>{category.count} items</Text>
                </View>
              </LinearGradient>
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
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileContent: {
    alignItems: 'center',
    gap: 8,
  },
  tileName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tileCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bottomSpacing: {
    height: 20,
  },
});