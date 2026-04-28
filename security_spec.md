# Security Specification: Jisort Dishi

## 1. Data Invariants
- A user can only access their own profile.
- A user can only access storage units they own.
- A user can only access items within storage units they own.
- Recipes are public for reading if `is_public` is true, otherwise only viewable by creator.
- Users can only create recipes with their own `user_id`.
- Users cannot modify `created_at` or `created_by` after creation.
- Meal suggestions are private to the user.

## 2. The Dirty Dozen (Malicious Payloads)
1. **Identity Theft**: Attempt to update another user's profile.
2. **Resource Hijacking**: Create a storage unit for another user.
3. **Ghost Items**: Adding an item to a storage unit that the user doesn't own.
4. **Price Poisoning**: Creator attempting to update the price of a recipe after it's been published (if we have immutability rules).
5. **ID Poisoning**: Injecting a 1MB string as a document ID.
6. **Bypassing Ownership**: Attempting to read another user's pantry items via a list query.
7. **Role Escalation**: Attempting to set `isAdmin` on a user profile (system doesn't have roles yet, but good to guard).
8. **Shadow Fields**: Adding `isVerified: true` to a recipe to appear "official".
9. **Timestamp Spoofing**: Sending a future `created_at` date.
10. **Quantity Overflow**: Setting item quantity to -1 or a massive number beyond 10^9.
11. **Suggestion Leak**: Attempting to read another user's meal suggestions.
12. **Orphaned Writes**: Creating an item in a non-existent storage unit.

## 3. Test Runner (Conceptual)
Next API route tests should verify these scenarios against MongoDB-backed handlers, using request headers and fixtures to simulate authenticated users.
