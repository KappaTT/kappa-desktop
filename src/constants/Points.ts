import moment from 'moment';

export interface TPoints {
  PROF: number;
  PHIL: number;
  BRO: number;
  RUSH: number;
  DIV: number;
}

export const POINTS_SO: TPoints = {
  PROF: 3,
  PHIL: 3,
  BRO: 5,
  RUSH: 6,
  DIV: 2
};

export const GM_SO = 70;

export const POINTS_JR: TPoints = {
  PROF: 2,
  PHIL: 2,
  BRO: 4,
  RUSH: 5,
  DIV: 2
};

export const GM_JR = 60;

export const POINTS_SR: TPoints = {
  PROF: 1,
  PHIL: 1,
  BRO: 3,
  RUSH: 4,
  DIV: 2
};

export const GM_SR = 50;

// potential new members track points with their own requirements and have no RUSH or GM obligations
export const POINTS_PNM: TPoints = {
  PROF: 6,
  PHIL: 2,
  BRO: 7,
  RUSH: 0,
  DIV: 2
};

/**
 * Calculates a user's class year based on their expected graduation term, e.g. "Spring 2027" or "Fall 2027".
 * Spring graduations are treated as mid-May and fall graduations as mid-December.
 */
export const getClassYear = (gradYear: string) => {
  if (!gradYear) return '';

  const match = gradYear.trim().match(/^(Spring|Fall)?\s*(\d{4})$/i);

  if (!match) return '';

  const term = (match[1] || 'Spring').toLowerCase();
  const year = match[2];

  const gradMoment = term === 'fall' ? moment(`${year}-12-15`) : moment(`${year}-05-15`);

  const yearsUntilGraduation = gradMoment.diff(moment(), 'years', true);

  if (yearsUntilGraduation < 1) {
    return 'SR';
  } else if (yearsUntilGraduation < 2) {
    return 'JR';
  } else if (yearsUntilGraduation < 3) {
    return 'SO';
  } else {
    return 'FR';
  }
};
