import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import PhoneInput from "react-native-phone-number-input";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../src/components/Button";
import Input from "../../src/components/Input";
import Toggle from "../../src/components/Toggle";
import { useAuth } from "../../src/contexts/AuthContext";
import feathersClient from "../../src/services/feathersClient";
import { uploadFileMultipart } from "../../src/services/handleMultipartUpload";
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

interface DriverModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  driver?: Driver | null;
}

function DriverModal({ visible, onClose, onSuccess, driver }: DriverModalProps) {
  const isEditing = !!driver;

  const [isActive, setIsActive] = useState("active");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  const [licenseFront, setLicenseFront] = useState<string | null>(null);
  const [licenseBack, setLicenseBack] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);

  const phoneInputRef = useRef<PhoneInput>(null);

  // Populate form when editing existing driver
  useEffect(() => {
    if (driver) {
      setFormData({
        firstName: driver.firstName,
        lastName: driver.lastName,
        phone: driver.phone,
        email: driver.email,
      });
      setIsActive(driver.isActive ? "active" : "inactive");

      // Debug: log driver data to see what's available
      console.log("Driver data for edit:", JSON.stringify(driver, null, 2));

      // Show existing license images if available
      // Check various possible field names for media data
      const frontMedia = driver.licenseFront ||
                         driver.licenseFrontUrl ||
                         (typeof driver.licenseFrontId === 'object' ? driver.licenseFrontId?.url : null);
      const backMedia = driver.licenseBack ||
                        driver.licenseBackUrl ||
                        (typeof driver.licenseBackId === 'object' ? driver.licenseBackId?.url : null);

      console.log("Front media:", frontMedia);
      console.log("Back media:", backMedia);

      // Set front license
      if (driver.licenseFrontUrl) {
        setLicenseFront(driver.licenseFrontUrl);
      } else if (typeof driver.licenseFrontId === 'object' && driver.licenseFrontId?.url) {
        setLicenseFront(driver.licenseFrontId.url);
      } else if (typeof driver.licenseFront === 'object' && driver.licenseFront?.url) {
        setLicenseFront(driver.licenseFront.url);
      } else if (driver.licenseFrontId && typeof driver.licenseFrontId === 'string') {
        // ID only - construct URL (adjust based on your backend URL pattern)
        setLicenseFront(`http://localhost:3000/media/${driver.licenseFrontId}`);
      } else if (driver.licenseFront && typeof driver.licenseFront === 'string') {
        setLicenseFront(driver.licenseFront);
      } else {
        setLicenseFront(null);
      }

      // Set back license
      if (driver.licenseBackUrl) {
        setLicenseBack(driver.licenseBackUrl);
      } else if (typeof driver.licenseBackId === 'object' && driver.licenseBackId?.url) {
        setLicenseBack(driver.licenseBackId.url);
      } else if (typeof driver.licenseBack === 'object' && driver.licenseBack?.url) {
        setLicenseBack(driver.licenseBack.url);
      } else if (driver.licenseBackId && typeof driver.licenseBackId === 'string') {
        // ID only - construct URL (adjust based on your backend URL pattern)
        setLicenseBack(`http://localhost:3000/media/${driver.licenseBackId}`);
      } else if (driver.licenseBack && typeof driver.licenseBack === 'string') {
        setLicenseBack(driver.licenseBack);
      } else {
        setLicenseBack(null);
      }
    } else {
      // Reset form for new driver
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
      });
      setLicenseFront(null);
      setLicenseBack(null);
      setIsActive("active");
    }
  }, [driver]);

  // Validation helpers
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Simple phone validation for update mode: starts with + and at least 9 digits
  const isValidPhoneSimple = (phone: string): boolean => {
    if (!phone || phone.length < 10) return false;
    const digitsOnly = phone.replace(/[^\d]/g, "");
    return phone.startsWith("+") && digitsOnly.length >= 9;
  };

  // Phone validation for add mode (uses PhoneInput which handles formatting)
  const isValidPhoneAdd = (phone: string): boolean => {
    return phone.trim().length > 0;
  };

  const getPhoneBorderColor = () => {
    if (phoneFocused) return colors.focus;
    return colors.border;
  };

  const isFormValid =
    formData.firstName.trim().length > 0 &&
    formData.lastName.trim().length > 0 &&
    formData.phone.trim().length > 0 &&
    isValidEmail(formData.email) &&
    (isEditing ? isValidPhoneSimple(formData.phone) : isValidPhoneAdd(formData.phone));

  const pickImage = async (side: "front" | "back") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (side === "front") {
        setLicenseFront(asset.uri);
      } else {
        setLicenseBack(asset.uri);
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.phone ||
        !formData.email
      ) {
        Alert.alert("Error", "Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Upload license front if changed
      let licenseFrontId: string | null = null;
      if (licenseFront && !licenseFront.includes("http")) {
        licenseFrontId = await uploadFileMultipart(licenseFront, "image/jpeg");
      }

      // Upload license back if changed
      let licenseBackId: string | null = null;
      if (licenseBack && !licenseBack.includes("http")) {
        licenseBackId = await uploadFileMultipart(licenseBack, "image/jpeg");
      }

      if (isEditing && driver?._id) {
        // Update existing driver
        await feathersClient.service("drivers").patch(driver._id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          isActive: isActive === "active",
          ...(licenseFrontId && { licenseFrontId }),
          ...(licenseBackId && { licenseBackId }),
        });
      } else {
        // Create new driver
        await feathersClient.service("drivers").create({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          isActive: isActive === "active",
          licenseFrontId,
          licenseBackId,
        });
      }

      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save driver:", error);
      Alert.alert("Error", `Failed to ${isEditing ? "update" : "create"} driver. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalKeyboardView}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Pressable
                style={styles.modalBackButton}
                onPress={onClose}
                disabled={loading}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={loading ? colors.disabled : colors.textPrimary}
                />
              </Pressable>
              <Text style={styles.modalTitle}>{isEditing ? "Update Driver" : "Add Driver"}</Text>
              <View style={styles.modalCloseButton} />
            </View>

            {/* Form Content - Scrollable */}
            <ScrollView
              style={styles.modalFormScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalFormContent}>
                {/* Active/Inactive Toggle */}
                <View style={styles.formSection}>
                  <Text style={styles.sectionLabel}>Status</Text>
                  <Toggle
                    options={[
                      { label: "Active", value: "active" },
                      { label: "Inactive", value: "inactive" },
                    ]}
                    selected={isActive}
                    onSelect={loading ? () => {} : setIsActive}
                  />
                </View>

                {/* First Name */}
                <View style={styles.formSection}>
                  <Input
                    label="First Name"
                    value={formData.firstName}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, firstName: text }))
                    }
                    placeholder="Enter first name"
                    autoCapitalize="words"
                    disabled={loading}
                  />
                </View>

                {/* Last Name */}
                <View style={styles.formSection}>
                  <Input
                    label="Last Name"
                    value={formData.lastName}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, lastName: text }))
                    }
                    placeholder="Enter last name"
                    autoCapitalize="words"
                    disabled={loading}
                  />
                </View>

              {/* Phone */}
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>Phone</Text>
                {isEditing ? (
                  // Update mode: simple Input with validation
                  <Input
                    value={formData.phone}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, phone: text }))
                    }
                    placeholder="+998901234567"
                    keyboardType="phone-pad"
                    disabled={loading}
                  />
                ) : (
                  // Add mode: PhoneInput component
                  <View
                    style={[
                      styles.phoneInputOuterContainer,
                      {
                        borderColor: getPhoneBorderColor(),
                        opacity: loading ? 0.5 : 1,
                      },
                    ]}
                  >
                    <View style={styles.phoneIconLeft}>
                      <Ionicons name="call" size={18} color={colors.textSecondary} />
                    </View>
                    <TouchableWithoutFeedback
                      onPress={() => !loading && setPhoneFocused(true)}
                      disabled={loading}
                    >
                      <View style={styles.phoneInputWrapper}>
                        <PhoneInput
                          ref={phoneInputRef}
                          value={formData.phone}
                          defaultCode="UZ"
                          layout="first"
                          onChangeText={(text) =>
                            setFormData((prev) => ({ ...prev, phone: text }))
                          }
                          onFocus={() => setPhoneFocused(true)}
                          onBlur={() => setPhoneFocused(false)}
                          containerStyle={styles.phoneInput}
                          textContainerStyle={styles.phoneTextInput}
                          disabled={loading}
                        />
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                )}
              </View>

              {/* Email */}
              <View style={styles.formSection}>
                <Input
                  label="Email"
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, email: text }))
                  }
                  placeholder="Enter email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  disabled={loading}
                />
              </View>

              {/* License Front Image Picker */}
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>License Front</Text>
                <Pressable
                  style={[
                    styles.imagePickerButton,
                    loading && { opacity: 0.5 },
                  ]}
                  onPress={() => pickImage("front")}
                  disabled={loading}
                >
                  {licenseFront ? (
                    <Image
                      source={{ uri: licenseFront }}
                      style={styles.imagePreview}
                    />
                  ) : (
                    <View style={styles.imagePickerPlaceholder}>
                      <Ionicons
                        name="camera-outline"
                        size={32}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.imagePickerText}>Choose Photo</Text>
                    </View>
                  )}
                </Pressable>
              </View>

              {/* License Back Image Picker */}
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>License Back</Text>
                <Pressable
                  style={[
                    styles.imagePickerButton,
                    loading && { opacity: 0.5 },
                  ]}
                  onPress={() => pickImage("back")}
                  disabled={loading}
                >
                  {licenseBack ? (
                    <Image
                      source={{ uri: licenseBack }}
                      style={styles.imagePreview}
                    />
                  ) : (
                    <View style={styles.imagePickerPlaceholder}>
                      <Ionicons
                        name="camera-outline"
                        size={32}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.imagePickerText}>Choose Photo</Text>
                    </View>
                  )}
                </Pressable>
              </View>

              {/* Bottom padding */}
              <View style={{ height: 20 }} />
              </View>
            </ScrollView>

            {/* Fixed Submit Button */}
            <View style={styles.modalFooter}>
              <Button
                title="Submit"
                onPress={handleSubmit}
                loading={loading}
                disabled={!isFormValid || loading}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
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
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const driversFetched = useRef(false);

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

        setDrivers((prevDrivers) => {
          if (shouldReset) {
            return fetchedDrivers;
          }
          const existingIds = new Set(prevDrivers.map((d) => d._id));
          const newDrivers = fetchedDrivers.filter(
            (d) => !existingIds.has(d._id)
          );
          return [...prevDrivers, ...newDrivers];
        });

        const fetchedCount = fetchedDrivers.length;
        setHasMore(
          fetchedCount === PAGE_SIZE && currentSkip + fetchedCount < totalDrivers
        );
        setSkip(currentSkip + fetchedCount);
        setError(null);
      } catch (err: any) {
        console.error("[Drivers] Fetch error:", err);
        if (shouldReset) {
          setError(err.message || "Failed to load drivers");
        }
      } finally {
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

    // Prevent double fetch
    if (driversFetched.current) {
      return;
    }

    driversFetched.current = true;
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

  const renderHeaderActions = () => (
    <View style={styles.headerActions}>
      <Pressable
        style={styles.addButton}
        onPress={() => setShowAddDriverModal(true)}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </Pressable>
    </View>
  );

  const renderItem = ({ item }: { item: Driver }) => {
    const style = getActiveBadgeStyle(item.isActive);

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => {
          setSelectedDriver(item);
          setShowAddDriverModal(true);
        }}
      >
        <View style={styles.cardContent}>
          <View style={styles.thumbnailContainer}>
            <View style={[styles.thumbnail, { backgroundColor: "#E0E7FF" }]}>
              <Text style={styles.thumbnailText}>
                {item.firstName.charAt(0)}
                {item.lastName.charAt(0)}
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
          {renderHeaderActions()}
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </View>
        <DriverModal
          visible={showAddDriverModal}
          onClose={() => {
            setShowAddDriverModal(false);
            setSelectedDriver(null);
          }}
          onSuccess={() => {
            fetchDrivers(true);
            setSelectedDriver(null);
          }}
          driver={selectedDriver}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Drivers</Text>
        {renderHeaderActions()}
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

      <DriverModal
        visible={showAddDriverModal}
        onClose={() => {
          setShowAddDriverModal(false);
          setSelectedDriver(null);
        }}
        onSuccess={() => {
          fetchDrivers(true);
          setSelectedDriver(null);
        }}
        driver={selectedDriver}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalKeyboardView: {
    flex: 1,
  },
  modalContent: {
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
    backgroundColor: "#FFFFFF",
  },
  modalBackButton: {
    padding: 4,
    width: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  modalCloseButton: {
    padding: 4,
    width: 40,
    alignItems: "flex-end",
  },
  modalFormScroll: {
    flex: 1,
  },
  modalFormContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  phoneInputOuterContainer: {
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: colors.background,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  phoneIconLeft: {
    paddingLeft: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  phoneInputWrapper: {
    flex: 1,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "transparent",
    height: 52,
    marginLeft: -10,
  },
  phoneTextInput: {
    backgroundColor: "transparent",
    paddingVertical: 0,
    paddingLeft: 4,
  },
  phoneCodeText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  phoneFlagButton: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingHorizontal: 0,
  },
  phoneTextInputStyle: {
    fontSize: 16,
    color: colors.textPrimary,
    height: 52,
  },
  imagePickerButton: {
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePickerPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePickerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
});
