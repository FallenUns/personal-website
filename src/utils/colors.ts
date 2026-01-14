// Function to get the background color based on the hour
export const getLoaderBackgroundColor = (hour: number) => {
    if (hour >= 5 && hour < 8) { // Dawn
        return 'rgb(45, 25, 65)';
    } else if (hour >= 8 && hour < 17) { // Day
        return 'rgb(25, 35, 55)';
    } else if (hour >= 17 && hour < 20) { // Dusk
        return 'rgb(40, 20, 60)';
    } else { // Night
        return 'rgb(15, 8, 35)';
    }
};
