// Supabase Edge Function: send-code
// Body: { email: string, lang?: "en" | "ar" | "ur" }
// otp_create() in schema.sql makes a 6-digit code (or refuses when an email,
// an IP or the whole site has asked for too many), and this function emails
// it through Resend (resend.com). The browser then checks the code with the
// verify_email_code() database function; no second Edge Function needed.
// Responses: 200 { ok: true } or 4xx/5xx { error: "invalid_email" |
// "too_many" | "send_failed" | "server_error" }.

// Set these for the functions container (see supabase/README.md).
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "Sanad <login@thesannad.com>";

// Injected into every Supabase Edge Function, including self-hosted ones.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// The email in each app language. {code} is replaced with the code.
const MESSAGES: Record<string, { subject: string; body: string; ignore: string; dir: string }> = {
  en: {
    subject: "Your Sanad code: {code}",
    body: "Your Sanad sign-in code is {code}. It expires in 10 minutes.",
    ignore: "If you didn't ask for this code, you can ignore this email.",
    dir: "ltr",
  },
  ar: {
    subject: "رمز سند الخاص بك: {code}",
    body: "رمز تسجيل الدخول إلى سند هو {code}. تنتهي صلاحيته خلال ١٠ دقائق.",
    ignore: "إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة.",
    dir: "rtl",
  },
  ur: {
    subject: "آپ کا سند کوڈ: {code}",
    body: "سند میں سائن اِن کرنے کا آپ کا کوڈ {code} ہے۔ یہ ۱۰ منٹ میں ختم ہو جائے گا۔",
    ignore: "اگر آپ نے یہ کوڈ نہیں مانگا تو اس ای میل کو نظر انداز کر دیں۔",
    dir: "rtl",
  },
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

// Same rule as sanad_clean_email() in schema.sql.
function cleanEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const e = email.trim().toLowerCase();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) && e.length <= 254 ? e : null;
}

function sendEmail(to: string, code: string, lang: string) {
  const m = MESSAGES[lang] ?? MESSAGES.en;
  const fill = (s: string) => s.replace("{code}", code);
  // The code is six digits, so it's safe to put in HTML as-is.
  const html =
    `<div dir="${m.dir}" style="font-family:Arial,sans-serif;font-size:16px;line-height:1.6">` +
    `<p>${fill(m.body).replace(code, `<b dir="ltr" style="font-size:24px;letter-spacing:4px">${code}</b>`)}</p>` +
    `<p style="color:#777;font-size:13px">${m.ignore}</p></div>`;
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [to],
      subject: fill(m.subject),
      text: `${fill(m.body)}\n\n${m.ignore}`,
      html,
    }),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { email: rawEmail, lang } = await req.json();
    const email = cleanEmail(rawEmail);
    if (!email) return json({ error: "invalid_email" }, 400);

    // Cloudflare sets cf-connecting-ip and overwrites any value a client sends.
    const ip = req.headers.get("cf-connecting-ip");
    const createRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/otp_create`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_email: email, p_ip: ip }),
    });
    if (!createRes.ok) {
      console.error("otp_create failed:", createRes.status, await createRes.text());
      return json({ error: "server_error" }, 500);
    }
    const code = await createRes.json();
    if (typeof code !== "string") return json({ error: "too_many" }, 429);

    const sendRes = await sendEmail(email, code, ["en", "ar", "ur"].includes(lang) ? lang : "en");
    if (!sendRes.ok) {
      const detail = await sendRes.text();
      console.error("Resend send failed:", sendRes.status, detail);
      // 422: Resend rejected the address. 429: Resend's own rate or daily limit.
      if (sendRes.status === 422) return json({ error: "invalid_email" }, 400);
      if (sendRes.status === 429) return json({ error: "too_many" }, 429);
      return json({ error: "send_failed" }, 502);
    }

    return json({ ok: true });
  } catch (err) {
    console.error("send-code error:", err);
    return json({ error: "server_error" }, 500);
  }
});
