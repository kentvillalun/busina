// Sample data for the operator insights screen (Figma S6).
// It is simulated: there is no trip history yet, so none of it comes from the buses. The screen says so.

export const HOURS = ["5A", "6A", "7A", "8A", "9A", "10A", "11A", "12P", "1P", "2P", "3P", "4P", "5P", "6P", "7P", "8P"];
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Average load when the bus leaves, in percent of seats; above 100 means standing riders. One row per day, one column per hour.
export const LOAD = [
  [47, 84, 103, 94, 59, 46, 58, 70, 56, 51, 74, 88, 92, 81, 56, 28],
  [47, 82, 101, 84, 66, 44, 59, 65, 62, 51, 70, 89, 94, 83, 49, 34],
  [42, 87, 102, 89, 59, 44, 55, 72, 63, 50, 66, 87, 99, 84, 52, 26],
  [48, 89, 102, 90, 62, 46, 52, 64, 56, 50, 70, 90, 99, 84, 56, 32],
  [41, 86, 100, 84, 65, 49, 51, 72, 59, 49, 74, 90, 99, 88, 53, 30],
  [29, 37, 55, 73, 81, 93, 82, 69, 69, 57, 66, 76, 74, 67, 44, 28],
  [16, 26, 40, 56, 63, 66, 63, 59, 55, 59, 74, 89, 100, 92, 70, 44],
];

export const KPIS = [
  { label: "Average load at departure", value: "68%", note: "Door sensors, estimate" },
  { label: "Peak window", value: "6–8 AM", note: "96% average load" },
  { label: "Under-used trips", value: "22%", note: "Below 40% load" },
  { label: "Over capacity at peak", value: "31%", note: "Of peak trips, standing riders" },
];

export const INSIGHT =
  "Weekday 7 AM and 5 PM trips run at 99–103% with riders standing, while 10 AM runs near 48%. Moving capacity from mid-morning to the two peaks fills seats without adding buses.";

export const SUGGESTIONS = [
  {
    tag: "Add trip",
    highlight: true,
    title: "Add a trip at 6:30 AM",
    text: "The 6:00 and 7:00 trips both run full on weekdays. A trip between them could split the load.",
  },
  {
    tag: "Move",
    title: "Move 1:00 PM to 3:30 PM",
    text: "1:00 PM averages 60% load. Demand builds from 3:00 PM.",
  },
  {
    tag: "Merge",
    title: "Merge the 8:00 PM trip",
    text: "Weekend evenings average 30% load. Consider joining the 7:00 PM trip.",
  },
];

export const SLOTS = [
  { time: "6:00 AM", days: "Mon–Fri", demand: "Peak", highlight: true, load: "96%", standing: "31% of trips", suggestion: "Add a 6:30 AM trip" },
  { time: "12:00 PM", days: "Mon–Fri", demand: "Steady", load: "58%", standing: "4% of trips", suggestion: "Keep" },
  { time: "3:00 PM", days: "Mon–Fri", demand: "Building", load: "70%", standing: "12% of trips", suggestion: "Keep and watch" },
  { time: "8:00 PM", days: "Sat–Sun", demand: "Low", load: "30%", standing: "0% of trips", suggestion: "Merge with 7:00 PM" },
];
