import { router } from "expo-router";
import { useEffect, useState } from "react";
import { BackHandler, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeroAlerts from "../../src/components/HeroAlerts";
import HeroCard from "../../src/components/HeroCard";
import HeroIllustration from "../../src/components/HeroIllustration";
import HeroLocation from "../../src/components/HeroLocation";
import PrimaryButton from "../../src/components/PrimaryButton";
import ProgressDots from "../../src/components/ProgressDots";
import StepTransition from "../../src/components/StepTransition";
import TextButton from "../../src/components/TextButton";
import Logo from "../../src/components/svg/Logo";
import { askAlerts, askLocation } from "../../src/lib/permissions";
import { setOnboardingDone } from "../../src/lib/storage";

const steps = [
  {
    headings: (
      <>
        Is the bus <Text className="text-primary">near</Text>?{"\n"}
        Is there a <Text className="text-primary">seat</Text>?
      </>
    ),
    body: "See where your bus is and how many seats are left, before it reaches you.",
    primary: "Continue",
    progress: (
      <Text className="font-sans-bold text-xs text-muted">1 of 3</Text>
    ),
  },
  {
    headings: (
      <>
        Know how long{"\n"}you'll <Text className="text-primary">wait</Text>
      </>
    ),
    body: "Busina uses your location to show how long until a bus reaches you. Only while the app is open.",
    primary: "Show buses near me",
    secondary: "Not now",
    onPrimary: askLocation, // asks for the location permission, then moves on
    progress: (
      <Text className="font-sans-bold text-xs text-muted">2 of 3</Text>
    ),
  },
  {
    headings: (
      <>
        Never miss{"\n"}your <Text className="text-primary">bus</Text>
      </>
    ),
    body: "We’ll tell you when your bus is close, so you don’t have to keep watching the map. Then you’re all set.",
    primary: "Turn on alerts & start",
    secondary: "Start without alerts",
    onPrimary: askAlerts, // asks for the notification permission, then finishes
    progress: (
      <Text className="font-sans-bold text-xs text-primary">Last step</Text>
    ),
  },
];

const scenes = [<HeroIllustration />, <HeroLocation />, <HeroAlerts />];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);

  const current = steps[step];
  const isLast = step === steps.length - 1;

  // Remember that onboarding was seen, then go home. `replace` (not `push`) so the
  // back button cannot return to the onboarding.
  const finish = async () => {
    await setOnboardingDone();
    router.replace("/home");
  };

  const next = () => {
    if (isLast) finish();
    else setStep(step + 1);
  };

  // Main button: ask for this step's permission (if it has one), then continue
  // whatever the user answered. `busy` blocks double taps while the dialog is open.
  const [busy, setBusy] = useState(false);
  const handlePrimary = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await current.onPrimary?.();
      console.log("permission result:", result); // TODO (later): keep this in the app state
    } catch (error) {
      console.warn("permission request failed:", error);
    } finally {
      setBusy(false);
    }
    next();
  };

  // Android back button: go to the previous step instead of leaving the app.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (step > 0) {
        setStep(step - 1);
        return true; // handled
      }
      return false; // on the first step: let Android do its normal thing
    });
    return () => sub.remove();
  }, [step]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-6">
        <Logo width={132} height={43} />
        <TextButton title="Skip" bold={false} onPress={finish} />
      </View>

      <View className="flex-1 pb-4">
        {/* flexible card: grows up to 380 on tall phones, shrinks on short ones */}
        <HeroCard className="mx-6 mt-4 max-h-[380px] min-h-[160px] flex-1">
          <StepTransition stepKey={step} kind="fade">
            {scenes[step]}
          </StepTransition>
        </HeroCard>

        <StepTransition stepKey={step} className="mt-7 gap-3 px-6">
          <Text
            className="font-display text-[32px] leading-[38px] text-ink"
            style={{ includeFontPadding: false }}
          >
            {current.headings}
          </Text>
          <Text
            className="font-sans text-base leading-6 text-muted"
            style={{ includeFontPadding: false }}
          >
            {current.body}
          </Text>
        </StepTransition>
      </View>

      <View className="gap-4 px-6 pb-4">
        <View className="gap-3">
          <View className="flex-row items-center gap-3">
            <ProgressDots step={step} total={steps.length} />
            {current.progress}
          </View>
          <PrimaryButton
            title={current.primary}
            onPress={handlePrimary}
            disabled={busy}
          />
        </View>
        {current.secondary ? (
          <TextButton title={current.secondary} onPress={next} />
        ) : null}
      </View>
    </SafeAreaView>
  );
}
