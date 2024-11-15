const container = document.getElementById('restaurants-container');
const userId = localStorage.getItem('userId');
let restaurants;
let favoriteFoods, favoriteRestaurants
document.addEventListener('DOMContentLoaded', async function () {
    await getRestaurants();
});

async function getRestaurants() {
    try {
        const restros = await fetch(`/user/getRestaurants`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        }).then((res) => res.json());

        console.log(restros.restaurants);

        const response = await fetch(`/user/favourites?id=${userId}`);
        const data = await response.json();
        console.log(data)
        if(data.favoriteFoods && data.favoriteRestaurants){
             favoriteFoods = data.favoriteFoods;
             favoriteRestaurants = data.favoriteRestaurants;
        }

        if (restros.restaurants) {
            restaurants = restros.restaurants;
            container.innerHTML = ''; 
            let restaurantCard = '<ul class="food-menu-list">';
            restros.restaurants.forEach(restaurant => {
                restaurantCard += `
                    <li onclick="handle('${restaurant._id}')" data-type="${restaurant.restaurantType}">
                        <div class="food-menu-card">
                            <div class="card-banner">
                                <img src="${restaurant.imageUrl}" alt="${restaurant.restaurantName}" class="w-100">
                            </div>
                            <div class="wrapper">
                                <p class="category">${restaurant.restaurantType}</p>
                                <div class="rating-wrapper">
                                    ${generateStars(restaurant.rating)}
                                </div>
                                <div class="favourites">
                                    <button class="favorite-btn" data-id="${restaurant._id}">
                                        <ion-icon class="favourites-button ${favoriteRestaurants.length === 0 || favoriteRestaurants.findIndex(fav => fav._id === restaurant._id) === -1 ? '' : 'filled'}" name="${favoriteRestaurants.length === 0 || favoriteRestaurants.findIndex(fav => fav._id === restaurant._id) === -1 ? 'bookmark-outline' : 'bookmark'}"></ion-icon>
                                    </button>
                                </div>
                            </div>
                            <h3 class="h3 card-title">${restaurant.restaurantName}</h3>
                            <div class="price-wrapper">
                                <p class="price-text">Address:</p>
                                <data class="price">${restaurant.address}</data>
                            </div>
                        </div>
                    </li>
                `;   
            });
            restaurantCard += '</ul>';
            container.innerHTML = restaurantCard;

            // Add event listeners to favorite buttons
            document.querySelectorAll('.favorite-btn').forEach(button => {
                button.addEventListener('click', (event) => handleFavoriteClick(event, button));
            });
        }
    } catch (error) {
        console.error('Error fetching restaurants:', error);
    }
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<ion-icon name="${i <= rating ? 'star' : 'star-outline'}"></ion-icon>`;
    }
    return stars;
}

function handle(restaurantId) {
    window.location.href = `/restaurant.html?${btoa('id='+restaurantId)}`;
}

async function handleFavoriteClick(event, button) {
    event.stopPropagation();
    const restaurantId = button.getAttribute('data-id');
    const icon = button.querySelector('ion-icon');

    if (icon.classList.contains('filled')) {
        await removeRestaurantFromFavorites(restaurantId);
        icon.classList.remove('filled');
        icon.setAttribute('name', 'bookmark-outline');
    } else {
        await addRestaurantToFavorites(restaurantId);
        icon.classList.add('filled');
        icon.setAttribute('name', 'bookmark');
    }
}

async function addRestaurantToFavorites(restaurantId) {
    await fetch(`/user/favorites/restaurant/${restaurantId}?user=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
}

async function removeRestaurantFromFavorites(restaurantId) {
    await fetch(`/user/favorites/restaurant/${restaurantId}?user=${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    });
}

