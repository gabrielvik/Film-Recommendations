// Function to add a movie to the user's watchlist
export function addToWatchlist(movieData) {
  // Check if user is logged in by looking for auth token in localStorage
  const token = localStorage.getItem("authToken");
  if (!token) {
    showNotification(
      "Du måste logga in för att lägga till filmer i din lista",
      "error"
    );
    // Redirect to login page after a short delay
    setTimeout(() => {
      window.location.href = "/login.html";
    }, 2000);
    return;
  }

  // Prepare the data to send to the API
  const watchlistItem = {
    title: movieData.original_title,
    tmdbId: movieData.id,
    liked: null, // null means it's on watchlist (not rated yet)
  };

  // Check if the movie is already in the user's watchlist
  fetch(`https://localhost:7103/api/Movies/exists/${movieData.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((exists) => {
      if (exists) {
        showNotification(
          `"${movieData.original_title}" finns redan i din lista`,
          "info"
        );
        return;
      }

      // Call the API to add the movie to the watchlist
      fetch("https://localhost:7103/api/Movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(watchlistItem),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to add movie to watchlist");
          }
          return response.json();
        })
        .then((data) => {
          showNotification(
            `${movieData.original_title} har lagts till i din lista`,
            "success"
          );
        })
        .catch((error) => {
          console.error("Error adding movie to watchlist:", error);
          showNotification(
            "Ett fel inträffade. Kunde inte lägga till filmen i din lista.",
            "error"
          );
        });
    });
}

// Helper function to show notifications
export function showNotification(message, type = "info") {
  // Create notification element if it doesn't exist
  let notification = document.getElementById("notification");
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "notification";
    notification.className =
      "fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 transition-opacity duration-300 opacity-0";
    document.body.appendChild(notification);
  }

  // Set notification style based on type
  if (type === "success") {
    notification.className =
      "fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 transition-opacity duration-300 opacity-0 bg-green-600 text-white";
  } else if (type === "error") {
    notification.className =
      "fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 transition-opacity duration-300 opacity-0 bg-red-600 text-white";
  } else {
    notification.className =
      "fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 transition-opacity duration-300 opacity-0 bg-blue-600 text-white";
  }

  // Set message and show notification
  notification.textContent = message;
  setTimeout(
    () => notification.classList.replace("opacity-0", "opacity-100"),
    10
  );

  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.classList.replace("opacity-100", "opacity-0");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}
