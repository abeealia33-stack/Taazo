"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CONTENT_SECTIONS, PHOTO_FIELDS, TEXT_FIELDS, type HomepageContent, type PhotoKey, type TextKey } from "@/lib/homepage-schema";
import { saveHomepage } from "./actions";
import { PhotoUploadCard } from "./PhotoUploadCard";

const fieldClass = "w-full min-h-11 rounded-md border border-sand-300 bg-cream px-3 py-2 text-base text-charcoal outline-offset-2 focus:outline-2 focus:outline-terracotta";
const buttonClass = "min-h-11 rounded-full bg-charcoal px-5 py-2 text-sm text-cream hover:bg-sand-800 disabled:cursor-wait disabled:opacity-60";
const EDITOR_SECTIONS = ["Photos & banners", ...CONTENT_SECTIONS] as const;

export function WebsiteEditor({ initialContent, initialRevision }: { initialContent: HomepageContent; initialRevision: string }) {
  const [content, setContent] = useState(initialContent);
  const [revision, setRevision] = useState(initialRevision);
  const [section, setSection] = useState<typeof EDITOR_SECTIONS[number]>("Photos & banners");
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [uploading, setUploading] = useState<PhotoKey | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  useEffect(() => {
    const protect = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [dirty]);
  function editText(key: TextKey, value: string) { setContent((previous) => ({ ...previous, text: { ...previous.text, [key]: value } })); setDirty(true); setStatus(null); }
  function editPhoto(key: PhotoKey, values: Partial<HomepageContent["images"][PhotoKey]>) { setContent((previous) => ({ ...previous, images: { ...previous.images, [key]: { ...previous.images[key], ...values } } })); setDirty(true); setStatus(null); }
  function save() {
    setStatus(null);
    startTransition(async () => {
      try {
        const result = await saveHomepage(JSON.stringify(content), revision);
        setStatus(result);
        if (result.ok && result.revision) { setRevision(result.revision); setDirty(false); router.refresh(); }
      } catch { setStatus({ ok: false, message: "The save request failed. Your edits are still here; try again." }); }
    });
  }
  async function upload(key: PhotoKey, file: File) {
    if (file.size > 8 * 1024 * 1024) { setStatus({ ok: false, message: "Choose a photo smaller than 8MB." }); return; }
    setUploading(key); setStatus(null);
    try {
      const body = new FormData(); body.set("photo", file);
      const response = await fetch("/api/admin/homepage-upload", { method: "POST", body });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error || "Upload failed. Please try again.");
      editPhoto(key, { url: result.url });
      setStatus({ ok: true, message: "Photo uploaded. Add its description, then save changes to publish it." });
    } catch (error) { setStatus({ ok: false, message: error instanceof Error ? error.message : "The photo could not be uploaded." }); }
    finally { setUploading(null); }
  }
  function editFaq(index: number, key: "question" | "answer", value: string) { setContent((previous) => ({ ...previous, faqs: previous.faqs.map((faq, i) => i === index ? { ...faq, [key]: value } : faq) })); setDirty(true); setStatus(null); }
  function moveFaq(index: number, delta: number) { const faqs = [...content.faqs]; [faqs[index], faqs[index + delta]] = [faqs[index + delta], faqs[index]]; setContent({ ...content, faqs }); setDirty(true); setStatus(null); }

  return <div className="grid items-start gap-6 lg:grid-cols-[190px_minmax(0,1fr)]">
    <nav aria-label="Website sections" className="flex flex-wrap gap-2 lg:sticky lg:top-36 lg:flex-col">{EDITOR_SECTIONS.map((name) => <button key={name} type="button" aria-current={name === section ? "page" : undefined} onClick={() => setSection(name)} className={`min-h-11 rounded-lg px-4 py-2 text-left text-sm ${name === section ? "bg-charcoal text-cream" : "border border-sand-300 bg-cream text-charcoal hover:bg-sand-200"}`}>{name}</button>)}</nav>
    <div className="min-w-0">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sand-200 bg-cream p-4"><p className="text-sm text-sand-700" aria-live="polite">{dirty ? "You have unsaved changes." : "Your published content is loaded."}</p><button type="button" onClick={save} disabled={pending || Boolean(uploading)} className={buttonClass}>{pending ? "Saving…" : "Save changes"}</button></div>
      {status && <p role={status.ok ? "status" : "alert"} className={`mb-5 rounded-lg border px-4 py-3 text-sm ${status.ok ? "border-olive/30 bg-olive/10 text-olive" : "border-terracotta/40 bg-terracotta/10 text-terracotta-deep"}`}>{status.message}</p>}
      <fieldset disabled={pending} className="min-w-0 rounded-xl border border-sand-200 bg-cream p-5 sm:p-6">
        <legend className="px-2 text-xl text-charcoal">{section}</legend>
        {section === "Photos & banners" && <div className="mb-6"><p className="text-sm leading-relaxed text-sand-700">All your website image spaces are here. Add authentic photographs, then save changes to show them on the frontend.</p><p className="mt-2 text-sm font-medium text-charcoal">{PHOTO_FIELDS.filter((photo) => content.images[photo.key].url).length} of {PHOTO_FIELDS.length} images added</p><p className="mt-2 text-xs leading-relaxed text-sand-600">Until you add photos, the hero keeps its labelled illustration and the other sections keep their text layouts.</p></div>}
        {PHOTO_FIELDS.filter((photo) => section === "Photos & banners" || photo.section === section).map((photo) => <PhotoUploadCard key={photo.key} photo={photo} image={content.images[photo.key]} uploading={uploading} disabled={pending} onEdit={editPhoto} onUpload={upload} />)}
        <div className="grid gap-5 sm:grid-cols-2">{TEXT_FIELDS.filter((field) => field.section === section).map((field) => <label key={field.key} className={`flex min-w-0 flex-col gap-2 ${"long" in field ? "sm:col-span-2" : ""}`}><span className="text-sm font-medium text-sand-800">{field.label}</span>{"long" in field ? <textarea rows={3} value={content.text[field.key]} maxLength={2000} onChange={(event) => editText(field.key, event.target.value)} className={fieldClass} /> : <input value={content.text[field.key]} maxLength={180} onChange={(event) => editText(field.key, event.target.value)} className={fieldClass} />}</label>)}</div>
        {section === "FAQs" && <div className="mt-7 border-t border-sand-200 pt-5"><h2 className="text-lg text-charcoal">Questions and answers</h2>{content.faqs.map((faq, index) => <div key={index} className="mt-4 grid gap-3 rounded-lg border border-sand-300 p-4"><label className="grid gap-2 text-sm text-sand-800">Question {index + 1}<input value={faq.question} maxLength={200} onChange={(event) => editFaq(index, "question", event.target.value)} className={fieldClass} /></label><label className="grid gap-2 text-sm text-sand-800">Answer {index + 1}<textarea rows={3} value={faq.answer} maxLength={2000} onChange={(event) => editFaq(index, "answer", event.target.value)} className={fieldClass} /></label><div className="flex flex-wrap gap-3"><button type="button" disabled={index === 0} onClick={() => moveFaq(index, -1)} className="min-h-11 px-2 text-sm text-sand-800 disabled:opacity-40" aria-label={`Move question ${index + 1} up`}>↑ Move up</button><button type="button" disabled={index === content.faqs.length - 1} onClick={() => moveFaq(index, 1)} className="min-h-11 px-2 text-sm text-sand-800 disabled:opacity-40" aria-label={`Move question ${index + 1} down`}>↓ Move down</button><button type="button" disabled={content.faqs.length === 1} onClick={() => { setContent({ ...content, faqs: content.faqs.filter((_, i) => i !== index) }); setDirty(true); }} className="min-h-11 px-2 text-sm text-terracotta-deep disabled:opacity-40">Remove question {index + 1}</button></div></div>)}<button type="button" disabled={content.faqs.length >= 20} onClick={() => { setContent({ ...content, faqs: [...content.faqs, { question: "", answer: "" }] }); setDirty(true); }} className="mt-4 min-h-11 rounded-full border border-sand-400 px-5 text-sm text-charcoal">Add question</button></div>}
        {section === "Footer" && <div className="mt-7 grid gap-5 border-t border-sand-200 pt-6"><h2 className="text-lg text-charcoal">Contact and social links</h2><p className="text-sm text-sand-600">Leave a channel blank to hide it on the website.</p>{([{ key: "email", label: "Contact email", type: "email" }, { key: "instagram", label: "Instagram profile URL", type: "url" }, { key: "whatsapp", label: "WhatsApp number (international digits)", type: "tel" }] as const).map((contact) => <label key={contact.key} className="grid gap-2 text-sm text-sand-800">{contact.label}<input type={contact.type} value={content.contact[contact.key]} maxLength={400} onChange={(event) => { setContent({ ...content, contact: { ...content.contact, [contact.key]: event.target.value } }); setDirty(true); setStatus(null); }} className={fieldClass} /></label>)}</div>}
        {section === "Launch signup" && <p className="mt-5 text-sm leading-relaxed text-sand-600">Email validation, optional name/city fields, consent, privacy and private removal links stay connected to the existing signup system.</p>}
      </fieldset>
      <div className="mt-5 flex justify-end"><button type="button" onClick={save} disabled={pending || Boolean(uploading)} className={buttonClass}>{pending ? "Saving…" : "Save changes"}</button></div>
    </div>
  </div>;
}
