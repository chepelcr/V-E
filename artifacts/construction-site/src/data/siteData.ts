export interface SiteConfig {
  companyName: string;
  tagline: string;
  measurementUnit: "m²" | "hectares" | "varas" | "acres";
  logo?: string;
}

export interface CorporateSection {
  mission: string;
  vision: string;
  about: string;
}

export interface NavItem {
  label: string;
  path: string;
}

export interface GalleryImage {
  url: string;
  category: "interior" | "exterior";
  room: "bedroom" | "bathroom" | "living_room" | "kitchen" | "garden" | "patio" | "gate" | "facade";
  caption?: string;
}

export interface HouseModel {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  gallery: GalleryImage[];
}

export interface GeographicLocation {
  province: string;
  canton: string;
  district: string;
}

export interface Lot {
  id: string;
  name: string;
  location: GeographicLocation;
  size: number;
  price: number;
  currency: string;
  description: string;
  available: boolean;
  modelCompatible?: string[];
}

export interface Provider {
  id: string;
  name: string;
  description: string;
  materials: string[];
  website?: string;
  contact?: string;
}

export interface CompanyContact {
  phones: string[];
  email: string;
  social: {
    facebook: string;
    instagram: string;
  };
}

export interface SiteData {
  config: SiteConfig;
  corporate: CorporateSection;
  contact: CompanyContact;
  navigation: NavItem[];
  houseModels: HouseModel[];
  lots: Lot[];
  providers: Provider[];
}

export const initialSiteData: SiteData = {
  config: {
    companyName: "V&E Asesores",
    tagline: "Asesores en Construcción",
    measurementUnit: "m²"
  },
  corporate: {
    mission: "Brindar asesoramiento financiero y constructivo de excelencia para acompañar a cada familia en el proceso de adquisición o construcción de su hogar, de manera segura, clara y eficiente.",
    vision: "Ser el aliado estratégico más confiable de Costa Rica en construcción y financiamiento habitacional, haciendo posible el sueño de la casa propia para más familias.",
    about: "Somos una empresa especializada en brindar asesoramiento financiero y constructivo para acompañarte en el proceso de adquisición de tu casa de bono de manera segura, clara y eficiente."
  },
  contact: {
    phones: ["8537-2016", "8669-2683"],
    email: "empresa@constructoravye.com",
    social: {
      facebook: "V&E Asesores en Construccion",
      instagram: "V&E Asesores en Construccion"
    }
  },
  navigation: [
    { label: "Inicio", path: "/" },
    { label: "Catálogo", path: "/catalog" },
    { label: "Lotes", path: "/lots" },
    { label: "Financiamiento", path: "/financiamiento" },
    { label: "Proveedores", path: "/providers" },
    { label: "Contacto", path: "/contact" }
  ],
  houseModels: [
    {
      id: "hm-1",
      name: "Villa Dorada",
      description: "A breathtaking contemporary villa featuring expansive glass walls, seamlessly blending indoor and outdoor living spaces. Designed for those who appreciate modern minimalism with warm, natural textures.",
      price: 350000,
      currency: "USD",
      area: 280,
      bedrooms: 4,
      bathrooms: 4.5,
      gallery: [
        { url: "https://picsum.photos/800/600?random=1", category: "exterior", room: "facade", caption: "Front Elevation" },
        { url: "https://picsum.photos/800/600?random=2", category: "interior", room: "living_room", caption: "Double Height Living Area" },
        { url: "https://picsum.photos/800/600?random=3", category: "interior", room: "kitchen", caption: "Chef's Kitchen" },
        { url: "https://picsum.photos/800/600?random=4", category: "exterior", room: "garden", caption: "Infinity Pool and Deck" }
      ]
    },
    {
      id: "hm-2",
      name: "Casa Serena",
      description: "An elegant single-story residence inspired by traditional Mediterranean architecture. Features courtyards, natural stone finishes, and a thoughtful layout perfect for entertaining.",
      price: 220000,
      currency: "USD",
      area: 195,
      bedrooms: 3,
      bathrooms: 2.5,
      gallery: [
        { url: "https://picsum.photos/800/600?random=5", category: "exterior", room: "facade", caption: "Main Entrance" },
        { url: "https://picsum.photos/800/600?random=6", category: "interior", room: "living_room", caption: "Main Living Space" },
        { url: "https://picsum.photos/800/600?random=7", category: "interior", room: "bedroom", caption: "Master Suite" }
      ]
    },
    {
      id: "hm-3",
      name: "Residencia Altamira",
      description: "A compact yet luxurious design maximizing natural light and ventilation. Ideal for hillside lots, offering panoramic views from every room.",
      price: 150000,
      currency: "USD",
      area: 140,
      bedrooms: 2,
      bathrooms: 2,
      gallery: [
        { url: "https://picsum.photos/800/600?random=8", category: "exterior", room: "facade", caption: "Modern Profile" },
        { url: "https://picsum.photos/800/600?random=9", category: "exterior", room: "patio", caption: "View Deck" },
        { url: "https://picsum.photos/800/600?random=10", category: "interior", room: "kitchen", caption: "Open Plan Kitchen" }
      ]
    }
  ],
  lots: [
    {
      id: "l-1",
      name: "Altos del Valle",
      location: { province: "San José", canton: "Escazú", district: "San Antonio" },
      size: 850,
      price: 120000,
      currency: "USD",
      description: "Premium corner lot with unobstructed valley views. Ready to build.",
      available: true,
      modelCompatible: ["hm-1", "hm-2"]
    },
    {
      id: "l-2",
      name: "Bosque Sereno",
      location: { province: "Heredia", canton: "San Rafael", district: "Concepción" },
      size: 1200,
      price: 95000,
      currency: "USD",
      description: "Quiet, forested lot in a secure gated community. Gentle slope.",
      available: true,
      modelCompatible: ["hm-1", "hm-2", "hm-3"]
    },
    {
      id: "l-3",
      name: "Vista Real",
      location: { province: "Alajuela", canton: "Alajuela", district: "La Garita" },
      size: 500,
      price: 65000,
      currency: "USD",
      description: "Flat, easily accessible lot near main highways. Perfect for a compact modern home.",
      available: true,
      modelCompatible: ["hm-3"]
    },
    {
      id: "l-4",
      name: "Cerro Verde",
      location: { province: "San José", canton: "Santa Ana", district: "Salitral" },
      size: 2000,
      price: 250000,
      currency: "USD",
      description: "Expansive estate lot offering maximum privacy and luxury potential.",
      available: false,
      modelCompatible: ["hm-1"]
    }
  ],
  providers: [
    {
      id: "p-1",
      name: "Lumina Glass",
      description: "Premium architectural glass and aluminum systems.",
      materials: ["Glass", "Aluminum", "Windows"],
      contact: "contact@luminaglass.cr"
    },
    {
      id: "p-2",
      name: "Maderas Nobles",
      description: "Ethically sourced, high-end tropical hardwoods.",
      materials: ["Lumber", "Doors", "Flooring"],
      contact: "ventas@maderasnobles.cr"
    },
    {
      id: "p-3",
      name: "Cimientos S.A.",
      description: "High-grade cement and structural steel.",
      materials: ["Cement", "Steel", "Block"]
    },
    {
      id: "p-4",
      name: "AquaTech",
      description: "Luxury plumbing fixtures and water management systems.",
      materials: ["Plumbing", "Fixtures"]
    }
  ]
};
