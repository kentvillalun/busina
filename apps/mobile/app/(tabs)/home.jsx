import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PulseRing from "../../src/components/PulseRing";
import TextButton from "../../src/components/TextButton";
import { resetOnboarding } from "../../src/lib/storage";

const noPad = { includeFontPadding: false };

const makeSeats = (occupied) => Array.from({ length: 40 }, (_, i) => (i < occupied ? 1 : 0));

// MOCK: same shape as GET /buses. FR3 replaces this with the real response.
const MOCK = {
  serverTime: "2026-10-30T02:00:00.000Z",
  buses: [
    {
      id: "b1",
      busNumber: "214",
      name: "Sample Line Express",
      seatCount: 40,
      stale: false,
      state: {
        direction: "NORTHBOUND",
        seats: makeSeats(31),
        occupied: 31,
        seatsFree: 9,
        onBoard: 31,
        standing: 0,
        lastPingAt: "2026-10-30T01:59:52.000Z",
      },
    },
    {
      id: "b2",
      busNumber: "087",
      name: "Sample Line Ordinary",
      seatCount: 40,
      stale: true,
      state: {
        direction: "NORTHBOUND",
        seats: makeSeats(18),
        occupied: 18,
        seatsFree: 22,
        onBoard: 18,
        standing: 0,
        lastPingAt: "2026-10-30T01:56:40.000Z",
      },
    },
    {
      id: "b3",
      busNumber: "305",
      name: "Sample Line Aircon",
      seatCount: 40,
      stale: false,
      state: {
        direction: "NORTHBOUND",
        seats: makeSeats(40),
        occupied: 40,
        seatsFree: 0,
        onBoard: 46,
        standing: 6,
        lastPingAt: "2026-10-30T01:59:57.000Z",
      },
    },
    {
      id: "b4",
      busNumber: "112",
      name: "Sample Line Express",
      seatCount: 40,
      stale: false,
      state: {
        direction: "SOUTHBOUND",
        seats: makeSeats(12),
        occupied: 12,
        seatsFree: 28,
        onBoard: 12,
        standing: 0,
        lastPingAt: "2026-10-30T01:59:50.000Z",
      },
    },
  ],
};

const DIRECTIONS = [
  { key: "NORTHBOUND", title: "Northbound", hint: "toward Laoag" },
  { key: "SOUTHBOUND", title: "Southbound", hint: "toward Vigan" },
];

const secondsSince = (serverTime, time) =>
  Math.max(0, Math.round((new Date(serverTime) - new Date(time)) / 1000));

const ago = (serverTime, lastPingAt) => {
  const seconds = secondsSince(serverTime, lastPingAt);
  return seconds < 60 ? `${seconds}s ago` : `${Math.floor(seconds / 60)} min ago`;
};

const DirectionTab = ({ item, selected, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className="h-[60px] flex-1 items-center justify-center overflow-hidden rounded-[14px]"
    >
      {selected && (
        <LinearGradient colors={["#3a8fd6", "#165a98"]} style={StyleSheet.absoluteFill} />
      )}
      <Text
        className={`font-sans-bold text-[15px] ${selected ? "text-white" : "text-muted"}`}
        style={noPad}
      >
        {item.title}
      </Text>
      <Text
        className={`font-sans-medium text-[12px] ${selected ? "text-white" : "text-muted"}`}
        style={noPad}
      >
        {item.hint}
      </Text>
    </Pressable>
  );
};

const BusCard = ({ bus, serverTime }) => {
  const { state, stale } = bus;
  const full = state.seatsFree === 0;

  return (
    <View className="flex-row items-center gap-3">
      <View
        className={`rounded-[10px] px-[10px] py-2 ${stale ? "bg-[#eef1f4]" : "bg-primary"}`}
      >
        <Text
          className={`font-display text-[18px] ${stale ? "text-[#5a6b78]" : "text-white"}`}
          style={noPad}
        >
          {bus.busNumber}
        </Text>
      </View>

      <View className="flex-1 gap-[2px]">
        <Text className="font-sans-medium text-[15px] text-ink" style={noPad} numberOfLines={1}>
          {bus.name}
        </Text>
        {stale ? (
          <Text className="font-sans-medium text-[13px] text-muted" style={noPad}>
            Signal lost
          </Text>
        ) : (
          <Text
            className={`font-sans-medium text-[13px] ${full ? "text-muted" : "text-success"}`}
            style={noPad}
          >
            {full
              ? `Full, ${state.standing} standing`
              : `${state.seatsFree} of ${bus.seatCount} seats free`}
          </Text>
        )}
      </View>

      <View className="items-end">
        <Text className="font-sans-medium text-[11px] text-muted" style={noPad}>
          {stale ? "Last seen" : "Live"}
        </Text>
        <Text className="font-sans-bold text-[13px] text-navy" style={noPad}>
          {ago(serverTime, state.lastPingAt)}
        </Text>
      </View>
    </View>
  );
};

// `seconds` is the age of the freshest ping across all buses.
const LiveStatus = ({ seconds }) => {
  return (
    <View className="flex-row items-center gap-[6px] rounded-full bg-white py-[6px] pl-[10px] pr-3">
      <View className="h-4 w-4 items-center justify-center">
        <PulseRing size={16} duration={1600} />
        <View className="h-2 w-2 rounded-full bg-primary" />
      </View>
      <Text className="font-sans-bold text-[12px] text-navy" style={noPad}>
        Live
      </Text>
      <Text className="font-sans-medium text-[12px] text-muted" style={noPad}>
        {seconds}s
      </Text>
    </View>
  );
};

export default function HomeScreen() {
  const [direction, setDirection] = useState("NORTHBOUND");

  const buses = MOCK.buses.filter((bus) => bus.state?.direction === direction);
  const freshest = Math.min(
    ...MOCK.buses.map((bus) => secondsSince(MOCK.serverTime, bus.state.lastPingAt)),
  );

  return (
    <SafeAreaView className="flex-1 bg-stage">
      <View className="flex-row items-center justify-between px-6 pt-2">
        <Text className="font-display text-[22px] text-ink" style={noPad}>
          busina
        </Text>
        <LiveStatus seconds={freshest} />
      </View>

      <View className="mx-4 mt-4 flex-row gap-1 rounded-[18px] border border-line bg-white p-1">
        {DIRECTIONS.map((item) => (
          <DirectionTab
            key={item.key}
            item={item}
            selected={direction === item.key}
            onPress={() => setDirection(item.key)}
          />
        ))}
      </View>

      {/* <View className="mt-6 flex-1 px-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="font-display text-[18px] text-ink" style={noPad}>
            Buses coming to you
          </Text>
          <Text className="font-sans-medium text-[12px] text-muted" style={noPad}>
            {buses.length} {buses.length === 1 ? "bus" : "buses"}
          </Text>
        </View>

        <FlatList
          data={buses}
          keyExtractor={(bus) => bus.id}
          renderItem={({ item }) => <BusCard bus={item} serverTime={MOCK.serverTime} />}
          ItemSeparatorComponent={() => <View className="h-5" />}
          ListEmptyComponent={
            <Text className="font-sans text-[14px] text-muted">
              No buses going this direction right now.
            </Text>
          }
          ListFooterComponent={
            __DEV__ ? (
              <TextButton
                title="Reset onboarding (dev)"
                onPress={async () => {
                  await resetOnboarding();
                  router.replace("/");
                }}
                className="mt-8"
              />
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View> */}
    </SafeAreaView>
  );
}
