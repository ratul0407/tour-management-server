import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { IsActive, Role } from "../modules/user/user.interface";
import { Strategy as LocalStrategy } from "passport-local";
import bcryptjs from "bcryptjs";
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const isUserExists = await User.findOne({ email });
        if (!isUserExists) {
          return done("User does not exist");
        }

        if (
          isUserExists.isActive === IsActive.BLOCKED ||
          isUserExists.isActive === IsActive.INACTIVE
        ) {
          done(`User is ${isUserExists.isActive}`);
        }

        if (!isUserExists.isVerified) {
          done(" User is not verified");
        }
        if (isUserExists.isDeleted) {
          done("User is deleted");
        }
        const isGoogleAuthenticated = isUserExists.auths.some(
          (providerObjects) => providerObjects.provider === "google"
        );
        if (isGoogleAuthenticated && !isUserExists.password) {
          return done(
            "You have authenticated with google. If you want to login with password, first login with google and then set a password to login with a password for next time"
          );
        }
        const isPasswordMatched = bcryptjs.compare(
          password as string,
          isUserExists.password as string
        );

        if (!isPasswordMatched) {
          return done(null, false, { message: "Password does not match" });
        }
        return done(null, isUserExists);
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);
passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(null, false, { message: "No email Found" });
        }

        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            email,
            name: profile.displayName,
            picture: profile.photos?.[0].value,
            role: Role.USER,
            isVerified: true,
            auths: [
              {
                provider: "google",
                providerId: profile.id,
              },
            ],
          });
        }
        return done(null, user, { message: "User created successfully" });
      } catch (error) {
        console.log("Google strategy error", error);
        return done(error);
      }
    }
  )
);

passport.serializeUser(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user?._id);
  }
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.log(error);
    done(error);
  }
});
