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

// Menjalankan Server
const PORT = process.env.PORT || 3000;
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

    if (!user) || !(await bcrypt.compare(password, user.password)) {
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


app.listen(PORT, () => {
    console.log(`Server Jewelry berjalan di http://localhost:${PORT}`);
});