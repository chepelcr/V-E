export type Language = "en" | "es";

export interface Translations {
  nav: {
    home: string;
    catalog: string;
    casas: string;
    lots: string;
    financing: string;
    providers: string;
    contact: string;
  };
  home: {
    scrollDown: string;
    mission: string;
    vision: string;
    about: string;
    learnMore: string;
  };
  catalog: {
    title: string;
    subtitle: string;
    beds: string;
    baths: string;
    viewDetails: string;
    gallery: string;
    all: string;
    interior: string;
    exterior: string;
    noImages: string;
    rooms: {
      bedroom: string;
      bathroom: string;
      living_room: string;
      kitchen: string;
      garden: string;
      patio: string;
      gate: string;
      facade: string;
    };
  };
  lots: {
    title: string;
    subtitle: string;
    filterProvince: string;
    filterCanton: string;
    filterDistrict: string;
    filterSize: string;
    allProvinces: string;
    allCantons: string;
    allDistricts: string;
    available: string;
    unavailable: string;
    size: string;
    location: string;
    noResults: string;
    clearFilters: string;
    compatibleModels: string;
  };
  providers: {
    title: string;
    subtitle: string;
    materials: string;
    website: string;
    contact: string;
  };
  contact: {
    title: string;
    subtitle: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    send: string;
    sending: string;
    successTitle: string;
    successMessage: string;
    subjects: {
      general: string;
      lot: string;
      model: string;
    };
    selectLot: string;
    selectModel: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    messagePlaceholder: string;
  };
  admin: {
    title: string;
    subtitle: string;
    pinLabel: string;
    pinPlaceholder: string;
    unlock: string;
    wrongPin: string;
    tabs: {
      config: string;
      corporate: string;
      models: string;
      lots: string;
      providers: string;
    };
    exportJson: string;
    save: string;
    add: string;
    edit: string;
    delete: string;
    companyName: string;
    tagline: string;
    measurementUnit: string;
    mission: string;
    vision: string;
    about: string;
  };
  footer: {
    rights: string;
    tagline: string;
  };
  common: {
    loading: string;
    error: string;
    close: string;
    cancel: string;
    confirm: string;
  };
}

const en: Translations = {
  nav: {
    home: "Home",
    catalog: "Catalog",
    casas: "Houses",
    lots: "Lots",
    financing: "Financing",
    providers: "Providers",
    contact: "Contact",
  },
  home: {
    scrollDown: "Scroll to discover",
    mission: "Mission",
    vision: "Vision",
    about: "About Us",
    learnMore: "Learn More",
  },
  catalog: {
    title: "House Models",
    subtitle:
      "Explore our portfolio of premium residences, designed with meticulous attention to detail and uncompromising quality.",
    beds: "Beds",
    baths: "Baths",
    viewDetails: "View Details",
    gallery: "Gallery",
    all: "All",
    interior: "Interior",
    exterior: "Exterior",
    noImages: "No images available for this filter.",
    rooms: {
      bedroom: "Bedroom",
      bathroom: "Bathroom",
      living_room: "Living Room",
      kitchen: "Kitchen",
      garden: "Garden",
      patio: "Patio",
      gate: "Gate",
      facade: "Facade",
    },
  },
  lots: {
    title: "Lot Inventory",
    subtitle:
      "Browse our curated selection of premium lots, each chosen for its location, potential, and natural surroundings.",
    filterProvince: "Province",
    filterCanton: "Canton",
    filterDistrict: "District",
    filterSize: "Max size",
    allProvinces: "All Provinces",
    allCantons: "All Cantons",
    allDistricts: "All Districts",
    available: "Available",
    unavailable: "Sold",
    size: "Size",
    location: "Location",
    noResults: "No lots match your current filters.",
    clearFilters: "Clear Filters",
    compatibleModels: "Compatible Models",
  },
  providers: {
    title: "Providers Directory",
    subtitle:
      "We partner only with the finest suppliers, ensuring every material meets our standard of excellence.",
    materials: "Materials",
    website: "Website",
    contact: "Contact",
  },
  contact: {
    title: "Inquiries",
    subtitle:
      "Reach out to our team for detailed information about our models, lots, and bespoke construction services.",
    name: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    subject: "Subject",
    message: "Message",
    send: "Send Inquiry",
    sending: "Sending...",
    successTitle: "Message Received",
    successMessage:
      "Thank you for reaching out. Our team will contact you shortly.",
    subjects: {
      general: "General Inquiry",
      lot: "Specific Lot",
      model: "House Model",
    },
    selectLot: "Select a lot",
    selectModel: "Select a model",
    namePlaceholder: "John Smith",
    emailPlaceholder: "john@example.com",
    phonePlaceholder: "+1 (555) 000-0000",
    messagePlaceholder: "Tell us about your project...",
  },
  admin: {
    title: "Admin Dashboard",
    subtitle: "Local content management panel",
    pinLabel: "Access PIN",
    pinPlaceholder: "Enter PIN",
    unlock: "Unlock",
    wrongPin: "Incorrect PIN. Please try again.",
    tabs: {
      config: "Configuration",
      corporate: "Corporate",
      models: "Models",
      lots: "Lots",
      providers: "Providers",
    },
    exportJson: "Export JSON",
    save: "Save Changes",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    companyName: "Company Name",
    tagline: "Tagline",
    measurementUnit: "Measurement Unit",
    mission: "Mission",
    vision: "Vision",
    about: "About Us",
  },
  footer: {
    rights: "All rights reserved.",
    tagline: "Building legacies, one home at a time.",
  },
  common: {
    loading: "Loading...",
    error: "An error occurred.",
    close: "Close",
    cancel: "Cancel",
    confirm: "Confirm",
  },
};

const es: Translations = {
  nav: {
    home: "Inicio",
    catalog: "Catálogo",
    casas: "Casas",
    lots: "Lotes",
    financing: "Financiamiento",
    providers: "Proveedores",
    contact: "Contacto",
  },
  home: {
    scrollDown: "Desplázate para descubrir",
    mission: "Misión",
    vision: "Visión",
    about: "Quiénes Somos",
    learnMore: "Conocer Más",
  },
  catalog: {
    title: "Modelos de Casas",
    subtitle:
      "Explore nuestro portafolio de residencias premium, diseñadas con meticulosa atención al detalle y calidad sin concesiones.",
    beds: "Hab.",
    baths: "Baños",
    viewDetails: "Ver Detalles",
    gallery: "Galería",
    all: "Todos",
    interior: "Interior",
    exterior: "Exterior",
    noImages: "No hay imágenes disponibles para este filtro.",
    rooms: {
      bedroom: "Cuarto",
      bathroom: "Baño",
      living_room: "Sala",
      kitchen: "Cocina",
      garden: "Jardín",
      patio: "Patio",
      gate: "Portón",
      facade: "Fachada",
    },
  },
  lots: {
    title: "Inventario de Lotes",
    subtitle:
      "Explore nuestra selección de lotes premium, elegidos por su ubicación, potencial y entorno natural.",
    filterProvince: "Provincia",
    filterCanton: "Cantón",
    filterDistrict: "Distrito",
    filterSize: "Tamaño máximo",
    allProvinces: "Todas las Provincias",
    allCantons: "Todos los Cantones",
    allDistricts: "Todos los Distritos",
    available: "Disponible",
    unavailable: "Vendido",
    size: "Tamaño",
    location: "Ubicación",
    noResults: "Ningún lote coincide con los filtros actuales.",
    clearFilters: "Limpiar Filtros",
    compatibleModels: "Modelos Compatibles",
  },
  providers: {
    title: "Directorio de Proveedores",
    subtitle:
      "Trabajamos únicamente con los mejores proveedores, asegurando que cada material cumpla nuestro estándar de excelencia.",
    materials: "Materiales",
    website: "Sitio Web",
    contact: "Contacto",
  },
  contact: {
    title: "Consultas",
    subtitle:
      "Comuníquese con nuestro equipo para obtener información detallada sobre modelos, lotes y servicios de construcción a medida.",
    name: "Nombre Completo",
    email: "Correo Electrónico",
    phone: "Teléfono",
    subject: "Asunto",
    message: "Mensaje",
    send: "Enviar Consulta",
    sending: "Enviando...",
    successTitle: "Mensaje Recibido",
    successMessage:
      "Gracias por comunicarse. Nuestro equipo le contactará en breve.",
    subjects: {
      general: "Consulta General",
      lot: "Lote Específico",
      model: "Modelo de Casa",
    },
    selectLot: "Seleccionar lote",
    selectModel: "Seleccionar modelo",
    namePlaceholder: "Juan Pérez",
    emailPlaceholder: "juan@ejemplo.com",
    phonePlaceholder: "+506 8888-0000",
    messagePlaceholder: "Cuéntenos sobre su proyecto...",
  },
  admin: {
    title: "Panel Administrativo",
    subtitle: "Panel de gestión de contenido local",
    pinLabel: "PIN de Acceso",
    pinPlaceholder: "Ingresar PIN",
    unlock: "Desbloquear",
    wrongPin: "PIN incorrecto. Por favor intente nuevamente.",
    tabs: {
      config: "Configuración",
      corporate: "Corporativo",
      models: "Modelos",
      lots: "Lotes",
      providers: "Proveedores",
    },
    exportJson: "Exportar JSON",
    save: "Guardar Cambios",
    add: "Agregar",
    edit: "Editar",
    delete: "Eliminar",
    companyName: "Nombre de Empresa",
    tagline: "Eslogan",
    measurementUnit: "Unidad de Medida",
    mission: "Misión",
    vision: "Visión",
    about: "Quiénes Somos",
  },
  footer: {
    rights: "Todos los derechos reservados.",
    tagline: "Construyendo legados, un hogar a la vez.",
  },
  common: {
    loading: "Cargando...",
    error: "Ocurrió un error.",
    close: "Cerrar",
    cancel: "Cancelar",
    confirm: "Confirmar",
  },
};

export const translations: Record<Language, Translations> = { en, es };
