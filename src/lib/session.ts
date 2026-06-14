import type { UserProfile } from '../types';

export function getLocalUserId() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('jisort_user_id');
}

export function saveLocalUser(profile: UserProfile) {
  window.localStorage.setItem('jisort_user_id', profile.user_id);
  window.localStorage.setItem('jisort_user_email', profile.email);
  window.localStorage.setItem('jisort_user_name', profile.name);
  window.localStorage.setItem('jisort_currency', profile.currency || 'KES');
}

export function getLocalCurrency(): string {
  if (typeof window === 'undefined') return 'KES';
  return window.localStorage.getItem('jisort_currency') || 'KES';
}

export function setLocalCurrency(currency: string) {
  window.localStorage.setItem('jisort_currency', currency);
}

export function clearLocalUser() {
  window.localStorage.removeItem('jisort_user_id');
  window.localStorage.removeItem('jisort_user_email');
  window.localStorage.removeItem('jisort_user_name');
  window.localStorage.removeItem('jisort_currency');
}
