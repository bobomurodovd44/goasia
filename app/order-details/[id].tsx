import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  FadeInRight,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../../src/components/Button";
import { colors } from "../../src/theme/colors";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MIN_PRICE = 1;
const MAX_PRICE = 150;

const VEHICLES = [
  { id: '1', name: 'Chevrolet Malibu', plate: '01 A 777 AA', color: 'Pearl White', type: 'Business' },
  { id: '2', name: 'Hyundai Sonata', plate: '01 B 123 BB', color: 'Metallic Silver', type: 'Comfort' },
  { id: '3', name: 'Kia K5', plate: '01 C 456 CC', color: 'Phantom Black', type: 'Business' },
];

const DRIVERS = [
  { id: '1', name: 'Javohir Ahmedov', rating: 4.9, experience: '5 years', trips: 1240 },
  { id: '2', name: 'Otabek Ganiev', rating: 4.8, experience: '3 years', trips: 856 },
  { id: '3', name: 'Mansur Karimov', rating: 5.0, experience: '7 years', trips: 2103 },
];

export default function OrderDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [price, setPrice] = useState(45);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Slider Logic
  const SLIDER_HPADDING = 40; // Increased padding to make slider narrower
  const containerWidth = SCREEN_WIDTH - (SLIDER_HPADDING * 2);
  const handleSize = 32;
  const maxTravel = containerWidth - handleSize;

  // Initial translation based on price
  const initialX = ((price - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * maxTravel;
  
  const translateX = useSharedValue(initialX);
  const context = useSharedValue(0);
  const currentPriceShared = useSharedValue(price);
  const isDragging = useSharedValue(false);
  
  const animatedHandleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: withSpring(isDragging.value ? 1.25 : 1, { damping: 15 }) }
    ],
    backgroundColor: isDragging.value ? colors.primary : colors.background,
    borderColor: isDragging.value ? colors.background : colors.primary,
    shadowOpacity: withSpring(isDragging.value ? 0.3 : 0.1),
    shadowRadius: withSpring(isDragging.value ? 12 : 4),
  }));

  const animatedTrackStyle = useAnimatedStyle(() => ({
    width: translateX.value + (handleSize / 2),
    height: withSpring(isDragging.value ? 10 : 8),
    opacity: withSpring(isDragging.value ? 1 : 0.9),
  }));

  const animatedInnerHandleStyle = useAnimatedStyle(() => ({
    backgroundColor: isDragging.value ? colors.background : colors.primary,
    transform: [{ scale: withSpring(isDragging.value ? 0.8 : 1) }]
  }));

  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .activeOffsetX([-10, 10])
    .onStart(() => {
      context.value = translateX.value;
      isDragging.value = true;
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    })
    .onUpdate((event) => {
      const nextX = Math.max(0, Math.min(context.value + event.translationX, maxTravel));
      translateX.value = nextX;
      
      const newPrice = Math.round(MIN_PRICE + (nextX / maxTravel) * (MAX_PRICE - MIN_PRICE));
      if (newPrice !== currentPriceShared.value) {
        currentPriceShared.value = newPrice;
        runOnJS(setPrice)(newPrice);
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    })
    .onEnd(() => {
      isDragging.value = false;
      const finalPrice = Math.round(MIN_PRICE + (translateX.value / maxTravel) * (MAX_PRICE - MIN_PRICE));
      // Snap translateX to the exact price position for visual perfection
      translateX.value = withSpring(((finalPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * maxTravel);
      runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
    });

  const handleSliderPress = (event: any) => {
    // Relative to the overlay which is full width
    const touchX = event.nativeEvent.locationX;
    const centerAdjustedX = touchX - (handleSize / 2);
    const nextX = Math.max(0, Math.min(centerAdjustedX, maxTravel));
    
    const newPrice = Math.round(MIN_PRICE + (nextX / maxTravel) * (MAX_PRICE - MIN_PRICE));
    
    translateX.value = withSpring(((newPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * maxTravel, { 
      damping: 20, 
      stiffness: 90 
    });
    
    if (newPrice !== price) {
      setPrice(newPrice);
      currentPriceShared.value = newPrice;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const isFormValid = selectedVehicle && selectedDriver;

  const handleSubmit = () => {
    if (!isFormValid) {
      Alert.alert("Assignment Required", "Please select both a vehicle and a driver to complete the bid.");
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "Bid Submitted Successfully", 
        `Your bid of $${price} with ${selectedVehicle.name} driven by ${selectedDriver.name} has been sent to the auction.`,
        [{ text: "Done", onPress: () => router.back() }]
      );
    }, 1800);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.contentContainer} edges={["top"]}>
        {/* Modern Header */}
        <View style={styles.header}>
          <Pressable 
            onPress={() => router.back()} 
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Order Assignment</Text>
            <View style={styles.idBadge}>
              <Text style={styles.idText}>ID: {id}</Text>
            </View>
          </View>
          <Pressable style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          {/* Trip Summary Section */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Trip Logistics</Text>
              <View style={styles.timerContainer}>
                <Ionicons name="time-outline" size={14} color="#D97706" />
                <Text style={styles.timerText}>12m left</Text>
              </View>
            </View>
            <View style={styles.logisticsCard}>
               <View style={styles.routeItem}>
                  <View style={styles.routePointContainer}>
                    <View style={styles.startDot} />
                    <View style={styles.dashLine} />
                  </View>
                  <View style={styles.routeDetails}>
                    <Text style={styles.routeLabel}>Pickup Point</Text>
                    <Text style={styles.routeValue}>Tashkent Int. Airport</Text>
                  </View>
               </View>
               <View style={styles.routeItem}>
                  <View style={styles.routePointContainer}>
                    <Ionicons name="location" size={20} color={colors.danger} />
                  </View>
                  <View style={styles.routeDetails}>
                    <Text style={styles.routeLabel}>Destination</Text>
                    <Text style={styles.routeValue}>Hilton City Center</Text>
                  </View>
               </View>
            </View>
          </Animated.View>

          {/* Price Slider Section */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Your Bid Amount</Text>
              <Text style={styles.priceDisplay}>${price}</Text>
            </View>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderTrackBackground} />
              <Animated.View 
                style={[
                  styles.sliderTrackActive, 
                  animatedTrackStyle
                ]} 
              />
              <GestureDetector gesture={panGesture}>
                <Pressable 
                  style={styles.sliderTrackOverlay} 
                  onPress={handleSliderPress}
                >
                  <Animated.View style={[styles.sliderHandle, animatedHandleStyle]}>
                    <Animated.View style={[styles.handleInner, animatedInnerHandleStyle]} />
                  </Animated.View>
                </Pressable>
              </GestureDetector>
              <View style={styles.sliderLabels}>
                <Text style={styles.limitLabel}>${MIN_PRICE}</Text>
                <Text style={styles.limitLabel}>${MAX_PRICE}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Vehicle Selection */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.section}>
            <Text style={styles.sectionLabel}>Select Vehicle</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {VEHICLES.map((v, index) => {
                const isSelected = selectedVehicle?.id === v.id;
                return (
                  <Animated.View key={v.id} entering={FadeInRight.delay(400 + index * 100)}>
                    <Pressable 
                      onPress={() => setSelectedVehicle(v)}
                      style={[
                        styles.vehicleCard,
                        isSelected && styles.selectedCard
                      ]}
                    >
                      <View style={[styles.vehicleIconBox, isSelected && styles.selectedIconBox]}>
                        <MaterialCommunityIcons 
                          name="car-settings" 
                          size={28} 
                          color={isSelected ? colors.background : colors.primary} 
                        />
                      </View>
                      <Text style={[styles.vehicleBrand, isSelected && styles.whiteText]}>{v.name}</Text>
                      <Text style={[styles.vehicleType, isSelected && styles.whiteTextMuted]}>{v.type}</Text>
                      <View style={[styles.plateBadge, isSelected && styles.whitePlate]}>
                        <Text style={styles.plateText}>{v.plate}</Text>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Driver Selection */}
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.section}>
            <Text style={styles.sectionLabel}>Assign Driver</Text>
            {DRIVERS.map((d, index) => {
              const isSelected = selectedDriver?.id === d.id;
              return (
                <Pressable 
                  key={d.id}
                  onPress={() => setSelectedDriver(d)}
                  style={[
                    styles.driverItem,
                    isSelected && styles.selectedDriverItem
                  ]}
                >
                  <View style={styles.driverInfoLeft}>
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>{d.name.charAt(0)}</Text>
                      {isSelected && (
                        <View style={styles.checkBadge}>
                          <Ionicons name="checkmark" size={10} color={colors.background} />
                        </View>
                      )}
                    </View>
                    <View style={styles.driverMeta}>
                      <Text style={[styles.driverName, isSelected && styles.whiteText]}>{d.name}</Text>
                      <View style={styles.driverStats}>
                        <Ionicons name="star" size={12} color={isSelected ? "#FFD700" : "#F59E0B"} />
                        <Text style={[styles.statsText, isSelected && styles.whiteTextMuted]}>
                          {d.rating} • {d.experience} exp
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.tripsInfo}>
                    <Text style={[styles.tripsCount, isSelected && styles.whiteText]}>{d.trips}</Text>
                    <Text style={[styles.tripsLabel, isSelected && styles.whiteTextMuted]}>trips</Text>
                  </View>
                </Pressable>
              );
            })}
          </Animated.View>
        </ScrollView>

        {/* Action Footer */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <Button 
            title="Submit Assignment"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!isFormValid}
            style={styles.submitButton}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonPressed: {
    backgroundColor: "#E2E8F0",
    transform: [{ scale: 0.95 }],
  },
  headerInfo: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    fontWeight: "700",
    color: colors.textPrimary,
  },
  idBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  idText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "700",
  },
  infoButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 150,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 8,
    paddingVertical: 4,
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
  logisticsCard: {
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.5)",
    ...Platform.select({
      ios: { shadowColor: "#0F172A", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16 },
      android: { elevation: 2 },
    }),
  },
  routeItem: {
    flexDirection: "row",
    gap: 16,
  },
  routePointContainer: {
    width: 20,
    alignItems: "center",
  },
  startDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  dashLine: {
    width: 1,
    height: 32,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginVertical: 4,
  },
  routeDetails: {
    flex: 1,
    paddingBottom: 20,
  },
  routeLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    marginBottom: 4,
  },
  routeValue: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  priceDisplay: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.primary,
  },
  sliderContainer: {
    height: 60,
    justifyContent: "center",
  },
  sliderTrackBackground: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    position: "absolute",
    left: 0,
    right: 0,
  },
  sliderTrackActive: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
    position: "absolute",
    left: 0,
  },
  sliderTrackOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 40,
    justifyContent: "center",
  },
  sliderHandle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  handleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  limitLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
  },
  horizontalScroll: {
    paddingRight: 40,
    gap: 16,
    paddingVertical: 8,
  },
  vehicleCard: {
    width: 160,
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.8)",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8 },
      android: { elevation: 1 },
    }),
  },
  selectedCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    transform: [{ scale: 1.05 }],
  },
  vehicleIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  selectedIconBox: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  vehicleBrand: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  vehicleType: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    fontWeight: "500",
  },
  plateBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  whitePlate: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  plateText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  driverItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.8)",
  },
  selectedDriverItem: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  driverInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  checkBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  driverMeta: {
    gap: 2,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  driverStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statsText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  tripsInfo: {
    alignItems: "center",
  },
  tripsCount: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  tripsLabel: {
    fontSize: 10,
    color: "#94A3B8",
    textTransform: "uppercase",
    fontWeight: "700",
  },
  whiteText: {
    color: colors.background,
  },
  whiteTextMuted: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: "rgba(226, 232, 240, 0.5)",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 20 },
      android: { elevation: 10 },
    }),
  },
  submitButton: {
    borderRadius: 18,
    height: 56,
  },
});
