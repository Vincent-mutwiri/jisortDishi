import type { UserProfile } from '../types';

export function getLocalUserId() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('jisort_user_id');
}

export function saveLocalUser(profile: UserProfile) {
  window.localStorage.setItem('jisort_user_id', profile.user_id);
  window.localStorage.setItem('jisort_user_email', profile.email);
}

export function clearLocalUser() {
  window.localStorage.removeItem('jisort_user_id');
  window.localStorage.removeItem('jisort_user_email');
}
