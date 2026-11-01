import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./db.js";

// No sessions: the strategy only finds or creates the Commuter; auth.controller then issues our own JWT cookie.
// Registered only when the Google keys exist, so the rest of the API still runs without them.
const configurePassport = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are empty: Google sign-in is off");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        proxy: true, // runs behind the client's /api rewrite and Render's proxy
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0];
          if (!email?.value || !email.verified) return done(null, false); // Google must vouch for the email

          const commuter = await prisma.commuter.upsert({
            where: { googleId: profile.id },
            update: { email: email.value, name: profile.displayName },
            create: { googleId: profile.id, email: email.value, name: profile.displayName },
          });
          return done(null, commuter.active ? commuter : false);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );
};

export { configurePassport };
