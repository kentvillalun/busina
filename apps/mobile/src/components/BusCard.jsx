import { Text, View } from "react-native";
import { noPad } from "../lib/styles";
import { ago } from "../lib/time";

// Figma S1b. `selected` is the highlighted card (for now: the closest bus).
const BusCard = ({ bus, serverTime, selected }) => {
  const { state, stale } = bus;

  let seatsText = `${state.seatsFree} of ${bus.seatCount} seats free`;
  let seatsColor = "text-success";
  if (state.seatsFree === 0) {
    seatsText = `Full, ${state.standing} standing`;
    seatsColor = "text-muted";
  }
  if (stale) {
    seatsText = "Seats unavailable";
    seatsColor = "text-[#5a6b78]";
  }

  // The API has no ETA yet (FR8 will add it), so a bus can be live without one.
  const hasEta = !stale && bus.etaMin != null;
  let etaText = "—";
  let etaNote = "ETA coming soon";
  if (stale) etaNote = "no live ETA";
  if (hasEta) {
    etaText = `${bus.etaMin} min`;
    etaNote = "to your spot";
  }

  return (
    <View
      className={`gap-[10px] rounded-[16px] p-[14px] ${
        selected ? "border-primary bg-stage" : "border-line bg-white"
      }`}
      style={{ borderWidth: selected ? 1.5 : 1 }}
    >
      <View className="flex-row items-center gap-3">
        <View
          className={`min-w-[54px] items-center rounded-[10px] px-[10px] py-2 ${
            stale ? "border border-line bg-[#eef1f4]" : "bg-primary"
          }`}
        >
          <Text
            className={`font-display text-[18px] ${stale ? "text-[#5a6b78]" : "text-white"}`}
            numberOfLines={1}
            style={noPad}
          >
            {bus.busNumber}
          </Text>
        </View>

        <View className="flex-1 gap-[2px]">
          <Text className="font-sans-semi-bold text-[15px] text-ink" style={noPad} numberOfLines={1}>
            {bus.name}
          </Text>
          <Text className={`font-sans-medium text-[13px] ${seatsColor}`} style={noPad}>
            {seatsText}
          </Text>
        </View>

        <View className="items-end">
          <Text
            className={`font-display text-[22px] ${hasEta ? "text-navy" : "text-[#5a6b78]"}`}
            style={noPad}
          >
            {etaText}
          </Text>
          <Text className="font-sans text-[11px] text-muted" style={noPad}>
            {etaNote}
          </Text>
        </View>
      </View>

      <Text
        className={`font-sans text-[12px] ${stale ? "text-[#5a6b78]" : "text-muted"}`}
        style={noPad}
      >
        {stale
          ? `Signal lost · last seen ~${ago(serverTime, state.lastPingAt)}`
          : `~${state.onBoard} on board (est.) · Live ${ago(serverTime, state.lastPingAt)}`}
      </Text>
    </View>
  );
};

export default BusCard;
