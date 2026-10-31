import OperatorShell from "@/components/operator/OperatorShell";

// The operator area installs as its own app: this manifest replaces the commuter one for every page under /operator.
export const metadata = {
  title: "Operator insights",
  manifest: "/operator-manifest.json",
  appleWebApp: { title: "Operator" },
};

export const viewport = { themeColor: "#FFFFFF" };

export default function OperatorLayout({ children }) {
  return <OperatorShell>{children}</OperatorShell>;
}
