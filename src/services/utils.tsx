export const HEADER_HEIGHT = 56;

export const castTo = (value: string, type: string) => {
  if (typeof value === type) {
    return value;
  }

  switch (type) {
    case 'boolean':
      return value === 'true';
    case 'string':
      return value.toString();
    case 'number':
      return Number(value);
    default:
      return JSON.parse(value);
  }
};

export const castToString = (value: any) => {
  if (typeof value === 'string') {
    return value;
  }

  switch (typeof value) {
    case 'boolean':
    case 'number':
      return value.toString();
    default:
      return JSON.stringify(value);
  }
};

export const isEmpty = (obj: any) => {
  if (obj === undefined || obj === null) return true;
  if (obj.constructor !== Object) return false;

  for (const key in obj) {
    return false;
  }

  return true;
};
