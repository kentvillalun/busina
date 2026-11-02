/* eslint-disable @next/next/no-img-element -- the logo is a small SVG; next/image would only add work */

import { BellAlertIcon, ClockIcon, MapPinIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import LandingNav from "@/components/landing/LandingNav";

export const metadata = {
  title: "Get Busina",
  description: "See where your bus is, how many seats are free, and when to leave. Open it in your browser or install the Android app.",
};

const FEATURES = [
  { Icon: MapPinIcon, title: "Live location", text: "See the bus on the road, updated every few seconds, with an arrival time as a range and a safety margin." },
  { Icon: Squares2X2Icon, title: "Seats free", text: "A seat map from the sensors on the bus: free, taken, or no reading. It matches the bus it is drawn for." },
  { Icon: BellAlertIcon, title: "Time to leave", text: "Pick your boarding spot and Busina alerts you when it is time to head there, even when the app is closed." },
  { Icon: ClockIcon, title: "Honest about signal", text: "If a bus goes quiet for 30 seconds the app says so, instead of showing old data as live." },
];

const STEPS = [
  { title: "On the bus", text: "A small unit with GPS, a seat load cell and a door counter reads the bus every few seconds." },
  { title: "In the cloud", text: "It sends the readings over 4G with its own secret key. The server checks them and works out direction and ETA." },
  { title: "On your phone", text: "You see the live map, the seats and the alerts, with no account needed to browse." },
];

const primaryButton = "flex h-14 items-center justify-center rounded-[14px] bg-linear-to-b from-primary-light to-primary-dark px-6 text-base font-bold text-white active:opacity-80";
const outlineButton = "flex h-14 items-center justify-center rounded-[14px] border border-line bg-white px-6 text-base font-bold text-ink active:bg-stage";
const container = "mx-auto w-full max-w-310 px-5 md:px-10";

// The placeholder screens are the raw screenshots in public/screenshots. Replace them with phone-framed PNGs (transparent
// background) and drop the radius and border on the two <Image>s in the hero.
const Phone = ({ src, alt, className }) => (
  <Image
    src={src}
    alt={alt}
    width={1170}
    height={2532}
    sizes="(min-width: 768px) 273px, 203px"
    priority
    className={`absolute h-auto w-50.75 rounded-[2.2rem] border border-line drop-shadow-[0_18px_28px_rgba(15,34,51,0.16)] md:w-68.25 ${className}`}
  />
);

// Figma "7 Landing page": L1 (desktop) and L2 (mobile). The wiring (links, download) is another task.
export default function GetPage() {
  return (
    <div className="flex-1 bg-[#f5f8fb]">
      <LandingNav />

      <section className="bg-stage pb-12 pt-28 md:pb-24 md:pt-40">
        <div className={`${container} flex flex-col items-center gap-10 xl:flex-row xl:gap-14`}>
          <div className="flex w-full flex-col gap-5 md:gap-6 xl:w-130 xl:shrink-0">
            <span className="w-fit rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-navy">
              UMAK ITSO 2026 · IoT category
            </span>
            <h1 className="font-display text-[38px] leading-[1.05] text-ink md:text-[60px]">Know where your bus is. Know if there is a seat.</h1>
            <p className="text-base leading-6 text-muted md:text-[19px] md:leading-7.5">
              Busina shows commuters live bus locations and free seats on provincial highways, and tells you when to leave for your boarding spot.
            </p>
            <div className="flex flex-col gap-2.5 md:flex-row md:gap-3">
              <Link href="/home" className={`${primaryButton} md:w-50`}>
                Open Busina
              </Link>
              <a href="/busina.apk" download="Busina.apk" className={`${outlineButton} md:w-50`}>
                Download APK
              </a>
            </div>
            <p className="text-xs leading-4.5 text-muted md:max-w-120 md:text-[13px]">
              No account needed to look at buses. The APK is the Busina web app packaged for Android.
            </p>
          </div>

          <div className="relative h-117.5 w-87.5 shrink-0 md:h-160 md:w-146">
            <Phone src="/screenshots/bus-details.png" alt="Bus details: the seats of a bus and its arrival time" className="left-2 top-9 md:left-0 md:top-14" />
            <Phone src="/screenshots/home.png" alt="Home: the road and the buses on it" className="left-35 top-0 md:left-75" />
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-20 bg-white py-14 md:py-24">
        <div className={`${container} flex flex-col items-center gap-7 md:gap-12`}>
          <div className="flex flex-col items-center gap-2 text-center md:gap-3">
            <h2 className="font-display text-[28px] leading-8.5 text-ink md:text-[40px] md:leading-11">Everything you need before the bus arrives</h2>
            <p className="text-[15px] text-muted md:text-lg">Real readings from a device on the bus, shown honestly.</p>
          </div>
          <div className="grid w-full gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
            {FEATURES.map(({ Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-[18px] border-[0.8px] border-line bg-[#f5f8fb] p-4.5 md:flex-col md:gap-3 md:rounded-[20px] md:p-6">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-stage text-primary md:size-13">
                  <Icon className="size-7" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1 md:gap-3">
                  <h3 className="font-display text-[19px] text-ink md:text-[22px]">{title}</h3>
                  <p className="text-sm leading-5 text-muted md:text-[15px]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="scroll-mt-20 py-14 md:py-24">
        <div className={`${container} flex flex-col items-center gap-7 md:gap-12`}>
          <div className="flex flex-col items-center gap-2 text-center md:gap-3">
            <h2 className="font-display text-[28px] text-ink md:text-[40px]">How it works</h2>
            <p className="text-[15px] text-muted md:text-lg">From the road to your phone in a few seconds.</p>
          </div>
          <div className="grid w-full gap-4 md:grid-cols-3 md:gap-5">
            {STEPS.map((step, index) => (
              <div key={step.title} className="flex flex-col gap-2.5 rounded-[18px] border-[0.8px] border-line bg-white p-5 md:gap-3 md:rounded-[20px] md:p-7">
                <span className="flex size-9 items-center justify-center rounded-full bg-linear-to-b from-primary-light to-primary-dark text-base font-bold text-white md:size-10 md:text-lg">
                  {index + 1}
                </span>
                <h3 className="font-display text-[21px] text-ink md:text-2xl">{step.title}</h3>
                <p className="text-[15px] leading-5.5 text-muted md:text-base md:leading-6">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="download" className="scroll-mt-20 pb-14 md:pb-24">
        <div className={container}>
          <div className="flex flex-col gap-8 rounded-3xl bg-navy p-6 md:gap-12 md:rounded-[28px] md:p-16">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:gap-12">
              <div className="flex flex-col gap-3.5 xl:w-140 xl:shrink-0">
                <h2 className="font-display text-[30px] text-white md:text-[40px]">Take Busina with you</h2>
                <p className="text-[15px] leading-5.5 text-white md:text-[17px] md:leading-6.5">
                  Open it in your browser right now, or install the Android app from the APK file. It also installs from your browser with Add to Home screen.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 xl:w-90">
                <Link href="/home" className="flex h-14 items-center justify-center rounded-[14px] bg-white px-5 text-base font-bold text-navy active:opacity-80">
                  Open Busina in your browser
                </Link>
                <a
                  href="/busina.apk"
                  download="Busina.apk"
                  className="flex h-14 items-center justify-center rounded-[14px] border-[1.5px] border-white/60 px-5 text-base font-bold text-white active:bg-white/10"
                >
                  Download APK for Android
                </a>
                <p className="text-xs text-white md:text-[13px]">Installs from the file, not the Play Store.</p>
              </div>
            </div>

            <div className="grid gap-3 border-t border-white/15 pt-6 md:grid-cols-3 md:gap-5 md:pt-8">
              <div className="flex flex-col gap-2 text-sm leading-5 text-white/85">
                <h3 className="font-medium text-white">Android (APK)</h3>
                <ol className="list-decimal pl-5">
                  <li>Open the downloaded Busina.apk.</li>
                  <li>If Android asks, allow your browser to install apps from this source.</li>
                  <li>Tap Install, then open Busina.</li>
                </ol>
                <p className="text-[13px] text-white/70">A warning about this type of file is normal for an app that does not come from the Play Store.</p>
              </div>
              <div className="flex flex-col gap-2 text-sm leading-5 text-white/85">
                <h3 className="font-medium text-white">From your browser</h3>
                <p>Open gobusina.vercel.app in Chrome, then choose Install app from the menu. It is the same app.</p>
              </div>
              <div className="flex flex-col gap-2 text-sm leading-5 text-white/85">
                <h3 className="font-medium text-white">iPhone</h3>
                <p>Open the site in Safari, tap Share, then Add to Home Screen. Notifications on iPhone work only from the Home Screen app.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t-[0.8px] border-line bg-white py-8 md:py-10">
        <div className={`${container} flex flex-col items-center gap-3.5 md:flex-row md:justify-between`}>
          <img src="/logo.svg" alt="Busina" width={104} height={34} />
          <p className="text-center text-xs text-muted md:text-sm">© 2026 Busina · UMAK ITSO 2026 · IoT category</p>
          <nav aria-label="Legal" className="flex gap-6 text-sm font-medium text-muted">
            <Link href="/settings/terms">Terms</Link>
            <Link href="/settings/privacy">Privacy</Link>
            <Link href="/operator/login">For operators</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
