const profileImageInput =
    document.getElementById('registerProfileImage');

const coverImageInput =
    document.getElementById('registerCoverImage');

const profilePreview =
    document.getElementById('profilePreview');

const coverPreview =
    document.getElementById('coverPreview');

const registerStep2Form =
    document.getElementById('registerStep2Form');


if (profileImageInput) {
    profileImageInput.addEventListener('change', function () {
        const file = this.files[0];

        if (!file) {
            return;
        }

        const previewUrl =
            URL.createObjectURL(file);

        profilePreview.src = previewUrl;
    });
}


if (coverImageInput) {
    coverImageInput.addEventListener('change', function () {
        const file = this.files[0];

        if (!file) {
            return;
        }

        const previewUrl =
            URL.createObjectURL(file);

        coverPreview.src = previewUrl;
        coverPreview.style.display = 'block';
    });
}


if (registerStep2Form) {
    registerStep2Form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const savedData =
            sessionStorage.getItem('registrationData');

        if (!savedData) {
            alert('פרטי ההרשמה לא נמצאו');
            window.location.href = 'register.html';
            return;
        }

        const userData =
            JSON.parse(savedData);

        const profileImage =
            profileImageInput?.files[0];

        const coverImage =
            coverImageInput?.files[0];

        const formData =
            new FormData();

        formData.append('username', userData.username);
        formData.append('firstName', userData.firstName);
        formData.append('lastName', userData.lastName);
        formData.append('email', userData.email);
        formData.append('city', userData.city);
        formData.append('password', userData.password);
        formData.append('birthday', userData.birthday);

        if (profileImage) {
            formData.append(
                'profileImage',
                profileImage
            );
        }

        if (coverImage) {
            formData.append(
                'coverImage',
                coverImage
            );
        }

        try {
            const response =
                await fetch('/api/users', {
                    method: 'POST',
                    body: formData
                });

            const data =
                await response.json();

            if (response.ok) {
                sessionStorage.removeItem(
                    'registrationData'
                );

                alert('ההרשמה בוצעה בהצלחה');

                window.location.href =
                    'index.html';

            } else {
                alert(
                    data.message ||
                    'אירעה שגיאה בהרשמה'
                );
            }

        } catch (error) {
            console.error(error);

            alert(
                'לא ניתן להתחבר לשרת'
            );
        }
    });
}