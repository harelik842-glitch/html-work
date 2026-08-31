let currentUser = null;


async function loadCurrentUser() {
    try {

        const response =
            await fetch('/api/current-user');

        if (!response.ok) {
            return;
        }

        currentUser =
            await response.json();

    } catch (error) {

        console.error(
            'Error loading current user:',
            error
        );
    }
}


const createGroupForm =
    document.getElementById(
        'createGroupForm'
    );


if (createGroupForm) {

    createGroupForm.addEventListener(
        'submit',
        async function (event) {

            event.preventDefault();

            const groupData = {
                name:
                    document
                        .getElementById('groupName')
                        .value
                        .trim(),

                description:
                    document
                        .getElementById('groupDescription')
                        .value
                        .trim(),

                address:
                    document
                        .getElementById('groupAddress')
                        .value
                        .trim(),

                image: ''
            };


            if (groupData.name === '') {

                alert(
                    'יש להזין שם לקבוצה'
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        '/api/groups',
                        {
                            method: 'POST',

                            headers: {
                                'Content-Type':
                                    'application/json'
                            },

                            body:
                                JSON.stringify(
                                    groupData
                                )
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    alert(
                        'הקבוצה נוצרה בהצלחה'
                    );

                    document
                        .getElementById(
                            'createGroupForm'
                        )
                        .reset();

                    loadGroups();
                    loadMyGroups();

                } else {

                    alert(
                        data.message ||
                        'אירעה שגיאה ביצירת הקבוצה'
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


async function loadGroups() {
    try {

        const response =
            await fetch('/api/groups');

        if (!response.ok) {
            return;
        }


        const groups =
            await response.json();


        const discoverGroupsContainer =
            document.getElementById(
                'discoverGroupsContainer'
            );


        if (!discoverGroupsContainer) {
            return;
        }


        discoverGroupsContainer.innerHTML =
            '';


        // מציג רק קבוצות שהמשתמש עדיין לא חבר בהן
        const newGroups =
            groups.filter(group => {

                const isMember =
                    group.members?.some(
                        member =>
                            member._id
                                ?.toString() ===
                            currentUser?._id
                                ?.toString()
                    );

                return !isMember;
            });


        if (newGroups.length === 0) {

            discoverGroupsContainer.innerHTML = `
                <div class="text-muted">
                    אין כרגע קבוצות חדשות להצטרפות
                </div>
            `;

            return;
        }


        newGroups.forEach(group => {

            const groupElement =
                document.createElement(
                    'div'
                );


            groupElement.className =
                'border rounded p-3 mb-3';


            groupElement.innerHTML = `
                <div class="d-flex align-items-center gap-3 mb-2">

                    <a
                        href="group.html?groupId=${group._id}"
                        class="text-decoration-none"
                    >
                        <img
                            src="${group.image || 'harel.jpg'}"
                            alt="Group"
                            class="rounded-circle"
                            width="55"
                            height="55"
                            style="object-fit: cover;"
                        >
                    </a>

                    <div>

                        <a
                            href="group.html?groupId=${group._id}"
                            class="text-decoration-none text-dark"
                        >
                            <strong>
                                ${group.name}
                            </strong>
                        </a>

                        <div class="text-muted small">
                            ${group.members?.length || 0} חברים
                        </div>

                    </div>

                </div>

                <div class="text-muted small mb-2">
                    ${group.description || ''}
                </div>

                <button
                    class="btn btn-primary btn-sm join-group-btn"
                    data-id="${group._id}"
                >
                    הצטרף לקבוצה
                </button>
            `;


            discoverGroupsContainer
                .appendChild(
                    groupElement
                );


            const joinButton =
                groupElement.querySelector(
                    '.join-group-btn'
                );


            joinButton.addEventListener(
                'click',
                async function () {

                    const groupId =
                        this.dataset.id;


                    try {

                        const response =
                            await fetch(
                                `/api/groups/${groupId}/join`,
                                {
                                    method: 'PUT'
                                }
                            );


                        const data =
                            await response.json();


                        if (response.ok) {

                            await loadGroups();
                            await loadMyGroups();
                            await loadGroupsFeed();

                            alert(
                                'הצטרפת לקבוצה בהצלחה'
                            );

                        } else {

                            alert(
                                data.message ||
                                'אירעה שגיאה בהצטרפות לקבוצה'
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
        });


    } catch (error) {

        console.error(
            'Error loading groups:',
            error
        );
    }
}


async function loadMyGroups() {
    try {

        const response =
            await fetch('/api/my-groups');

        if (!response.ok) {
            return;
        }


        const groups =
            await response.json();


        const myGroupsContainer =
            document.getElementById(
                'myGroupsContainer'
            );


        myGroupsContainer.innerHTML =
            '';


        groups.forEach(group => {

            const groupElement =
                document.createElement(
                    'div'
                );


            groupElement.className =
                'border rounded p-3 mb-2';


            groupElement.innerHTML = `
                <a
                    href="group.html?groupId=${group._id}"
                    class="d-flex align-items-center gap-3 text-decoration-none text-dark"
                >

                    <img
                        src="${group.image || 'harel.jpg'}"
                        alt="Group"
                        class="rounded-circle"
                        width="55"
                        height="55"
                        style="object-fit: cover;"
                    >

                    <div>

                        <strong>
                            ${group.name}
                        </strong>

                        <div class="text-muted small">
                            ${group.description || ''}
                        </div>

                    </div>

                </a>
            `;


            myGroupsContainer.appendChild(
                groupElement
            );
        });


    } catch (error) {

        console.error(
            'Error loading user groups:',
            error
        );
    }
}


// הופך את זמן הפרסום לטקסט כמו "לפני 5 דקות"
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
        Math.floor(
            seconds / 60
        );


    if (minutes < 60) {
        return `לפני ${minutes} דקות`;
    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if (hours < 24) {
        return `לפני ${hours} שעות`;
    }


    const days =
        Math.floor(
            hours / 24
        );


    if (days < 30) {
        return `לפני ${days} ימים`;
    }


    const months =
        Math.floor(
            days / 30
        );


    if (months < 12) {
        return `לפני ${months} חודשים`;
    }


    const years =
        Math.floor(
            months / 12
        );


    return `לפני ${years} שנים`;
}


async function loadGroupsFeed() {
    try {

        const myGroupsResponse =
            await fetch(
                '/api/my-groups'
            );


        if (!myGroupsResponse.ok) {
            return;
        }


        const myGroups =
            await myGroupsResponse.json();


        const feedContainer =
            document.getElementById(
                'groupsFeedContainer'
            );


        if (!feedContainer) {
            return;
        }


        feedContainer.innerHTML =
            '';


        if (myGroups.length === 0) {

            feedContainer.innerHTML = `
                <div class="text-muted">
                    עדיין אין פוסטים להצגה
                </div>
            `;

            return;
        }


        // מביא את הפוסטים מכל הקבוצות שהמשתמש חבר בהן
        const requests =
            myGroups.map(group =>
                fetch(
                    `/api/groups/${group._id}/posts`
                )
                    .then(response => {

                        if (!response.ok) {
                            return [];
                        }

                        return response.json();
                    })
            );


        const results =
            await Promise.all(
                requests
            );


        const posts =
            results.flat();


        // מסדר את כל הפוסטים מהחדש לישן
        posts.sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );


        if (posts.length === 0) {

            feedContainer.innerHTML = `
                <div class="text-muted">
                    עדיין אין פוסטים בקבוצות שלך
                </div>
            `;

            return;
        }


        posts.forEach(post => {

            const postElement =
                document.createElement(
                    'div'
                );


            postElement.className =
                'card mb-3';


            postElement.innerHTML = `
                <div class="card-body">

                    <div class="d-flex align-items-center gap-3 mb-3">

                        <a
                            href="profile.html?userId=${post.author?._id}"
                            class="text-decoration-none"
                        >
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

                                פורסם בקבוצה:

                                <a
                                    href="group.html?groupId=${post.group?._id}"
                                    class="text-decoration-none fw-semibold"
                                >
                                    ${post.group?.name || ''}
                                </a>

                                · ${timeAgo(post.createdAt)}

                            </div>

                        </div>

                    </div>

                    <p class="mb-3">
                        ${post.text || ''}
                    </p>

                    ${
                        post.image
                            ? `
                                <img
                                    src="${post.image}"
                                    alt="Post image"
                                    class="img-fluid rounded mb-3"
                                    style="
                                        max-height: 500px;
                                        width: 100%;
                                        object-fit: cover;
                                    "
                                >
                            `
                            : ''
                    }

                    <hr class="my-2">

                    <div
                        class="d-flex justify-content-end align-items-center gap-4 pt-2 pe-2"
                        style="direction: ltr;"
                    >

                        <button
                            class="btn p-0 border-0 bg-transparent text-secondary d-flex align-items-center gap-1 like-groups-feed-btn"
                            data-id="${post._id}"
                        >
                            <span>
                                ${post.likes?.length || 0}
                            </span>

                            <i class="bi bi-hand-thumbs-up fs-5"></i>
                        </button>


                        <button
                            class="btn p-0 border-0 bg-transparent text-secondary d-flex align-items-center gap-1 comment-groups-feed-btn"
                            data-id="${post._id}"
                        >
                            <span class="groups-feed-comment-count">
                                0
                            </span>

                            <i class="bi bi-chat fs-5"></i>
                        </button>


                        ${
                            currentUser &&
                            post.author?._id?.toString() ===
                            currentUser._id?.toString()

                                ? `
                                    <button
                                        class="btn p-0 border-0 bg-transparent text-secondary delete-groups-feed-btn"
                                        data-id="${post._id}"
                                    >
                                        <i class="bi bi-trash3 fs-5"></i>
                                    </button>
                                `
                                : ''
                        }

                    </div>


                    <div
                        class="groups-feed-comments-section mt-3"
                        style="display: none;"
                    >

                        <div
                            class="groups-feed-comments-list mb-2"
                        ></div>

                        <div class="d-flex gap-2">

                            <input
                                type="text"
                                class="form-control groups-feed-comment-input"
                                placeholder="כתוב תגובה..."
                            >

                            <button
                                type="button"
                                class="btn btn-primary add-groups-feed-comment-btn"
                                data-id="${post._id}"
                            >
                                <i class="bi bi-send"></i>
                            </button>

                        </div>

                    </div>

                </div>
            `;


            feedContainer.appendChild(
                postElement
            );


            const commentCount =
                postElement.querySelector(
                    '.groups-feed-comment-count'
                );


            async function loadInitialCommentCount() {
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


                    if (commentCount) {
                        commentCount.textContent =
                            comments.length;
                    }


                } catch (error) {

                    console.error(
                        'Error loading comment count:',
                        error
                    );
                }
            }


            loadInitialCommentCount();

            setupGroupsFeedPostActions(
                postElement,
                post
            );
        });


    } catch (error) {

        console.error(
            'Error loading groups feed:',
            error
        );
    }
}


const groupsSearchInput =
    document.getElementById(
        'groupsSearchInput'
    );

const groupsSearchResults =
    document.getElementById(
        'groupsSearchResults'
    );


if (
    groupsSearchInput &&
    groupsSearchResults
) {

    groupsSearchInput.addEventListener(
        'input',
        async function () {

            const searchText =
                this.value.trim();


            if (searchText.length < 2) {

                groupsSearchResults.style.display =
                    'none';

                groupsSearchResults.innerHTML =
                    '';

                return;
            }


            try {

                const response =
                    await fetch(
                        `/api/search/groups?q=${encodeURIComponent(searchText)}`
                    );


                const groups =
                    response.ok
                        ? await response.json()
                        : [];


                groupsSearchResults.innerHTML =
                    '';


                if (groups.length === 0) {

                    groupsSearchResults.innerHTML = `
                        <div class="p-3 text-muted">
                            לא נמצאו קבוצות
                        </div>
                    `;

                    groupsSearchResults.style.display =
                        'block';

                    return;
                }


                groups.forEach(group => {

                    const groupElement =
                        document.createElement(
                            'a'
                        );


                    groupElement.href =
                        `group.html?groupId=${group._id}`;


                    groupElement.className =
                        'd-flex align-items-center gap-3 p-3 text-decoration-none text-dark border-bottom';


                    groupElement.innerHTML = `
                        <img
                            src="${group.image || 'harel.jpg'}"
                            alt="Group"
                            class="rounded-circle"
                            width="50"
                            height="50"
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
                                <i class="bi bi-people-fill"></i>
                                ${group.members?.length || 0} חברים
                            </div>

                            <div class="text-muted small">
                                ${group.address || ''}
                            </div>

                        </div>
                    `;


                    groupsSearchResults.appendChild(
                        groupElement
                    );
                });


                groupsSearchResults.style.display =
                    'block';


            } catch (error) {

                console.error(
                    'Group search error:',
                    error
                );
            }
        }
    );
}


// מטפל בלייקים, תגובות ומחיקת פוסט בפיד הקבוצות
function setupGroupsFeedPostActions(
    postElement,
    post
) {

    const likeButton =
        postElement.querySelector(
            '.like-groups-feed-btn'
        );

    const commentButton =
        postElement.querySelector(
            '.comment-groups-feed-btn'
        );

    const deleteButton =
        postElement.querySelector(
            '.delete-groups-feed-btn'
        );

    const commentsSection =
        postElement.querySelector(
            '.groups-feed-comments-section'
        );

    const commentsList =
        postElement.querySelector(
            '.groups-feed-comments-list'
        );

    const commentCount =
        postElement.querySelector(
            '.groups-feed-comment-count'
        );

    const commentInput =
        postElement.querySelector(
            '.groups-feed-comment-input'
        );

    const addCommentButton =
        postElement.querySelector(
            '.add-groups-feed-comment-btn'
        );


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
                                data.likes?.length ??
                                data.likesCount ??
                                0;
                        }

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

                        postElement.remove();

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
}


// טוען את כל המידע של עמוד הקבוצות
async function initializeGroupsPage() {

    await loadCurrentUser();

    loadGroups();
    loadMyGroups();
    loadGroupsFeed();
}


initializeGroupsPage();