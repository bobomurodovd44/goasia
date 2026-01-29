import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/contexts/AuthContext";
import feathersClient from "../../src/services/feathersClient";
import { colors } from "../../src/theme/colors";

type Driver = {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  licenseFrontId?: string;
  licenseBackId?: string;
  licenseFrontUrl?: string;
  licenseBackUrl?: string;
  companyId: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
};

interface PaginatedResponse<T> {
  total: number;
  limit: number;
  skip: number;
  data: T[];
}

const PAGE_SIZE = 20;

function fullName(driver: Driver): string {
  return `${driver.firstName} ${driver.lastName}`;
}

function getActiveBadgeStyle(isActive: boolean) {
  return isActive
    ? { backgroundColor: "#D1FAE5", color: "#065F46" }
    : { backgroundColor: "#F3F4F6", color: "#6B7280" };
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

function LoadingSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <View style={[styles.skeletonAvatar, { backgroundColor: "#E5E7EB" }]} />
      <View style={styles.skeletonInfo}>
        <View style={[styles.skeletonName, { backgroundColor: "#E5E7EB" }]} />
        <View style={[styles.skeletonPhone, { backgroundColor: "#E5E7EB" }]} />
        <View style={[styles.skeletonBadge, { backgroundColor: "#E5E7EB" }]} />
      </View>
    </View>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="car-outline" size={64} color={colors.disabled} />
      <Text style={styles.emptyTitle}>{message}</Text>
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
      <Text style={styles.errorText}>{message}</Text>
      <Pressable style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </Pressable>
    </View>
  );
}

export default function Drivers() {
  const { user } = useAuth();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);

  const fetchDrivers = useCallback(
    async (reset = false) => {
      const currentSkip = reset ? 0 : skip;
      const shouldReset = reset;

      if (shouldReset) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const response = await feathersClient.service("drivers").find({
          query: {
            companyId: user?.companyId,
            $sort: { createdAt: -1 },
            $limit: PAGE_SIZE,
            $skip: currentSkip,
          },
        });

        const fetchedDrivers: Driver[] =
          (response as PaginatedResponse<Driver>).data || response;
        const totalDrivers =
          (response as PaginatedResponse<Driver>).total || fetchedDrivers.length;

        // Use functional state update to avoid stale closure
        setDrivers(prevDrivers => {
          if (shouldReset) {
            return fetchedDrivers;
          }
          const existingIds = new Set(prevDrivers.map(d => d._id));
          const newDrivers = fetchedDrivers.filter(d => !existingIds.has(d._id));
          return [...prevDrivers, ...newDrivers];
        });

        const fetchedCount = fetchedDrivers.length;
        // Calculate hasMore based on fetched count and total
        setHasMore(fetchedCount === PAGE_SIZE && (currentSkip + fetchedCount) < totalDrivers);
        setSkip(currentSkip + fetchedCount);
        setError(null);
      } catch (err: any) {
        console.error("[Drivers] Fetch error:", err);
        if (shouldReset) {
          setError(err.message || "Failed to load drivers");
        }
      } finally {
        // Only reset loading on initial fetch
        if (shouldReset) {
          setIsLoading(false);
        }
        setRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [user?.companyId, skip]
  );

  useEffect(() => {
    if (!user?.companyId) {
      if (user && !user.companyId) {
        setIsLoading(false);
        setError("No company associated with your account");
      }
      return;
    }

    fetchDrivers(true);
  }, [user?.companyId, fetchDrivers]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDrivers(true);
  }, [fetchDrivers]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !error) {
      setIsLoadingMore(true);
      fetchDrivers(false);
    }
  }, [isLoadingMore, hasMore, error, fetchDrivers]);

  const handleRetry = () => {
    setError(null);
    fetchDrivers(true);
  };

  const renderItem = ({ item }: { item: Driver }) => {
    const style = getActiveBadgeStyle(item.isActive);

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardContent}>
          <View style={styles.thumbnailContainer}>
            <View style={[styles.thumbnail, { backgroundColor: "#E0E7FF" }]}>
              <Text style={styles.thumbnailText}>
                {item.firstName.charAt(0)}{item.lastName.charAt(0)}
              </Text>
            </View>
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

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Drivers</Text>
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Drivers</Text>
      </View>

      {error ? (
        <ErrorState message={error} onRetry={handleRetry} />
      ) : (
        <FlatList
          data={drivers}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListFooterComponent={renderFooter}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.countText}>{drivers.length} drivers</Text>
            </View>
          }
          ListEmptyComponent={<EmptyState message="No drivers found" />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  skeletonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    marginBottom: 12,
  },
  skeletonAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  skeletonInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 8,
  },
  skeletonName: {
    width: "60%",
    height: 16,
    borderRadius: 4,
  },
  skeletonPhone: {
    width: "40%",
    height: 14,
    borderRadius: 4,
  },
  skeletonBadge: {
    width: 50,
    height: 24,
    borderRadius: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 12,
  },
  listHeader: {
    marginBottom: 12,
  },
  countText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
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
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4F46E5",
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
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
