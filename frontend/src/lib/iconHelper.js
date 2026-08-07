// Helper for fetching company logos and creator avatars reliably across Companies, Sheets, and Roadmaps

const COMPANY_DOMAINS = {
  google: 'google.com',
  meta: 'meta.com',
  facebook: 'facebook.com',
  amazon: 'amazon.com',
  microsoft: 'microsoft.com',
  apple: 'apple.com',
  netflix: 'netflix.com',
  uber: 'uber.com',
  swiggy: 'swiggy.com',
  zomato: 'zomato.com',
  flipkart: 'flipkart.com',
  razorpay: 'razorpay.com',
  adobe: 'adobe.com',
  salesforce: 'salesforce.com',
  atlassian: 'atlassian.com',
  goldmansachs: 'goldmansachs.com',
  'goldman-sachs': 'goldmansachs.com',
  morganstanley: 'morganstanley.com',
  oracle: 'oracle.com',
  cisco: 'cisco.com',
  intuit: 'intuit.com',
  stripe: 'stripe.com',
  airbnb: 'airbnb.com',
  linkedin: 'linkedin.com',
  twitter: 'x.com',
  x: 'x.com'
};

const CREATOR_AVATARS = {
  striver: 'https://unavatar.io/youtube/takeuforward',
  'takeuforward': 'https://unavatar.io/youtube/takeuforward',
  neetcode: 'https://unavatar.io/github/neetcode-gh',
  'love-babbar': 'https://unavatar.io/youtube/codehelp-by-babbar',
  babbar: 'https://unavatar.io/youtube/codehelp-by-babbar',
  'apna-college': 'https://unavatar.io/youtube/apnacollegeofficial',
  fraz: 'https://unavatar.io/youtube/MohammadFraz',
  'rohit-negi': 'https://unavatar.io/youtube/CoderArmy',
  'coder-army': 'https://unavatar.io/youtube/CoderArmy'
};

export function getCompanyLogoUrl(nameOrSlug, rawLogoUrl) {
  if (rawLogoUrl && rawLogoUrl.startsWith('http')) return rawLogoUrl;

  const key = (nameOrSlug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [compKey, domain] of Object.entries(COMPANY_DOMAINS)) {
    if (key.includes(compKey)) {
      return `https://unavatar.io/${domain}?fallback=https://logo.clearbit.com/${domain}`;
    }
  }

  return `https://unavatar.io/${key}.com?fallback=https://logo.clearbit.com/${key}.com`;
}

export function getCreatorAvatarUrl(creatorOrName) {
  const key = (creatorOrName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [creatorKey, avatarUrl] of Object.entries(CREATOR_AVATARS)) {
    if (key.includes(creatorKey)) {
      return avatarUrl;
    }
  }
  return null;
}

export function getRoadmapIconInfo(roadmap) {
  const id = (roadmap.id || '').toLowerCase();
  const category = (roadmap.category || '').toLowerCase();
  const title = (roadmap.title || '').toLowerCase();

  // If company roadmap
  if (id.includes('company-') || category.includes('company') || title.includes('google') || title.includes('amazon') || title.includes('meta') || title.includes('microsoft') || title.includes('apple') || title.includes('netflix') || title.includes('uber') || title.includes('swiggy') || title.includes('flipkart')) {
    const matchedSlug = id.replace('company-', '') || title.split(' ')[0];
    return {
      type: 'company',
      url: getCompanyLogoUrl(matchedSlug),
      fallbackText: (roadmap.title || 'CO').slice(0, 2).toUpperCase()
    };
  }

  // If creator sheet roadmap
  if (id.includes('sheet-') || category.includes('sheet') || title.includes('striver') || title.includes('neetcode') || title.includes('babbar') || title.includes('fraz') || title.includes('apna')) {
    const matchedCreator = roadmap.creator || id.replace('sheet-', '');
    return {
      type: 'creator',
      url: getCreatorAvatarUrl(matchedCreator),
      fallbackText: (roadmap.creator || roadmap.title || 'DS').slice(0, 2).toUpperCase()
    };
  }

  // Role / Tech track
  return {
    type: 'role',
    url: null,
    fallbackText: (roadmap.title || 'RT').slice(0, 2).toUpperCase()
  };
}
