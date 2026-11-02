"use client";

import { useEffect, useState } from "react";
import { Body, Card, DetailPage } from "@/components/settings/DetailPage";
import PermissionCard from "@/components/settings/PermissionCard";
import { ALERT_BUS_KEY, ALERT_MINUTES_KEY, DEFAULT_ALERT_MINUTES } from "@/hooks/useNearBusAlert";
import useSavedSetting from "@/hooks/useSavedSetting";
import { askAlerts, getAlertsPermission } from "@/lib/permissions";
import { requestPushSync, sendTestPush } from "@/lib/push";
import { stopWaiting, waitingStatus } from "@/lib/waiting";

const MINUTES = [5, 10, 15];

// What the test button says for each result of sendTestPush.
const TEST_MESSAGES = {
  sent: "Sent. It should reach this phone in a few seconds. Lock the screen to see it as an alert.",
  off: "Turn on notifications above first.",
  unsupported: "This browser can't receive alerts. On iPhone, add Busina to the Home Screen first.",
  "no-spot": "Set your boarding spot first (or use your location from Home), so alerts can be set up.",
  "no-position": "We can't get your location. Turn on location, or set a boarding spot.",
  guest: "Sign in first.",
  expired: "This phone's alert link had expired and was reset. Tap the button again.",
  "slow-down": "Please wait a minute before sending another test.",
  failed: "Could not send the test. Try again in a minute.",
};

export default function AlertsPage() {
  const [permission, setPermission] = useState(null);
  const [turningOn, setTurningOn] = useState(false);
  const [minutes, setMinutes] = useSavedSetting(ALERT_MINUTES_KEY, DEFAULT_ALERT_MINUTES);
  const [alertBus, setAlertBus] = useSavedSetting(ALERT_BUS_KEY, null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    getAlertsPermission().then(setPermission);
  }, []);

  // Whether drivers can see this commuter now: { minutes } while sharing, otherwise null.
  const [sharing, setSharing] = useState(null);
  useEffect(() => {
    waitingStatus().then((status) =>
      setSharing(status?.sharing ? { minutes: Math.max(1, Math.round((new Date(status.expiresAt) - Date.now()) / 60000)) } : null),
    );
  }, []);
  const stopSharing = async () => {
    setSharing(null);
    await stopWaiting();
  };

  const turnOn = async () => {
    setTurningOn(true);
    const result = await askAlerts();
    setPermission(result);
    setTurningOn(false);
    if (result.granted) requestPushSync();
  };

  const sendTest = async () => {
    setTesting(true);
    setTestResult(null);
    setTestResult(await sendTestPush());
    setTesting(false);
  };

  return (
    <DetailPage title="Alerts">
      <PermissionCard
        purpose="Alerts tell you when a bus is near your boarding spot, so you wait less by the road. On iPhone they work once Busina is added to the Home Screen."
        permission={permission}
        onTurnOn={turnOn}
        turningOn={turningOn}
        setting="Notifications"
      />
      <Card>
        <h2 className="font-medium text-ink">Alert me when the bus is</h2>
        <div role="radiogroup" aria-label="Minutes before the bus arrives" className="mt-2 flex gap-2">
          {MINUTES.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={minutes === value}
              onClick={() => setMinutes(value)}
              className={`h-11 flex-1 rounded-full text-[15px] font-bold ${
                minutes === value ? "bg-primary text-white" : "bg-stage text-ink"
              }`}
            >
              {value} min
            </button>
          ))}
        </div>
        <Body>away from your boarding spot. Alerts show while the app is open.</Body>
      </Card>
      <Card>
        <h2 className="font-medium text-ink">Alert for</h2>
        <div className="mt-1 flex items-center gap-3">
          <span className="flex-1 text-[15px] text-ink">
            {alertBus ? `Bus ${alertBus.busNumber}` : "Any bus going your direction"}
          </span>
          {alertBus && (
            <button type="button" onClick={() => setAlertBus(null)} className="text-[13px] font-bold text-primary">
              Clear
            </button>
          )}
        </div>
        <Body>Pick a bus on its details page to be alerted for that bus only.</Body>
      </Card>
      <Card>
        <h2 className="font-medium text-ink">Share with drivers</h2>
        <Body>
          {sharing
            ? `Drivers of buses heading your way can see an anonymous marker where you wait, for about ${sharing.minutes} more minutes.`
            : "Drivers cannot see you. You are asked before anything is shared, when you set a boarding spot or switch to My location."}
        </Body>
        {sharing && (
          <button type="button" onClick={stopSharing} className="mt-1 h-11 rounded-full bg-stage text-[15px] font-bold text-ink">
            Stop sharing
          </button>
        )}
      </Card>
      <Card>
        <h2 className="font-medium text-ink">Check that alerts work</h2>
        <Body>Sends one test notification to this phone.</Body>
        <button
          type="button"
          onClick={sendTest}
          disabled={testing}
          className="mt-1 h-11 rounded-full bg-primary text-[15px] font-bold text-white disabled:opacity-60"
        >
          {testing ? "Sending..." : "Send test notification"}
        </button>
        {testResult && (
          <p role="status" className={`text-[13px] leading-4.5 ${testResult === "sent" ? "text-success" : "text-fault"}`}>
            {TEST_MESSAGES[testResult]}
          </p>
        )}
      </Card>
    </DetailPage>
  );
}
