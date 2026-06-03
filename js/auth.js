document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorBox = document.getElementById('login-error');
    const errorText = document.getElementById('login-error-text');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            // Hide previous error
            errorBox.classList.remove('show');
            
            // Add a slight loading delay for premium feel
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Authenticating...";
            submitBtn.disabled = true;

            setTimeout(() => {
                if (username === 'admin' && password === 'password123') {
                    // Success
                    localStorage.setItem('isAdminLoggedIn', 'true');
                    window.location.href = 'admin.html';
                } else {
                    // Error
                    errorText.textContent = 'Incorrect username or password. Please try again.';
                    errorBox.classList.add('show');
                    
                    // Reset button
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            }, 600); // 600ms dummy delay
        });
    }
});
