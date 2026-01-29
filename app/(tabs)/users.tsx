import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Modal,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import PhoneInput from "react-native-phone-number-input";
import Animated, {
  FadeInDown,
  SlideInUp,
  SlideOutDown,
} from "react-native-reanimated";
import { createUserWithEmailAndPassword, AuthError } from "firebase/auth";
import { useAuth } from "../../src/contexts/AuthContext";
import feathersClient from "../../src/services/feathersClient";
import { getFirebaseAuth } from "../../src/config/firebase";
import { colors } from "../../src/theme/colors";
import Input from "../../src/components/Input";
import Button from "../../src/components/Button";

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

interface PaginatedResponse<T> {
  total: number;
  limit: number;
  skip: number;
  data: T[];
}

const PAGE_SIZE = 20;

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

function LoadingSkeleton() {
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: '#E5E7EB' }]} />
      <View style={styles.infoContainer}>
        <View style={[styles.skeletonText, { width: '60%', height: 16, marginBottom: 8 }]} />
        <View style={[styles.skeletonText, { width: '80%', height: 14 }]} />
      </View>
    </View>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={colors.disabled} />
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

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

function AddUserModal({
  visible,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
    email?: string;
    password?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const phoneInputRef = useRef<PhoneInput>(null);

  const isFormValid =
    fullName.length > 0 && phone.length > 0 && email.length > 0 && password.length > 0;

  const handleClose = () => {
    setFullName("");
    setPhone("");
    setEmail("");
    setPassword("");
    setErrors({});
    onClose();
  };

  const getFirebaseErrorMessage = (error: AuthError): string => {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email is already registered";
      case "auth/invalid-email":
        return "Invalid email address";
      case "auth/weak-password":
        return "Password should be at least 6 characters";
      case "auth/operation-not-allowed":
        return "Email/password sign-up is disabled";
      default:
        return error.message || "Failed to create user";
    }
  };

  const handleAddUser = async () => {
    setErrors({});

    const newErrors: typeof errors = {};
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || firstName;

    if (fullName.length < 2) {
      newErrors.fullName = "Full name is too short";
    }

    const checkPhone = phoneInputRef.current?.isValidNumber(phone);
    if (!checkPhone) {
      newErrors.phone = "Invalid phone number";
    }

    if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!isValidPassword(password)) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      console.log("[AddUser] Creating Firebase user:", { email, firstName, lastName });

      // 1. Create Firebase user with email and password
      const auth = getFirebaseAuth();
      const firebaseRes = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUid = firebaseRes.user.uid;

      console.log("[AddUser] Firebase user created, uid:", firebaseUid);

      // 2. Create user in backend
      await (feathersClient as any).service("users").create({
        firstName,
        lastName,
        email,
        phone,
        firebaseUid,
        role: "company",
        type: "legal-entity",
        companyId: user?.companyId,
      });

      console.log("[AddUser] Backend user created successfully");

      // 3. Handle success - close modal and refresh list
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error("[AddUser] Error:", error);

      // Handle Firebase auth errors
      if (error.code && error.code.startsWith("auth/")) {
        const message = getFirebaseErrorMessage(error as AuthError);
        setErrors({ email: message });
      } else {
        // Handle backend errors
        const message = error.message || "Failed to add user";
        Alert.alert("Error", message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getPhoneBorderColor = () => {
    if (errors.phone) return colors.danger;
    if (phoneFocused) return colors.focus;
    return colors.border;
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          entering={SlideInUp.duration(300)}
          exiting={SlideOutDown.duration(200)}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Pressable style={styles.modalBackButton} onPress={handleClose}>
              <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.modalTitle}>Add User</Text>
            <Pressable style={styles.modalCloseButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </Pressable>
          </View>

          <KeyboardAvoidingView
            style={styles.modalKeyboardView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Animated.View
                  entering={FadeInDown.delay(200).duration(400)}
                  style={styles.formSection}
                >
                  <Input
                    label="Full Name"
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      setErrors((prev) => ({ ...prev, fullName: undefined }));
                    }}
                    placeholder="Enter full name"
                    autoCapitalize="words"
                    error={errors.fullName}
                  />
                </Animated.View>

                <Animated.View
                  entering={FadeInDown.delay(300).duration(400)}
                  style={styles.phoneWrapper}
                >
                  <Text style={styles.label}>Phone</Text>
                  <View
                    style={[
                      styles.phoneInputOuterContainer,
                      { borderColor: getPhoneBorderColor() },
                    ]}
                  >
                    <View style={styles.phoneIconLeft}>
                      <Ionicons name="call" size={18} color={colors.textSecondary} />
                    </View>
                    <PhoneInput
                      ref={phoneInputRef}
                      value={phone}
                      defaultCode="UZ"
                      layout="first"
                      onChangeText={(text) => {
                        setPhone(text);
                        setErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      containerStyle={styles.phoneInput}
                      textContainerStyle={styles.phoneTextInput}
                      codeTextStyle={styles.phoneCodeText}
                      flagButtonStyle={styles.phoneFlagButton}
                      textInputStyle={styles.phoneTextInputStyle}
                      placeholder="Phone number"
                      textInputProps={{
                        onFocus: () => setPhoneFocused(true),
                        onBlur: () => setPhoneFocused(false),
                        placeholderTextColor: colors.textSecondary,
                      }}
                    />
                  </View>
                  {errors.phone && (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  )}
                </Animated.View>

                <Animated.View
                  entering={FadeInDown.delay(400).duration(400)}
                  style={styles.formSection}
                >
                  <Input
                    label="Email"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="Enter email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                  />
                </Animated.View>

                <Animated.View
                  entering={FadeInDown.delay(500).duration(400)}
                  style={styles.formSection}
                >
                  <Input
                    label="Password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (text.length >= 6) {
                        setErrors((prev) => ({ ...prev, password: undefined }));
                      }
                    }}
                    placeholder="Enter password"
                    secureTextEntry
                    error={errors.password}
                  />
                </Animated.View>

                <Animated.View
                  entering={FadeInDown.delay(600).duration(400)}
                  style={styles.formSection}
                >
                  <Button
                    title="Add User"
                    onPress={handleAddUser}
                    disabled={!isFormValid}
                    loading={loading}
                  />
                </Animated.View>
              </ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function Users() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const fetchUsers = useCallback(
    async (reset = false) => {
      const currentSkip = reset ? 0 : skip;
      const shouldReset = reset;

      if (shouldReset) {
        setIsLoading(true);
        setError(null);
      }

      try {
        console.log("[Users] Fetching users, skip:", currentSkip);

        const response = await (feathersClient as any).service("users").find({
          query: {
            companyId: user?.companyId,
            $sort: { createdAt: -1 },
            $limit: PAGE_SIZE,
            $skip: currentSkip,
          },
        });

        const fetchedUsers: User[] =
          (response as PaginatedResponse<User>).data || response;
        const totalUsers =
          (response as PaginatedResponse<User>).total || fetchedUsers.length;

        console.log(
          "[Users] Fetched:",
          fetchedUsers.length,
          "users, total:",
          totalUsers
        );

        if (shouldReset) {
          setUsers(fetchedUsers);
        } else {
          setUsers((prev) => [...prev, ...fetchedUsers]);
        }

        const fetchedCount = fetchedUsers.length;
        setHasMore(
          fetchedCount === PAGE_SIZE &&
            users.length + fetchedCount < totalUsers
        );
        setSkip(currentSkip + fetchedCount);
        setError(null);
      } catch (err: any) {
        console.error("[Users] Fetch error:", err);
        if (shouldReset) {
          setError(err.message || "Failed to load users");
        }
      } finally {
        setIsLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [user?.companyId, skip, users.length]
  );

  useEffect(() => {
    if (user?.companyId) {
      fetchUsers(true);
    } else if (user && !user.companyId) {
      setIsLoading(false);
      setError("No company associated with your account");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.companyId]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers(true);
  }, [fetchUsers]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !error) {
      setIsLoadingMore(true);
      fetchUsers(false);
    }
  }, [isLoadingMore, hasMore, error, fetchUsers]);

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          console.log("[Users] Logging out...");
          await logout();
          console.log("[Users] Redirecting to login...");
          router.replace("/login");
        },
      },
    ]);
  };

  const handleRetry = () => {
    setError(null);
    fetchUsers(true);
  };

  const renderUser = ({ item }: { item: User }) => <UserRow user={item} />;

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

  const renderHeaderActions = () => (
    <View style={styles.headerActions}>
      <Pressable
        style={styles.addButton}
        onPress={() => setShowAddUserModal(true)}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.logoutButtonPressed,
        ]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="#DC2626" />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Users</Text>
          {renderHeaderActions()}
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </View>
        <AddUserModal
          visible={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          onSuccess={() => fetchUsers(true)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Users</Text>
        {renderHeaderActions()}
      </View>

      {error ? (
        <ErrorState message={error} onRetry={handleRetry} />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
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
              <Text style={styles.countText}>{users.length} users</Text>
            </View>
          }
          ListEmptyComponent={<EmptyState message="No users found" />}
        />
      )}

      <AddUserModal
        visible={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSuccess={() => fetchUsers(true)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
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
    fontWeight: "600",
    color: "#DC2626",
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 8,
  },
  listHeader: {
    marginBottom: 12,
  },
  countText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
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
  skeletonText: {
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
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
    fontSize: 13,
    color: colors.danger,
    marginTop: 6,
    fontWeight: "500",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: 60,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalBackButton: {
    padding: 4,
    width: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
    width: 40,
    alignItems: "flex-end",
  },
  modalKeyboardView: {
    flex: 1,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    paddingBottom: 100,
  },
  formSection: {
    marginBottom: 20,
  },
  phoneWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
    fontWeight: "400",
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
});
