/**
 * Payload email adapter for Postmark's HTTPS API. HTTPS rather than SMTP
 * because shared hosting often blocks outgoing mail ports, and it needs no
 * extra package.
 *
 * Settings (cPanel → Setup Node.js App → environment variables):
 *   POSTMARK_SERVER_TOKEN  Postmark → Servers → (server) → API Tokens. Secret.
 *   EMAIL_FROM             optional, default "Deiparine Community Hospital
 *                          <no-reply@deiparinecommunityhospital.ph>". Must be
 *                          on a domain verified in Postmark.
 * Without a token, Payload logs emails to the console instead (local dev).
 */
import type { EmailAdapter, SendEmailOptions } from "payload";

type Address = string | { name?: string; address: string };

const DEFAULT_FROM = { name: "Deiparine Community Hospital", address: "no-reply@deiparinecommunityhospital.ph" };

function parseFrom(value: string | undefined) {
  const m = value?.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].replace(/^"|"$/g, ""), address: m[2] };
  return value?.trim() ? { name: DEFAULT_FROM.name, address: value.trim() } : DEFAULT_FROM;
}

function format(a: Address | Address[] | undefined): string | undefined {
  if (!a) return undefined;
  const list = Array.isArray(a) ? a : [a];
  return list
    .map((x) => (typeof x === "string" ? x : x.name ? `"${x.name.replaceAll('"', "")}" <${x.address}>` : x.address))
    .join(", ");
}

export function postmarkAdapter(token: string): EmailAdapter {
  const from = parseFrom(process.env.EMAIL_FROM);
  return ({ payload }) => ({
    name: "postmark",
    defaultFromAddress: from.address,
    defaultFromName: from.name,
    async sendEmail(message: SendEmailOptions) {
      const res = await fetch("https://api.postmarkapp.com/email", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json", "X-Postmark-Server-Token": token },
        body: JSON.stringify({
          From: format((message.from as Address | undefined) ?? from),
          To: format(message.to as Address | Address[]),
          Cc: format(message.cc as Address | Address[] | undefined),
          Bcc: format(message.bcc as Address | Address[] | undefined),
          ReplyTo: format(message.replyTo as Address | Address[] | undefined),
          Subject: message.subject,
          HtmlBody: typeof message.html === "string" ? message.html : undefined,
          TextBody: typeof message.text === "string" ? message.text : undefined,
          MessageStream: "outbound",
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { ErrorCode?: number; Message?: string; MessageID?: string };
      if (!res.ok || body.ErrorCode) {
        const error = `Postmark ${res.status} (code ${body.ErrorCode ?? "?"}): ${body.Message ?? "no message"}`;
        payload.logger.error(error);
        throw new Error(error);
      }
      return body;
    },
  });
}
