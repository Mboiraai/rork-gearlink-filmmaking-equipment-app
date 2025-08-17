import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProvider } from "@/providers/UserProvider";
import { LocationProvider } from "@/providers/LocationProvider";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: {
        backgroundColor: '#0A0E27',
      },
      headerTintColor: '#FFFFFF',
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="equipment/[id]" 
        options={{ 
          title: "Equipment Details",
          presentation: "card" 
        }} 
      />
      <Stack.Screen 
        name="profile/[userId]" 
        options={{ 
          title: "User Profile",
          presentation: "card" 
        }} 
      />
      <Stack.Screen 
        name="chat/[chatId]" 
        options={{ 
          title: "Chat",
          presentation: "card" 
        }} 
      />
      <Stack.Screen 
        name="verification" 
        options={{ 
          title: "Verification",
          presentation: "modal" 
        }} 
      />
      <Stack.Screen 
        name="owner/new-listing" 
        options={{ 
          title: "New Listing",
          presentation: "card" 
        }} 
      />
      <Stack.Screen 
        name="settings/index" 
        options={{ 
          title: "Settings",
          presentation: "card" 
        }} 
      />
      <Stack.Screen 
        name="profile/edit" 
        options={{ 
          title: "Edit Profile",
          presentation: "card" 
        }} 
      />
      <Stack.Screen 
        name="profile/reviews" 
        options={{ 
          title: "Reviews",
          presentation: "card" 
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <LocationProvider>
            <UserProvider>
              <RootLayoutNav />
            </UserProvider>
          </LocationProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}