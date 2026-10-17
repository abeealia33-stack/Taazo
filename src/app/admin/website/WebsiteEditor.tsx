"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, Circle, Info, Plus, Save, Trash2 } from "lucide-react";
import { CONTENT_SECTIONS, MAX_HERO_SLIDES, PHOTO_FIELDS, TEXT_FIELDS, type HomepageContent, type PhotoKey, type TextKey } from "@/lib/homepage-schema";
import { saveHomepage } from "./actions";
import { PhotoUploadCard } from "./PhotoUploadCard";
import { HeroSlideshowCard, type HeroUploadResult } from "./HeroSlideshowCard";

const TABS = ["Photos", "Page content", "FAQs"] as const;
const PAGE_SECTIONS = CONTENT_SECTIONS.filter(section => section !== "FAQs");

export function WebsiteEditor({ initialContent, initialRevision, uploadsAvailable }: { initialContent: HomepageContent; initialRevision: string; uploadsAvailable: boolean }) {
  const [content, setContent] = useState(initialContent);
  const [revision, setRevision] = useState(initialRevision);
  const [tab, setTab] = useState<typeof TABS[number]>("Photos");
  const [section, setSection] = useState<typeof PAGE_SECTIONS[number]>("Hero");
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [uploading, setUploading] = useState<PhotoKey | null>(null);
  const [pending, startTransition] = useTransition();
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const leaveDialog = useRef<HTMLDialogElement>(null);
  const allowNavigation = useRef(false);
  const [navigation, setNavigation] = useState<{ href: string } | { form: HTMLFormElement } | null>(null);
  const router = useRouter();
  const blocked = pending || Boolean(uploading);

  useEffect(() => {
    const protect = (event: BeforeUnloadEvent) => { if (!allowNavigation.current && (dirty || blocked)) { event.preventDefault(); event.returnValue = ""; } };
    const protectLink = (event: MouseEvent) => {
      if (allowNavigation.current || !(dirty || blocked) || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const target = new URL(link.href, location.href);
      if (target.origin === location.origin && target.pathname === location.pathname && target.search === location.search) return;
      event.preventDefault(); event.stopPropagation(); setNavigation({ href: link.href });
    };
    const protectSignout = (event: SubmitEvent) => {
      if (!allowNavigation.current && (dirty || blocked) && event.target instanceof HTMLFormElement) { event.preventDefault(); event.stopPropagation(); setNavigation({ form: event.target }); }
    };
    window.addEventListener("beforeunload", protect);
    document.addEventListener("click", protectLink, true);
    document.addEventListener("submit", protectSignout, true);
    return () => { window.removeEventListener("beforeunload", protect); document.removeEventListener("click", protectLink, true); document.removeEventListener("submit", protectSignout, true); };
  }, [dirty, blocked]);

  useEffect(() => {
    const panel = leaveDialog.current;
    if (!navigation || !panel) return;
    panel.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { panel.close(); document.body.style.overflow = previous; };
  }, [navigation]);

  function leaveEditor() {
    if (!navigation) return;
    allowNavigation.current = true;
    setNavigation(null);
    if ("form" in navigation) navigation.form.requestSubmit();
    else {
      const target = new URL(navigation.href);
      if (target.origin === location.origin) router.push(target.pathname + target.search + target.hash);
      else location.assign(target.href);
    }
  }

  function changed() { setDirty(true); setStatus(null); }
  function editText(key: TextKey, value: string) { setContent(previous => ({ ...previous, text: { ...previous.text, [key]: value } })); changed(); }
  function editPhoto(key: PhotoKey, values: Partial<HomepageContent["images"][PhotoKey]>) { setContent(previous => ({ ...previous, images: { ...previous.images, [key]: { ...previous.images[key], ...values } } })); changed(); }
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
    if (!uploadsAvailable) return;
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
  async function uploadHero(files: File[], replaceId?: string, progress?: (message: string) => void): Promise<HeroUploadResult[]> {
    if (!uploadsAvailable || blocked) return [];
    setUploading("hero"); setStatus(null);
    const results: HeroUploadResult[] = [];
    let remaining = replaceId ? 1 : MAX_HERO_SLIDES - content.hero.slides.length;
    try {
      for (const [index, file] of files.entries()) {
        progress?.(`Uploading ${index + 1} of ${files.length}: ${file.name}`);
        try {
          if (remaining <= 0) throw new Error(`You can add up to ${MAX_HERO_SLIDES} slides. Remove a slide to make room.`);
          if (file.size > 8 * 1024 * 1024) throw new Error("Choose an image smaller than 8MB.");
          if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) throw new Error("Choose a JPG, PNG, WebP or AVIF image.");
          const body = new FormData(); body.set("photo", file);
          const response = await fetch("/api/admin/homepage-upload", { method: "POST", body });
          const result = await response.json();
          if (!response.ok || !result.url) throw new Error(result.error || "Upload failed. Please try again.");
          const id = crypto.randomUUID();
          setContent(previous => ({ ...previous, hero: { ...previous.hero, slides: replaceId ? previous.hero.slides.map(slide => slide.id === replaceId ? { ...slide, url: result.url } : slide) : [...previous.hero.slides, { id, url: result.url, alt: "", position: "center", mobilePosition: "center", enabled: true }] } }));
          changed(); remaining--;
          results.push({ name: file.name, ok: true, message: replaceId ? "Image replaced in your draft." : "Uploaded. Add an image description before saving." });
        } catch (error) { results.push({ name: file.name, ok: false, message: error instanceof Error ? error.message : "Upload failed. Please try again." }); }
      }
      setStatus({ ok: results.every(result => result.ok), message: `${results.filter(result => result.ok).length} of ${files.length} images uploaded. Review slide descriptions, then save changes to publish.` });
      return results;
    } finally { setUploading(null); }
  }
  function editFaq(index: number, key: "question" | "answer", value: string) { setContent(previous => ({ ...previous, faqs: previous.faqs.map((faq, i) => i === index ? { ...faq, [key]: value } : faq) })); changed(); }
  function moveFaq(index: number, delta: number) { setContent(previous => { const faqs = [...previous.faqs]; [faqs[index], faqs[index + delta]] = [faqs[index + delta], faqs[index]]; return { ...previous, faqs }; }); changed(); }

  return <div className="admin-editor">
    <dialog ref={leaveDialog} className="admin-dialog admin-leave-dialog" aria-labelledby="leave-editor-title" aria-describedby="leave-editor-description" onCancel={() => setNavigation(null)} onClose={() => setNavigation(null)}>
      <div className="admin-dialog-content"><h2 id="leave-editor-title" className="text-xl">{blocked ? "Leave while changes are in progress?" : "Leave without saving?"}</h2><p id="leave-editor-description" className="admin-description">{blocked ? "A save or upload is still running. Stay here until it finishes to check the result." : "Your latest edits haven’t been published. Keep editing to save them before you leave."}</p></div><div className="admin-dialog-footer"><button type="button" className="admin-button admin-button-secondary admin-button-danger" onClick={leaveEditor}>{navigation && "form" in navigation ? "Sign out" : "Leave page"}</button><button type="button" className="admin-button" onClick={() => setNavigation(null)}>Keep editing</button></div>
    </dialog>
    <div className="admin-editor-bar">
      <p className="admin-save-state" aria-live="polite">{pending ? <Save size={16} aria-hidden="true" /> : dirty ? <Circle size={13} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}{pending ? "Saving your changes…" : uploading ? "Uploading photo…" : dirty ? "Unsaved changes" : status?.ok ? "All changes saved" : "Published content loaded"}</p>
      <button type="button" onClick={save} disabled={blocked || !dirty} className="admin-button"><Save size={16} aria-hidden="true" />{pending ? "Saving…" : "Save changes"}</button>
    </div>
    {status && <p role={status.ok ? "status" : "alert"} className={`admin-notice mb-5 ${status.ok ? "admin-notice-success" : "admin-notice-error"}`}>{status.message}</p>}
    <div role="tablist" aria-label="Website sections" className="admin-tabs">{TABS.map((name, index) => <button key={name} id={`editor-tab-${index}`} ref={node => { tabButtons.current[index] = node; }} type="button" role="tab" aria-selected={name === tab} aria-controls={`editor-panel-${index}`} tabIndex={name === tab ? 0 : -1} onClick={() => setTab(name)} onKeyDown={event => { let next = index; if (event.key === "ArrowRight") next = (index + 1) % TABS.length; else if (event.key === "ArrowLeft") next = (index + TABS.length - 1) % TABS.length; else if (event.key === "Home") next = 0; else if (event.key === "End") next = TABS.length - 1; else return; event.preventDefault(); setTab(TABS[next]); tabButtons.current[next]?.focus(); }}>{name}</button>)}</div>
    <div id="editor-panel-0" role="tabpanel" aria-labelledby="editor-tab-0" hidden={tab !== "Photos"}>
      <div className="admin-section-heading"><div><h2>Homepage photographs</h2><p className="admin-description">Manage your hero slideshow and page photographs.</p></div><span className="admin-status">{PHOTO_FIELDS.filter(photo => photo.key === "hero" ? content.hero.slides.some(slide => slide.enabled) : content.images[photo.key].url).length} of {PHOTO_FIELDS.length} added</span></div>
      {!uploadsAvailable && <p className="admin-notice mb-5"><Info size={17} aria-hidden="true" />Photo uploads are being set up. You can still edit captions and descriptions. Empty spaces show labelled placeholders on your website.</p>}
      <div className="admin-photo-grid"><HeroSlideshowCard hero={content.hero} text={content.text} locked={blocked} busy={uploading === "hero"} uploadsAvailable={uploadsAvailable} onChange={hero => { setContent(previous => ({ ...previous, hero })); changed(); }} onUpload={uploadHero} />{PHOTO_FIELDS.filter(photo => photo.key !== "hero").map(photo => <PhotoUploadCard key={photo.key} photo={photo} image={content.images[photo.key]} uploading={uploading} disabled={pending} uploadsAvailable={uploadsAvailable} notice={status} onOpen={() => setStatus(null)} onEdit={editPhoto} onUpload={upload} product={photo.key === "oil" ? { animation: content.product.animation, text: content.text, onAnimation: animation => { setContent(previous => ({ ...previous, product: { ...previous.product, animation } })); changed(); } } : undefined} />)}</div>
      {uploadsAvailable && <p className="admin-muted mt-5">Empty spaces show labelled placeholders on your live website. Upload a photograph, then save changes to publish it.</p>}
    </div>
    <div id="editor-panel-1" role="tabpanel" aria-labelledby="editor-tab-1" hidden={tab !== "Page content"}>
      <label className="admin-field admin-content-selector">Website section<select value={section} onChange={event => setSection(event.target.value as typeof section)} className="admin-input">{PAGE_SECTIONS.map(name => <option key={name}>{name}</option>)}</select></label>
      <fieldset disabled={blocked} className="admin-panel"><legend className="sr-only">{section} content</legend><h2 className="mb-6">{section}</h2><div className="admin-field-grid">{TEXT_FIELDS.filter(field => field.section === section).map(field => <label key={field.key} className={`admin-field${"long" in field ? " admin-field-wide" : ""}`}><span>{field.label}</span>{"long" in field ? <textarea rows={4} value={content.text[field.key]} maxLength={2000} onChange={event => editText(field.key, event.target.value)} className="admin-input" /> : <input value={content.text[field.key]} maxLength={180} onChange={event => editText(field.key, event.target.value)} className="admin-input" />}</label>)}</div>
        {section === "Footer" && <div className="mt-7 grid gap-5 border-t border-sand-200 pt-6"><div><h3>Contact and social links</h3><p className="admin-description">Leave a channel blank to hide it on the website.</p></div>{([{ key: "email", label: "Contact email", type: "email" }, { key: "instagram", label: "Instagram profile URL", type: "url" }, { key: "whatsapp", label: "WhatsApp number (international digits)", type: "tel" }] as const).map(contact => <label key={contact.key} className="admin-field">{contact.label}<input type={contact.type} value={content.contact[contact.key]} maxLength={400} onChange={event => { setContent(previous => ({ ...previous, contact: { ...previous.contact, [contact.key]: event.target.value } })); changed(); }} className="admin-input" /></label>)}</div>}
        {section === "Launch signup" && <p className="admin-muted mt-5">Your signup form, privacy notice and private removal links stay connected to the existing signup system.</p>}
      </fieldset>
    </div>
    <div id="editor-panel-2" role="tabpanel" aria-labelledby="editor-tab-2" hidden={tab !== "FAQs"}>
      <div className="admin-section-heading"><div><h2>Questions and answers</h2><p className="admin-description">Help visitors understand what comes next.</p></div><span className="admin-status">{content.faqs.length} of 20 questions</span></div>
      <fieldset disabled={blocked} className="admin-faq"><legend className="sr-only">Frequently asked questions</legend>{content.faqs.map((faq, index) => <div key={index} className="admin-faq-item"><label className="admin-field">Question {index + 1}<input value={faq.question} maxLength={200} onChange={event => editFaq(index, "question", event.target.value)} className="admin-input" /></label><label className="admin-field">Answer {index + 1}<textarea rows={3} value={faq.answer} maxLength={2000} onChange={event => editFaq(index, "answer", event.target.value)} className="admin-input" /></label><div className="admin-faq-actions"><div><button type="button" disabled={index === 0} onClick={() => moveFaq(index, -1)} className="admin-icon-button" aria-label={`Move question ${index + 1} up`}><ArrowUp size={17} aria-hidden="true" /></button><button type="button" disabled={index === content.faqs.length - 1} onClick={() => moveFaq(index, 1)} className="admin-icon-button" aria-label={`Move question ${index + 1} down`}><ArrowDown size={17} aria-hidden="true" /></button></div><button type="button" disabled={content.faqs.length === 1} onClick={() => { setContent(previous => ({ ...previous, faqs: previous.faqs.filter((_, i) => i !== index) })); changed(); }} className="admin-button admin-button-quiet admin-button-danger" aria-label={`Remove question ${index + 1}`}><Trash2 size={16} aria-hidden="true" />Remove</button></div></div>)}<button type="button" disabled={content.faqs.length >= 20} onClick={() => { setContent(previous => ({ ...previous, faqs: [...previous.faqs, { question: "", answer: "" }] })); changed(); }} className="admin-button admin-button-secondary justify-self-start"><Plus size={17} aria-hidden="true" />Add question</button></fieldset>
    </div>
  </div>;
}
