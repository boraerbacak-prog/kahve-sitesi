const imageMap: Record<string, string> = {
  "ethiopia-sidamo-g2": "Gemini_Generated_Image_445e1s445e1s445e",
  "ethiopia-sidamo-g4": "Gemini_Generated_Image_c7t8k5c7t8k5c7t8",
  "ethiopia-lekempt-g4": "Gemini_Generated_Image_dvivc9dvivc9dviv",
  "guatemala-shb-18-sc": "Gemini_Generated_Image_g74yvng74yvng74y",
  "colombia-supremo-18-sc": "Gemini_Generated_Image_u229vnu229vnu229",
  "brasil-mogiana": "Gemini_Generated_Image_v621nbv621nbv621",
  "ethiopia-yirga-koke-honey-g1": "Gemini_Generated_Image_jwubysjwubysjwub",
  "colombia-la-roca-pink-bourbon": "Gemini_Generated_Image_vzulafvzulafvzul",
};

export function getProductImage(slug: string): string {
  const key = imageMap[slug];
  return key ? `/products/${key}.png` : "/products/rostello.png";
}

export function getProductImageUrl(slug: string): string {
  return getProductImage(slug);
}
