import { Body, Card, DetailPage } from "@/components/settings/DetailPage";

export const metadata = { title: "Terms and Conditions" };

const CONTACT = "khentvillalun@gmail.com";

const Item = ({ title, children }) => (
  <Card>
    <h2 className="font-medium text-ink">{title}</h2>
    <Body>{children}</Body>
  </Card>
);

export default function TermsPage() {
  return (
    <DetailPage title="Terms and Conditions">
      <p className="px-1 text-[13px] text-muted">Last updated: November 2, 2026</p>

      <Item title="1. What Busina is">
        Busina is a commuter app that shows where a bus is, how many seats are free, and about when it will reach you.
        It uses a GPS and seat device on the bus. If we add paid plans or premium features in the future, we will tell
        you before it happens, and we will not charge you without your agreement.
      </Item>
      <Item title="2. Estimates are not promises">
        Arrival times, seat counts and the number of people on board are estimates. Traffic, a weak GPS signal or a
        sensor error can make them wrong. When a bus stops reporting, we show &quot;Signal lost&quot; instead of
        guessing. Please do not rely on Busina alone for anything urgent or safety-related.
      </Item>
      <Item title="3. Using the app">
        You can use the map, bus details and settings as a guest. Alerts and your boarding spot need a Google sign-in.
        Do not break, overload or reverse-engineer the service. Do not send fake data to it, and do not use it to
        track or harass anyone.
      </Item>
      <Item title="4. Your account and misuse">
        You sign in with Google, and we never see your Google password. You can log out at any time. Misuse means
        things like creating many accounts to get around limits, sending automated or excessive requests, saving fake
        alert addresses, or trying to reach other people&apos;s data. If we see misuse, we may limit, suspend or
        disable the account, and we may remove its saved alerts. A suspended account is signed out on its next
        request. If you think we made a mistake, email us and we will review it.
      </Item>
      <Item title="5. Alerts">
        Alerts are push notifications. They depend on your phone, browser, network and settings. They may be late or
        may not arrive. They are a convenience, not a guarantee.
      </Item>
      <Item title="6. Availability">
        We run Busina on paid cloud services and aim to keep it available. Outages, maintenance, or bus devices going
        offline can still happen. We may change, pause or stop features at any time.
      </Item>
      <Item title="7. Liability">
        Busina is provided &quot;as is&quot;. To the extent the law allows, the Busina team is not responsible for a
        missed bus, a delay, or any loss from using the app or from not being able to use it.
      </Item>
      <Item title="8. Changes">
        We may update these terms. The date above shows the latest version. If you keep using Busina after a change,
        you accept it.
      </Item>
      <Item title="9. Contact">{CONTACT}</Item>
    </DetailPage>
  );
}
