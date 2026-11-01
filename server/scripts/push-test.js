// Sends a test notification to a stored push subscription, so push can be checked without a bus.
//
//   npm run push:test            the newest subscription
//   npm run push:test -- --all   every subscription (they belong to real people: use only on a development database)
//
// It needs VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT in server/.env, and at least one subscription
// (turn alerts on in the app first). A subscription the push service refuses with 404/410 is deleted, as in production.
import { disconnectDB, prisma } from "../src/config/db.js";
import { sendPush } from "../src/services/push.js";

const all = process.argv.includes("--all");
const subscriptions = await prisma.pushSubscription.findMany({
  orderBy: { updatedAt: "desc" },
  ...(all ? {} : { take: 1 }),
});

if (subscriptions.length === 0) {
  console.log("No push subscriptions yet. Turn alerts on in the app first.");
} else {
  for (const subscription of subscriptions) {
    // Only the push service's host is printed: the endpoint itself is a secret address.
    const result = await sendPush(subscription, {
      title: "Busina test",
      body: "If you can read this, push works.",
      tag: "busina-test",
      data: { url: "/home" },
    });
    console.log(`${new URL(subscription.endpoint).host}: ${result}`);
  }
}

await disconnectDB();
