# Right2Privacy — Plan

A site where users encrypt messages for friends without trusting the transport (SMS, Discord, etc.). The ciphertext is copy-pasted through any channel; the AES key travels privately through our server, wrapped with the recipient's RSA public key.

## Brand
- Name: **Right2Privacy**, tagline directly below: *"Privacy is a human right."*
- Clean, trust-forward design (dark, minimal, mono accents for crypto blobs).

## Core flow (Alice → Bob)
1. Alice writes plaintext in the composer.
2. Browser generates a random AES-GCM 256 key, encrypts the message → ciphertext blob.
3. Alice picks Bob from her friends list. Browser fetches Bob's RSA public key, wraps the AES key with RSA-OAEP, and POSTs the wrapped key + a message-id to the server (tagged for Bob).
4. Alice copies the ciphertext blob (contains message-id + IV + ciphertext, base64) and pastes it into any messenger.
5. Bob pastes the blob into Right2Privacy, selects Alice as sender. Browser pulls the wrapped AES key for that message-id, unwraps it with Bob's private key, decrypts → plaintext.

## Crypto
- **RSA-OAEP 2048** (identity keypair per user) + **AES-GCM 256** (per-message).
- All crypto in-browser via `window.crypto.subtle`.
- Public key stored plaintext in DB. Private key stored (a) unencrypted in browser `IndexedDB` primary + (b) encrypted with password-derived key (PBKDF2 SHA-256, 250k iter, random salt) on server as backup, so users can restore on a new device by re-entering password.
- Ciphertext blob format (base64-wrapped JSON): `{ v:1, mid, iv, ct }`. Server never sees plaintext or AES key.

## Auth
- Lovable Cloud, email + password only.
- On signup: generate RSA keypair client-side, upload public key + password-encrypted private key backup, store private key locally.
- On login from new device: prompt for password → download encrypted backup → decrypt → save to IndexedDB.

## Friends
- Search by username or account handle.
- Send friend request → recipient accepts. Only accepted friends appear as recipients/senders.

## Pages
- `/` — landing: hero "Right2Privacy / Privacy is a human right.", how-it-works, CTA to sign up.
- `/auth` — sign in / sign up (with password strength + private-key generation on signup).
- `/_authenticated/app` — main workspace, tabbed:
  - **Encrypt**: recipient dropdown (friends), textarea, "Encrypt & copy" button → shows ciphertext blob.
  - **Decrypt**: sender dropdown, paste-blob textarea, "Decrypt" → shows plaintext.
- `/_authenticated/friends` — friends list, pending requests, add-by-handle.
- `/_authenticated/settings` — account handle, restore-key, sign out.

## Database (Lovable Cloud)
- `profiles(id uuid pk → auth.users, handle text unique, public_key text, encrypted_private_key text, pk_salt text, pk_iv text, created_at)`
- `friendships(id, requester_id, addressee_id, status enum('pending','accepted'), created_at, unique(requester_id, addressee_id))`
- `pending_keys(id, message_id text unique, sender_id, recipient_id, wrapped_key text, created_at)` — recipient reads then deletes their own row.
- RLS: users read/update own profile, read friends' public profiles (id, handle, public_key) via a `has_friendship` function; friendship rows visible to either party; `pending_keys` insert only if friendship accepted, select/delete only by recipient.
- Roles table not needed (no admin surface).

## Security notes
- Server never sees plaintext, AES key, or user password.
- Wrapped keys auto-deleted on first successful fetch; TTL cleanup (e.g. 30 days) via scheduled cleanup later.
- Password reset ⇒ private key backup unrecoverable (documented in UI); user can generate a new keypair, losing access to old messages.
- Zod validation on every server fn input.

## Tech
- TanStack Start + createServerFn (with `requireSupabaseAuth`) for all reads/writes.
- Browser Web Crypto API — no extra deps.
- Tailwind + shadcn UI already present.

## Build order
1. Enable Lovable Cloud, migration for schema + RLS + `has_friendship` helper.
2. Auth pages + signup keypair generation + IndexedDB storage helpers.
3. Landing page with branding.
4. Friends UI + server fns (`sendFriendRequest`, `respondFriendRequest`, `listFriends`, `searchUsers`).
5. Encrypt/Decrypt workspace + server fns (`postWrappedKey`, `fetchWrappedKey`).
6. Settings + key restore flow.
