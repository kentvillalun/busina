// The API says SOUTHBOUND when a bus moves toward the end of its route line and NORTHBOUND toward the start (a route is
// named "A - B" and its line runs from A to B). The words stay generic so no route is tied to a place: the places come
// from the route's own name.
export const DIRECTION_WORDS = {
  SOUTHBOUND: { title: "Outbound", hint: "toward the end of the route" },
  NORTHBOUND: { title: "Inbound", hint: "toward the start of the route" },
};

// Where a bus is heading, read from its route name: "B" going outbound, "A" going inbound. null when the name has no two ends.
export const headingTo = (routeName, direction) => {
  const ends = routeName?.split(" - ");
  if (ends?.length !== 2) return null;
  if (direction === "SOUTHBOUND") return ends[1];
  if (direction === "NORTHBOUND") return ends[0];
  return null;
};
