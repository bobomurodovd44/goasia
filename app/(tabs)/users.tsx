import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/contexts/AuthContext";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  firebaseUid: string;
  companyId?: string;
  pushToken?: string;
  timezone?: string;
  notificationsEnabled?: boolean;
  createdAt: number;
  updatedAt: number;
};

const DUMMY_USERS: User[] = [
  {
    _id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+998 90 123 45 67",
    firebaseUid: "uid-001",
    companyId: "comp-001",
    createdAt: 1736006400000,
    updatedAt: 1737216000000,
  },
  {
    _id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+998 90 987 65 43",
    firebaseUid: "uid-002",
    companyId: "comp-001",
    createdAt: 1735500000000,
    updatedAt: 1736006400000,
  },
  {
    _id: "3",
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.j@example.com",
    firebaseUid: "uid-003",
    createdAt: 1736524800000,
    updatedAt: 1736956800000,
  },
  {
    _id: "4",
    firstName: "Sarah",
    lastName: "Wilson",
    email: "sarah.w@example.com",
    phone: "+998 90 111 22 33",
    firebaseUid: "uid-004",
    companyId: "comp-003",
    createdAt: 1736611200000,
    updatedAt: 1736697600000,
  },
  {
    _id: "5",
    firstName: "Tom",
    lastName: "Brown",
    email: "tom.brown@example.com",
    phone: "+998 90 888 77 66",
    firebaseUid: "uid-005",
    companyId: "comp-002",
    createdAt: 1735400000000,
    updatedAt: 1735500000000,
  },
  {
    _id: "6",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.d@example.com",
    phone: "+998 90 222 44 55",
    firebaseUid: "uid-006",
    companyId: "comp-001",
    createdAt: 1736784000000,
    updatedAt: 1737216000000,
  },
  {
    _id: "7",
    firstName: "Chris",
    lastName: "Lee",
    email: "chris.lee@example.com",
    phone: "+998 90 333 55 77",
    firebaseUid: "uid-007",
    companyId: "comp-002",
    createdAt: 1735000000000,
    updatedAt: 1735200000000,
  },
  {
    _id: "8",
    firstName: "Amanda",
    lastName: "White",
    email: "amanda.w@example.com",
    firebaseUid: "uid-008",
    createdAt: 1734800000000,
    updatedAt: 1734900000000,
  },
  {
    _id: "9",
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@example.com",
    phone: "+998 90 444 66 88",
    firebaseUid: "uid-009",
    companyId: "comp-003",
    createdAt: 1734600000000,
    updatedAt: 1734700000000,
  },
  {
    _id: "10",
    firstName: "Lisa",
    lastName: "Chen",
    email: "lisa.chen@example.com",
    phone: "+998 90 555 77 99",
    firebaseUid: "uid-010",
    companyId: "comp-001",
    createdAt: 1734400000000,
    updatedAt: 1734500000000,
  },
  {
    _id: "11",
    firstName: "James",
    lastName: "Wilson",
    email: "james.w@example.com",
    phone: "+998 90 666 88 11",
    firebaseUid: "uid-011",
    companyId: "comp-002",
    createdAt: 1734200000000,
    updatedAt: 1734300000000,
  },
  {
    _id: "12",
    firstName: "Michelle",
    lastName: "Taylor",
    email: "michelle.t@example.com",
    firebaseUid: "uid-012",
    createdAt: 1734000000000,
    updatedAt: 1734100000000,
  },
  {
    _id: "13",
    firstName: "Robert",
    lastName: "Martinez",
    email: "robert.m@example.com",
    phone: "+998 90 777 99 22",
    firebaseUid: "uid-013",
    companyId: "comp-003",
    createdAt: 1733800000000,
    updatedAt: 1733900000000,
  },
  {
    _id: "14",
    firstName: "Jennifer",
    lastName: "Lopez",
    email: "jennifer.l@example.com",
    phone: "+998 90 888 11 33",
    firebaseUid: "uid-014",
    companyId: "comp-001",
    createdAt: 1733600000000,
    updatedAt: 1733700000000,
  },
  {
    _id: "15",
    firstName: "William",
    lastName: "Garcia",
    email: "william.g@example.com",
    phone: "+998 90 999 22 44",
    firebaseUid: "uid-015",
    companyId: "comp-002",
    createdAt: 1733400000000,
    updatedAt: 1733500000000,
  },
];

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function Avatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  const initials = getInitials(firstName, lastName);
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

function UserRow({ user }: { user: User }) {
  return (
    <View style={styles.row}>
      <Avatar firstName={user.firstName} lastName={user.lastName} />
      <View style={styles.infoContainer}>
        <Text style={styles.nameText}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.emailText}>{user.email}</Text>
        {user.phone && <Text style={styles.phoneText}>{user.phone}</Text>}
      </View>
    </View>
  );
}

export default function Users() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            console.log('[Users] Logging out...');
            await logout();
            console.log('[Users] Redirecting to login...');
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Users</Text>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.debugButton}
            onPress={() => router.push('/company-form')}
          >
            <Ionicons name="business-outline" size={20} color="#2563EB" />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        data={DUMMY_USERS}
        renderItem={({ item }) => <UserRow user={item} />}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  debugButton: {
    padding: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  logoutButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4F46E5",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  emailText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  phoneText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
});
