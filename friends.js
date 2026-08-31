let currentUser = null;



async function loadCurrentUser() {
    try {

        const response =
            await fetch('/api/current-user');

        if (!response.ok) {
            return false;
        }

        currentUser =
            await response.json();

        return true;

    } catch (error) {

        console.error(
            'Error loading current user:',
            error
        );

        return false;
    }
}



function initializeTabs() {

    const requestsTab =
        document.getElementById(
            'friendRequestsTab'
        );

    const allTab =
        document.getElementById(
            'allFriendsTab'
        );

    const requestsSection =
        document.getElementById(
            'friendRequestsSection'
        );

    const allSection =
        document.getElementById(
            'allFriendsSection'
        );


    requestsTab.addEventListener(
        'click',
        function () {

            requestsSection.hidden = false;
            allSection.hidden = true;

            requestsTab.classList.add(
                'text-primary'
            );

            requestsTab.classList.remove(
                'text-secondary'
            );

            allTab.classList.add(
                'text-secondary'
            );

            allTab.classList.remove(
                'text-primary'
            );
        }
    );


    allTab.addEventListener(
        'click',
        function () {

            requestsSection.hidden = true;
            allSection.hidden = false;

            allTab.classList.add(
                'text-primary'
            );

            allTab.classList.remove(
                'text-secondary'
            );

            requestsTab.classList.add(
                'text-secondary'
            );

            requestsTab.classList.remove(
                'text-primary'
            );
        }
    );
}



async function loadFriendRequests() {

    const container =
        document.getElementById(
            'friendRequestsContainer'
        );

    const countBadge =
        document.getElementById(
            'friendRequestsCount'
        );

    if (!currentUser) {
        return;
    }


    const requestIds =
        currentUser.friendRequestsReceived || [];



    countBadge.textContent =
        requestIds.length;

    countBadge.hidden =
        requestIds.length === 0;


    if (requestIds.length === 0) {

        container.innerHTML = `
            <div class="text-center text-muted py-5">

                <i
                    class="bi bi-person-check fs-1 d-block mb-2"
                ></i>

                אין בקשות חברות חדשות

            </div>
        `;

        return;
    }


    try {

        const response =
            await fetch('/api/users');

        if (!response.ok) {

            container.innerHTML = `
                <div class="text-danger">
                    לא ניתן לטעון את בקשות החברות
                </div>
            `;

            return;
        }


        const users =
            await response.json();

//מצא את המשתמשים ששלחו בקשות חברות
        const requestUsers =
            users.filter(user =>
                requestIds.some(requestId =>
                    requestId.toString() ===
                    user._id.toString()
                )
            );


        container.innerHTML = '';


        requestUsers.forEach(user => {

            const element =
                document.createElement('div');


            element.className =
                'd-flex justify-content-between align-items-center border rounded p-3 mb-3';


            element.innerHTML = `

                <a
                    href="profile.html?userId=${user._id}"
                    class="d-flex align-items-center gap-3 text-decoration-none text-dark"
                >

                    <img
                        src="${user.profileImage || 'harel.jpg'}"
                        alt="Profile"
                        class="rounded-circle"
                        width="60"
                        height="60"
                        style="object-fit: cover;"
                    >

                    <div>

                        <strong>
                            ${user.firstName || ''}
                            ${user.lastName || ''}
                        </strong>

                        <div class="text-muted small">
                            @${user.username || ''}
                        </div>

                        ${
                            user.city
                                ? `
                                    <div class="text-muted small">
                                        ${user.city}
                                    </div>
                                `
                                : ''
                        }

                    </div>

                </a>


                <div class="d-flex gap-2">

                    <button
                        type="button"
                        class="btn btn-primary btn-sm accept-request-btn"
                        data-id="${user._id}"
                    >
                        <i class="bi bi-check-lg"></i>
                        אשר
                    </button>


                    <button
                        type="button"
                        class="btn btn-light border btn-sm reject-request-btn"
                        data-id="${user._id}"
                    >
                        <i class="bi bi-x-lg"></i>
                        דחה
                    </button>

                </div>
            `;


            container.appendChild(
                element
            );
        });


        initializeRequestButtons();


    } catch (error) {

        console.error(
            'Error loading friend requests:',
            error
        );
    }
}



function initializeRequestButtons() {



    const acceptButtons =
        document.querySelectorAll(
            '.accept-request-btn'
        );


    acceptButtons.forEach(button => {

        button.addEventListener(
            'click',
            async function () {

                const senderId =
                    this.dataset.id;

                try {

                    const response =
                        await fetch(
                            `/api/users/${senderId}/friend-request/accept`,
                            {
                                method: 'PUT'
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        alert(
                            data.message ||
                            'אירעה שגיאה באישור הבקשה'
                        );

                        return;
                    }


                    await refreshFriendsPage();


                } catch (error) {

                    console.error(
                        'Accept request error:',
                        error
                    );

                    alert(
                        'לא ניתן להתחבר לשרת'
                    );
                }
            }
        );
    });



    const rejectButtons =
        document.querySelectorAll(
            '.reject-request-btn'
        );


    rejectButtons.forEach(button => {

        button.addEventListener(
            'click',
            async function () {

                const senderId =
                    this.dataset.id;

                try {

                    const response =
                        await fetch(
                            `/api/users/${senderId}/friend-request/reject`,
                            {
                                method: 'DELETE'
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        alert(
                            data.message ||
                            'אירעה שגיאה בדחיית הבקשה'
                        );

                        return;
                    }


                    await refreshFriendsPage();


                } catch (error) {

                    console.error(
                        'Reject request error:',
                        error
                    );

                    alert(
                        'לא ניתן להתחבר לשרת'
                    );
                }
            }
        );
    });
}



async function loadFriends() {

    const container =
        document.getElementById(
            'friendsContainer'
        );


    if (!currentUser) {
        return;
    }


    const friendIds =
        currentUser.friends || [];


    if (friendIds.length === 0) {

        container.innerHTML = `
            <div class="text-center text-muted py-5">

                <i
                    class="bi bi-people fs-1 d-block mb-2"
                ></i>

                עדיין אין חברים

            </div>
        `;

        return;
    }


    try {

        const response =
            await fetch('/api/users');

        if (!response.ok) {
            return;
        }


        const users =
            await response.json();

//מצא את הפרטים של המשתמשים שנמצאים ברשימת החברים
        const friends =
            users.filter(user =>
                friendIds.some(friendId =>
                    friendId.toString() ===
                    user._id.toString()
                )
            );


        container.innerHTML = '';


        friends.forEach(user => {

            const element =
                document.createElement('div');


            element.className =
                'd-flex justify-content-between align-items-center border rounded p-3 mb-3';


            element.innerHTML = `

                <a
                    href="profile.html?userId=${user._id}"
                    class="d-flex align-items-center gap-3 text-decoration-none text-dark"
                >

                    <img
                        src="${user.profileImage || 'harel.jpg'}"
                        alt="Profile"
                        class="rounded-circle"
                        width="60"
                        height="60"
                        style="object-fit: cover;"
                    >

                    <div>

                        <strong>
                            ${user.firstName || ''}
                            ${user.lastName || ''}
                        </strong>

                        <div class="text-muted small">
                            @${user.username || ''}
                        </div>

                        ${
                            user.city
                                ? `
                                    <div class="text-muted small">
                                        ${user.city}
                                    </div>
                                `
                                : ''
                        }

                    </div>

                </a>


                <button
                    type="button"
                    class="btn btn-outline-danger btn-sm remove-friend-btn"
                    data-id="${user._id}"
                >
                    <i class="bi bi-person-dash"></i>
                    הסר חבר
                </button>
            `;


            container.appendChild(
                element
            );
        });


        initializeRemoveFriendButtons();


    } catch (error) {

        console.error(
            'Error loading friends:',
            error
        );
    }
}



function initializeRemoveFriendButtons() {

    const buttons =
        document.querySelectorAll(
            '.remove-friend-btn'
        );


    buttons.forEach(button => {

        button.addEventListener(
            'click',
            async function () {

                const friendId =
                    this.dataset.id;


                try {

                    const response =
                        await fetch(
                            `/api/users/${friendId}/friend`,
                            {
                                method: 'DELETE'
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        alert(
                            data.message ||
                            'אירעה שגיאה בהסרת החבר'
                        );

                        return;
                    }


                    await refreshFriendsPage();


                } catch (error) {

                    console.error(
                        'Remove friend error:',
                        error
                    );

                    alert(
                        'לא ניתן להתחבר לשרת'
                    );
                }
            }
        );
    });
}



async function refreshFriendsPage() {

    await loadCurrentUser();

    await loadFriendRequests();

    await loadFriends();
}



async function initializeFriendsPage() {

    const loaded =
        await loadCurrentUser();

    if (!loaded) {
        return;
    }

    initializeTabs();

    await loadFriendRequests();

    await loadFriends();
}


initializeFriendsPage();