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

        const groupsContainer = document.getElementById('groupsContainer');

        groupsContainer.innerHTML = '';

        groups.forEach(group => {
            const groupElement = document.createElement('div');

            groupElement.className = 'card p-3 mb-3';

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

    <button
        class="btn btn-primary btn-sm join-group-btn"
        data-id="${group._id}">
        הצטרף לקבוצה
    </button>
`;

            groupsContainer.appendChild(groupElement);
        



        const joinButton =
    groupElement.querySelector('.join-group-btn');

joinButton.addEventListener('click', async function () {
    const groupId = this.dataset.id;

    try {
        const response = await fetch(`/api/groups/${groupId}/join`, {
            method: 'PUT'
        });

        const data = await response.json();

        if (response.ok) {
            alert('הצטרפת לקבוצה בהצלחה');
            loadGroups();
        } else {
            alert(data.message || 'אירעה שגיאה בהצטרפות לקבוצה');
        }

    } catch (error) {
        console.error(error);
        alert('לא ניתן להתחבר לשרת');
    }
});


});

    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

loadGroups();