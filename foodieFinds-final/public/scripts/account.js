document.addEventListener('DOMContentLoaded', async () => {
    
    const userId = localStorage.getItem('userId');
    const response = await fetch(`/user/getUser/${userId}`);
    const userData = await response.json();

    document.getElementById('username').value = userData.username;
    document.getElementById('email').value = userData.email;

    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const updatedData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        const updateResponse = await fetch(`/user/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        if (updateResponse.ok) {
            alert('Profile updated successfully!');
        } else {
            alert('Error updating profile.');
        }
    });

    document.getElementById('deleteAccount').addEventListener('click', async () => {
        const deleteResponse = await fetch(`/user/users/${userId}`, {
            method: 'DELETE'
        });

        if (deleteResponse.ok) {
            alert('Account deleted successfully!');
            window.location.href = '/';
        } else {
            alert('Error deleting account.');
        }
    });
});
