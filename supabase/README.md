# Email code sign-in: setup

Sign-in works like this:

1. The app sends the person's email to the `send-code` Edge Function.
2. `send-code` asks the database for a new 6-digit code (`otp_create` in `schema.sql`, which also enforces the rate limits).
3. `send-code` emails the code through Resend (resend.com).
4. The app checks the code with the `verify_email_code` database function and signs the person in.

Only step 3 needs a secret, so it's the only Edge Function.

There are two parts to set up: a Resend account (once), and the function on the Linux Mint PC.

## Part 1: Resend (once)

1. **Account.** Sign up at https://resend.com. The free plan sends 3,000 emails a month and 100 a day.
2. **Domain.** Go to Domains, then Add domain, and enter `thesannad.com`. Resend shows a few DNS records (for sending and for spam checks). Add them in Cloudflare, under DNS for thesannad.com, or use Resend's "Sign in to Cloudflare" button to add them automatically. Wait until the domain shows **Verified**.
3. **API key.** Go to API Keys, then Create API key, with **Sending access** for thesannad.com. Copy it: this is a **secret**, so never paste it in a chat or commit it.

## Part 2: the function on the Linux Mint PC

Run these in a terminal on the PC.

1. **Copy the function into the Supabase functions folder:**

   ```bash
   mkdir -p ~/sanad-supabase/volumes/functions/send-code
   cp ~/Sanad/supabase/functions/send-code/index.ts ~/sanad-supabase/volumes/functions/send-code/
   ```

2. **Add the secrets** to the end of `~/sanad-supabase/.env`, using your own key from Part 1:

   ```
   RESEND_API_KEY=paste-the-key-here
   EMAIL_FROM=Sanad <login@thesannad.com>
   ```

3. **Pass them to the functions container.** In `~/sanad-supabase/docker-compose.yml`, find the `functions:` service. Under its `environment:` list, add:

   ```yaml
         RESEND_API_KEY: ${RESEND_API_KEY}
         EMAIL_FROM: ${EMAIL_FROM}
   ```

4. **Restart the functions container:**

   ```bash
   cd ~/sanad-supabase && docker compose up -d functions
   ```

5. **Let the function through Cloudflare.** The WAF rule on api.thesannad.com only allows `/rest/v1/` and `/storage/v1/`. Edit it so that requests whose URI path equals `/functions/v1/send-code` are also allowed. Allow that one path, not all of `/functions/`.
6. **Run `schema.sql`**, right before publishing `develop` to `main`, as usual:

   ```bash
   docker exec -i supabase-db psql -U postgres -d postgres < ~/Sanad/schema.sql
   ```

7. **Test.** Replace the address with your own email:

   ```bash
   curl -X POST https://api.thesannad.com/functions/v1/send-code \
     -H "apikey: <the anon key from app.js>" -H "Content-Type: application/json" \
     -d '{"email":"you@example.com","lang":"ar"}'
   ```

   You should get `{"ok":true}` and an email within a minute (check spam the first time). If not, run `docker logs supabase-edge-functions --tail 50`: the Resend error is printed there.

## Limits built in

- At most 3 codes per email every 15 minutes, 10 per IP per hour, and 100 per hour for the whole site. Change these in `otp_create` in `schema.sql`.
- A code expires after 10 minutes, and 5 wrong guesses cancel it.
- Existing username accounts keep their posts. The next time they log in with their username and password, they're asked to add their email once, and they can't post until they do.
