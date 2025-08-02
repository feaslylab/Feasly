/**
 * SEO utilities for dynamic meta tag updates
 */

export const updateMetaDescription = (lang: string) => {
  const descriptions = {
    en: "Feasly lets GCC developers build real-estate feasibility models in minutes, no spreadsheets.",
    ar: "فيزلي يمكنك من إعداد دراسات الجدوى العقارية في دقائق بلا جداول."
  };

  const description = descriptions[lang as keyof typeof descriptions] || descriptions.en;
  
  // Update the meta description tag
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  }

  // Update OG description
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', description);
  }

  // Update Twitter description
  const twitterDescription = document.querySelector('meta[name="twitter:description"]');
  if (twitterDescription) {
    twitterDescription.setAttribute('content', description);
  }
};