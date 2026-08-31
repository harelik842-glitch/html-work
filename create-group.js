const groupImageInput =
    document.getElementById('groupImage');

const groupImagePreview =
    document.getElementById('groupImagePreview');


// מציג את התמונה לפני יצירת הקבוצה
groupImageInput.addEventListener('change', function () {

    const file = this.files[0];

    if (!file) {
        groupImagePreview.style.display = 'none';
        groupImagePreview.src = '';
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        groupImagePreview.src = event.target.result;
        groupImagePreview.style.display = 'inline-block';
    };

    reader.readAsDataURL(file);
});


document
    .getElementById('createGroupForm')
    .addEventListener('submit', async function (event) {

        event.preventDefault();

        const name =
            document.getElementById('groupName').value.trim();

        const description =
            document.getElementById('groupDescription').value.trim();

        const imageFile =
            document.getElementById('groupImage').files[0];


        if (name === '') {
            alert('יש להזין שם לקבוצה');
            return;
        }


        // שולח את פרטי הקבוצה יחד עם התמונה
        const formData = new FormData();

        formData.append('name', name);
        formData.append('description', description);

        if (imageFile) {
            formData.append('image', imageFile);
        }


        try {

            const response =
                await fetch('/api/groups-with-image', {
                    method: 'POST',
                    body: formData
                });

            const data =
                await response.json();


            if (response.ok) {

                alert('הקבוצה נוצרה בהצלחה');

                window.location.href =
                    `group.html?groupId=${data.group._id}`;

            } else {

                alert(
                    data.message ||
                    'אירעה שגיאה ביצירת הקבוצה'
                );
            }

        } catch (error) {

            console.error(error);
            alert('לא ניתן להתחבר לשרת');
        }
    });