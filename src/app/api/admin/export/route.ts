import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { karachiNow } from "@/lib/batch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * CSV export.
 *
 * Reports on screen answer "what should I do tomorrow"; the CSV is for
 * everything else — an accountant, a spreadsheet, a question this panel does
 * not anticipate. Owner-only, because it includes revenue.
 */

/** Anything that could be read as a formula by Excel is neutralised. */
function cell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  const escaped = text.replace(/"/g, '""');
  const risky = /^[=+\-@\t\r]/.test(escaped);
  return `"${risky ? `'${escaped}` : escaped}"`;
}

function toCsv(rows: unknown[][]) {
  return rows.map((row) => row.map(cell).join(",")).join("\r\n");
}

function csvResponse(name: string, body: string) {
  // The BOM makes Excel open UTF-8 correctly, which matters for "×" and "Rs".
  return new NextResponse("﻿" + body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${name}"`,
      "cache-control": "no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.nextUrl.origin));
  }
  if (session.role !== "owner") {
    return new NextResponse("Owner access required.", { status: 403 });
  }

  const type = request.nextUrl.searchParams.get("type") ?? "orders";
  const days = Number(request.nextUrl.searchParams.get("days") ?? 30);
  const since = karachiNow();
  since.setDate(since.getDate() - (Number.isFinite(days) ? days : 30));

  const stamp = karachiNow().toISOString().slice(0, 10);

  if (type === "orders") {
    const [orders, zones, riders] = await Promise.all([
      db.order.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
      }),
      db.deliveryZone.findMany(),
      db.rider.findMany(),
    ]);

    const rows: unknown[][] = [
      [
        "Order number", "Date", "Status", "Customer", "Phone", "Address",
        "Area", "Zone", "Slot", "Rider", "Payment", "Payment status",
        "Batch", "Items", "Subtotal", "Delivery", "Total", "Source", "Notes",
      ],
      ...orders.map((o) => [
        o.orderNumber,
        o.createdAt.toISOString(),
        o.status,
        o.customerName,
        o.phone,
        o.addressLine,
        o.area,
        zones.find((z) => z.id === o.zoneId)?.name ?? "",
        o.deliverySlot,
        riders.find((r) => r.id === o.riderId)?.name ?? "",
        o.paymentMethod,
        o.paymentStatus,
        o.batchCode ?? "",
        o.items.map((i) => `${i.qty} x ${i.nameSnapshot}`).join("; "),
        o.subtotal,
        o.deliveryFee,
        o.total,
        o.source,
        o.notes ?? "",
      ]),
    ];

    return csvResponse(`taazo-orders-${stamp}.csv`, toCsv(rows));
  }

  if (type === "batches") {
    const batches = await db.batch.findMany({
      where: { pressedAt: { gte: since } },
      orderBy: { pressedAt: "desc" },
    });

    const rows: unknown[][] = [
      [
        "Batch", "Pressed at", "Status", "Product",
        "Made", "Sold", "Unsold", "Wasted", "Sold through %",
      ],
      ...batches.flatMap((b) =>
        b.stock.map((s) => [
          b.code,
          b.pressedAt.toISOString(),
          b.status,
          s.productSlug,
          s.bottlesMade,
          s.bottlesSold,
          s.unsold,
          s.wasted,
          s.bottlesMade > 0
            ? Math.round((s.bottlesSold / s.bottlesMade) * 100)
            : 0,
        ]),
      ),
    ];

    return csvResponse(`taazo-batches-${stamp}.csv`, toCsv(rows));
  }

  if (type === "customers") {
    const orders = await db.order.findMany({
      where: { status: { notIn: ["cancelled", "failed"] } },
      orderBy: { createdAt: "asc" },
    });

    // Phone is identity in this business, so that is what we group on.
    const byPhone = new Map<
      string,
      { name: string; area: string; orders: number; spent: number; last: Date }
    >();
    for (const o of orders) {
      const row = byPhone.get(o.phone) ?? {
        name: o.customerName,
        area: o.area,
        orders: 0,
        spent: 0,
        last: o.createdAt,
      };
      row.name = o.customerName;
      row.area = o.area;
      row.orders += 1;
      row.spent += o.total;
      row.last = o.createdAt;
      byPhone.set(o.phone, row);
    }

    const rows: unknown[][] = [
      ["Phone", "Name", "Area", "Orders", "Total spent", "Last order"],
      ...[...byPhone.entries()]
        .sort((a, b) => b[1].spent - a[1].spent)
        .map(([phone, r]) => [
          phone,
          r.name,
          r.area,
          r.orders,
          r.spent,
          r.last.toISOString(),
        ]),
    ];

    return csvResponse(`taazo-customers-${stamp}.csv`, toCsv(rows));
  }

  return new NextResponse("Unknown export type.", { status: 400 });
}
