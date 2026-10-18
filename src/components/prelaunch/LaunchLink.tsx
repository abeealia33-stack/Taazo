import type { AnchorHTMLAttributes } from "react";

/** Native navigation also scrolls to the homepage fragment from guide pages. */
export function LaunchLink(props: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  // Next's client transition can preserve the article's scroll position at this fragment.
  // eslint-disable-next-line @next/next/no-html-link-for-pages
  return <a {...props} href="/#launch-updates" />;
}
