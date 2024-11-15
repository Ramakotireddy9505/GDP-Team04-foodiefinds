const userId = localStorage.getItem('userId');
const userEmail = localStorage.getItem('email');

const foodsContainer = document.getElementById('foods-container');
var reservations, favoriteFoods, favoriteRestaurants
let restaurant, restaurantId, userStatus


function getIdFromParams() {
    const encodedParams = atob(window.location.href.split('?')[1]);
    const params = new URLSearchParams(encodedParams);
    console.log(params)
    let encrypt = params.get('id')
    console.log(encrypt)
    return encrypt;
}

async function getRestaurantById(id) {
    try {
        const response = await fetch(`/admin/restaurant/${id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        const data = await response.json();
        console.log(data)
        if (data.restaurant) {
            restaurant = data.restaurant;
            displayRestaurant(data.restaurant);
        }
    } catch (error) {
        console.error('Error fetching restaurant:', error);
    }
}

function displayRestaurant(restaurant) {
    const restaurantContainer = document.getElementById('restaurant-container');
    const reviewsContainer = document.getElementById('reviews-container');

    restaurantContainer.innerHTML = ''
    foodsContainer.innerHTML = '';
    reviewsContainer.innerHTML = '';

    const restaurantCard = `
        <div class="hero-section" style="background-image: url('${restaurant.imageUrl}');">
            <div class="overlay">
                <h1>${restaurant.restaurantName}</h1>
                <div class="rating">${generateStars(restaurant.rating)}</div>
                <button class="add-food" onclick="openAddFoodModal('${restaurant._id}')">Add Food</button>
            </div>
        </div>
        
        <!-- Info Section -->
        <div class="info-container">
        <!-- Info Section -->
        <div class="info-card glass-card">
            <div class="info-grid">
                <div class="info-item">
                    <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>
                        <h3 class="info-title">Hours</h3>
                        <p class="info-text">${restaurant.openingHours}</p>
                    </div>
                </div>
                <div class="info-item">
                    <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <div>
                        <h3 class="info-title">Contact</h3>
                        <p class="info-text">+1 ${restaurant.contactNumber}</p>
                    </div>
                </div>
                <div class="info-item">
                    <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <div>
                        <h3 class="info-title">Location</h3>
                        <p class="info-text">${restaurant.address}</p>
                    </div>
                </div>
            </div>
            <p class="description">
                ${restaurant.feedback}
            </p>
        </div>
    </div>`;

    restaurantContainer.innerHTML = restaurantCard;
    
    // Food Section
    if (restaurant.foods && restaurant.foods.length > 0) {
        let foodCard = '<ul class="food-menu-list">';
        restaurant.foods.forEach(food => {
         foodCard += `
            <li data-type="${food.category}">
              <div class="food-menu-card">
                <div class="card-banner">
                  <img src="${food.imageUrl}"  loading="lazy"
                    alt="${food.foodName}" class="w-100">
                </div>
                <div class="wrapper">
                  <p class="category">${food.category}</p>
                </div>
                <h3 class="h3 card-title">${food.foodName}</h3>
                <p class="category" style="display: block !important;">Description: ${food.description}<p/>
                <div class="price-wrapper">
                    <p class="price-text">Price:</p>
                    <data class="price">$${food.price}</data>
                    </div>
                <button class="add-food-btn" onclick="openAddFoodModal('${restaurant._id}')">Edit</button>
                <button class="delete-food-btn" onclick="deleteRestroFood('${restaurant._id}','${food.foodName}','${food.price}')">Delete</button>
              </div>
              
            </li>`;
        });
        foodCard += '</ul>';
        foodsContainer.innerHTML += foodCard;
    } else {
        foodsContainer.innerHTML = '<p>No food items available</p>';
    }

    if (restaurant.reviews && restaurant.reviews.length > 0) {
        reviewsContainer.classList.add('reviews-grid'); // Add a class to the container
        restaurant.reviews.forEach((review, index) => {
            const reviewCard = `
            <div class="review-card animate-card" style="animation-delay: ${index * 0.1}s;">
                <p class="rating">Rating: ${generateStars(review.rating)}</p>
                <p class="comment">Feedback: ${review.comment}</p>
            </div>`;
            reviewsContainer.innerHTML += reviewCard;
        });
    } else {
        reviewsContainer.innerHTML = '<p>No reviews available</p>';
    }
    
}

// Helper function to generate star ratings
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="fa fa-star ${i <= rating ? 'checked' : ''}"></span>`;
    }
   // console.log(stars)
    return stars;
}


document.addEventListener('DOMContentLoaded', () => {
    const restaurantId = getIdFromParams();
    //console.log(restaurantId)
    if (restaurantId) {
        getRestaurantById(restaurantId);
    } else {
        console.error('No restaurant ID found in the URL');
    }
});

async function searchFood() {
    const searchItem = document.getElementById('searchItem').value.toLowerCase();
    console.log(searchItem);
    
    const filteredFood = restaurant.foods.filter(restaurant => {
        console.log(restaurant.foodName)
        const matchesPrice = restaurant.price.toString().includes(searchItem.toString());
        const matchesFood = restaurant.foodName.toString().toLowerCase().includes(searchItem.toString().toLowerCase());
        
        return matchesPrice || matchesFood;
  });
  
    console.log(filteredFood);
    displayFoods(filteredFood);
    document.querySelector("[data-search-close-btn]").click();
}

async function displayFoods(foods) {
    foodsContainer.innerHTML = '';
    let foodCard = '<ul class="food-menu-list">';
        foods.forEach(food => {
            console.log(food)
        foodCard += `
            <li data-type="${food.category}">
            <div class="food-menu-card">
                <div class="card-banner">
                <img src="${food.imageUrl}"  loading="lazy"
                    alt="${food.foodName}" class="w-100">
                </div>
                <div class="wrapper">
                   <p class="category">${food.category}</p>
                </div>
                <h3 class="h3 card-title">${food.foodName}</h3>
                <p class="category" style="display: block !important;">Description: ${food.description}<p/>
                <div class="price-wrapper">
                    <p class="price-text">Price:</p>
                    <data class="price">$${food.price}</data>
                </div>
                <button class="add-food-btn" onclick="openAddFoodModal('${restaurant._id}')">Edit</button>
                <button class="delete-food-btn" onclick="deleteRestroFood('${restaurant._id}','${food.foodName}','${food.price}')">Delete</button>
            </div>
            </li>`;
        });
        foodCard += '</ul>';
        foodsContainer.innerHTML += foodCard;

}
document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", function() {
      document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");
  
      const filterType = this.textContent.trim();
  
      const restaurants = document.querySelectorAll(".food-menu-list li");
  
      restaurants.forEach(restaurant => {
        const restaurantType = restaurant.getAttribute("data-type");
  
        if (
          filterType === "Both" ||
          filterType === restaurantType ||
          restaurantType === "Both" && (filterType === "Veg" || filterType === "Non-Veg")
        ) {
          restaurant.style.display = "";
        } else {
          restaurant.style.display = "none";
        }
      });
    });
  });