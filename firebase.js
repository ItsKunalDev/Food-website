
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
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
    apiKey: "AIzaSyAlcGyMeL_e3ZsqEMD2z1pnX1wBpJcORyY",
    authDomain: "deepfake-detection-989e1.firebaseapp.com",
    projectId: "deepfake-detection-989e1",
    storageBucket: "deepfake-detection-989e1.firebasestorage.app",
    messagingSenderId: "415409961848",
    appId: "1:415409961848:web:ee5d4a73c70a60509d268d"
};

const app = initializeApp(firebaseConfig);
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

// Authentication State Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        localStorage.setItem('spiceRoutesUser', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Foodie'
        }));

        // Update index.html Navbar if it exists
        if (userProfile && loginBtn) {
            loginBtn.style.display = 'none';
            userProfile.classList.remove('hidden');

            const dpName = user.displayName || 'Foodie';
            if (userNameDisplay) userNameDisplay.innerText = `Hi, ${dpName}`;

            // Populate Avatar and Modal
            const initial = dpName.charAt(0).toUpperCase();
            const navAvatar = document.getElementById('nav-avatar');
            const modalAvatar = document.getElementById('modal-avatar');
            if (navAvatar) navAvatar.innerText = initial;
            if (modalAvatar) modalAvatar.innerText = initial;

            const modalUserName = document.getElementById('modal-user-name');
            const modalUserEmail = document.getElementById('modal-user-email');
            const modalMemberSince = document.getElementById('modal-member-since');

            if (modalUserName) modalUserName.innerText = dpName;
            if (modalUserEmail) modalUserEmail.innerText = user.email || '';
            if (modalMemberSince && user.metadata && user.metadata.creationTime) {
                const cTime = new Date(user.metadata.creationTime);
                modalMemberSince.innerText = cTime.toLocaleDateString();
            }

            // Load and Save Extended Profile Details
            const phoneInput = document.getElementById('profile-phone');
            const addressInput = document.getElementById('profile-address');
            const totalOrders = document.getElementById('modal-total-orders');
            const savePhoneBtn = document.getElementById('save-phone-btn');
            const saveAddressBtn = document.getElementById('save-address-btn');

            if (phoneInput && addressInput && totalOrders) {
                // Load saved data safely from local storage mapped to uid
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

        // If on login page, redirect to home
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html';
        }
    } else {
        // User is signed out
        localStorage.removeItem('spiceRoutesUser');

        // Update index.html Navbar if it exists
        if (userProfile && loginBtn) {
            loginBtn.style.display = 'inline-block';
            userProfile.classList.add('hidden');
        }
    }
});


const googleProvider = new GoogleAuthProvider();
const googleAuthBtn = document.getElementById('google-auth-btn');

if (googleAuthBtn) {
    googleAuthBtn.addEventListener('click', async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            showMessage(successMsg, 'Google Sign-In successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            let message = "Sign-In failed: " + error.message;
            if (error.code === 'auth/popup-closed-by-user') message = "Sign-In popup was closed.";
            if (error.code === 'auth/unauthorized-domain') message = "Error: Please run via Localhost, not file://";
            showMessage(errorMsg, message);
            console.error("Google Auth Error:", error);
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
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            await updateProfile(userCredential.user, {
                displayName: name
            });

            showMessage(successMsg, 'Account created successfully! Redirecting...');
            setTimeout(() => {
                window.location.href = 'index.html';
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
                window.location.href = 'index.html';
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
