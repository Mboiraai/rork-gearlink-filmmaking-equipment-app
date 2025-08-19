import { Tabs } from "expo-router";
import { Home, Search, PlusCircle, User, MessageCircle, LogOut, LogIn } from "lucide-react-native";
import React from "react";
import { Image, Platform, TouchableOpacity, View } from "react-native";
import { useUser } from "@/providers/UserProvider";
import { router } from "expo-router";

function HeaderLeftAvatar() {
  const { user } = useUser();
  const uri = user?.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&crop=faces&fit=crop';
  return (
    <View style={{ marginLeft: 12 }}>
      <Image
        source={{ uri }}
        style={{ width: 28, height: 28, borderRadius: 14 }}
        testID="header-avatar"
      />
    </View>
  );
}

function HeaderRightAction() {
  const { user, logout } = useUser();
  if (user) {
    return (
      <TouchableOpacity accessibilityLabel="Sign out" onPress={logout} style={{ marginRight: 12 }} testID="header-signout">
        <LogOut size={20} color="#FFFFFF" />
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity accessibilityLabel="Sign in" onPress={() => router.push('/auth/sign-in' as any)} style={{ marginRight: 12 }} testID="header-signin">
      <LogIn size={20} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#0A0E27',
          borderTopColor: '#1C1C2E',
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 0 : 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        headerStyle: {
          backgroundColor: '#0A0E27',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: () => <HeaderLeftAvatar />,
        headerRight: () => <HeaderRightAction />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-listing"
        options={{
          title: "Add",
          tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}