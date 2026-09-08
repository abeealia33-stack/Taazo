/**
 * Deletes uploaded files that nothing in the database references any more.
 *
 * Every place a /uploads/ URL can be stored is collected first, so a file is
 * only removed once it is genuinely unreachable. Dry-run by default; pass
 * --delete to actually remove.
 */
import { readdir, stat, unlink } from "fs/promises";
import path from "path";
import { db } from "../src/lib/db";

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries: string[] = [];
  try { entries = await readdir(dir); } catch { return out; }
  for (const name of entries) {
    const full = path.join(dir, name);
    const s = await stat(full);
    if (s.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

(async () => {
  const referenced = new Set<string>();

  for (const p of await db.product.findMany()) p.photos.forEach((u) => referenced.add(u));
  for (const c of await db.category.findMany()) if (c.photo) referenced.add(c.photo);
  for (const r of await db.reel.findMany()) {
    referenced.add(r.videoUrl);
    if (r.posterUrl) referenced.add(r.posterUrl);
  }
  for (const o of await db.order.findMany({ where: { paymentProof: { isSet: true } } })) {
    if (o.paymentProof?.url) referenced.add(o.paymentProof.url);
  }
  const hero = await db.setting.findUnique({ where: { key: "heroMedia" } });
  if (hero) {
    try {
      const v = JSON.parse(hero.value);
      if (v.url) referenced.add(v.url);
      if (v.posterUrl) referenced.add(v.posterUrl);
    } catch {}
  }

  const root = path.join(process.cwd(), "public", "uploads");
  const files = await walk(root);

  const orphans: { file: string; url: string; bytes: number }[] = [];
  for (const file of files) {
    const url = "/uploads/" + path.relative(root, file).split(path.sep).join("/");
    if (!referenced.has(url)) {
      orphans.push({ file, url, bytes: (await stat(file)).size });
    }
  }

  console.log(`referenced: ${referenced.size} | on disk: ${files.length} | orphaned: ${orphans.length}`);
  for (const o of orphans) {
    console.log(`  ${(o.bytes / 1024 / 1024).toFixed(2)}MB  ${o.url}`);
  }

  if (process.argv.includes("--delete")) {
    let freed = 0;
    for (const o of orphans) {
      await unlink(o.file);
      freed += o.bytes;
    }
    console.log(`deleted ${orphans.length} files, freed ${(freed / 1024 / 1024).toFixed(2)}MB`);
  } else {
    console.log("(dry run — nothing deleted)");
  }

  await db.$disconnect();
})();
