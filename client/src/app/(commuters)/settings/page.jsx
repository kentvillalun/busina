"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import IconChevron from "@/components/icons/IconChevron";
import { Page } from "@/components/layout/Page";
import TopGradient from "@/components/layout/TopGradient";
import { PageContent } from "@/components/layout/PageContent";
import useSavedSetting from "@/hooks/useSavedSetting";
import { spotLabel } from "@/lib/geocode";
import { getAlertsPermission, getLocationPermission, permissionLabel } from "@/lib/permissions";

// The permission values are real; the "My trip" values are placeholders until the trip choices are saved.
const Section = ({ title, note, children }) => (
  <section className="flex flex-col gap-1.5">
    <h2 className="pl-2 font-medium text-muted">{title}</h2>
    <div className="divide-y divide-uncertain-bg overflow-hidden rounded-[28px] bg-white ">
      {children}
    </div>
    {note && (
      <p className="px-2 text-[13px] leading-4.5 text-muted">{note}</p>
    )}
  </section>
);

const Row = ({ label, hint, value, accent = false, right, href }) => {
  const Tag = right ? "div" : Link; // a switch inside a link would nest interactive elements
  return (
    <Tag
      {...(!right && { href })}
      className="flex w-full items-center gap-3 px-4.5 py-3.25 text-left"
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-medium text-ink">{label}</span>
        {hint && (
          <span className="text-[13px] leading-4.5 text-muted">{hint}</span>
        )}
      </span>
      {right ?? (
        <span className="flex items-center gap-2">
          {value && (
            <span
              className={
                accent
                  ? "text-[15px] font-bold text-primary"
                  : "text-[15px] text-muted"
              }
            >
              {value}
            </span>
          )}
          <IconChevron className="text-muted" />
        </span>
      )}
    </Tag>
  );
};

const Switch = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative h-7.5 w-12.5 shrink-0 rounded-full transition-colors ${
      checked ? "bg-primary" : "bg-line"
    }`}
  >
    <span
      className={`absolute top-0.75 size-6 rounded-full bg-white shadow transition-[left] ${
        checked ? "left-5.5" : "left-0.75"
      }`}
    />
  </button>
);

export default function SettingsPage() {
  const [background, setBackground] = useState(false);
  const [spot] = useSavedSetting("busina:spot", null); // { lat, lng } from the picker
  const [location, setLocation] = useState(null); // null while the permission is being read
  const [alerts, setAlerts] = useState(null);

  useEffect(() => {
    getLocationPermission().then(setLocation);
    getAlertsPermission().then(setAlerts);
  }, []);

  return (
    <Page className="bg-[#f4f8fb]">
      <TopGradient className="h-72" />
      <PageContent
        top="top-0"
        className="items-center gap-4 px-6 pt-14 md:px-24 md:pt-16 "
        withBottomNav={true}
      >
        <div className="flex w-full max-w-107.5 flex-col gap-4 md:max-w-xl ">
          <h1 className="font-display text-4xl leading-10.5 text-ink">
            Settings
          </h1>

          <Section title="Permissions">
            <Row
              href="/settings/location"
              label="Location"
              hint="Only while the app is open"
              value={permissionLabel(location)}
              accent={location?.canAskAgain}
            />
            <Row
              href="/settings/alerts"
              label="Alerts"
              hint="Warns you when a bus is near"
              value={permissionLabel(alerts)}
              accent={alerts?.canAskAgain}
            />
          </Section>

          <Section
            title="My trip"
            note="Alerts use your boarding spot to warn you before a bus arrives."
          >
            <Row
              href="/settings/boarding-spot"
              label="Boarding spot"
              hint={spot ? spotLabel(spot) : "Where you wait for the bus"}
              value={spot ? "Change" : "Not set"}
              accent={!!spot}
            />
            <Row href="/settings/direction" label="Direction" value="Toward Laoag" />
          </Section>

          <Section
            title="Optional"
            note="Uses background location. Off by default."
          >
            <Row
              label="Background alerts"
              hint="Alert me even when the app is closed"
              right={
                <Switch
                  checked={background}
                  onChange={setBackground}
                  label="Background alerts"
                />
              }
            />
          </Section>

          <Section
            title="About"
            note="Seat outlook and passenger counts are estimates."
          >
            <Row href="/settings/estimates" label="How estimates work" />
          </Section>
        </div>
      </PageContent>
    </Page>
  );
}
