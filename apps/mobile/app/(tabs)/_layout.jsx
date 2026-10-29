import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomNavItem from "../../src/components/BottomNavItem";
import IconHomeOutline from "../../src/components/svg/IconHomeOutline";
import IconHomeSolid from "../../src/components/svg/IconHomeSolid";
import IconSettingsOutline from "../../src/components/svg/IconSettingsOutline";
import IconSettingsSolid from "../../src/components/svg/IconSettingsSolid";

// The Figma nav bar is white at 0.38 over a blurred map. Without the blur (expo-blur, added later)
// the content behind would show through, so the fill is more opaque for now.
const pill = {
  position: "absolute",
  alignSelf: "center",
  flexDirection: "row",
  alignItems: "center",
  padding: 6,
  gap: 4,
  borderRadius: 999,
  borderWidth: 1.5,
  borderColor: "rgba(255,255,255,0.9)",
  backgroundColor: "rgba(255,255,255,0.8)",
  shadowColor: "#0f2133",
  shadowOpacity: 0.14,
  shadowOffset: { width: 0, height: 10 },
  shadowRadius: 14,
  elevation: 6,
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        {/* one object, not an array: Slot throws on an array style in its child */}
        <View style={{ ...pill, bottom: insets.bottom + 12 }}>
          <TabTrigger name="home" href="/home" asChild>
            <BottomNavItem
              label="Home"
              SolidIcon={IconHomeSolid}
              OutlineIcon={IconHomeOutline}
            />
          </TabTrigger>
          <TabTrigger name="settings" href="/settings" asChild>
            <BottomNavItem
              label="Settings"
              SolidIcon={IconSettingsSolid}
              OutlineIcon={IconSettingsOutline}
            />
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}
