"use client";

import { useEffect, useState } from "react";
import { DetailPage } from "@/components/settings/DetailPage";
import PermissionCard from "@/components/settings/PermissionCard";
import { askLocation, getLocationPermission } from "@/lib/permissions";

export default function LocationPage() {
  const [permission, setPermission] = useState(null);
  const [turningOn, setTurningOn] = useState(false);

  useEffect(() => {
    getLocationPermission().then(setPermission);
  }, []);

  const turnOn = async () => {
    setTurningOn(true);
    setPermission(await askLocation());
    setTurningOn(false);
  };

  return (
    <DetailPage title="Location">
      <PermissionCard
        purpose="Busina uses your location only while the app is open, to show the bus closest to you and how long it will take to reach you. Buses report their own GPS, and nothing is tracked in the background."
        permission={permission}
        onTurnOn={turnOn}
        turningOn={turningOn}
        setting="Location"
      />
    </DetailPage>
  );
}
