import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";

// Both are variable fonts, so every weight comes from one file.
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });

export const metadata = {
  title: "Busina",
  description: "See where your bus is, how many seats are free, and when to leave.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${bricolage.variable} h-full antialiased bg-[#f4f8fb]`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
