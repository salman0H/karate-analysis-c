// Jalali (Persian) calendar <-> Gregorian conversion + age calculation.
// Implemented directly (standard Jalaali algorithm) rather than relying on
// date-fns-jalali's parsing, since its Jalali->Gregorian conversion API varies
// across versions — this keeps birthdate math deterministic and dependency-free.

function div(a: number, b: number) {
  return ~~(a / b);
}

function jalCal(jy: number) {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097,
    2192, 2262, 2324, 2394, 2456, 3178,
  ];
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14;
  const jp = breaks[0];
  if (jy < jp || jy >= breaks[bl - 1]) {
    throw new Error("Invalid Jalali year " + jy);
  }
  let jumpPoint = jp;
  for (let i = 1; i < bl; i += 1) {
    const jm = breaks[i];
    const jump = jm - jumpPoint;
    if (jy < jm) break;
    leapJ = leapJ + div(jump, 33) * 8 + div(jump % 33, 4);
    jumpPoint = jm;
  }
  const n = jy - jumpPoint;
  leapJ = leapJ + div(n, 33) * 8 + div((n % 33) + 3, 4);
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  return { march };
}

function g2d(gy: number, gm: number, gd: number) {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * ((gm + 9) % 12) + 2, 5) +
    gd -
    34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

function d2g(jdn: number) {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div((j % 1461), 4) * 5 + 308;
  const gd = div(i % 153, 5) + 1;
  const gm = (div(i, 153) % 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

function j2d(jy: number, jm: number, jd: number) {
  const { march } = jalCal(jy);
  return g2d(jy + 621, 3, march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

/** Converts a Jalali (Persian) date to a Gregorian JS Date (at UTC midnight). */
export function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  const jdn = j2d(jy, jm, jd);
  const { gy, gm, gd } = d2g(jdn);
  return new Date(Date.UTC(gy, gm - 1, gd));
}

/** Parses "YYYY/MM/DD" Jalali string into { jy, jm, jd }. Returns null if malformed. */
export function parseJalaliString(
  value: string,
): { jy: number; jm: number; jd: number } | null {
  const match = /^(\d{3,4})[/-](\d{1,2})[/-](\d{1,2})$/.exec(value.trim());
  if (!match) return null;
  const jy = Number(match[1]);
  const jm = Number(match[2]);
  const jd = Number(match[3]);
  if (jm < 1 || jm > 12 || jd < 1 || jd > 31) return null;
  return { jy, jm, jd };
}

/** Computes exact age in years from a Jalali birthdate string ("YYYY/MM/DD") to now. */
export function calculateAgeFromJalali(value: string): number | null {
  const parsed = parseJalaliString(value);
  if (!parsed) return null;
  const birth = jalaliToGregorian(parsed.jy, parsed.jm, parsed.jd);
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const hasHadBirthdayThisYear =
    now.getUTCMonth() > birth.getUTCMonth() ||
    (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() >= birth.getUTCDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}
