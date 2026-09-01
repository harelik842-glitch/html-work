let currentUser = null;
let selectedUserId = null;
let allConversations = [];
let currentMessagesFilter = 'all';

async function loadCurrentUser() {
    try {
        const response = await fetch('/api/current-user');

        if (!response.ok) {
            window.location.href = 'index.html';
            return;
        }

        currentUser = await response.json();

    } catch (error) {
        console.error('Error loading current user:', error);
    }
}

async function loadConversations() {
    try {
        const response = await fetch('/api/conversations');

        if (!response.ok) {
            return;
        }

allConversations = await response.json();

const conversations =
    currentMessagesFilter === 'unread'
        ? allConversations.filter(
            conversation => conversation.unreadCount > 0
        )
        : allConversations;
                const container = document.getElementById('conversationsContainer');

        container.innerHTML = '';

       if (conversations.length === 0) {

    if (currentMessagesFilter === 'unread') {
        container.innerHTML = `
            <div class="text-muted py-3">
                אין הודעות שלא נקראו
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="text-muted py-3">
                עדיין אין לך שיחות
            </div>
        `;
    }

    return;

        }

        conversations.forEach(conversation => {
            const user = conversation.user;
            const lastMessage = conversation.lastMessage;
            const unreadCount = conversation.unreadCount || 0;

            const conversationElement = document.createElement('div');

            conversationElement.className =
                'd-flex align-items-center justify-content-between border-bottom py-3 px-2';

            conversationElement.style.cursor = 'pointer';

            conversationElement.innerHTML = `
                <div class="d-flex align-items-center gap-3">

                    <img
                        src="${user.profileImage || 'facebookprofile.jpeg'}"
                        alt="Profile"
                        class="rounded-circle"
                        width="50"
                        height="50"
                        style="object-fit: cover;"
                    >

                    <div>
                        <strong>
                            ${user.firstName || ''}
                            ${user.lastName || ''}
                        </strong>

                        <div class="d-flex align-items-center justify-content-between gap-3">

    <div class="text-muted small text-truncate">
        ${lastMessage?.text || ''}
    </div>

    <div class="text-muted small flex-shrink-0">
        ${lastMessage?.createdAt ? formatLastMessageTime(lastMessage.createdAt) : ''}
    </div>

</div>
                    </div>

                </div>

                ${
                    unreadCount > 0
                        ? `
                            <span class="badge bg-primary rounded-pill">
                                ${unreadCount}
                            </span>
                        `
                        : ''
                }
            `;

           conversationElement.addEventListener('click', async function () {
    selectedUserId = user._id;

    document.getElementById('emptyConversation').style.display = 'none';
    document.getElementById('conversationArea').style.display = 'block';

    document.getElementById('conversationUserImage').src =
        user.profileImage || 'facebookprofile.jpeg';

    document.getElementById('conversationUserName').textContent =
        `${user.firstName || ''} ${user.lastName || ''}`;

    await markConversationAsRead(selectedUserId);
    await loadMessages(selectedUserId);
    await loadConversations();
});
            container.appendChild(conversationElement);
        });

    } catch (error) {
        console.error('Error loading conversations:', error);
    }
}


async function loadMessages(userId) {
    try {
        const response = await fetch(`/api/messages/${userId}`);

        if (!response.ok) {
            return;
        }

        const messages = await response.json();
        const container = document.getElementById('messagesContainer');

        container.innerHTML = '';

        messages.forEach(message => {
            const messageElement = document.createElement('div');

            const isMyMessage =
                message.sender?._id?.toString() === currentUser?._id?.toString();

            messageElement.className =
                `d-flex mb-2 ${isMyMessage ? 'justify-content-start' : 'justify-content-end'}`;

            messageElement.innerHTML = `
    <div
        class="${isMyMessage ? 'bg-primary text-white' : 'bg-light'} rounded-3 px-3 py-2"
        style="max-width: 70%;"
    >

        ${message.text ? `
            <div class="mb-2">
                ${message.text}
            </div>
        ` : ''}

        ${message.image ? `
            <img
                src="${message.image}"
                alt="Message image"
                class="img-fluid rounded mb-2"
                style="max-width: 350px; max-height: 350px; object-fit: contain;"
            >
        ` : ''}

        ${message.video ? `
            <video
                controls
                playsinline
                class="rounded mb-2"
                style="max-width: 350px; max-height: 350px; background: black;"
            >
                <source src="${message.video}">
                הדפדפן שלך אינו תומך בהצגת סרטונים.
            </video>
        ` : ''}

        <div class="small ${isMyMessage ? 'text-white-50' : 'text-muted'} mt-1">
            ${new Date(message.createdAt).toLocaleTimeString('he-IL', {
                hour: '2-digit',
                minute: '2-digit'
            })}
        </div>

    </div>
`;
            container.appendChild(messageElement);
        });

        container.scrollTop = container.scrollHeight;

    } catch (error) {
        console.error('Error loading messages:', error);
    }
}


const sendMessageBtn = document.getElementById('sendMessageBtn');
const messageInput = document.getElementById('messageInput');
const messageImageInput = document.getElementById('messageImageInput');
const messageVideoInput = document.getElementById('messageVideoInput');
const selectMessageImageBtn = document.getElementById('selectMessageImageBtn');
const selectMessageVideoBtn = document.getElementById('selectMessageVideoBtn');
const selectedMessageFile = document.getElementById('selectedMessageFile');

if (selectMessageImageBtn) {
    selectMessageImageBtn.addEventListener('click', function () {
        messageImageInput.click();
    });
}

if (selectMessageVideoBtn) {
    selectMessageVideoBtn.addEventListener('click', function () {
        messageVideoInput.click();
    });
}

if (messageImageInput) {
    messageImageInput.addEventListener('change', function () {
        const file = this.files[0];

        if (!file) {
            return;
        }

        messageVideoInput.value = '';

        if (selectedMessageFile) {
            selectedMessageFile.textContent = `תמונה: ${file.name}`;
        }
    });
}

if (messageVideoInput) {
    messageVideoInput.addEventListener('change', function () {
        const file = this.files[0];

        if (!file) {
            return;
        }

        messageImageInput.value = '';

        if (selectedMessageFile) {
            selectedMessageFile.textContent = `סרטון: ${file.name}`;
        }
    });
}

async function sendMessage() {
    const text = messageInput.value.trim();

    const imageFile = messageImageInput?.files[0];
    const videoFile = messageVideoInput?.files[0];

    if (!selectedUserId) {
        return;
    }

    if (text === '' && !imageFile && !videoFile) {
        return;
    }

    const formData = new FormData();

    formData.append('receiverId', selectedUserId);
    formData.append('text', text);

    if (imageFile) {
        formData.append('media', imageFile);
    } else if (videoFile) {
        formData.append('media', videoFile);
    }

    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            messageInput.value = '';

            if (messageImageInput) {
                messageImageInput.value = '';
            }

            if (messageVideoInput) {
                messageVideoInput.value = '';
            }

            if (selectedMessageFile) {
                selectedMessageFile.textContent = '';
            }

            await loadMessages(selectedUserId);
            await loadConversations();

        } else {
            alert(
                data.message ||
                'אירעה שגיאה בשליחת ההודעה'
            );
        }

    } catch (error) {
        console.error('Error sending message:', error);
        alert('לא ניתן להתחבר לשרת');
    }
}

if (sendMessageBtn) {
    sendMessageBtn.addEventListener('click', sendMessage);
}

if (messageInput) {
    messageInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });
}


async function openConversationFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');

    if (!userId) {
        return;
    }

    try {
        const response = await fetch(`/api/users/${userId}`);

        if (!response.ok) {
            return;
        }

        const user = await response.json();

        selectedUserId = user._id;

        document.getElementById('emptyConversation').style.display = 'none';
        document.getElementById('conversationArea').style.display = 'block';

        document.getElementById('conversationUserImage').src =
            user.profileImage || 'facebookprofile.jpeg';

        document.getElementById('conversationUserName').textContent =
            `${user.firstName || ''} ${user.lastName || ''}`;

        await markConversationAsRead(selectedUserId);
await loadMessages(selectedUserId);
await loadConversations();

    } catch (error) {
        console.error('Error opening conversation:', error);
    }
}


function formatLastMessageTime(date) {
    const messageDate = new Date(date);
    const now = new Date();

    const today =
        messageDate.getDate() === now.getDate() &&
        messageDate.getMonth() === now.getMonth() &&
        messageDate.getFullYear() === now.getFullYear();

    if (today) {
        return messageDate.toLocaleTimeString('he-IL', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    const difference = now - messageDate;
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    if (days < 7) {
        return `לפני ${days} ימים`;
    }

    const weeks = Math.floor(days / 7);

    return `לפני ${weeks} שבועות`;
}


async function markConversationAsRead(userId) {
    try {
        const response = await fetch(`/api/messages/${userId}/read`, {
            method: 'PUT'
        });

        if (!response.ok) {
            return;
        }

    } catch (error) {
        console.error('Error marking messages as read:', error);
    }
}

const allMessagesTab =
    document.getElementById('allMessagesTab');

const unreadMessagesTab =
    document.getElementById('unreadMessagesTab');


if (allMessagesTab) {
    allMessagesTab.addEventListener('click', async function () {

        currentMessagesFilter = 'all';

        allMessagesTab.classList.remove('btn-outline-primary');
        allMessagesTab.classList.add('btn-primary');

        unreadMessagesTab.classList.remove('btn-primary');
        unreadMessagesTab.classList.add('btn-outline-primary');

        await loadConversations();
    });
}


if (unreadMessagesTab) {
    unreadMessagesTab.addEventListener('click', async function () {

        currentMessagesFilter = 'unread';

        unreadMessagesTab.classList.remove('btn-outline-primary');
        unreadMessagesTab.classList.add('btn-primary');

        allMessagesTab.classList.remove('btn-primary');
        allMessagesTab.classList.add('btn-outline-primary');

        await loadConversations();
    });
}

async function initializeMessagesPage() {
    await loadCurrentUser();

    if (!currentUser) {
        return;
    }

    await loadConversations();
    await openConversationFromUrl();
}
initializeMessagesPage();