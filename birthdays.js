let currentUser = null;


async function loadBirthdays() {
    try {

        const currentUserResponse =
            await fetch('/api/current-user');

        if (!currentUserResponse.ok) {
            return;
        }

        currentUser =
            await currentUserResponse.json();


        const usersResponse =
            await fetch('/api/users');

        if (!usersResponse.ok) {
            return;
        }

        const users =
            await usersResponse.json();


        const friendsWithBirthdays = users.filter(user => {

            const isFriend =
                currentUser.friends?.some(
                    friendId =>
                        friendId.toString() ===
                        user._id.toString()
                );

            return isFriend && user.birthday;
        });


        const container =
            document.getElementById(
                'birthdaysContainer'
            );

        container.innerHTML = '';


        if (friendsWithBirthdays.length === 0) {

            container.innerHTML = `
                <div class="card shadow-sm">
                    <div class="card-body text-center py-5">

                        <i
                            class="bi bi-calendar-heart"
                            style="font-size: 45px;"
                        ></i>

                        <h5 class="mt-3">
                            אין כרגע ימי הולדת להצגה
                        </h5>

                        <div class="text-muted">
                            לחברים שלך עדיין לא מוגדר תאריך יום הולדת
                        </div>

                    </div>
                </div>
            `;

            return;
        }


        const today = new Date();

        const todayMonth = today.getMonth();
        const todayDay = today.getDate();


        // מחשב מתי יום ההולדת הבא של כל חבר
        friendsWithBirthdays.forEach(friend => {

            const birthday =
                new Date(friend.birthday);

            const birthdayThisYear =
                new Date(
                    today.getFullYear(),
                    birthday.getMonth(),
                    birthday.getDate()
                );

            const todayOnly =
                new Date(
                    today.getFullYear(),
                    todayMonth,
                    todayDay
                );

            let nextBirthday =
                birthdayThisYear;

            if (birthdayThisYear < todayOnly) {

                nextBirthday =
                    new Date(
                        today.getFullYear() + 1,
                        birthday.getMonth(),
                        birthday.getDate()
                    );
            }

            friend.nextBirthday =
                nextBirthday;

            friend.daysUntilBirthday =
                Math.round(
                    (nextBirthday - todayOnly) /
                    (1000 * 60 * 60 * 24)
                );
        });


        // מציג קודם את ימי ההולדת הקרובים
        friendsWithBirthdays.sort(
            (a, b) =>
                a.daysUntilBirthday -
                b.daysUntilBirthday
        );


        // מאחד חברים שחוגגים באותו יום
        const birthdayGroups = {};

        friendsWithBirthdays.forEach(friend => {

            const date =
                friend.nextBirthday;

            const key =
                `${date.getDate()}/${date.getMonth() + 1}`;

            if (!birthdayGroups[key]) {
                birthdayGroups[key] = {
                    date: date,
                    friends: []
                };
            }

            birthdayGroups[key].friends.push(friend);
        });


        Object.values(birthdayGroups).forEach(group => {

            const date = group.date;

            const isToday =
                date.getDate() === todayDay &&
                date.getMonth() === todayMonth;


            const section =
                document.createElement('div');

            section.className = 'mb-4';


            section.innerHTML = `
                <h5 class="mb-3">

                    ${
                        isToday
                            ? `
                                <span class="text-primary">
                                    היום
                                </span>
                                •
                            `
                            : ''
                    }

                    ${date.getDate()}/${date.getMonth() + 1}

                </h5>

                <div class="birthday-list"></div>
            `;


            const list =
                section.querySelector(
                    '.birthday-list'
                );


            group.friends.forEach(friend => {

                const friendElement =
                    document.createElement('a');

                friendElement.href =
                    `profile.html?userId=${friend._id}`;

                friendElement.className =
                    'card shadow-sm mb-2 text-decoration-none text-dark';


                friendElement.innerHTML = `
                    <div class="card-body">

                        <div class="d-flex align-items-center gap-3">

                            <img
                                src="${friend.profileImage || 'harel.jpg'}"
                                class="rounded-circle"
                                width="60"
                                height="60"
                                style="object-fit: cover;"
                            >

                            <div class="flex-grow-1">

                                <div class="fw-bold">
                                    ${friend.firstName || ''}
                                    ${friend.lastName || ''}
                                </div>

                                <div class="text-muted small">
                                    @${friend.username || ''}
                                </div>

                                ${
                                    isToday
                                        ? `
                                            <div class="text-primary small mt-1">
                                                🎂 חוגג היום יום הולדת!
                                            </div>
                                        `
                                        : ''
                                }

                            </div>

                            <i class="bi bi-chevron-left text-muted"></i>

                        </div>

                    </div>
                `;

                list.appendChild(
                    friendElement
                );
            });


            container.appendChild(
                section
            );
        });


    } catch (error) {

        console.error(
            'Error loading birthdays:',
            error
        );

    }
}


loadBirthdays();