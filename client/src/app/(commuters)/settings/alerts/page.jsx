"use client";

import { useEffect, useState } from "react";
import { Body, Card, DetailPage } from "@/components/settings/DetailPage";
import PermissionCard from "@/components/settings/PermissionCard";
import { ALERT_MINUTES_KEY, DEFAULT_ALERT_MINUTES } from "@/hooks/useNearBusAlert";
import useSavedSetting from "@/hooks/useSavedSetting";
import { askAlerts, getAlertsPermission } from "@/lib/permissions";

const MINUTES = [5, 10, 15];

export default function AlertsPage() {
  const [permission, setPermission] = useState(null);
  const [turningOn, setTurningOn] = useState(false);
  const [minutes, setMinutes] = useSavedSetting(ALERT_MINUTES_KEY, DEFAULT_ALERT_MINUTES);

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
    </DetailPage>
  );
}
