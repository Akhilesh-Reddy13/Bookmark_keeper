// Constants for API endpoints
const API_URL = 'http://localhost:5000/api/bookmarks'; // Base URL for bookmark operations
const AUTH_URL = 'http://localhost:5000/api/bookmarks'; // Base URL for authentication - same as bookmarks

// DOM Elements
// Auth elements
const authButtons = document.getElementById('auth-buttons');
const userInfo = document.getElementById('user-info');
const usernameDisplay = document.getElementById('username-display');
const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const welcomeSignupBtn = document.getElementById('welcome-signup-btn');
const welcomeLoginBtn = document.getElementById('welcome-login-btn');

// Auth modal
const authModal = document.getElementById('auth-modal');
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const submitSignup = document.getElementById('submit-signup');
const cancelSignup = document.getElementById('cancel-signup');
const submitLogin = document.getElementById('submit-login');
const cancelLogin = document.getElementById('cancel-login');

// Dashboard elements
const dashboard = document.getElementById('dashboard');
const welcomeScreen = document.getElementById('welcome-screen');
const getBookmarksBtn = document.getElementById('get-bookmarks-btn');
const addBookmarkBtn = document.getElementById('add-bookmark-btn');
const getBookmarkByIdBtn = document.getElementById('get-bookmark-by-id-btn');
const bookmarkIdInput = document.getElementById('bookmark-id-input');
const bookmarksContainer = document.getElementById('bookmarks-container');

// Bookmark modal
const bookmarkModal = document.getElementById('bookmark-modal');
const bookmarkModalTitle = document.getElementById('bookmark-modal-title');
const bookmarkForm = document.getElementById('bookmark-form');
const bookmarkIdField = document.getElementById('bookmark-id');
const bookmarkTitle = document.getElementById('bookmark-title');
const bookmarkUrl = document.getElementById('bookmark-url');
const bookmarkDescription = document.getElementById('bookmark-description');
const bookmarkTags = document.getElementById('bookmark-tags');
const saveBookmarkBtn = document.getElementById('save-bookmark-btn');
const cancelBookmarkBtn = document.getElementById('cancel-bookmark-btn');

// State
let currentUser = null;
let isEditing = false;

// Check if user is logged in when page loads
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (token && username) {
        currentUser = { token, username };
        updateUIForLoggedInUser();
    } else {
        updateUIForLoggedOutUser();
    }
}

// UI Updates
function updateUIForLoggedInUser() {
    authButtons.classList.add('hidden');
    userInfo.classList.remove('hidden');
    usernameDisplay.textContent = `Welcome, ${currentUser.username}`;
    dashboard.classList.remove('hidden');
    welcomeScreen.classList.add('hidden');
    // Load user's bookmarks
    fetchBookmarks();
}

function updateUIForLoggedOutUser() {
    authButtons.classList.remove('hidden');
    userInfo.classList.add('hidden');
    dashboard.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    currentUser = null;
}

// Auth functions
async function registerUser(username, password) {
    try {
        console.log("Attempting to register user at:", `${AUTH_URL}/users/signup`);
        const response = await fetch(`${AUTH_URL}/users/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        // Debug info
        console.log("Response status:", response.status);
        console.log("Response content-type:", response.headers.get('content-type'));
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error("Non-JSON response received:", text.substring(0, 200));
            throw new Error("Server returned HTML instead of JSON. Check if the API endpoint exists.");
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to register');
        }
        
        alert('Registration successful! Please log in.');
        showLoginForm();
    } catch (error) {
        alert(`Registration failed: ${error.message}`);
    }
}

async function loginUser(username, password) {
    try {
        console.log("Attempting to login at:", `${AUTH_URL}/users/login`);
        const response = await fetch(`${AUTH_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        // Debug info
        console.log("Response status:", response.status);
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to login');
        }
        
        // Store the token and username
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        currentUser = { token: data.token, username };
        
        // Close the modal and update UI
        closeAuthModal();
        updateUIForLoggedInUser();
    } catch (error) {
        alert(`Login failed: ${error.message}`);
    }
}

function logoutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    updateUIForLoggedOutUser();
    bookmarksContainer.innerHTML = '';
}

// Bookmark functions
async function fetchBookmarks() {
    if (!currentUser) return;
    
    try {
        // Use just API_URL, not /bookmarks since the API_URL already includes it
        const response = await fetch(`${API_URL}`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch bookmarks');
        }
        
        displayBookmarks(data);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function fetchBookmarkById(id) {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch bookmark');
        }
        
        // Display just this bookmark
        bookmarksContainer.innerHTML = '';
        appendBookmarkToDOM(data);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function createBookmark(bookmarkData) {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(bookmarkData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create bookmark');
        }
        
        alert('Bookmark created successfully!');
        closeBookmarkModal();
        fetchBookmarks();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function updateBookmark(id, bookmarkData) {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(bookmarkData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update bookmark');
        }
        
        alert('Bookmark updated successfully!');
        closeBookmarkModal();
        fetchBookmarks();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function deleteBookmark(id) {
    if (!currentUser) return;
    
    if (!confirm('Are you sure you want to delete this bookmark?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete bookmark');
        }
        
        alert('Bookmark deleted successfully!');
        fetchBookmarks();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// Display Functions
function displayBookmarks(bookmarks) {
    bookmarksContainer.innerHTML = '';
    
    if (!bookmarks || bookmarks.length === 0) {
        bookmarksContainer.innerHTML = `
            <div class="bg-white p-4 rounded shadow text-center">
                <p>No bookmarks found. Add your first bookmark!</p>
            </div>
        `;
        return;
    }
    
    bookmarks.forEach(bookmark => {
        appendBookmarkToDOM(bookmark);
    });
}

function appendBookmarkToDOM(bookmark) {
    const bookmarkEl = document.createElement('div');
    bookmarkEl.className = 'bg-white p-4 rounded shadow mb-4';
    
    // Format tags for display
    const tagsDisplay = Array.isArray(bookmark.tags) 
        ? bookmark.tags.map(tag => `<span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded mr-2">${tag}</span>`).join('')
        : '';
    
    bookmarkEl.innerHTML = `
        <div class="flex justify-between items-start">
            <div>
                <h3 class="text-lg font-bold">${bookmark.title}</h3>
                <a href="${bookmark.url}" target="_blank" class="text-blue-600 hover:underline break-all">${bookmark.url}</a>
            </div>
            <div>
                <button class="edit-bookmark-btn text-blue-500 hover:text-blue-700 mr-2" data-id="${bookmark._id}">Edit</button>
                <button class="delete-bookmark-btn text-red-500 hover:text-red-700" data-id="${bookmark._id}">Delete</button>
            </div>
        </div>
        <p class="my-2 text-gray-700">${bookmark.description || ''}</p>
        <div class="mt-3">
            ${tagsDisplay}
        </div>
        <div class="text-xs text-gray-500 mt-2">ID: ${bookmark._id}</div>
    `;
    
    // Add event listeners to edit and delete buttons
    const editBtn = bookmarkEl.querySelector('.edit-bookmark-btn');
    const deleteBtn = bookmarkEl.querySelector('.delete-bookmark-btn');
    
    editBtn.addEventListener('click', () => {
        openBookmarkModal(bookmark);
    });
    
    deleteBtn.addEventListener('click', () => {
        deleteBookmark(bookmark._id);
    });
    
    bookmarksContainer.appendChild(bookmarkEl);
}

// Modal Functions
function showSignupForm() {
    authModal.classList.remove('hidden');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
}

function showLoginForm() {
    authModal.classList.remove('hidden');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
}

function closeAuthModal() {
    authModal.classList.add('hidden');
    signupForm.classList.add('hidden');
    loginForm.classList.add('hidden');
}

function openBookmarkModal(bookmark = null) {
    bookmarkModal.classList.remove('hidden');
    
    if (bookmark) {
        isEditing = true;
        bookmarkModalTitle.textContent = 'Edit Bookmark';
        bookmarkIdField.value = bookmark._id;
        bookmarkTitle.value = bookmark.title;
        bookmarkUrl.value = bookmark.url;
        bookmarkDescription.value = bookmark.description || '';
        bookmarkTags.value = Array.isArray(bookmark.tags) ? bookmark.tags.join(', ') : '';
    } else {
        isEditing = false;
        bookmarkModalTitle.textContent = 'Add Bookmark';
        bookmarkForm.reset();
        bookmarkIdField.value = '';
    }
}

function closeBookmarkModal() {
    bookmarkModal.classList.add('hidden');
    bookmarkForm.reset();
}

// Event Listeners
signupBtn.addEventListener('click', showSignupForm);
loginBtn.addEventListener('click', showLoginForm);
welcomeSignupBtn.addEventListener('click', showSignupForm);
welcomeLoginBtn.addEventListener('click', showLoginForm);

cancelSignup.addEventListener('click', closeAuthModal);
cancelLogin.addEventListener('click', closeAuthModal);

submitSignup.addEventListener('click', () => {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    
    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    registerUser(username, password);
});

submitLogin.addEventListener('click', () => {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    loginUser(username, password);
});

logoutBtn.addEventListener('click', logoutUser);

getBookmarksBtn.addEventListener('click', fetchBookmarks);

addBookmarkBtn.addEventListener('click', () => {
    openBookmarkModal();
});

getBookmarkByIdBtn.addEventListener('click', () => {
    const id = bookmarkIdInput.value.trim();
    if (!id) {
        alert('Please enter a bookmark ID');
        return;
    }
    fetchBookmarkById(id);
});

saveBookmarkBtn.addEventListener('click', () => {
    const title = bookmarkTitle.value;
    const url = bookmarkUrl.value;
    const description = bookmarkDescription.value;
    const tags = bookmarkTags.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    if (!title || !url) {
        alert('Title and URL are required');
        return;
    }
    
    const bookmarkData = {
        title,
        url,
        description,
        tags
    };
    
    if (isEditing) {
        updateBookmark(bookmarkIdField.value, bookmarkData);
    } else {
        createBookmark(bookmarkData);
    }
});

cancelBookmarkBtn.addEventListener('click', closeBookmarkModal);

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === authModal) {
        closeAuthModal();
    }
    if (event.target === bookmarkModal) {
        closeBookmarkModal();
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});