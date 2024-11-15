const userId = localStorage.getItem('userId');
const userEmail = localStorage.getItem('email');
const reserveForm = document.getElementById('reservationForm');
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

function openBookReserveModal(restaurantId) {
    document.getElementById('restaurantId').value = restaurantId; 
    document.getElementById('bookReserveModal').style.display = "block"; 
}

function closeReserveModal() {
    document.getElementById('bookReserveModal').style.display = "none"; 
}

async function getRestaurantById(id) {
    try {
        const response = await fetch(`/user/restaurant/${id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        const data = await response.json();
        console.log(data)
        if (data.restaurant) {
            const favresponse = await fetch(`/user/favourites?id=${userId}`);
            const fav = await favresponse.json();
            console.log(fav)
            if(fav.favoriteFoods){
                favoriteFoods = fav.favoriteFoods;
            }
            userStatus = fav.userStatus
            reservations = data.reservations;
            restaurant = data.restaurant;
            displayRestaurant(data.restaurant, data.timeSlots);
        }
        

    } catch (error) {
        console.error('Error fetching restaurant:', error);
    }
}

function displayRestaurant(restaurant, timeSlots) {
    const restaurantContainer = document.getElementById('restaurant-container');
    
    const reviewsContainer = document.getElementById('reviews-container');
    restaurantContainer.innerHTML = ''
    foodsContainer.innerHTML = '';
    reviewsContainer.innerHTML = '';

    const reservationDateInput = document.getElementById('reservationDate');

    const today = new Date();
    today.setDate(today.getDate() + 1);
    reservationDateInput.min = today.toISOString().split('T')[0];
    const oneMonthFromToday = new Date(today);
    oneMonthFromToday.setMonth(oneMonthFromToday.getMonth() + 1);
    reservationDateInput.max = oneMonthFromToday.toISOString().split('T')[0];

    // Reservation Form
    reserveForm.reset(true)
    reserveForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const reservationData = {
            restaurantId: restaurant._id,
            customerName: document.getElementById('customerName').value,
            customerPhone: document.getElementById('customerPhone').value,
            tableSize: parseInt(document.getElementById('tableSize').value),
            date: document.getElementById('reservationDate').value,
            timeSlot: document.getElementById('timeSlot').value,
            customerEmail: localStorage.getItem('email')
        };

        try {
            const response = await fetch(`/user/reservation/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reservationData),
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                reserveForm.reset(true)
                closeReserveModal();
                window.location.reload(true)
            } else {
                alert(result.error || 'Failed to create reservation');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error occurred. Please try again.');
        }
    });


    const restaurantCard = `
            <div class="hero-section" style="background-image: url('${restaurant.imageUrl}');">
                <div class="overlay">
                    <h1>${restaurant.restaurantName}</h1>
                    <div class="rating">${generateStars(restaurant.rating)}</div>
                    ${userStatus ? `<button class="reserve-table" onclick="alert('Your not allowed to make reservations')" >Reserve Table</button>` : `<button class="reserve-table" onclick="openBookReserveModal('${restaurant._id}')" >Reserve Table</button>`}
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
                   <div class="favourites">
                                    <button class="favorite-btn" data-id="${restaurant._id}" data-foodname="${food.foodName}">
                                    <ion-icon class="favourites-button ${favoriteFoods.length === 0 || favoriteFoods.findIndex(fav => fav.food.foodName === food.foodName) === -1 ? '' : 'filled'}" name="${favoriteFoods.length === 0 || favoriteFoods.findIndex(fav => fav.food.foodName === food.foodName) === -1 ? 'bookmark-outline' : 'bookmark'}"></ion-icon>
                                </button>
                    </div>
                </div>
                <h3 class="h3 card-title">${food.foodName}</h3>
                <p class="category" style="display: block !important;">Description: ${food.description}<p/>
                <div class="price-wrapper">
                    <p class="price-text">Price:</p>
                    <data class="price">$${food.price}</data>
                </div>
            </div>
            </li>`;
        });
        foodCard += '</ul>';
        foodsContainer.innerHTML += foodCard;

        // Add event listeners to favorite buttons
        document.querySelectorAll('.favorite-btn').forEach(button => {
            button.addEventListener('click', (event) => handleFavoriteFoodClick(event, button));
        });

    } else {
        foodsContainer.innerHTML = '<p>No food items available</p>';
    }
    // Reviews
    if (restaurant.reviews && restaurant.reviews.length > 0) {
        reviewsContainer.classList.add('reviews-grid'); 
        restaurant.reviews.forEach((review, index) => {
            const reviewCard = `
            <div class="review-card animate-card" style="animation-delay: ${index * 0.5}s;">
                <p style="color: #000; font-weight: 700; text-transform: capitalize;" class="comment">Username: ${review.user} </p>
                <p style="color: #000; font-weight: 700;" class="rating">Rating: ${generateStars(review.rating)}</p>
                <p style="color: #000; font-weight: 700;" class="comment">Feedback: ${review.comment}</p>
            </div>`;
            reviewsContainer.innerHTML += reviewCard;
        });
    } else {
        reviewsContainer.innerHTML = '<p>No reviews available</p>';
    }
    const optionsId = document.getElementById('timeSlot')
    if(timeSlots){
       // console.log(timeSlots);
        let options
        timeSlots.Breakfast ? options += `<option val="Breakfast">Breakfast</option>` : 0
        timeSlots.Lunch ? options += `<option val="Lunch">Lunch</option>` : 0
        timeSlots.Dinner ? options += `<option val="Dinner">Dinner</option>` : 0
        optionsId.innerHTML += options
      //  console.log(optionsId)
    } 
}

async function handleFavoriteFoodClick(event, button) {
    event.stopPropagation();
    const restaurantId = button.getAttribute('data-id');
    const foodName = button.getAttribute('data-foodname')
    const icon = button.querySelector('ion-icon');
    console.log(restaurantId, foodName)
    if (icon.classList.contains('filled')) {
        await removeFoodFromFavorites(restaurantId, foodName);
        icon.classList.remove('filled');
        icon.setAttribute('name', 'bookmark-outline');
    } else {
        await addFoodToFavorites(restaurantId, foodName);
        icon.classList.add('filled');
        icon.setAttribute('name', 'bookmark');
    }
}

// Function to add a food item to favorites
async function addFoodToFavorites(restaurantId, foodId) {
    await fetch(`/user/favorites/restaurant/${restaurantId}/food/${foodId}?user=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
}

// Function to remove a food item from favorites
async function removeFoodFromFavorites(restaurantId, foodId) {
    await fetch(`/user/favorites/restaurant/${restaurantId}/food/${foodId}?user=${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    });
}


async function fetchSlots(date, tableSize) {

    const selectedDate = new Date(date).toISOString().split('T')[0];
    const dateReservations = reservations.filter(reservation => 
        new Date(reservation.date).toISOString().split('T')[0] === selectedDate
    );

    const isBreakfastAvailable = !dateReservations.some(
        reservation => reservation.timeSlot === "Breakfast"
    );
    const isLunchAvailable = !dateReservations.some(
        reservation => reservation.timeSlot === "Lunch"
    );
    const isDinnerAvailable = !dateReservations.some(
        reservation => reservation.timeSlot === "Dinner"
    );

    let options = '';
    if (isBreakfastAvailable) options += `<option value="Breakfast">Breakfast</option>`;
    if (isLunchAvailable) options += `<option value="Lunch">Lunch</option>`;
    if (isDinnerAvailable) options += `<option value="Dinner">Dinner</option>`;
    
    const optionsId = document.getElementById('timeSlot');
    optionsId.innerHTML = '';
    optionsId.innerHTML = `<option value="" disabled selected>Select a time slot</option>` + options;
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="fa fa-star ${i <= rating ? 'checked' : ''}"></span>`;
    }
    //console.log(stars)
    return stars;
}


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

document.addEventListener('DOMContentLoaded', () => {
    const restroId = getIdFromParams();
    //console.log(restaurantId)
    if (restroId) {
        restaurantId = restroId
        getRestaurantById(restroId);
    } else {
        console.error('No restaurant ID found in the URL');
    }
    document.getElementById('username').value = localStorage.getItem('username')
    // Submit the review
document.getElementById("reviewForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const user = localStorage.getItem('username');
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const comment = document.getElementById("comment").value;
    console.log(user, rating, comment)
    if (!rating) {
        alert("Please select a rating.");
    }
    try {
      const response = await fetch(`/user/restaurants/${restaurantId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user, rating, comment })
      });
  
      if (response.ok) {
        alert("Review added successfully");
        document.getElementById('addReviewModal').style.display = 'none';
        document.getElementById("reviewForm").reset();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error adding review:", error);
    }
  });
});

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
                   <div class="favourites">
                                    <button class="favorite-btn" data-id="${restaurant._id}" data-foodname="${food.foodName}">
                                    <ion-icon class="favourites-button ${favoriteFoods.length === 0 || favoriteFoods.findIndex(fav => fav.food.foodName === food.foodName) === -1 ? '' : 'filled'}" name="${favoriteFoods.length === 0 || favoriteFoods.findIndex(fav => fav.food.foodName === food.foodName) === -1 ? 'bookmark-outline' : 'bookmark'}"></ion-icon>
                                </button>
                    </div>
                </div>
                <h3 class="h3 card-title">${food.foodName}</h3>
                <p class="category" style="display: block !important;">Description: ${food.description}<p/>
                <div class="price-wrapper">
                    <p class="price-text">Price:</p>
                    <data class="price">$${food.price}</data>
                </div>
            </div>
            </li>`;
        });
        foodCard += '</ul>';
        foodsContainer.innerHTML += foodCard;

        // Add event listeners to favorite buttons
        document.querySelectorAll('.favorite-btn').forEach(button => {
            button.addEventListener('click', (event) => handleFavoriteFoodClick(event, button));
        });
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


