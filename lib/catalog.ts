export const sizes = ["S", "L", "XL", "XXL"] as const;
export type Size = (typeof sizes)[number];
// Internal pricing configuration in USD cents. Tier names are never rendered.
export const priceTiers = {
  basic: 1495,
  standard: 2995,
  premium: 4495,
  luxury: 5995,
} as const;
type PricingTier = keyof typeof priceTiers;
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "t-shirts" | "jackets";
  color: string;
  hex: string;
  price: number;
  sku: string;
  description: string;
  material: string;
  care: string;
  fit: string;
  inventory: Record<Size, number>;
  images: string[];
  featured: boolean;
  measurements: Record<Size, [number, number]>;
};
const entries: [
  string,
  string,
  string,
  PricingTier,
  string,
  string,
  string,
  string,
][] = [
  [
    "Horizon Essential Tee",
    "Off-White",
    "#e4e0d5",
    "basic",
    "A quiet foundation. A balanced silhouette with a clean crew neckline and a soft, substantial hand.",
    "100% cotton, 220 gsm jersey",
    "Regular fit",
    "Machine wash cold with similar colors. Reshape and line dry.",
  ],
  [
    "Midnight Heavyweight Tee",
    "Black",
    "#242424",
    "standard",
    "Substance in its simplest form. Dense jersey, a generous neckline and a strong, wide silhouette.",
    "100% cotton, 300 gsm jersey",
    "Relaxed fit",
    "Machine wash cold inside out. Line dry.",
  ],
  [
    "Sandstone Oversized Tee",
    "Sand",
    "#bcb098",
    "standard",
    "An easy volume study. Dropped shoulders and a longer body create room to move.",
    "100% cotton, 240 gsm jersey",
    "Oversized fit",
    "Machine wash cold. Reshape while damp.",
  ],
  [
    "Slate Boxy Tee",
    "Charcoal",
    "#565654",
    "standard",
    "Cut with intention. A shorter, squared body and broad collar lend everyday dressing an architectural edge.",
    "100% cotton, 260 gsm jersey",
    "Boxy fit",
    "Machine wash cold. Do not tumble dry.",
  ],
  [
    "Alpine Ribbed Tee",
    "Sage",
    "#a4ac96",
    "standard",
    "Fine vertical texture meets a close, considered fit. A subtle layer with an understated character.",
    "95% cotton, 5% elastane, fine rib knit",
    "Close fit",
    "Gentle cold wash. Dry flat.",
  ],
  [
    "Studio Relaxed Tee",
    "Cream",
    "#ded5bf",
    "basic",
    "A softer rhythm. Rounded shoulder lines and a relaxed silhouette make this a natural everyday choice.",
    "100% cotton, 210 gsm jersey",
    "Relaxed fit",
    "Machine wash cold. Line dry.",
  ],
  [
    "Eclipse Washed Tee",
    "Washed Black",
    "#62615d",
    "premium",
    "Depth through texture. A mineral-wash effect gives the dark jersey its softened, tonal surface.",
    "100% cotton, 250 gsm washed jersey",
    "Boxy fit",
    "Wash cold separately inside out. Line dry.",
  ],
  [
    "Coastal Premium Tee",
    "Muted Blue",
    "#8e9eab",
    "premium",
    "A muted note of color. Smooth cotton jersey in a balanced shape, finished with a precise crew neckline.",
    "100% cotton, 230 gsm jersey",
    "Regular fit",
    "Machine wash cold with similar colors. Line dry.",
  ],
  [
    "Terra Structured Tee",
    "Clay",
    "#b27e63",
    "premium",
    "Earth-toned and defined. A substantial body and squared shoulder bring shape to a familiar essential.",
    "100% cotton, 280 gsm jersey",
    "Structured fit",
    "Machine wash cold. Reshape and line dry.",
  ],
  [
    "Origin Minimal Tee",
    "Stone Gray",
    "#b6b5ae",
    "basic",
    "Reduced to the essential. A neat silhouette and smooth surface make space for your own expression.",
    "100% cotton, 200 gsm jersey",
    "Slim fit",
    "Machine wash cold. Line dry.",
  ],
  [
    "Horizon Bomber Jacket",
    "Matte Black",
    "#252525",
    "premium",
    "A modern layer with a decisive shape. Matte fabric meets a ribbed collar, clean zip front and understated welt pockets.",
    "Shell: 100% nylon. Lining: 100% polyester.",
    "Relaxed fit",
    "Gentle cold wash. Close zipper before washing. Line dry.",
  ],
  [
    "Atlas Utility Jacket",
    "Olive",
    "#77765c",
    "luxury",
    "Form follows function. Four flap pockets and a standing collar give this cotton layer a purposeful, balanced silhouette.",
    "Shell: 100% cotton twill. Lining: 100% polyester.",
    "Regular fit",
    "Gentle cold wash. Line dry. Cool iron on shell.",
  ],
  [
    "Northline Puffer Jacket",
    "Graphite",
    "#55595a",
    "luxury",
    "Volume, refined. Horizontal quilting and a high collar create a substantial layer with a clean, hood-free profile.",
    "Shell and lining: 100% polyester. Fill: 100% polyester.",
    "Relaxed fit",
    "Gentle cold wash. Dry flat. Do not iron.",
  ],
  [
    "Drift Denim Jacket",
    "Indigo",
    "#495a74",
    "premium",
    "A familiar shape, newly considered. Indigo denim, a pointed collar and a precise button front anchor this versatile layer.",
    "100% cotton denim, 12 oz",
    "Regular fit",
    "Wash cold separately inside out. Line dry.",
  ],
  [
    "Studio Suede-Effect Jacket",
    "Taupe",
    "#afa08a",
    "luxury",
    "A tactile approach to layering. A soft suede-effect surface and restrained collar give this zip jacket a quiet presence.",
    "Shell: 100% polyester suede-effect fabric. Lining: 100% polyester.",
    "Relaxed fit",
    "Professional cleaning recommended. Avoid direct heat.",
  ],
  [
    "Forma Technical Shell",
    "Slate",
    "#68737c",
    "luxury",
    "A study in lines. Angular seams, a high collar and a light technical fabric create a sharp outer silhouette.",
    "Shell: 100% nylon. Lining: 100% polyester.",
    "Regular fit",
    "Gentle cold wash. Line dry. Do not iron.",
  ],
  [
    "Heritage Harrington Jacket",
    "Navy",
    "#303b4e",
    "premium",
    "Enduring proportions. A two-button collar, ribbed hem and angled flap pockets give a classic shape a contemporary finish.",
    "Shell: 100% cotton. Lining: 100% polyester.",
    "Regular fit",
    "Gentle cold wash. Line dry. Cool iron on shell.",
  ],
  [
    "Terrain Quilted Jacket",
    "Forest Green",
    "#4d6152",
    "premium",
    "Texture with a sense of order. Diamond quilting, a shirt collar and two patch pockets define an effortless everyday layer.",
    "Shell and lining: 100% polyester. Fill: 100% polyester.",
    "Regular fit",
    "Gentle cold wash. Dry flat. Do not iron.",
  ],
  [
    "Eclipse Cropped Jacket",
    "Black",
    "#292929",
    "luxury",
    "A compact silhouette with presence. Structured twill, a cropped body and two chest pockets frame a precise zip front.",
    "Shell: 100% cotton twill. Lining: 100% polyester.",
    "Cropped fit",
    "Gentle cold wash. Line dry. Cool iron on shell.",
  ],
  [
    "Summit Lightweight Jacket",
    "Stone",
    "#c3c1b6",
    "standard",
    "An uncomplicated outer layer. Light nylon, a stand collar and elastic cuffs create an easy shape for everyday movement.",
    "Shell: 100% nylon. Lining: 100% polyester.",
    "Regular fit",
    "Gentle cold wash. Line dry. Do not iron.",
  ],
];
// Flat garment measurements are editable concepts, aligned with each silhouette.
const chestBase = [52,56,58,56,46,54,56,52,54,48,58,56,64,55,58,57,56,56,57,56];
const lengthBase = [68,69,70,62,65,67,64,68,66,66,66,72,72,64,68,70,64,70,59,67];
export const products: Product[] = entries.map(
  ([name, color, hex, pricingTier, description, material, fit, care], i) => {
    const slug = name.toLowerCase().replaceAll(" ", "-");
    return {
      id: String(i + 1),
      slug,
      name,
      color,
      hex,
      price: priceTiers[pricingTier],
      description,
      material,
      fit,
      care,
      category: i < 10 ? "t-shirts" : "jackets",
      sku: `HOR-${i < 10 ? "TS" : "JK"}-${String(i + 1).padStart(3, "0")}`,
      inventory: { S: 25, L: 25, XL: 25, XXL: 25 },
      images: ["front", "back", "detail"].map(
        (v) => `/images/${slug}-${v}.webp`,
      ),
      featured: [0, 1, 2, 7, 10, 11, 14, 17].includes(i),
      measurements: {
        S: [chestBase[i], lengthBase[i]],
        L: [chestBase[i]+6, lengthBase[i]+4],
        XL: [chestBase[i]+9, lengthBase[i]+6],
        XXL: [chestBase[i]+12, lengthBase[i]+8],
      },
    };
  },
);
export const getProduct = (slug: string) =>
  products.find((p) => p.slug === slug);
