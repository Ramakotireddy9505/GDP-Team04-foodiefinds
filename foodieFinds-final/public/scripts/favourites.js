const userId = localStorage.getItem('userId');
const container = document.getElementById('fav-restaurants-container');
const foodscontainer = document.getElementById('fav-foods-container');
var favoriteFoods, favoriteRestaurants
async function fetchFavourites() {
    try {
        const response = await fetch(`/user/favourites?id=${userId}`);
        const data = await response.json();
        console.log(data)
        if(data.favoriteRestaurants){
            favoriteRestaurants = data.favoriteRestaurants
            container.innerHTML = ''; 
            let restaurantCard = '<ul class="food-menu-list">';
            favoriteRestaurants.forEach(restaurant => {
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

        }
        if(data.favoriteFoods){
            favoriteFoods = data.favoriteFoods;
            foodscontainer.innerHTML = ''; 
            let foodCard = '<ul class="food-menu-list">';
            favoriteFoods.forEach(foods => {
                let food = foods.food
            console.log(food)
            foodCard += `
                <li>
                <div class="food-menu-card">
                    <div class="card-banner">
                    <img src="${food.imageUrl}"  loading="lazy"
                        alt="${food.foodName}" class="w-100">
                    </div>
                    <div class="wrapper">
                    <p class="category">${food.category}</p>
                    </div>
                    <h3 class="h3 card-title">${food.foodName}</h3>
                    <p class="category" style="display: block !important; color: #000;">Restaurant: ${foods.restaurant}<p/>
                    <p class="category" style="display: block !important;">Description: ${food.description}<p/>
                    <div class="price-wrapper">
                        <p class="price-text">Price:</p>
                        <data class="price">$${food.price}</data>
                    </div>
                </div>
                </li>`;
            });
            foodCard += '</ul>';
            foodscontainer.innerHTML += foodCard;

        }
    }  catch (error) {
        console.error('Error fetching favourites:', error);
    }
};

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

fetchFavourites()