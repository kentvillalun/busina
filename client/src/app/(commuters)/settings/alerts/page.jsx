"use client";

import { useEffect, useState } from "react";
import { DetailPage } from "@/components/settings/DetailPage";
import PermissionCard from "@/components/settings/PermissionCard";
import { askAlerts, getAlertsPermission } from "@/lib/permissions";

export default function AlertsPage() {
  const [permission, setPermission] = useState(null);
  const [turningOn, setTurningOn] = useState(false);

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
        purpose="Alerts tell you when it is time to leave for your boarding spot, so you wait less by the road. On iPhone they work once Busina is added to the Home Screen."
        permission={permission}
        onTurnOn={turnOn}
        turningOn={turningOn}
        setting="Notifications"
      />
    </DetailPage>
  );
}
