async function loadMemories() {
    try {
        const response =
            await fetch('/api/memories');

        if (!response.ok) {
            return;
        }

        const memories =
            await response.json();

        const container =
            document.getElementById(
                'memoriesContainer'
            );

        container.innerHTML = '';

        if (memories.length === 0) {
            container.innerHTML = `
                <div class="card shadow-sm border-0 rounded-4">
                    <div class="card-body text-center py-5">

                        <i class="bi bi-clock-history fs-1 text-muted"></i>

                        <h4 class="mt-3">
                            אין לך זכרונות מהיום
                        </h4>

                        <div class="text-muted">
                            כשיהיו פוסטים שפרסמת ביום הזה בשנים קודמות,
                            הם יופיעו כאן.
                        </div>

                    </div>
                </div>
            `;

            return;
        }

        const currentYear =
            new Date().getFullYear();

        memories.forEach(post => {

            const postDate =
                new Date(post.createdAt);

            const yearsAgo =
                currentYear -
                postDate.getFullYear();

            const postElement =
                document.createElement('div');

            postElement.className =
                'mb-4';

            postElement.innerHTML = `
                <div class="mb-3">

                    <h3 class="fw-bold mb-1">
                        ביום הזה
                    </h3>

                    <div class="fs-5 text-muted">
                        לפני ${yearsAgo} ${yearsAgo === 1 ? 'שנה' : 'שנים'}
                    </div>

                </div>

                <div class="card shadow-sm border-0 rounded-4">

                    <div class="card-body">

                        <div class="d-flex align-items-center gap-3 mb-3">

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
                                    ${postDate.toLocaleDateString(
                                        'he-IL',
                                        {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        }
                                    )}
                                </div>

                            </div>

                        </div>

                        ${
                            post.text
                                ? `
                                    <p class="fs-5 mb-3">
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
                                        alt="Post"
                                        class="img-fluid rounded-3 w-100"
                                        style="
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
                                        class="w-100 rounded-3"
                                        style="max-height: 600px;"
                                    >
                                        <source src="${post.video}">
                                    </video>
                                `
                                : ''
                        }

                    </div>

                </div>

            `;

            container.appendChild(
                postElement
            );
        });

    } catch (error) {
        console.error(
            'Error loading memories:',
            error
        );
    }
}

loadMemories();