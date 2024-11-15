const UserModel = require('./Models/userModel.js');

async function updateAllReservationsStatuses() {
    const now = new Date();

    try {
        const users = await UserModel.find({});

        for (let user of users) {
            let hasChanges = false;

            user.reservations.forEach((reservation) => {
                const reservationDateTime = new Date(reservation.date);

                if (reservation.timeSlot === 'Breakfast') {
                    reservationDateTime.setHours(8, 0);
                } else if (reservation.timeSlot === 'Lunch') {
                    reservationDateTime.setHours(12, 0);
                } else if (reservation.timeSlot === 'Dinner') {
                    reservationDateTime.setHours(18, 0);
                }

                if (reservation.status === 'Reserved' && reservationDateTime < now) {
                    reservation.status = 'Completed';
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                await user.save();
            }
        }

       // console.log('All reservation updated successfully.');
    } catch (error) {
        console.error('Error updating reservation statuses:', error);
    }
}

module.exports = updateAllReservationsStatuses;