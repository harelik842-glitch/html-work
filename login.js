document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');  

    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';

    let isValid = true;
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    if (!emailPattern.test(emailInput.value)) {
        document.getElementById('emailError').textContent = 'אנא הזן אימייל תקין';  
        isValid = false; 
    }

    if (passwordInput.value.length < 6) {
        document.getElementById('passwordError').textContent = 'הסיסמה חייבת להכיל לפחות 6 תווים';
        isValid = false;
    }
    if (isValid) {
        window.location.href = 'file.html';
    }
});