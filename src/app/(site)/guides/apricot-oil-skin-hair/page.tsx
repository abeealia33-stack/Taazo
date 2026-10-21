import Link from "next/link";
import { InfoPage, type InfoSource } from "@/components/prelaunch/InfoPage";
import { pageMetadata } from "@/lib/seo";
import { getHomepageContent } from "@/lib/homepage-content";
import { MediaPanel } from "@/components/prelaunch/MediaPanel";

const path = "/guides/apricot-oil-skin-hair";
const title = "Apricot Oil for Skin and Hair";
const description = "Learn how apricot oil is used in skin and hair care, what cosmetic conditioning means, and how to check whether a product suits your routine.";
export const metadata = pageMetadata(title, description, path, true);
const sources: InfoSource[] = [{
  title: "Cosmetic Ingredient Review: Safety Assessment of Plant-Derived Fatty Acid Oils (2017)",
  url: "https://journals.sagepub.com/doi/10.1177/1091581817740569",
  note: "Includes apricot kernel oil and cosmetic formulations containing it. This is an ingredient safety assessment, not a test or endorsement of CHULIMAAR or proof of treatment effects.",
}];

export default async function SkinHairPage() {
  const { images } = await getHomepageContent();
  return <InfoPage article path={path} title={title} description={description} sources={sources} articleImage={images.skin.url || images.hair.url || undefined} eyebrow="Everyday questions · Cosmetic uses"
    answer={<p>Apricot kernel oil is used as an ingredient in skin-care and hair-care formulations. Cosmetic conditioning concerns how skin or hair feels; it does not establish a treatment effect. Choose a finished product labelled for your intended use and follow its directions. CHULIMAAR’s primary focus is cooking.</p>}
    sections={[
      { id: "skin-care", title: "How is apricot kernel oil used in skin care?", content: <><p>Apricot kernel oil appears in cosmetic formulations such as creams and face oils. Plant-derived fatty acid oils are used for emollient and skin-conditioning properties, helping skin feel softer. The <a href={sources[0].url}>CIR safety assessment</a> includes apricot kernel oil among the ingredients reviewed.</p><p>For an application to hands, choose a product with directions that permit that use. Follow its instructions for amount, frequency and any precautions. A safety finding about particular formulations does not establish that every bottle of apricot oil suits every person.</p></> },
      { id: "hair-care", title: "How can apricot oil fit into a hair-care routine?", content: <><p>It can be an ingredient in a cosmetic hair-care product. If that product’s directions permit application to the lengths or ends, use it as directed within your conditioning routine. There is no universal amount or leave-on time for every apricot oil formulation.</p><p>The <a href={sources[0].url}>CIR assessment</a> describes a tested scalp-conditioner formulation containing apricot kernel oil alongside other ingredients. That is evidence about that formulation’s safety assessment, rather than proof that apricot oil alone grows hair or that CHULIMAAR is a tested hair product.</p></> },
      { id: "product-choice", title: "What should I check before choosing apricot oil for skin or hair?", content: <><p>Check the finished product’s intended use, full ingredient list, application directions and precautions. A product name alone does not tell you whether an oil is suitable for your skin or hair.</p><div className="cm-info-table-wrap"><table className="cm-info-table"><caption>Choosing an oil for your routine</caption><thead><tr><th scope="col">Your routine</th><th scope="col">What to look for</th></tr></thead><tbody><tr><th scope="row">Skin care</th><td>Skin-use directions, ingredients and the maker’s precautions</td></tr><tr><th scope="row">Hair lengths or ends</th><td>Hair-use directions, including whether to rinse or leave on</td></tr><tr><th scope="row">Cooking</th><td>Explicit food-use labelling and product-specific culinary guidance</td></tr></tbody></table></div></> },
      { id: "chulimaar", title: "Can I use CHULIMAAR oil on my skin or hair?", content: <><p>CHULIMAAR’s finished-product suitability for skin and hair has not yet been confirmed in our published specifications. Our focus is apricot oil for cooking; cosmetic information on this page is general education.</p><p>See <Link href="/apricot-kernel-oil">CHULIMAAR’s product information and current availability</Link>. Skin and hair directions will be added only when supported for the finished product.</p></> },
      { id: "food-cosmetic", title: "Can an oil sold for skin or hair also be used in food?", content: <><p>Do not assume a cosmetic oil is suitable to eat. Use a product explicitly intended for food and follow its culinary directions. A cosmetic formulation may include other ingredients.</p><p>For the composition of apricot kernel oils, read <Link href="/guides/apricot-kernel-oil-unsaturated-fats">our guide to unsaturated fats in apricot oil</Link>.</p></> },
    ]}>
    {(images.skin.url || images.hair.url) && <div className="cm-editorial-photos">{(["skin", "hair"] as const).map(key => images[key].url && <MediaPanel key={key} photo={images[key].url} alt={images[key].alt} label={images[key].caption} placeholderLabel="Apricot oil use" position={images[key].position} />)}</div>}
  </InfoPage>;
}
