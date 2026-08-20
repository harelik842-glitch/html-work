let currentUser = null;

async function loadCurrentUser() {
    try {
        const response = await fetch('/api/current-user');

        if (!response.ok) {
            return;
        }

        currentUser = await response.json();

    } catch (error) {
        console.error('Error loading current user:', error);
    }
}

document.getElementById('createGroupForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const groupData = {
        name: document.getElementById('groupName').value.trim(),
        description: document.getElementById('groupDescription').value.trim(),
        address: document.getElementById('groupAddress').value.trim(),
        image: ''
    };

    if (groupData.name === '') {
        alert('יש להזין שם לקבוצה');
        return;
    }

    try {
        const response = await fetch('/api/groups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(groupData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('הקבוצה נוצרה בהצלחה');
            document.getElementById('createGroupForm').reset();
            loadGroups();
            loadMyGroups();
        } else {
            alert(data.message || 'אירעה שגיאה ביצירת הקבוצה');
        }

    } catch (error) {
        console.error(error);
        alert('לא ניתן להתחבר לשרת');
    }
});

async function loadGroups() {
    try {
        const response = await fetch('/api/groups');
        const groups = await response.json();

        const groupsContainer =
            document.getElementById('groupsContainer');

        groupsContainer.innerHTML = '';

        groups.forEach(group => {
            const groupElement =
                document.createElement('div');

groupElement.className = 'card p-3 mb-3 position-relative';
            groupElement.innerHTML = `
                <h4>${group.name}</h4>

                <p>${group.description || ''}</p>

                <div class="text-muted small">
                    מנהל:
                    ${group.creator?.firstName || ''}
                    ${group.creator?.lastName || ''}
                </div>

                <div class="text-muted small mb-2">
                    מספר חברים:
                    ${group.members?.length || 0}
                </div>

                <div class="text-muted small mb-3">
                    ${group.address || ''}
                </div>

                ${currentUser &&
group.creator?._id === currentUser._id ? `
    <button
        class="edit-group-btn"
        data-id="${group._id}"
        title="עריכת קבוצה">
        <i class="bi bi-pencil"></i>
    </button>
` : ''}

${currentUser &&
group.creator?._id === currentUser._id ? `
    <button
        class="btn btn-outline-secondary btn-sm members-group-btn"
        data-id="${group._id}">
        <i class="bi bi-people"></i>
        חברים
    </button>
` : ''}

                <button
                    class="btn btn-primary btn-sm join-group-btn"
                    data-id="${group._id}">
                    הצטרף לקבוצה
                </button>

                <button
    class="btn btn-success btn-sm create-group-post-btn"
    data-id="${group._id}">
    <i class="bi bi-plus-square"></i>
   הוסף פוסט בקבוצה
</button>
            `;

            groupsContainer.appendChild(groupElement);

            const joinButton =
                groupElement.querySelector('.join-group-btn');

            joinButton.addEventListener('click', async function () {
                const groupId = this.dataset.id;

                try {
                    const response =
                        await fetch(`/api/groups/${groupId}/join`, {
                            method: 'PUT'
                        });

                    const data = await response.json();

                    if (response.ok) {
                        alert('הצטרפת לקבוצה בהצלחה');
                        loadGroups();
                        loadMyGroups();
                    } else {
                        alert(
                            data.message ||
                            'אירעה שגיאה בהצטרפות לקבוצה'
                        );
                    }

                } catch (error) {
                    console.error(error);
                    alert('לא ניתן להתחבר לשרת');
                }
            });

            const editButton =
    groupElement.querySelector('.edit-group-btn');

if (editButton) {
    editButton.addEventListener('click', async function () {
        const groupId = this.dataset.id;

        const newName = prompt('שם הקבוצה:', group.name);
        if (newName === null) {
            return;
        }

        const newDescription = prompt(
            'תיאור הקבוצה:',
            group.description || ''
        );

        if (newDescription === null) {
            return;
        }

        const newAddress = prompt(
            'כתובת הקבוצה:',
            group.address || ''
        );

        if (newAddress === null) {
            return;
        }

        try {
            const response = await fetch(`/api/groups/${groupId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newName.trim(),
                    description: newDescription.trim(),
                    address: newAddress.trim()
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('הקבוצה עודכנה בהצלחה');
                loadGroups();
                loadMyGroups();
            } else {
                alert(data.message || 'אירעה שגיאה בעריכת הקבוצה');
            }

        } catch (error) {
            console.error(error);
            alert('לא ניתן להתחבר לשרת');
        }
    });
}

const membersButton =
    groupElement.querySelector('.members-group-btn');

if (membersButton) {
    membersButton.addEventListener('click', function () {

        let membersHtml = '';

        group.members.forEach(member => {

            const isCreator =
                member._id === group.creator?._id;

            membersHtml += `
                <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                    <span>
                        ${member.firstName || ''}
                        ${member.lastName || ''}
                    </span>

                    ${isCreator ? `
                        <span class="text-muted small">
                            מנהל
                        </span>
                    ` : `
                        <button
                            class="btn btn-sm btn-outline-danger remove-member-btn"
                            data-group-id="${group._id}"
                            data-member-id="${member._id}">
                            <i class="bi bi-person-x"></i>
                        </button>
                    `}
                </div>
            `;
        });

        const membersWindow = document.createElement('div');

        membersWindow.className =
            'card p-3 mt-3 members-window';

        membersWindow.innerHTML = `
            <h5 class="mb-3">חברי הקבוצה</h5>
            ${membersHtml}
        `;

        groupElement.appendChild(membersWindow);

        const removeButtons =
            membersWindow.querySelectorAll('.remove-member-btn');

        removeButtons.forEach(button => {

            button.addEventListener('click', async function () {

                const groupId = this.dataset.groupId;
                const memberId = this.dataset.memberId;

                try {
                    const response = await fetch(
                        `/api/groups/${groupId}/members/${memberId}`,
                        {
                            method: 'DELETE'
                        }
                    );

                    const data = await response.json();

                    if (response.ok) {
                        loadGroups();
                        loadMyGroups();
                    } else {
                        alert(
                            data.message ||
                            'אירעה שגיאה בהסרת המשתמש'
                        );
                    }

                } catch (error) {
                    console.error(error);
                    alert('לא ניתן להתחבר לשרת');
                }
            });
        });
    });
}


const createGroupPostButton =
    groupElement.querySelector('.create-group-post-btn');

createGroupPostButton.addEventListener('click', function () {
    document.getElementById('groupPostGroupId').value = group._id;
    document.getElementById('groupPostText').value = '';

    const modal = new bootstrap.Modal(
        document.getElementById('groupPostModal')
    );

    modal.show();
});


        });

    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

async function loadMyGroups() {
    try {
        const response = await fetch('/api/my-groups');

        if (!response.ok) {
            return;
        }

        const groups = await response.json();

        const myGroupsContainer =
            document.getElementById('myGroupsContainer');

        myGroupsContainer.innerHTML = '';

        groups.forEach(group => {
            const groupElement =
                document.createElement('div');

            groupElement.className =
                'border rounded p-3 mb-2';

            groupElement.innerHTML = `
                <strong>${group.name}</strong>

                <div class="text-muted small">
                    ${group.description || ''}
                </div>
            `;

            myGroupsContainer.appendChild(groupElement);
        });

    } catch (error) {
        console.error(
            'Error loading user groups:',
            error
        );
    }
}


document.getElementById('publishGroupPostBtn').addEventListener('click', async function () {
    const text = document.getElementById('groupPostText').value.trim();
    const groupId = document.getElementById('groupPostGroupId').value;

    if (text === '') {
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
                text: text,
                image: '',
                group: groupId
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('הפוסט פורסם בקבוצה בהצלחה');

            const modalElement = document.getElementById('groupPostModal');
            const modal = bootstrap.Modal.getInstance(modalElement);

            if (modal) {
                modal.hide();
            }

            document.getElementById('groupPostText').value = '';

        } else {
            alert(data.message || 'אירעה שגיאה בפרסום הפוסט');
        }

    } catch (error) {
        console.error(error);
        alert('לא ניתן להתחבר לשרת');
    }
});


async function initializeGroupsPage() {
    await loadCurrentUser();
    loadGroups();
    loadMyGroups();
}

initializeGroupsPage();