// Ethiopian Regions & Cities for local operation
// Used across signup, profile, and supplier forms.

export interface Location {
  code: string;
  name: string;
  flag: string;
}

export const ETHIOPIAN_REGIONS: Location[] = [
  { code: "AA", name: "Addis Ababa", flag: "📍" },
  { code: "OR", name: "Oromia", flag: "📍" },
  { code: "AM", name: "Amhara", flag: "📍" },
  { code: "TI", name: "Tigray", flag: "📍" },
  { code: "SN", name: "SNNPR", flag: "📍" },
  { code: "SI", name: "Sidama", flag: "📍" },
  { code: "SO", name: "Somali", flag: "📍" },
  { code: "AF", name: "Afar", flag: "📍" },
  { code: "DD", name: "Dire Dawa", flag: "📍" },
  { code: "BG", name: "Benishangul-Gumuz", flag: "📍" },
  { code: "GA", name: "Gambela", flag: "📍" },
  { code: "HA", name: "Harari", flag: "📍" },
  { code: "SW", name: "South West Ethiopia", flag: "📍" },
];

// Alias for backwards compatibility if needed, but we'll migrate
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
