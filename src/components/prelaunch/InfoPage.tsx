import type { ReactNode } from "react";
import Link from "next/link";
import { CONTENT_DATE, pageSchema, siteUrl } from "@/lib/seo";
import { StructuredData } from "./StructuredData";
import { OilGuides } from "./OilGuides";
import { LaunchLink } from "./LaunchLink";

export type InfoSection = { id: string; title: string; content: ReactNode };
export type InfoSource = { title: string; url: string; note: string };
export function InfoPage({ path, title, description, eyebrow, answer, sections, sources = [], article = false, children }: {
  path: string; title: string; description: string; eyebrow: string; answer: ReactNode; sections: InfoSection[]; sources?: InfoSource[]; article?: boolean; children?: ReactNode;
}) {
  const webpage = pageSchema(path, title, description);
  return <>
    <StructuredData data={article ? { "@context": "https://schema.org", "@graph": [webpage, {
      "@type": "Article", "@id": `${siteUrl(path)}#article`, headline: title, description, mainEntityOfPage: { "@id": webpage["@id"] },
      author: { "@type": "Organization", "@id": siteUrl("/#organization"), name: "Chulimaar", url: siteUrl("/story") }, publisher: { "@id": siteUrl("/#organization") },
      datePublished: CONTENT_DATE, dateModified: CONTENT_DATE, inLanguage: "en-PK", image: [siteUrl("/opengraph-image")], citation: sources.map(source => source.url),
    }] } : webpage} />
    <article className="cm-container cm-info-page">
      <nav className="cm-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Chulimaar</Link><span aria-hidden="true">/</span><span aria-current="page">{title}</span></nav>
      <header className="cm-info-header"><p className="cm-eyebrow">{eyebrow}</p><h1>{title}</h1><div className="cm-info-answer">{answer}</div>{article && <p className="cm-info-byline">By <Link href="/story">Chulimaar</Link> · Published <time dateTime={CONTENT_DATE}>18 October 2026</time></p>}</header>
      {children}
      <div className="cm-info-grid"><nav className="cm-info-toc" aria-label="On this page"><p className="cm-eyebrow">On this page</p>{sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}{sources.length > 0 && <a href="#sources">Sources and scope</a>}</nav>
        <div className="cm-info-body">{sections.map(section => <section id={section.id} key={section.id}><h2>{section.title}</h2>{section.content}</section>)}
          {sources.length > 0 && <section id="sources" className="cm-info-sources"><h2>Sources and scope</h2><p>General educational information compiled by Chulimaar. Research on other oils or batches does not establish the composition or benefits of our forthcoming product.</p><ol>{sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a><p>{source.note}</p></li>)}</ol></section>}
        </div>
      </div>
      <aside className="cm-info-launch" aria-label="Chulimaar launch updates"><div><p className="cm-eyebrow">Our first batch is taking shape</p><h2>Follow our beginning <em>in Skardu.</em></h2><p>Get an email when our oil is ready and ordering details are confirmed.</p></div><LaunchLink className="cm-button cm-button-solid">Get launch updates <span aria-hidden="true">↗</span></LaunchLink></aside>
      <OilGuides current={path} />
    </article>
  </>;
}
