import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type OrderStatus =
  | "AwaitingPrice"
  | "AwaitingPayment"
  | "AwaitingPaymentBankTransfer"
  | "Pending"
  | "Approved"
  | "Cancelled";

type OrderType = "Transfer" | "Trip" | "CityTour";

interface Location {
  id: string;
  mainText: string;
  formattedAddress?: string;
}

interface Meta {
  from: Location;
  to?: Location;
  distanceKm?: number;
  fromDate: number;
  toDate?: number;
}

interface Order {
  _id: string;
  clientId: string;
  status: OrderStatus;
  type: OrderType;
  meta: Meta[];
  contactDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    extraPhone?: string;
  };
  notes?: string;
  auctionStartTime?: number;
  auctionEndTime?: number;
  createdAt: number;
  updatedAt: number;
}

const DUMMY_ORDERS: Order[] = [
  {
    _id: "1",
    clientId: "client-1",
    status: "Pending",
    type: "Transfer",
    meta: [
      {
        from: {
          id: "loc-1",
          mainText: "Tashkent International Airport",
          formattedAddress: "Tashkent, Uzbekistan",
        },
        to: {
          id: "loc-2",
          mainText: "City Center Hotel",
          formattedAddress: "Tashkent city center",
        },
        fromDate: 1737388800000,
      },
    ],
    contactDetails: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "+998901234567",
    },
    auctionStartTime: Date.now(),
    auctionEndTime: Date.now() + 86400000,
    createdAt: 1737302400000,
    updatedAt: 1737302400000,
  },
  {
    _id: "2",
    clientId: "client-2",
    status: "Approved",
    type: "Trip",
    meta: [
      {
        from: {
          id: "loc-3",
          mainText: "Samarkand",
          formattedAddress: "Hotel Grand Samarkand",
        },
        to: {
          id: "loc-4",
          mainText: "Bukhara",
          formattedAddress: "Hotel Orient Star",
        },
        distanceKm: 270,
        fromDate: 1737475200000,
        toDate: 1737561600000,
      },
    ],
    contactDetails: {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      phone: "+998909876543",
      extraPhone: "+998901112233",
    },
    createdAt: 1737043200000,
    updatedAt: 1737129600000,
  },
  {
    _id: "3",
    clientId: "client-3",
    status: "AwaitingPrice",
    type: "Transfer",
    meta: [
      {
        from: {
          id: "loc-5",
          mainText: "Railway Station",
          formattedAddress: "Tashkent Railway Station",
        },
        to: {
          id: "loc-6",
          mainText: "Bukhara International Airport",
        },
        fromDate: 1737734400000,
      },
    ],
    contactDetails: {
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike@example.com",
      phone: "+998905556677",
    },
    auctionStartTime: Date.now() + 3600000,
    auctionEndTime: Date.now() + 172800000,
    createdAt: 1736956800000,
    updatedAt: 1736956800000,
  },
  {
    _id: "4",
    clientId: "client-4",
    status: "AwaitingPayment",
    type: "Trip",
    meta: [
      {
        from: {
          id: "loc-7",
          mainText: "Khiva",
        },
        to: {
          id: "loc-8",
          mainText: "Urgench",
        },
        distanceKm: 45,
        fromDate: 1736611200000,
        toDate: 1736697600000,
      },
    ],
    contactDetails: {
      firstName: "Sarah",
      lastName: "Wilson",
      email: "sarah@example.com",
      phone: "+998901122334",
    },
    notes: "Requires wheelchair accessible vehicle",
    createdAt: 1736006400000,
    updatedAt: 1736352000000,
  },
  {
    _id: "5",
    clientId: "client-5",
    status: "AwaitingPaymentBankTransfer",
    type: "Transfer",
    meta: [
      {
        from: {
          id: "loc-9",
          mainText: "Hilton Tashkent City",
        },
        to: {
          id: "loc-10",
          mainText: "Tashkent International Airport",
        },
        fromDate: 1737820800000,
      },
    ],
    contactDetails: {
      firstName: "Emily",
      lastName: "Davis",
      email: "emily@example.com",
      phone: "+998902244556",
    },
    auctionStartTime: Date.now() + 7200000,
    auctionEndTime: Date.now() + 259200000,
    createdAt: 1737216000000,
    updatedAt: 1737216000000,
  },
  {
    _id: "6",
    clientId: "client-6",
    status: "Cancelled",
    type: "CityTour",
    meta: [
      {
        from: {
          id: "loc-11",
          mainText: "Registan Square",
          formattedAddress: "Registan, Samarkand",
        },
        fromDate: 1737648000000,
      },
    ],
    contactDetails: {
      firstName: "Tom",
      lastName: "Brown",
      email: "tom@example.com",
      phone: "+998908877766",
    },
    notes: "Interested in historical sites tour",
    createdAt: 1736956800000,
    updatedAt: 1736956800000,
  },
];

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

function formatDateTime(ts: number): string {
  const date = new Date(ts);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

function getStatusBadgeStyle(
  status: OrderStatus
): { backgroundColor: string; color: string } {
  const styles: Record<OrderStatus, { backgroundColor: string; color: string }> = {
    AwaitingPrice: { backgroundColor: "#FEF3C7", color: "#92400E" },
    AwaitingPayment: { backgroundColor: "#DBEAFE", color: "#1E40AF" },
    AwaitingPaymentBankTransfer: { backgroundColor: "#E0E7FF", color: "#3730A3" },
    Pending: { backgroundColor: "#FEF3C7", color: "#92400E" },
    Approved: { backgroundColor: "#D1FAE5", color: "#065F46" },
    Cancelled: { backgroundColor: "#FEE2E2", color: "#991B1B" },
  };
  return styles[status];
}

function getTypeConfig(type: OrderType) {
  const configs: Record<OrderType, {
    icon: string;
    iconLib: "Ionicons" | "MaterialCommunityIcons";
    label: string;
    colors: { backgroundColor: string; color: string };
  }> = {
    Transfer: {
      icon: "car",
      iconLib: "Ionicons",
      label: "Transfer",
      colors: { backgroundColor: "#F3F4F6", color: "#374151" },
    },
    Trip: {
      icon: "briefcase",
      iconLib: "MaterialCommunityIcons",
      label: "Trip",
      colors: { backgroundColor: "#ECFDF5", color: "#065F46" },
    },
    CityTour: {
      icon: "map",
      iconLib: "Ionicons",
      label: "City Tour",
      colors: { backgroundColor: "#EFF6FF", color: "#1E40AF" },
    },
  };
  return configs[type];
}

function getAuctionCountdown(order: Order): string | null {
  if (!order.auctionEndTime) return null;
  return "Ends in 02:14:35";
}

function getRouteText(meta: Meta[]): string {
  const first = meta[0]?.from?.mainText || "";
  const last = meta[0]?.to?.mainText;
  if (last) {
    return `${first} → ${last}`;
  }
  return first;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const style = getStatusBadgeStyle(status);
  return (
    <View style={[styles.badge, { backgroundColor: style.backgroundColor }]}>
      <Text style={[styles.badgeText, { color: style.color }]}>
        {status.replace(/([A-Z])/g, " $1").trim()}
      </Text>
    </View>
  );
}

function TypeBadge({ type }: { type: OrderType }) {
  const config = getTypeConfig(type);
  const IconComponent = config.iconLib === "MaterialCommunityIcons"
    ? MaterialCommunityIcons
    : Ionicons;

  return (
    <View style={[styles.badge, { backgroundColor: config.colors.backgroundColor }]}>
      <IconComponent
        name={config.icon as any}
        size={14}
        color={config.colors.color}
      />
      <Text style={[styles.badgeText, { color: config.colors.color, marginLeft: 4 }]}>
        {config.label}
      </Text>
    </View>
  );
}

function CountdownBadge({ text }: { text: string }) {
  return (
    <View style={styles.countdownBadge}>
      <Ionicons name="time-outline" size={14} color="#FFFFFF" />
      <Text style={styles.countdownText}>{text}</Text>
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

export default function NewOrders() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const renderItem = ({ item }: { item: Order }) => {
    const statusStyle = getStatusBadgeStyle(item.status);
    const countdown = getAuctionCountdown(item);

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => setSelectedOrder(item)}
      >
        <View style={styles.routeContainer}>
          <Text style={styles.routeText}>{getRouteText(item.meta)}</Text>
        </View>

        <View style={styles.badgesContainer}>
            <StatusBadge status={item.status} />
            <TypeBadge type={item.type} />
          </View>
          {countdown && (
            <View style={styles.countdownContainer}>
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text style={styles.countdownLabel}>{countdown}</Text>
            </View>
          )}
      </Pressable>
    );
  };

  const order = selectedOrder;
  const countdown = order ? getAuctionCountdown(order) : null;
  const typeConfig = order ? getTypeConfig(order.type) : null;
  const statusStyle = order ? getStatusBadgeStyle(order.status) : null;
  const meta = order?.meta[0];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={DUMMY_ORDERS}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={!!selectedOrder}
        animationType="slide"
        transparent={false}
      >
        {order && (
          <SafeAreaView style={styles.modalContainer} edges={["top"]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setSelectedOrder(null)}
              >
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            <View style={styles.modalHeaderContent}>
              <StatusBadge status={order.status} />
              {typeConfig && (
                <View style={styles.modalTypeBadge}>
                  <Ionicons name={typeConfig.icon as any} size={16} color={typeConfig.colors.color} />
                  <Text style={[styles.modalTypeText, { color: typeConfig.colors.color }]}>
                    {typeConfig.label}
                  </Text>
                </View>
              )}
            </View>

            <ScrollView style={styles.modalBody}>
              {meta && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Route</Text>
                  <View style={styles.routeCard}>
                    <View style={styles.routePoint}>
                      <View style={styles.routeDot} />
                      <View>
                        <Text style={styles.routeMainText}>{meta.from.mainText}</Text>
                        {meta.from.formattedAddress && (
                          <Text style={styles.routeSubText}>{meta.from.formattedAddress}</Text>
                        )}
                      </View>
                    </View>
                    {meta.to && (
                      <View style={styles.routePoint}>
                        <View style={styles.routeLine} />
                        <View style={styles.routeDot} />
                        <View>
                          <Text style={styles.routeMainText}>{meta.to.mainText}</Text>
                          {meta.to.formattedAddress && (
                            <Text style={styles.routeSubText}>{meta.to.formattedAddress}</Text>
                          )}
                        </View>
                      </View>
                    )}
                    {meta.distanceKm && (
                      <Text style={styles.distanceText}>{meta.distanceKm} km</Text>
                    )}
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dates</Text>
                {meta && (
                  <>
                    <DetailRow label="From" value={formatDate(meta.fromDate)} />
                    {meta.toDate && (
                      <DetailRow label="To" value={formatDate(meta.toDate)} />
                    )}
                  </>
                )}
              </View>

              {order.auctionStartTime && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Auction</Text>
                  <DetailRow
                    label="Start"
                    value={formatDateTime(order.auctionStartTime)}
                  />
                  <DetailRow
                    label="End"
                    value={formatDateTime(order.auctionEndTime!)}
                  />
                  {countdown && (
                    <View style={styles.modalCountdownContainer}>
                      <CountdownBadge text={countdown} />
                    </View>
                  )}
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact</Text>
                <DetailRow
                  label="Name"
                  value={`${order.contactDetails.firstName} ${order.contactDetails.lastName}`}
                />
                <DetailRow label="Phone" value={order.contactDetails.phone} />
                <DetailRow label="Email" value={order.contactDetails.email} />
                {order.contactDetails.extraPhone && (
                  <DetailRow label="Extra Phone" value={order.contactDetails.extraPhone} />
                )}
              </View>

              {order.notes && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  <View style={styles.notesCard}>
                    <Text style={styles.notesText}>{order.notes}</Text>
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Info</Text>
                <DetailRow label="Order ID" value={order._id} />
                <DetailRow label="Created" value={formatDateTime(order.createdAt)} />
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
    padding: 16,
  },
  cardPressed: {
    opacity: 0.7,
  },
  routeContainer: {
    marginBottom: 12,
  },
  routeText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 24,
  },
  bottomRow: {},
  badgesContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  countdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  countdownLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  countdownBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  countdownText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
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
  modalTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  modalTypeText: {
    fontSize: 12,
    fontWeight: "500",
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
  routeCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2563EB",
    marginTop: 4,
  },
  routeLine: {
    position: "absolute",
    left: 5,
    top: 16,
    bottom: -16,
    width: 2,
    backgroundColor: "#E5E7EB",
  },
  routeMainText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  routeSubText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  distanceText: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 24,
    marginTop: 8,
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
  notesCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 12,
  },
  notesText: {
    fontSize: 14,
    color: "#92400E",
    fontStyle: "italic",
  },
  modalCountdownContainer: {
    marginTop: 12,
  },
});
