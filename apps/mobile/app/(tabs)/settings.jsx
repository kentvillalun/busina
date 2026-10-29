import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import IconChevron from "../../src/components/svg/IconChevron";
import { noPad } from "../../src/lib/styles";

// Static UI (Figma S12). The values on the right are placeholders until the real settings are wired in.

const cardShadow = {
  shadowColor: "#103b60",
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 10,
  elevation: 3,
};

// A titled white card. `note` is the small grey text under it.
const Section = ({ title, note, children }) => {
  return (
    <View className="gap-[6px]">
      <Text className="pl-2 font-sans-medium text-[16px] text-muted" style={noPad}>
        {title}
      </Text>
      <View className="rounded-[28px] bg-white" style={cardShadow}>
        {children}
      </View>
      {note && (
        <Text className="px-2 font-sans text-[13px] leading-[18px] text-muted" style={noPad}>
          {note}
        </Text>
      )}
    </View>
  );
};

// One row of a card: a title (and optional hint) on the left, something on the right.
// The right side is a value + chevron by default; pass `children` to replace it (e.g. a toggle).
const Row = ({ title, hint, value, valueClassName = "font-sans text-muted", children }) => {
  return (
    <View
      className={`flex-row items-center gap-3 px-[18px] ${hint ? "py-[13px]" : "py-[17px]"}`}
    >
      <View className="flex-1 gap-[2px]">
        <Text className="font-sans-medium text-[16px] text-ink" style={noPad}>
          {title}
        </Text>
        {hint && (
          <Text className="font-sans text-[13px] leading-[18px] text-muted" style={noPad}>
            {hint}
          </Text>
        )}
      </View>
      {children ?? (
        <View className="flex-row items-center gap-2">
          {value && (
            <Text className={`text-[15px] ${valueClassName}`} style={noPad}>
              {value}
            </Text>
          )}
          <IconChevron />
        </View>
      )}
    </View>
  );
};

// Thin line between two rows, indented to start under the text.
const Divider = () => {
  return (
    <View className="pl-[18px]">
      <View className="h-px bg-[#eef1f4]" />
    </View>
  );
};

// shortcut: off state only, add the on state when the setting is wired.
const Toggle = () => {
  return (
    <View className="h-[30px] w-[50px] justify-center rounded-full bg-line px-[2px]">
      <View
        className="h-[26px] w-[26px] rounded-full bg-white"
        style={{ shadowColor: "#103b60", shadowOpacity: 0.2, shadowRadius: 3, elevation: 2 }}
      />
    </View>
  );
};

export default function SettingsScreen() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#f4f8fb]">
      {/* bottom padding keeps the last card clear of the floating nav */}
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        <View className="px-6 pt-3">
          <Text className="font-display text-[36px] leading-[42px] text-ink" style={noPad}>
            Settings
          </Text>

          <View className="mt-[18px] gap-4">
            <Section title="Permissions">
              <Row title="Location" hint="Only while the app is open" value="On" />
              <Divider />
              <Row
                title="Alerts"
                hint="Warns you when a bus is near"
                value="Turn on"
                valueClassName="font-sans-bold text-primary"
              />
            </Section>

            <Section
              title="My trip"
              note="Alerts use your boarding spot to warn you before a bus arrives."
            >
              <Row title="Boarding spot" hint="Where you wait for the bus" value="Not set" />
              <Divider />
              <Row title="Direction" value="Toward Laoag" />
            </Section>

            <Section title="Optional" note="Uses background location. Off by default.">
              <Row title="Background alerts" hint="Alert me even when the app is closed">
                <Toggle />
              </Row>
            </Section>

            <Section title="About" note="Seat outlook and passenger counts are estimates.">
              <Row title="How estimates work" />
            </Section>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
