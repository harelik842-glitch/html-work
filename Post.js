async function loadCurrentUserImage() {
    try {
        const response = await fetch('/api/current-user');

        if (!response.ok) {
            return;
        }

        const user = await response.json();

        if (!user.profileImage) {
            return;
        }

        const images =
            document.querySelectorAll('.current-user-profile-image');

        images.forEach(image => {
            image.src = user.profileImage;
        });

    } catch (error) {
        console.error('Error loading current user image:', error);
    }
}
document.getElementById('publishPostBtn').addEventListener('click', async function () {
    const postText = document.getElementById('postText').value.trim();

    if (postText === '') {
        alert('יש לכתוב תוכן לפוסט');
        return;
    }

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: postText,
                image: ''
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('הפוסט פורסם בהצלחה');
            document.getElementById('postText').value = '';
            loadPosts();
        } else {
            alert(data.message || 'אירעה שגיאה ביצירת הפוסט');
        }

    } catch (error) {
        console.error(error);
        alert('לא ניתן להתחבר לשרת');
    }
});

async function loadCurrentUserProfileImage() {
    try {
        const response = await fetch('/api/current-user');

        if (!response.ok) {
            return;
        }

        const user = await response.json();

        const profileImage =
            document.getElementById('currentUserProfileImage');

        if (profileImage && user.profileImage) {
            profileImage.src = user.profileImage;
        }

    } catch (error) {
        console.error('Error loading current user image:', error);
    }
}

async function loadPosts() {
    try {
        const response = await fetch('/api/feed');
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
    <img
        src="${post.author?.profileImage || 'harel.jpg'}"
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

                <div class="text-muted small">
                    ${new Date(post.createdAt).toLocaleString('he-IL')}
                </div>
            </div>
        </div>

        <p class="mb-3">${post.text}</p>

        <hr class="my-2">

       <div class="d-flex justify-content-end align-items-center gap-4 pt-2 pe-2"
     style="direction: ltr;">

      <button
        class="btn p-0 border-0 bg-transparent text-secondary delete-post-btn"
        data-id="${post._id}">
        <i class="bi bi-trash3 fs-5"></i>
    </button>

     <button
    class="btn p-0 border-0 bg-transparent text-secondary d-flex align-items-center gap-1 comment-post-btn"
    data-id="${post._id}">
    <span class="comment-count">0</span>
    <i class="bi bi-chat fs-5"></i>
</button>

    <button
        class="btn p-0 border-0 bg-transparent text-secondary d-flex align-items-center gap-1 like-post-btn"
        data-id="${post._id}">
        <span>${post.likes?.length || 0}</span>
        <i class="bi bi-hand-thumbs-up fs-5"></i>
    </button>




</div>
<div class="comments-section mt-3" data-post-id="${post._id}" style="display: none;">

    <div class="comments-list mb-2"></div>

    <div class="d-flex gap-2">
        <input
            type="text"
            class="form-control comment-input"
            placeholder="כתוב תגובה...">

        <button
            class="btn btn-primary add-comment-btn"
            data-id="${post._id}">
            <i class="bi bi-send"></i>
        </button>
    </div>

</div>
    </div>
`;
            

            postsContainer.appendChild(postElement);

            const deleteButton =
                postElement.querySelector('.delete-post-btn');

            deleteButton.addEventListener('click', async function () {
                const postId = this.dataset.id;

                try {
                    const response = await fetch(`/api/posts/${postId}`, {
                        method: 'DELETE'
                    });

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

            const likeButton =
    postElement.querySelector('.like-post-btn');

likeButton.addEventListener('click', async function () {
    const postId = this.dataset.id;

    try {
        const response = await fetch(`/api/posts/${postId}/like`, {
            method: 'PUT'
        });

        const data = await response.json();

        if (response.ok) {
            const likeCount = likeButton.querySelector('span');
            likeCount.textContent = data.likesCount;
        } else {
            alert(data.message || 'אירעה שגיאה בעדכון הלייק');
        }

    } catch (error) {
        console.error(error);
        alert('לא ניתן להתחבר לשרת');
    }
});

const commentButton =
    postElement.querySelector('.comment-post-btn');

const commentsSection =
    postElement.querySelector('.comments-section');

commentButton.addEventListener('click', function () {
    if (commentsSection.style.display === 'none') {
        commentsSection.style.display = 'block';
            loadComments();

    } else {
        commentsSection.style.display = 'none';
    }
});


async function loadComments() {
    try {
        const response = await fetch(`/api/posts/${post._id}/comments`);
        const comments = await response.json();

        const commentsList =
            postElement.querySelector('.comments-list');

        const commentCount =
            postElement.querySelector('.comment-count');

        commentsList.innerHTML = '';

        commentCount.textContent = comments.length;

        comments.forEach(comment => {
            const commentElement = document.createElement('div');

            commentElement.className =
                'bg-light rounded p-2 mb-2';

           commentElement.innerHTML = `
    <div class="d-flex justify-content-between align-items-start">
        <div>
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
        </div>

        <button
            class="btn p-0 border-0 bg-transparent text-secondary delete-comment-btn"
            data-id="${comment._id}">
            <i class="bi bi-trash3"></i>
        </button>
    </div>
`;

            commentsList.appendChild(commentElement);

        const deleteCommentButton =
    commentElement.querySelector('.delete-comment-btn');

deleteCommentButton.addEventListener('click', async function () {
    const commentId = this.dataset.id;

    try {
        const response = await fetch(`/api/comments/${commentId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            loadComments();
        } else {
            alert(data.message || 'אירעה שגיאה במחיקת התגובה');
        }

    } catch (error) {
        console.error(error);
        alert('לא ניתן להתחבר לשרת');
    }
});

        });

    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

const addCommentButton =
    postElement.querySelector('.add-comment-btn');

const commentInput =
    postElement.querySelector('.comment-input');

addCommentButton.addEventListener('click', async function () {
    const postId = this.dataset.id;
    const text = commentInput.value.trim();

    if (text === '') {
        alert('יש לכתוב תגובה');
        return;
    }

    try {
        const response = await fetch(`/api/posts/${postId}/comments`, {
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
            loadComments();
        } else {
            alert(data.message || 'אירעה שגיאה בהוספת התגובה');
        }

    } catch (error) {
        console.error(error);
        alert('לא ניתן להתחבר לשרת');
    }
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

        });

    } catch (error) {
        console.error('Error loading posts:', error);
    }
}


loadPosts();
loadCurrentUserProfileImage();
loadCurrentUserImage();