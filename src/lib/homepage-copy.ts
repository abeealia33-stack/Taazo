import type { HomepageContent, TextKey } from "./homepage-schema";

// Upgrade only previous shipped copy; preserve owner edits and all media.
const updates = {
  "heroEyebrow": {
    "previous": "Preparing our first batch",
    "current": "Apricot oil from Skardu"
  },
  "heroTitle": {
    "previous": "Rooted in Skardu.",
    "current": "Apricot kernel oil."
  },
  "heroTitleEm": {
    "previous": "Pressed in Skardu.",
    "current": "From Skardu, Pakistan."
  },
  "heroBody": {
    "previous": "I'm preparing to press our first batch personally in Skardu, where I'm from. One product for your kitchen, built from our roots.",
    "current": "Rooted in Skardu, CHULIMAAR begins with one oil and a focus on cooking. Founded by Asad Ali and Muhammad Raza, with a personal connection to the place behind our oil."
  },
  "founderCta": {
    "previous": "Meet the Founder",
    "current": "Meet the Co-founders"
  },
  "oilBody": {
    "previous": "We're beginning with one oil and a focus on cooking. We'll share the details as our preparation takes shape.",
    "current": "Apricot kernel oil pressed in Skardu, Pakistan, with cooking as our primary focus. Explore our product information and follow our launch updates."
  },
  "productionLabel": {
    "previous": "Planned production",
    "current": "Pressed in"
  },
  "pressingBody": {
    "previous": "We plan to press the oil ourselves in Skardu, documenting our equipment and extraction method as we begin.",
    "current": "Our oil is pressed in Skardu, Pakistan. Detailed equipment and extraction information will be shared when confirmed."
  },
  "founderEyebrow": {
    "previous": "The person behind Chulimaar",
    "current": "The people behind Chulimaar"
  },
  "founderQuote": {
    "previous": "“I'm from Skardu. Chulimaar is the Balti name we use for apricot oil.”",
    "current": "Chulimaar is the Balti name we use for apricot oil."
  },
  "founderBody": {
    "previous": "I'm starting with one product and preparing to press the oil myself, building a business connected to my language and home.",
    "current": "CHULIMAAR is founded by Asad Ali and Muhammad Raza. Our story begins with apricot kernel oil, a focus on the kitchen, and roots in Skardu."
  },
  "founderName": {
    "previous": "The founder of Chulimaar",
    "current": "Asad Ali & Muhammad Raza"
  },
  "founderLocation": {
    "previous": "Skardu, Pakistan",
    "current": "Co-founders · Skardu, Pakistan"
  }
};

export function upgradeHomepageCopy(content: HomepageContent): HomepageContent {
  for (const [key, change] of Object.entries(updates) as [TextKey, { previous: string; current: string }][]) {
    if (content.text[key] === change.previous) content.text[key] = change.current;
  }
  for (const faq of content.faqs) {
    if (faq.question === "Where will the oil be pressed?" && faq.answer === "We plan to press the oil ourselves in Skardu, where our founder is from and is preparing the first batch.") {
      faq.question = "Where is CHULIMAAR oil pressed?";
      faq.answer = "CHULIMAAR oil is pressed in Skardu, Pakistan. Detailed sourcing and processing information will be shared when confirmed.";
    }
  }
  return content;
}
