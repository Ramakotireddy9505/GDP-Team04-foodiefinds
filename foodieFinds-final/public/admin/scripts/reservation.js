
        async function fetchReservations() {
            try {
                const response = await fetch(`/admin/getAllReservations`);
                const data = await response.json();
                console.log(data.reservations[0])
                const reservationsTableBody = document.querySelector('#reservationsTable tbody');
                
                reservationsTableBody.innerHTML = '';

                data.reservations[0].reservations.forEach(reservation => {
                    console.log(reservation)
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${reservation.customerName}</td>
                        <td>${reservation.customerPhone}</td>
                        <td>${new Date(reservation.date).toLocaleDateString()}</td>
                        <td>${reservation.timeSlot}</td>
                        <td>${reservation.tableSize}</td>
                        <td>${reservation.restaurantId.restaurantName}</td>
                        <td>${reservation.restaurantId.contactNumber}</td>
                        <td>${reservation.restaurantId.address}</td>
                        ${reservation.status === 'Reserved' ? `<td><button class="cancel-btn" disabled>Reserved</button></td>` : `<td><button class="completed-btn" disabled>Completed</button></td>`}
                    `;
                    reservationsTableBody.appendChild(row);
                }); 
            } catch (error) {
                console.error('Error fetching reservations:', error);
            }
        }

        async function cancelReservation(reservationId) {
            try {
                const response = await fetch(`/user/deleteReservation?userId=${userId}&reservationId=${reservationId}`, {
                    method: 'DELETE',
                });
                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    fetchReservations();
                } else {
                    alert(data.error);
                }
            } catch (error) {
                console.error('Error canceling reservation:', error);
            }
        }

        fetchReservations();
