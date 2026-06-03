# 07 Security Standards & RLS Diagnosis

## Database Row-Level Security (RLS)
The database enforces strict RLS policies to safeguard customer data:
- **SELECT**: Allowed for public content (services, pricing, slider imagery).
- **ALL (Admins)**: Allowed for staff sessions matching the `admins` table.
- **SELECT/INSERT (User)**: Allowed for bookings matching the customer session.

---

## RLS Diagnosis & Remediation
A major diagnostic audit completed in April 2026 revealed that access issues are frequently due to a **missing `user_id` linkage** between `auth.users` and the `public.admins` / `public.customers` tables.

### Remediating Linkages
If staff or customers report seeing 0 entries, run the following SQL update:

```sql
-- Link Admins
UPDATE public.admins a
SET user_id = u.id
FROM auth.users u
WHERE a.email = u.email AND a.user_id IS NULL;

-- Link Customers
UPDATE public.customers c
SET user_id = u.id
FROM auth.users u
WHERE c.email = u.email AND c.user_id IS NULL;
```
