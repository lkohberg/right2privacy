# Right2Privacy

> End-to-end encryption that rides on top of any messenger.  
> Privacy is a human right.

**Right2Privacy** is a browser-based, zero-knowledge encryption layer. It lets two people send end-to-end encrypted messages through ordinary channels — SMS, email, Discord, or any other app — without ever giving the plaintext or their keys to a server.

The project was built as a practical response to the EU's proposed **Chat Control** regulation, which would mandate client-side scanning of private conversations. Instead of accepting mass surveillance as inevitable, Right2Privacy demonstrates that strong, user-controlled cryptography remains possible and accessible.

## How it works

1. **Identity keys** — each user generates an RSA-OAEP 2048 keypair directly in their browser. Only the public key leaves the device; the private key is stored locally in IndexedDB or optionally as a password-encrypted backup.
2. **Add a friend** — users exchange handles on Right2Privacy. Public keys are fetched from the server and verified by the friendship flow.
3. **Encrypt a message** — the sender writes a message, picks a friend, and the site encrypts the body with a fresh AES-GCM 256 key. That key is then wrapped with the recipient's public RSA key.
4. **Send anywhere** — the ciphertext blob is copied and pasted into any messenger. The wrapped key is relayed through Right2Privacy's backend and can only be unwrapped by the recipient's private key.
5. **Decrypt** — the recipient pastes the blob into Right2Privacy, the local private key unwraps the message key, and the plaintext is decrypted in the browser.

The server stores only what is strictly necessary: profile data, public keys, friendship records, and encrypted key relays. It never sees plaintext, session keys, or passwords.

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start (full-stack React with SSR + server functions) |
| Language | TypeScript |
| UI | React, Tailwind CSS v4, shadcn/ui components |
| Crypto | Web Crypto API (RSA-OAEP 2048, AES-GCM 256, PBKDF2) |
| Backend | Supabase (Postgres + Auth + Row-Level Security) |
| Storage | IndexedDB for local private keys, Supabase for public key relays |
| i18n | Custom i18n layer supporting all 24 official EU languages |
| Email | Branded transactional auth emails (verification, recovery, magic link) |

## Key technical decisions

- **No plaintext on the server.** All encryption and decryption happens in the browser. The backend is only a dumb relay for already-encrypted data.
- **No backdoor-friendly key management.** Private keys are stored locally or encrypted with a user-derived key before backup. A password reset cannot recover old conversations — this is a deliberate security property, not a bug.
- **RLS-first backend.** Every table is protected by Supabase Row-Level Security policies. Users can only read or write rows that belong to them or their friendships.
- **Email verification.** New accounts require email confirmation before they can sign in. This enables account recovery while keeping the registration flow clean.
- **24-language UI.** The entire interface is localized into all official EU languages and persists per user account.

## What I built and why

This project was built start-to-finish as a solo, volunteer effort. It combines product thinking, full-stack engineering, cryptography, security hardening, and operational setup (custom domain, DNS, email infrastructure, i18n).

The goal was not just to ship another encrypted chat app, but to prove that privacy tools can be:

- **Practical** — no installation, no new network, works inside the apps people already use.
- **Sovereign** — users control their own keys; no vendor can decrypt their messages.
- **Resilient against regulation** — because the math does not care about jurisdiction.

## Live site

- **Web:** https://right2privacy.at
- **Mission statement:** Privacy is a human right, not a feature.

## Project status

Right2Privacy is live and functional. Core flows (signup, login, email verification, password reset, friendship management, encryption, and decryption) are complete. The codebase is structured for further iteration: real-time messaging, key verification workflows, and mobile polish are natural next steps.

## License & use

Provided as-is. The source code is mine to share, discuss, and iterate on. If you are hiring and want to talk about how this was built, the trade-offs involved, or where it could go next, I am happy to walk through it.

---

Built by Luca Kohberger · right2privacy.at
