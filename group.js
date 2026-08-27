const urlParams = new URLSearchParams(window.location.search);
const groupId = urlParams.get('groupId');

let currentUser = null;
let currentGroup = null;

async function loadCurrentUser() {
    try {
        const response = await fetch('/api/current-user');

        if (!response.ok) {
            return;
        }

        currentUser = await response.json();

        const userImage =
            document.getElementById('groupCurrentUserImage');

        if (userImage && currentUser.profileImage) {
            userImage.src = currentUser.profileImage;
        }

    } catch (error) {
        console.error('Error loading current user:', error);
    }
}


async function loadGroup() {
    try {
        if (!groupId) {
            return;
        }

        const response = await fetch(`/api/groups/${groupId}`);

        if (!response.ok) {
            return;
        }

        currentGroup = await response.json();

        const groupProfileImage = document.getElementById('groupProfileImage');

        if (groupProfileImage) {
            groupProfileImage.src = currentGroup.image || 'harel.jpg';
        }

        document.getElementById('groupName').textContent = currentGroup.name || '';

        document.getElementById('groupDescription').textContent = currentGroup.description || '';

        document.getElementById('groupAddress').textContent = currentGroup.address || '';

        document.getElementById('groupMembersCount').textContent = currentGroup.members?.length || 0;

        document.getElementById('groupCreator').textContent =
            `${currentGroup.creator?.firstName || ''} ${currentGroup.creator?.lastName || ''}`;

    } catch (error) {
        console.error('Error loading group:', error);
    }
}

function renderGroupMembers() {
    const membersContainer = document.getElementById('groupMembersContainer');

    if (!membersContainer || !currentGroup) {
        return;
    }

    membersContainer.innerHTML = '';

    const adminId = currentGroup.creator?._id || currentGroup.creator;
    const members = [...(currentGroup.members || [])];

    members.sort((a, b) => {
        const aIsAdmin = a._id?.toString() === adminId?.toString();
        const bIsAdmin = b._id?.toString() === adminId?.toString();

        if (aIsAdmin && !bIsAdmin) {
            return -1;
        }

        if (!aIsAdmin && bIsAdmin) {
            return 1;
        }

        return 0;
    });

    members.forEach(member => {
        const isAdmin = member._id?.toString() === adminId?.toString();

        const memberElement = document.createElement('div');

        memberElement.className = 'd-flex align-items-center border-bottom py-2';

        memberElement.innerHTML = `
            <a
                href="profile.html?userId=${member._id}"
                class="d-flex align-items-center gap-3 text-decoration-none text-dark"
            >
                <img
                    src="${member.profileImage || 'harel.jpg'}"
                    alt="Profile"
                    class="rounded-circle"
                    width="45"
                    height="45"
                    style="object-fit: cover;"
                >

                <div>
                    <div class="d-flex align-items-center gap-2">

                        <strong>
                            ${member.firstName || ''} ${member.lastName || ''}
                        </strong>

                        ${isAdmin ? `
                            <span class="text-primary small fw-bold">
                                מנהל
                            </span>
                        ` : ''}

                    </div>

                    <div class="text-muted small">
                        @${member.username || ''}
                    </div>
                </div>
            </a>
        `;

        membersContainer.appendChild(memberElement);
    });
}

function updateGroupPermissions() {
    if (!currentUser || !currentGroup) {
        return;
    }

    const isMember = currentGroup.members?.some(member =>
        member._id?.toString() === currentUser._id?.toString()
    );

    const creatorId = currentGroup.creator?._id || currentGroup.creator;

    const isCreator =
        creatorId?.toString() === currentUser._id?.toString();

    const postBox = document.getElementById('groupPostBox');
    const joinButton = document.getElementById('joinGroupPageBtn');
    const leaveButton = document.getElementById('leaveGroupPageBtn');
    const editGroupBtn = document.getElementById('editGroupBtn');

    if (postBox) {
        postBox.style.display = isMember ? 'block' : 'none';
    }

    if (joinButton) {
        joinButton.style.display = isMember ? 'none' : 'inline-block';
    }

    if (leaveButton) {
        leaveButton.style.display =
            isMember && !isCreator ? 'inline-block' : 'none';
    }

    if (editGroupBtn) {
        editGroupBtn.style.display =
            isCreator ? 'inline-block' : 'none';
    }
}


document.getElementById('publishGroupPostBtn').addEventListener('click', async function () {
    const text = document.getElementById('groupPostText').value.trim();

    const imageInput = document.getElementById('groupPostImageInput');
    const videoInput = document.getElementById('groupPostVideoInput');

    const imageFile = imageInput?.files[0];
    const videoFile = videoInput?.files[0];

    if (text === '' && !imageFile && !videoFile) {
        alert('יש לכתוב פוסט, לבחור תמונה או לבחור סרטון');
        return;
    }

    const formData = new FormData();

    formData.append('text', text);
    formData.append('group', groupId);

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
            document.getElementById('groupPostText').value = '';

            if (imageInput) {
                imageInput.value = '';
            }

            if (videoInput) {
                videoInput.value = '';
            }

            const selectedFileName = document.getElementById('selectedGroupFileName');

            if (selectedFileName) {
                selectedFileName.textContent = '';
            }

            const feelingsMenu = document.getElementById('groupFeelingsMenu');

            if (feelingsMenu) {
                feelingsMenu.style.display = 'none';
            }

            await loadGroupPosts();

            alert('הפוסט פורסם בקבוצה בהצלחה');
        } else {
            alert(data.message || 'אירעה שגיאה בפרסום הפוסט');
        }

    } catch (error) {
        console.error(error);
        alert('לא ניתן להתחבר לשרת');
    }
});


const selectGroupPostImageBtn = document.getElementById('selectGroupPostImageBtn');
const selectGroupPostVideoBtn = document.getElementById('selectGroupPostVideoBtn');
const selectGroupPostFeelingBtn = document.getElementById('selectGroupPostFeelingBtn');

const groupPostImageInput = document.getElementById('groupPostImageInput');
const groupPostVideoInput = document.getElementById('groupPostVideoInput');

const selectedGroupFileName = document.getElementById('selectedGroupFileName');
const groupFeelingsMenu = document.getElementById('groupFeelingsMenu');
const groupPostText = document.getElementById('groupPostText');


if (selectGroupPostImageBtn && groupPostImageInput) {
    selectGroupPostImageBtn.addEventListener('click', function () {
        groupPostImageInput.click();
    });
}


if (selectGroupPostVideoBtn && groupPostVideoInput) {
    selectGroupPostVideoBtn.addEventListener('click', function () {
        groupPostVideoInput.click();
    });
}


if (groupPostImageInput) {
    groupPostImageInput.addEventListener('change', function () {
        const file = this.files[0];

        if (!file) {
            return;
        }

        if (groupPostVideoInput) {
            groupPostVideoInput.value = '';
        }

        if (selectedGroupFileName) {
            selectedGroupFileName.textContent = `נבחרה תמונה: ${file.name}`;
        }
    });
}


if (groupPostVideoInput) {
    groupPostVideoInput.addEventListener('change', function () {
        const file = this.files[0];

        if (!file) {
            return;
        }

        if (groupPostImageInput) {
            groupPostImageInput.value = '';
        }

        if (selectedGroupFileName) {
            selectedGroupFileName.textContent = `נבחר סרטון: ${file.name}`;
        }
    });
}


if (selectGroupPostFeelingBtn && groupFeelingsMenu) {
    selectGroupPostFeelingBtn.addEventListener('click', function () {
        if (groupFeelingsMenu.style.display === 'none') {
            groupFeelingsMenu.style.display = 'block';
        } else {
            groupFeelingsMenu.style.display = 'none';
        }
    });
}


document.querySelectorAll('.group-feeling-option').forEach(button => {
    button.addEventListener('click', function () {
        const feeling = this.dataset.feeling;
        const currentText = groupPostText.value.trim();

        if (currentText) {
            groupPostText.value = `${currentText} — מרגיש ${feeling}`;
        } else {
            groupPostText.value = `מרגיש ${feeling}`;
        }

        groupFeelingsMenu.style.display = 'none';
    });
});


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


async function loadGroupPosts() {
    try {
        if (!groupId) {
            return;
        }

        const response = await fetch(`/api/groups/${groupId}/posts`);

        if (!response.ok) {
            return;
        }

        const posts = await response.json();
        const container = document.getElementById('groupPostsContainer');

        container.innerHTML = '';

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'card mb-3';

            postElement.innerHTML = `
                <div class="card-body">

                    <div class="d-flex align-items-center gap-2 mb-3">

                        <a href="profile.html?userId=${post.author?._id}" class="text-decoration-none">
                            <img
                                src="${post.author?.profileImage || 'harel.jpg'}"
                                alt="Profile"
                                class="rounded-circle"
                                width="45"
                                height="45"
                                style="object-fit: cover;"
                            >
                        </a>

                        <div>
                            <a href="profile.html?userId=${post.author?._id}" class="text-decoration-none text-dark">
                                <strong>
                                    ${post.author?.firstName || ''}
                                    ${post.author?.lastName || ''}
                                </strong>
                            </a>

                            <div class="text-muted small">
                                ${timeAgo(post.createdAt)}
                            </div>
                        </div>

                    </div>

                    <p class="mb-3">
                        ${post.text || ''}
                    </p>

                    ${post.image ? `
                        <img
                            src="${post.image}"
                            alt="Post image"
                            class="img-fluid rounded mb-3"
                            style="max-height: 500px; object-fit: cover;"
                        >
                    ` : ''}

                    ${post.video ? `
                        <video
                            controls
                            playsinline
                            class="w-100 rounded mb-3"
                            style="max-height: 500px; background: black;"
                        >
                            <source src="${post.video}">
                            הדפדפן שלך אינו תומך בהצגת סרטונים.
                        </video>
                    ` : ''}

                    <hr class="my-2">

                    <div class="d-flex justify-content-end align-items-center gap-4 pt-2 pe-2" style="direction: ltr;">

                        <button
                            class="btn p-0 border-0 bg-transparent text-secondary d-flex align-items-center gap-1 like-group-post-btn"
                            data-id="${post._id}"
                        >
                            <span>${post.likes?.length || 0}</span>
                            <i class="bi bi-hand-thumbs-up fs-5"></i>
                        </button>

                        <button
                            class="btn p-0 border-0 bg-transparent text-secondary d-flex align-items-center gap-1 comment-group-post-btn"
                            data-id="${post._id}"
                        >
                            <span class="group-comment-count">0</span>
                            <i class="bi bi-chat fs-5"></i>
                        </button>

                        ${
                            currentUser &&
                            post.author?._id?.toString() === currentUser._id?.toString()
                                ? `
                                    <button
                                        class="btn p-0 border-0 bg-transparent text-secondary delete-group-post-btn"
                                        data-id="${post._id}"
                                    >
                                        <i class="bi bi-trash3 fs-5"></i>
                                    </button>
                                `
                                : ''
                        }

                    </div>

                    <div class="group-comments-section mt-3" style="display: none;">

                        <div class="group-comments-list mb-2"></div>

                        <div class="d-flex gap-2">

                            <input
                                type="text"
                                class="form-control group-comment-input"
                                placeholder="כתוב תגובה..."
                            >

                            <button
                                type="button"
                                class="btn btn-primary add-group-comment-btn"
                                data-id="${post._id}"
                            >
                                <i class="bi bi-send"></i>
                            </button>

                        </div>

                    </div>

                </div>
            `;

            container.appendChild(postElement);

            const commentCount = postElement.querySelector('.group-comment-count');

            async function loadInitialCommentCount() {
                try {
                    const commentsResponse = await fetch(`/api/posts/${post._id}/comments`);

                    if (!commentsResponse.ok) {
                        return;
                    }

                    const comments = await commentsResponse.json();

                    if (commentCount) {
                        commentCount.textContent = comments.length;
                    }

                } catch (error) {
                    console.error('Error loading comment count:', error);
                }
            }

            loadInitialCommentCount();

            setupGroupPostActions(postElement, post);
        });

    } catch (error) {
        console.error('Error loading group posts:', error);
    }
}

function setupGroupPostActions(postElement, post) {
    const likeButton =
        postElement.querySelector('.like-group-post-btn');

    if (likeButton) {
        console.log('setupGroupPostActions running for post:', post._id);
        likeButton.addEventListener('click', async function () {
            try {
                const response = await fetch(
                    `/api/posts/${post._id}/like`,
                    {
                        method: 'PUT'
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    const likeCount =
                        likeButton.querySelector('span');

                    if (likeCount) {
                        likeCount.textContent =
                            data.likes?.length || 0;
                    }
                } else {
                    alert(
                        data.message ||
                        'אירעה שגיאה בעדכון הלייק'
                    );
                }

            } catch (error) {
                console.error(
                    'Error updating like:',
                    error
                );

                alert('לא ניתן להתחבר לשרת');
            }
        });
    }
    const commentButton =
    postElement.querySelector('.comment-group-post-btn');

const commentsSection =
    postElement.querySelector('.group-comments-section');

const commentsList =
    postElement.querySelector('.group-comments-list');

const commentCount =
    postElement.querySelector('.group-comment-count');

const commentInput =
    postElement.querySelector('.group-comment-input');

const addCommentButton =
    postElement.querySelector('.add-group-comment-btn');
    console.log('addCommentButton:', addCommentButton);

async function loadGroupComments() {
    try {
        const response = await fetch(
    `/api/posts/${post._id}/comments?t=${Date.now()}`,
    {
        cache: 'no-store'
    }
);
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

if (commentButton) {
    commentButton.addEventListener('click', async function () {
        if (commentsSection.style.display === 'none') {
            commentsSection.style.display = 'block';
            await loadGroupComments();
        } else {
            commentsSection.style.display = 'none';
        }
    });
}

if (addCommentButton) {
    addCommentButton.addEventListener('click', async function () {
        
        console.log('ADD COMMENT BUTTON CLICKED');
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

            const comment = data.comment;

            const commentElement = document.createElement('div');

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

const currentCount =
    parseInt(commentCount.textContent) || 0;

commentCount.textContent = currentCount + 1;  
            }

        } catch (error) {
            console.error(error);
            alert('לא ניתן להתחבר לשרת');
        }
    });
}





const deleteButton =
    postElement.querySelector('.delete-group-post-btn');

if (deleteButton) {
    deleteButton.addEventListener('click', async function () {
        try {
            const response = await fetch(
                `/api/posts/${post._id}`,
                {
                    method: 'DELETE'
                }
            );

            const data = await response.json();
            console.log('COMMENT RESPONSE:', data);
console.log('STATUS:', response.status);

            if (response.ok) {
                postElement.remove();
            } else {
                alert(
                    data.message ||
                    'אירעה שגיאה במחיקת הפוסט'
                );
            }

        } catch (error) {
            console.error('Error deleting post:', error);
            alert('לא ניתן להתחבר לשרת');
        }
    });
}
}



const joinGroupPageBtn =
    document.getElementById('joinGroupPageBtn');

if (joinGroupPageBtn) {
    joinGroupPageBtn.addEventListener('click', async function () {
        try {
            const response = await fetch(
                `/api/groups/${groupId}/join`,
                {
                    method: 'PUT'
                }
            );

            const data = await response.json();

            if (response.ok) {
                await loadGroup();

                renderGroupMembers();
                updateGroupPermissions();

                alert('הצטרפת לקבוצה בהצלחה');
            } else {
                alert(
                    data.message ||
                    'אירעה שגיאה בהצטרפות לקבוצה'
                );
            }

        } catch (error) {
            console.error(error);
            alert('לא ניתן להתחבר לשרת');
        }
    });
}


const leaveGroupPageBtn =
    document.getElementById('leaveGroupPageBtn');

if (leaveGroupPageBtn) {
    leaveGroupPageBtn.addEventListener('click', async function () {
        try {
            const response = await fetch(
                `/api/groups/${groupId}/leave`,
                {
                    method: 'PUT'
                }
            );

            const data = await response.json();

            if (response.ok) {
                await loadGroup();

                renderGroupMembers();
                updateGroupPermissions();

                alert('עזבת את הקבוצה בהצלחה');
            } else {
                alert(
                    data.message ||
                    'אירעה שגיאה בעזיבת הקבוצה'
                );
            }

        } catch (error) {
            console.error(error);
            alert('לא ניתן להתחבר לשרת');
        }
    });
}


const editGroupBtn = document.getElementById('editGroupBtn');
const editGroupFormContainer = document.getElementById('editGroupFormContainer');
const editGroupNameInput = document.getElementById('editGroupNameInput');
const editGroupImageInput = document.getElementById('editGroupImageInput');
const saveGroupChangesBtn = document.getElementById('saveGroupChangesBtn');
const cancelGroupEditBtn = document.getElementById('cancelGroupEditBtn');

if (saveGroupChangesBtn) {
    saveGroupChangesBtn.addEventListener('click', async function () {
        const newName = editGroupNameInput.value.trim();
        const newImage = editGroupImageInput.files[0];

        if (newName === '') {
            alert('יש להזין שם לקבוצה');
            return;
        }

        const formData = new FormData();

        formData.append('name', newName);

        if (newImage) {
            formData.append('image', newImage);
        }

        try {
            const response = await fetch(`/api/groups/${groupId}`, {
                method: 'PUT',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                await loadGroup();
                renderGroupMembers();
                updateGroupPermissions();

                editGroupFormContainer.style.display = 'none';

                alert('הקבוצה עודכנה בהצלחה');
            } else {
                alert(data.message || 'אירעה שגיאה בעדכון הקבוצה');
            }

        } catch (error) {
            console.error(error);
            alert('לא ניתן להתחבר לשרת');
        }
    });
}

if (editGroupBtn && editGroupFormContainer) {
    editGroupBtn.addEventListener('click', function () {
        editGroupNameInput.value = currentGroup?.name || '';
        editGroupImageInput.value = '';

        editGroupFormContainer.style.display = 'block';
    });
}

if (cancelGroupEditBtn) {
    cancelGroupEditBtn.addEventListener('click', function () {
        editGroupFormContainer.style.display = 'none';
    });
}


async function initializeGroupPage() {
    await loadCurrentUser();
    await loadGroup();
    renderGroupMembers();

    updateGroupPermissions();
    await loadGroupPosts();
}

initializeGroupPage();

