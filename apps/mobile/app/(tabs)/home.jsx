import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet from "../../src/components/BottomSheet";
import BusCard from "../../src/components/BusCard";
import DirectionTab from "../../src/components/DirectionTab";
import LiveStatus from "../../src/components/LiveStatus";
import TextButton from "../../src/components/TextButton";
import { useFetch } from "../../src/hooks/useFetch";
import { distanceM } from "../../src/lib/geo";
import { getCurrentPosition } from "../../src/lib/permissions";
import { resetOnboarding } from "../../src/lib/storage";
import { noPad } from "../../src/lib/styles";
import { secondsSince } from "../../src/lib/time";

// The Android emulator reaches this computer at 10.0.2.2. On a real phone, set
// EXPO_PUBLIC_API_URL in apps/mobile/.env.local (and restart Metro with --clear).
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:4000";
const POLL_MS = 4000;
const MAX_FAILURES = 2; // after this many failed requests in a row, stop polling

const DIRECTIONS = [
  { key: "NORTHBOUND", title: "Northbound", hint: "toward Laoag" },
  { key: "SOUTHBOUND", title: "Southbound", hint: "toward Vigan" },
];

export default function HomeScreen() {
  const [direction, setDirection] = useState("NORTHBOUND");
  const [expanded, setExpanded] = useState(false); // sheet open = full list, collapsed = closest bus only
  const [userPos, setUserPos] = useState(null); // { lat, lng }, or null while unknown / location off
  const [refetchCount, setRefetchCount] = useState(0);

  const { data, errorCount } = useFetch({ url: `${API_URL}/buses`, refetchCount });
  const gaveUp = errorCount >= MAX_FAILURES;

  // useFetch asks the API again whenever refetchCount changes, so bump it every few seconds.
  // After repeated failures we stop, so a server that is down is not hit again and again;
  // the "Try again" button asks once more and polling restarts if that works.
  useEffect(() => {
    if (gaveUp) return;
    const timer = setInterval(() => setRefetchCount((count) => count + 1), POLL_MS);
    return () => clearInterval(timer);
  }, [gaveUp]);

  useEffect(() => {
    getCurrentPosition().then(setUserPos);
  }, []);

  // A bus that has never pinged has no state yet, so it cannot be shown.
  const allBuses = (data?.buses ?? []).filter((bus) => bus.state);

  // Closest bus first. A bus that lost its signal has an old position, so it always goes last.
  // Without the user's location the order stays as the API sent it.
  const buses = allBuses
    .filter((bus) => bus.state.direction === direction)
    .sort((a, b) => {
      if (a.stale !== b.stale) return a.stale ? 1 : -1;
      if (!userPos) return 0;
      return distanceM(userPos, a.state) - distanceM(userPos, b.state);
    });

  const freshest =
    allBuses.length > 0
      ? Math.min(...allBuses.map((bus) => secondsSince(data.serverTime, bus.state.lastPingAt)))
      : null;

  let emptyText = "No buses going this direction right now.";
  if (!data) emptyText = gaveUp ? "No buses to show." : "Loading buses...";

  return (
    <SafeAreaView className="flex-1 bg-stage">
      <View className="flex-row items-center justify-between px-6 pt-2">
        <Text className="font-display text-[22px] text-ink" style={noPad}>
          busina
        </Text>
        {gaveUp ? (
          <TextButton
            title="Can't connect. Try again"
            onPress={() => setRefetchCount((count) => count + 1)}
          />
        ) : (
          freshest !== null && <LiveStatus seconds={freshest} />
        )}
      </View>

      <View className="flex-col mx-6 mt-4">
        <Text className="text-[13px] font-sans-medium text-secondary" style={noPad}>Sunday, October 11</Text>
        <Text className="text-[26px] font-display text-ink" style={noPad}>Good morning</Text>
        <Text className="text-[14px] font-sans-semi-bold text-navy" style={noPad} >Bus 214 reaches you in ~4 min</Text>
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

      <BottomSheet onExpandedChange={setExpanded}>
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="font-display text-[18px] text-ink" style={noPad}>
            Buses coming to you
          </Text>
          <Text className="font-sans-medium text-[12px] text-muted" style={noPad}>
            {buses.length} {buses.length === 1 ? "bus" : "buses"}
          </Text>
        </View>

        <FlatList
          style={{ flex: 1 }}
          data={expanded ? buses : buses.slice(0, 1)}
          keyExtractor={(bus) => bus.id}
          renderItem={({ item, index }) => (
            <BusCard bus={item} serverTime={data.serverTime} selected={index === 0 && !item.stale} />
          )}
          ItemSeparatorComponent={() => <View className="h-5" />}
          ListEmptyComponent={<Text className="font-sans text-[14px] text-muted">{emptyText}</Text>}
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
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      </BottomSheet>
    </SafeAreaView>
  );
}
