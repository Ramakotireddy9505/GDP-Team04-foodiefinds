const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return { hours, minutes };
};

const generateTimeSlots = (openingHours) => {
    const [openingTime, closingTime] = openingHours.split(' - ');

    const { hours: openingHour, minutes: openingMinute } = parseTime(openingTime);
    const { hours: closingHour, minutes: closingMinute } = parseTime(closingTime);

    const openDate = new Date();
    openDate.setHours(openingHour, openingMinute, 0);

    const closeDate = new Date();
    closeDate.setHours(closingHour, closingMinute, 0);

    const totalMinutes = (closeDate - openDate) / (1000 * 60);
    const slotMinutes = totalMinutes / 3;

    const breakfastTime = new Date(openDate.getTime() + slotMinutes * 60 * 1000);
    const lunchTime = new Date(breakfastTime.getTime() + slotMinutes * 60 * 1000);
    const dinnerTime = new Date(lunchTime.getTime() + slotMinutes * 60 * 1000);

    const formatTime = (date) => {
        const hours = date.getHours() % 12 || 12;
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
        return `${hours}:${minutes} ${ampm}`;
    };

    return {
        Breakfast: `${formatTime(openDate)} - ${formatTime(breakfastTime)}`,
        Lunch: `${formatTime(breakfastTime)} - ${formatTime(lunchTime)}`,
        Dinner: `${formatTime(lunchTime)} - ${formatTime(dinnerTime)}`,
    };
};

// console.log(generateTimeSlots("9:00 AM - 9:00 PM"))
module.exports = { generateTimeSlots };
