let currentEventsUser = null;
let selectedEvent = null;

async function loadEventsCurrentUser() {
    try {
        const response =
            await fetch('/api/current-user');

        if (!response.ok) {
            return;
        }

        currentEventsUser =
            await response.json();

    } catch (error) {
        console.error(
            'Error loading current user:',
            error
        );
    }
}


async function loadEvents() {
    try {
        const response =
            await fetch('/api/events');

        if (!response.ok) {
            return;
        }

        const events =
            await response.json();

        const container =
            document.getElementById(
                'eventsContainer'
            );

        container.innerHTML = '';

        const now =
            new Date();

        const futureEvents =
            events.filter(
                event =>
                    new Date(event.date) >= now
            );

        if (futureEvents.length === 0) {
            container.innerHTML = `
                <div class="text-muted">
                    עדיין אין אירועים קרובים
                </div>
            `;

            return;
        }

        futureEvents.forEach(event => {
            const eventElement =
                document.createElement('div');

            eventElement.className =
                'event-card';

            const eventDate =
                new Date(event.date);

            const dateText =
                eventDate.toLocaleDateString(
                    'he-IL',
                    {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }
                );

            const timeText =
                eventDate.toLocaleTimeString(
                    'he-IL',
                    {
                        hour: '2-digit',
                        minute: '2-digit'
                    }
                );

            eventElement.innerHTML = `
                <img
                    src="${event.image || 'facebookprofile.jpeg'}"
                    alt="${event.name || 'Event'}"
                    class="event-card-image"
                >

                <div class="event-card-info">

                    <div class="event-card-name">
                        ${event.name || ''}
                    </div>

                    <div class="event-card-date">
                        <i class="bi bi-clock"></i>
                        ${dateText} · ${timeText}
                    </div>

                    <div class="event-card-location">
                        <i class="bi bi-geo-alt-fill"></i>
                        ${event.location || 'לא צוין מיקום'}
                    </div>

                </div>
            `;

            eventElement.addEventListener(
                'click',
                function () {
                    openEventModal(event);
                }
            );

            container.appendChild(
                eventElement
            );
        });

    } catch (error) {
        console.error(
            'Error loading events:',
            error
        );
    }
}


function openEventModal(event) {
    selectedEvent =
        event;

    const date =
        new Date(event.date);

    const dateText =
        date.toLocaleDateString(
            'he-IL',
            {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }
        );

    const timeText =
        date.toLocaleTimeString(
            'he-IL',
            {
                hour: '2-digit',
                minute: '2-digit'
            }
        );

    document.getElementById(
        'eventModalHeader'
    ).textContent =
        event.name || 'פרטי האירוע';

    document.getElementById(
        'eventModalName'
    ).textContent =
        event.name || '';

    document.getElementById(
        'eventModalImage'
    ).src =
        event.image || 'facebookprofile.jpeg';

    document.getElementById(
        'eventModalDate'
    ).innerHTML = `
        <i class="bi bi-calendar-event"></i>
        ${dateText} · ${timeText}
    `;

    document.getElementById(
        'eventModalLocation'
    ).innerHTML = `
        <i class="bi bi-geo-alt-fill"></i>
        ${event.location || 'לא צוין מיקום'}
    `;

    document.getElementById(
        'eventModalDescription'
    ).textContent =
        event.description ||
        'לא נוסף תיאור לאירוע';

    document.getElementById(
        'eventCreatorImage'
    ).src =
        event.creator?.profileImage ||
        'facebookprofile.jpeg';

    document.getElementById(
        'eventCreatorName'
    ).textContent =
        `${event.creator?.firstName || ''} ${event.creator?.lastName || ''}`.trim()
        ||
        event.creator?.username
        ||
        'משתמש';

    document.getElementById(
        'eventAttendeesCount'
    ).textContent =
        event.attendees?.length || 0;

    const preview =
        document.getElementById(
            'eventAttendeesPreview'
        );

    preview.innerHTML = '';

   (event.attendees || [])
    .slice(0, 8)
    .forEach(user => {

        const profileLink =
            document.createElement('a');

        profileLink.href =
            `profile.html?userId=${user._id}`;

        profileLink.className =
            'text-decoration-none';

        profileLink.title =
            `${user.firstName || ''} ${user.lastName || ''}`.trim();

        const image =
            document.createElement('img');

        image.src =
            user.profileImage ||
            'facebookprofile.jpeg';

        image.className =
            'rounded-circle border';

        image.width = 38;
        image.height = 38;

        image.style.objectFit =
            'cover';

        image.style.cursor =
            'pointer';

        image.alt =
            `${user.firstName || ''} ${user.lastName || ''}`.trim();

        profileLink.appendChild(image);

        preview.appendChild(profileLink);
    });

    updateAttendanceButtons();

    const modal =
        bootstrap.Modal.getOrCreateInstance(
            document.getElementById(
                'eventDetailsModal'
            )
        );

    modal.show();
}


function isCurrentUserAttending() {
    if (
        !currentEventsUser ||
        !selectedEvent
    ) {
        return false;
    }

    return selectedEvent.attendees?.some(
        attendee =>
            attendee._id?.toString() ===
                currentEventsUser._id?.toString() ||
            attendee.toString?.() ===
                currentEventsUser._id?.toString()
    );
}


function updateAttendanceButtons() {
    const goingBtn =
        document.getElementById(
            'eventGoingBtn'
        );

    const notGoingBtn =
        document.getElementById(
            'eventNotGoingBtn'
        );

    const attending =
        isCurrentUserAttending();

    if (attending) {
        goingBtn.className =
            'btn btn-primary';

        notGoingBtn.className =
            'btn btn-light';

    } else {
        goingBtn.className =
            'btn btn-outline-primary';

        notGoingBtn.className =
            'btn btn-secondary';
    }
}


document.getElementById(
    'eventGoingBtn'
)?.addEventListener(
    'click',
    async function () {

        if (!selectedEvent) {
            return;
        }

        try {
            const response =
                await fetch(
                    `/api/events/${selectedEvent._id}/join`,
                    {
                        method: 'PUT'
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    'אירעה שגיאה'
                );

                return;
            }

            await reloadSelectedEvent();

        } catch (error) {
            console.error(error);

            alert(
                'לא ניתן להתחבר לשרת'
            );
        }
    }
);


document.getElementById(
    'eventNotGoingBtn'
)?.addEventListener(
    'click',
    async function () {

        if (!selectedEvent) {
            return;
        }

        try {
            const response =
                await fetch(
                    `/api/events/${selectedEvent._id}/join`,
                    {
                        method: 'DELETE'
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    'אירעה שגיאה'
                );

                return;
            }

            await reloadSelectedEvent();

        } catch (error) {
            console.error(error);

            alert(
                'לא ניתן להתחבר לשרת'
            );
        }
    }
);


async function reloadSelectedEvent() {
    const response =
        await fetch('/api/events');

    if (!response.ok) {
        return;
    }

    const events =
        await response.json();

    const updatedEvent =
        events.find(
            event =>
                event._id ===
                selectedEvent._id
        );

    if (!updatedEvent) {
        return;
    }

    selectedEvent =
        updatedEvent;

    openEventModal(
        updatedEvent
    );

    await loadEvents();
}


const createEventForm =
    document.getElementById(
        'createEventForm'
    );

const eventImage =
    document.getElementById(
        'eventImage'
    );

const eventImagePreview =
    document.getElementById(
        'eventImagePreview'
    );

const eventImagePreviewContainer =
    document.getElementById(
        'eventImagePreviewContainer'
    );


eventImage?.addEventListener(
    'change',
    function () {

        const file =
            this.files[0];

        if (!file) {
            eventImagePreview.src =
                '';

            eventImagePreviewContainer.hidden =
                true;

            return;
        }

        eventImagePreview.src =
            URL.createObjectURL(file);

        eventImagePreviewContainer.hidden =
            false;
    }
);


createEventForm?.addEventListener(
    'submit',
    async function (event) {

        event.preventDefault();

        const name =
            document.getElementById(
                'eventName'
            ).value.trim();

        const date =
            document.getElementById(
                'eventDate'
            ).value;

        const location =
            document.getElementById(
                'eventLocation'
            ).value.trim();

        const description =
            document.getElementById(
                'eventDescription'
            ).value.trim();

        const image =
            eventImage?.files[0];

        if (!name) {
            alert('יש להזין שם אירוע');
            return;
        }

        if (!date) {
            alert('יש לבחור תאריך ושעה');
            return;
        }

        if (!location) {
            alert('יש להזין מיקום');
            return;
        }

        const formData =
            new FormData();

        formData.append(
            'name',
            name
        );

        formData.append(
            'date',
            date
        );

        formData.append(
            'location',
            location
        );

        formData.append(
            'description',
            description
        );

        if (image) {
            formData.append(
                'image',
                image
            );
        }

        try {
            const response =
                await fetch(
                    '/api/events',
                    {
                        method: 'POST',
                        body: formData
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    'אירעה שגיאה ביצירת האירוע'
                );

                return;
            }

            createEventForm.reset();

            eventImagePreview.src =
                '';

            eventImagePreviewContainer.hidden =
                true;

            const modal =
                bootstrap.Modal.getInstance(
                    document.getElementById(
                        'createEventModal'
                    )
                );

            modal?.hide();

            await loadEvents();

        } catch (error) {
            console.error(
                'Error creating event:',
                error
            );

            alert(
                'לא ניתן להתחבר לשרת'
            );
        }
    }
);


async function initializeEventsPage() {
    await loadEventsCurrentUser();
    await loadEvents();
}


initializeEventsPage();