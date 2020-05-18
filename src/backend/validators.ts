export const TYPE_EMAIL = 'email';
export const TYPE_NUMBER = 'number';
export type TYPE = typeof TYPE_EMAIL | typeof TYPE_NUMBER;

export type TRequirement = {
  minLength?: number;
  maxLength?: number;
  type?: TYPE;
  regex?: RegExp;
  clean?: boolean;
};

export const USERNAME: TRequirement = {
  minLength: 4,
  maxLength: 16,
  regex: /^\w*$/,
  clean: true
};

export const EMAIL: TRequirement = {
  minLength: 5,
  maxLength: 64,
  regex: /^\w+@\w+\.\w+/
};

export const PASSWORD: TRequirement = {
  minLength: 6,
  maxLength: 32
};

export const PASSWORD_CODE: TRequirement = {
  minLength: 6,
  maxLength: 6
};

export const validate = (value: string, requirements: TRequirement, regex_fail?: string): string => {
  if (!(requirements.regex === undefined || requirements.regex.test(value)))
    return regex_fail || 'contains invalid characters';
  if (!(requirements.minLength === undefined || value.length >= requirements.minLength))
    return `must be at least ${requirements.minLength} characters`;
  if (!(requirements.maxLength === undefined || value.length <= requirements.maxLength))
    return `must be less than ${requirements.maxLength} characters`;

  return '';
};
