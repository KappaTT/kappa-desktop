import moment from 'moment';

export interface TPoints {
  PROF: number;
  PHIL: number;
  BRO: number;
  RUSH: number;
}

export const POINTS_SO: TPoints = {
  PROF: 3,
  PHIL: 3,
  BRO: 5,
  RUSH: 5
};

export const GM_SO = 70;

export const POINTS_JR: TPoints = {
  PROF: 2,
  PHIL: 2,
  BRO: 4,
  RUSH: 4
};

export const GM_JR = 60;

export const POINTS_SR: TPoints = {
  PROF: 1,
  PHIL: 2,
  BRO: 3,
  RUSH: 4
};

export const GM_SR = 50;

/**
 * Calculates a user's class year based on the first year they attended college
 */
export const getClassYear = (firstYear: string) => {
  if (!firstYear) return '';

  const now = moment();

  const firstYearMoment = moment(`${firstYear}-08-01`);

  const difference = now.diff(firstYearMoment, 'years', true);

  if (difference >= 3) {
    return 'SR';
  } else if (difference >= 2) {
    return 'JR';
  } else if (difference >= 1) {
    return 'SO';
  } else {
    return 'FR';
  }
};
