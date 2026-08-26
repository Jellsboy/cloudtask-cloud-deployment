# CloudTask — Cloud Task Management

CloudTask adalah aplikasi task management yang dibuat khusus untuk menunjukkan **client-side state management** dan proses **deployment aplikasi web di cloud**. Frontend menggunakan React + Zustand, backend menggunakan Express REST API, dan aplikasi disiapkan untuk deployment di VM cloud menggunakan Nginx, PM2, HTTPS/SSL, serta CI/CD GitHub Actions.

## Kesesuaian dengan asesmen

| Aspek | Implementasi |
|---|---|
| Client-side state management | Zustand store (`src/store/useTaskStore.js`) |
| State persistence | Zustand persist → `localStorage` |
| Offline state | Optimistic UI + `pendingOperations` queue |
| Web application | React/Vite frontend + Express REST API |
| Environment | `.env.example` + `dotenv` |
| Dependency management | `package.json` + npm lockfile setelah instalasi |
| Cloud hosting | Konfigurasi VM Linux/Oracle Cloud |
| Reverse proxy | Nginx (`deploy/nginx/cloudtask.conf`) |
| Process management | PM2 (`ecosystem.config.cjs`) |
| Domain | `server_name` Nginx, diisi domain milik mahasiswa |
| SSL/HTTPS | Certbot + Let's Encrypt |
| CI/CD | `.github/workflows/deploy.yml` |
| Monitoring | `GET /api/health`, PM2 status/logs |
| Version control | Git + GitHub |

## Fitur

- Create, Read, Update status, dan Delete task.
- Status: To Do, In Progress, Done.
- Prioritas: Low, Medium, High.
- Deadline, pencarian, dan filter task.
- Tema dark/light tersimpan di browser.
- Task dan preferensi client tersimpan melalui Zustand persist.
- Perubahan tetap terlihat saat offline melalui optimistic state.
- Operasi gagal masuk `pendingOperations` dan disinkronkan ketika online kembali.
- Endpoint health monitoring `/api/health`.
- UI responsif untuk desktop dan mobile.

## Menjalankan di lokal

Syarat: Node.js 20.19+ (disarankan Node.js 22).

```bash
cp .env.example .env
npm install
npm run dev
```

Frontend development: `http://localhost:5173`  
API: `http://localhost:3000/api/tasks`  
Health: `http://localhost:3000/api/health`

Untuk simulasi produksi:

```bash
npm run build
npm start
```

Buka `http://localhost:3000`.

## Bukti state management yang dapat dipresentasikan

1. Buka DevTools → Application → Local Storage.
2. Cari key `cloudtask-state`.
3. Tambahkan task dan ubah filter/tema.
4. Refresh browser: state tetap tersimpan.
5. Ubah DevTools Network menjadi Offline.
6. Tambahkan/ubah/hapus task: UI tetap berubah dan jumlah pending sync bertambah.
7. Kembali Online: antrean disinkronkan otomatis.

## Deployment ke Oracle Cloud / Ubuntu VM

Panduan lengkap ada di `DEPLOYMENT_GUIDE.md`.

Ringkasnya:

```bash
sudo mkdir -p /var/www/cloudtask
sudo chown -R $USER:$USER /var/www/cloudtask
cd /var/www/cloudtask
# clone/copy repo ke sini
npm install
npm run build
sudo npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
```

Lalu pasang Nginx, arahkan domain, dan aktifkan Certbot.

## CI/CD GitHub Actions

Workflow akan berjalan setiap push ke `main`. Buat GitHub Repository Secrets:

- `VPS_HOST` = public IP VM
- `VPS_USER` = user SSH, contoh `ubuntu`
- `VPS_SSH_KEY` = private key khusus deployment

**Jangan commit private key atau `.env` ke repository.**

## Monitoring

```bash
curl http://127.0.0.1:3000/api/health
pm2 status
pm2 logs cloudtask --lines 100
```

Respons health normal:

```json
{
  "status": "ok",
  "app": "CloudTask",
  "uptimeSeconds": 120,
  "store": "ok",
  "timestamp": "2026-08-26T08:00:00.000Z"
}
```

## Repository GitHub

Setelah project diuji:

```bash
git init
git add .
git commit -m "Initial commit - CloudTask cloud deployment"
git branch -M main
git remote add origin https://github.com/USERNAME/cloudtask-cloud-deployment.git
git push -u origin main
```
