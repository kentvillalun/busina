"use client";

import { useEffect, useState } from "react";
import { Body, Card, DetailPage } from "@/components/settings/DetailPage";
import PermissionCard from "@/components/settings/PermissionCard";
import { ALERT_BUS_KEY, ALERT_MINUTES_KEY, DEFAULT_ALERT_MINUTES } from "@/hooks/useNearBusAlert";
import useSavedSetting from "@/hooks/useSavedSetting";
import { askAlerts, getAlertsPermission } from "@/lib/permissions";

const MINUTES = [5, 10, 15];

export default function AlertsPage() {
  const [permission, setPermission] = useState(null);
  const [turningOn, setTurningOn] = useState(false);
  const [minutes, setMinutes] = useSavedSetting(ALERT_MINUTES_KEY, DEFAULT_ALERT_MINUTES);
  const [alertBus, setAlertBus] = useSavedSetting(ALERT_BUS_KEY, null);

  useEffect(() => {
    getAlertsPermission().then(setPermission);
  }, []);

  const turnOn = async () => {
    setTurningOn(true);
    setPermission(await askAlerts());
    setTurningOn(false);
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
    </DetailPage>
  );
}
