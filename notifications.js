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


function getNotificationText(notification) {
    const senderName =
        `${notification.sender?.firstName || ''} ${notification.sender?.lastName || ''}`.trim();

    if (notification.type === 'like') {
        return `${senderName} עשה לייק לפוסט שלך`;
    }

    if (notification.type === 'comment') {
        return `${senderName} הגיב לפוסט שלך`;
    }

    if (notification.type === 'friend') {
        return `${senderName} הוסיף אותך כחבר`;
    }

    if (notification.type === 'group_post') {
        return `${senderName} פרסם פוסט בקבוצה ${notification.group?.name || ''}`;
    }

    return 'התראה חדשה';
}


function openNotification(notification) {
    if (
        (notification.type === 'like' ||
         notification.type === 'comment') &&
        notification.post?._id
    ) {
        window.location.href =
            `file.html?postId=${notification.post._id}`;

        return;
    }

    if (
        notification.type === 'friend' &&
        notification.sender?._id
    ) {
        window.location.href =
            `profile.html?userId=${notification.sender._id}`;

        return;
    }

    if (
        notification.type === 'group_post' &&
        notification.group?._id &&
        notification.post?._id
    ) {
        window.location.href =
            `group.html?groupId=${notification.group._id}&postId=${notification.post._id}`;

        return;
    }
}


async function loadAllNotifications() {
    try {
        const response =
            await fetch('/api/notifications');

        if (!response.ok) {
            return;
        }

        const notifications =
            await response.json();

        const container =
            document.getElementById('allNotificationsContainer');

        container.innerHTML = '';

        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-5">
                    אין התראות להצגה
                </div>
            `;

            return;
        }

        notifications.forEach(notification => {
            const notificationElement =
                document.createElement('div');

            notificationElement.className =
                'd-flex align-items-center gap-3 p-3 border-bottom';

            notificationElement.style.cursor = 'pointer';

            notificationElement.innerHTML = `
                <img
                    src="${notification.sender?.profileImage || 'facebookprofile.jpeg'}"
                    alt="Profile"
                    class="rounded-circle"
                    width="55"
                    height="55"
                    style="object-fit: cover;"
                >

                <div class="flex-grow-1">

                    <div class="fw-semibold">
                        ${getNotificationText(notification)}
                    </div>

                    <div class="text-muted small mt-1">
                        ${timeAgo(notification.createdAt)}
                    </div>

                </div>

                ${
                    !notification.isRead
                        ? `
                            <span
                                class="bg-primary rounded-circle"
                                style="
                                    width: 10px;
                                    height: 10px;
                                    flex-shrink: 0;
                                "
                            ></span>
                        `
                        : ''
                }
            `;

            notificationElement.addEventListener('click', function () {
                openNotification(notification);
            });

            container.appendChild(notificationElement);
        });

    } catch (error) {
        console.error(
            'Error loading all notifications:',
            error
        );
    }
}


loadAllNotifications();