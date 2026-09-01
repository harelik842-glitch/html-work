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

        const currentUserProfileImage =
            document.getElementById('currentUserProfileImage');

        if (currentUserProfileImage && currentUser.profileImage) {
            currentUserProfileImage.src =
                currentUser.profileImage;
        }

    } catch (error) {
        console.error(
            'Error loading current user:',
            error
        );
    }
}


async function loadPosts() {
    try {
        const response =
            await fetch('/api/feed');

        if (!response.ok) {
            return;
        }

        const posts =
            await response.json();

        const postsContainer =
            document.getElementById('postsContainer');

        postsContainer.innerHTML = '';

        posts.forEach(post => {

            const isSaved =
                currentUser?.savedPosts?.some(
                    savedPostId =>
                        savedPostId.toString() ===
                        post._id.toString()
                );

            const postElement =
                document.createElement('div');

            postElement.id =
                `post-${post._id}`;

            postElement.className =
                'card mb-4';

            postElement.innerHTML = `
                <div class="card-body">

                    <div class="d-flex align-items-center gap-2 mb-3">

                        <a href="profile.html?userId=${post.author?._id}">
                            <img
                                src="${post.author?.profileImage || 'facebookprofile.jpeg'}"
                                alt="Profile"
                                class="rounded-circle"
                                width="45"
                                height="45"
                                style="object-fit: cover; cursor: pointer;"
                            >
                        </a>

                        <div>

    <a
        href="profile.html?userId=${post.author?._id}"
        style="text-decoration: none; color: inherit;"
    >
        <strong>
            ${post.author?.firstName || ''}
            ${post.author?.lastName || ''}
        </strong>
    </a>

    ${
        post.group
            ? `
                <div class="small">
                    <span class="text-muted">
                        פורסם בקבוצת
                    </span>

                    <a
                        href="group.html?groupId=${post.group._id}"
                        class="fw-bold text-decoration-none"
                    >
                        ${post.group.name}
                    </a>
                </div>
            `
            : ''
    }

   <div class="text-muted small">
    ${new Date(post.createdAt).toLocaleString('he-IL')}
</div>

</div>

</div>

${post.text && post.text !== 'שיתף פוסט' ? `
    <p
        class="mb-3 post-text"
        id="post-text-${post._id}"
    >
        ${post.text}
    </p>
` : ''}

${post.image ? `
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
` : ''}

${post.video ? `
    <video
        controls
        class="w-100 rounded mb-3"
        style="max-height: 600px;"
    >
        <source src="${post.video}">
        הדפדפן שלך אינו תומך בהצגת סרטונים.
    </video>
` : ''}

${
    post.sharedPost
        ? `
            <div class="border rounded-3 mt-3 mb-3 overflow-hidden">

                <div class="p-3">

                    <div class="d-flex align-items-center gap-2 mb-3">

                        <a
                            href="profile.html?userId=${post.sharedPost.author?._id}"
                            class="text-decoration-none"
                        >
                            <img
                                src="${post.sharedPost.author?.profileImage || 'facebookprofile.jpwg'}"
                                alt="Profile"
                                class="rounded-circle"
                                width="42"
                                height="42"
                                style="object-fit: cover;"
                            >
                        </a>

                        <div>

                            <a
                                href="profile.html?userId=${post.sharedPost.author?._id}"
                                class="text-decoration-none text-dark"
                            >
                                <strong>
                                    ${post.sharedPost.author?.firstName || ''}
                                    ${post.sharedPost.author?.lastName || ''}
                                </strong>
                            </a>

                            ${
                                post.sharedPost.group
                                    ? `
                                        <div class="small">
                                            <span class="text-muted">
                                                פורסם בקבוצת
                                            </span>

                                            <a
                                                href="group.html?groupId=${post.sharedPost.group._id}"
                                                class="fw-bold text-decoration-none"
                                            >
                                                ${post.sharedPost.group.name}
                                            </a>
                                        </div>
                                    `
                                    : ''
                            }

                            <div class="text-muted small">
                                ${new Date(post.sharedPost.createdAt).toLocaleString('he-IL')}
                            </div>

                        </div>

                    </div>

                    ${
                        post.sharedPost.text
                            ? `
                                <p class="mb-3">
                                    ${post.sharedPost.text}
                                </p>
                            `
                            : ''
                    }

                </div>

                ${
                    post.sharedPost.image
                        ? `
                            <img
                                src="${post.sharedPost.image}"
                                alt="Post image"
                                class="w-100"
                                style="
                                    max-height: 600px;
                                    object-fit: contain;
                                "
                            >
                        `
                        : ''
                }

                ${
                    post.sharedPost.video
                        ? `
                            <video
                                controls
                                class="w-100"
                                style="max-height: 600px;"
                            >
                                <source src="${post.sharedPost.video}">
                                הדפדפן שלך אינו תומך בהצגת סרטונים.
                            </video>
                        `
                        : ''
                }

                <div class="border-top px-3 py-2">

                    <div class="d-flex align-items-center gap-4 text-muted">

                        <div class="d-flex align-items-center gap-1">
                            <i class="bi bi-hand-thumbs-up-fill text-primary"></i>

                            <span>
                                ${post.sharedPost.likes?.length || 0}
                            </span>
                        </div>

                        <div class="d-flex align-items-center gap-1">
                            <i class="bi bi-chat"></i>

                            <span>
                                ${post.sharedPost.commentsCount || 0}
                            </span>
                        </div>

                    </div>

                </div>

            </div>
        `
        : ''
}

<hr class="my-2">

<div
    class="d-flex justify-content-end align-items-center gap-4 pt-2 pe-2"
    style="direction: ltr;"
>

    ${
        currentUser &&
        post.author?._id?.toString() ===
        currentUser._id?.toString()
            ? `
            <button
    class="btn p-0 border-0 bg-transparent text-secondary edit-post-btn"
    data-id="${post._id}"
    title="ערוך פוסט"
>
    <i class="bi bi-pencil fs-5"></i>
</button>
                <button
                    class="btn p-0 border-0 bg-transparent text-secondary delete-post-btn"
                    data-id="${post._id}"
                >
                    <i class="bi bi-trash3 fs-5"></i>
                </button>
            `
            : ''
    }

    <button
        class="btn p-0 border-0 bg-transparent d-flex align-items-center gap-1 save-post-btn ${isSaved ? 'text-primary' : 'text-secondary'}"
        data-id="${post._id}"
        data-saved="${isSaved ? 'true' : 'false'}"
        title="${isSaved ? 'הסר מהשמורים' : 'שמור פוסט'}"
    >
        <i class="bi ${isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'} fs-5"></i>
    </button>

    <button
        class="btn p-0 border-0 bg-transparent text-secondary d-flex align-items-center gap-1 comment-post-btn"
        data-id="${post._id}"
    >
        <span class="comment-count">
            ${post.commentsCount || 0}
        </span>

        <i class="bi bi-chat fs-5"></i>
    </button>

    <button
        class="btn p-0 border-0 bg-transparent text-secondary d-flex align-items-center gap-1 share-post-btn"
        data-id="${post._id}"
        title="שתף פוסט"
    >
        <i class="bi bi-share fs-5"></i>
    </button>

    <button
        class="btn p-0 border-0 bg-transparent text-secondary d-flex align-items-center gap-1 like-post-btn"
        data-id="${post._id}"
    >
        <span>
            ${post.likes?.length || 0}
        </span>

        <i class="bi bi-hand-thumbs-up fs-5"></i>
    </button>

</div>

<div
    class="comments-section mt-3"
    data-post-id="${post._id}"
    style="display: none;"
>

    <div class="comments-list mb-2"></div>

    <div class="d-flex gap-2">

        <input
            type="text"
            class="form-control comment-input"
            placeholder="כתוב תגובה..."
        >

        <button
            type="button"
            class="btn btn-primary add-comment-btn"
            data-id="${post._id}"
        >
            <i class="bi bi-send"></i>
        </button>

    </div>

</div>

</div>
`;

            postsContainer.appendChild(
                postElement
            );

            const deleteButton =
                postElement.querySelector(
                    '.delete-post-btn'
                );

            const saveButton =
                postElement.querySelector(
                    '.save-post-btn'
                );

            const likeButton =
                postElement.querySelector(
                    '.like-post-btn'
                );

                const shareButton =
    postElement.querySelector(
        '.share-post-btn'
    );

            const commentButton =
                postElement.querySelector(
                    '.comment-post-btn'
                );

            const commentsSection =
                postElement.querySelector(
                    '.comments-section'
                );

            const commentsList =
                postElement.querySelector(
                    '.comments-list'
                );

            const commentInput =
                postElement.querySelector(
                    '.comment-input'
                );

            const addCommentButton =
                postElement.querySelector(
                    '.add-comment-btn'
                );

            const commentCount =
                postElement.querySelector(
                    '.comment-count'
                );

const editButton =
    postElement.querySelector(
        '.edit-post-btn'
    );

if (editButton) {

    editButton.addEventListener(
        'click',
        function () {

            const postId =
                this.dataset.id;

            const textElement =
                postElement.querySelector(
                    '.post-text'
                );

            if (!textElement) {
                return;
            }

            const currentText =
                textElement.textContent.trim();


            textElement.outerHTML = `

                <div
                    class="edit-post-area mb-3"
                >

                    <textarea
                        class="form-control mb-2 edit-post-textarea"
                        rows="3"
                    >${currentText}</textarea>

                    <div class="d-flex gap-2">

                        <button
                            type="button"
                            class="btn btn-primary btn-sm save-edit-post-btn"
                        >
                            שמור
                        </button>

                        <button
                            type="button"
                            class="btn btn-light border btn-sm cancel-edit-post-btn"
                        >
                            ביטול
                        </button>

                    </div>

                </div>
            `;


            const editArea =
                postElement.querySelector(
                    '.edit-post-area'
                );

            const textarea =
                editArea.querySelector(
                    '.edit-post-textarea'
                );

            const saveButton =
                editArea.querySelector(
                    '.save-edit-post-btn'
                );

            const cancelButton =
                editArea.querySelector(
                    '.cancel-edit-post-btn'
                );


            textarea.focus();



            saveButton.addEventListener(
                'click',
                async function () {

                    const newText =
                        textarea.value.trim();

                    try {

                        const response =
                            await fetch(
                                `/api/posts/${postId}`,
                                {
                                    method: 'PUT',

                                    headers: {
                                        'Content-Type':
                                            'application/json'
                                    },

                                    body: JSON.stringify({
                                        text: newText
                                    })
                                }
                            );


                        const data =
                            await response.json();


                        if (!response.ok) {

                            alert(
                                data.message ||
                                'אירעה שגיאה בעריכת הפוסט'
                            );

                            return;
                        }


                        // מחזירים את התצוגה הרגילה
                        editArea.outerHTML = `

                            <p
                                class="mb-3 post-text"
                                id="post-text-${postId}"
                            >
                                ${newText}
                            </p>
                        `;


                    } catch (error) {

                        console.error(
                            'Edit post error:',
                            error
                        );

                        alert(
                            'לא ניתן להתחבר לשרת'
                        );
                    }
                }
            );



            cancelButton.addEventListener(
                'click',
                function () {

                    editArea.outerHTML = `

                        <p
                            class="mb-3 post-text"
                            id="post-text-${postId}"
                        >
                            ${currentText}
                        </p>
                    `;
                }
            );
        }
    );
}

            async function loadComments() {
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

                    commentsList.innerHTML = '';

                    commentCount.textContent =
                        comments.length;

                    comments.forEach(comment => {

                        const commentElement =
                            document.createElement('div');

                        commentElement.className =
                            'bg-light rounded p-2 mb-2';

                        commentElement.innerHTML = `
                            <div class="d-flex align-items-start gap-2">

                                <a href="profile.html?userId=${comment.author?._id}">
                                    <img
                                        src="${comment.author?.profileImage || 'facebookprofile.jpeg'}"
                                        alt="Profile"
                                        class="rounded-circle"
                                        width="35"
                                        height="35"
                                        style="object-fit: cover;"
                                    >
                                </a>

                                <div class="flex-grow-1">

                                    <div class="d-flex align-items-center gap-2">

                                        <a
                                            href="profile.html?userId=${comment.author?._id}"
                                            class="text-decoration-none text-dark"
                                        >
                                            <strong>
                                                ${comment.author?.firstName || ''}
                                                ${comment.author?.lastName || ''}
                                            </strong>
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


            if (saveButton) {

                saveButton.addEventListener(
                    'click',
                    async function () {

                        const postId =
                            this.dataset.id;

                        const currentlySaved =
                            this.dataset.saved === 'true';

                        try {

                            const response =
                                await fetch(
                                    `/api/saved-posts/${postId}`,
                                    {
                                        method:
                                            currentlySaved
                                                ? 'DELETE'
                                                : 'PUT'
                                    }
                                );

                            const data =
                                await response.json();

                            if (!response.ok) {

                                alert(
                                    data.message ||
                                    'אירעה שגיאה בשמירת הפוסט'
                                );

                                return;
                            }

                            const icon =
                                this.querySelector('i');

                            if (currentlySaved) {

                                this.dataset.saved =
                                    'false';

                                this.classList.remove(
                                    'text-primary'
                                );

                                this.classList.add(
                                    'text-secondary'
                                );

                                this.title =
                                    'שמור פוסט';

                                icon.classList.remove(
                                    'bi-bookmark-fill'
                                );

                                icon.classList.add(
                                    'bi-bookmark'
                                );

                                if (currentUser.savedPosts) {

                                    currentUser.savedPosts =
                                        currentUser.savedPosts.filter(
                                            id =>
                                                id.toString() !==
                                                postId.toString()
                                        );
                                }

                            } else {

                                this.dataset.saved =
                                    'true';

                                this.classList.remove(
                                    'text-secondary'
                                );

                                this.classList.add(
                                    'text-primary'
                                );

                                this.title =
                                    'הסר מהשמורים';

                                icon.classList.remove(
                                    'bi-bookmark'
                                );

                                icon.classList.add(
                                    'bi-bookmark-fill'
                                );

                                if (!currentUser.savedPosts) {
                                    currentUser.savedPosts = [];
                                }

                                currentUser.savedPosts.push(
                                    postId
                                );
                            }

                        } catch (error) {

                            console.error(
                                'Save post error:',
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

                                alert(
                                    'הפוסט נמחק בהצלחה'
                                );

                                loadPosts();

                            } else {

                                alert(
                                    data.message ||
                                    'אירעה שגיאה במחיקת הפוסט'
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
           if (shareButton) {

    shareButton.addEventListener(
        'click',
        async function () {

            const confirmShare =
                confirm('לשתף את הפוסט?');

            if (!confirmShare) {
                return;
            }

            try {

                const response =
                    await fetch(
                        `/api/posts/${post._id}/share`,
                        {
                            method: 'POST'
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    alert(
                        data.message ||
                        'אירעה שגיאה בשיתוף הפוסט'
                    );

                    return;
                }

                alert('הפוסט שותף בהצלחה');

                await loadPosts();

            } catch (error) {

                console.error(
                    'Share post error:',
                    error
                );

                alert(
                    'לא ניתן להתחבר לשרת'
                );
            }
        }
    );
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

                                likeButton
                                    .querySelector('span')
                                    .textContent =
                                    data.likesCount;

                            } else {

                                alert(
                                    data.message ||
                                    'אירעה שגיאה בעדכון הלייק'
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

                            await loadComments();

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
                            alert('יש לכתוב תגובה');
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

                                        body: JSON.stringify({
                                            text: text
                                        })
                                    }
                                );

                            const data =
                                await response.json();

                            if (response.ok) {

                                commentInput.value = '';

                                await loadComments();

                            } else {

                                alert(
                                    data.message ||
                                    'אירעה שגיאה בהוספת התגובה'
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
        });


        scrollToNotificationPost();

    } catch (error) {

        console.error(
            'Error loading posts:',
            error
        );
    }
}

function timeAgo(date) {

    const now =
        new Date();

    const created =
        new Date(date);

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

    selectPostImageBtn.addEventListener(
        'click',
        function () {

            postImageInput.click();

        }
    );
}


if (selectPostVideoBtn && postVideoInput) {

    selectPostVideoBtn.addEventListener(
        'click',
        function () {

            postVideoInput.click();

        }
    );
}


if (postImageInput) {

    postImageInput.addEventListener(
        'change',
        function () {

            const file =
                this.files[0];

            if (!file) {
                return;
            }

            if (selectedPostFile) {

                selectedPostFile.textContent =
                    `נבחרה תמונה: ${file.name}`;

            }

            if (postVideoInput) {
                postVideoInput.value = '';
            }

        }
    );
}


if (postVideoInput) {

    postVideoInput.addEventListener(
        'change',
        function () {

            const file =
                this.files[0];

            if (!file) {
                return;
            }

            if (selectedPostFile) {

                selectedPostFile.textContent =
                    `נבחר סרטון: ${file.name}`;

            }

            if (postImageInput) {
                postImageInput.value = '';
            }

        }
    );
}


if (selectPostFeelingBtn && feelingsMenu) {

    selectPostFeelingBtn.addEventListener(
        'click',
        function () {

            feelingsMenu.style.display =
                feelingsMenu.style.display === 'none'
                    ? 'block'
                    : 'none';

        }
    );
}


document
    .querySelectorAll('.feeling-option')
    .forEach(button => {

        button.addEventListener(
            'click',
            function () {

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

                if (feelingsMenu) {
                    feelingsMenu.style.display = 'none';
                }

            }
        );
    });


function scrollToNotificationPost() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const postId =
        params.get('postId');

    if (!postId) {
        return;
    }


    const postElement =
        document.getElementById(
            `post-${postId}`
        );

    if (!postElement) {
        return;
    }


    setTimeout(() => {

        const postTop =
            postElement
                .getBoundingClientRect()
                .top +
            window.scrollY;


        window.scrollTo({
            top: postTop - 80,
            behavior: 'smooth'
        });


        postElement
            .classList
            .add('shadow-lg');


        setTimeout(() => {

            postElement
                .classList
                .remove('shadow-lg');

        }, 2000);


    }, 1500);
}


async function loadTodayBirthdays() {

    try {

        if (!currentUser) {
            return;
        }


        const response =
            await fetch('/api/users');


        if (!response.ok) {
            return;
        }


        const users =
            await response.json();


        const today =
            new Date();

        const todayDay =
            today.getDate();

        const todayMonth =
            today.getMonth();


        const birthdayFriends =
            users.filter(user => {

                const isFriend =
                    currentUser.friends?.some(
                        friendId =>
                            friendId.toString() ===
                            user._id.toString()
                    );


                if (
                    !isFriend ||
                    !user.birthday
                ) {

                    return false;

                }


                const birthday =
                    new Date(
                        user.birthday
                    );


                return (
                    birthday.getDate() ===
                        todayDay &&
                    birthday.getMonth() ===
                        todayMonth
                );

            });


        const link =
            document.getElementById(
                'todayBirthdaysLink'
            );

        const content =
            document.getElementById(
                'todayBirthdaysContent'
            );

        const noBirthdays =
            document.getElementById(
                'noBirthdaysToday'
            );


        if (
            !link ||
            !content ||
            !noBirthdays
        ) {

            return;
        }


        if (
            birthdayFriends.length === 0
        ) {

            link.style.display =
                'none';

            noBirthdays.style.display =
                'block';

            return;
        }


        noBirthdays.style.display =
            'none';

        link.style.display =
            'block';


        const firstFriend =
            birthdayFriends[0];


        const firstName =
            `${
                firstFriend.firstName ||
                ''
            } ${
                firstFriend.lastName ||
                ''
            }`.trim();


        if (
            birthdayFriends.length === 1
        ) {

            content.innerHTML = `

                <div
                    class="d-flex align-items-center gap-2"
                >

                    <img
                        src="${
                            firstFriend.profileImage ||
                            'facebookprofile.jpeg'
                        }"
                        alt="Profile"
                        class="rounded-circle"
                        width="40"
                        height="40"
                        style="object-fit: cover;"
                    >

                    <div>
                        🎂 ל${firstName} יש היום יום הולדת
                    </div>

                </div>
            `;

        } else {

            const additionalCount =
                birthdayFriends.length - 1;


            content.innerHTML = `

                <div
                    class="d-flex align-items-center gap-2"
                >

                    <img
                        src="${
                            firstFriend.profileImage ||
                            'facebookprofile.jpeg'
                        }"
                        alt="Profile"
                        class="rounded-circle"
                        width="40"
                        height="40"
                        style="object-fit: cover;"
                    >

                    <div>
                        🎂 ל${firstName} ועוד ${additionalCount} נוספים יש היום יום הולדת
                    </div>

                </div>
            `;

        }


    } catch (error) {

        console.error(
            'Error loading today birthdays:',
            error
        );

    }
}


async function loadWeather(city) {

    const weatherResult =
        document.getElementById('weatherResult');

    if (!weatherResult) {
        return;
    }

    weatherResult.innerHTML = `
        <div class="text-muted">
            טוען מזג אוויר...
        </div>
    `;

    try {

        // חיפוש העיר וקבלת קווי אורך ורוחב
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=he&format=json`
        );

        if (!geoResponse.ok) {
            throw new Error('Geocoding service error');
        }

        const geoData =
            await geoResponse.json();

        if (
            !geoData.results ||
            geoData.results.length === 0
        ) {
            weatherResult.innerHTML = `
                <div class="text-danger">
                    העיר לא נמצאה
                </div>
            `;

            return;
        }

        const location =
            geoData.results[0];

        const latitude =
            location.latitude;

        const longitude =
            location.longitude;


        // קבלת מזג האוויר לפי המיקום
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m&timezone=auto`
        );

        if (!weatherResponse.ok) {
            throw new Error('Weather service error');
        }

        const weatherData =
            await weatherResponse.json();

        const current =
            weatherData.current;


        weatherResult.innerHTML = `

            <div class="mb-2">
                <i
                    class="bi bi-cloud-sun-fill text-primary"
                    style="font-size: 2.5rem;"
                ></i>
            </div>

            <h5 class="mb-1">
                ${location.name}
            </h5>

            <div class="text-muted small mb-3">
                ${location.country || ''}
            </div>

            <div
                class="fw-bold mb-3"
                style="font-size: 2rem;"
            >
                ${Math.round(current.temperature_2m)}°C
            </div>

            <div class="small mb-1">
                מרגיש כמו:
                <strong>
                    ${Math.round(current.apparent_temperature)}°C
                </strong>
            </div>

            <div class="small mb-1">
                לחות:
                <strong>
                    ${current.relative_humidity_2m}%
                </strong>
            </div>

            <div class="small">
                מהירות רוח:
                <strong>
                    ${current.wind_speed_10m} קמ״ש
                </strong>
            </div>
        `;

    } catch (error) {

        console.error(
            'Weather Web Service error:',
            error
        );

        weatherResult.innerHTML = `
            <div class="text-danger">
                לא ניתן לקבל כרגע נתוני מזג אוויר
            </div>
        `;
    }
}



const weatherSearchBtn =
    document.getElementById('weatherSearchBtn');

const weatherCityInput =
    document.getElementById('weatherCityInput');


if (
    weatherSearchBtn &&
    weatherCityInput
) {

    weatherSearchBtn.addEventListener(
        'click',
        function () {

            const city =
                weatherCityInput.value.trim();

            if (!city) {
                alert('יש להזין שם עיר');
                return;
            }

            loadWeather(city);
        }
    );


    // מאפשר גם לחיצה כל מקש אנטר
    weatherCityInput.addEventListener(
        'keydown',
        function (event) {

            if (event.key === 'Enter') {

                event.preventDefault();

                const city =
                    weatherCityInput.value.trim();

                if (!city) {
                    return;
                }

                loadWeather(city);
            }
        }
    );
}

async function initializeHomePage() {

    await loadCurrentUser();

    await loadPosts();

    await loadTodayBirthdays();

}


initializeHomePage();