export const siteNav = [
  { label: "Home", href: "/" },
  { label: "Library", href: "/library" },
  { label: "About", href: "/about" },
  { label: "Courses", href: "/courses" },
  { label: "Podcasts", href: "/podcasts" },
  { label: "Digital Marketing", href: "/digital-marketing" },
  { label: "Digital Advertising", href: "/digital-advertising" },
  { label: "Apps & Store", href: "/marketing" },
  { label: "Contact", href: "/contact" },
] as const;

export const founderProfile = {
  name: "Dr Christopher Appiah-Thompson",
  title: "Founder, World Class Scholars",
  location: "Australia",
  email: "christopher.appiahthompson@myworldclass.org",
  profileUrl: "https://christopherappiahthompson.link",
  avatar:
    "https://0.gravatar.com/avatar/d8bd3742b066b58641607204c431fb47b6b32016887ba1a7b95e91279d7562d3?size=512",
  bio:
    "Global consultancy championing equity, dignity, and social justice in disability, mental health, and dementia care — bridging research, practice, lived experience, and creative storytelling.",
};

export const socialChannels = [
  { label: "LinkedIn", handle: "christopher-appiah-thompson-a2014045", url: "https://www.linkedin.com/in/christopher-appiah-thompson-a2014045" },
  { label: "TikTok", handle: "@chrsappiah", url: "https://tiktok.com/@chrsappiah" },
  { label: "YouTube", handle: "World Class Scholars", url: "https://www.youtube.com/channel/UC2a-_QUygsGAKWzEdKHEP9Q" },
  { label: "Facebook", handle: "Verified profile", url: "https://christopherappiahthompson.link/facebook" },
  { label: "PayPal", handle: "christopherappiahthompson", url: "https://paypal.me/christopherappiahthompson" },
];

export const podcasts = [
  { label: "Heartbeats Beyond Memory — Creative Care in Dementia", url: "https://rss.com/podcasts/heartbeats-beyond-memory-creative-care-in-dementia/2357430" },
  { label: "Decoding the Signs and Symbols of Freemasonry in the 21st Century", url: "https://rss.com/podcasts/decoding-the-signs-and-symbols-of-freemasonry-in-the-21st-century/" },
  { label: "Art, Culture and Philosophies of Tattoos", url: "https://rss.com/podcasts/art-culture-and-philosophies-of-tattoos" },
];

export type IosApp = {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  accent: string;
  appStoreId?: string;
  testflightUrl?: string;
  features: string[];
  category: "care" | "assessment" | "learning" | "utility";
};

export const iosApps: IosApp[] = [
  {
    slug: "wcs-care",
    name: "WCS Care",
    subtitle: "Dementia & disability care companion",
    description:
      "Evidence-informed strategies, daily reflection prompts, and personalised care plans for family carers and support workers in dementia and disability care.",
    accent: "#4f98a3",
    features: ["Daily care reflections", "Personalised care plans", "Crisis quick-reference guides", "Multi-carer sync"],
    category: "care",
  },
  {
    slug: "wcs-goldtest",
    name: "WCS Gold Test",
    subtitle: "Aged care quality assessor",
    description:
      "Audit-ready checklists, compliance tracking, and quality indicator scoring for aged care providers preparing for ACQSC review and the Aged Care Quality Standards.",
    accent: "#c9952c",
    features: ["ACQSC-ready checklists", "Quality indicator dashboards", "Evidence attachment", "PDF export"],
    category: "assessment",
  },
  {
    slug: "wcs-agentic",
    name: "WCS Agentic",
    subtitle: "AI tutor & exam prep",
    description:
      "AI-powered tutoring, adaptive quizzes, and exam preparation for care workers pursuing micro-credentials and CHC/HLT qualification upgrades.",
    accent: "#7c5cbf",
    features: ["Adaptive AI tutoring", "CHC/HLT exam prep", "Micro-credential pathways", "Progress analytics"],
    category: "learning",
  },
  {
    slug: "wcs-commerce",
    name: "WCS Commerce",
    subtitle: "StoreKit subscriptions & in-app purchases",
    description:
      "Manage App Store subscriptions, in-app purchases, promotional offers, and customer referral links — the commerce backend powering all WCS iOS apps.",
    accent: "#2a9d8f",
    features: ["Subscription management", "Promotional offers", "Referral link tracking", "Receipt validation"],
    category: "utility",
  },
];

export const aboutPillars = [
  { title: "Consultancy", description: "Policy, co-design, and implementation support for government, NGOs, and community organisations." },
  { title: "Education", description: "Courses and micro-credentials for care workers, leaders, and interdisciplinary teams." },
  { title: "Creative media", description: "Podcasts, digital art, and ethical brand campaigns that centre lived experience." },
];
