import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from "react-native";
import {
  Camera,
  Shield,
  Star,
  Package,
  Settings,
  LogOut,
  ChevronRight,
  AlertCircle,
} from "lucide-react-native";
import { router } from "expo-router";
import { useUser } from "@/providers/UserProvider";

export default function ProfileScreen() {
  const { user, isVerified, logout } = useUser();
  const [isOwner, setIsOwner] = React.useState(user?.userType === 'owner');

  const handleVerification = () => {
    router.push('/verification' as any);
  };

  const stats = [
    { label: 'Listed', value: '12' },
    { label: 'Rented', value: '45' },
    { label: 'Rating', value: '4.8' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400' }}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || 'John Doe'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'john@example.com'}</Text>
            {isVerified ? (
              <View style={styles.verifiedBadge}>
                <Shield size={14} color="#4CAF50" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.verifyButton} onPress={handleVerification}>
                <AlertCircle size={14} color="#FF6B35" />
                <Text style={styles.verifyText}>Verify Account</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.stats}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Type</Text>
        <View style={styles.accountTypeContainer}>
          <View style={styles.accountTypeInfo}>
            <Text style={styles.accountTypeLabel}>
              {isOwner ? 'Equipment Owner' : 'Renter'}
            </Text>
            <Text style={styles.accountTypeDescription}>
              {isOwner ? 'List and rent out equipment' : 'Browse and rent equipment'}
            </Text>
          </View>
          <Switch
            value={isOwner}
            onValueChange={setIsOwner}
            trackColor={{ false: '#1C1C2E', true: '#FF6B35' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        {isOwner && (
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Package size={20} color="#FF6B35" />
              <Text style={styles.menuItemText}>My Listings</Text>
            </View>
            <ChevronRight size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Star size={20} color="#FF6B35" />
            <Text style={styles.menuItemText}>Reviews</Text>
          </View>
          <ChevronRight size={20} color="#8E8E93" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Settings size={20} color="#FF6B35" />
            <Text style={styles.menuItemText}>Settings</Text>
          </View>
          <ChevronRight size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <LogOut size={20} color="#FF6B35" />
        <Text style={styles.logoutText}>Log Out</Text>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C2E',
  },
  profileInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  verifyText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C2E',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  accountTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C1C2E',
    padding: 16,
    borderRadius: 12,
  },
  accountTypeInfo: {
    flex: 1,
  },
  accountTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  accountTypeDescription: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C2E',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 20,
    padding: 16,
    backgroundColor: '#1C1C2E',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  bottomSpacing: {
    height: 20,
  },
});