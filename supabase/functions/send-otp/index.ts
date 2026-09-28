// Supabase Edge Function: send-otp
// Body: { phone: string, lang?: "en" | "ar" | "ur" }
//   phone in international format, e.g. "+966501234567".
// otp_create() in schema.sql makes a 6-digit code (or refuses when a number,
// an IP or the whole site has asked for too many), and this function sends
// it through Meta's WhatsApp Cloud API using an approved "authentication"
// message template. The browser then checks the code with the
// verify_phone_code() database function; no second Edge Function needed.
// Responses: 200 { ok: true } or 4xx/5xx { error: "invalid_phone" |
// "too_many" | "send_failed" | "server_error" }.

// Set these for the functions container (see supabase/README.md).
const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_TOKEN")!;
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")!;
const WHATSAPP_TEMPLATE_NAME = Deno.env.get("WHATSAPP_TEMPLATE_NAME") ?? "sanad_login_code";
const WHATSAPP_API_VERSION = Deno.env.get("WHATSAPP_API_VERSION") ?? "v23.0";

// Injected into every Supabase Edge Function, including self-hosted ones.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function isValidPhone(phone: unknown): phone is string {
  return typeof phone === "string" && /^\+[1-9]\d{7,14}$/.test(phone);
}

// Sends the code with the template in one language. Authentication
// templates carry the code twice: in the text and in the "Copy code" button.
function sendTemplate(phone: string, code: string, lang: string) {
  return fetch(
    `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone.slice(1),
        type: "template",
        template: {
          name: WHATSAPP_TEMPLATE_NAME,
          language: { code: lang },
          components: [
            { type: "body", parameters: [{ type: "text", text: code }] },
            { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: code }] },
          ],
        },
      }),
    },
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { phone, lang } = await req.json();
    if (!isValidPhone(phone)) return json({ error: "invalid_phone" }, 400);

    // Cloudflare sets cf-connecting-ip and overwrites any value a client sends.
    const ip = req.headers.get("cf-connecting-ip");
    const createRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/otp_create`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_phone: phone, p_ip: ip }),
    });
    if (!createRes.ok) {
      console.error("otp_create failed:", createRes.status, await createRes.text());
      return json({ error: "server_error" }, 500);
    }
    const code = await createRes.json();
    if (typeof code !== "string") return json({ error: "too_many" }, 429);

    const language = ["en", "ar", "ur"].includes(lang) ? lang : "en";
    let metaRes = await sendTemplate(phone, code, language);
    let detail = metaRes.ok ? null : await metaRes.json().catch(() => ({}));
    // 132001: the template isn't approved in this language, so fall back to English.
    if (!metaRes.ok && detail?.error?.code === 132001 && language !== "en") {
      metaRes = await sendTemplate(phone, code, "en");
      detail = metaRes.ok ? null : await metaRes.json().catch(() => ({}));
    }

    if (!metaRes.ok) {
      console.error("WhatsApp send failed:", metaRes.status, JSON.stringify(detail));
      const metaCode = detail?.error?.code;
      // 131026: not a WhatsApp number. 131009/100: bad parameter (malformed number).
      if (metaCode === 131026 || metaCode === 131009) return json({ error: "invalid_phone" }, 400);
      // 130429 / 131056: Meta's own rate limits.
      if (metaCode === 130429 || metaCode === 131056) return json({ error: "too_many" }, 429);
      return json({ error: "send_failed" }, 502);
    }

    return json({ ok: true });
  } catch (err) {
    console.error("send-otp error:", err);
    return json({ error: "server_error" }, 500);
  }
});
