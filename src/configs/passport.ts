import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/user';
import {
  callbackURL,
  clientID,
  clientSecret,
} from '../constants/env_variables';

export const setupPassport = () => {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username });

        if (!user) {
          return done(null, false, { message: 'Користувача не знайдено' });
        }

        const isMatch = await user.comparePassword?.(password);

        if (!isMatch) {
          return done(null, false, { message: 'Невірний пароль' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await User.findOne({ googleId: profile.id });

          if (existingUser) {
            return done(null, existingUser);
          }

          const newUser = await User.create({
            username: profile.displayName,
            googleId: profile.id,
          });

          return done(null, newUser);
        } catch (err) {
          done(err);
        }
      },
    ),
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });
};
