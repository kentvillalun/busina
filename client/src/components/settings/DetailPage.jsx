import Link from "next/link";
import IconChevron from "@/components/icons/IconChevron";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import TopGradient from "@/components/layout/TopGradient";

// The frame of every screen that opens from Settings: a back arrow, a title and the content below.
export const DetailPage = ({ title, children }) => (
  <Page className="bg-[#f4f8fb]">
    <TopGradient className="h-72" />
    <PageContent top="top-0" className="items-center gap-4 px-6 pt-14 md:px-24 md:pt-16" withBottomNav={true}>
      <div className="flex w-full max-w-107.5 flex-col gap-4 md:max-w-xl">
        <div className="flex items-center gap-2.5">
          <Link
            href="/settings"
            aria-label="Back to settings"
            className="-ml-1 flex size-9 items-center justify-center rounded-full text-ink active:bg-white/60"
          >
            <IconChevron className="size-6 rotate-180" />
          </Link>
          <h1 className="font-display text-[28px] leading-8 text-ink">{title}</h1>
        </div>
        {children}
      </div>
    </PageContent>
  </Page>
);

// A white card, the same look as a Settings section.
export const Card = ({ children, className = "" }) => (
  <div className={`flex flex-col gap-2 rounded-[28px] bg-white p-4.5 ${className}`}>{children}</div>
);

export const Body = ({ children }) => <p className="text-[15px] leading-5.5 text-muted">{children}</p>;
