const urlParams =
    new URLSearchParams(window.location.search);

const profileUserId =
    urlParams.get('userId');

const isOwnProfile =
    !profileUserId;


// הופך את זמן הפרסום לטקסט כמו "לפני 5 דקות"
function timeAgo(date) {
    const now = new Date();
    const created = new Date(date);

    const seconds =
        Math.floor(
            (now - created) / 1000
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

    if (days < 30) {
        return `לפני ${days} ימים`;
    }

    const months =
        Math.floor(days / 30);

    if (months < 12) {
        return `לפני ${months} חודשים`;
    }

    const years =
        Math.floor(months / 12);

    return `לפני ${years} שנים`;
}


async function loadProfile() {
    try {

        const response =
            profileUserId
                ? await fetch(
                    `/api/users/${profileUserId}`
                )
                : await fetch(
                    '/api/current-user'
                );

        if (!response.ok) {
            return;
        }

        const user =
            await response.json();


        const friendButton =
            document.getElementById(
                'profileFriendBtn'
            );

        if (friendButton) {

            if (isOwnProfile) {

                friendButton.style.display =
                    'none';

            } else {

                friendButton.style.display =
                    'inline-block';

                try {

                    const currentUserResponse =
                        await fetch(
                            '/api/current-user'
                        );

                    if (currentUserResponse.ok) {

                        const currentUser =
                            await currentUserResponse.json();


                        // בודק מה מצב החברות מול המשתמש בפרופיל
                        const alreadyFriends =
                            currentUser.friends?.some(
                                friendId =>
                                    friendId.toString() ===
                                    profileUserId
                            );

                        const requestAlreadySent =
                            currentUser.friendRequestsSent?.some(
                                friendId =>
                                    friendId.toString() ===
                                    profileUserId
                            );


                        if (alreadyFriends) {

                            friendButton.innerHTML = `
                                <i class="bi bi-person-dash-fill"></i>
                                הסר חבר
                            `;

                            friendButton.dataset.friendStatus =
                                'friend';

                            friendButton.disabled =
                                false;

                        } else if (requestAlreadySent) {

                            friendButton.innerHTML = `
                                <i class="bi bi-check-circle-fill"></i>
                                נשלחה בקשת חברות
                            `;

                            friendButton.dataset.friendStatus =
                                'request-sent';

                            friendButton.disabled =
                                false;

                        } else {

                            friendButton.innerHTML = `
                                <i class="bi bi-person-plus-fill"></i>
                                שלח בקשת חברות
                            `;

                            friendButton.dataset.friendStatus =
                                'not-friend';

                            friendButton.disabled =
                                false;
                        }
                    }

                } catch (error) {

                    console.error(
                        'Error checking friendship:',
                        error
                    );
                }
            }
        }


        const messageButton =
            document.getElementById(
                'profileMessageBtn'
            );

        if (messageButton) {

            if (isOwnProfile) {

                messageButton.style.display =
                    'none';

            } else {

                messageButton.style.display =
                    'inline-block';

                messageButton.onclick =
                    function () {

                        window.location.href =
                            `messages.html?userId=${profileUserId}`;
                    };
            }
        }


        if (!isOwnProfile) {

            const editProfileBtn =
                document.getElementById(
                    'editProfileBtn'
                );

            const editProfileImageBtn =
                document.getElementById(
                    'editProfileImageBtn'
                );

            const editCoverBtn =
                document.getElementById(
                    'editCoverBtn'
                );

            const createPostBox =
                document.getElementById(
                    'createProfilePostBtn'
                );


            if (editProfileBtn) {
                editProfileBtn.style.display =
                    'none';
            }

            if (editProfileImageBtn) {
                editProfileImageBtn.style.display =
                    'none';
            }

            if (editCoverBtn) {
                editCoverBtn.style.display =
                    'none';
            }

            if (createPostBox) {

                const card =
                    createPostBox.closest(
                        '.card'
                    );

                if (card) {
                    card.style.display =
                        'none';
                }
            }
        }


        const createPostProfileImage =
            document.getElementById(
                'createPostProfileImage'
            );

        if (
            createPostProfileImage &&
            user.profileImage
        ) {
            createPostProfileImage.src =
                user.profileImage;
        }


        const profileImage =
            document.getElementById(
                'profileImage'
            );

        if (
            profileImage &&
            user.profileImage
        ) {
            profileImage.src =
                user.profileImage;
        }


        const coverImage =
            document.getElementById(
                'coverImage'
            );

        if (
            coverImage &&
            user.coverImage
        ) {
            coverImage.src =
                user.coverImage;
        }


        const profileName =
            document.getElementById(
                'profileName'
            );

        if (profileName) {
            profileName.textContent =
                `${user.firstName || ''} ${user.lastName || ''}`;
        }


        const profileUsername =
            document.getElementById(
                'profileUsername'
            );

        if (profileUsername) {
            profileUsername.textContent =
                `@${user.username || ''}`;
        }


        const profileCity =
            document.getElementById(
                'profileCity'
            );

        if (profileCity) {
            profileCity.textContent =
                user.city || '';
        }


        const profileCitySide =
            document.getElementById(
                'profileCitySide'
            );

        if (profileCitySide) {
            profileCitySide.textContent =
                user.city || 'לא הוגדר';
        }


        const friendsCount =
            document.getElementById(
                'friendsCount'
            );

        if (friendsCount) {
            friendsCount.textContent =
                user.friends?.length || 0;
        }


        const birthdayElement =
            document.getElementById(
                'profileBirthday'
            );

        if (birthdayElement) {

            if (user.birthday) {

                const birthdayDate =
                    new Date(
                        user.birthday
                    );

                birthdayElement.textContent =
                    birthdayDate.toLocaleDateString(
                        'he-IL',
                        {
                            day: 'numeric',
                            month: 'long'
                        }
                    );

            } else {

                birthdayElement.textContent =
                    'לא הוגדר';
            }
        }


        const deleteAccountBtn =
            document.getElementById(
                'deleteAccountBtn'
            );

        if (deleteAccountBtn) {

            deleteAccountBtn.style.display =
                isOwnProfile
                    ? 'inline-block'
                    : 'none';
        }


    } catch (error) {

        console.error(
            'Error loading profile:',
            error
        );
    }
}


const profileFriendBtn =
    document.getElementById(
        'profileFriendBtn'
    );


if (profileFriendBtn) {

    profileFriendBtn.addEventListener(
        'click',
        async function () {

            if (!profileUserId) {
                return;
            }

            const status =
                this.dataset.friendStatus;


            try {

                if (status === 'request-sent') {

                    const response =
                        await fetch(
                            `/api/users/${profileUserId}/friend-request/cancel`,
                            {
                                method: 'DELETE'
                            }
                        );

                    const data =
                        await response.json();

                    if (!response.ok) {

                        alert(
                            data.message ||
                            'אירעה שגיאה בביטול הבקשה'
                        );

                        return;
                    }

                    this.innerHTML = `
                        <i class="bi bi-person-plus-fill"></i>
                        שלח בקשת חברות
                    `;

                    this.dataset.friendStatus =
                        'not-friend';

                    return;
                }


                if (status === 'friend') {

                    const response =
                        await fetch(
                            `/api/users/${profileUserId}/friend`,
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

                    this.innerHTML = `
                        <i class="bi bi-person-plus-fill"></i>
                        שלח בקשת חברות
                    `;

                    this.dataset.friendStatus =
                        'not-friend';

                    return;
                }


                const response =
                    await fetch(
                        `/api/users/${profileUserId}/friend`,
                        {
                            method: 'PUT'
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    alert(
                        data.message ||
                        'אירעה שגיאה בשליחת הבקשה'
                    );

                    return;
                }

                this.innerHTML = `
                    <i class="bi bi-check-circle-fill"></i>
                    נשלחה בקשת חברות
                `;

                this.dataset.friendStatus =
                    'request-sent';

                this.disabled =
                    false;


            } catch (error) {

                console.error(
                    'Friend button error:',
                    error
                );

                alert(
                    'לא ניתן להתחבר לשרת'
                );
            }
        }
    );
}


const editProfileBtn =
    document.getElementById(
        'editProfileBtn'
    );

if (editProfileBtn) {

    editProfileBtn.addEventListener(
        'click',
        async function () {

            try {

                const response =
                    await fetch(
                        '/api/current-user'
                    );

                if (!response.ok) {
                    return;
                }

                const user =
                    await response.json();


                const newFirstName =
                    prompt(
                        'שם פרטי:',
                        user.firstName || ''
                    );

                if (newFirstName === null) {
                    return;
                }


                const newLastName =
                    prompt(
                        'שם משפחה:',
                        user.lastName || ''
                    );

                if (newLastName === null) {
                    return;
                }


                const newCity =
                    prompt(
                        'עיר מגורים:',
                        user.city || ''
                    );

                if (newCity === null) {
                    return;
                }


                let currentBirthday =
                    '';

                if (user.birthday) {

                    currentBirthday =
                        new Date(user.birthday)
                            .toISOString()
                            .split('T')[0];
                }


                const newBirthday =
                    prompt(
                        'יום הולדת בפורמט YYYY-MM-DD:',
                        currentBirthday
                    );

                if (newBirthday === null) {
                    return;
                }


                const updateResponse =
                    await fetch(
                        '/api/profile',
                        {
                            method: 'PUT',

                            headers: {
                                'Content-Type':
                                    'application/json'
                            },

                            body:
                                JSON.stringify({
                                    firstName:
                                        newFirstName.trim(),

                                    lastName:
                                        newLastName.trim(),

                                    city:
                                        newCity.trim(),

                                    birthday:
                                        newBirthday
                                })
                        }
                    );


                const data =
                    await updateResponse.json();


                if (updateResponse.ok) {

                    alert(
                        'הפרופיל עודכן בהצלחה'
                    );

                    loadProfile();

                } else {

                    alert(
                        data.message ||
                        'אירעה שגיאה בעדכון הפרופיל'
                    );
                }


            } catch (error) {

                console.error(error);

                alert(
                    'לא ניתן להתחבר לשרת'
                );
            }
        }
    );
}


async function loadMyPosts() {
    try {

        const response =
            profileUserId
                ? await fetch(
                    `/api/users/${profileUserId}/posts`
                )
                : await fetch(
                    '/api/my-posts'
                );

        if (!response.ok) {
            return;
        }


        const posts =
            await response.json();

        const container =
            document.getElementById(
                'myPostsContainer'
            );

        container.innerHTML =
            '';


        posts.forEach(post => {

            const postElement =
                document.createElement(
                    'div'
                );

            postElement.className =
                'card mb-4';


            postElement.innerHTML = `
                <div class="card-body">

                    <div class="d-flex align-items-center gap-2 mb-3">

                        <img
                            src="${post.author?.profileImage || 'harel.jpg'}"
                            alt="Profile"
                            class="rounded-circle"
                            width="40"
                            height="40"
                            style="object-fit: cover;"
                        >

                        <div>

                            <strong>
                                ${post.author?.firstName || ''}
                                ${post.author?.lastName || ''}
                            </strong>

                            <div class="text-muted small">
                                ${timeAgo(post.createdAt)}
                            </div>

                        </div>

                    </div>

                    ${
                        post.group
                            ? `
                                <div class="text-muted small mb-2">
                                    <i class="bi bi-people-fill"></i>
                                    ${post.group.name}
                                </div>
                            `
                            : ''
                    }

                    ${
                        post.text
                            ? `
                                <p class="mb-3">
                                    ${post.text}
                                </p>
                            `
                            : ''
                    }

                    ${
                        post.image
                            ? `
                                <img
                                    src="${post.image}"
                                    alt="Post image"
                                    class="img-fluid rounded mb-3"
                                    style="
                                        width: 100%;
                                        max-height: 600px;
                                        object-fit: contain;
                                    "
                                >
                            `
                            : ''
                    }

                    ${
                        post.video
                            ? `
                                <video
                                    controls
                                    playsinline
                                    class="w-100 rounded mb-3"
                                    style="
                                        max-height: 600px;
                                        background: black;
                                    "
                                >
                                    <source src="${post.video}">
                                    הדפדפן שלך אינו תומך בהצגת סרטונים.
                                </video>
                            `
                            : ''
                    }

                    <hr class="my-2">

                    <div
                        class="d-flex justify-content-end align-items-center gap-4 pt-2 pe-2"
                        style="direction: ltr;"
                    >

                        <button
                            class="btn p-0 border-0 bg-transparent text-secondary d-flex align-items-center gap-1 like-profile-post-btn"
                            data-id="${post._id}"
                        >
                            <span>
                                ${post.likes?.length || 0}
                            </span>

                            <i class="bi bi-hand-thumbs-up fs-5"></i>
                        </button>


                        <button
                            class="btn p-0 border-0 bg-transparent text-secondary d-flex align-items-center gap-1 comment-profile-post-btn"
                            data-id="${post._id}"
                        >
                            <span class="profile-comment-count">
                                0
                            </span>

                            <i class="bi bi-chat fs-5"></i>
                        </button>


                        ${
                            isOwnProfile
                                ? `
                                    <button
                                        class="btn p-0 border-0 bg-transparent text-secondary delete-profile-post-btn"
                                        data-id="${post._id}"
                                    >
                                        <i class="bi bi-trash3 fs-5"></i>
                                    </button>
                                `
                                : ''
                        }

                    </div>


                    <div
                        class="profile-comments-section mt-3"
                        style="display: none;"
                    >

                        <div
                            class="profile-comments-list mb-2"
                        ></div>

                        <div class="d-flex gap-2">

                            <input
                                type="text"
                                class="form-control profile-comment-input"
                                placeholder="כתוב תגובה..."
                            >

                            <button
                                type="button"
                                class="btn btn-primary add-profile-comment-btn"
                                data-id="${post._id}"
                            >
                                <i class="bi bi-send"></i>
                            </button>

                        </div>

                    </div>

                </div>
            `;


            container.appendChild(
                postElement
            );

            setupProfilePostActions(
                postElement,
                post
            );
        });


    } catch (error) {

        console.error(
            'Error loading posts:',
            error
        );
    }
}


const editProfileImageButton =
    document.getElementById(
        'editProfileImageBtn'
    );

if (editProfileImageButton) {

    editProfileImageButton.addEventListener(
        'click',
        function () {

            const input =
                document.getElementById(
                    'profileImageInput'
                );

            if (input) {
                input.click();
            }
        }
    );
}


const editCoverButton =
    document.getElementById(
        'editCoverBtn'
    );

if (editCoverButton) {

    editCoverButton.addEventListener(
        'click',
        function () {

            const input =
                document.getElementById(
                    'coverImageInput'
                );

            if (input) {
                input.click();
            }
        }
    );
}


const profileImageUploadInput =
    document.getElementById(
        'profileImageInput'
    );

if (profileImageUploadInput) {

    profileImageUploadInput.addEventListener(
        'change',
        async function () {

            const file =
                this.files[0];

            if (!file) {
                return;
            }


            const formData =
                new FormData();

            formData.append(
                'profileImage',
                file
            );


            try {

                const response =
                    await fetch(
                        '/api/profile-image',
                        {
                            method: 'POST',
                            body: formData
                        }
                    );

                const data =
                    await response.json();


                if (response.ok) {

                    const profileImage =
                        document.getElementById(
                            'profileImage'
                        );

                    if (profileImage) {
                        profileImage.src =
                            data.profileImage;
                    }


                    const createPostProfileImage =
                        document.getElementById(
                            'createPostProfileImage'
                        );

                    if (createPostProfileImage) {
                        createPostProfileImage.src =
                            data.profileImage;
                    }


                    alert(
                        'תמונת הפרופיל עודכנה בהצלחה'
                    );

                } else {

                    alert(
                        data.message ||
                        'אירעה שגיאה בעדכון תמונת הפרופיל'
                    );
                }


            } catch (error) {

                console.error(error);

                alert(
                    'לא ניתן להתחבר לשרת'
                );
            }
        }
    );
}


const coverImageUploadInput =
    document.getElementById(
        'coverImageInput'
    );

if (coverImageUploadInput) {

    coverImageUploadInput.addEventListener(
        'change',
        async function () {

            const file =
                this.files[0];

            if (!file) {
                return;
            }


            const formData =
                new FormData();

            formData.append(
                'coverImage',
                file
            );


            try {

                const response =
                    await fetch(
                        '/api/cover-image',
                        {
                            method: 'POST',
                            body: formData
                        }
                    );

                const data =
                    await response.json();


                if (response.ok) {

                    const coverImage =
                        document.getElementById(
                            'coverImage'
                        );

                    if (coverImage) {
                        coverImage.src =
                            data.coverImage;
                    }

                    alert(
                        'תמונת הנושא עודכנה בהצלחה'
                    );

                } else {

                    alert(
                        data.message ||
                        'אירעה שגיאה בעדכון תמונת הנושא'
                    );
                }


            } catch (error) {

                console.error(error);

                alert(
                    'לא ניתן להתחבר לשרת'
                );
            }
        }
    );
}

const friendsTabElement =
    document.getElementById(
        'friendsTab'
    );

if (friendsTabElement) {

    friendsTabElement.addEventListener(
        'click',
        async function () {

            const postsTab =
                document.getElementById(
                    'postsTab'
                );

            const friendsTab =
                document.getElementById(
                    'friendsTab'
                );

            const groupsTab =
                document.getElementById(
                    'groupsTab'
                );

            const sectionTitle =
                document.getElementById(
                    'profileSectionTitle'
                );


            postsTab.classList.remove(
                'active'
            );

            groupsTab.classList.remove(
                'active'
            );

            friendsTab.classList.add(
                'active'
            );


            sectionTitle.textContent =
                isOwnProfile
                    ? 'החברים שלי'
                    : 'חברים';


            const postsContainer =
                document.getElementById(
                    'myPostsContainer'
                );

            const friendsContainer =
                document.getElementById(
                    'profileFriendsContainer'
                );

            const groupsContainer =
                document.getElementById(
                    'profileGroupsContainer'
                );


            postsContainer.style.display =
                'none';

            groupsContainer.style.display =
                'none';

            friendsContainer.style.display =
                'block';


            try {

                const currentUserResponse =
                    await fetch(
                        '/api/current-user'
                    );

                if (!currentUserResponse.ok) {
                    return;
                }


                const loggedInUser =
                    await currentUserResponse.json();


                const response =
                    profileUserId
                        ? await fetch(
                            `/api/users/${profileUserId}/friends`
                        )
                        : await fetch(
                            '/api/my-friends'
                        );


                if (!response.ok) {
                    return;
                }


                const friends =
                    await response.json();

                friendsContainer.innerHTML =
                    '';


                if (friends.length === 0) {

                    friendsContainer.innerHTML = `
                        <div class="text-muted">
                            עדיין אין חברים להצגה
                        </div>
                    `;

                    return;
                }


                friends.forEach(friend => {

                    const friendElement =
                        document.createElement(
                            'div'
                        );

                    friendElement.className =
                        'd-flex justify-content-between align-items-center border-bottom py-3';


                    // בודק איזה כפתור להציג ליד כל חבר
                    const isMe =
                        loggedInUser._id?.toString() ===
                        friend._id?.toString();


                    const isMyFriend =
                        loggedInUser.friends?.some(
                            friendId =>
                                friendId.toString() ===
                                friend._id.toString()
                        );


                    const requestSent =
                        loggedInUser.friendRequestsSent?.some(
                            requestId =>
                                requestId.toString() ===
                                friend._id.toString()
                        );


                    let actionButton =
                        '';


                    if (!isMe) {

                        if (isMyFriend) {

                            actionButton = `
                                <button
                                    class="btn btn-outline-danger btn-sm remove-profile-friend-btn"
                                    data-id="${friend._id}"
                                >
                                    <i class="bi bi-person-dash"></i>
                                    הסר חבר
                                </button>
                            `;

                        } else if (requestSent) {

                            actionButton = `
                                <button
                                    class="btn btn-secondary btn-sm cancel-profile-request-btn"
                                    data-id="${friend._id}"
                                    title="לחץ לביטול בקשת החברות"
                                >
                                    <i class="bi bi-check-circle-fill"></i>
                                    נשלחה בקשת חברות
                                </button>
                            `;

                        } else {

                            actionButton = `
                                <button
                                    class="btn btn-primary btn-sm send-profile-request-btn"
                                    data-id="${friend._id}"
                                >
                                    <i class="bi bi-person-plus"></i>
                                    שלח בקשת חברות
                                </button>
                            `;
                        }
                    }


                    friendElement.innerHTML = `

                        <a
                            href="profile.html?userId=${friend._id}"
                            class="d-flex align-items-center gap-3 text-decoration-none text-dark"
                        >

                            <img
                                src="${friend.profileImage || 'harel.jpg'}"
                                alt="Profile"
                                class="rounded-circle"
                                width="55"
                                height="55"
                                style="object-fit: cover;"
                            >

                            <div>

                                <strong>
                                    ${friend.firstName || ''}
                                    ${friend.lastName || ''}
                                </strong>

                                <div class="text-muted small">
                                    @${friend.username || ''}
                                </div>

                                <div class="text-muted small">
                                    ${friend.city || ''}
                                </div>

                            </div>

                        </a>

                        ${actionButton}
                    `;


                    friendsContainer.appendChild(
                        friendElement
                    );


                    const sendButton =
                        friendElement.querySelector(
                            '.send-profile-request-btn'
                        );


                    if (sendButton) {

                        sendButton.addEventListener(
                            'click',
                            async function () {

                                const friendId =
                                    this.dataset.id;


                                try {

                                    const response =
                                        await fetch(
                                            `/api/users/${friendId}/friend`,
                                            {
                                                method: 'PUT'
                                            }
                                        );


                                    const data =
                                        await response.json();


                                    if (!response.ok) {

                                        alert(
                                            data.message ||
                                            'אירעה שגיאה בשליחת בקשת החברות'
                                        );

                                        return;
                                    }


                                    friendsTab.click();


                                } catch (error) {

                                    console.error(
                                        error
                                    );

                                    alert(
                                        'לא ניתן להתחבר לשרת'
                                    );
                                }
                            }
                        );
                    }


                    const cancelButton =
                        friendElement.querySelector(
                            '.cancel-profile-request-btn'
                        );


                    if (cancelButton) {

                        cancelButton.addEventListener(
                            'click',
                            async function () {

                                const friendId =
                                    this.dataset.id;


                                try {

                                    const response =
                                        await fetch(
                                            `/api/users/${friendId}/friend-request/cancel`,
                                            {
                                                method: 'DELETE'
                                            }
                                        );


                                    const data =
                                        await response.json();


                                    if (!response.ok) {

                                        alert(
                                            data.message ||
                                            'אירעה שגיאה בביטול בקשת החברות'
                                        );

                                        return;
                                    }


                                    friendsTab.click();


                                } catch (error) {

                                    console.error(
                                        error
                                    );

                                    alert(
                                        'לא ניתן להתחבר לשרת'
                                    );
                                }
                            }
                        );
                    }


                    const removeButton =
                        friendElement.querySelector(
                            '.remove-profile-friend-btn'
                        );


                    if (removeButton) {

                        removeButton.addEventListener(
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


                                    friendsTab.click();


                                } catch (error) {

                                    console.error(
                                        error
                                    );

                                    alert(
                                        'לא ניתן להתחבר לשרת'
                                    );
                                }
                            }
                        );
                    }
                });


            } catch (error) {

                console.error(
                    'Error loading friends:',
                    error
                );
            }
        }
    );
}


const postsTabElement =
    document.getElementById(
        'postsTab'
    );

if (postsTabElement) {

    postsTabElement.addEventListener(
        'click',
        function () {

            const postsTab =
                document.getElementById(
                    'postsTab'
                );

            const friendsTab =
                document.getElementById(
                    'friendsTab'
                );

            const groupsTab =
                document.getElementById(
                    'groupsTab'
                );

            const sectionTitle =
                document.getElementById(
                    'profileSectionTitle'
                );


            postsTab.classList.add(
                'active'
            );

            friendsTab.classList.remove(
                'active'
            );

            groupsTab.classList.remove(
                'active'
            );


            sectionTitle.textContent =
                isOwnProfile
                    ? 'הפוסטים שלי'
                    : 'פוסטים';


            document.getElementById(
                'myPostsContainer'
            ).style.display =
                'block';

            document.getElementById(
                'profileFriendsContainer'
            ).style.display =
                'none';

            document.getElementById(
                'profileGroupsContainer'
            ).style.display =
                'none';
        }
    );
}


const groupsTabElement =
    document.getElementById(
        'groupsTab'
    );

if (groupsTabElement) {

    groupsTabElement.addEventListener(
        'click',
        async function () {

            const postsTab =
                document.getElementById(
                    'postsTab'
                );

            const friendsTab =
                document.getElementById(
                    'friendsTab'
                );

            const groupsTab =
                document.getElementById(
                    'groupsTab'
                );

            const sectionTitle =
                document.getElementById(
                    'profileSectionTitle'
                );


            postsTab.classList.remove(
                'active'
            );

            friendsTab.classList.remove(
                'active'
            );

            groupsTab.classList.add(
                'active'
            );


            sectionTitle.textContent =
                isOwnProfile
                    ? 'הקבוצות שלי'
                    : 'קבוצות';


            document.getElementById(
                'myPostsContainer'
            ).style.display =
                'none';

            document.getElementById(
                'profileFriendsContainer'
            ).style.display =
                'none';

            document.getElementById(
                'profileGroupsContainer'
            ).style.display =
                'block';


            try {

                const response =
                    profileUserId
                        ? await fetch(
                            `/api/users/${profileUserId}/groups`
                        )
                        : await fetch(
                            '/api/my-groups'
                        );


                if (!response.ok) {
                    return;
                }


                const groups =
                    await response.json();


                const groupsContainer =
                    document.getElementById(
                        'profileGroupsContainer'
                    );


                groupsContainer.innerHTML =
                    '';


                if (groups.length === 0) {

                    groupsContainer.innerHTML = `
                        <div class="text-muted">
                            עדיין אין קבוצות להצגה
                        </div>
                    `;

                    return;
                }


                groups.forEach(group => {

                    const groupElement =
                        document.createElement(
                            'div'
                        );


                    groupElement.className =
                        'border-bottom py-3';


                    groupElement.innerHTML = `
                        <a
                            href="group.html?groupId=${group._id}"
                            class="d-flex align-items-center gap-3 text-decoration-none text-dark"
                        >

                            <img
                                src="${group.image || 'harel.jpg'}"
                                alt="Group"
                                class="rounded-circle border"
                                width="60"
                                height="60"
                                style="object-fit: cover;"
                            >

                            <div>

                                <strong>
                                    ${group.name}
                                </strong>

                                <div class="text-muted small mt-1">
                                    ${group.description || ''}
                                </div>

                                <div class="text-muted small mt-1">
                                    <i class="bi bi-people-fill"></i>
                                    ${group.members?.length || 0} חברים
                                </div>

                            </div>

                        </a>
                    `;


                    groupsContainer.appendChild(
                        groupElement
                    );
                });


            } catch (error) {

                console.error(
                    'Error loading groups:',
                    error
                );
            }
        }
    );
}


// מטפל בלייקים, תגובות ומחיקת פוסטים בפרופיל
async function setupProfilePostActions(
    postElement,
    post
) {

    const likeButton =
        postElement.querySelector(
            '.like-profile-post-btn'
        );

    const commentButton =
        postElement.querySelector(
            '.comment-profile-post-btn'
        );

    const deleteButton =
        postElement.querySelector(
            '.delete-profile-post-btn'
        );

    const commentsSection =
        postElement.querySelector(
            '.profile-comments-section'
        );

    const commentsList =
        postElement.querySelector(
            '.profile-comments-list'
        );

    const commentCount =
        postElement.querySelector(
            '.profile-comment-count'
        );

    const commentInput =
        postElement.querySelector(
            '.profile-comment-input'
        );

    const addCommentButton =
        postElement.querySelector(
            '.add-profile-comment-btn'
        );


    async function loadProfileComments() {
        try {

            const response =
                await fetch(
                    `/api/posts/${post._id}/comments`
                );

            if (!response.ok) {
                return;
            }


            const comments =
                await response.json();


            commentsList.innerHTML =
                '';

            commentCount.textContent =
                comments.length;


            comments.forEach(comment => {

                const commentElement =
                    document.createElement(
                        'div'
                    );

                commentElement.className =
                    'bg-light rounded p-2 mb-2';


                commentElement.innerHTML = `
                    <div>

                        <strong>
                            ${comment.author?.firstName || ''}
                            ${comment.author?.lastName || ''}
                        </strong>

                        <span class="text-muted small me-2">
                            ${timeAgo(comment.createdAt)}
                        </span>

                    </div>

                    <div>
                        ${comment.text}
                    </div>
                `;


                commentsList.appendChild(
                    commentElement
                );
            });


        } catch (error) {

            console.error(
                'Error loading comments:',
                error
            );
        }
    }


    if (likeButton) {

        likeButton.addEventListener(
            'click',
            async function () {

                try {

                    const response =
                        await fetch(
                            `/api/posts/${post._id}/like`,
                            {
                                method: 'PUT'
                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {

                        const likeCount =
                            likeButton.querySelector(
                                'span'
                            );


                        if (likeCount) {

                            likeCount.textContent =
                                data.likesCount ??
                                data.likes?.length ??
                                0;
                        }

                    } else {

                        alert(
                            data.message ||
                            'אירעה שגיאה בעדכון הלייק'
                        );
                    }


                } catch (error) {

                    console.error(
                        error
                    );

                    alert(
                        'לא ניתן להתחבר לשרת'
                    );
                }
            }
        );
    }


    if (commentButton) {

        commentButton.addEventListener(
            'click',
            async function () {

                if (
                    commentsSection.style.display ===
                    'none'
                ) {

                    commentsSection.style.display =
                        'block';

                    await loadProfileComments();

                } else {

                    commentsSection.style.display =
                        'none';
                }
            }
        );
    }


    if (addCommentButton) {

        addCommentButton.addEventListener(
            'click',
            async function () {

                const text =
                    commentInput.value.trim();


                if (text === '') {

                    alert(
                        'יש לכתוב תגובה'
                    );

                    return;
                }


                try {

                    const response =
                        await fetch(
                            `/api/posts/${post._id}/comments`,
                            {
                                method: 'POST',

                                headers: {
                                    'Content-Type':
                                        'application/json'
                                },

                                body:
                                    JSON.stringify({
                                        text: text
                                    })
                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {

                        commentInput.value =
                            '';

                        await loadProfileComments();

                    } else {

                        alert(
                            data.message ||
                            'אירעה שגיאה בהוספת התגובה'
                        );
                    }


                } catch (error) {

                    console.error(
                        error
                    );

                    alert(
                        'לא ניתן להתחבר לשרת'
                    );
                }
            }
        );
    }


    if (deleteButton) {

        deleteButton.addEventListener(
            'click',
            async function () {

                try {

                    const response =
                        await fetch(
                            `/api/posts/${post._id}`,
                            {
                                method: 'DELETE'
                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {

                        await loadMyPosts();

                    } else {

                        alert(
                            data.message ||
                            'אירעה שגיאה במחיקת הפוסט'
                        );
                    }


                } catch (error) {

                    console.error(
                        error
                    );

                    alert(
                        'לא ניתן להתחבר לשרת'
                    );
                }
            }
        );
    }
}


const createProfilePostBtn =
    document.getElementById(
        'createProfilePostBtn'
    );

if (createProfilePostBtn) {

    createProfilePostBtn.addEventListener(
        'click',
        async function () {

            const postText =
                document.getElementById(
                    'profilePostInput'
                ).value.trim();


            const imageInput =
                document.getElementById(
                    'profilePostImageInput'
                );

            const videoInput =
                document.getElementById(
                    'profileVideoInput'
                );


            const imageFile =
                imageInput?.files[0];

            const videoFile =
                videoInput?.files[0];


            if (
                postText === '' &&
                !imageFile &&
                !videoFile
            ) {

                alert(
                    'יש לכתוב תוכן, לבחור תמונה או לבחור סרטון'
                );

                return;
            }


            // שולח את הפוסט יחד עם תמונה או סרטון אם נבחרו
            const formData =
                new FormData();


            formData.append(
                'text',
                postText
            );

            formData.append(
                'group',
                'null'
            );


            if (imageFile) {

                formData.append(
                    'media',
                    imageFile
                );
            }


            if (videoFile) {

                formData.append(
                    'media',
                    videoFile
                );
            }


            try {

                const response =
                    await fetch(
                        '/api/posts',
                        {
                            method: 'POST',
                            body: formData
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    document.getElementById(
                        'profilePostInput'
                    ).value = '';


                    if (imageInput) {
                        imageInput.value =
                            '';
                    }


                    if (videoInput) {
                        videoInput.value =
                            '';
                    }


                    const selectedFile =
                        document.getElementById(
                            'profileSelectedFile'
                        );


                    if (selectedFile) {

                        selectedFile.textContent =
                            '';
                    }


                    const feelingsMenu =
                        document.getElementById(
                            'profileFeelingsMenu'
                        );


                    if (feelingsMenu) {

                        feelingsMenu.style.display =
                            'none';
                    }


                    await loadMyPosts();


                    alert(
                        'הפוסט פורסם בהצלחה'
                    );


                } else {

                    alert(
                        data.message ||
                        'אירעה שגיאה בפרסום הפוסט'
                    );
                }


            } catch (error) {

                console.error(
                    'Error creating profile post:',
                    error
                );

                alert(
                    'לא ניתן להתחבר לשרת'
                );
            }
        }
    );
}


const profileImageBtn =
    document.getElementById(
        'profileImageBtn'
    );

const profileVideoBtn =
    document.getElementById(
        'profileVideoBtn'
    );

const profileFeelingBtn =
    document.getElementById(
        'profileFeelingBtn'
    );

const profilePostImageInput =
    document.getElementById(
        'profilePostImageInput'
    );

const profileVideoInput =
    document.getElementById(
        'profileVideoInput'
    );

const profileFeelingsMenu =
    document.getElementById(
        'profileFeelingsMenu'
    );

const profileSelectedFile =
    document.getElementById(
        'profileSelectedFile'
    );

const profilePostInput =
    document.getElementById(
        'profilePostInput'
    );


if (
    profileImageBtn &&
    profilePostImageInput
) {

    profileImageBtn.addEventListener(
        'click',
        function () {

            profilePostImageInput.click();
        }
    );
}


if (
    profileVideoBtn &&
    profileVideoInput
) {

    profileVideoBtn.addEventListener(
        'click',
        function () {

            profileVideoInput.click();
        }
    );
}


if (profilePostImageInput) {

    profilePostImageInput.addEventListener(
        'change',
        function () {

            const file =
                this.files[0];


            if (!file) {
                return;
            }


            if (profileVideoInput) {

                profileVideoInput.value =
                    '';
            }


            if (profileSelectedFile) {

                profileSelectedFile.textContent =
                    `נבחרה תמונה: ${file.name}`;
            }
        }
    );
}


if (profileVideoInput) {

    profileVideoInput.addEventListener(
        'change',
        function () {

            const file =
                this.files[0];


            if (!file) {
                return;
            }


            if (profilePostImageInput) {

                profilePostImageInput.value =
                    '';
            }


            if (profileSelectedFile) {

                profileSelectedFile.textContent =
                    `נבחר סרטון: ${file.name}`;
            }
        }
    );
}


if (
    profileFeelingBtn &&
    profileFeelingsMenu
) {

    profileFeelingBtn.addEventListener(
        'click',
        function () {

            if (
                profileFeelingsMenu.style.display ===
                'none'
            ) {

                profileFeelingsMenu.style.display =
                    'block';

            } else {

                profileFeelingsMenu.style.display =
                    'none';
            }
        }
    );
}


document
    .querySelectorAll(
        '.profile-feeling-option'
    )
    .forEach(button => {

        button.addEventListener(
            'click',
            function () {

                const feeling =
                    this.dataset.feeling;


                if (profilePostInput) {

                    const currentText =
                        profilePostInput.value.trim();


                    if (currentText) {

                        profilePostInput.value =
                            `${currentText} — מרגיש ${feeling}`;

                    } else {

                        profilePostInput.value =
                            `מרגיש ${feeling}`;
                    }
                }


                if (profileFeelingsMenu) {

                    profileFeelingsMenu.style.display =
                        'none';
                }
            }
        );
    });


const deleteAccountBtn =
    document.getElementById(
        'deleteAccountBtn'
    );


if (deleteAccountBtn) {

    deleteAccountBtn.addEventListener(
        'click',
        async function () {

            const confirmed =
                confirm(
                    'האם אתה בטוח שברצונך למחוק את החשבון? פעולה זו אינה ניתנת לביטול.'
                );


            if (!confirmed) {
                return;
            }


            try {

                const response =
                    await fetch(
                        '/api/users/me',
                        {
                            method: 'DELETE'
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        'אירעה שגיאה במחיקת החשבון'
                    );

                    return;
                }


                alert(
                    'החשבון נמחק בהצלחה'
                );


                window.location.href =
                    'index.html';


            } catch (error) {

                console.error(
                    'DELETE ACCOUNT ERROR:',
                    error
                );


                alert(
                    'לא ניתן להתחבר לשרת'
                );
            }
        }
    );
}


async function initializeProfile() {

    await loadProfile();

    loadMyPosts();
}


initializeProfile();