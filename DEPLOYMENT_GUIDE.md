# Deployment Guide — CloudTask

Panduan ini dirancang untuk Ubuntu VM/Oracle Cloud dengan Nginx, PM2, domain, SSL Let's Encrypt, dan GitHub Actions.

## 1. Persiapan VM

Pastikan Security List/NSG mengizinkan TCP 22, 80, dan 443.

```bash
sudo apt update
sudo apt install -y nginx git curl
```

Install Node.js 22 melalui metode resmi/distribusi yang Anda gunakan, lalu cek:

```bash
node -v
npm -v
```

Install PM2:

```bash
sudo npm install -g pm2
```

## 2. Letakkan aplikasi

```bash
sudo mkdir -p /var/www/cloudtask
sudo chown -R $USER:$USER /var/www/cloudtask
cd /var/www/cloudtask
```

Clone repository GitHub ke direktori tersebut. CI/CD menggunakan `git fetch/reset` pada repo ini, sehingga folder `/var/www/cloudtask` harus merupakan Git working tree.

```bash
cp .env.example .env
npm install
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

Aktifkan PM2 saat server boot:

```bash
pm2 startup
```

Jalankan command `sudo ...` yang ditampilkan PM2, kemudian `pm2 save` lagi.

Verifikasi:

```bash
curl http://127.0.0.1:3000/api/health
```

## 3. Nginx reverse proxy

Edit `deploy/nginx/cloudtask.conf`, ganti:

```nginx
server_name cloudtask.example.com;
```

menjadi domain Anda, misalnya:

```nginx
server_name cloudtask.projectj13.online;
```

Pasang konfigurasi:

```bash
sudo cp deploy/nginx/cloudtask.conf /etc/nginx/sites-available/cloudtask
sudo ln -s /etc/nginx/sites-available/cloudtask /etc/nginx/sites-enabled/cloudtask
sudo nginx -t
sudo systemctl reload nginx
```

## 4. Domain

Pada pengelola DNS domain, buat A record:

```text
Type: A
Name: cloudtask
Points to: PUBLIC_IP_ORACLE_VM
TTL: default
```

Pastikan domain mengarah ke IP VM:

```bash
nslookup cloudtask.DOMAIN_ANDA
```

## 5. SSL/HTTPS

Setelah domain sudah resolve ke VM:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d cloudtask.DOMAIN_ANDA
```

Verifikasi pembaruan otomatis:

```bash
sudo certbot renew --dry-run
```

Buka:

```text
https://cloudtask.DOMAIN_ANDA
```

## 6. Monitoring

```bash
pm2 status
pm2 logs cloudtask --lines 100
curl https://cloudtask.DOMAIN_ANDA/api/health
sudo systemctl status nginx
```

Endpoint `/api/health` menguji proses web dan akses penyimpanan data.

## 7. CI/CD GitHub Actions

Workflow tersedia di `.github/workflows/deploy.yml`.

Tambahkan repository secrets di GitHub → Settings → Secrets and variables → Actions:

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`

Gunakan deployment SSH key khusus dengan permission seminimal mungkin. Jangan menggunakan atau mengunggah private key pribadi utama jika tidak diperlukan.

Setelah secrets tersedia, lakukan perubahan lalu push:

```bash
git add .
git commit -m "Test automatic deployment"
git push origin main
```

Buka tab **Actions** di repository. Workflow harus melewati tahap checkout, build, upload, deploy, dan health check.

## 8. Skenario pengujian untuk presentasi

1. Tunjukkan aplikasi live melalui HTTPS.
2. Buat task baru dan tunjukkan statistik berubah.
3. Ubah status task hingga Done.
4. Tunjukkan `cloudtask-state` di Local Storage.
5. Aktifkan mode Offline di DevTools dan buat perubahan.
6. Tunjukkan pending operation bertambah.
7. Online kembali dan tunjukkan sync berhasil.
8. Buka `/api/health`.
9. Tunjukkan `pm2 status`.
10. Push commit kecil ke GitHub lalu tunjukkan workflow Actions berhasil dan perubahan muncul pada domain.

Dengan bukti tersebut, komponen state management, cloud hosting, domain, SSL, CI/CD, dan monitoring dapat diverifikasi secara terpisah.
