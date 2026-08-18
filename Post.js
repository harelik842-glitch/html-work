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


async function loadPosts() {
    try {
        const response = await fetch('/api/posts');
        const posts = await response.json();

        const postsContainer = document.getElementById('postsContainer');
        postsContainer.innerHTML = '';

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'card mb-4';

           
               postElement.innerHTML = `
    <div class="card-body">

        <div class="d-flex align-items-center gap-2 mb-3">
            <img src="harel.jpg"
                 alt="Profile"
                 class="rounded-circle"
                 width="40"
                 height="40">

            <div>
                <strong>
                    ${post.author?.firstName || ''} ${post.author?.lastName || ''}
                </strong>

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
        class="btn p-0 border-0 bg-transparent text-secondary d-flex align-items-center gap-1">
        <span>0</span>
        <i class="bi bi-chat fs-5"></i>
    </button>

    <button
        class="btn p-0 border-0 bg-transparent text-secondary d-flex align-items-center gap-1 like-post-btn"
        data-id="${post._id}">
        <span>${post.likes?.length || 0}</span>
        <i class="bi bi-hand-thumbs-up fs-5"></i>
    </button>




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
            loadPosts();
        } else {
            alert(data.message || 'אירעה שגיאה בעדכון הלייק');
        }

    } catch (error) {
        console.error(error);
        alert('לא ניתן להתחבר לשרת');
    }
});
        });

    } catch (error) {
        console.error('Error loading posts:', error);
    }
}


loadPosts();