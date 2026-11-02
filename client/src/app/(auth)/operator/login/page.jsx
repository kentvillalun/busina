import OperatorLoginForm from "@/components/auth/OperatorLoginForm";

// Lives with the other sign-in pages but belongs to the operator app: it carries the operator manifest.
export const metadata = {
  title: "Busina Operator",
  manifest: "/operator-manifest.json",
  appleWebApp: { title: "Operator" },
};

export const viewport = { themeColor: "#FFFFFF" };

export default function OperatorLoginPage() {
  return <OperatorLoginForm />;
}
