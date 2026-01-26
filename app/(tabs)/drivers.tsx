import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type Driver = {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  licenseFrontId: string;
  licenseBackId: string;
  licenseFrontUrl: string;
  licenseBackUrl: string;
  companyId: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
};

const DUMMY_DRIVERS: Driver[] = [
  {
    _id: "1",
    firstName: "John",
    lastName: "Doe",
    phone: "+998 90 123 45 67",
    email: "john.doe@example.com",
    licenseFrontId: "lic-front-001",
    licenseBackId: "lic-back-001",
    licenseFrontUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600",
    licenseBackUrl: "https://images.unsplash.com/photo-1555436169-20e93ea9a7ff?w=600",
    companyId: "comp-001",
    isActive: true,
    createdAt: 1736006400000,
    updatedAt: 1737216000000,
  },
  {
    _id: "2",
    firstName: "Jane",
    lastName: "Smith",
    phone: "+998 90 987 65 43",
    email: "jane.smith@example.com",
    licenseFrontId: "lic-front-002",
    licenseBackId: "lic-back-002",
    licenseFrontUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600",
    licenseBackUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ed5fa?w=600",
    companyId: "comp-002",
    isActive: false,
    createdAt: 1735500000000,
    updatedAt: 1736006400000,
  },
  {
    _id: "3",
    firstName: "Mike",
    lastName: "Johnson",
    phone: "+998 90 555 66 77",
    email: "mike.j@example.com",
    licenseFrontId: "lic-front-003",
    licenseBackId: "lic-back-003",
    licenseFrontUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
    licenseBackUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600",
    companyId: "comp-001",
    isActive: true,
    createdAt: 1736524800000,
    updatedAt: 1736956800000,
  },
  {
    _id: "4",
    firstName: "Sarah",
    lastName: "Wilson",
    phone: "+998 90 111 22 33",
    email: "sarah.w@example.com",
    licenseFrontId: "lic-front-004",
    licenseBackId: "lic-back-004",
    licenseFrontUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600",
    licenseBackUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600",
    companyId: "comp-003",
    isActive: true,
    createdAt: 1736611200000,
    updatedAt: 1736697600000,
  },
  {
    _id: "5",
    firstName: "Tom",
    lastName: "Brown",
    phone: "+998 90 888 77 66",
    email: "tom.brown@example.com",
    licenseFrontId: "lic-front-005",
    licenseBackId: "lic-back-005",
    licenseFrontUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600",
    licenseBackUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600",
    companyId: "comp-002",
    isActive: false,
    createdAt: 1735400000000,
    updatedAt: 1735500000000,
  },
  {
    _id: "6",
    firstName: "Emily",
    lastName: "Davis",
    phone: "+998 90 222 44 55",
    email: "emily.d@example.com",
    licenseFrontId: "lic-front-006",
    licenseBackId: "lic-back-006",
    licenseFrontUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600",
    licenseBackUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600",
    companyId: "comp-001",
    isActive: true,
    createdAt: 1736784000000,
    updatedAt: 1737216000000,
  },
];

function fullName(driver: Driver): string {
  return `${driver.firstName} ${driver.lastName}`;
}

function getActiveBadgeStyle(isActive: boolean) {
  return isActive
    ? { backgroundColor: "#D1FAE5", color: "#065F46" }
    : { backgroundColor: "#F3F4F6", color: "#6B7280" };
}

function formatDate(ts: number): string {
  const date = new Date(ts);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
  const style = getActiveBadgeStyle(isActive);
  return (
    <View style={[styles.badge, { backgroundColor: style.backgroundColor }]}>
      <Text style={[styles.badgeText, { color: style.color }]}>
        {isActive ? "Active" : "Inactive"}
      </Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function Drivers() {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const renderItem = ({ item }: { item: Driver }) => {
    const style = getActiveBadgeStyle(item.isActive);

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => setSelectedDriver(item)}
      >
        <View style={styles.cardContent}>
          <View style={styles.thumbnailContainer}>
            <Image
              source={{ uri: item.licenseFrontUrl }}
              style={styles.thumbnail}
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.nameText}>{fullName(item)}</Text>
            <Text style={styles.phoneText}>{item.phone}</Text>
            <View style={styles.badgeRow}>
              <ActiveBadge isActive={item.isActive} />
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const driver = selectedDriver;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={DUMMY_DRIVERS}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={!!selectedDriver}
        animationType="slide"
        transparent={false}
      >
        {driver && (
          <SafeAreaView style={styles.modalContainer} edges={["top"]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Driver Details</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setSelectedDriver(null)}
              >
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            <View style={styles.modalHeaderContent}>
              <ActiveBadge isActive={driver.isActive} />
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Basic Info</Text>
                <View style={styles.infoCard}>
                  <DetailRow label="Name" value={fullName(driver)} />
                  <DetailRow label="Phone" value={driver.phone} />
                  <DetailRow label="Email" value={driver.email} />
                  <DetailRow label="Company ID" value={driver.companyId} />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>License</Text>
                <Text style={styles.subsectionTitle}>Front</Text>
                <Image
                  source={{ uri: driver.licenseFrontUrl }}
                  style={styles.licenseImage}
                  resizeMode="contain"
                />
                <Text style={[styles.subsectionTitle, { marginTop: 16 }]}>Back</Text>
                <Image
                  source={{ uri: driver.licenseBackUrl }}
                  style={styles.licenseImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Metadata</Text>
                <View style={styles.infoCard}>
                  <DetailRow label="Created" value={formatDate(driver.createdAt)} />
                  <DetailRow label="Updated" value={formatDate(driver.updatedAt)} />
                  <DetailRow label="Driver ID" value={driver._id} />
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  thumbnailContainer: {
    marginRight: 12,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  phoneText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: "row",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  modalHeaderContent: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  licenseImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
});
