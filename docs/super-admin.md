# Super admin dashboard

Open `/super-admin` to choose which dashboard sections are available to all regular admins. Sign in with a `superadmin` account using the existing `/login` page. Regular admins continue to use `/admin`.

## Set up your first super admin

1. Create your account through the website if it does not already exist.
2. Configure `MONGODB_URI` and a strong `JWT_SECRET` in `.env.local`.
3. From the project directory, run:

   ```sh
   npm run superadmin -- your-account-email-or-phone
   ```

4. Sign in and visit `/super-admin`.

This terminal command grants access to an existing, active account. It does not create an account or change its password. Regular admins cannot grant themselves super admin access through the website.

Replace `your-account-email-or-phone` with the actual email or phone you use to sign in. For phone numbers, keep the leading zero and use the same format you registered with.

If the command fails, it now reports the specific reason:

- **Account not found:** the supplied email or phone does not match an existing account. Check the identifier or register through `/login` first.
- **Account suspended:** activate the account before granting access.
- **MONGODB_URI missing:** configure the project’s `.env.local` file.
- **Database connection error:** check the reported connection failure and the database configuration. Connection strings are hidden from the error output.

## Control visibility

Toggle individual sections, or use **Show all** / **Hide all**, review the menu preview, then click **Save changes**. **Discard** restores the last loaded or saved settings.

- Settings are stored in MongoDB and apply to **all regular admins**.
- All sections are visible until settings are first saved.
- Hidden sections disappear from admin navigation, dashboard shortcuts, and notification links. Opening their admin URLs shows an access unavailable message.
- Management APIs enforce saved settings on each request. Open admin panels refresh their menu on navigation, window focus, and every 30 seconds.
- If every section is hidden, admins see an access unavailable message and can still sign out.
- Super admins always retain full access. Moderator permissions remain separately managed.
- When a super admin opens `/admin`, a banner lists the hidden sections and the sidebar tags them **Hidden**. Use **Preview as admin** to see the panel exactly as regular admins see it.
- Public storefront reads, shopping, and checkout continue to work.
- Visibility changes are recorded in the existing audit log.
- Hiding **Store Activity** also hides the live activity widget on the Dashboard.
- Hiding **Roles & Permissions** still lets the Staff page list role templates (read-only) while Staff is visible. Creating, editing, or deleting roles stays blocked.

## Audit log deletion

Turn on **Allow admins to delete audit trail logs** to show a **Delete old entries** control on the Audit Trail page. Admins choose a retention period (1, 3, 6, 12, or 24 months). Only entries older than that period are removed, and super admin entries are never deleted. Each cleanup is itself recorded in the audit log. The permission only works while the Audit Trail section is visible. Turning it off blocks delete requests immediately, without anyone signing in again.

Super admin activity is excluded from the Store Activity feed, staff actions, Audit Trail, and activity totals. Existing entries linked to current super admins are hidden too. New activity events retain the actor's role so super admin events stay hidden if that account later changes roles. Log records remain stored in MongoDB.

Super admin accounts are also hidden from Customer & User Management, including its search, user count, and API responses, for every viewer.

## Verify

Run `npm test`, `npx tsc --noEmit`, and `npm run build`.

To check the complete flow, use separate browser sessions for a super admin and a regular admin. Hide a section and save. Confirm the regular admin's menu updates and its management API returns 403. Show it again and confirm access returns.
