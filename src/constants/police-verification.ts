/**
 * Official police tenant-registration services, by province/territory. Pakistani provincial
 * laws (e.g. the Punjab Information of Temporary Residents Act 2015, the KP and Balochistan
 * Restriction of Rented Buildings (Security) Acts) require tenancies to be registered with
 * the local police. URLs verified 2026-10-02 — re-check periodically, government sites move.
 */
export type PoliceRegion = {
  key: 'punjab' | 'islamabad' | 'sindh' | 'kp' | 'balochistan';
  name: string;
  service: string;
  url: string;
  /** City names (lowercase) used to match a listing address to its region. */
  cities: readonly string[];
};

export const POLICE_REGIONS: readonly PoliceRegion[] = [
  {
    key: 'punjab',
    name: 'Punjab',
    service: 'Punjab Police Tenant Registration System',
    url: 'https://punjabpolice.gov.pk/trs',
    cities: [
      'lahore', 'rawalpindi', 'faisalabad', 'multan', 'gujranwala', 'sialkot', 'bahawalpur',
      'sargodha', 'sheikhupura', 'gujrat', 'sahiwal', 'jhelum', 'kasur', 'okara', 'murree',
    ],
  },
  {
    key: 'islamabad',
    name: 'Islamabad (ICT)',
    service: 'Islamabad Police Tenant Registration',
    url: 'https://islamabadpolice.gov.pk/srv-tr.php',
    cities: ['islamabad'],
  },
  {
    key: 'sindh',
    name: 'Sindh',
    service: 'Sindh Police TRUST — Tenant Registration',
    url: 'https://tenantregister.sindhpolice.gov.pk/',
    cities: ['karachi', 'hyderabad', 'sukkur', 'larkana', 'nawabshah', 'mirpur khas', 'thatta'],
  },
  {
    key: 'kp',
    name: 'Khyber Pakhtunkhwa',
    service: 'KP Police (Police Sahulat Markaz)',
    url: 'https://www.kppolice.gov.pk/',
    cities: ['peshawar', 'abbottabad', 'mardan', 'swat', 'mingora', 'kohat', 'nowshera', 'dera ismail khan'],
  },
  {
    key: 'balochistan',
    name: 'Balochistan',
    service: 'Balochistan Police Tenant Registration',
    url: 'https://balochistanpolice.gov.pk/BPTR',
    cities: ['quetta', 'gwadar', 'turbat', 'khuzdar', 'sibi', 'zhob'],
  },
];

/** Best guess at the region from a free-text address; null when no known city matches. */
export function policeRegionForAddress(address: string): PoliceRegion | null {
  const normalized = address.toLowerCase();
  // Check Islamabad first: Islamabad addresses can also mention nearby Rawalpindi areas.
  const ordered = [
    ...POLICE_REGIONS.filter((region) => region.key === 'islamabad'),
    ...POLICE_REGIONS.filter((region) => region.key !== 'islamabad'),
  ];
  return ordered.find((region) => region.cities.some((city) => normalized.includes(city))) ?? null;
}
