document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const userData = {
        username: document.getElementById('username').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        city: document.getElementById('city').value,
        password: document.getElementById('password').value,
        birthday: document.getElementById('birthday').value
    };

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('ההרשמה בוצעה בהצלחה');
            window.location.href = 'index.html';
        } else {
            alert(data.message || 'אירעה שגיאה בהרשמה');
        }

    } catch (error) {
        alert('לא ניתן להתחבר לשרת');
        console.error(error);
    }
});