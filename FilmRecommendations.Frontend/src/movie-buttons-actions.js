// Function to add a movie to the user's watchlist
export function addToWatchlist(movieData) {

  let user = checkLogin();

  if(!user.loggedIn){
    return;
  }

  // Prepare the data to send to the API
  const watchlistItem = {
    title: movieData.original_title,
    tmdbId: movieData.id,
    liked: null,
  };

  // Check if the movie is already in the user's watchlist
  fetch(`https://localhost:7103/api/Movies/exists/${movieData.id}`, {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.exists) {
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
          Authorization: `Bearer ${user.token}`,
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

// Function to like a movie
export function addToLikeList(movieData){
  
  let user = checkLogin();

  if(!user.loggedIn){
    return;
  }

  // Prepare the data to send to the API
 const watchlistItem = {
   title: movieData.original_title,
   tmdbId: movieData.id,
   liked: true,
 };

 // Check if the movie is already in the user's watchlist
 fetch(`https://localhost:7103/api/Movies/exists/${movieData.id}`, {
   headers: {
     Authorization: `Bearer ${user.token}`,
   },
 })
   .then((response) => {
     // Check for authentication errors first
     if (response.status === 401) {
       localStorage.removeItem("authToken"); // Clear invalid token
       showNotification(
         "Din session har gått ut. Logga in igen för att fortsätta.",
         "error"
       );
       setTimeout(() => {
         window.location.href = "/login.html";
       }, 2000);
       throw new Error("Unauthorized - token expired");
     }
     
     if (!response.ok) {
       throw new Error(`Server error: ${response.status}`);
     }
     
     // Only try to parse JSON if we have a successful response
     return response.json();
   })
   .then((result) => {
    if (result.exists) {
      // Movie exists, check if it's already liked
      if (result.movie.liked === true) {
        showNotification(
          `Du har redan gillat "${movieData.original_title}"`,
          "info"
        );
        return;
      } else {
        // Update existing movie to liked
        const updateData = {
          movieId: result.movie.movieId,
          title: result.movie.title,
          tmdbId: result.movie.tmDbId,
          liked: true
        };
        console.log(updateData);
        
        return fetch("https://localhost:7103/api/Movies", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(updateData),
        })
        .then(response => {
          // Check for auth errors first
          if (response.status === 401) {
            localStorage.removeItem("authToken");
            showNotification(
              "Din session har gått ut. Logga in igen för att fortsätta.",
              "error"
            );
            setTimeout(() => {
              window.location.href = "/login.html";
            }, 2000);
            throw new Error("Unauthorized - token expired");
          }
          
          if (!response.ok) {
            throw new Error(`Failed to update movie: ${response.status}`);
          }
          
          return response.json();
        })
        .then(data => {
          showNotification(
            `Du gillar nu "${movieData.original_title}"`,
            "success"
          );
        })
        .catch(updateError => {
          console.error("Error updating movie:", updateError);
          if (!updateError.message.includes("Unauthorized")) {
            showNotification(
              "Ett fel inträffade vid uppdateringen av filmen.",
              "error"
            );
          }
        });
      }
     } else {
       // Movie doesn't exist, add it as a new liked movie
       return fetch("https://localhost:7103/api/Movies", {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${user.token}`,
         },
         body: JSON.stringify(watchlistItem),
       })
       .then(response => {
         // Check for auth errors here too
         if (response.status === 401) {
           localStorage.removeItem("authToken");
           showNotification(
             "Din session har gått ut. Logga in igen för att fortsätta.",
             "error"
           );
           setTimeout(() => {
             window.location.href = "/login.html";
           }, 2000);
           throw new Error("Unauthorized - token expired");
         }
         
         if (!response.ok) {
           throw new Error("Failed to add movie to liked list");
         }
         return response.json();
       })
       .then(data => {
         showNotification(
           `Du gillar nu "${movieData.original_title}"`,
           "success"
         );
       });
     }
   })
   .catch(error => {
     console.error("Error in addToLikeList:", error);
     // Don't show additional error messages for auth errors (already handled)
     if (!error.message.includes("Unauthorized")) {
       showNotification(
         "Ett fel inträffade. Kunde inte genomföra åtgärden.",
         "error"
       );
     }
   });
}

// Check if user is logged in
export function checkLogin() {

  let result = {
    token: null,
    loggedIn: false
  }

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

    result.token = null;
    result.loggedIn = false;

    return result;
  }

  result.token = token;
  result.loggedIn = true;

  return result;
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
