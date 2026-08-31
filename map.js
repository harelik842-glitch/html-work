async function initMap() {

    const israelCenter = {
        lat: 31.7683,
        lng: 35.2137
    };

    const map = new google.maps.Map(
        document.getElementById('usersMap'),
        {
            center: israelCenter,
            zoom: 8
        }
    );


    const geocoder =
        new google.maps.Geocoder();


    try {

        const response =
            await fetch('/api/users/map');


        if (!response.ok) {

            throw new Error(
                'Failed to load friends'
            );
        }


        const users =
            await response.json();


        for (const user of users) {

            if (!user.city) {
                continue;
            }


            try {

                // מוצא את המיקום לפי העיר של החבר
                const result =
                    await geocoder.geocode({
                        address:
                            `${user.city}, Israel`
                    });


                if (
                    !result.results ||
                    result.results.length === 0
                ) {
                    continue;
                }


                const position =
                    result.results[0]
                        .geometry
                        .location;


                // מוסיף סימון של החבר על המפה
                const marker =
                    new google.maps.Marker({
                        position: position,
                        map: map,
                        title:
                            `${user.firstName || ''} ${user.lastName || ''}`
                    });


                // המידע שמופיע בלחיצה על הסימון
                const infoWindow =
                    new google.maps.InfoWindow({
                        content: `
                            <div
                                style="
                                    direction: rtl;
                                    min-width: 180px;
                                "
                            >

                                <strong>
                                    ${user.firstName || ''}
                                    ${user.lastName || ''}
                                </strong>

                                <div>
                                    @${user.username || ''}
                                </div>

                                <div style="margin-top: 5px;">
                                    ${user.city}
                                </div>

                                <div style="margin-top: 10px;">

                                    <a
                                        href="profile.html?userId=${user._id}"
                                    >
                                        מעבר לפרופיל
                                    </a>

                                </div>

                            </div>
                        `
                    });


                marker.addListener(
                    'click',
                    function () {

                        infoWindow.open({
                            anchor: marker,
                            map: map
                        });
                    }
                );


            } catch (geoError) {

                console.error(
                    'Geocoding error for:',
                    user.city,
                    geoError
                );
            }
        }


    } catch (error) {

        console.error(
            'MAP USERS ERROR:',
            error
        );
    }
}