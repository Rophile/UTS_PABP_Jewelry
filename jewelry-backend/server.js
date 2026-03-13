// Memanggil library yang sudah diinstal di langkah 1.2 [cite: 20]
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Mengaktifkan konfigurasi dari file .env
dotenv.config();
//Array sementara untuk menyimpan data perhiasan (sebagai pengganti database sementara)
let users = [];
let jewelryItems = [];//untuk bagian crud perhiasan

const app = express();

// --- MIDDLEWARE DASAR ---
app.use(cors()); // Izin akses untuk berbagai platform (Web/Mobile) [cite: 26]
app.use(express.json()); // Agar server bisa membaca data format JSON dari Frontend [cite: 15]

// --- CEK KONEKSI (UJI COBA) ---
app.get('/', (req, res) => {
    res.json({
        message: "Selamat Datang di Jewelry API Syaila Fa Agna",
        status: "Running"
    });
});

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;

    //hashing password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru ke "database" (array sementara)
    const newUser = { id: Date.now(), username, password: hashedPassword };
    users.push(newUser);

    res.status(201).json({ message: 'User berhasil didaftarkan', userId: newUser.id });
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Username atau password salah' });
    }

    // Buat token JWT
    const token = jwt.sign(
        { userId: user.id, username: user.username }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
    );

    res.json({ message: 'Login berhasil', token });
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Mengambil token setelah kata 'Bearer'

    if (!token) return res.status(401).json({ message: "Akses ditolak, token hilang!" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token tidak valid!" });
        req.user = user;
        next(); // Lanjut ke proses CRUD
    });
};

// 3.1.1 Create: Menambah Perhiasan Baru (Wajib Token/Login)
app.post('/api/jewelry', authenticateToken, (req, res) => {
    const { name, category, price, stock } = req.body;
    const newItem = { 
        id: Date.now(), 
        name, 
        category, 
        price, 
        stock,
        createdBy: req.user.username // Mengambil nama penginput dari token JWT
    };
    jewelryItems.push(newItem);
    res.status(201).json({ message: "Data perhiasan berhasil ditambahkan!", data: newItem });
});

// 3.1.2 Read: Melihat Semua Koleksi Perhiasan (Wajib Token/Login)
app.get('/api/jewelry', authenticateToken, (req, res) => {
    res.json({ 
        total: jewelryItems.length,
        items: jewelryItems 
    });
});

// 3.1.3 Update & Delete (Opsional untuk melengkapi CRUD)
app.delete('/api/jewelry/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    jewelryItems = jewelryItems.filter(item => item.id != id);
    res.json({ message: `Perhiasan dengan ID ${id} berhasil dihapus.` });
});

// Menjalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Jewelry berjalan di http://localhost:${PORT}`);
});