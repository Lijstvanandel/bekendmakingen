# Security Specification: Bekendmakingen Steenwijkerland

## Data Invariants
1. Een `BekendmakingScanRecord` kan uitsluitend worden aangemaakt en geraadpleegd door geverifieerde beheerders (`request.auth.token.email_verified == true`).
2. Document-ID's moeten voldoen aan `^[a-zA-Z0-9_\-]+$` met een maximale lengte van 128 tekens.
3. Ongeautoriseerde wijzigingen aan `ownerId`, `id` of `createdAt` zijn streng verboden via onveranderlijke vergelijkingen.
4. Alle tijdstempels (`createdAt`, `updatedAt`) worden strikt gevalideerd met `request.time`.

## Dirty Dozen Payloads & Test Results
Zie `firestore.rules.test.ts` voor de volledige suite van 12 penetratietests (Unauthenticated Writes, Email Spoofing, Identity Hijack, Shadow Fields, ID Poisoning, Denial-of-Wallet string overflows, Client-forged timestamps, etc.).
Alle tests retourneren `PERMISSION_DENIED`.
