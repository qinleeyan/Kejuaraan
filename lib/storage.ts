// LocalStorage utilities for form data persistence

import { RegistrationFormData } from './validation';

const FORM_STORAGE_KEY = 'taekwondo_registration_form';
const SUBMISSIONS_STORAGE_KEY = 'taekwondo_registrations';

/**
 * Save form data to localStorage (auto-save)
 */
export const saveFormData = (data: Partial<RegistrationFormData>) => {
  try {
    const existing = getFormData();
    const merged = { ...existing, ...data };
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(merged));
  } catch (error) {
    console.error('Failed to save form data:', error);
  }
};

/**
 * Get saved form data from localStorage
 */
export const getFormData = (): Partial<RegistrationFormData> => {
  try {
    const data = localStorage.getItem(FORM_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to get form data:', error);
    return {};
  }
};

/**
 * Clear form data from localStorage
 */
export const clearFormData = () => {
  try {
    localStorage.removeItem(FORM_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear form data:', error);
  }
};

/**
 * Save completed registration to submissions
 */
export const saveSubmission = (data: RegistrationFormData) => {
  try {
    const submissions = getSubmissions();
    const submission = {
      ...data,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
    };
    submissions.push(submission);
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
    return submission.id;
  } catch (error) {
    console.error('Failed to save submission:', error);
    return null;
  }
};

/**
 * Get all submitted registrations
 */
export const getSubmissions = (): Array<RegistrationFormData & { id: string; submittedAt: string }> => {
  try {
    const data = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get submissions:', error);
    return [];
  }
};

/**
 * Get a specific submission by ID
 */
export const getSubmission = (id: string) => {
  try {
    const submissions = getSubmissions();
    return submissions.find(sub => sub.id === id);
  } catch (error) {
    console.error('Failed to get submission:', error);
    return null;
  }
};

/**
 * Delete a submission
 */
export const deleteSubmission = (id: string) => {
  try {
    const submissions = getSubmissions();
    const filtered = submissions.filter(sub => sub.id !== id);
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete submission:', error);
  }
};
