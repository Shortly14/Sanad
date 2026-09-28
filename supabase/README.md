# WhatsApp code sign-in: setup

Sign-in works like this:

1. The app sends the person's number to the `send-otp` Edge Function.
2. `send-otp` asks the database for a new 6-digit code (`otp_create` in `schema.sql`, which also enforces the rate limits).
3. `send-otp` sends the code on WhatsApp through Meta's WhatsApp Cloud API.
4. The app checks the code with the `verify_phone_code` database function and signs the person in.

Only step 3 needs secrets, so it's the only Edge Function.

There are two parts to set up: a Meta WhatsApp sender (once), and the function on the Linux Mint PC.

## Part 1: Meta WhatsApp sender (once)

1. **Meta Business account.** Go to https://business.facebook.com and create one for Sanad if you don't already have one.
2. **App.** Go to https://developers.facebook.com, then My Apps, Create app. Choose the **Business** type, then add the **WhatsApp** product to the app.
3. **Phone number.** In the app, open WhatsApp, then API Setup, then Add phone number. Use a number that is **not** already registered on the WhatsApp or WhatsApp Business phone app, such as a new SIM. Verify it with the SMS or call, then copy its **Phone number ID** (a long number, not the phone number itself).
4. **Code message template.** Open WhatsApp Manager, then Message templates, then Create template:
   - Category: **Authentication**
   - Name: `sanad_login_code`
   - Code delivery: **Copy code**
   - Languages: add **English**, **Arabic** and **Urdu**. If a language isn't approved yet, the code is sent in English instead.

   Submit it and wait for the "Approved" status.
5. **Payment method.** In WhatsApp Manager, go to Settings, then Payment methods, and add a card. Every code costs a small fee, charged by the person's country.
6. **Permanent access token.** Go to Business settings, then Users, then System users, and add a system user with the **Admin** role. Use Assign assets to give it full control of the app and the WhatsApp account. Then Generate token with these permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`

   Set it to never expire. Copy the token: this is a **secret**, so never paste it in a chat or commit it.
7. **Later, optional:** business verification (Business settings, Security centre) lifts the limit of about 250 new people per day. You don't need it for the beta.

## Part 2: the function on the Linux Mint PC

Run these in a terminal on the PC.

1. **Copy the function into the Supabase functions folder:**

   ```bash
   mkdir -p ~/sanad-supabase/volumes/functions/send-otp
   cp ~/Sanad/supabase/functions/send-otp/index.ts ~/sanad-supabase/volumes/functions/send-otp/
   ```

2. **Add the secrets** to the end of `~/sanad-supabase/.env`, using your own values from Part 1:

   ```
   WHATSAPP_TOKEN=paste-the-token-here
   WHATSAPP_PHONE_NUMBER_ID=paste-the-phone-number-id-here
   WHATSAPP_TEMPLATE_NAME=sanad_login_code
   ```

3. **Pass them to the functions container.** In `~/sanad-supabase/docker-compose.yml`, find the `functions:` service. Under its `environment:` list, add:

   ```yaml
         WHATSAPP_TOKEN: ${WHATSAPP_TOKEN}
         WHATSAPP_PHONE_NUMBER_ID: ${WHATSAPP_PHONE_NUMBER_ID}
         WHATSAPP_TEMPLATE_NAME: ${WHATSAPP_TEMPLATE_NAME}
   ```

4. **Restart the functions container:**

   ```bash
   cd ~/sanad-supabase && docker compose up -d functions
   ```

5. **Let the function through Cloudflare.** The WAF rule on api.thesannad.com only allows `/rest/v1/` and `/storage/v1/`. Edit it so that requests whose URI path equals `/functions/v1/send-otp` are also allowed. Allow that one path, not all of `/functions/`.
6. **Run `schema.sql`**, right before publishing `develop` to `main`, as usual:

   ```bash
   docker exec -i supabase-db psql -U postgres -d postgres < ~/Sanad/schema.sql
   ```

7. **Test.** Replace the number with your own WhatsApp number:

   ```bash
   curl -X POST https://api.thesannad.com/functions/v1/send-otp \
     -H "apikey: <the anon key from app.js>" -H "Content-Type: application/json" \
     -d '{"phone":"+9665XXXXXXXX","lang":"ar"}'
   ```

   You should get `{"ok":true}` and a code on WhatsApp within a few seconds. If not, run `docker logs supabase-edge-functions --tail 50`: the Meta error is printed there.

## Limits built in

- At most 3 codes per number every 15 minutes, 10 per IP per hour, and 300 per hour for the whole site. Change these in `otp_create` in `schema.sql`.
- A code expires after 10 minutes, and 5 wrong guesses cancel it.
- Existing username accounts keep their posts. The next time they log in with their username and password, they're asked to add their WhatsApp number once, and they can't post until they do.
