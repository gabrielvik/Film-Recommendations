// Register modal functionality
const registerButton = document.getElementById('registerButton');
const registerModal = document.getElementById('registerModal');
const closeRegisterModal = document.getElementById('closeRegisterModal');
const registerForm = document.getElementById('registerForm');
const modalContent = registerModal.querySelector('div');

registerButton.addEventListener('click', () => {
  registerModal.classList.remove('hidden');
  // Animate in
  setTimeout(() => {
    modalContent.classList.remove('opacity-0', 'scale-95');
    modalContent.classList.add('opacity-100', 'scale-100');
  }, 10);
});

closeRegisterModal.addEventListener('click', closeRegisterModalFunction);

// Close when clicking outside the modal content
registerModal.addEventListener('click', (e) => {
  if (e.target === registerModal) {
    closeRegisterModalFunction();
  }
});

function closeRegisterModalFunction() {
  // Animate out
  modalContent.classList.remove('opacity-100', 'scale-100');
  modalContent.classList.add('opacity-0', 'scale-95');
  
  // Hide after animation completes
  setTimeout(() => {
    registerModal.classList.add('hidden');
  }, 300);
}

// Alert handling functions
function showSuccessAlert(message) {
    const successAlert = document.getElementById('successAlert');
    const successAlertMessage = document.getElementById('successAlertMessage');
    
    successAlertMessage.textContent = message || 'Registrering lyckades!';
    successAlert.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      successAlert.classList.add('hidden');
    }, 5000);
  }

  function showErrorAlert(message) {
  const errorAlert = document.getElementById('errorAlert');
  const errorAlertMessage = document.getElementById('errorAlertMessage');
  
  // Use innerHTML instead of textContent to allow HTML formatting
  errorAlertMessage.innerHTML = message || 'Ett fel uppstod vid registrering.';
  
  // Make the alert wider for multi-line messages
  if (message && message.includes('<br>')) {
    errorAlert.classList.add('max-w-md', 'w-auto');
  } else {
    errorAlert.classList.remove('max-w-md', 'w-auto');
  }
  
  errorAlert.classList.remove('hidden');
  
  // Auto-hide after longer time for more complex messages
  setTimeout(() => {
    errorAlert.classList.add('hidden');
    // Reset width classes after hiding
    errorAlert.classList.remove('max-w-md', 'w-auto');
  }, 8000); // 8 seconds for password errors to give users time to read
}

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  console.log('Registration submitted:', { username, email, password });
  
  try {
    const response = await fetch('https://localhost:7103/api/Auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Success:', data);
      showSuccessAlert('Ditt konto har skapats! Du kan nu logga in.');
      closeRegisterModalFunction();
      registerForm.reset();
    } else {
      console.error('Error:', data);
      // Handle specific error messages from the API
      let errorMessage = 'Ett fel uppstod vid registrering.';
      
      // Check if data.errors is an array (password validation errors)
      if (data.errors && Array.isArray(data.errors)) {
        errorMessage = 'Lösenordet måste uppfylla följande krav:<br>';
        errorMessage += data.errors.map(err => `• ${err}`).join('<br>');
      }
      // Handle array directly
      else if (Array.isArray(data)) {
        errorMessage = 'Lösenordet måste uppfylla följande krav:<br>';
        errorMessage += data.map(err => `• ${err}`).join('<br>');
      }
      // Handle structured errors object
      else if (data.errors) {
        // Check for specific error types
        if (data.errors.Email) {
          errorMessage = `E-post: ${data.errors.Email[0]}`;
        } else if (data.errors.Password) {
          if (Array.isArray(data.errors.Password)) {
            errorMessage = 'Lösenordsfel:<br>';
            errorMessage += data.errors.Password.map(err => `• ${err}`).join('<br>');
          } else {
            errorMessage = `Lösenord: ${data.errors.Password[0]}`;
          }
        } else if (data.errors.Username) {
          errorMessage = `Användarnamn: ${data.errors.Username[0]}`;
        }
      } else if (data.message) {
        errorMessage = data.message;
      }
      
      showErrorAlert(errorMessage);
    }
  } catch (error) {
    console.error('Error:', error);
    showErrorAlert('Kunde inte ansluta till servern. Försök igen senare.');
  }
});

// Login modal functionality
const loginButton = document.getElementById('loginButton');
const loginModal = document.getElementById('loginModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const loginForm = document.getElementById('loginForm');
const loginModalContent = loginModal.querySelector('div');

loginButton.addEventListener('click', () => {
  loginModal.classList.remove('hidden');
  // Animate in
  setTimeout(() => {
    loginModalContent.classList.remove('opacity-0', 'scale-95');
    loginModalContent.classList.add('opacity-100', 'scale-100');
  }, 10);
});

closeLoginModal.addEventListener('click', closeLoginModalFunction);

// Close when clicking outside the modal content
loginModal.addEventListener('click', (e) => {
  if (e.target === loginModal) {
    closeLoginModalFunction();
  }
});

function closeLoginModalFunction() {
  // Animate out
  loginModalContent.classList.remove('opacity-100', 'scale-100');
  loginModalContent.classList.add('opacity-0', 'scale-95');
  
  // Hide after animation completes
  setTimeout(() => {
    loginModal.classList.add('hidden');
  }, 300);
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    console.log('Login submitted:', { email, password, rememberMe });
    
    try {
      const response = await fetch('https://localhost:7103/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('Login Success:', data);
        showSuccessAlert('Inloggning lyckades!');
        
        // Store the JWT token
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          // You might want to update UI to show logged-in state here
        }
        
        closeLoginModalFunction();
        loginForm.reset();
      } else {
        console.error('Login Error:', data);
        showErrorAlert(data.message || 'Felaktig e-post eller lösenord.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      showErrorAlert('Kunde inte ansluta till servern. Försök igen senare.');
    }
  });
