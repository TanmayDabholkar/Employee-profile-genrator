// --- VIEW SWITCHING LOGIC ---
const viewEmployeeBtn = document.getElementById('viewEmployeeBtn');
const viewAdminBtn = document.getElementById('viewAdminBtn');
const employeeWorkspace = document.getElementById('employeeWorkspace');
const adminWorkspace = document.getElementById('adminWorkspace');
const adminDirectoryGrid = document.getElementById('adminDirectoryGrid');

viewEmployeeBtn.addEventListener('click', () => {
    viewEmployeeBtn.classList.add('active');
    viewAdminBtn.classList.remove('active');
    employeeWorkspace.classList.remove('hidden');
    adminWorkspace.classList.add('hidden');
});

viewAdminBtn.addEventListener('click', async () => {
    viewAdminBtn.classList.add('active');
    viewEmployeeBtn.classList.remove('active');
    adminWorkspace.classList.remove('hidden');
    employeeWorkspace.classList.add('hidden');
    
    // Fetch all profiles from database when entering admin view
    await fetchAdminDirectory();
});

// --- FETCH & RENDER ADMIN DIRECTORY ---
async function fetchAdminDirectory() {
    try {
        const response = await fetch('/api/profiles');
        const profiles = await response.json();
        
        // Clear previous view
        adminDirectoryGrid.innerHTML = '';
        
        if(profiles.length === 0) {
            adminDirectoryGrid.innerHTML = `<p class="placeholder-text">No profiles stored in database yet.</p>`;
            return;
        }

        // Loop through profiles and render mini-cards for admin
        profiles.forEach(emp => {
            const miniCard = document.createElement('div');
            miniCard.className = 'profile-card'; // reuses card style
            miniCard.innerHTML = `
                <img src="${emp.avatar}" alt="Avatar" style="width:70px; height:70px;">
                <h4>${emp.name}</h4>
                <p class="role-text" style="font-size:0.9rem; margin-bottom:0.5rem;">${emp.role}</p>
                <div class="badge">${emp.department}</div>
                <div class="meta-info" style="font-size:0.8rem;">
                    <p><strong>ID:</strong> ${emp.id}</p>
                    <p><strong>Email:</strong> ${emp.email}</p>
                </div>
            `;
            adminDirectoryGrid.appendChild(miniCard);
        });
    } catch (err) {
        console.error("Error loading directory:", err);
    }
}

// --- PROFILE GENERATOR FORM HANDLING ---
document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const profileData = {
        name: document.getElementById('name').value,
        role: document.getElementById('role').value,
        department: document.getElementById('department').value,
        bio: document.getElementById('bio').value
    };

    try {
        const response = await fetch('/generate-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });

        if (!response.ok) throw new Error('Backend error');
        const generatedProfile = await response.json();

        document.getElementById('cardAvatar').src = generatedProfile.avatar;
        document.getElementById('cardName').textContent = generatedProfile.name;
        document.getElementById('cardRole').textContent = generatedProfile.role;
        document.getElementById('cardDept').textContent = generatedProfile.department;
        document.getElementById('cardId').textContent = generatedProfile.id;
        document.getElementById('cardEmail').textContent = generatedProfile.email;
        document.getElementById('cardBio').textContent = generatedProfile.bio;

        document.getElementById('profileCard').classList.remove('hidden');
        document.getElementById('placeholderText').classList.add('hidden');
    } catch (error) {
        alert('Error communicating with server.');
    }
});
