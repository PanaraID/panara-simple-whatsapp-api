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
            const { connection, lastDisconnect } = update;

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

    async sendVerificationCode(phoneNumber: string): Promise<string> {
        // Meminta  code
        const code = await this.sock.requestPairingCode(phoneNumber);
        return code;
    }

    // Contoh fungsi untuk mengirim pesan
    async sendMessage(jid: string, text: string) {
        console.log("mengirim pesan");
        if (this.sock) {
            console.log("proses " + jid + "@s.whatsapp.net")
            await this.sock.sendMessage(jid + "@s.whatsapp.net", { text: text });
        }
        console.log("selesai")
    }
}