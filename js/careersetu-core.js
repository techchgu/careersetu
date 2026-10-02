/**
 * CareerSetu AI
 * Universal Core Engine
 *
 * FIXES:
 * 1. No automatic Himanshu/default-user login
 * 2. Real Firebase Auth user support
 * 3. Local prototype fallback support
 * 4. Consistent Firebase UID
 * 5. Profile data is merged instead of blindly replaced
 * 6. Avatar/profile sync
 * 7. Auth guard works correctly
 */

(function (global) {
  'use strict';

  /* =========================================================
     FIREBASE CONFIG
  ========================================================= */

  const firebaseConfig = {
    apiKey: "AIzaSyCpCKk5dqL-D040wimrAlx7O6R66FC3eIA",
    authDomain: "careersetu-88d98.firebaseapp.com",
    projectId: "careersetu-88d98",
    storageBucket: "careersetu-88d98.firebasestorage.app",
    messagingSenderId: "199488708377",
    appId: "1:199488708377:web:7eacabb05647411727ef88",
    measurementId: "G-DR9SR12EFY"
  };


  /* =========================================================
     IMPORTANT
     There is NO default logged-in user.
  ========================================================= */

  const DEMO_USER = {
    uid: 'careersetu_demo_student',
    email: 'demo.student@careersetu.local',
    displayName: 'Demo Student',
    isDemo: true
  };


  /* =========================================================
     INTERNAL STATE
  ========================================================= */

  let fbApp = null;
  let fbAuth = null;
  let fbDb = null;

  let isFirebaseReady = false;
  let memoryCache = {};
  let currentUserCache = undefined;


  /* =========================================================
     UTILITIES
  ========================================================= */

  function isBrowser() {
    return (
      typeof window !== 'undefined' &&
      typeof localStorage !== 'undefined'
    );
  }


  function normalizeEmail(email) {
    return String(email || '')
      .trim()
      .toLowerCase();
  }


  function safeJsonParse(value, fallback) {
    try {
      return value
        ? JSON.parse(value)
        : fallback;
    } catch (e) {
      return fallback;
    }
  }


  function generateConsistentUid(email) {

    const clean = normalizeEmail(email);

    let hash = 0;

    for (let i = 0; i < clean.length; i++) {
      const char = clean.charCodeAt(i);
      hash =
        ((hash << 5) - hash) +
        char;
      hash |= 0;
    }

    const positiveHash =
      Math.abs(hash).toString(36);

    const prefix =
      clean
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 8);

    return (
      'usr_' +
      (prefix || 'student') +
      '_' +
      positiveHash
    );
  }


  /* =========================================================
     FIREBASE INITIALIZATION
  ========================================================= */

  function initFirebase() {

    if (
      isFirebaseReady &&
      fbApp
    ) {
      return {
        app: fbApp,
        auth: fbAuth,
        db: fbDb,
        isLive: true
      };
    }


    if (
      typeof firebase === 'undefined' ||
      !firebase.initializeApp
    ) {
      return {
        app: null,
        auth: null,
        db: null,
        isLive: false
      };
    }


    try {

      if (
        !firebase.apps ||
        !firebase.apps.length
      ) {

        fbApp =
          firebase.initializeApp(
            firebaseConfig
          );

      } else {

        fbApp =
          firebase.app();

      }


      if (firebase.auth) {
        fbAuth =
          firebase.auth();
      }


      if (firebase.firestore) {

        fbDb =
          firebase.firestore();

        try {

          fbDb
            .enablePersistence({
              synchronizeTabs: true
            })
            .catch(function () {});

        } catch (e) {}

      }


      isFirebaseReady = true;


      return {
        app: fbApp,
        auth: fbAuth,
        db: fbDb,
        isLive: true
      };

    } catch (error) {

      console.warn(
        'Firebase initialization failed:',
        error
      );

      return {
        app: null,
        auth: null,
        db: null,
        isLive: false
      };
    }
  }


  setTimeout(
    function () {
      initFirebase();
    },
    0
  );


  /* =========================================================
     LOCAL ACCOUNT REGISTRY
  ========================================================= */

  function getAccountsRegistry() {

    if (
      memoryCache.accountsRegistry
    ) {
      return memoryCache.accountsRegistry;
    }


    if (!isBrowser()) {
      return {};
    }


    try {

      const raw =
        localStorage.getItem(
          'careersetu_registered_accounts'
        );


      const parsed =
        raw
          ? JSON.parse(raw)
          : {};


      memoryCache.accountsRegistry =
        parsed;


      return parsed;

    } catch (e) {

      return {};

    }
  }


  function saveAccountToRegistry(account) {

    if (
      !account ||
      !account.email ||
      !isBrowser()
    ) {
      return;
    }


    try {

      const registry =
        getAccountsRegistry();


      const email =
        normalizeEmail(
          account.email
        );


      registry[email] = {

        uid:
          account.uid,

        email:
          email,

        password:
          account.password || '',

        displayName:
          account.displayName ||
          email.split('@')[0],

        photoURL:
          account.photoURL || '',

        createdAt:
          account.createdAt ||
          new Date().toISOString(),

        lastLoginAt:
          new Date().toISOString()

      };


      memoryCache.accountsRegistry =
        registry;


      localStorage.setItem(
        'careersetu_registered_accounts',
        JSON.stringify(registry)
      );

    } catch (e) {

      console.warn(
        'Could not save local account:',
        e
      );
    }
  }


  /* =========================================================
     CURRENT USER
  ========================================================= */

  function getStoredCurrentUser() {

    if (!isBrowser()) {
      return null;
    }


    const stored =
      localStorage.getItem(
        'careersetu_current_user'
      );


    if (!stored) {
      return null;
    }


    const parsed =
      safeJsonParse(
        stored,
        null
      );


    return parsed || null;
  }


  function firebaseUserToPlainUser(firebaseUser) {

    if (!firebaseUser) {
      return null;
    }


    return {

      uid:
        firebaseUser.uid,

      email:
        firebaseUser.email || '',

      displayName:
        firebaseUser.displayName ||
        (
          firebaseUser.email
            ? firebaseUser.email.split('@')[0]
            : 'Student'
        ),

      photoURL:
        firebaseUser.photoURL || '',

      isFirebaseUser:
        true

    };
  }


  function getCurrentUser() {

    /*
      1. Memory
    */

    if (
      currentUserCache !== undefined
    ) {
      return currentUserCache;
    }


    /*
      2. Stored local session
    */

    let user =
      getStoredCurrentUser();


    /*
      3. Firebase Auth session
    */

    if (
      !user
    ) {

      try {

        initFirebase();


        if (
          fbAuth &&
          fbAuth.currentUser
        ) {

          user =
            firebaseUserToPlainUser(
              fbAuth.currentUser
            );

        }

      } catch (e) {}

    }


    /*
      4. Load avatar from profile
    */

    if (
      user &&
      !user.photoURL &&
      user.uid
    ) {

      try {

        const profileRaw =
          localStorage.getItem(
            'careersetu_profiles_' +
            user.uid
          );


        if (profileRaw) {

          const profile =
            JSON.parse(
              profileRaw
            );


          if (
            profile &&
            profile.photoURL
          ) {

            user.photoURL =
              profile.photoURL;

          }

        }

      } catch (e) {}
    }


    /*
      IMPORTANT:
      No default user here.
      No Himanshu fallback.
    */

    currentUserCache =
      user || null;


    return currentUserCache;

  }


  /* =========================================================
     SET CURRENT USER
  ========================================================= */

  function setCurrentUser(user) {

    currentUserCache =
      user || null;


    if (!isBrowser()) {
      return;
    }


    if (user) {

      localStorage.setItem(
        'careersetu_current_user',
        JSON.stringify(user)
      );

    } else {

      localStorage.removeItem(
        'careersetu_current_user'
      );

    }

  }


  /* =========================================================
     AUTH GUARD
  ========================================================= */

  function checkAuthGuard(isPublicPage) {

    /*
      Existing pages mostly call:
      CareerSetu.checkAuthGuard()
      which means protected page.
    */

    const publicPage =
      Boolean(isPublicPage);


    const user =
      getCurrentUser();


    const path =
      String(
        window.location.pathname ||
        ''
      ).toLowerCase();


    const isLoginPage =
      path.includes('login');


    const isSignupPage =
      path.includes('signup');


    const isAuthPage =
      isLoginPage ||
      isSignupPage;


    if (
      !user &&
      !publicPage
    ) {

      const target =
        path.includes('/pages/')
          ? 'login.html'
          : 'pages/login.html';


      window.location.replace(
        target
      );


      return false;

    }


    if (
      user &&
      publicPage &&
      isAuthPage
    ) {

      const target =
        path.includes('/pages/')
          ? 'dashboard.html'
          : 'pages/dashboard.html';


      window.location.replace(
        target
      );


      return false;

    }


    return true;

  }


  /* =========================================================
     SIGN UP
  ========================================================= */

  async function signUp(
    email,
    password,
    fullName
  ) {

    const cleanEmail =
      normalizeEmail(email);

    const cleanName =
      String(
        fullName || ''
      ).trim();


    if (!cleanEmail) {
      throw new Error(
        'Email address is required.'
      );
    }


    if (!password) {
      throw new Error(
        'Password is required.'
      );
    }


    if (!cleanName) {
      throw new Error(
        'Full name is required.'
      );
    }


    /*
      Try Firebase first
    */

    initFirebase();


    if (fbAuth) {

      try {

        const credential =
          await fbAuth
            .createUserWithEmailAndPassword(
              cleanEmail,
              password
            );


        const firebaseUser =
          credential.user;


        if (
          firebaseUser &&
          firebaseUser.updateProfile
        ) {

          await firebaseUser.updateProfile({
            displayName:
              cleanName
          });

        }


        const userData =
          firebaseUserToPlainUser(
            firebaseUser
          );


        setCurrentUser(
          userData
        );


        saveAccountToRegistry({

          uid:
            userData.uid,

          email:
            userData.email,

          displayName:
            userData.displayName,

          photoURL:
            userData.photoURL || '',

          createdAt:
            new Date().toISOString()

        });


        await saveUserData(
          'profiles',
          {
            fullName:
              cleanName,

            email:
              cleanEmail,

            createdAt:
              new Date().toISOString()
          },
          {
            allowBeforeAuth: false
          }
        );


        return userData;

      } catch (firebaseError) {

        /*
          If Firebase says email already exists,
          do NOT silently create local user.
        */

        const code =
          firebaseError &&
          firebaseError.code
            ? firebaseError.code
            : '';


        if (
          code ===
            'auth/email-already-in-use'
        ) {

          throw new Error(
            'This email is already registered. Please log in.'
          );

        }


        /*
          For prototype/offline mode,
          local fallback is allowed only if Firebase
          could not be used.
        */

        console.warn(
          'Firebase signup unavailable, using local fallback:',
          firebaseError
        );

      }

    }


    /*
      Local fallback
    */

    const registry =
      getAccountsRegistry();


    if (
      registry[cleanEmail]
    ) {

      throw new Error(
        'This email is already registered. Please log in.'
      );

    }


    const uid =
      generateConsistentUid(
        cleanEmail
      );


    const localUser = {

      uid:
        uid,

      email:
        cleanEmail,

      displayName:
        cleanName,

      photoURL:
        '',

      isLocalUser:
        true

    };


    saveAccountToRegistry({

      uid:
        uid,

      email:
        cleanEmail,

      password:
        password,

      displayName:
        cleanName,

      photoURL:
        '',

      createdAt:
        new Date().toISOString()

    });


    setCurrentUser(
      localUser
    );


    await saveUserData(
      'profiles',
      {
        fullName:
          cleanName,

        email:
          cleanEmail,

        createdAt:
          new Date().toISOString()
      }
    );


    return localUser;
  }


  /* =========================================================
     LOGIN
  ========================================================= */

  async function logIn(
    email,
    password
  ) {

    const cleanEmail =
      normalizeEmail(email);


    if (!cleanEmail) {
      throw new Error(
        'Email address is required.'
      );
    }


    if (!password) {
      throw new Error(
        'Password is required.'
      );
    }


    initFirebase();


    /*
      Try real Firebase Auth first
    */

    if (fbAuth) {

      try {

        const credential =
          await fbAuth
            .signInWithEmailAndPassword(
              cleanEmail,
              password
            );


        const userData =
          firebaseUserToPlainUser(
            credential.user
          );


        setCurrentUser(
          userData
        );


        saveAccountToRegistry({
          uid:
            userData.uid,

          email:
            userData.email,

          displayName:
            userData.displayName,

          photoURL:
            userData.photoURL || ''
        });


        syncAllUserDataFromCloud();


        return userData;

      } catch (firebaseError) {

        console.warn(
          'Firebase login failed, trying local account:',
          firebaseError
        );

      }

    }


    /*
      Local prototype fallback
    */

    const registry =
      getAccountsRegistry();


    const localAcc =
      registry[cleanEmail];


    if (!localAcc) {

      throw new Error(
        'No account found with this email. Please sign up first.'
      );

    }


    if (
      localAcc.password &&
      localAcc.password !== password
    ) {

      throw new Error(
        'Incorrect password. Please verify your credentials.'
      );

    }


    const userData = {

      uid:
        localAcc.uid,

      email:
        localAcc.email,

      displayName:
        localAcc.displayName ||
        cleanEmail.split('@')[0],

      photoURL:
        localAcc.photoURL || '',

      isLocalUser:
        true

    };


    setCurrentUser(
      userData
    );


    saveAccountToRegistry(
      userData
    );


    syncAllUserDataFromCloud();


    return userData;
  }


  /* =========================================================
     LOGOUT
  ========================================================= */

  async function logOut() {

    try {

      initFirebase();


      if (fbAuth) {

        await fbAuth
          .signOut()
          .catch(function () {});

      }

    } catch (e) {}


    setCurrentUser(
      null
    );


    const target =
      window.location.pathname.includes(
        '/pages/'
      )
        ? 'login.html'
        : 'pages/login.html';


    window.location.replace(
      target
    );

  }


  /*
    Alias for pages that use logout()
  */

  function logout() {
    return logOut();
  }


  /* =========================================================
     EXPLICIT DEMO LOGIN
     =========================================================
     IMPORTANT:
     This is NOT used automatically.
  ========================================================= */

  function loginAsDemoJudge() {

    const user =
      Object.assign(
        {},
        DEMO_USER
      );


    setCurrentUser(
      user
    );


    saveAccountToRegistry({
      uid:
        user.uid,

      email:
        user.email,

      displayName:
        user.displayName,

      photoURL:
        ''
    });


    return user;
  }


  /* =========================================================
     USER DATA KEY
  ========================================================= */

  function getUserStorageKey(
    collectionName,
    uid
  ) {

    return (
      'careersetu_' +
      collectionName +
      '_' +
      uid
    );

  }


  /* =========================================================
     SAVE USER DATA
     =========================================================
     IMPORTANT:
     Existing fields are merged, not blindly replaced.
  ========================================================= */

  async function saveUserData(
    collectionName,
    data,
    options
  ) {

    options =
      options || {};


    const user =
      getCurrentUser();


    if (
      !user ||
      !user.uid
    ) {

      if (
        options.allowBeforeAuth
      ) {

        return null;

      }


      throw new Error(
        'No logged-in user found.'
      );

    }


    const key =
      getUserStorageKey(
        collectionName,
        user.uid
      );


    let oldRecord = {};


    /*
      Existing memory data
    */

    if (
      memoryCache[key]
    ) {

      oldRecord =
        Object.assign(
          {},
          memoryCache[key]
        );

    }


    /*
      Existing localStorage data
    */

    if (
      isBrowser()
    ) {

      try {

        const oldRaw =
          localStorage.getItem(
            key
          );


        if (oldRaw) {

          const parsed =
            JSON.parse(
              oldRaw
            );


          if (parsed) {

            oldRecord =
              Object.assign(
                {},
                oldRecord,
                parsed
              );

          }

        }

      } catch (e) {}

    }


    const record =
      Object.assign(
        {},
        oldRecord,
        data || {},
        {
          uid:
            user.uid,

          userEmail:
            user.email || '',

          updatedAt:
            new Date().toISOString()
        }
      );


    memoryCache[key] =
      record;


    if (
      isBrowser()
    ) {

      try {

        localStorage.setItem(
          key,
          JSON.stringify(record)
        );

      } catch (e) {

        console.warn(
          'Local profile save failed:',
          e
        );

      }

    }


    /*
      Firestore
    */

    setTimeout(
      function () {

        try {

          initFirebase();


          if (
            fbDb &&
            user.uid
          ) {

            fbDb
              .collection(collectionName)
              .doc(user.uid)
              .set(
                record,
                {
                  merge: true
                }
              )
              .catch(function (error) {

                console.warn(
                  'Firestore save failed:',
                  error
                );

              });

          }

        } catch (e) {}

      },
      0
    );


    return record;

  }


  /* =========================================================
     GET USER DATA
  ========================================================= */

  async function getUserData(
    collectionName
  ) {

    const user =
      getCurrentUser();


    if (
      !user ||
      !user.uid
    ) {

      return null;

    }


    const key =
      getUserStorageKey(
        collectionName,
        user.uid
      );


    /*
      Memory
    */

    if (
      memoryCache[key]
    ) {

      return memoryCache[key];

    }


    /*
      LocalStorage
    */

    if (
      isBrowser()
    ) {

      try {

        const raw =
          localStorage.getItem(
            key
          );


        if (raw) {

          const parsed =
            JSON.parse(
              raw
            );


          if (parsed) {

            memoryCache[key] =
              parsed;


            return parsed;

          }

        }

      } catch (e) {}

    }


    /*
      Firestore
    */

    try {

      initFirebase();


      if (
        fbDb &&
        user.uid
      ) {

        const snapshot =
          await fbDb
            .collection(collectionName)
            .doc(user.uid)
            .get();


        if (
          snapshot.exists
        ) {

          const data =
            snapshot.data() || {};


          memoryCache[key] =
            data;


          if (
            isBrowser()
          ) {

            try {

              localStorage.setItem(
                key,
                JSON.stringify(data)
              );

            } catch (e) {}

          }


          return data;

        }

      }

    } catch (e) {

      console.warn(
        'Cloud data read failed:',
        e
      );

    }


    return null;
  }


  /* =========================================================
     CLOUD SYNC
  ========================================================= */

  async function syncAllUserDataFromCloud() {

    const user =
      getCurrentUser();


    if (
      !user ||
      !user.uid
    ) {

      return false;

    }


    initFirebase();


    if (
      !fbDb
    ) {

      return false;

    }


    const collections = [
      'profiles',
      'assessments',
      'careerRecommendations',
      'skillGaps',
      'roadmaps',
      'resumes',
      'interviews'
    ];


    for (
      const collectionName
      of collections
    ) {

      try {

        const snapshot =
          await fbDb
            .collection(collectionName)
            .doc(user.uid)
            .get();


        if (
          snapshot.exists
        ) {

          const data =
            snapshot.data() || {};


          const key =
            getUserStorageKey(
              collectionName,
              user.uid
            );


          memoryCache[key] =
            data;


          if (
            isBrowser()
          ) {

            localStorage.setItem(
              key,
              JSON.stringify(data)
            );

          }


          /*
            Keep avatar synced
          */

          if (
            collectionName === 'profiles' &&
            data.photoURL
          ) {

            user.photoURL =
              data.photoURL;

            setCurrentUser(
              user
            );

          }

        }

      } catch (e) {

        console.warn(
          'Sync failed:',
          collectionName,
          e
        );

      }

    }


    renderUserProfileWidget();

    return true;
  }


  /* =========================================================
     AVATAR SAVE
  ========================================================= */

  async function saveUserAvatar(
    photoDataUrl
  ) {

    const user =
      getCurrentUser();


    if (
      !user ||
      !user.uid
    ) {

      throw new Error(
        'Please log in first.'
      );

    }


    user.photoURL =
      photoDataUrl || '';


    setCurrentUser(
      user
    );


    saveAccountToRegistry({
      uid:
        user.uid,

      email:
        user.email,

      displayName:
        user.displayName,

      photoURL:
        photoDataUrl || ''
    });


    await saveUserData(
      'profiles',
      {
        photoURL:
          photoDataUrl || ''
      }
    );


    /*
      Update Firebase Auth photo if possible
    */

    try {

      initFirebase();


      if (
        fbAuth &&
        fbAuth.currentUser &&
        fbAuth.currentUser.uid ===
          user.uid
      ) {

        await fbAuth.currentUser
          .updateProfile({
            photoURL:
              photoDataUrl || null
          })
          .catch(function () {});

      }

    } catch (e) {}


    renderUserProfileWidget();


    return user;
  }


  /* =========================================================
     AVATAR REMOVE
  ========================================================= */

  async function removeUserAvatar() {

    const user =
      getCurrentUser();


    if (
      !user
    ) {

      return null;

    }


    user.photoURL =
      '';


    setCurrentUser(
      user
    );


    saveAccountToRegistry({
      uid:
        user.uid,

      email:
        user.email,

      displayName:
        user.displayName,

      photoURL:
        ''
    });


    await saveUserData(
      'profiles',
      {
        photoURL:
          ''
      }
    );


    try {

      initFirebase();


      if (
        fbAuth &&
        fbAuth.currentUser &&
        fbAuth.currentUser.uid ===
          user.uid
      ) {

        await fbAuth.currentUser
          .updateProfile({
            photoURL:
              null
          })
          .catch(function () {});

      }

    } catch (e) {}


    renderUserProfileWidget();


    return user;
  }


  /* =========================================================
     PROFILE SIDEBAR WIDGET
  ========================================================= */

  async function renderUserProfileWidget() {

    const user =
      getCurrentUser();


    const nameEl =
      document.getElementById(
        'sidebar-user-name'
      );


    const emailEl =
      document.getElementById(
        'sidebar-user-email'
      );


    const avatarEl =
      document.getElementById(
        'sidebar-user-avatar'
      );


    /*
      No hardcoded user.
    */

    let displayName =
      user &&
      user.displayName
        ? user.displayName
        : 'Student';


    let email =
      user &&
      user.email
        ? user.email
        : '';


    let photoURL =
      user &&
      user.photoURL
        ? user.photoURL
        : '';


    /*
      Get profile data too
    */

    if (
      user &&
      user.uid
    ) {

      try {

        const profile =
          await getUserData(
            'profiles'
          );


        if (
          profile
        ) {

          if (
            profile.fullName
          ) {

            displayName =
              profile.fullName;

          }


          if (
            profile.email
          ) {

            email =
              profile.email;

          }


          if (
            profile.photoURL
          ) {

            photoURL =
              profile.photoURL;

          }

        }

      } catch (e) {}

    }


    if (nameEl) {

      nameEl.textContent =
        displayName;

    }


    if (emailEl) {

      emailEl.textContent =
        email ||
        '';


    }


    if (avatarEl) {

      if (
        photoURL
      ) {

        avatarEl.innerHTML =
          '<img src="' +
          escapeForHtml(photoURL) +
          '" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';

      } else {

        avatarEl.textContent =
          (
            displayName ||
            'S'
          )
            .charAt(0)
            .toUpperCase();

      }

    }


    const logoutBtn =
      document.getElementById(
        'logout-btn'
      );


    if (
      logoutBtn &&
      !logoutBtn._careerSetuAttached
    ) {

      logoutBtn._careerSetuAttached =
        true;


      logoutBtn.addEventListener(
        'click',
        function (event) {

          event.preventDefault();

          logOut();

        }
      );

    }


    return {
      user:
        user,

      displayName:
        displayName,

      email:
        email,

      photoURL:
        photoURL
    };

  }


  /* =========================================================
     HTML ESCAPE
  ========================================================= */

  function escapeForHtml(
    value
  ) {

    return String(
      value == null
        ? ''
        : value
    )
      .replace(
        /&/g,
        '&amp;'
      )
      .replace(
        /</g,
        '&lt;'
      )
      .replace(
        />/g,
        '&gt;'
      )
      .replace(
        /"/g,
        '&quot;'
      )
      .replace(
        /'/g,
        '&#039;'
      );

  }


  /* =========================================================
     PUBLIC API
  ========================================================= */

  const CareerSetu = {

    firebaseConfig,

    DEMO_USER,

    initFirebase,

    getCurrentUser,

    setCurrentUser,

    checkAuthGuard,

    signUp,

    logIn,

    logOut,

    logout,

    loginAsDemoJudge,

    saveUserData,

    getUserData,

    saveUserAvatar,

    removeUserAvatar,

    syncAllUserDataFromCloud,

    renderUserProfileWidget

  };


  global.CareerSetu =
    CareerSetu;


  /*
    Firebase may load after this script,
    so retry initialization after a short delay.
  */

  setTimeout(
    function () {
      initFirebase();
    },
    500
  );


})(typeof window !== 'undefined'
  ? window
  : this);