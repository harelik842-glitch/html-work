document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    document.getElementById('usernameError').textContent = '';
    document.getElementById('passwordError').textContent = '';

    let isValid = true;

    if (usernameInput.value.trim() === '') {
        document.getElementById('usernameError').textContent = 'אנא הזן שם משתמש';
        isValid = false;
    }

    if (passwordInput.value.length < 6) {
        document.getElementById('passwordError').textContent = 'הסיסמה חייבת להכיל לפחות 6 תווים';
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: usernameInput.value,
                password: passwordInput.value
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('התחברת בהצלחה');
            window.location.href = 'file.html';
        } else {
            document.getElementById('passwordError').textContent =
                data.message || 'שם משתמש או סיסמה שגויים';
        }

    } catch (error) {
        console.error(error);
        document.getElementById('passwordError').textContent =
            'לא ניתן להתחבר לשרת';
    }
});