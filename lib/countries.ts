// Ethiopian Regions & Major Cities for local operation
// Used across signup, profile, and supplier forms.

export interface Location {
  code: string;
  name: string;
  flag: string;
}

export const ETHIOPIAN_REGIONS: Location[] = [
  // Chartered Cities
  { code: "AA", name: "Addis Ababa", flag: "🇪🇹" },
  { code: "DD", name: "Dire Dawa", flag: "🇪🇹" },

  // Oromia Region
  { code: "AD", name: "Adama (Nazret)", flag: "🇪🇹" },
  { code: "JI", name: "Jimma", flag: "🇪🇹" },
  { code: "SH", name: "Shashamane", flag: "🇪🇹" },
  { code: "AM", name: "Ambo", flag: "🇪🇹" },
  { code: "AW", name: "Awash", flag: "🇪🇹" },
  { code: "AG", name: "Agaro", flag: "🇪🇹" },
  { code: "OR-REG", name: "Oromia Region", flag: "🇪🇹" },

  // Amhara Region
  { code: "GD", name: "Gondar", flag: "🇪🇹" },
  { code: "BD", name: "Bahir Dar", flag: "🇪🇹" },
  { code: "DE", name: "Dessie", flag: "🇪🇹" },
  { code: "AN", name: "Ankober", flag: "🇪🇹" },
  { code: "AM-REG", name: "Amhara Region", flag: "🇪🇹" },

  // Tigray Region
  { code: "MK", name: "Mekelle", flag: "🇪🇹" },
  { code: "ADG", name: "Adigrat", flag: "🇪🇹" },
  { code: "ADW", name: "Adwa", flag: "🇪🇹" },
  { code: "AX", name: "Axum", flag: "🇪🇹" },
  { code: "TI-REG", name: "Tigray Region", flag: "🇪🇹" },

  // Sidama Region
  { code: "HW", name: "Hawassa (Awasa)", flag: "🇪🇹" },
  { code: "SI-REG", name: "Sidama Region", flag: "🇪🇹" },

  // Somali Region
  { code: "JJ", name: "Jijiga", flag: "🇪🇹" },
  { code: "SO-REG", name: "Somali Region", flag: "🇪🇹" },

  // SNNPR / South Ethiopia
  { code: "AB", name: "Arba Minch", flag: "🇪🇹" },
  { code: "ALW", name: "Aleta Wendo", flag: "🇪🇹" },
  { code: "ARK", name: "Areka", flag: "🇪🇹" },
  { code: "SN-REG", name: "SNNPR Region", flag: "🇪🇹" },

  // Harari Region
  { code: "HR", name: "Harar", flag: "🇪🇹" },
  { code: "HR-REG", name: "Harari Region", flag: "🇪🇹" },

  // Benishangul-Gumuz
  { code: "AS", name: "Asosa", flag: "🇪🇹" },
  { code: "BG-REG", name: "Benishangul-Gumuz", flag: "🇪🇹" },

  // Gambela Region
  { code: "GA", name: "Gambela", flag: "🇪🇹" },
  { code: "GA-REG", name: "Gambela Region", flag: "🇪🇹" },

  // Other Regions
  { code: "AF", name: "Afar Region", flag: "🇪🇹" },
  { code: "SW", name: "South West Ethiopia", flag: "🇪🇹" },
  { code: "CE", name: "Central Ethiopia (Hosaina)", flag: "🇪🇹" },
];

// Alias for backwards compatibility
export const COUNTRIES = ETHIOPIAN_REGIONS;

export function getCountryByCode(code: string): Location | undefined {
  return ETHIOPIAN_REGIONS.find(c => c.code === code);
}

export function getCountryByName(name: string): Location | undefined {
  return ETHIOPIAN_REGIONS.find(c => c.name.toLowerCase() === name.toLowerCase());
}

export async function detectCountryByIP(): Promise<string | null> {
  // Always default to Addis Ababa for local operation if detection fails
  return "AA";
}
