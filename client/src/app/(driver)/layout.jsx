// The driver app: its own sign-in (bus code and PIN) and, later, its own manifest. The proxy guards everything under /driver.
export const metadata = {
  title: "Busina Driver",
  appleWebApp: { title: "Driver" },
};

export default function DriverLayout({ children }) {
  return children;
}
