import { cache } from "react";
import { createHash } from "node:crypto";
import { PrismaClient } from "@/generated/prisma";
import { db } from "@/lib/db";
import { CHULIMAAR } from "@/lib/chulimaar";
import { defaultHomepageContent, homepageSchema, HOMEPAGE_KEY, PHOTO_FIELDS, type HomepageContent } from "./homepage-schema";

export function contentRevision(value: string | null) { return createHash("sha256").update(value ?? "unpublished").digest("hex"); }
export function homepageDefaults() {
  const content = defaultHomepageContent();
  for (const { key } of PHOTO_FIELDS) content.images[key].url = CHULIMAAR.photos[key] || "";
  content.images.hero.alt = CHULIMAAR.heroPhotoAlt;
  if (content.images.hero.url) content.hero.slides = [{ ...content.images.hero, id: "legacy-hero", mobilePosition: content.images.hero.position, enabled: true }];
  content.contact = { email: CHULIMAAR.email || "", instagram: CHULIMAAR.instagram || "", whatsapp: CHULIMAAR.whatsapp || "" };
  return content;
}

const cmsGlobal = globalThis as unknown as { homepageDb?: PrismaClient; homepageRead?: Promise<HomepageContent>; homepageLastGood?: HomepageContent };
function publicDb() {
  if (!cmsGlobal.homepageDb) {
    const connection = process.env.DATABASE_URL!;
    // MongoDB seed lists can contain multiple host:port pairs, which the web URL
    // parser rejects. Only edit the query; preserve the driver's connection syntax.
    const queryStart = connection.indexOf("?");
    const base = queryStart < 0 ? connection : connection.slice(0, queryStart);
    const options = new URLSearchParams(queryStart < 0 ? "" : connection.slice(queryStart + 1));
    // Editorial reads fail quickly so an offline database does not blank the pre-launch page.
    options.set("serverSelectionTimeoutMS", "1000");
    options.set("connectTimeoutMS", "1000");
    cmsGlobal.homepageDb = new PrismaClient({ datasourceUrl: `${base}?${options}`, log: [] });
  }
  return cmsGlobal.homepageDb;
}
export function parseHomepage(value: string | null | undefined): HomepageContent {
  if (!value) return homepageDefaults();
  return homepageSchema.parse(JSON.parse(value));
}
export const getHomepageContent = cache(async (): Promise<HomepageContent> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    if (!cmsGlobal.homepageRead) {
      const pending = publicDb().setting.findUnique({ where: { key: HOMEPAGE_KEY } })
        .then((row) => parseHomepage(row?.value))
        .then((content) => { if (cmsGlobal.homepageRead === pending) cmsGlobal.homepageLastGood = content; return content; })
        .catch(() => cmsGlobal.homepageLastGood || homepageDefaults())
        .finally(() => { if (cmsGlobal.homepageRead === pending) cmsGlobal.homepageRead = undefined; });
      cmsGlobal.homepageRead = pending;
    }
    // Share one in-flight read and bound rendering even if the driver is still reconnecting.
    return await Promise.race([cmsGlobal.homepageRead, new Promise<HomepageContent>((resolve) => { timer = setTimeout(() => resolve(cmsGlobal.homepageLastGood || homepageDefaults()), 1500); })]);
  } catch { return cmsGlobal.homepageLastGood || homepageDefaults(); }
  finally { clearTimeout(timer); }
});
export async function getHomepageEditor() {
  const row = await db.setting.findUnique({ where: { key: HOMEPAGE_KEY } });
  return { content: parseHomepage(row?.value), revision: contentRevision(row?.value ?? null) };
}

export async function persistHomepage(content: HomepageContent, revision: string, actor: { userId: string; name: string }) {
  const checked = homepageSchema.parse(content);
  await db.$transaction(async (tx) => {
    const current = await tx.setting.findUnique({ where: { key: HOMEPAGE_KEY } });
    if (contentRevision(current?.value ?? null) !== revision) throw new Error("CONTENT_CONFLICT");
    const value = JSON.stringify(checked);
    if (current) {
      const result = await tx.setting.updateMany({ where: { key: HOMEPAGE_KEY, value: current.value }, data: { value } });
      if (result.count !== 1) throw new Error("CONTENT_CONFLICT");
    } else await tx.setting.create({ data: { key: HOMEPAGE_KEY, value } });
    await tx.auditLog.create({ data: { actorId: actor.userId, actorName: actor.name, entity: "Setting", entityId: HOMEPAGE_KEY, action: "published homepage content" } });
  });
  cmsGlobal.homepageLastGood = checked;
  cmsGlobal.homepageRead = undefined;
  return contentRevision(JSON.stringify(checked));
}
