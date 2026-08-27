let currentUser = null;


document.getElementById('publishPostBtn').addEventListener('click', async function () {
    const postText =
        document.getElementById('postText').value.trim();

    const imageInput =
        document.getElementById('postImageInput');

    const videoInput =
        document.getElementById('postVideoInput');

    const imageFile =
        imageInput?.files[0];

    const videoFile =
        videoInput?.files[0];

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
            alert('הפוסט פורסם בהצלחה');

            document.getElementById('postText').value = '';

            if (imageInput) {
                imageInput.value = '';
            }

            if (videoInput) {
                videoInput.value = '';
            }

            const selectedPostFile =
                document.getElementById('selectedPostFile');

            if (selectedPostFile) {
                selectedPostFile.textContent = '';
            }

            loadPosts();

        } else {
            alert(
                data.message ||
                'אירעה שגיאה ביצירת הפוסט'
            );
        }

    } catch (error) {
        console.error(error);
        alert('לא ניתן להתחבר לשרת');
    }
});




async function loadCurrentUser() {
    try {
        const response = await fetch('/api/current-user');

        if (!response.ok) {
            return;
        }

        currentUser = await response.json();
        const currentUserSidebarName =
    document.getElementById('currentUserSidebarName');

if (currentUserSidebarName) {
    currentUserSidebarName.textContent =
        `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
}
        document.querySelectorAll('.current-user-profile-image').forEach(image => {
            if (currentUser.profileImage) {
                image.src = currentUser.profileImage;
            }
        });

        const currentUserProfileImage = document.getElementById('currentUserProfileImage');

        if (currentUserProfileImage && currentUser.profileImage) {
            currentUserProfileImage.src = currentUser.profileImage;
        }

    } catch (error) {
        console.error('Error loading current user:', error);
    }
}

async function loadPosts() {
    try {
        const response = await fetch('/api/feed');

        if (!response.ok) {
            return;
        }

        const posts = await response.json();
        const postsContainer = document.getElementById('postsContainer');

        postsContainer.innerHTML = '';

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'card mb-4';

            postElement.innerHTML = `
                <div class="card-body">

                    <div class="d-flex align-items-center gap-2 mb-3">
                        <a href="profile.html?userId=${post.author?._id}">
                            <img src="${post.author?.profileImage || 'harel.jpg'}" alt="Profile" class="rounded-circle" width="45" height="45" style="object-fit: cover; cursor: pointer;">
                        </a>

                        <div>
                            <a href="profile.html?userId=${post.author?._id}" style="text-decoration: none; color: inherit;">
                                <strong>${post.author?.firstName || ''} ${post.author?.lastName || ''}</strong>
                            </a>

                            <div class="text-muted small">
                                ${new Date(post.createdAt).toLocaleString('he-IL')}
                            </div>
                        </div>
                    </div>

                    ${post.text ? `<p class="mb-3">${post.text}</p>` : ''}

                    ${post.image ? `
                        <img src="${post.image}" alt="Post image" class="img-fluid rounded mb-3" style="width: 100%; max-height: 600px; object-fit: contain;">
                    ` : ''}

                    ${post.video ? `
                        <video controls class="w-100 rounded mb-3" style="max-height: 600px;">
                            <source src="${post.video}">
                            הדפדפן שלך אינו תומך בהצגת סרטונים.
                        </video>
                    ` : ''}

                    <hr class="my-2">

                    <div class="d-flex justify-content-end align-items-center gap-4 pt-2 pe-2" style="direction: ltr;">

                       ${
    currentUser &&
    post.author?._id?.toString() === currentUser._id?.toString()
        ? `
            <button class="btn p-0 border-0 bg-transparent text-secondary delete-post-btn" data-id="${post._id}">
                <i class="bi bi-trash3 fs-5"></i>
            </button>
        `
        : ''
}

                        <button class="btn p-0 border-0 bg-transparent text-secondary d-flex align-items-center gap-1 comment-post-btn" data-id="${post._id}">
                            <span class="comment-count">0</span>
                            <i class="bi bi-chat fs-5"></i>
                        </button>

                        <button class="btn p-0 border-0 bg-transparent text-secondary d-flex align-items-center gap-1 like-post-btn" data-id="${post._id}">
                            <span>${post.likes?.length || 0}</span>
                            <i class="bi bi-hand-thumbs-up fs-5"></i>
                        </button>

                    </div>

                    <div class="comments-section mt-3" data-post-id="${post._id}" style="display: none;">
                        <div class="comments-list mb-2"></div>

                        <div class="d-flex gap-2">
                            <input type="text" class="form-control comment-input" placeholder="כתוב תגובה...">

                            <button type="button" class="btn btn-primary add-comment-btn" data-id="${post._id}">
                                <i class="bi bi-send"></i>
                            </button>
                        </div>
                    </div>

                </div>
            `;

            postsContainer.appendChild(postElement);

            const deleteButton = postElement.querySelector('.delete-post-btn');
            const likeButton = postElement.querySelector('.like-post-btn');
            const commentButton = postElement.querySelector('.comment-post-btn');
            const commentsSection = postElement.querySelector('.comments-section');
            const commentsList = postElement.querySelector('.comments-list');
            const commentInput = postElement.querySelector('.comment-input');
            const addCommentButton = postElement.querySelector('.add-comment-btn');
            const commentCount = postElement.querySelector('.comment-count');


            async function loadComments() {
                try {
                    const response = await fetch(`/api/posts/${post._id}/comments`);

                    if (!response.ok) {
                        return;
                    }

                    const comments = await response.json();

                    commentsList.innerHTML = '';
                    commentCount.textContent = comments.length;

                    comments.forEach(comment => {
                        const commentElement = document.createElement('div');
                        commentElement.className = 'bg-light rounded p-2 mb-2';

                       commentElement.innerHTML = `
    <div class="d-flex align-items-start gap-2">

        <a href="profile.html?userId=${comment.author?._id}">
            <img
                src="${comment.author?.profileImage || 'harel.jpg'}"
                alt="Profile"
                class="rounded-circle"
                width="35"
                height="35"
                style="object-fit: cover;"
            >
        </a>

        <div class="flex-grow-1">

            <div class="d-flex align-items-center gap-2">

                <a href="profile.html?userId=${comment.author?._id}" class="text-decoration-none text-dark">
                    <strong>${comment.author?.firstName || ''} ${comment.author?.lastName || ''}</strong>
                </a>

                <span class="text-muted small">
                    ${timeAgo(comment.createdAt)}
                </span>

            </div>

            <div class="mt-1">
                ${comment.text}
            </div>

        </div>

    </div>
`;

                        commentsList.appendChild(commentElement);
                    });

                } catch (error) {
                    console.error('Error loading comments:', error);
                }
            }

            loadComments();


            if (deleteButton) {
                deleteButton.addEventListener('click', async function () {
                    try {
                        const response = await fetch(`/api/posts/${post._id}`, { method: 'DELETE' });
                        const data = await response.json();

                        if (response.ok) {
                            alert('הפוסט נמחק בהצלחה');
                            loadPosts();
                        } else {
                            alert(data.message || 'אירעה שגיאה במחיקת הפוסט');
                        }

                    } catch (error) {
                        console.error(error);
                        alert('לא ניתן להתחבר לשרת');
                    }
                });
            }


            if (likeButton) {
                likeButton.addEventListener('click', async function () {
                    try {
                        const response = await fetch(`/api/posts/${post._id}/like`, { method: 'PUT' });
                        const data = await response.json();

                        if (response.ok) {
                            likeButton.querySelector('span').textContent = data.likesCount;
                        } else {
                            alert(data.message || 'אירעה שגיאה בעדכון הלייק');
                        }

                    } catch (error) {
                        console.error(error);
                        alert('לא ניתן להתחבר לשרת');
                    }
                });
            }


            if (commentButton) {
                commentButton.addEventListener('click', async function () {
                    if (commentsSection.style.display === 'none') {
                        commentsSection.style.display = 'block';
                        await loadComments();
                    } else {
                        commentsSection.style.display = 'none';
                    }
                });
            }


            if (addCommentButton) {
                addCommentButton.addEventListener('click', async function () {
                    const text = commentInput.value.trim();

                    if (text === '') {
                        alert('יש לכתוב תגובה');
                        return;
                    }

                    try {
                        const response = await fetch(`/api/posts/${post._id}/comments`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: text })
                        });

                        const data = await response.json();

                        if (response.ok) {
                            commentInput.value = '';
                            await loadComments();
                        } else {
                            alert(data.message || 'אירעה שגיאה בהוספת התגובה');
                        }

                    } catch (error) {
                        console.error(error);
                        alert('לא ניתן להתחבר לשרת');
                    }
                });
            }
        });

    } catch (error) {
        console.error('Error loading posts:', error);
    }
}


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


const mainSearchInput = document.getElementById('mainSearchInput');
const mainSearchResults = document.getElementById('mainSearchResults');

if (mainSearchInput && mainSearchResults) {
    mainSearchInput.addEventListener('input', async function () {
        const searchText = this.value.trim();

        if (searchText.length < 2) {
            mainSearchResults.style.display = 'none';
            mainSearchResults.innerHTML = '';
            return;
        }

        try {
            const [usersResponse, groupsResponse] = await Promise.all([
                fetch(`/api/search/users?q=${encodeURIComponent(searchText)}`),
                fetch(`/api/search/groups?q=${encodeURIComponent(searchText)}`)
            ]);

            const users = usersResponse.ok
                ? await usersResponse.json()
                : [];

            const groups = groupsResponse.ok
                ? await groupsResponse.json()
                : [];

            mainSearchResults.innerHTML = '';

            if (users.length === 0 && groups.length === 0) {
                mainSearchResults.innerHTML = `
                    <div class="p-3 text-muted">
                        לא נמצאו תוצאות
                    </div>
                `;

                mainSearchResults.style.display = 'block';
                return;
            }

            if (users.length > 0) {
                const usersTitle = document.createElement('div');

                usersTitle.className = 'fw-bold px-3 pt-3 pb-2';
                usersTitle.textContent = 'אנשים';

                mainSearchResults.appendChild(usersTitle);

                users.forEach(user => {
                    const userElement = document.createElement('a');

                    userElement.href = `profile.html?userId=${user._id}`;
                    userElement.className = 'd-flex align-items-center gap-3 p-2 text-decoration-none text-dark';

                    userElement.innerHTML = `
                        <img
                            src="${user.profileImage || 'harel.jpg'}"
                            alt="Profile"
                            class="rounded-circle"
                            width="45"
                            height="45"
                            style="object-fit: cover;"
                        >

                        <div>
                            <strong>
                                ${user.firstName || ''} ${user.lastName || ''}
                            </strong>

                            <div class="text-muted small">
                                @${user.username || ''}
                            </div>

                            <div class="text-muted small">
                                ${user.city || ''}
                            </div>
                        </div>
                    `;

                    mainSearchResults.appendChild(userElement);
                });
            }

            if (groups.length > 0) {
                const groupsTitle = document.createElement('div');

                groupsTitle.className = 'fw-bold px-3 pt-3 pb-2 border-top';
                groupsTitle.textContent = 'קבוצות';

                mainSearchResults.appendChild(groupsTitle);

                groups.forEach(group => {
                    const groupElement = document.createElement('a');

                    groupElement.href = `group.html?groupId=${group._id}`;
                    groupElement.className = 'd-flex align-items-center gap-3 p-2 text-decoration-none text-dark';

                    groupElement.innerHTML = `
                        <img
                            src="${group.image || 'harel.jpg'}"
                            alt="Group"
                            class="rounded-circle"
                            width="45"
                            height="45"
                            style="object-fit: cover;"
                        >

                        <div>
                            <strong>
                                ${group.name || ''}
                            </strong>

                            <div class="text-muted small">
                                ${group.description || ''}
                            </div>

                            <div class="text-muted small">
                                ${group.members?.length || 0} חברים
                            </div>
                        </div>
                    `;

                    mainSearchResults.appendChild(groupElement);
                });
            }

            mainSearchResults.style.display = 'block';

        } catch (error) {
            console.error('Search error:', error);
        }
    });
}

const selectPostImageBtn =
    document.getElementById('selectPostImageBtn');

const selectPostVideoBtn =
    document.getElementById('selectPostVideoBtn');

const selectPostFeelingBtn =
    document.getElementById('selectPostFeelingBtn');

const postImageInput =
    document.getElementById('postImageInput');

const postVideoInput =
    document.getElementById('postVideoInput');

const selectedPostFile =
    document.getElementById('selectedPostFile');

const feelingsMenu =
    document.getElementById('feelingsMenu');


if (selectPostImageBtn && postImageInput) {
    selectPostImageBtn.addEventListener('click', function () {
        postImageInput.click();
    });
}

if (selectPostVideoBtn && postVideoInput) {
    selectPostVideoBtn.addEventListener('click', function () {
        postVideoInput.click();
    });
}

if (postImageInput) {
    postImageInput.addEventListener('change', function () {
        const file = this.files[0];

        if (file) {
            selectedPostFile.textContent =
                `נבחרה תמונה: ${file.name}`;

            postVideoInput.value = '';
        }
    });
}

if (postVideoInput) {
    postVideoInput.addEventListener('change', function () {
        const file = this.files[0];

        if (file) {
            selectedPostFile.textContent =
                `נבחר סרטון: ${file.name}`;

            postImageInput.value = '';
        }
    });
}

if (selectPostFeelingBtn && feelingsMenu) {
    selectPostFeelingBtn.addEventListener('click', function () {
        feelingsMenu.style.display =
            feelingsMenu.style.display === 'none'
                ? 'block'
                : 'none';
    });
}

const homeProfileMenuBtn = document.getElementById('homeProfileMenuBtn');
const homeProfileMenu = document.getElementById('homeProfileMenu');

if (homeProfileMenuBtn && homeProfileMenu) {
    homeProfileMenuBtn.addEventListener('click', function (event) {
        event.stopPropagation();

        homeProfileMenu.style.display =
            homeProfileMenu.style.display === 'block'
                ? 'none'
                : 'block';
    });

    document.addEventListener('click', function (event) {
        if (!homeProfileMenu.contains(event.target) && event.target !== homeProfileMenuBtn) {
            homeProfileMenu.style.display = 'none';
        }
    });
}
async function loadUnreadMessagesCount() {
    try {
        const response = await fetch('/api/messages-unread-count');

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        const badge = document.getElementById('unreadMessagesBadge');

        if (!badge) {
            return;
        }

        if (data.unreadCount > 0) {
            badge.textContent = data.unreadCount;
            badge.style.display = 'inline-block';
        } else {
            badge.textContent = '0';
            badge.style.display = 'none';
        }

    } catch (error) {
        console.error('Error loading unread messages count:', error);
    }
}

loadUnreadMessagesCount();


const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', async function () {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST'
            });

            const data = await response.json();

            if (response.ok) {
                window.location.href = 'index.html';
            } else {
                alert(data.message || 'אירעה שגיאה בהתנתקות');
            }

        } catch (error) {
            console.error('Logout error:', error);
            alert('לא ניתן להתחבר לשרת');
        }
    });
}

document.querySelectorAll('.feeling-option')
    .forEach(button => {
        button.addEventListener('click', function () {
            const feeling =
                this.dataset.feeling;

            const postText =
                document.getElementById('postText');

            if (postText) {
                const currentText =
                    postText.value.trim();

                postText.value =
                    currentText
                        ? `${currentText} — מרגיש ${feeling}`
                        : `מרגיש ${feeling}`;
            }

            feelingsMenu.style.display = 'none';
        });
    });


async function initializeHomePage() {
    await loadCurrentUser();
    await loadPosts();
}

initializeHomePage();


