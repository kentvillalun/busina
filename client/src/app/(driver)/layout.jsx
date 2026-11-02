// The driver app installs as its own app: this manifest replaces the commuter one for every page under /driver.
// The proxy guards everything under /driver (its own cookie and sign-in).
export const metadata = {
  title: "Busina Driver",
  manifest: "/driver-manifest.json",
  appleWebApp: { title: "Driver" },
};

export const viewport = { themeColor: "#FFFFFF" };

export default function DriverLayout({ children }) {
  return children;
}
