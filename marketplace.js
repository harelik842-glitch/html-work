let selectedMarketplaceItem = null;


// =====================================================
// אלמנטים - יצירת מודעה
// =====================================================

const createMarketplaceItemForm =
    document.getElementById('createMarketplaceItemForm');

const marketplaceItemImage =
    document.getElementById('marketplaceItemImage');

const marketplaceImagePreview =
    document.getElementById('marketplaceImagePreview');

const marketplaceImagePreviewContainer =
    document.getElementById(
        'marketplaceImagePreviewContainer'
    );


// =====================================================
// Preview לתמונת מוצר
// =====================================================

if (marketplaceItemImage) {

    marketplaceItemImage.addEventListener(
        'change',
        function () {

            const file = this.files[0];

            if (!file) {

                marketplaceImagePreview.src = '';

                marketplaceImagePreviewContainer.hidden =
                    true;

                return;
            }

            const previewUrl =
                URL.createObjectURL(file);

            marketplaceImagePreview.src =
                previewUrl;

            marketplaceImagePreviewContainer.hidden =
                false;
        }
    );
}


// =====================================================
// יצירת מודעה חדשה
// =====================================================

if (createMarketplaceItemForm) {

    createMarketplaceItemForm.addEventListener(
        'submit',
        async function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        'marketplaceItemName'
                    )
                    .value
                    .trim();


            const price =
                document
                    .getElementById(
                        'marketplaceItemPrice'
                    )
                    .value;


            const location =
                document
                    .getElementById(
                        'marketplaceItemLocation'
                    )
                    .value
                    .trim();


            const description =
                document
                    .getElementById(
                        'marketplaceItemDescription'
                    )
                    .value
                    .trim();


            const image =
                marketplaceItemImage?.files[0];


            // בדיקות

            if (name === '') {
                alert('יש להזין שם מוצר');
                return;
            }


            if (price === '') {
                alert('יש להזין מחיר');
                return;
            }


            if (Number(price) < 0) {
                alert('המחיר אינו יכול להיות שלילי');
                return;
            }


            // יצירת FormData

            const formData =
                new FormData();


            formData.append(
                'name',
                name
            );


            formData.append(
                'price',
                price
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
                        '/api/marketplace',
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
                        'אירעה שגיאה ביצירת המודעה'
                    );

                    return;
                }


                // ניקוי הטופס

                createMarketplaceItemForm.reset();


                // ניקוי Preview

                marketplaceImagePreview.src = '';

                marketplaceImagePreviewContainer.hidden =
                    true;


                // סגירת חלונית יצירת המודעה

                const modalElement =
                    document.getElementById(
                        'createMarketplaceItemModal'
                    );


                const modal =
                    bootstrap.Modal.getInstance(
                        modalElement
                    );


                if (modal) {
                    modal.hide();
                }


                // טעינת המודעות מחדש
                // כדי שהמודעה החדשה תופיע מיד

                await loadMarketplaceItems();


            } catch (error) {

                console.error(
                    'Error creating marketplace item:',
                    error
                );


                alert(
                    'לא ניתן להתחבר לשרת'
                );

            }

        }
    );

}


// =====================================================
// טעינת כל המודעות
// =====================================================

async function loadMarketplaceItems() {

    try {

        const response =
            await fetch('/api/marketplace');


        if (!response.ok) {

            console.error(
                'Failed to load marketplace items'
            );

            return;
        }


        const items =
            await response.json();


        const container =
            document.getElementById(
                'marketplaceItemsContainer'
            );


        if (!container) {
            return;
        }


        container.innerHTML = '';


        // אין מודעות

        if (items.length === 0) {

            container.innerHTML = `
                <div class="text-muted">
                    עדיין אין מודעות ב-Marketplace
                </div>
            `;

            return;
        }


        // יצירת כרטיס לכל מודעה

        items.forEach(item => {

            const itemElement =
                document.createElement('div');


            itemElement.className =
                'marketplace-item';


            itemElement.innerHTML = `

                <img
                    src="${item.image || 'harel.jpg'}"
                    alt="${item.name || 'Product'}"
                    class="marketplace-item-image"
                >


                <div class="marketplace-item-info">


                    <div class="marketplace-item-price">

                        ₪${Number(
                            item.price || 0
                        ).toLocaleString('he-IL')}

                    </div>


                    <div class="marketplace-item-name">

                        ${item.name || ''}

                    </div>


                    <div class="marketplace-item-location">

                        <i class="bi bi-geo-alt-fill"></i>

                        ${
                            item.location ||
                            'לא צוין מיקום'
                        }

                    </div>


                </div>
            `;


            // לחיצה על מודעה

            itemElement.addEventListener(
                'click',
                function () {

                    openMarketplaceItem(
                        item
                    );

                }
            );


            container.appendChild(
                itemElement
            );

        });


    } catch (error) {

        console.error(
            'Error loading marketplace:',
            error
        );

    }

}


// =====================================================
// פתיחת חלונית פרטי מוצר
// =====================================================

function openMarketplaceItem(item) {

    selectedMarketplaceItem =
        item;


    // שם בכותרת החלונית

    document.getElementById(
        'modalItemName'
    ).textContent =
        item.name ||
        'פרטי המוצר';


    // שם המוצר

    document.getElementById(
        'modalItemTitle'
    ).textContent =
        item.name || '';


    // מחיר

    document.getElementById(
        'modalItemPrice'
    ).textContent =
        `₪${Number(
            item.price || 0
        ).toLocaleString('he-IL')}`;


    // מיקום

    document.getElementById(
        'modalItemLocation'
    ).innerHTML = `

        <i class="bi bi-geo-alt-fill"></i>

        ${
            item.location ||
            'לא צוין מיקום'
        }
    `;


    // תיאור

    document.getElementById(
        'modalItemDescription'
    ).textContent =
        item.description ||
        'לא נוסף תיאור למוצר';


    // תמונת מוצר

    document.getElementById(
        'modalItemImage'
    ).src =
        item.image ||
        'harel.jpg';


    // תמונת המוכר

    document.getElementById(
        'modalSellerImage'
    ).src =
        item.seller?.profileImage ||
        'harel.jpg';


    // שם המוכר

    const sellerName =
        `${
            item.seller?.firstName || ''
        } ${
            item.seller?.lastName || ''
        }`.trim();


    document.getElementById(
        'modalSellerName'
    ).textContent =
        sellerName ||
        item.seller?.username ||
        'משתמש';


    // פתיחת החלונית

    const modalElement =
        document.getElementById(
            'marketplaceItemModal'
        );


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );


    modal.show();

}


// =====================================================
// שליחת הודעה למוכר
// =====================================================

const messageSellerBtn =
    document.getElementById(
        'messageSellerBtn'
    );


if (messageSellerBtn) {

    messageSellerBtn.addEventListener(
        'click',
        function () {

            const sellerId =
                selectedMarketplaceItem
                    ?.seller
                    ?._id;


            if (!sellerId) {

                alert(
                    'לא ניתן למצוא את פרטי המוכר'
                );

                return;
            }


            // מעבר לעמוד ההודעות
            // עם ID של מוכר המוצר

            window.location.href =
                `messages.html?userId=${sellerId}`;

        }
    );

}


// =====================================================
// טעינת Marketplace בכניסה לעמוד
// =====================================================

loadMarketplaceItems();