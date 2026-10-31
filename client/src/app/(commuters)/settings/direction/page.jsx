"use client";

import { useState } from "react";
import { DetailPage } from "@/components/settings/DetailPage";

const OPTIONS = [
  { value: "NORTHBOUND", label: "Toward Laoag", hint: "Northbound buses" },
  { value: "SOUTHBOUND", label: "Toward Vigan", hint: "Southbound buses" },
];

export default function DirectionPage() {
  // TODO(you): load the saved direction, save the new one when it changes, and use it as the starting
  // tab on the home screen (home/page.jsx has `direction` in its own state).
  const [direction, setDirection] = useState("NORTHBOUND");

  return (
    <DetailPage title="Direction">
      <p className="px-2 text-[13px] leading-4.5 text-muted">Which way are you going? Alerts and the first tab on Home follow this.</p>
      <div role="radiogroup" aria-label="Direction" className="divide-y divide-uncertain-bg overflow-hidden rounded-[28px] bg-white">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={direction === option.value}
            onClick={() => setDirection(option.value)}
            className="flex w-full items-center gap-3 px-4.5 py-3.25 text-left"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="font-medium text-ink">{option.label}</span>
              <span className="text-[13px] leading-4.5 text-muted">{option.hint}</span>
            </span>
            <span
              className={`flex size-6 items-center justify-center rounded-full border-2 ${
                direction === option.value ? "border-primary" : "border-line"
              }`}
            >
              {direction === option.value && <span className="size-3 rounded-full bg-primary" />}
            </span>
          </button>
        ))}
      </div>
    </DetailPage>
  );
}
