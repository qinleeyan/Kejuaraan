// Form validation utilities for registration form

export interface FormErrors {
  [key: string]: string;
}

export interface RegistrationFormData {
  // Registration Metadata
  championshipId: string;

  // Personal Info
  fullName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: string;
  dojang: string;

  // Competition Details
  competitionCategory: string;
  beltColor: string;
  classCategory: string;

  // Physical Metrics
  height: string;
  weight: string;
}

export const validateFullName = (value: string): string => {
  if (!value.trim()) {
    return 'Full name is required';
  }
  if (value.trim().length < 3) {
    return 'Name must be at least 3 characters';
  }
  if (value.trim().length > 100) {
    return 'Name must not exceed 100 characters';
  }
  return '';
};

export const validateDojang = (value: string): string => {
  if (!value.trim()) {
    return 'Dojang origin is required';
  }
  if (value.trim().length < 2) {
    return 'Dojang must be at least 2 characters';
  }
  return '';
};

export const validateDateOfBirth = (value: string): string => {
  if (!value) {
    return 'Date of birth is required';
  }
  const date = new Date(value);
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();

  if (age < 5) {
    return 'Participant must be at least 5 years old';
  }
  if (age > 100) {
    return 'Please enter a valid date of birth';
  }
  return '';
};

export const validatePlaceOfBirth = (value: string): string => {
  if (!value.trim()) {
    return 'Place of birth is required';
  }
  if (value.trim().length < 2) {
    return 'Place must be at least 2 characters';
  }
  return '';
};

export const validateGender = (value: string): string => {
  if (!value) {
    return 'Gender is required';
  }
  return '';
};

export const validateCompetitionCategory = (value: string): string => {
  if (!value) {
    return 'Competition category is required';
  }
  return '';
};

export const validateBeltLevel = (value: string): string => {
  return ''; // No longer required, consolidated into beltColor
};

export const validateBeltColor = (value: string): string => {
  if (!value) {
    return 'Belt color is required';
  }
  return '';
};

export const validateClassCategory = (value: string): string => {
  if (!value) {
    return 'Class category is required';
  }
  return '';
};

export const validateHeight = (value: string): string => {
  if (!value) {
    return 'Height is required';
  }

  // Only allow integers
  if (!/^\d+$/.test(value)) {
    return 'Height must be a whole number (cm)';
  }

  const height = parseInt(value);
  if (height < 100 || height > 230) {
    return 'Height must be between 100 and 230 cm';
  }
  return '';
};

export const validateWeight = (value: string): string => {
  if (!value) {
    return 'Weight is required';
  }

  // Only allow integers
  if (!/^\d+$/.test(value)) {
    return 'Weight must be a whole number (kg)';
  }

  const weight = parseInt(value);
  if (weight < 20 || weight > 200) {
    return 'Weight must be between 20 and 200 kg';
  }
  return '';
};

export const validateFormStep1 = (data: {
  fullName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: string;
  dojang: string;
}): FormErrors => {
  const errors: FormErrors = {};

  const fullNameError = validateFullName(data.fullName);
  if (fullNameError) errors.fullName = fullNameError;

  const dobError = validateDateOfBirth(data.dateOfBirth);
  if (dobError) errors.dateOfBirth = dobError;

  const pobError = validatePlaceOfBirth(data.placeOfBirth);
  if (pobError) errors.placeOfBirth = pobError;

  const genderError = validateGender(data.gender);
  if (genderError) errors.gender = genderError;

  const dojangError = validateDojang(data.dojang);
  if (dojangError) errors.dojang = dojangError;

  return errors;
};

export const validateFormStep2 = (data: {
  competitionCategory: string;
  beltLevel?: string;
  beltColor: string;
  classCategory: string;
}): FormErrors => {
  const errors: FormErrors = {};

  const categoryError = validateCompetitionCategory(data.competitionCategory);
  if (categoryError) errors.competitionCategory = categoryError;

  const colorError = validateBeltColor(data.beltColor);
  if (colorError) errors.beltColor = colorError;

  const classError = validateClassCategory(data.classCategory);
  if (classError) errors.classCategory = classError;

  return errors;
};

export const validateFormStep3 = (data: {
  height: string;
  weight: string;
}): FormErrors => {
  const errors: FormErrors = {};

  const heightError = validateHeight(data.height);
  if (heightError) errors.height = heightError;

  const weightError = validateWeight(data.weight);
  if (weightError) errors.weight = weightError;

  return errors;
};

// Constants for form options
export const BELT_LEVEL_OPTIONS = [
  { value: '10th-kup', label: '10th Kup (White)' },
  { value: '9th-kup', label: '9th Kup' },
  { value: '8th-kup', label: '8th Kup' },
  { value: '7th-kup', label: '7th Kup' },
  { value: '6th-kup', label: '6th Kup' },
  { value: '5th-kup', label: '5th Kup' },
  { value: '4th-kup', label: '4th Kup' },
  { value: '3rd-kup', label: '3rd Kup' },
  { value: '2nd-kup', label: '2nd Kup' },
  { value: '1st-kup', label: '1st Kup' },
  { value: '1st-dan', label: '1st Dan (Black)' },
  { value: '2nd-dan', label: '2nd Dan' },
  { value: '3rd-dan', label: '3rd Dan' },
  { value: '4th-dan', label: '4th Dan' },
  { value: '5th-dan', label: '5th Dan' },
  { value: '6th-dan', label: '6th Dan' },
];

export const BELT_COLOR_OPTIONS = [
  { value: 'putih', label: 'Putih (White)' },
  { value: 'kuning', label: 'Kuning (Yellow)' },
  { value: 'kuning-strip', label: 'Kuning Strip (Yellow Stripe)' },
  { value: 'hijau', label: 'Hijau (Green)' },
  { value: 'hijau-strip', label: 'Hijau Strip (Green Stripe)' },
  { value: 'biru', label: 'Biru (Blue)' },
  { value: 'biru-strip', label: 'Biru Strip (Blue Stripe)' },
  { value: 'merah', label: 'Merah (Red)' },
  { value: 'merah-strip-1', label: 'Merah Strip I (Red Stripe I)' },
  { value: 'merah-strip-2', label: 'Merah Strip II (Red Stripe II)' },
  { value: 'dan', label: 'DAN (Black Belt)' },
];

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export const CLASS_CATEGORY_OPTIONS = [
  { value: 'prestasi', label: 'Prestasi (Achievement)' },
  { value: 'pemula', label: 'Pemula (Beginner)' },
];

export const COMPETITION_OPTIONS = [
  { value: 'kyorugi', label: 'Kyorugi (Sparring)' },
  { value: 'poomsae', label: 'Poomsae (Forms)' },
];
