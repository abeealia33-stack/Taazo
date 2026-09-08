import { Card } from "@/components/admin/ui";
import {
  createZone,
  updateZone,
  toggleZone,
  deleteZone,
} from "@/app/admin/delivery-actions";

type Zone = {
  id: string;
  name: string;
  areas: string[];
  fee: number;
  minOrder: number;
  sameDayCutoff: number;
  sortOrder: number;
  active: boolean;
};

const input =
  "rounded-md border border-sand-300 bg-cream px-3 py-2 text-sm focus:border-terracotta focus:outline-none";
const num = `${input} tabular-nums`;

/**
 * Editable delivery zones.
 *
 * These are load-bearing rather than reference data: the checkout dropdown, the
 * delivery fee, the minimum order and the same-day cutoff all read from here,
 * so anything changed on this screen affects the next order placed.
 */
export function DeliveryZones({
  zones,
  ordersIn,
}: {
  zones: Zone[];
  /** Orders already delivered to a zone — a zone in use cannot be deleted. */
  ordersIn: (id: string) => number;
}) {
  return (
    <>
      <h2 className="mb-1 mt-8 text-lg tracking-tight text-charcoal">
        Delivery zones
      </h2>
      <p className="mb-3 text-sm text-sand-600">
        These drive the checkout dropdown, the delivery fee, the minimum order
        and the same-day cutoff. Changes apply to the next order placed.
      </p>

      <div className="flex flex-col gap-3">
        {zones.map((zone) => {
          const used = ordersIn(zone.id);
          return (
            <Card key={zone.id}>
              <form action={updateZone} className="grid gap-3">
                <input type="hidden" name="zoneId" value={zone.id} />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base text-charcoal">
                    {zone.name}
                    {!zone.active && (
                      <span className="ml-2 text-xs text-sand-500">
                        not delivering
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-sand-600">
                    {used} {used === 1 ? "order" : "orders"} delivered here
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <label className="flex flex-col gap-1.5 lg:col-span-2">
                    <span className="text-xs text-sand-600">Zone name</span>
                    <input name="name" defaultValue={zone.name} className={input} />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-sand-600">Fee (Rs)</span>
                    <input
                      type="number"
                      name="fee"
                      min={0}
                      defaultValue={zone.fee}
                      className={num}
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-sand-600">Minimum (Rs)</span>
                    <input
                      type="number"
                      name="minOrder"
                      min={0}
                      defaultValue={zone.minOrder}
                      className={num}
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-sand-600">Cutoff hour</span>
                    <input
                      type="number"
                      name="sameDayCutoff"
                      min={0}
                      max={23}
                      defaultValue={zone.sameDayCutoff}
                      className={num}
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-4">
                    <span className="text-xs text-sand-600">
                      Areas{" "}
                      <span className="text-sand-500">— comma separated</span>
                    </span>
                    <input
                      name="areas"
                      defaultValue={zone.areas.join(", ")}
                      className={input}
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-sand-600">Order</span>
                    <input
                      type="number"
                      name="sortOrder"
                      min={0}
                      defaultValue={zone.sortOrder}
                      className={num}
                    />
                  </label>
                </div>

                <button className="w-fit rounded-full bg-charcoal px-5 py-2.5 text-sm text-cream transition-colors hover:bg-sand-800">
                  save zone
                </button>
              </form>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-sand-200 pt-3">
                <form action={toggleZone}>
                  <input type="hidden" name="zoneId" value={zone.id} />
                  <button
                    className={
                      zone.active
                        ? "rounded-full bg-olive/15 px-4 py-2 text-xs text-olive transition-colors hover:bg-olive/25"
                        : "rounded-full bg-sand-300 px-4 py-2 text-xs text-sand-700 transition-colors hover:bg-sand-400"
                    }
                  >
                    {zone.active ? "delivering — stop" : "stopped — resume"}
                  </button>
                </form>

                <form action={deleteZone} className="ml-auto">
                  <input type="hidden" name="zoneId" value={zone.id} />
                  <button
                    disabled={used > 0}
                    title={
                      used > 0
                        ? "Orders have been delivered here — stop delivering instead"
                        : "Delete this zone"
                    }
                    className="rounded-full border border-terracotta/40 px-4 py-2 text-xs text-terracotta-deep transition-colors hover:bg-terracotta/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    delete
                  </button>
                </form>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-4 border-terracotta/25 bg-terracotta/[0.04]">
        <h3 className="text-base text-charcoal">Add a zone</h3>
        <form
          action={createZone}
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          <label className="flex flex-col gap-1.5 lg:col-span-2">
            <span className="text-xs text-sand-600">Zone name *</span>
            <input
              name="name"
              required
              placeholder="Gulberg &amp; Garden Town"
              className={input}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-sand-600">Fee (Rs)</span>
            <input
              type="number"
              name="fee"
              min={0}
              defaultValue={200}
              className={num}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-sand-600">Minimum (Rs)</span>
            <input
              type="number"
              name="minOrder"
              min={0}
              defaultValue={0}
              className={num}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-sand-600">Cutoff hour</span>
            <input
              type="number"
              name="sameDayCutoff"
              min={0}
              max={23}
              defaultValue={13}
              className={num}
            />
          </label>
          <label className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-4">
            <span className="text-xs text-sand-600">
              Areas <span className="text-sand-500">— comma separated</span>
            </span>
            <input
              name="areas"
              placeholder="Gulberg, Garden Town, Faisal Town"
              className={input}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-sand-600">Order</span>
            <input
              type="number"
              name="sortOrder"
              min={0}
              defaultValue={zones.length + 1}
              className={num}
            />
          </label>
          <div className="lg:col-span-5">
            <button className="rounded-full bg-terracotta px-6 py-3 text-sm text-cream transition-colors hover:bg-terracotta-deep">
              add zone
            </button>
          </div>
        </form>
      </Card>
    </>
  );
}
