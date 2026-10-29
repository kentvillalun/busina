const secondsSince = (serverTime, time) =>
  Math.max(0, Math.round((new Date(serverTime) - new Date(time)) / 1000));

// "8s ago" or "3 min ago"
const ago = (serverTime, lastPingAt) => {
  const seconds = secondsSince(serverTime, lastPingAt);
  return seconds < 60 ? `${seconds}s ago` : `${Math.floor(seconds / 60)} min ago`;
};

export { secondsSince, ago };
