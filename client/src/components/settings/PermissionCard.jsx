import { Body, Card } from "@/components/settings/DetailPage";

// What a permission is for, where it stands now, and how to change it. `permission` is
// { granted, canAskAgain, supported } from lib/permissions.js, or null while it is being read.
const PermissionCard = ({ purpose, permission, onTurnOn, turningOn = false, setting }) => {
  let status = "Checking...";
  if (permission) {
    if (!permission.supported) status = "Not available on this browser";
    else if (permission.granted) status = "On";
    else if (permission.canAskAgain) status = "Off";
    else status = "Blocked";
  }
  const blocked = permission?.supported && !permission.granted && !permission.canAskAgain;

  return (
    <>
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-ink">Status</h2>
          <span className={`text-[15px] font-bold ${permission?.granted ? "text-success" : "text-muted"}`}>{status}</span>
        </div>
        <Body>{purpose}</Body>
        {permission?.supported && !permission.granted && permission.canAskAgain && (
          <button
            type="button"
            onClick={onTurnOn}
            disabled={turningOn}
            className="mt-2 h-12 rounded-full bg-linear-to-b from-primary-light to-primary-dark font-bold text-white disabled:opacity-60"
          >
            {turningOn ? "Waiting for your answer..." : "Turn on"}
          </button>
        )}
      </Card>
      {blocked && (
        <Card>
          <h2 className="font-medium text-ink">Turn it back on</h2>
          <Body>
            The browser will not ask again once it was blocked. Tap the lock icon next to the address, open Site
            settings, and set {setting} to Allow. Then come back and open this screen again.
          </Body>
        </Card>
      )}
    </>
  );
};

export default PermissionCard;
