import { Injectable } from '@nestjs/common';
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';

@Injectable()
export class WhatsappService {
    private sock;

    constructor() {
        this.connectToWhatsApp();
    }

    async connectToWhatsApp() {
        const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');
        this.sock = makeWASocket({
            printQRInTerminal: false,
            auth: state,
        });

        // Event handler untuk pembaruan koneksi
        this.sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr: newQr } = update;


            if (connection === 'close') {
                const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
                console.log("Koneksi ditutup karena", reason);
                // Menangani berbagai alasan diskoneksi
                if (reason === DisconnectReason.badSession || reason === DisconnectReason.loggedOut) {
                    console.log("File sesi rusak/perangkat keluar. Silakan hapus file sesi dan pindai ulang.");
                    await this.sock.logout();
                    this.connectToWhatsApp();
                } else if (reason === DisconnectReason.connectionClosed || reason === DisconnectReason.connectionLost || reason === DisconnectReason.restartRequired || reason === DisconnectReason.timedOut) {
                    console.log("Koneksi terputus. Mencoba menyambung ulang...");
                    this.connectToWhatsApp();
                } else if (reason === DisconnectReason.connectionReplaced) {
                    console.log("Koneksi digantikan, sesi baru dibuka. Harap tutup sesi saat ini.");
                    await this.sock.logout();
                } else {
                    this.sock.end(`Alasan diskoneksi tidak diketahui: ${reason}|${lastDisconnect?.error}`);
                }
            } else if (connection === 'open') {
                console.log('Koneksi terbuka!');
                // Log daftar grup yang diikuti
                let groups: any = Object.values(await this.sock.groupFetchAllParticipating());
                for (let group of groups) {
                    console.log(`ID Group: ${group.id} || Nama Group: ${group.subject}`);
                }
            }

            this.sock.ev.on('creds.update', saveCreds)

        });
    }

    async sendVerificationCode(phoneNumber: string) {
        // Meminta  code
        const code = await this.sock.requestPairingCode(phoneNumber);
        console.log(code);

        // 1. Generate kode OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 2. Simpan OTP di database dengan waktu kedaluwarsa (contoh: 5 menit)
        // await this.redisService.set(`otp:${phoneNumber}`, otp, 300); // 300 detik

        // 3. Kirim OTP melalui WhatsApp API
        const message = `Kode verifikasi Anda adalah ${otp}. Jangan berikan kode ini kepada siapapun.`;
        await this.sendMessage(phoneNumber + '@s.whatsapp.net', message);
    }

    // Contoh fungsi untuk mengirim pesan
    async sendMessage(jid: string, text: string) {
        if (this.sock) {
            await this.sock.sendMessage(jid, { text: text });
        }
    }
}