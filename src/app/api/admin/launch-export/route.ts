import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Escape quotes and spreadsheet formulas in every user-controlled CSV field. */
function csv(value: string) {
  const safe = /^[\s]*[=+@-]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "owner") return new Response("Unauthorized", { status: 403 });
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode("Email,First name,City,Signed up,Notice version\r\n"));
      let cursor: string | undefined;
      try {
        for (;;) {
          const rows = await db.launchSubscriber.findMany({ orderBy: { id: "asc" }, take: 500, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}) });
          if (!rows.length) break;
          for (const row of rows) controller.enqueue(encoder.encode([row.email, row.firstName || "", row.city || "", row.createdAt.toISOString(), row.noticeVersion].map(csv).join(",") + "\r\n"));
          cursor = rows[rows.length - 1].id;
        }
        controller.close();
      } catch (error) { controller.error(error); }
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=chulimaar-launch-signups.csv", "Cache-Control": "no-store" } });
}
