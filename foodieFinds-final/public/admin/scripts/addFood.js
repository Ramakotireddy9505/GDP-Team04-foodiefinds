
function openAddFoodModal(restaurantId) {
    document.getElementById('restaurantId').value = restaurantId; 
    document.getElementById('addFoodModal').style.display = "block"; 
}

async function deleteRestroFood(restaurantId, foodName, price) {
    if(restaurantId){
        try {
            const restroFood = await fetch(`/admin/deleteRestaurantFood?restaurantId=${restaurantId}&foodName=${foodName}&price=${price}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            }).then((res) => res.json());
        
            console.log(restroFood);
        
            if (restroFood.message) {
                console.log("Restaurant Food Deleted!");
                alert("Restaurant Food Deleted!");
               // window.location.reload(true);
                getRestaurantById(getIdFromParams());
            } else {
                console.log("Login failed");
                alert("Failed to delete restuarant food");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            alert("Network error or server unavailable");
        }
    }
}

function closeAddFoodModal() {
    document.getElementById('addFoodModal').style.display = "none"; 
}


document.getElementById('addFoodForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const restaurantId = document.getElementById('restaurantId').value;
    const foodName = document.getElementById('foodName').value;
    const foodPrice = document.getElementById('foodPrice').value;
    const foodDescription = document.getElementById('foodDescription').value;
    const foodCategory = document.querySelector('input[name="category"]:checked')?.value;
    const foodImage = document.getElementById('foodImage').files[0]; 

    const formData = new FormData();
    formData.append('restaurantId', restaurantId);
    formData.append('foodName', foodName);
    formData.append('price', foodPrice);
    formData.append('description', foodDescription);
    formData.append('category', foodCategory );
    formData.append('image', foodImage);
    console.log(formData)
    try {
        
        const response = await axios.post('/admin/addfood', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.status === 201) {
            alert('Food item added successfully!');
            closeAddFoodModal();
            this.reset()
            window.location.reload(true)
        }
    } catch (error) {
        console.error('Error adding food item:', error);
        alert('Error adding food item. Please try again.');
    }
});

