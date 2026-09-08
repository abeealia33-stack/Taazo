import { whatsappLink } from "@/lib/site";

/**
 * Persistent WhatsApp button.
 *
 * In Pakistan this converts better than any contact form, so it is always
 * reachable. Kept out of the way of the cart on mobile.
 */
export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink("Hi taazo! I have a question about your juices.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with taazo on WhatsApp"
      className="group fixed bottom-5 left-5 z-40 flex h-13 items-center gap-2.5 rounded-full bg-olive px-4 py-3.5 text-cream shadow-lg transition-[transform,background-color] duration-[var(--dur-fast)] ease-(--ease-out-soft) hover:-translate-y-0.5 hover:bg-olive-light"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 shrink-0"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.23-8.23a8.18 8.18 0 0 1 5.82 2.41 8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.21-8.23 8.21Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.19-.53.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.47c-.16 0-.43.06-.65.31-.22.24-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29Z" />
      </svg>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-[max-width,opacity] duration-[var(--dur-base)] ease-(--ease-out-soft) group-hover:max-w-32 group-hover:opacity-100">
        WhatsApp
      </span>
    </a>
  );
}
