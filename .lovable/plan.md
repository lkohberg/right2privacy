## Goal

Require users to verify their email before they can use Right2Privacy, and enable password-based account recovery via email.

## Behavior

**Signup**
- After submitting email + password, Supabase sends a verification link to the user's inbox.
- The signup screen shows a "Check your email to verify" state instead of signing the user in.
- No profile / keypair is created yet — creation happens on the user's first successful sign-in after verification (this avoids orphaned rows for abandoned signups and keeps handle selection tied to a real user).
- If they try to sign in before verifying, they get a clear "Please verify your email" message with a "Resend verification email" button.

**Sign in**
- Standard email + password.
- On first sign-in after verification, if no profile exists, the existing keypair-generation + handle-picking flow runs (same code as today's signup path, just moved).

**Password reset ("Forgot password?")**
- Link on the sign-in screen → enter email → Supabase sends a reset link.
- New public route `/reset-password` where the user sets a new password.
- Clear warning on that screen: resetting the password will **not** recover past encrypted conversations, because the private key is protected by the old password. After reset, the user will get a fresh keypair and needs to re-add friends. (This matches the "Auth-only recovery" choice.)
- Implementation: on next sign-in after reset, detect that the stored `encrypted_private_key` can no longer be decrypted (wrong password) and offer a "Regenerate keys" action that overwrites `public_key` / `encrypted_private_key` / `pk_iv` / `pk_salt` on the profile and clears pending keys.

**Verification emails**
- Use Lovable's built-in auth emails (default templates). No custom email domain setup required.
- Raise the auth email rate limit modestly so bursts of signups/resets don't 429.

## Files to change

- `src/routes/auth.tsx` — split into three modes: Sign In, Sign Up, Forgot Password. Handle "email not confirmed" error. Move keypair generation + handle selection out of signup and into a "first sign-in, no profile yet" branch. Add "Resend verification".
- `src/routes/reset-password.tsx` (new, public) — reads Supabase recovery session from URL, calls `supabase.auth.updateUser({ password })`, then redirects to sign-in with a notice.
- `src/lib/crypto.ts` / profile update path — add a "regenerate keys" helper used when the old password can no longer unlock the stored key.
- `src/i18n/translations.ts` — add strings for verify-email screen, forgot password, reset password, key-loss warning.

## Backend

- Migration: none required for schema (profile row is created lazily on first sign-in, which the current insert policy already allows).
- Auth config: `disable_signup: false`, `auto_confirm_email: false`, `external_anonymous_users_enabled: false`, `password_hibp_enabled: true`, raise `rate_limit_email_sent` to 100/hour.
- `supabase.auth.signUp` uses `emailRedirectTo: window.location.origin`.
- `supabase.auth.resetPasswordForEmail` uses `redirectTo: ${window.location.origin}/reset-password`.

## Out of scope

- Custom-branded auth email templates (would need an email domain). Default Lovable auth emails are fine for now; we can brand them later if you want.
- Recovering old ciphertexts after a password reset — impossible by design without weakening security.
