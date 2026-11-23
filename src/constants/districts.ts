export interface SriLankanDistrict {
  id: string;
  name: string;
  province: string;
  sinhalaName: string;
  tamilName: string;
}

export const SRI_LANKAN_DISTRICTS: SriLankanDistrict[] = [
  // Western Province
  { id: 'colombo', name: 'Colombo', province: 'Western', sinhalaName: 'කොළඹ', tamilName: 'கொழும்பு' },
  { id: 'gampaha', name: 'Gampaha', province: 'Western', sinhalaName: 'ගම්පහ', tamilName: 'கம்பஹா' },
  { id: 'kalutara', name: 'Kalutara', province: 'Western', sinhalaName: 'කළුතර', tamilName: 'களுத்துறை' },

  // Central Province
  { id: 'kandy', name: 'Kandy', province: 'Central', sinhalaName: 'මහනුවර', tamilName: 'கண்டி' },
  { id: 'matale', name: 'Matale', province: 'Central', sinhalaName: 'මාතලේ', tamilName: 'மாத்தளை' },
  { id: 'nuwara-eliya', name: 'Nuwara Eliya', province: 'Central', sinhalaName: 'නුවරඑළිය', tamilName: 'நுவரெலியா' },

  // Southern Province
  { id: 'galle', name: 'Galle', province: 'Southern', sinhalaName: 'ගාල්ල', tamilName: 'காலி' },
  { id: 'matara', name: 'Matara', province: 'Southern', sinhalaName: 'මාතර', tamilName: 'மாத்தறை' },
  { id: 'hambantota', name: 'Hambantota', province: 'Southern', sinhalaName: 'හම්බන්තොට', tamilName: 'அம்பாந்தோட்டை' },

  // Northern Province
  { id: 'jaffna', name: 'Jaffna', province: 'Northern', sinhalaName: 'යාපනය', tamilName: 'யாழ்ப்பாணம்' },
  { id: 'kilinochchi', name: 'Kilinochchi', province: 'Northern', sinhalaName: 'කිලිනොච්චිය', tamilName: 'கிளிநொச்சி' },
  { id: 'mannar', name: 'Mannar', province: 'Northern', sinhalaName: 'මන්නාරම', tamilName: 'மன்னார்' },
  { id: 'vavuniya', name: 'Vavuniya', province: 'Northern', sinhalaName: 'වවුනියාව', tamilName: 'வவுனியா' },
  { id: 'mullaitivu', name: 'Mullaitivu', province: 'Northern', sinhalaName: 'මුලතිව්', tamilName: 'முல்லைத்தீவு' },

  // Eastern Province
  { id: 'batticaloa', name: 'Batticaloa', province: 'Eastern', sinhalaName: 'මඩකලපුව', tamilName: 'மட்டக்களப்பு' },
  { id: 'ampara', name: 'Ampara', province: 'Eastern', sinhalaName: 'අම්පාර', tamilName: 'அம்பாறை' },
  { id: 'trincomalee', name: 'Trincomalee', province: 'Eastern', sinhalaName: 'ත්රිකුණාමලය', tamilName: 'திருகோணமலை' },

  // North Western Province
  { id: 'kurunegala', name: 'Kurunegala', province: 'North Western', sinhalaName: 'කුරුණෑගල', tamilName: 'குருநாகல்' },
  { id: 'puttalam', name: 'Puttalam', province: 'North Western', sinhalaName: 'පුත්තලම', tamilName: 'புத்தளம்' },

  // North Central Province
  { id: 'anuradhapura', name: 'Anuradhapura', province: 'North Central', sinhalaName: 'අනුරාධපුරය', tamilName: 'அனுராதபுரம்' },
  { id: 'polonnaruwa', name: 'Polonnaruwa', province: 'North Central', sinhalaName: 'පොළොන්නරුව', tamilName: 'பொலன்னறுவை' },

  // Uva Province
  { id: 'badulla', name: 'Badulla', province: 'Uva', sinhalaName: 'බදුල්ල', tamilName: 'பதுளை' },
  { id: 'monaragala', name: 'Monaragala', province: 'Uva', sinhalaName: 'මොනරාගල', tamilName: 'மொணராகலை' },

  // Sabaragamuwa Province
  { id: 'ratnapura', name: 'Ratnapura', province: 'Sabaragamuwa', sinhalaName: 'රත්නපුර', tamilName: 'இரத்தினபுரி' },
  { id: 'kegalle', name: 'Kegalle', province: 'Sabaragamuwa', sinhalaName: 'කෑගල්ල', tamilName: 'கேகாலை' },
];

export const BUYER_BUSINESS_TYPES = [
  'Wholesale Distributor',
  'Supermarket / Retail Chain',
  'Agricultural Exporter',
  'Food Processing Enterprise',
  'Hotel / Restaurant Group',
  'Local Retail Merchant',
  'Agricultural Cooperative / Society',
  'Catering & Institutional Buyer',
];
