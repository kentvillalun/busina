import { Text, View } from "react-native";
import { noPad } from "../lib/styles";
import PulseRing from "./PulseRing";

// The "Live 8s" pill. `seconds` is the age of the freshest ping across all buses.
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

export default LiveStatus;
