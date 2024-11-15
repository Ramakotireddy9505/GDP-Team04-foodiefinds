const container = document.getElementById('restaurants-container');
const form = document.getElementById('form');
form.reset()
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const formObj = {};
    form.forEach((value, key) => {
        formObj[key] = value;
    });
    console.log(formObj);
    const addRestro = await axios.post('/admin/addRestaurant', formObj, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
    });
    console.log(addRestro)
    if(addRestro.data){
        alert("Restaurant added successfully");
    } else {
        alert("Failed to add restaurant");
    }
});

