import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Location {
  id: string;
  mainText: string;
  formattedAddress?: string;
  secondaryText?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface Meta {
  from: Location;
  to?: Location;
  regionId?: string;
  distanceKm?: number;
  fromDate: number;
  toDate?: number;
}

interface Order {
  _id: string;
  clientId: string;
  status:
    | "AwaitingPrice"
    | "AwaitingPayment"
    | "AwaitingPaymentBankTransfer"
    | "Pending"
    | "Approved"
    | "Cancelled";
  type: "Transfer" | "Trip" | "CityTour";
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
    status: "AwaitingPrice",
    type: "Transfer",
    meta: [
      {
        from: {
          id: "loc-1",
          mainText: "Tashkent International Airport",
          formattedAddress: "Tashkent, Uzbekistan",
          secondaryText: "Terminal 1 Arrivals",
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
          secondaryText: "Hotel Grand Samarkand",
        },
        to: {
          id: "loc-4",
          mainText: "Bukhara",
          formattedAddress: "Hotel Orient Star",
        },
        regionId: "region-1",
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
    status: "Pending",
    type: "CityTour",
    meta: [
      {
        from: {
          id: "loc-5",
          mainText: "Registan Square",
          formattedAddress: "Registan, Samarkand",
        },
        fromDate: 1737648000000,
      },
    ],
    contactDetails: {
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike@example.com",
      phone: "+998905556677",
    },
    notes: "Interested in historical sites tour",
    createdAt: 1736956800000,
    updatedAt: 1736956800000,
  },
  {
    _id: "4",
    clientId: "client-4",
    status: "AwaitingPayment",
    type: "Transfer",
    meta: [
      {
        from: {
          id: "loc-6",
          mainText: "Railway Station",
          formattedAddress: "Tashkent Railway Station",
        },
        to: {
          id: "loc-7",
          mainText: "Bukhara International Airport",
        },
        fromDate: 1737734400000,
      },
    ],
    contactDetails: {
      firstName: "Sarah",
      lastName: "Wilson",
      email: "sarah@example.com",
      phone: "+998901122334",
    },
    createdAt: 1736956800000,
    updatedAt: 1736956800000,
  },
  {
    _id: "5",
    clientId: "client-5",
    status: "Cancelled",
    type: "Trip",
    meta: [
      {
        from: {
          id: "loc-8",
          mainText: "Khiva",
        },
        to: {
          id: "loc-9",
          mainText: "Urgench",
        },
        distanceKm: 45,
        fromDate: 1736611200000,
        toDate: 1736697600000,
      },
    ],
    contactDetails: {
      firstName: "Tom",
      lastName: "Brown",
      email: "tom@example.com",
      phone: "+998908877766",
    },
    createdAt: 1736006400000,
    updatedAt: 1736352000000,
  },
  {
    _id: "6",
    clientId: "client-6",
    status: "AwaitingPaymentBankTransfer",
    type: "Transfer",
    meta: [
      {
        from: {
          id: "loc-10",
          mainText: "Hilton Tashkent City",
        },
        to: {
          id: "loc-11",
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
    createdAt: 1737216000000,
    updatedAt: 1737216000000,
  },
];

function formatDate(ts: number): string {
  const date = new Date(ts);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function getStatusBadgeStyle(
  status: Order["status"]
): { backgroundColor: string; color: string } {
  const styles: Record<Order["status"], { backgroundColor: string; color: string }> = {
    AwaitingPrice: { backgroundColor: "#FEF3C7", color: "#92400E" },
    AwaitingPayment: { backgroundColor: "#DBEAFE", color: "#1E40AF" },
    AwaitingPaymentBankTransfer: { backgroundColor: "#E0E7FF", color: "#3730A3" },
    Pending: { backgroundColor: "#FEF3C7", color: "#92400E" },
    Approved: { backgroundColor: "#D1FAE5", color: "#065F46" },
    Cancelled: { backgroundColor: "#FEE2E2", color: "#991B1B" },
  };
  return styles[status];
}

function getTypeBadgeStyle(
  type: Order["type"]
): { backgroundColor: string; color: string } {
  const styles: Record<Order["type"], { backgroundColor: string; color: string }> = {
    Transfer: { backgroundColor: "#F3F4F6", color: "#374151" },
    Trip: { backgroundColor: "#ECFDF5", color: "#065F46" },
    CityTour: { backgroundColor: "#EFF6FF", color: "#1E40AF" },
  };
  return styles[type];
}

function getRouteText(meta: Meta[]): string {
  const first = meta[0]?.from?.mainText || "";
  const last = meta[0]?.to?.mainText;
  if (last) {
    return `${first} → ${last}`;
  }
  return first;
}

export default function NewOrders() {
  const renderItem = ({ item }: { item: Order }) => {
    const statusStyle = getStatusBadgeStyle(item.status);
    const typeStyle = getTypeBadgeStyle(item.type);

    return (
      <View style={styles.card}>
        <View style={styles.routeContainer}>
          <Text style={styles.routeText}>{getRouteText(item.meta)}</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>

          <View style={styles.badgesRow}>
            <View
              style={[
                styles.badge,
                { backgroundColor: statusStyle.backgroundColor },
              ]}
            >
              <Text style={[styles.badgeText, { color: statusStyle.color }]}>
                {item.status.replace(/([A-Z])/g, " $1").trim()}
              </Text>
            </View>

            <View
              style={[styles.badge, { backgroundColor: typeStyle.backgroundColor }]}
            >
              <Text style={[styles.badgeText, { color: typeStyle.color }]}>
                {item.type}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={DUMMY_ORDERS}
        renderItem={renderItem}
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
  routeContainer: {
    marginBottom: 12,
  },
  routeText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    lineHeight: 22,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 13,
    color: "#6B7280",
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
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
});
