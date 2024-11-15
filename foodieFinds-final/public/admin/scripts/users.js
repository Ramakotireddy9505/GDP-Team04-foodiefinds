async function fetchUsers() {
    try {
        const response = await fetch(`/admin/getAllUsers`);
        const data = await response.json();
        const reservationsTableBody = document.querySelector('#reservationsTable tbody');
        
        reservationsTableBody.innerHTML = '';

        data.users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.reservations.length} reservations</td>
                <td>
                   ${user.blocked ? `<button class="cancel-btn" onclick="unblockUser('${user._id}')">Unblock</button>` : `<button class="cancel-btn" onclick="blockUser('${user._id}')">Block</button>`} 
                </td>
            `;
            reservationsTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

async function blockUser(userId) {
    try {
        const response = await fetch(`/admin/blockUser?userId=${userId}`, {
            method: 'DELETE',
        });
        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            fetchUsers(); // Refresh the table
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error blocking user:', error);
    }
}

async function unblockUser(userId) {
    try {
        const response = await fetch(`/admin/unblockUser?userId=${userId}`, {
            method: 'PUT',
        });
        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            fetchUsers(); // Refresh the table
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error unblocking user:', error);
    }
}

fetchUsers();
