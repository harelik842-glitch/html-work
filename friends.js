let currentUser = null;

async function loadCurrentUser() {
    try {
        const response = await fetch('/api/current-user');

        if (!response.ok) {
            return;
        }

        currentUser = await response.json();

    } catch (error) {
        console.error('Error loading current user:', error);
    }
}

async function loadUsers() {
    try {
        const response = await fetch('/api/users');

        if (!response.ok) {
            return;
        }

        const users = await response.json();

        const usersContainer =
            document.getElementById('usersContainer');

        const friendsContainer =
            document.getElementById('friendsContainer');

        usersContainer.innerHTML = '';
        friendsContainer.innerHTML = '';

        users.forEach(user => {
            const isFriend =
                currentUser.friends?.some(
                    friendId => friendId.toString() === user._id.toString()
                );

            const userElement =
                document.createElement('div');

            userElement.className =
                'd-flex justify-content-between align-items-center border rounded p-3 mb-2';

            userElement.innerHTML = `
                <div>
                    <strong>
                        ${user.firstName || ''}
                        ${user.lastName || ''}
                    </strong>

                    <div class="text-muted small">
                        @${user.username}
                    </div>

                    <div class="text-muted small">
                        ${user.city || ''}
                    </div>
                </div>

               ${isFriend ? `
    <button
        class="btn btn-outline-danger btn-sm remove-friend-btn"
        data-id="${user._id}">
        <i class="bi bi-person-dash"></i>
        הסר חבר
    </button>
` : `
                    <button
                        class="btn btn-primary btn-sm add-friend-btn"
                        data-id="${user._id}">
                        <i class="bi bi-person-plus"></i>
                        הוסף חבר
                    </button>
                `}
            `;

            if (isFriend) {
                friendsContainer.appendChild(userElement);
            } else {
                usersContainer.appendChild(userElement);
            }
        });

        const addFriendButtons =
            document.querySelectorAll('.add-friend-btn');

        addFriendButtons.forEach(button => {
            button.addEventListener('click', async function () {
                const friendId = this.dataset.id;

                try {
                    const response = await fetch(
                        `/api/users/${friendId}/friend`,
                        {
                            method: 'PUT'
                        }
                    );

                    const data = await response.json();

                    if (response.ok) {
                        alert('החבר נוסף בהצלחה');
                        await loadCurrentUser();
                        loadUsers();
                    } else {
                        alert(
                            data.message ||
                            'אירעה שגיאה בהוספת חבר'
                        );
                    }

                } catch (error) {
                    console.error(error);
                    alert('לא ניתן להתחבר לשרת');
                }
            });

            
        });

        const removeFriendButtons =
    document.querySelectorAll('.remove-friend-btn');

removeFriendButtons.forEach(button => {
    button.addEventListener('click', async function () {
        const friendId = this.dataset.id;

        try {
            const response = await fetch(
                `/api/users/${friendId}/friend`,
                {
                    method: 'DELETE'
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert('החבר הוסר בהצלחה');

                await loadCurrentUser();
                loadUsers();

            } else {
                alert(
                    data.message ||
                    'אירעה שגיאה בהסרת החבר'
                );
            }

        } catch (error) {
            console.error(error);
            alert('לא ניתן להתחבר לשרת');
        }
    });
});

    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function initializeFriendsPage() {
    await loadCurrentUser();
    loadUsers();
}

initializeFriendsPage();