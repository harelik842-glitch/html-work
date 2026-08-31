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

        sessionStorage.setItem(
            'registrationData',
            JSON.stringify(userData)
        );

        window.location.href =
            'register-step2.html';
    });


    function initCityAutocomplete() {

    const cityInput =
        document.getElementById('city');

    if (!cityInput) {
        return;
    }

    const autocomplete =
        new google.maps.places.Autocomplete(
            cityInput,
            {
                types: ['(cities)']
            }
        );

    autocomplete.addListener(
        'place_changed',
        function () {

            const place =
                autocomplete.getPlace();

            if (!place) {
                return;
            }

            cityInput.value =
                place.name || cityInput.value;
        }
    );
}