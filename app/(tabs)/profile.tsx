import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Shield,
  Star,
  Package,
  Settings,
  LogOut,
  ChevronRight,
  AlertCircle,
  LogIn,
  UserPlus,
} from "lucide-react-native";
import { router } from "expo-router";
import { useUser } from "@/providers/UserProvider";

export default function ProfileScreen() {
  const { user, isVerified, logout, signIn, signUp, authLoading, error } = useUser();
  const [isOwner, setIsOwner] = React.useState<boolean>(user?.userType === 'owner');
  const [mode, setMode] = React.useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');

  React.useEffect(() => {
    setIsOwner(user?.userType === 'owner');
  }, [user?.userType]);

  const handleVerification = () => {
    router.push('/verification' as any);
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    const ok = await (mode === 'signin' ? signIn(email.trim(), password) : signUp(email.trim(), password));
    if (!ok) {
      Alert.alert('Authentication failed', error ?? 'Please try again');
    }
  };

  if (!user) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.authContainer}>
        <Text style={styles.authTitle}>Welcome to GearLink</Text>
        <Text style={styles.authSubtitle}>Sign in to manage your gear and chats</Text>

        <View style={styles.authSwitch}>
          <TouchableOpacity
            testID="switch-signin"
            style={[styles.switchBtn, mode === 'signin' && styles.switchBtnActive]}
            onPress={() => setMode('signin')}
          >
            <LogIn size={16} color={mode === 'signin' ? '#0A0E27' : '#8E8E93'} />
            <Text style={[styles.switchText, mode === 'signin' && styles.switchTextActive]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="switch-signup"
            style={[styles.switchBtn, mode === 'signup' && styles.switchBtnActive]}
            onPress={() => setMode('signup')}
          >
            <UserPlus size={16} color={mode === 'signup' ? '#0A0E27' : '#8E8E93'} />
            <Text style={[styles.switchText, mode === 'signup' && styles.switchTextActive]}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          testID="email-input"
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8E8E93"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          testID="password-input"
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#8E8E93"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity
          testID="auth-submit"
          style={styles.primaryBtn}
          onPress={handleAuth}
          disabled={authLoading}
        >
          {authLoading ? <ActivityIndicator color="#0A0E27" /> : (
            <Text style={styles.primaryBtnText}>{mode === 'signin' ? 'Sign In' : 'Create Account'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    );
  }

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
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
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

      <TouchableOpacity testID="logout" style={styles.logoutButton} onPress={logout}>
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
  authContainer: {
    padding: 20,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
  },
  authSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    marginBottom: 20,
  },
  authSwitch: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1C1C2E',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  switchBtnActive: {
    backgroundColor: '#FF6B35',
  },
  switchText: {
    color: '#8E8E93',
    fontWeight: '600',
  },
  switchTextActive: {
    color: '#0A0E27',
  },
  input: {
    backgroundColor: '#1C1C2E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#0A0E27',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#FF6B35',
    marginBottom: 8,
  },
});