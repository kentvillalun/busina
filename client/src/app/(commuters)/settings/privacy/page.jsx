import { Body, Card, DetailPage } from "@/components/settings/DetailPage";

export const metadata = { title: "Privacy Policy" };

const CONTACT = "khentvillalun@gmail.com";

const Item = ({ title, children }) => (
  <Card>
    <h2 className="font-medium text-ink">{title}</h2>
    {children}
  </Card>
);

const List = ({ items }) => (
  <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-5.5 text-muted">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

export default function PrivacyPage() {
  return (
    <DetailPage title="Privacy Policy">
      <p className="px-1 text-[13px] text-muted">
        Last updated: November 2, 2026. We follow the Data Privacy Act of 2012 (RA 10173).
      </p>

      <Item title="What we collect">
        <List
          items={[
            "If you sign in with Google: your email, your name and your Google account ID.",
            "If you turn on alerts: the boarding spot you chose, or, in \"My location\" mode, the last position of your phone that the app saw (refreshed about every 30 seconds while the app is open).",
            "Also for alerts: your alert settings (minutes before arrival, direction, chosen bus), a list of buses already alerted, and the address and keys your browser gives us so we can send notifications to your phone.",
            "Guests: nothing is stored on our server. Your direction and spot stay in your phone's own storage.",
            "Buses: the bus devices send the bus position, speed and seat data. This is about the bus, not about riders.",
          ]}
        />
      </Item>
      <Item title="Why">
        <Body>
          Only to sign you in, show buses near you, and send the alerts you asked for. We do not sell your data, show
          ads, or build profiles.
        </Body>
      </Item>
      <Item title="Your location">
        <Body>
          Busina asks for location only while the app is open and never tracks you in the background. If you use
          &quot;My location&quot; mode for alerts, the last position the app saw is stored on our server so we can
          time the alert. That position has no expiry: it stays until you log out, switch to a boarding spot, or ask
          us to delete it.
        </Body>
      </Item>
      <Item title="Who else sees data">
        <List
          items={[
            "Google handles sign-in.",
            "Apple, Google, Mozilla or Microsoft (whichever runs your browser's notification service) carry the notification. The text (bus number, minutes, seats free) is encrypted, so only your phone can read it.",
            "Geoapify provides the map pictures and street names. Your browser asks it for the map area you view and, when you pick a spot, for the address of that point.",
            "Hosting runs on Vercel (the site), Render (the server) and Neon (the database, in Singapore).",
          ]}
        />
      </Item>
      <Item title="Cookies and storage">
        <Body>
          After sign-in we set one secure cookie (commuter_token) that keeps you signed in for up to 7 days. Scripts on
          the page cannot read it. We also keep a few settings in your phone&apos;s storage, such as direction and
          boarding spot.
        </Body>
      </Item>
      <Item title="How long we keep it">
        <Body>
          Logging out removes that browser&apos;s alert registration (and the stored position) and clears your spot
          and chosen bus from the phone. Your account (email and name) stays until you ask us to delete it. We have no
          delete-account button yet.
        </Body>
      </Item>
      <Item title="How we protect it">
        <Body>
          Connections use HTTPS, the session cookie is httpOnly, logging out invalidates the session, requests are
          rate limited, and notification keys are never written to logs. No system is perfectly secure.
        </Body>
      </Item>
      <Item title="Your rights">
        <Body>
          You may ask to see, correct or delete your data, or to withdraw your consent, by writing to {CONTACT}. You
          may also complain to the National Privacy Commission.
        </Body>
      </Item>
      <Item title="Children">
        <Body>Busina is not meant for children under 13 to sign in with an account.</Body>
      </Item>
      <Item title="Changes">
        <Body>If we change this policy, the date above changes.</Body>
      </Item>
      <Item title="Contact">
        <Body>{CONTACT}</Body>
      </Item>
    </DetailPage>
  );
}
