var container = document.getElementById('restaurants-container');
var restaurants
var restaurant
document.addEventListener('DOMContentLoaded', async function () {
    await getRestaurants();
})

// Function to fetch restaurants
async function getRestaurants() {
    try {
        const restros = await fetch(`/admin/getRestaurants`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        }).then((res) => res.json());

        console.log(restros.restaurants);

        if (restros.restaurants) {
            restaurants = restros.restaurants
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
                        </div>

                        <h3 class="h3 card-title">${restaurant.restaurantName}</h3>

                        <div class="price-wrapper">
                          <p class="price-text">Address:</p>
                          <data class="price">${restaurant.address}</data>
                        </div>
                        <button class="add-restro-btn" onclick="editRestroModal('${restaurant._id}', event)">Edit</button>
                        <button class="delete-restro-btn" onclick="deleteRestroModal('${restaurant._id}', event)">Delete</button>
                      </div>
                    </li>
                `;
            });
            restaurantCard += '</ul>';
            container.innerHTML = restaurantCard;
        }
    } catch (error) {
        console.error('Error fetching restaurants:', error);
    }
}



// Open the modal for editing a restaurant
async function editRestroModal(restaurantId, event) {
    event.stopPropagation();
    // Check if modal exists
    const modalOverlay = document.querySelector('#modalOverlay');
    if (!modalOverlay) {
        console.error('Modal element not found!');
        return;
    }

    const restros = await fetch(`/admin/restaurant/${restaurantId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    }).then((res) => res.json());

    console.log(restros.restaurant);
    restaurant = restros.restaurant
    // Populate the modal form with restaurant data
    document.querySelector('#restaurantId').value = restaurantId
    document.querySelector('#restaurantName').value = restaurant.restaurantName;
    const restaurantTypeRadios = document.querySelectorAll('#restaurantType input[name="restaurantType"]');
        restaurantTypeRadios.forEach(radio => {
            if (radio.value === restaurant.restaurantType.toString().trim()) {
                radio.checked = true;
            }
    });
    document.querySelector('#contactNumber').value = restaurant.contactNumber;
    document.querySelector('#address').value = restaurant.address;
    document.querySelector('#openingHours').value = restaurant.openingHours;
    document.querySelector('#feedback').value = restaurant.feedback;

    // Set rating
    const ratingInputs = document.querySelectorAll('#rating input');
    ratingInputs.forEach(input => {
        if (input.value == restaurant.rating) {
            input.checked = true;
        }
    });

    // Show the modal
    modalOverlay.style.display = 'flex';
}

// Function to delete a restaurant (mocked for now)
function deleteRestroModal(restaurantId,event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this restaurant?')) {
        fetch(`/admin/deleteRestaurant/${restaurantId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            alert('Restaurant deleted!');
            getRestaurants(); // Refresh the restaurant list
        })
        .catch(error => {
            console.error('Error deleting restaurant:', error);
        });
    }
}

// Close the modal
function closeModal() {
    const modalOverlay = document.querySelector('#modalOverlay');
    modalOverlay.style.display = 'none';
}

// Submit the edited restaurant form
// Submit the edited restaurant form
document.querySelector('#edit-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    try {
        const restaurantId = document.querySelector('#restaurantId').value;
        const restaurantName = document.querySelector('#restaurantName').value;
        const contactNumber = document.querySelector('#contactNumber').value;
        const address = document.querySelector('#address').value;
        const openingHours = document.querySelector('#openingHours').value;
        const feedback = document.querySelector('#feedback').value;
        const rating = document.querySelector('input[name="rating"]:checked').value;

        // Fetch the selected restaurant type
        const restaurantTypeRadios = document.querySelectorAll('#restaurantType input[name="restaurantType"]');
        let restaurantType = '';
        restaurantTypeRadios.forEach(radio => {
            if (radio.checked) {
                restaurantType = radio.value;
            }
        });

        if (!restaurantType) {
            alert('Please select a restaurant type.');
            return;
        }
        console.log(restaurantId)
        // Make PUT request to save edited restaurant data
        const response = await fetch(`/admin/editRestaurant/${restaurantId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                restaurantName,
                restaurantType,
                contactNumber,
                address,
                openingHours,
                feedback,
                rating,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update restaurant: ${response.statusText}`);
        }

        const data = await response.json();
        alert('Restaurant updated successfully!');
        closeModal();
        getRestaurants();
    } catch (error) {
        console.error('Error updating restaurant:', error);
        alert(`Error updating restaurant: ${error.message}`);
    }
});



function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<ion-icon name= ${i <= rating ? 'star' : 'star-outline'}></ion-icon>`;
    }
    return stars;
}

function handle(restaurantId) {
    window.location.href = `/admin/restaurant.html?${btoa('id='+restaurantId)}`;
}




