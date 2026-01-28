import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";

const DUMMY_PENDING_ORDERS = [
  {
    id: "ORD-7281",
    from: "Tashkent Int. Airport",
    to: "Hilton City Center",
    type: "Business",
    priceRange: "$45 - $60",
    timeLeft: "12m 30s",
    distance: "12.5 km",
    timestamp: "2 mins ago",
  },
  {
    id: "ORD-9902",
    from: "Railway Station",
    to: "Samarkand Plaza",
    type: "Economy",
    priceRange: "$25 - $35",
    timeLeft: "05m 15s",
    distance: "8.2 km",
    timestamp: "5 mins ago",
  },
  {
    id: "ORD-1123",
    from: "Amir Temur Square",
    to: "Charvak Resort",
    type: "Van",
    priceRange: "$80 - $110",
    timeLeft: "45m 00s",
    distance: "65.0 km",
    timestamp: "12 mins ago",
  },
];

export default function PendingOrders() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const renderOrderCard = ({ item }: { item: typeof DUMMY_PENDING_ORDERS[0] }) => (
    <Pressable 
      style={({ pressed }) => [
        styles.card, 
        pressed && styles.cardPressed,
      ]}
      onPress={() => router.push(`/order-details/${item.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.idContainer}>
          <View style={styles.dot} />
          <Text style={styles.orderIdText}>{item.id}</Text>
        </View>
        <View style={styles.timerBadge}>
          <Ionicons name="flash" size={12} color="#F59E0B" />
          <Text style={styles.timerText}>{item.timeLeft}</Text>
        </View>
      </View>

      <View style={styles.routeSection}>
        <View style={styles.routeIcons}>
          <View style={styles.hollowDot} />
          <View style={styles.routeLine} />
          <Ionicons name="location" size={16} color={colors.primary} />
        </View>
        <View style={styles.routeDetails}>
          <Text style={styles.locationText} numberOfLines={1}>{item.from}</Text>
          <View style={styles.routeGap} />
          <Text style={styles.locationText} numberOfLines={1}>{item.to}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.tagGroup}>
          <View style={styles.tag}>
            <MaterialCommunityIcons name="car-back" size={14} color={colors.textSecondary} />
            <Text style={styles.tagText}>{item.type}</Text>
          </View>
          <View style={styles.tag}>
            <Ionicons name="navigate-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.tagText}>{item.distance}</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.priceValue}>{item.priceRange.split(' - ')[0]}</Text>
        </View>
      </View>
    </Pressable>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <FlatList
          data={DUMMY_PENDING_ORDERS}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.welcomeText}>Available Orders</Text>
              <Text style={styles.countText}>{DUMMY_PENDING_ORDERS.length} orders found</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="search" size={32} color={colors.disabled} />
              </View>
              <Text style={styles.emptyTitle}>Scanning for orders...</Text>
              <Text style={styles.emptySubtitle}>We'll notify you when a new trip appears</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  listHeader: {
    marginBottom: 20,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  countText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: "500",
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.8)",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardPressed: {
    backgroundColor: "#F8FAFC",
    transform: [{ scale: 0.985 }],
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  idContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  orderIdText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  timerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D97706",
  },
  routeSection: {
    flexDirection: "row",
    marginBottom: 20,
  },
  routeIcons: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    marginRight: 16,
  },
  hollowDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 4,
  },
  routeDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  routeGap: {
    height: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 16,
  },
  tagGroup: {
    flexDirection: "row",
    gap: 12,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
