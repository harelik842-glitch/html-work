const urlParams = new URLSearchParams(window.location.search);
const profileUserId = urlParams.get('userId');
const isOwnProfile = !profileUserId;

function timeAgo(date) {
    const now = new Date();
    const created = new Date(date);

    const seconds = Math.floor((now - created) / 1000);

    if (seconds < 60) {
        return 'עכשיו';
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
        return `לפני ${minutes} דקות`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `לפני ${hours} שעות`;
    }

    const days = Math.floor(hours / 24);

    if (days < 30) {
        return `לפני ${days} ימים`;
    }

    const months = Math.floor(days / 30);

    if (months < 12) {
        return `לפני ${months} חודשים`;
    }

    const years = Math.floor(months / 12);

    return `לפני ${years} שנים`;
}

async function loadProfile() {
    try {
const response = profileUserId
    ? await fetch(`/api/users/${profileUserId}`)
    : await fetch('/api/current-user');
        if (!response.ok) {
            return;
        }

        const user = await response.json();


const friendButton =
    document.getElementById('profileFriendBtn');

if (friendButton) {
    if (isOwnProfile) {
        friendButton.style.display = 'none';
    } else {
        friendButton.style.display = 'inline-block';

        try {
            const currentUserResponse =
                await fetch('/api/current-user');

            if (currentUserResponse.ok) {
                const currentUser =
                    await currentUserResponse.json();

                const alreadyFriends =
                    currentUser.friends?.some(
                        friendId =>
                            friendId.toString() === profileUserId
                    );

                if (alreadyFriends) {
                    friendButton.innerHTML = `
                        <i class="bi bi-person-dash-fill"></i>
                        הסר חבר
                    `;

                    friendButton.dataset.friendStatus = 'friend';
                } else {
                    friendButton.innerHTML = `
                        <i class="bi bi-person-plus-fill"></i>
                        הוסף חבר
                    `;

                    friendButton.dataset.friendStatus = 'not-friend';
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
const messageButton = document.getElementById('profileMessageBtn');

if (messageButton) {
    if (isOwnProfile) {
        messageButton.style.display = 'none';
    } else {
        messageButton.style.display = 'inline-block';

        messageButton.onclick = function () {
            window.location.href = `messages.html?userId=${profileUserId}`;
        };
    }
}

        if (!isOwnProfile) {
    const editProfileBtn =
        document.getElementById('editProfileBtn');

    const editProfileImageBtn =
        document.getElementById('editProfileImageBtn');

    const editCoverBtn =
        document.getElementById('editCoverBtn');

    const createPostBox =
        document.getElementById('createProfilePostBtn');

    if (editProfileBtn) {
        editProfileBtn.style.display = 'none';
    }

    if (editProfileImageBtn) {
        editProfileImageBtn.style.display = 'none';
    }

    if (editCoverBtn) {
        editCoverBtn.style.display = 'none';
    }

    if (createPostBox) {
        createPostBox.closest('.card').style.display = 'none';
    }
}
        const createPostProfileImage =
    document.getElementById('createPostProfileImage');

if (createPostProfileImage && user.profileImage) {
    createPostProfileImage.src = user.profileImage;
}

        const profileImage =
            document.getElementById('profileImage');

        if (profileImage && user.profileImage) {
            profileImage.src = user.profileImage;
        }

        const coverImage =
            document.getElementById('coverImage');

        if (coverImage && user.coverImage) {
            coverImage.src = user.coverImage;
        }

        const profileName =
            document.getElementById('profileName');

        if (profileName) {
            profileName.textContent =
                `${user.firstName || ''} ${user.lastName || ''}`;
        }

        const profileUsername =
            document.getElementById('profileUsername');

        if (profileUsername) {
            profileUsername.textContent =
                `@${user.username || ''}`;
        }

        const profileCity =
            document.getElementById('profileCity');

        if (profileCity) {
            profileCity.textContent =
                user.city || '';
        }

        const profileCitySide =
            document.getElementById('profileCitySide');

        if (profileCitySide) {
            profileCitySide.textContent =
                user.city || 'לא הוגדר';
        }

        const friendsCount =
            document.getElementById('friendsCount');

        if (friendsCount) {
            friendsCount.textContent =
                user.friends?.length || 0;
        }

        const birthdayElement =
            document.getElementById('profileBirthday');

        if (birthdayElement) {
            if (user.birthday) {
                const birthdayDate =
                    new Date(user.birthday);

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

    } catch (error) {
        console.error(
            'Error loading profile:',
            error
        );
    }
}


const profileFriendBtn = document.getElementById('profileFriendBtn');

if (profileFriendBtn) {
    profileFriendBtn.addEventListener('click', async function () {
        if (!profileUserId) {
            return;
        }

        const isFriend =
            this.dataset.friendStatus === 'friend';

        const method = isFriend ? 'DELETE' : 'PUT';

        try {
            const response = await fetch(
                `/api/users/${profileUserId}/friend`,
                {
                    method: method
                }
            );

            const data = await response.json();

            if (response.ok) {
                await loadProfile();
            } else {
                alert(
                    data.message ||
                    'אירעה שגיאה בעדכון החברות'
                );
            }

        } catch (error) {
            console.error(error);
            alert('לא ניתן להתחבר לשרת');
        }
    });
}
    

document.getElementById('editProfileBtn').addEventListener('click', async function () {
    try {
        const response = await fetch('/api/current-user');

        if (!response.ok) {
            return;
        }

        const user = await response.json();

        const newFirstName = prompt(
            'שם פרטי:',
            user.firstName || ''
        );

        if (newFirstName === null) {
            return;
        }

        const newLastName = prompt(
            'שם משפחה:',
            user.lastName || ''
        );

        if (newLastName === null) {
            return;
        }

        const newCity = prompt(
            'עיר מגורים:',
            user.city || ''
        );

        if (newCity === null) {
            return;
        }

        let currentBirthday = '';

        if (user.birthday) {
            currentBirthday = new Date(user.birthday)
                .toISOString()
                .split('T')[0];
        }

        const newBirthday = prompt(
            'יום הולדת בפורמט YYYY-MM-DD:',
            currentBirthday
        );

        if (newBirthday === null) {
            return;
        }

        const updateResponse = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: newFirstName.trim(),
                lastName: newLastName.trim(),
                city: newCity.trim(),
                birthday: newBirthday
            })
        });

        const data = await updateResponse.json();

        if (updateResponse.ok) {
            alert('הפרופיל עודכן בהצלחה');
            loadProfile();
        } else {
            alert(
                data.message ||
                'אירעה שגיאה בעדכון הפרופיל'
            );
        }

    } catch (error) {
        console.error(error);
        alert('לא ניתן להתחבר לשרת');
    }
});


async function loadMyPosts() {
    try {
        const response = profileUserId
            ? await fetch(`/api/users/${profileUserId}/posts`)
            : await fetch('/api/my-posts');

        if (!response.ok) {
            return;
        }

        const posts = await response.json();
        const container = document.getElementById('myPostsContainer');

        container.innerHTML = '';

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'card mb-4';

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

                    ${post.group ? `
                        <div class="text-muted small mb-2">
                            <i class="bi bi-people-fill"></i>
                            ${post.group.name}
                        </div>
                    ` : ''}

                    ${post.text ? `
                        <p class="mb-3">
                            ${post.text}
                        </p>
                    ` : ''}

                    ${post.image ? `
                        <img
                            src="${post.image}"
                            alt="Post image"
                            class="img-fluid rounded mb-3"
                            style="width: 100%; max-height: 600px; object-fit: contain;"
                        >
                    ` : ''}

                    ${post.video ? `
                        <video
                            controls
                            playsinline
                            class="w-100 rounded mb-3"
                            style="max-height: 600px; background: black;"
                        >
                            <source src="${post.video}">
                            הדפדפן שלך אינו תומך בהצגת סרטונים.
                        </video>
                    ` : ''}

                    <hr class="my-2">

                    <div class="d-flex justify-content-end align-items-center gap-4 pt-2 pe-2" style="direction: ltr;">

                        <button
                            class="btn p-0 border-0 bg-transparent text-secondary d-flex align-items-center gap-1 like-profile-post-btn"
                            data-id="${post._id}"
                        >
                            <span>${post.likes?.length || 0}</span>
                            <i class="bi bi-hand-thumbs-up fs-5"></i>
                        </button>

                        <button
                            class="btn p-0 border-0 bg-transparent text-secondary d-flex align-items-center gap-1 comment-profile-post-btn"
                            data-id="${post._id}"
                        >
                            <span class="profile-comment-count">0</span>
                            <i class="bi bi-chat fs-5"></i>
                        </button>

                        ${isOwnProfile ? `
                            <button
                                class="btn p-0 border-0 bg-transparent text-secondary delete-profile-post-btn"
                                data-id="${post._id}"
                            >
                                <i class="bi bi-trash3 fs-5"></i>
                            </button>
                        ` : ''}

                    </div>

                    <div class="profile-comments-section mt-3" style="display: none;">

                        <div class="profile-comments-list mb-2"></div>

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

            container.appendChild(postElement);
            setupProfilePostActions(postElement, post);
        });

    } catch (error) {
        console.error('Error loading posts:', error);
    }
}


document.getElementById('editCoverBtn').addEventListener('click', function () {
    document.getElementById('coverImageInput').click();
});


document.getElementById('profileImageInput').addEventListener('change', function () {
    const file = this.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = async function (event) {
        const imageData = event.target.result;

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    profileImage: imageData
                })
            });

            const data = await response.json();

            if (response.ok) {
                document.getElementById('profileImage').src = imageData;
                alert('תמונת הפרופיל עודכנה בהצלחה');
            } else {
                alert(data.message || 'אירעה שגיאה בעדכון התמונה');
            }

        } catch (error) {
            console.error(error);
            alert('לא ניתן להתחבר לשרת');
        }
    };

    reader.readAsDataURL(file);
});


document.getElementById('coverImageInput').addEventListener('change', async function () {
    const file = this.files[0];

    if (!file) {
        return;
    }

    const formData = new FormData();
    formData.append('coverImage', file);

    try {
        const response = await fetch('/api/cover-image', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('coverImage').src = data.coverImage;
            alert('תמונת הנושא עודכנה בהצלחה');
        } else {
            alert(data.message || 'אירעה שגיאה בעדכון תמונת הנושא');
        }

    } catch (error) {
        console.error(error);
        alert('לא ניתן להתחבר לשרת');
    }
});

document.getElementById('editCoverBtn').addEventListener('click', function () {
    document.getElementById('coverImageInput').click();
});

document.getElementById('profileImageInput').addEventListener('change', async function () {
    const file = this.files[0];

    if (!file) {
        return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
        const response = await fetch('/api/profile-image', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('profileImage').src = data.profileImage;

            const createPostProfileImage =
                document.getElementById('createPostProfileImage');

            if (createPostProfileImage) {
                createPostProfileImage.src = data.profileImage;
            }

            alert('תמונת הפרופיל עודכנה בהצלחה');

        } else {
            alert(
                data.message ||
                'אירעה שגיאה בעדכון תמונת הפרופיל'
            );
        }

    } catch (error) {
        console.error(error);
        alert('לא ניתן להתחבר לשרת');
    }
});


document.getElementById('coverImageInput').addEventListener('change', async function () {
    const file = this.files[0];

    if (!file) {
        return;
    }

    const formData = new FormData();
    formData.append('coverImage', file);

    try {
        const response = await fetch('/api/cover-image', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('coverImage').src =
                data.coverImage;

            alert('תמונת הנושא עודכנה בהצלחה');

        } else {
            alert(
                data.message ||
                'אירעה שגיאה בעדכון תמונת הנושא'
            );
        }

    } catch (error) {
        console.error(error);
        alert('לא ניתן להתחבר לשרת');
    }
});


document.getElementById('friendsTab').addEventListener('click', async function () {
    const postsTab = document.getElementById('postsTab');
    const friendsTab = document.getElementById('friendsTab');
    const groupsTab = document.getElementById('groupsTab');
    const sectionTitle = document.getElementById('profileSectionTitle');

    postsTab.classList.remove('active');
    groupsTab.classList.remove('active');
    friendsTab.classList.add('active');

    sectionTitle.textContent = 'החברים שלי';

    const postsContainer = document.getElementById('myPostsContainer');
    const friendsContainer = document.getElementById('profileFriendsContainer');
    const groupsContainer = document.getElementById('profileGroupsContainer');

    postsContainer.style.display = 'none';
    groupsContainer.style.display = 'none';
    friendsContainer.style.display = 'block';

    try {
        const response = profileUserId
            ? await fetch(`/api/users/${profileUserId}/friends`)
            : await fetch('/api/my-friends');

        if (!response.ok) {
            return;
        }

        const friends = await response.json();

        friendsContainer.innerHTML = '';

        if (friends.length === 0) {
            friendsContainer.innerHTML = `
                <div class="text-muted">
                    עדיין אין חברים להצגה
                </div>
            `;
            return;
        }

        friends.forEach(friend => {
            const friendElement = document.createElement('div');

            friendElement.className =
                'd-flex justify-content-between align-items-center border-bottom py-3';

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

                ${isOwnProfile ? `
                    <button
                        class="btn btn-outline-danger btn-sm remove-profile-friend-btn"
                        data-id="${friend._id}">
                        <i class="bi bi-person-dash"></i>
                        הסר חבר
                    </button>
                ` : ''}
            `;

            friendsContainer.appendChild(friendElement);

            const removeButton =
                friendElement.querySelector('.remove-profile-friend-btn');

            if (removeButton) {
                removeButton.addEventListener('click', async function () {
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
                            friendElement.remove();

                            const friendsCount =
                                document.getElementById('friendsCount');

                            if (friendsCount) {
                                const currentCount =
                                    parseInt(friendsCount.textContent) || 0;

                                friendsCount.textContent =
                                    Math.max(0, currentCount - 1);
                            }

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
            }
        });

    } catch (error) {
        console.error('Error loading friends:', error);
    }
});

document.getElementById('postsTab').addEventListener('click', function () {
    const postsTab = document.getElementById('postsTab');
    const friendsTab = document.getElementById('friendsTab');
    const sectionTitle = document.getElementById('profileSectionTitle');
    const groupsTab = document.getElementById('groupsTab');

    postsTab.classList.add('active');
    friendsTab.classList.remove('active');
    groupsTab.classList.remove('active');

    sectionTitle.textContent = 'הפוסטים שלי';

    document.getElementById('myPostsContainer').style.display = 'block';
    document.getElementById('profileFriendsContainer').style.display = 'none';
    document.getElementById('profileGroupsContainer').style.display = 'none';
});


document.getElementById('groupsTab').addEventListener('click', async function () {
    const postsTab = document.getElementById('postsTab');
    const friendsTab = document.getElementById('friendsTab');
    const groupsTab = document.getElementById('groupsTab');
    const sectionTitle = document.getElementById('profileSectionTitle');

    postsTab.classList.remove('active');
    friendsTab.classList.remove('active');
    groupsTab.classList.add('active');

    sectionTitle.textContent = 'הקבוצות שלי';

    document.getElementById('myPostsContainer').style.display = 'none';
    document.getElementById('profileFriendsContainer').style.display = 'none';
    document.getElementById('profileGroupsContainer').style.display = 'block';

    try {
const response = profileUserId
    ? await fetch(`/api/users/${profileUserId}/groups`)
    : await fetch('/api/my-groups');
        if (!response.ok) {
            return;
        }

        const groups = await response.json();

        const groupsContainer =
            document.getElementById('profileGroupsContainer');

        groupsContainer.innerHTML = '';

        if (groups.length === 0) {
            groupsContainer.innerHTML = `
                <div class="text-muted">
                    עדיין אין קבוצות להצגה
                </div>
            `;
            return;
        }

        groups.forEach(group => {
            const groupElement = document.createElement('div');

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

            groupsContainer.appendChild(groupElement);
        });

    } catch (error) {
        console.error('Error loading groups:', error);
    }
});


async function setupProfilePostActions(postElement, post) {
    const likeButton =
        postElement.querySelector('.like-profile-post-btn');

    const commentButton =
        postElement.querySelector('.comment-profile-post-btn');

    const deleteButton =
        postElement.querySelector('.delete-profile-post-btn');

    const commentsSection =
        postElement.querySelector('.profile-comments-section');

    const commentsList =
        postElement.querySelector('.profile-comments-list');

    const commentCount =
        postElement.querySelector('.profile-comment-count');

    const commentInput =
        postElement.querySelector('.profile-comment-input');

    const addCommentButton =
        postElement.querySelector('.add-profile-comment-btn');


    async function loadProfileComments() {
        try {
            const response =
                await fetch(`/api/posts/${post._id}/comments`);

            if (!response.ok) {
                return;
            }

            const comments = await response.json();

            commentsList.innerHTML = '';
            commentCount.textContent = comments.length;

            comments.forEach(comment => {
                const commentElement =
                    document.createElement('div');

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

                commentsList.appendChild(commentElement);
            });

        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }


    likeButton.addEventListener('click', async function () {
        try {
            const response =
                await fetch(`/api/posts/${post._id}/like`, {
                    method: 'PUT'
                });

            const data = await response.json();

            if (response.ok) {
                const likeCount =
                    likeButton.querySelector('span');

                likeCount.textContent =
                    data.likesCount;
            } else {
                alert(
                    data.message ||
                    'אירעה שגיאה בעדכון הלייק'
                );
            }

        } catch (error) {
            console.error(error);
            alert('לא ניתן להתחבר לשרת');
        }
    });


    commentButton.addEventListener('click', async function () {
        if (commentsSection.style.display === 'none') {
            commentsSection.style.display = 'block';
            await loadProfileComments();
        } else {
            commentsSection.style.display = 'none';
        }
    });


    addCommentButton.addEventListener('click', async function () {
        const text = commentInput.value.trim();

        if (text === '') {
            alert('יש לכתוב תגובה');
            return;
        }

        try {
            const response =
                await fetch(`/api/posts/${post._id}/comments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: text
                    })
                });

            const data = await response.json();

            if (response.ok) {
                commentInput.value = '';
                await loadProfileComments();
            } else {
                alert(
                    data.message ||
                    'אירעה שגיאה בהוספת התגובה'
                );
            }

        } catch (error) {
            console.error(error);
            alert('לא ניתן להתחבר לשרת');
        }
    });

if (deleteButton) {
    deleteButton.addEventListener('click', async function () {
        try {
            const response =
                await fetch(`/api/posts/${post._id}`, {
                    method: 'DELETE'
                });

            const data = await response.json();

            if (response.ok) {
                loadMyPosts();
            } else {
                alert(
                    data.message ||
                    'אירעה שגיאה במחיקת הפוסט'
                );
            }

        } catch (error) {
            console.error(error);
            alert('לא ניתן להתחבר לשרת');
        }
    });
}

    
}


const editProfileImageButton =
    document.getElementById('editProfileImageBtn');

if (editProfileImageButton) {
    editProfileImageButton.addEventListener('click', function () {
        const input =
            document.getElementById('profileImageInput');

        if (input) {
            input.click();
        }
    });
}


document.getElementById('createProfilePostBtn').addEventListener('click', async function () {
    const postText = document.getElementById('profilePostInput').value.trim();

const imageInput = document.getElementById('profilePostImageInput');
    const videoInput = document.getElementById('profileVideoInput');

    const imageFile = imageInput?.files[0];
    const videoFile = videoInput?.files[0];

    if (postText === '' && !imageFile && !videoFile) {
        alert('יש לכתוב תוכן, לבחור תמונה או לבחור סרטון');
        return;
    }

    const formData = new FormData();

    formData.append('text', postText);
    formData.append('group', 'null');

    if (imageFile) {
        formData.append('media', imageFile);
    }

    if (videoFile) {
        formData.append('media', videoFile);
    }

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('profilePostInput').value = '';

            if (imageInput) {
                imageInput.value = '';
            }

            if (videoInput) {
                videoInput.value = '';
            }

            const selectedFile = document.getElementById('profileSelectedFile');

            if (selectedFile) {
                selectedFile.textContent = '';
            }

            const feelingsMenu = document.getElementById('profileFeelingsMenu');

            if (feelingsMenu) {
                feelingsMenu.style.display = 'none';
            }

            await loadMyPosts();

            alert('הפוסט פורסם בהצלחה');
        } else {
            alert(data.message || 'אירעה שגיאה בפרסום הפוסט');
        }

    } catch (error) {
        console.error('Error creating profile post:', error);
        alert('לא ניתן להתחבר לשרת');
    }
});

const profileImageBtn = document.getElementById('profileImageBtn');
const profileVideoBtn = document.getElementById('profileVideoBtn');
const profileFeelingBtn = document.getElementById('profileFeelingBtn');

const profileImageInput = document.getElementById('profilePostImageInput');
const profileVideoInput = document.getElementById('profileVideoInput');
const profileFeelingsMenu = document.getElementById('profileFeelingsMenu');
const profileSelectedFile = document.getElementById('profileSelectedFile');
const profilePostInput = document.getElementById('profilePostInput');


if (profileImageBtn && profileImageInput) {
    profileImageBtn.addEventListener('click', function () {
        profileImageInput.click();
    });
}


if (profileVideoBtn && profileVideoInput) {
    profileVideoBtn.addEventListener('click', function () {
        profileVideoInput.click();
    });
}


if (profileImageInput) {
    profileImageInput.addEventListener('change', function () {
        const file = this.files[0];

        if (!file) {
            return;
        }

        profileVideoInput.value = '';

        if (profileSelectedFile) {
            profileSelectedFile.textContent = `נבחרה תמונה: ${file.name}`;
        }
    });
}


if (profileVideoInput) {
    profileVideoInput.addEventListener('change', function () {
        const file = this.files[0];

        if (!file) {
            return;
        }

        profileImageInput.value = '';

        if (profileSelectedFile) {
            profileSelectedFile.textContent = `נבחר סרטון: ${file.name}`;
        }
    });
}


if (profileFeelingBtn && profileFeelingsMenu) {
    profileFeelingBtn.addEventListener('click', function () {
        if (profileFeelingsMenu.style.display === 'none') {
            profileFeelingsMenu.style.display = 'block';
        } else {
            profileFeelingsMenu.style.display = 'none';
        }
    });
}


document.querySelectorAll('.profile-feeling-option').forEach(button => {
    button.addEventListener('click', function () {
        const feeling = this.dataset.feeling;

        if (profilePostInput) {
            const currentText = profilePostInput.value.trim();

            if (currentText) {
                profilePostInput.value = `${currentText} — מרגיש ${feeling}`;
            } else {
                profilePostInput.value = `מרגיש ${feeling}`;
            }
        }

        if (profileFeelingsMenu) {
            profileFeelingsMenu.style.display = 'none';
        }
    });
});

async function initializeProfile() {
    await loadProfile();
    loadMyPosts();
}

initializeProfile();