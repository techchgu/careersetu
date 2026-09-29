/**
 * CareerSetu AI — Authentication & Session Manager
 */

import { 
  getCurrentUser, 
  setCurrentUser, 
  firebaseSignUp, 
  firebaseLogIn, 
  firebaseLogOut 
} from './firebase.js';

// Check route protection
export function checkAuthGuard(isPublicPage = false) {
  const user = getCurrentUser();
  const currentPath = window.location.pathname;

  if (!user && !isPublicPage) {
    // If not authenticated and on a protected page, redirect to login
    const target = currentPath.includes('/pages/') ? 'login.html' : 'pages/login.html';
    window.location.href = target;
    return false;
  }

  if (user && isPublicPage && (currentPath.includes('login') || currentPath.includes('signup'))) {
    // If already logged in and on login/signup, redirect to dashboard
    window.location.href = currentPath.includes('/pages/') ? 'dashboard.html' : 'pages/dashboard.html';
    return false;
  }

  return true;
}

// User Sign Up
export async function signUp(email, password, fullName) {
  if (!email || !password || !fullName) {
    throw new Error('Please fill in all required fields (Full Name, Email, Password).');
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    throw new Error('Please provide a valid email address.');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  try {
    const userData = await firebaseSignUp(cleanEmail, password, fullName.trim());
    return userData;
  } catch (err) {
    // Human-friendly error messages
    if (err.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please go to Sign In page to login.');
    } else if (err.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use at least 6 characters.');
    } else if (err.code === 'auth/invalid-email') {
      throw new Error('The email address format is invalid.');
    }
    throw err;
  }
}

// User Log In
export async function logIn(email, password) {
  if (!email || !password) {
    throw new Error('Please enter both email and password.');
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const userData = await firebaseLogIn(cleanEmail, password);
    return userData;
  } catch (err) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      throw new Error('No account found with this email, or incorrect credentials.');
    } else if (err.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else if (err.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please wait a moment and try again.');
    }
    throw err;
  }
}

// User Log Out
export async function logOut() {
  try {
    await firebaseLogOut();
  } catch (e) {
    console.warn('Firebase signout error:', e);
  }
  setCurrentUser(null);
  const redirectTarget = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
  window.location.href = redirectTarget;
}

// Quick demo login for hackathon judges
export function loginAsDemoJudge() {
  const demoJudge = {
    uid: 'usr_himanshu_2026',
    email: 'himanshu@gmail.com',
    displayName: 'Himanshu Sahani'
  };
  setCurrentUser(demoJudge);
  return demoJudge;
}

// Populate UI User Profile Widgets
export function renderUserProfileWidget() {
  const user = getCurrentUser();
  if (!user) return;

  const nameEl = document.getElementById('sidebar-user-name');
  const emailEl = document.getElementById('sidebar-user-email');
  const avatarEl = document.getElementById('sidebar-user-avatar');

  const displayName = user.displayName || user.email?.split('@')[0] || 'Student';
  if (nameEl) nameEl.textContent = displayName;
  if (emailEl) emailEl.textContent = user.email || '';
  if (avatarEl) avatarEl.textContent = displayName.charAt(0).toUpperCase();

  // Mobile menu button listener
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const sidebar = document.querySelector('.app-sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Logout listener
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logOut();
    });
  }
}
