let savedPosts = [];

async function loadSavedPosts() {
    try {
        const response = await fetch('/api/saved-posts');

        if (!response.ok) {
            return;
        }

        savedPosts = await response.json();

        const container =
            document.getElementById('savedPostsContainer');

        container.innerHTML = '';

        if (savedPosts.length === 0) {
            container.innerHTML = `
                <div class="card shadow-sm border-0 rounded-4">
                    <div class="card-body text-center py-5">
                        <i class="bi bi-bookmark fs-1 text-muted"></i>

                        <h4 class="mt-3">
                            עדיין אין פוסטים שמורים
                        </h4>

                        <div class="text-muted">
                            פוסטים שתשמור יופיעו כאן
                        </div>
                    </div>
                </div>
            `;

            return;
        }

        savedPosts.forEach(post => {
            const postElement =
                document.createElement('div');

            postElement.className =
                'card mb-4 shadow-sm border-0 rounded-4';

            postElement.id =
                `saved-post-${post._id}`;

            postElement.innerHTML = `
                <div class="card-body">

                    <div class="d-flex justify-content-between align-items-start mb-3">

                        <div class="d-flex align-items-center gap-2">

                            <a href="profile.html?userId=${post.author?._id}">
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

                                <a
                                    href="profile.html?userId=${post.author?._id}"
                                    class="text-decoration-none text-dark"
                                >
                                    <strong>
                                        ${post.author?.firstName || ''}
                                        ${post.author?.lastName || ''}
                                    </strong>
                                </a>

                                <div class="text-muted small">
                                    ${new Date(post.createdAt).toLocaleString('he-IL')}
                                </div>

                                ${
                                    post.group
                                        ? `
                                            <div class="text-muted small">
                                                בקבוצה:
                                                <a
                                                    href="group.html?groupId=${post.group._id}"
                                                    class="text-decoration-none"
                                                >
                                                    ${post.group.name || ''}
                                                </a>
                                            </div>
                                        `
                                        : ''
                                }

                            </div>

                        </div>

                        <button
                            type="button"
                            class="btn btn-light remove-saved-post-btn"
                            data-id="${post._id}"
                            title="הסר מהשמורים"
                        >
                            <i class="bi bi-bookmark-fill text-primary"></i>
                        </button>

                    </div>

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
                                    class="w-100 rounded mb-3"
                                    style="max-height: 600px;"
                                >
                                    <source src="${post.video}">
                                    הדפדפן שלך אינו תומך בהצגת סרטונים.
                                </video>
                            `
                            : ''
                    }

                    <div class="border-top pt-3">

                        <a
                            href="file.html?postId=${post._id}"
                            class="btn btn-outline-primary btn-sm"
                        >
                            <i class="bi bi-box-arrow-up-right"></i>
                            פתח את הפוסט
                        </a>

                    </div>

                </div>
            `;

            container.appendChild(
                postElement
            );
        });

        initializeRemoveSavedButtons();

    } catch (error) {
        console.error(
            'Error loading saved posts:',
            error
        );
    }
}


function initializeRemoveSavedButtons() {
    const buttons =
        document.querySelectorAll(
            '.remove-saved-post-btn'
        );

    buttons.forEach(button => {
        button.addEventListener(
            'click',
            async function () {

                const postId =
                    this.dataset.id;

                try {
                    const response =
                        await fetch(
                            `/api/saved-posts/${postId}`,
                            {
                                method: 'DELETE'
                            }
                        );

                    const data =
                        await response.json();

                    if (!response.ok) {
                        alert(
                            data.message ||
                            'אירעה שגיאה בהסרת הפוסט'
                        );

                        return;
                    }

                    const postElement =
                        document.getElementById(
                            `saved-post-${postId}`
                        );

                    if (postElement) {
                        postElement.remove();
                    }

                    savedPosts =
                        savedPosts.filter(
                            post =>
                                post._id.toString() !==
                                postId.toString()
                        );

                    if (savedPosts.length === 0) {
                        const container =
                            document.getElementById(
                                'savedPostsContainer'
                            );

                        container.innerHTML = `
                            <div class="card shadow-sm border-0 rounded-4">
                                <div class="card-body text-center py-5">
                                    <i class="bi bi-bookmark fs-1 text-muted"></i>

                                    <h4 class="mt-3">
                                        עדיין אין פוסטים שמורים
                                    </h4>

                                    <div class="text-muted">
                                        פוסטים שתשמור יופיעו כאן
                                    </div>
                                </div>
                            </div>
                        `;
                    }

                } catch (error) {
                    console.error(
                        'Error removing saved post:',
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


loadSavedPosts();