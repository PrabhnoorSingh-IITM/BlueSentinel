// Authentication Handlers for BlueSentinel (Login/Signup)
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // Firebase Auth Integration
                const auth = firebase.auth();
                await auth.signInWithEmailAndPassword(email, password);
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error("Login failed:", error);
                alert("Access Denied: " + error.message);
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const fullname = document.getElementById('fullname').value;

            try {
                const auth = firebase.auth();
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);

                // Optional: Store profile data in DB
                const db = firebase.database();
                await db.ref(`users/${userCredential.user.uid}`).set({
                    fullname: fullname,
                    email: email,
                    role: 'sentinel',
                    joined: firebase.database.ServerValue.TIMESTAMP
                });

                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error("Signup failed:", error);
                alert("Registration Error: " + error.message);
            }
        });
    }
});
