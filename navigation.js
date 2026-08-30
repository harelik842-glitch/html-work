// =====================================================
// SHARED NAVIGATION
// =====================================================

let navigationCurrentUser = null;


// =====================================================
// יצירת הסרגל העליון + הסרגל הימני
// =====================================================

function createSharedNavigation() {

    const container =
        document.getElementById('sharedNavigation');

    if (!container) {
        return;
    }

    container.innerHTML = `

        <!-- ==============================
             סרגל עליון
        =============================== -->

        <nav class="navbar bg-white border-bottom sticky-top shared-top-navbar">

            <div class="container-fluid">

                <!-- צד ימין: לוגו + חיפוש -->

                <div class="d-flex align-items-center gap-2">

                    <a
                        href="file.html"
                        class="navbar-brand text-primary fw-bold fs-2 mb-0"
                    >
                        facebook
                    </a>

                    <div class="position-relative">

                        <input
                            type="text"
                            id="mainSearchInput"
                            class="form-control rounded-pill shared-search-input"
                            placeholder="חיפוש בפייסבוק"
                            autocomplete="off"
                        >

                        <div
                            id="mainSearchResults"
                            class="shared-search-results"
                        ></div>

                    </div>

                </div>


                <!-- 5 אייקונים באמצע -->

                <div class="shared-center-navigation">

                    <a href="file.html" title="דף הבית">
                        <i class="bi bi-house-door-fill"></i>
                    </a>

                    <a href="friends.html" title="חברים">
                        <i class="bi bi-people-fill"></i>
                    </a>

                    <a href="groups.html" title="קבוצות">
                        <i class="bi bi-person-fill"></i>
                    </a>

                    <a href="marketplace.html" title="Marketplace">
                        <i class="bi bi-shop"></i>
                    </a>

                    <a href="birthdays.html" title="ימי הולדת">
                        <i class="bi bi-gift-fill"></i>
                    </a>

                </div>


                <!-- צד שמאל -->

                <div class="d-flex align-items-center gap-2">


                    <!-- הודעות -->

                    <a
                        href="messages.html"
                        class="shared-navbar-circle position-relative"
                        title="הודעות"
                    >

                        <i class="bi bi-chat-dots-fill"></i>

                        <span
                            id="unreadMessagesBadge"
                            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                            hidden
                        >
                            0
                        </span>

                    </a>


                    <!-- התראות -->

                    <div class="position-relative">

                        <button
                            type="button"
                            id="notificationsBtn"
                            class="shared-navbar-circle position-relative border-0"
                            title="התראות"
                        >

                            <i class="bi bi-bell-fill"></i>

                            <span
                                id="notificationsBadge"
                                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                hidden
                            >
                                0
                            </span>

                        </button>


                        <div
                            id="notificationsMenu"
                            class="shared-notifications-menu"
                            hidden
                        >

                            <div class="p-3 border-bottom">
                                <h4 class="mb-0">
                                    התראות
                                </h4>
                            </div>

                            <div id="latestNotificationsContainer">

                                <div class="text-center text-muted p-4">
                                    טוען התראות...
                                </div>

                            </div>

                            <div class="p-2 border-top text-center">

                                <a
                                    href="notifications.html"
                                    class="text-decoration-none"
                                >
                                    הצג את כל ההתראות
                                </a>

                            </div>

                        </div>

                    </div>


                    <!-- תמונת משתמש -->

                    <div class="position-relative">

                        <button
                            type="button"
                            id="homeProfileMenuBtn"
                            class="border-0 bg-transparent p-0"
                        >

                            <img
                                src="harel.jpg"
                                class="rounded-circle current-user-profile-image"
                                width="42"
                                height="42"
                                alt="Profile"
                            >

                        </button>


                        <div
                            id="homeProfileMenu"
                            class="shared-profile-menu"
                            hidden
                        >

                            <a
                                href="profile.html"
                                class="shared-profile-menu-link"
                            >
                                <i class="bi bi-person-circle"></i>
                                הפרופיל שלי
                            </a>

                            <hr class="my-2">

                            <button
                                type="button"
                                id="logoutBtn"
                                class="shared-profile-menu-link border-0 bg-transparent w-100"
                            >
                                <i class="bi bi-box-arrow-right"></i>
                                התנתקות
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </nav>



        <!-- ==============================
             סרגל צד ימין
        =============================== -->

        <aside class="shared-right-sidebar">

            <!-- משתמש -->

            <a
                href="profile.html"
                class="shared-sidebar-link"
            >

                <img
                    src="harel.jpg"
                    class="rounded-circle current-user-profile-image"
                    width="40"
                    height="40"
                    alt="Profile"
                >

                <strong id="currentUserSidebarName">
                    המשתמש שלי
                </strong>

            </a>


            <!-- חברים -->

            <a href="friends.html" class="shared-sidebar-link">
                <i class="bi bi-people-fill"></i>
                <span>חברים</span>
            </a>


            <!-- זכרונות -->

            <a href="memories.html" class="shared-sidebar-link">
                <i class="bi bi-clock-history"></i>
                <span>זכרונות</span>
            </a>


            <!-- שמורים -->

            <a href="saved.html" class="shared-sidebar-link">
                <i class="bi bi-bookmark-fill"></i>
                <span>שמורים</span>
            </a>


            <!-- קבוצות -->

            <a href="groups.html" class="shared-sidebar-link">
                <i class="bi bi-people"></i>
                <span>קבוצות</span>
            </a>


            <!-- Reels -->

            <a href="#" class="shared-sidebar-link">
                <i class="bi bi-play-btn-fill"></i>
                <span>Reels</span>
            </a>


            <!-- Marketplace -->

            <a href="marketplace.html" class="shared-sidebar-link">
                <i class="bi bi-shop"></i>
                <span>Marketplace</span>
            </a>


            <!-- אירועים -->

            <a href="events.html" class="shared-sidebar-link">
                <i class="bi bi-calendar-event-fill"></i>
                <span>אירועים</span>
            </a>


            <!-- Messenger -->

            <a href="messages.html" class="shared-sidebar-link">
                <i class="bi bi-messenger"></i>
                <span>Messenger</span>
            </a>


            <!-- התראות -->

            <a href="notifications.html" class="shared-sidebar-link">
                <i class="bi bi-bell-fill"></i>
                <span>התראות</span>
            </a>


            <!-- הזמנות ותשלומים -->

            <a href="#" class="shared-sidebar-link">
                <i class="bi bi-credit-card-fill"></i>
                <span>הזמנות ותשלומים</span>
            </a>


            <!-- ימי הולדת -->

            <a href="birthdays.html" class="shared-sidebar-link">
                <i class="bi bi-gift-fill"></i>
                <span>ימי הולדת</span>
            </a>

        </aside>
    `;
}


// =====================================================
// טעינת המשתמש המחובר
// =====================================================

async function loadNavigationCurrentUser() {

    try {

        const response =
            await fetch('/api/current-user');

        if (!response.ok) {
            return;
        }

        navigationCurrentUser =
            await response.json();


        const fullName =
            `${navigationCurrentUser.firstName || ''} ${navigationCurrentUser.lastName || ''}`.trim()
            ||
            navigationCurrentUser.username
            ||
            'הפרופיל שלי';


        const sidebarName =
            document.getElementById(
                'currentUserSidebarName'
            );

        if (sidebarName) {
            sidebarName.textContent = fullName;
        }


        document
            .querySelectorAll(
                '.current-user-profile-image'
            )
            .forEach(image => {

                image.src =
                    navigationCurrentUser.profileImage ||
                    'harel.jpg';

            });

    } catch (error) {

        console.error(
            'Navigation user error:',
            error
        );

    }
}


// =====================================================
// חיפוש
// =====================================================

function initializeNavigationSearch() {

    const input =
        document.getElementById(
            'mainSearchInput'
        );

    const resultsContainer =
        document.getElementById(
            'mainSearchResults'
        );


    if (!input || !resultsContainer) {
        return;
    }


    input.addEventListener(
        'input',
        async function () {

            const query =
                this.value.trim();


            if (query.length < 2) {

                resultsContainer.hidden =
                    true;

                resultsContainer.innerHTML =
                    '';

                return;
            }


            try {

                const [usersResponse, groupsResponse] =
                    await Promise.all([

                        fetch(
                            `/api/search/users?q=${encodeURIComponent(query)}`
                        ),

                        fetch(
                            `/api/search/groups?q=${encodeURIComponent(query)}`
                        )

                    ]);


                const users =
                    usersResponse.ok
                        ? await usersResponse.json()
                        : [];


                const groups =
                    groupsResponse.ok
                        ? await groupsResponse.json()
                        : [];


                resultsContainer.innerHTML = '';


                if (
                    users.length === 0 &&
                    groups.length === 0
                ) {

                    resultsContainer.innerHTML = `
                        <div class="p-3 text-muted">
                            לא נמצאו תוצאות
                        </div>
                    `;

                    resultsContainer.hidden =
                        false;

                    return;
                }


                if (users.length > 0) {

                    resultsContainer.insertAdjacentHTML(
                        'beforeend',
                        `
                            <div class="fw-bold px-3 pt-3 pb-2">
                                אנשים
                            </div>
                        `
                    );


                    users.forEach(user => {

                        const element =
                            document.createElement('a');


                        element.href =
                            `profile.html?userId=${user._id}`;


                        element.className =
                            'd-flex align-items-center gap-3 p-2 text-decoration-none text-dark shared-search-result';


                        element.innerHTML = `

                            <img
                                src="${user.profileImage || 'harel.jpg'}"
                                class="rounded-circle"
                                width="45"
                                height="45"
                                alt="Profile"
                            >

                            <div>

                                <strong>
                                    ${user.firstName || ''}
                                    ${user.lastName || ''}
                                </strong>

                                <div class="text-muted small">
                                    @${user.username || ''}
                                </div>

                            </div>
                        `;


                        resultsContainer.appendChild(
                            element
                        );

                    });
                }


                if (groups.length > 0) {

                    resultsContainer.insertAdjacentHTML(
                        'beforeend',
                        `
                            <div class="fw-bold px-3 pt-3 pb-2 border-top">
                                קבוצות
                            </div>
                        `
                    );


                    groups.forEach(group => {

                        const element =
                            document.createElement('a');


                        element.href =
                            `group.html?groupId=${group._id}`;


                        element.className =
                            'd-flex align-items-center gap-3 p-2 text-decoration-none text-dark shared-search-result';


                        element.innerHTML = `

                            <img
                                src="${group.image || 'harel.jpg'}"
                                class="rounded-circle"
                                width="45"
                                height="45"
                                alt="Group"
                            >

                            <div>

                                <strong>
                                    ${group.name || ''}
                                </strong>

                                <div class="text-muted small">
                                    ${group.members?.length || 0} חברים
                                </div>

                            </div>
                        `;


                        resultsContainer.appendChild(
                            element
                        );

                    });
                }


                resultsContainer.hidden =
                    false;


            } catch (error) {

                console.error(
                    'Navigation search error:',
                    error
                );

            }

        }
    );


    document.addEventListener(
        'click',
        function (event) {

            if (
                !input.contains(event.target) &&
                !resultsContainer.contains(event.target)
            ) {

                resultsContainer.hidden =
                    true;

            }

        }
    );
}


// =====================================================
// הודעות שלא נקראו
// =====================================================

async function loadNavigationUnreadMessages() {

    try {

        const response =
            await fetch(
                '/api/messages-unread-count'
            );


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        const badge =
            document.getElementById(
                'unreadMessagesBadge'
            );


        if (!badge) {
            return;
        }


        const count =
            Number(data.unreadCount || 0);


        if (count > 0) {

            badge.textContent = count;
            badge.hidden = false;

        } else {

            badge.hidden = true;

        }

    } catch (error) {

        console.error(
            'Unread messages error:',
            error
        );

    }
}




function navigationTimeAgo(date) {

    const seconds =
        Math.floor(
            (new Date() - new Date(date)) / 1000
        );


    if (seconds < 60) {
        return 'עכשיו';
    }


    const minutes =
        Math.floor(seconds / 60);

    if (minutes < 60) {
        return `לפני ${minutes} דקות`;
    }


    const hours =
        Math.floor(minutes / 60);

    if (hours < 24) {
        return `לפני ${hours} שעות`;
    }


    const days =
        Math.floor(hours / 24);

    return `לפני ${days} ימים`;
}




async function loadNavigationNotifications() {

    try {

        const response =
            await fetch(
                '/api/notifications/latest'
            );


        if (!response.ok) {
            return;
        }


        const notifications =
            await response.json();


        const container =
            document.getElementById(
                'latestNotificationsContainer'
            );


        const badge =
            document.getElementById(
                'notificationsBadge'
            );


        if (!container) {
            return;
        }


        const unreadCount =
            notifications.filter(
                notification =>
                    !notification.isRead
            ).length;


        if (badge) {

            if (unreadCount > 0) {

                badge.textContent =
                    unreadCount;

                badge.hidden =
                    false;

            } else {

                badge.hidden =
                    true;

            }
        }


        container.innerHTML = '';


        if (notifications.length === 0) {

            container.innerHTML = `
                <div class="text-center text-muted p-4">
                    אין התראות להצגה
                </div>
            `;

            return;
        }


        notifications.forEach(
            notification => {

                const element =
                    document.createElement('div');


                element.className =
                    'shared-notification-item';


                const senderName =
                    `${notification.sender?.firstName || ''} ${notification.sender?.lastName || ''}`.trim();


                let text =
                    'התראה חדשה';


                if (notification.type === 'like') {
                    text =
                        `${senderName} עשה לייק לפוסט שלך`;
                }


                if (notification.type === 'comment') {
                    text =
                        `${senderName} הגיב לפוסט שלך`;
                }


                if (notification.type === 'friend') {
    text =
        `${senderName} שלח לך בקשת חברות`;
}


                if (notification.type === 'group_post') {
                    text =
                        `${senderName} פרסם פוסט בקבוצה ${notification.group?.name || ''}`;
                }

                if (notification.type === 'share') {
                text =
                        `${senderName} שיתף את הפוסט שלך`;
        }

                element.innerHTML = `

    <img
        src="${notification.sender?.profileImage || 'harel.jpg'}"
        class="rounded-circle"
        width="50"
        height="50"
        alt="Profile"
        style="object-fit: cover;"
    >

    <div class="flex-grow-1">

        <div>
            ${text}
        </div>

        <div class="text-muted small">
            ${navigationTimeAgo(notification.createdAt)}
        </div>

        ${
            notification.type === 'friend'
                ? `
                    <div class="d-flex gap-2 mt-2">

                        <button
                            type="button"
                            class="btn btn-primary btn-sm accept-friend-request"
                            data-user-id="${notification.sender?._id}"
                        >
                            אשר
                        </button>

                        <button
                            type="button"
                            class="btn btn-light btn-sm reject-friend-request"
                            data-user-id="${notification.sender?._id}"
                        >
                            דחה
                        </button>

                    </div>
                `
                : ''
        }

    </div>

    ${
        !notification.isRead
            ? '<span class="shared-unread-dot"></span>'
            : ''
    }
`;

const acceptButton =
    element.querySelector(
        '.accept-friend-request'
    );

const rejectButton =
    element.querySelector(
        '.reject-friend-request'
    );


if (acceptButton) {

    acceptButton.addEventListener(
        'click',
        async function (event) {

            event.stopPropagation();

            const senderId =
                this.dataset.userId;

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

                await loadNavigationNotifications();

            } catch (error) {

                console.error(
                    'Accept friend request error:',
                    error
                );

                alert(
                    'לא ניתן להתחבר לשרת'
                );
            }
        }
    );
}


if (rejectButton) {

    rejectButton.addEventListener(
        'click',
        async function (event) {

            event.stopPropagation();

            const senderId =
                this.dataset.userId;

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

                await loadNavigationNotifications();

            } catch (error) {

                console.error(
                    'Reject friend request error:',
                    error
                );

                alert(
                    'לא ניתן להתחבר לשרת'
                );
            }
        }
    );
}
                element.addEventListener(
                    'click',
                    function () {

                        if (
    (
        notification.type === 'like' ||
        notification.type === 'comment' ||
        notification.type === 'share'
    ) &&
    notification.post?._id
) {

                            window.location.href =
                                `file.html?postId=${notification.post._id}`;

                            return;
                        }


                        if (
                            notification.type === 'friend' &&
                            notification.sender?._id
                        ) {

                            window.location.href =
                                `profile.html?userId=${notification.sender._id}`;

                            return;
                        }


                        if (
                            notification.type === 'group_post' &&
                            notification.group?._id
                        ) {

                            window.location.href =
                                `group.html?groupId=${notification.group._id}`;

                        }

                    }
                );


                container.appendChild(element);

            });

    } catch (error) {

        console.error(
            'Notifications error:',
            error
        );

    }
}




function initializeNotificationsMenu() {

    const button =
        document.getElementById(
            'notificationsBtn'
        );

    const menu =
        document.getElementById(
            'notificationsMenu'
        );

    const badge =
        document.getElementById(
            'notificationsBadge'
        );

    if (!button || !menu) {
        return;
    }

    button.addEventListener(
        'click',
        async function (event) {

            event.stopPropagation();

            const isOpening =
                menu.hidden;

            menu.hidden =
                !menu.hidden;

            if (isOpening) {

                await loadNavigationNotifications();

                try {

                    const response =
                        await fetch(
                            '/api/notifications/read-all',
                            {
                                method: 'PUT'
                            }
                        );

                    if (response.ok) {

                        if (badge) {
                            badge.hidden = true;
                            badge.textContent = '0';
                        }

                        document
                            .querySelectorAll(
                                '.shared-unread-dot'
                            )
                            .forEach(dot => {
                                dot.remove();
                            });

                    }

                } catch (error) {

                    console.error(
                        'Mark notifications as read error:',
                        error
                    );

                }

            }

        }
    );

    menu.addEventListener(
        'click',
        event =>
            event.stopPropagation()
    );

    document.addEventListener(
        'click',
        function () {

            menu.hidden = true;

        }
    );
}




function initializeNavigationProfileMenu() {

    const button =
        document.getElementById(
            'homeProfileMenuBtn'
        );

    const menu =
        document.getElementById(
            'homeProfileMenu'
        );


    if (!button || !menu) {
        return;
    }


    button.addEventListener(
        'click',
        function (event) {

            event.stopPropagation();

            menu.hidden =
                !menu.hidden;

        }
    );


    menu.addEventListener(
        'click',
        event =>
            event.stopPropagation()
    );


    document.addEventListener(
        'click',
        function () {

            menu.hidden = true;

        }
    );
}


// =====================================================
// התנתקות
// =====================================================

function initializeNavigationLogout() {

    const button =
        document.getElementById(
            'logoutBtn'
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        'click',
        async function () {

            try {

                const response =
                    await fetch(
                        '/api/logout',
                        {
                            method: 'POST'
                        }
                    );


                if (response.ok) {

                    window.location.href =
                        'index.html';

                    return;
                }


                alert(
                    'אירעה שגיאה בהתנתקות'
                );


            } catch (error) {

                console.error(
                    'Logout error:',
                    error
                );


                alert(
                    'לא ניתן להתחבר לשרת'
                );

            }

        }
    );
}


// =====================================================
// הפעלת הניווט
// =====================================================

async function initializeSharedNavigation() {

    createSharedNavigation();

    initializeNavigationSearch();
    initializeNotificationsMenu();
    initializeNavigationProfileMenu();
    initializeNavigationLogout();


    await Promise.all([

        loadNavigationCurrentUser(),

        loadNavigationUnreadMessages(),

        loadNavigationNotifications()

    ]);
}


initializeSharedNavigation();