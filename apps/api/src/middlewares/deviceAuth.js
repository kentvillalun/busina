import { createHash, timingSafeEqual } from "node:crypto";
import { prisma } from "../config/db.js";
import { HttpError } from "../utils/HttpError.js";

// Authenticates an ESP32: `deviceId` in the body, secret in the X-Device-Key header.
// Only a SHA-256 hash of the key is stored (Bus.deviceKeyHash), so we hash the received key and compare.
// timingSafeEqual: a plain === stops at the first different byte, and that timing can leak the key.
// An unknown device and a wrong key return the same 401 so device ids cannot be probed.

const sha256 = (value) => createHash("sha256").update(value).digest();

const deviceAuth = async (req, res, next) => {
  try {
    const key = req.get("x-device-key") ?? "";
    const { deviceId } = req.body;

    const bus = await prisma.bus.findUnique({
      where: { deviceId },
      select: { id: true, busNumber: true, seatCount: true, active: true, deviceKeyHash: true },
    });

    const invalid = new HttpError(401, "Invalid device credentials", {
      code: "INVALID_DEVICE_CREDENTIALS",
    });

    if (!bus || key.length === 0) {
      return next(invalid);
    }

    if (!timingSafeEqual(sha256(key), Buffer.from(bus.deviceKeyHash, "hex"))) {
      return next(invalid);
    }

    // Only after the key is verified is it safe to reveal why the device is refused.
    if (!bus.active) {
      return next(new HttpError(403, "This device has been disabled", { code: "DEVICE_DISABLED" }));
    }

    req.bus = bus;
    next();
  } catch (error) {
    next(error);
  }
};

export { deviceAuth };
