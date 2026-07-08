const crypto = require("node:crypto");
const https = require("node:https");

const DEFAULT_PIXEL_ID = "1542765323857764";
const PRODUCT_ID = "kastave-reservation-1usd";
const PRODUCT_NAME = "Kastave $1 Reservation";

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("error", reject);
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

function parseStripeSignature(header) {
  return String(header || "")
    .split(",")
    .reduce(
      (parts, item) => {
        const [key, value] = item.split("=");
        if (!key || !value) return parts;
        if (key === "t") parts.timestamp = value;
        if (key === "v1") parts.signatures.push(value);
        return parts;
      },
      { timestamp: "", signatures: [] },
    );
}

function safeCompareHex(left, right) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyStripeSignature(rawBody, signatureHeader, webhookSecret) {
  const { timestamp, signatures } = parseStripeSignature(signatureHeader);
  if (!timestamp || !signatures.length) return false;

  const signedPayload = `${timestamp}.${rawBody.toString("utf8")}`;
  const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(signedPayload).digest("hex");

  return signatures.some((signature) => safeCompareHex(signature, expectedSignature));
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value).trim().toLowerCase()).digest("hex");
}

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor) return forwardedFor.split(",")[0].trim();
  return req.socket?.remoteAddress || "";
}

function buildMetaPayload(session, req) {
  const currency = String(session.currency || "usd").toUpperCase();
  const value = Number.isFinite(session.amount_total) ? session.amount_total / 100 : 1.0;
  const eventId = `purchase_${session.id}`;
  const userData = {
    client_ip_address: getClientIp(req),
    client_user_agent: req.headers["user-agent"] || "",
  };

  if (session.customer_details?.email) userData.em = [sha256(session.customer_details.email)];
  if (session.customer_details?.phone) userData.ph = [sha256(session.customer_details.phone)];

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: session.success_url || "https://kastave.com/success.html",
        user_data: userData,
        custom_data: {
          currency,
          value,
          order_id: session.id,
          content_name: PRODUCT_NAME,
          content_ids: [PRODUCT_ID],
          content_type: "product",
          num_items: 1,
        },
      },
    ],
  };

  if (process.env.META_TEST_EVENT_CODE) payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  return payload;
}

function sendMetaEvent(payload) {
  const pixelId = process.env.META_PIXEL_ID || DEFAULT_PIXEL_ID;
  const accessToken = process.env.META_CAPI_TOKEN;

  if (!accessToken) {
    return Promise.reject(new Error("Missing META_CAPI_TOKEN"));
  }

  const body = JSON.stringify(payload);
  const path = `/v23.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;

  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: "graph.facebook.com",
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        response.on("end", () => {
          const responseBody = Buffer.concat(chunks).toString("utf8");
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve({ statusCode: response.statusCode, body: responseBody });
          } else {
            reject(new Error(`Meta CAPI request failed with ${response.statusCode}: ${responseBody}`));
          }
        });
      },
    );

    request.on("error", reject);
    request.write(body);
    request.end();
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    res.status(500).json({ error: "Missing webhook configuration" });
    return;
  }

  const rawBody = await readRawBody(req);
  const signatureHeader = req.headers["stripe-signature"];

  if (!verifyStripeSignature(rawBody, signatureHeader, webhookSecret)) {
    res.status(400).json({ error: "Invalid Stripe signature" });
    return;
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  if (event.type !== "checkout.session.completed") {
    res.status(200).json({ received: true, ignored: event.type });
    return;
  }

  const session = event.data?.object;
  if (!session?.id) {
    res.status(400).json({ error: "Missing checkout session" });
    return;
  }

  try {
    await sendMetaEvent(buildMetaPayload(session, req));
    res.status(200).json({ received: true });
  } catch (error) {
    res.status(502).json({ error: error.message });
  }
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};
