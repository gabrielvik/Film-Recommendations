import { isAuthenticated, getUsername, getTokenPayload } from './auth-utils.js';

// On page load, check if user is authenticated
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in, redirect to home if not
  if (!isAuthenticated()) {
    window.location.href = '/';
    return;
  }

  // Initialize profile information
  initProfile();

  // Setup theme switcher
  setupThemeSwitcher();

  // Setup profile picture change functionality
  setupProfilePictureChange();
});

function initProfile() {
  const username = getUsername();
  const profileUsername = document.getElementById('profileUsername');
  const profileImage = document.getElementById('profileImage');
  
  // Set username
  if (username) {
    profileUsername.textContent = username;
    
    // Set first letter as fallback for profile image
    if (username.length > 0) {
      const firstLetter = username.charAt(0).toUpperCase();
      const profileImageContainer = document.getElementById('profileImageContainer');
      profileImageContainer.dataset.firstLetter = firstLetter;
    }
  }

  // Get additional user info from token payload
  const payload = getTokenPayload();
  if (payload) {
    // Set email if available
    if (payload.email) {
      document.getElementById('profileEmail').textContent = payload.email;
    }
    
    // Try to calculate join date from token claims if available
    if (payload.nbf) {
      const joinDate = new Date(payload.nbf * 1000);
      document.getElementById('profileJoinDate').textContent = joinDate.toLocaleDateString();
    }

    // Load profile picture from localStorage if it exists
    const savedProfilePic = localStorage.getItem('userProfilePicture');
    if (savedProfilePic) {
      profileImage.src = savedProfilePic;
    }
  }
}

function setupProfilePictureChange() {
  const changeProfilePicButton = document.getElementById('changeProfilePicButton');
  const profilePicInput = document.getElementById('profilePicInput');
  const profileImage = document.getElementById('profileImage');
  
  changeProfilePicButton.addEventListener('click', () => {
    profilePicInput.click();
  });
  
  profilePicInput.addEventListener('change', (event) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        // Update the profile picture display
        profileImage.src = e.target.result;
        profileImage.style.display = 'block';
        
        // Remove any fallback letter that might have been added
        const letterSpan = profileImage.parentNode.querySelector('div');
        if (letterSpan) {
          letterSpan.remove();
        }
        
        // Store the image in localStorage
        localStorage.setItem('userProfilePicture', e.target.result);
        
        // Also update the mini profile picture in the header if we're on other pages
        showSuccessAlert('Profilbild uppdaterad!');
      };
      
      reader.readAsDataURL(event.target.files[0]);
    }
  });
}

function setupThemeSwitcher() {
  const themeSwitcher = document.getElementById('themeSwitcher');
  
  // On page load, check localStorage for the preferred theme
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // Toggle dark mode and save the setting in localStorage
  themeSwitcher.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    if (document.documentElement.classList.contains('dark')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  });
}

function showSuccessAlert(message) {
  const successAlert = document.getElementById('successAlert');
  const successAlertMessage = document.getElementById('successAlertMessage');
  
  successAlertMessage.textContent = message || 'Åtgärden lyckades!';
  successAlert.classList.remove('hidden');
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    successAlert.classList.add('hidden');
  }, 3000);
}