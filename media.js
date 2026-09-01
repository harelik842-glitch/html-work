function timeAgo(date) {
    const now = new Date();
    const created = new Date(date);
    const seconds = Math.floor((now - created) / 1000);

    if (seconds < 60) return 'עכשיו';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `לפני ${minutes} דקות`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `לפני ${hours} שעות`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `לפני ${days} ימים`;

    const months = Math.floor(days / 30);
    if (months < 12) return `לפני ${months} חודשים`;

    const years = Math.floor(months / 12);
    return `לפני ${years} שנים`;
}

function setupVideoAutoplay() {
    const videos = document.querySelectorAll('.feed-video');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const video = entry.target;

            if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {

                videos.forEach(otherVideo => {
                    if (otherVideo !== video) {
                        otherVideo.pause();
                    }
                });

                video.play().catch(error => {
                    console.log('Autoplay blocked:', error);
                });

            } else {
                video.pause();
            }
        });
    }, {
        threshold: 0.6
    });

    videos.forEach(video => {
        observer.observe(video);
    });
}


async function loadVideos() {
    try {
        const response = await fetch('/api/videos');

        if (!response.ok) {
            console.error('Error loading videos');
            return;
        }

        const posts = await response.json();
        const container = document.getElementById('videosContainer');

        container.innerHTML = '';

        if (posts.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <div class="card-body text-center text-muted py-5">
                        עדיין אין סרטונים להצגה
                    </div>
                </div>
            `;
            return;
        }

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'card mb-4 shadow-sm';

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
                                style="object-fit: cover;"
                            >
                        </a>

                        <div>
                            <a href="profile.html?userId=${post.author?._id}" class="text-decoration-none text-dark">
                                <strong>${post.author?.firstName || ''} ${post.author?.lastName || ''}</strong>
                            </a>

                            <div class="text-muted small">
                                ${timeAgo(post.createdAt)}
                            </div>
                        </div>

                    </div>

                    ${post.text ? `<p class="mb-3">${post.text}</p>` : ''}
<video muted loop playsinline controls class="feed-video w-100 rounded mb-3" style="max-height: 650px; background: black;">
    <source src="${post.video}">
    הדפדפן שלך אינו תומך בהצגת סרטונים.
</video>
                    <hr class="my-2">

                    <div class="d-flex justify-content-end align-items-center gap-4 pt-2" style="direction: ltr;">

                        <button type="button" class="btn p-0 border-0 bg-transparent text-secondary d-flex align-items-center gap-1 like-video-btn">
                            <span>${post.likes?.length || 0}</span>
                            <i class="bi bi-hand-thumbs-up fs-5"></i>
                        </button>

                        <button type="button" class="btn p-0 border-0 bg-transparent text-secondary d-flex align-items-center gap-1 comment-video-btn">
                            <span class="video-comment-count">0</span>
                            <i class="bi bi-chat fs-5"></i>
                        </button>

                    </div>

                    <div class="video-comments-section mt-3" style="display: none;">
                        <div class="video-comments-list mb-2"></div>

                        <div class="d-flex gap-2">
                            <input type="text" class="form-control video-comment-input" placeholder="כתוב תגובה...">

                            <button type="button" class="btn btn-primary add-video-comment-btn">
                                <i class="bi bi-send"></i>
                            </button>
                        </div>
                    </div>

                </div>
            `;

            container.appendChild(postElement);
            setupVideoActions(postElement, post);
        });

        setupVideoAutoplay();

    } catch (error) {
        console.error('Error loading videos:', error);
    }
}


function setupVideoActions(postElement, post) {
    const likeButton = postElement.querySelector('.like-video-btn');
    const commentButton = postElement.querySelector('.comment-video-btn');
    const commentsSection = postElement.querySelector('.video-comments-section');
    const commentsList = postElement.querySelector('.video-comments-list');
    const commentCount = postElement.querySelector('.video-comment-count');
    const commentInput = postElement.querySelector('.video-comment-input');
    const addCommentButton = postElement.querySelector('.add-video-comment-btn');

    async function loadComments() {
        try {
            const response = await fetch(`/api/posts/${post._id}/comments`);

            if (!response.ok) return;

            const comments = await response.json();

            commentsList.innerHTML = '';
            commentCount.textContent = comments.length;

            comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.className = 'bg-light rounded p-2 mb-2';

                commentElement.innerHTML = `
                    <div>
                        <strong>${comment.author?.firstName || ''} ${comment.author?.lastName || ''}</strong>
                        <span class="text-muted small me-2">${timeAgo(comment.createdAt)}</span>
                    </div>

                    <div>${comment.text}</div>
                `;

                commentsList.appendChild(commentElement);
            });

        } catch (error) {
            console.error('Error loading video comments:', error);
        }
    }


    if (likeButton) {
        likeButton.addEventListener('click', async function () {
            try {
                const response = await fetch(`/api/posts/${post._id}/like`, { method: 'PUT' });
                const data = await response.json();

                if (response.ok) {
                    likeButton.querySelector('span').textContent = data.likesCount ?? data.likes?.length ?? 0;
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
                    body: JSON.stringify({ text })
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
}

async function loadCurrentUserProfileImage() {
    try {
        const response = await fetch('/api/current-user');

        if (!response.ok) {
            return;
        }

        const user = await response.json();

        const profileImages = document.querySelectorAll('.current-user-profile-image');

        profileImages.forEach(image => {
            if (user.profileImage) {
                image.src = user.profileImage;
            }
        });

    } catch (error) {
        console.error('Error loading current user profile image:', error);
    }
}


loadCurrentUserProfileImage();
loadVideos();