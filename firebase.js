
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);


const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const errorMsg = document.getElementById('error-message');
const successMsg = document.getElementById('success-message');


const userProfile = document.getElementById('user-profile');
const loginBtn = document.getElementById('login-btn');
const userNameDisplay = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

const profileOverlay = document.getElementById('profile-overlay');
const profileModal = document.getElementById('profile-modal');
const closeProfileBtn = document.getElementById('close-profile');

function closeProfile() {
    document.body.classList.remove('show-profile');
}
if (userProfile) {
    userProfile.addEventListener('click', () => {
        document.body.classList.add('show-profile');
    });
}
if (closeProfileBtn) closeProfileBtn.addEventListener('click', closeProfile);
if (profileOverlay) profileOverlay.addEventListener('click', closeProfile);

function showMessage(element, text) {
    if (!element) return;
    element.innerText = text;
    element.classList.remove('hidden');
    setTimeout(() => {
        element.classList.add('hidden');
    }, 5000);
}


onAuthStateChanged(auth, (user) => {
    if (user) {
        const pendingName = localStorage.getItem('spiceRoutesPendingName');
        const defaultName = user.email ? user.email.split('@')[0] : 'Foodie';
        const resolvedName = user.displayName || pendingName || defaultName;
        if (pendingName) localStorage.removeItem('spiceRoutesPendingName');

        localStorage.setItem('spiceRoutesUser', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: resolvedName
        }));


        if (userProfile && loginBtn) {
            loginBtn.style.display = 'none';
            userProfile.classList.remove('hidden');

            const dpName = resolvedName;
            if (userNameDisplay) userNameDisplay.innerText = `Hi, ${dpName}`;

            const initials = dpName
                .split(' ')
                .filter(word => word.length > 0)
                .slice(0, 2)
                .map(word => word.charAt(0).toUpperCase())
                .join('');
            const navAvatar = document.getElementById('nav-avatar');
            const modalAvatar = document.getElementById('modal-avatar');
            if (navAvatar) navAvatar.innerText = initials;
            if (modalAvatar) modalAvatar.innerText = initials;

            const modalUserName = document.getElementById('modal-user-name');
            const modalUserEmail = document.getElementById('modal-user-email');
            const modalMemberSince = document.getElementById('modal-member-since');

            if (modalUserName) modalUserName.innerText = dpName;
            if (modalUserEmail) modalUserEmail.innerText = user.email || '';
            if (modalMemberSince && user.metadata && user.metadata.creationTime) {
                const cTime = new Date(user.metadata.creationTime);
                modalMemberSince.innerText = cTime.toLocaleDateString();
            }

            const phoneInput = document.getElementById('profile-phone');
            const addressInput = document.getElementById('profile-address');
            const totalOrders = document.getElementById('modal-total-orders');
            const savePhoneBtn = document.getElementById('save-phone-btn');
            const saveAddressBtn = document.getElementById('save-address-btn');

            if (phoneInput && addressInput && totalOrders) {
                const userExtData = JSON.parse(localStorage.getItem(`spiceRoutesExt_${user.uid}`)) || { phone: '', address: '', orders: 0 };

                phoneInput.value = userExtData.phone || '';
                addressInput.value = userExtData.address || '';
                totalOrders.innerText = userExtData.orders || 0;

                savePhoneBtn.onclick = () => {
                    userExtData.phone = phoneInput.value;
                    localStorage.setItem(`spiceRoutesExt_${user.uid}`, JSON.stringify(userExtData));
                    savePhoneBtn.innerHTML = '<i class="fa-solid fa-check-double"></i>';
                    setTimeout(() => savePhoneBtn.innerHTML = '<i class="fa-solid fa-check"></i>', 2000);
                };

                saveAddressBtn.onclick = () => {
                    userExtData.address = addressInput.value;
                    localStorage.setItem(`spiceRoutesExt_${user.uid}`, JSON.stringify(userExtData));
                    saveAddressBtn.innerHTML = '<i class="fa-solid fa-check-double"></i>';
                    setTimeout(() => saveAddressBtn.innerHTML = '<i class="fa-solid fa-check"></i>', 2000);
                };
            }
        }

        if (window.location.pathname.includes('login.html')) {
            const isAdmin = user.email && user.email.toLowerCase().includes('admin');
            window.location.href = isAdmin ? 'admin.html' : 'index.html';
        }
    } else {
        localStorage.removeItem('spiceRoutesUser');

        if (userProfile && loginBtn) {
            loginBtn.style.display = 'inline-block';
            userProfile.classList.add('hidden');
        }
    }
});


const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const googleAuthBtn = document.getElementById('google-auth-btn');

if (googleAuthBtn) {
    googleAuthBtn.addEventListener('click', async () => {
        try {
            googleAuthBtn.disabled = true;
            googleAuthBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';
            const result = await signInWithPopup(auth, googleProvider);
            if (result && result.user) {
                showMessage(successMsg, `Welcome, ${result.user.displayName || 'Foodie'}! Redirecting...`);
                // onAuthStateChanged will handle the redirect, but we can also trigger it here
                setTimeout(() => {
                    const isAdmin = result.user.email && result.user.email.toLowerCase().includes('admin');
                    window.location.href = isAdmin ? 'admin.html' : 'index.html';
                }, 1000);
            }
        } catch (error) {
            let message = "Sign-In failed: " + error.message;
            if (error.code === 'auth/popup-closed-by-user') {
                message = "Sign-in cancelled by user.";
            } else if (error.code === 'auth/unauthorized-domain') {
                message = "Error: This domain is not authorized. Add it in Firebase Console → Authentication → Authorized Domains.";
            }
            showMessage(errorMsg, message);
            console.error("Google Auth Error:", error);
            googleAuthBtn.disabled = false;
            googleAuthBtn.innerHTML = '<i class="fa-brands fa-google"></i> Continue with Google';
        }
    });
}


if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const submitBtn = document.getElementById('signup-submit');
        const loader = submitBtn.querySelector('.loader');
        const btnText = submitBtn.querySelector('.btn-text');


        loader.classList.remove('hidden');
        btnText.classList.add('hidden');
        submitBtn.disabled = true;

        try {

            localStorage.setItem('spiceRoutesPendingName', name);

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            await updateProfile(userCredential.user, {
                displayName: name
            });

            showMessage(successMsg, 'Account created successfully! Redirecting...');
            setTimeout(() => {
                const isAdmin = email.toLowerCase().includes('admin');
                window.location.href = isAdmin ? 'admin.html' : 'index.html';
            }, 1000);
        } catch (error) {
            let message = "An error occurred during sign up.";
            if (error.code === 'auth/email-already-in-use') message = "Email already in use.";
            if (error.code === 'auth/weak-password') message = "Password should be at least 6 characters.";
            showMessage(errorMsg, message);
        } finally {

            loader.classList.add('hidden');
            btnText.classList.remove('hidden');
            submitBtn.disabled = false;
        }
    });
}


if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const submitBtn = document.getElementById('login-submit');
        const loader = submitBtn.querySelector('.loader');
        const btnText = submitBtn.querySelector('.btn-text');


        loader.classList.remove('hidden');
        btnText.classList.add('hidden');
        submitBtn.disabled = true;

        try {
            await signInWithEmailAndPassword(auth, email, password);

            showMessage(successMsg, 'Login successful! Redirecting...');
            setTimeout(() => {
                const isAdmin = email.toLowerCase().includes('admin');
                window.location.href = isAdmin ? 'admin.html' : 'index.html';
            }, 1000);
        } catch (error) {
            let message = "Invalid email or password.";
            showMessage(errorMsg, message);
        } finally {

            loader.classList.add('hidden');
            btnText.classList.remove('hidden');
            submitBtn.disabled = false;
        }
    });
}


if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            if (typeof closeProfile === 'function') closeProfile();
        } catch (error) {
            console.error("Error signing out:", error);
        }
    });
}
