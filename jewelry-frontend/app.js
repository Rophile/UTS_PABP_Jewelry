const API_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('token');

// Cek jika sudah login saat halaman dimuat
if (token) showMain();

async function handleAuth(type) {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const res = await fetch(`${API_URL}/auth/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    alert(data.message);
    if (data.token) {
        localStorage.setItem('token', data.token);
        token = data.token;
        showMain();
    }
}

function showMain() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('mainSection').classList.remove('hidden');
    loadJewelry();
}

async function loadJewelry() {
    const res = await fetch(`${API_URL}/jewelry`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    const list = document.getElementById('jewelryList');
    list.innerHTML = data.items.map(item => `
    <div class="card">
        <img src="${item.image}" alt="Gelang" style="width:100%; height:150px; object-fit:cover; border-radius:8px; margin-bottom:10px;">
        <strong>${item.name}</strong>
        <span class="price">Rp ${Number(item.price).toLocaleString('id-ID')}</span>
        <div class="meta">Petugas: ${item.createdBy}</div>
    `).join('');
}

async function addJewelry() {
    const name = document.getElementById('jName').value;
    const category = document.getElementById('jCategory').value;
    const price = document.getElementById('jPrice').value;

    await fetch(`${API_URL}/jewelry`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name, category, price, stock: 10 })
    });
    loadJewelry();
}

function logout() {
    localStorage.removeItem('token');
    location.reload();
}
