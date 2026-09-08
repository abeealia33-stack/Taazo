/**
 * Email, behind an interface.
 *
 * In development nothing is sent — the rendered message is printed to the
 * server console, so the whole order flow can be exercised without an account
 * anywhere. Setting RESEND_API_KEY switches to real delivery with no change at
 * any call site.
 */

export type Mail = {
  to: string;
  subject: string;
  text: string;
};

export interface Mailer {
  send(mail: Mail): Promise<{ ok: boolean; detail?: string }>;
}

class ConsoleMailer implements Mailer {
  async send(mail: Mail) {
    console.log(
      [
        "",
        "──────────────── email (not sent — dev mode) ────────────────",
        `To:      ${mail.to}`,
        `Subject: ${mail.subject}`,
        "",
        mail.text,
        "─────────────────────────────────────────────────────────────",
        "",
      ].join("\n"),
    );
    return { ok: true, detail: "logged to console" };
  }
}

class ResendMailer implements Mailer {
  constructor(private apiKey: string) {}

  async send(mail: Mail) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "taazo. <orders@taazo.pk>",
          to: [mail.to],
          subject: mail.subject,
          text: mail.text,
        }),
      });
      if (!res.ok) {
        return { ok: false, detail: `resend responded ${res.status}` };
      }
      return { ok: true };
    } catch (error) {
      return { ok: false, detail: String(error) };
    }
  }
}

export const mailer: Mailer = process.env.RESEND_API_KEY
  ? new ResendMailer(process.env.RESEND_API_KEY)
  : new ConsoleMailer();
