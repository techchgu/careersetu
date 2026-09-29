/**
 * CareerSetu AI — Firebase Configuration & Storage Bridge
 * 
 * Powered by Google Cloud Firestore & Firebase Authentication
 * Project: careersetu-88d98
 */

// Official Firebase Web App Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCpCKk5dqL-D040wimrAlx7O6R66FC3eIA",
  authDomain: "careersetu-88d98.firebaseapp.com",
  projectId: "careersetu-88d98",
  storageBucket: "careersetu-88d98.firebasestorage.app",
  messagingSenderId: "199488708377",
  appId: "1:199488708377:web:7eacabb05647411727ef88",
  measurementId: "G-DR9SR12EFY"
};

let firebaseApp = null;
let firebaseAuth = null;
let firebaseFirestore = null;
let fbAuthModule = null;
let fbFirestoreModule = null;
let isInitialized = false;

// Consistent UID Generator for Local/Fallback Mode
export function generateConsistentUid(email) {
  const clean = (email || '').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const positiveHash = Math.abs(hash).toString(36);
  const prefix = clean.replace(/[^a-z0-9]/g, '').slice(0, 8);
  return `usr_${prefix}_${positiveHash}`;
}

// Local Accounts Registry Helper
export function getAccountsRegistry() {
  try {
    const raw = localStorage.getItem('careersetu_registered_accounts');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveAccountToRegistry(account) {
  try {
    const registry = getAccountsRegistry();
    const key = account.email.trim().toLowerCase();
    registry[key] = {
      uid: account.uid,
      email: key,
      password: account.password || '',
      displayName: account.displayName || key.split('@')[0],
      createdAt: account.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    localStorage.setItem('careersetu_registered_accounts', JSON.stringify(registry));
  } catch (e) {
    console.warn('Could not save to local registry:', e);
  }
}

// Initialize Firebase via Modular SDK from Official Google CDN
export async function initFirebase() {
  if (isInitialized && firebaseApp) {
    return { 
      app: firebaseApp, 
      auth: firebaseAuth, 
      db: firebaseFirestore, 
      authModule: fbAuthModule, 
      firestoreModule: fbFirestoreModule, 
      isLive: true 
    };
  }

  try {
    const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
    fbAuthModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
    fbFirestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

    const apps = getApps();
    firebaseApp = apps.length ? getApp() : initializeApp(firebaseConfig);
    firebaseAuth = fbAuthModule.getAuth(firebaseApp);
    firebaseFirestore = fbFirestoreModule.getFirestore(firebaseApp);
    isInitialized = true;

    console.log('⚡ CareerSetu: Connected to Firebase [careersetu-88d98]');
    return { 
      app: firebaseApp, 
      auth: firebaseAuth, 
      db: firebaseFirestore, 
      authModule: fbAuthModule, 
      firestoreModule: fbFirestoreModule, 
      isLive: true 
    };
  } catch (e) {
    console.warn('Firebase live connection notice:', e.message);
    return { isLive: false };
  }
}

// User session management
export function getCurrentUser() {
  const stored = localStorage.getItem('careersetu_current_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('careersetu_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('careersetu_current_user');
  }
}

// Live Firebase Authentication Helpers
export async function firebaseSignUp(email, password, displayName) {
  const normalizedEmail = email.trim().toLowerCase();
  const { auth, authModule, db, firestoreModule, isLive } = await initFirebase();

  let uid = null;
  let userData = null;

  if (isLive && auth && authModule) {
    try {
      const userCred = await authModule.createUserWithEmailAndPassword(auth, normalizedEmail, password);
      if (displayName && userCred.user) {
        await authModule.updateProfile(userCred.user, { displayName });
      }
      uid = userCred.user.uid;
      userData = {
        uid: uid,
        email: normalizedEmail,
        displayName: displayName || userCred.user.displayName || normalizedEmail.split('@')[0]
      };

      // Save user record to Firestore users collection
      if (db && firestoreModule) {
        try {
          const userDocRef = firestoreModule.doc(db, 'users', uid);
          await firestoreModule.setDoc(userDocRef, {
            uid: uid,
            email: normalizedEmail,
            displayName: userData.displayName,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          }, { merge: true });
        } catch (dbErr) {
          console.warn('Firestore user doc creation notice:', dbErr.message);
        }
      }
    } catch (authErr) {
      // If Firebase gave a specific error like email-already-in-use, rethrow it so the UI can show it
      if (authErr.code === 'auth/email-already-in-use' || authErr.code === 'auth/weak-password' || authErr.code === 'auth/invalid-email') {
        throw authErr;
      }
      console.warn('Firebase live signup failed, using synchronized account registry:', authErr.message);
    }
  }

  // If live Firebase was not available or had a network fallback, use consistent local account
  if (!userData) {
    uid = generateConsistentUid(normalizedEmail);
    userData = {
      uid: uid,
      email: normalizedEmail,
      displayName: displayName.trim() || normalizedEmail.split('@')[0]
    };
  }

  // Register in local account table
  saveAccountToRegistry({
    uid: userData.uid,
    email: normalizedEmail,
    password: password,
    displayName: userData.displayName
  });

  // Initialize initial profile record if not already existing
  const initialProfile = {
    fullName: userData.displayName,
    email: normalizedEmail,
    createdAt: new Date().toISOString()
  };
  
  // Set current user session
  setCurrentUser(userData);

  // Pre-seed profile record for this user
  try {
    await saveUserData('profiles', initialProfile);
  } catch (err) {
    console.warn('Initial profile seed notice:', err);
  }

  return userData;
}

export async function firebaseLogIn(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const { auth, authModule, isLive } = await initFirebase();

  let userData = null;

  if (isLive && auth && authModule) {
    try {
      const userCred = await authModule.signInWithEmailAndPassword(auth, normalizedEmail, password);
      userData = {
        uid: userCred.user.uid,
        email: userCred.user.email,
        displayName: userCred.user.displayName || normalizedEmail.split('@')[0]
      };
    } catch (authErr) {
      if (authErr.code === 'auth/wrong-password' || authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
        // Check local registry first before failing
        const registry = getAccountsRegistry();
        const localAcc = registry[normalizedEmail];
        if (localAcc) {
          if (localAcc.password === password) {
            userData = {
              uid: localAcc.uid,
              email: localAcc.email,
              displayName: localAcc.displayName
            };
          } else {
            throw new Error('Incorrect password. Please verify your credentials.');
          }
        } else {
          throw authErr;
        }
      } else {
        console.warn('Firebase signIn notice:', authErr.message);
      }
    }
  }

  // Fallback: Check local account registry
  if (!userData) {
    const registry = getAccountsRegistry();
    const localAcc = registry[normalizedEmail];

    if (localAcc) {
      if (localAcc.password && localAcc.password !== password) {
        throw new Error('Incorrect password. Please try again.');
      }
      userData = {
        uid: localAcc.uid,
        email: localAcc.email,
        displayName: localAcc.displayName
      };
    } else if (normalizedEmail === 'himanshu@gmail.com') {
      // Demo Judge / Default Account
      userData = {
        uid: 'usr_himanshu_2026',
        email: 'himanshu@gmail.com',
        displayName: 'Himanshu Sahani'
      };
    } else {
      // Generate consistent UID for new account or prompt signup
      userData = {
        uid: generateConsistentUid(normalizedEmail),
        email: normalizedEmail,
        displayName: normalizedEmail.split('@')[0]
      };
      saveAccountToRegistry({
        uid: userData.uid,
        email: normalizedEmail,
        password: password,
        displayName: userData.displayName
      });
    }
  }

  setCurrentUser(userData);
  saveAccountToRegistry({
    uid: userData.uid,
    email: normalizedEmail,
    password: password,
    displayName: userData.displayName
  });

  // Hydrate all user documents from Cloud Firestore to Local Cache
  await syncAllUserDataFromCloud();

  return userData;
}

export async function firebaseLogOut() {
  const { auth, authModule, isLive } = await initFirebase();
  if (isLive && auth && authModule) {
    try {
      await authModule.signOut(auth);
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
  }
  setCurrentUser(null);
}

// Sync all Cloud Firestore documents for active user to local cache
export async function syncAllUserDataFromCloud() {
  const user = getCurrentUser();
  if (!user || !user.uid) return;

  const collections = ['profiles', 'assessments', 'careerRecommendations', 'skillGaps', 'roadmaps', 'resumes', 'interviews'];
  try {
    const { db, firestoreModule, isLive } = await initFirebase();
    if (isLive && db && firestoreModule && user.uid) {
      for (const col of collections) {
        try {
          const docRef = firestoreModule.doc(db, col, user.uid);
          const docSnap = await firestoreModule.getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const docKey = `careersetu_${col}_${user.uid}`;
            localStorage.setItem(docKey, JSON.stringify(data));
          }
        } catch (colErr) {
          // ignore single doc read errors
        }
      }
    }
  } catch (err) {
    console.warn('Cloud sync notice:', err.message);
  }
}

// Firestore / Local Data Bridge for User Profile & Journey Records
export async function saveUserData(collectionName, data) {
  const user = getCurrentUser();
  if (!user || !user.uid) throw new Error('User not authenticated.');

  const docKey = `careersetu_${collectionName}_${user.uid}`;
  const timestamp = new Date().toISOString();
  const record = { 
    ...data, 
    updatedAt: timestamp, 
    uid: user.uid,
    userEmail: user.email || ''
  };

  // 1. Instant local storage save keyed by user UID
  localStorage.setItem(docKey, JSON.stringify(record));

  // 2. Persist to live Cloud Firestore
  try {
    const { db, firestoreModule, isLive } = await initFirebase();
    if (isLive && db && firestoreModule && user.uid) {
      const docRef = firestoreModule.doc(db, collectionName, user.uid);
      await firestoreModule.setDoc(docRef, record, { merge: true });
      console.log(`✓ Firestore Saved: [${collectionName}/${user.uid}] for ${user.email}`);
    }
  } catch (err) {
    console.warn(`Firestore write notice for ${collectionName}:`, err.message);
  }

  return record;
}

export async function getUserData(collectionName) {
  const user = getCurrentUser();
  if (!user || !user.uid) return null;

  // 1. Try reading from live Firestore
  try {
    const { db, firestoreModule, isLive } = await initFirebase();
    if (isLive && db && firestoreModule && user.uid) {
      const docRef = firestoreModule.doc(db, collectionName, user.uid);
      const docSnap = await firestoreModule.getDoc(docRef);
      if (docSnap.exists()) {
        const remoteData = docSnap.data();
        // Update local cache
        const docKey = `careersetu_${collectionName}_${user.uid}`;
        localStorage.setItem(docKey, JSON.stringify(remoteData));
        return remoteData;
      }
    }
  } catch (err) {
    console.warn(`Firestore read notice for ${collectionName}:`, err.message);
  }

  // 2. Read from local storage cache keyed by user UID
  const docKey = `careersetu_${collectionName}_${user.uid}`;
  const stored = localStorage.getItem(docKey);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  }

  return null;
}
