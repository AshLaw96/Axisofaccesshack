/**
 * Initializes tooltips for elements with the `data-bs-toggle="tooltip"` attribute
 * and sets up the unread notification counter functionality.
 */
document.addEventListener('DOMContentLoaded', function () {
    // Tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl, {
            container: 'body' // Ensure tooltips are appended to <body>
        });
    });

    /**
     * Checks for unread notifications by making a fetch request to the server.
     * Updates the notification icon and document title based on the number of unread notifications.
     */
    function checkUnreadNotifications() {
        fetch(unreadNotificationsUrl)
            .then(response => response.json())
            .then(data => {
                const notificationIcon = document.querySelector('.notification-icon .unread-indicator');
                if (data.unread_count > 0) {
                    notificationIcon.style.display = 'inline-block';
                    notificationIcon.textContent = data.unread_count;
                    document.title = `(${data.unread_count}) New Notifications - ICONic Needs`;
                } else {
                    notificationIcon.style.display = 'none';
                    document.title = 'ICONic Needs';
                }
                if (data.unread_count === 1) {
                    document.title = '(1) New Notification - ICONic Needs';
                }
            })
            .catch(error => console.error('Error checking notifications:', error));
    }

    checkUnreadNotifications(); // Check immediately on load
    setInterval(checkUnreadNotifications, 10000); // Check every 30 seconds
});


/**
 * Handles the click event for an icon button. Toggles the "enlarged" state for the clicked icon,
 * ensures that only one icon is enlarged at a time, and sends a notification to the server if the icon is expanded.
 *
 * @param {HTMLElement} button - The DOM element representing the clicked icon button.
 */
function iconClicked(button) {
    console.log("Tile clicked:", button);

    // Find the closest wrapper or fallback to the button
    const container = button.closest('.icons-wrapper') || button;

    const allCards = document.querySelectorAll('.icons-wrapper, .icon-tile');
    const isAlreadyEnlarged = container.classList.contains('enlarged');

    // Remove "enlarged" class from all cards except the clicked one
    allCards.forEach((card) => {
        if (card !== container) {
            card.classList.remove('enlarged');
        }
    });

    // If the card is already enlarged, minimize it (no notification)
    if (isAlreadyEnlarged) {
        container.classList.remove('enlarged');
        console.log("Tile minimized: no notification sent.");
        return;
    }

    // Enlarge the clicked card and send a notification
    const beep = new Audio("/static/bell.mp3");
    beep.play();

    container.classList.add('enlarged');
    console.log("Tile expanded: sending notification.");

    // Send notification to the server
    const iconId = button.getAttribute('data-icon-id');
    sendNotification(iconId);
}


/**
 * Sends a notification to the server for the specified icon ID.
 *
 * @param {string} iconId - The ID of the icon for which the notification should be sent.
 */
function sendNotification(iconId) {
    const url = sendNotificationUrl.replace('0', iconId); // Replace '0' with actual ID
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                console.log('Success:', data.message);
            } else {
                console.error('Error:', data.error);
            }
        })
        .catch(error => {
            console.error('Unexpected error:', error);
        });
}