document
    .getElementById('registerForm')
    .addEventListener('submit', function(event) {

        event.preventDefault();

        const password =
            document.getElementById('password').value;

        const confirmPassword =
            document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('הסיסמאות אינן תואמות');
            return;
        }

        const userData = {
            username:
                document.getElementById('username').value.trim(),

            firstName:
                document.getElementById('firstName').value.trim(),

            lastName:
                document.getElementById('lastName').value.trim(),

            email:
                document.getElementById('email').value.trim(),

            city:
                document.getElementById('city').value.trim(),

            password: password,

            birthday:
                document.getElementById('birthday').value
        };

        // שמירה זמנית עד שלב 2
        sessionStorage.setItem(
            'registrationData',
            JSON.stringify(userData)
        );

        // מעבר לשלב בחירת התמונות
        window.location.href =
            'register-step2.html';
    });