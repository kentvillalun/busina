import OperatorShell from "@/components/operator/OperatorShell";

export const metadata = { title: "Operator insights" };

export default function OperatorLayout({ children }) {
  return <OperatorShell>{children}</OperatorShell>;
}
