# The emails Supabase sends for us

Supabase sends three emails: the sign-up confirmation (also used when someone asks for it again), the login link and the password reset. Paste each one in **Supabase → Authentication → Emails → Templates**:

| Template in Supabase | Subject: paste the contents of | Message body: paste the contents of |
| --- | --- | --- |
| Confirm sign up | `confirm-sign-up.subject.txt` | `confirm-sign-up.html` |
| Magic link | `magic-link.subject.txt` | `magic-link.html` |
| Reset password | `reset-password.subject.txt` | `reset-password.html` |

Paste the whole file each time, from the first `{{` to the last `}}`, and press **Save** on each template.

## Good to know

- **Both languages are in each file.** The email comes out in Spanish when the student signed up with the site in Spanish, and in English otherwise. The language is stored when they sign up and updated whenever they sign in.
- **The links open a page with one button, not the account directly.** University mail often goes through scanners (Microsoft Safe Links) that open every link as soon as the email arrives. A link that signed in on opening would be used up by the scanner, and the student would see "link expired". The button stops that.
- **Don't edit these files by hand.** The words are in `lib/email-copy.ts` and the look in `lib/email-layout.ts`. After changing either, run `npx vitest run -u lib/auth-email-templates.test.ts` to rewrite these files, then paste them again.
- **When Resend becomes Supabase's mail sender,** keep click and open tracking switched off in Resend. Tracking rewrites links, and these ones must arrive unchanged.
- The other templates Supabase lists (Invite user, Change email address, Reauthentication) are not used by the site. Leave them as they are.
