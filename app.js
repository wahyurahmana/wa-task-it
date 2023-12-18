require('dotenv').config()
const qrcode = require('qrcode-terminal');
const moment = require('moment-timezone');
const {Pool} = require('pg');
const pool = new Pool()

const { Client, LocalAuth } = require('whatsapp-web.js');
const client = new Client({
	authStrategy: new LocalAuth()
});

client.on('qr', qr => {
  qrcode.generate(qr, {small: true});
});

client.on('message', async (message) =>{
  try {
    const send = [];
    if(message.body.split(' ')[0].toLowerCase() === '/task'){
      const sql = 'select * from task where tim ilike $1 and created = $2';
      const values = [message.body.split(' ')[1], message.body.split(' ')[2]]
      const result = await pool.query(sql, values)
      if(!result.rows.length){
        message.reply('Sepertinya Tidak Ada Data Yang Ditemukan Deh Kak')
      }else{
        for (let i = 0; i < result.rows.length; i++) {
          send.push(`- ${result.rows[i].deskripsi}\n`)
        }
        message.reply(send.join(''))
      }
    }else if(message.body.split(' ')[0].toLowerCase() === '/now'){
      const taskNow =  moment.tz('Asia/Makassar').format().split('T')[0]
      const sql = 'select * from task where tim ilike $1 and created = $2';
      const values = [message.body.split(' ')[1], taskNow]
      const result = await pool.query(sql, values)
      if(!result.rows.length){
        message.reply('Sepertinya Tidak Ada Data Yang Ditemukan Deh Kak')
      }else{
        for (let i = 0; i < result.rows.length; i++) {
          send.push(`- ${result.rows[i].deskripsi}\n`)
        }
        message.reply(send.join(''))
      }
    }else if(message.body.split(' ')[0].toLowerCase() === '/all'){
      const sql = 'select * from task where created = $1 order by task_id';
      const values = [message.body.split(' ')[1]]
      const result = await pool.query(sql, values)
      if(!result.rows.length){
        message.reply('Sepertinya Tidak Ada Data Yang Ditemukan Deh Kak')
      }else{
        for (let i = 0; i < result.rows.length; i++) {
          send.push(`*${result.rows[i].tim}* - ${result.rows[i].deskripsi}\n`)
        }
        message.reply(send.join(''))
      }
    }else if(message.body.split(' ')[0].toLowerCase() === '/8vital'){
      message.reply('1. *JANGAN PERNAH* mengoperasikan peralatan apapun kecuali telah dilatih, kompeten, dan mendapat izin mengoperasikannya.\n\n2. *JANGAN PERNAH* melepas, memotong, atau memodifikasi alat pelindung keselamatan tanpa izin.\n\n3. *JANGAN PERNAH* bekerja pada peralatan tanpa dilengkapi dengan prosedur isolasi.\n\n4. *JANGAN PERNAH* menggunakan alat angkat diluar kriteria desain yang telah ditentukan atau memosisikan diri di bawah muatan yang menggantung.\n\n5. *JANGAN PERNAH* bekerja di ketinggian tanpa mengenakan alat pelindung bahaya terjatuh.\n\n6. *JANGAN PERNAH* memasuki ruang terbatas atau area terlarang tanpa izin.\n\n7. *JANGAN PERNAH* menggunakan telepon genggam saat mengoperasikan kendaraan atau perlatan bergerak.\n\n8. *JANGAN PERNAH* mengoperasikan atau duduk sebagai penumpang pada kendaraan atau peralatan bergerak tanpa menggunakan sabuk pengaman.')
    }else{
      message.reply('Halo Kak, Ada Yang Bisa Nelin Bantu?\n\nBerikut Perintah Yang Nelin Mengerti:\n\n/task <nama tim> <tahun-bulan-tanggal>\ncontohnya: /task cctv 2023-12-31\n\n/now <nama_tim>\ncontohnya: /now cctv\n\n/all <tahun-bulan-tanggal>\ncontohnya: /all 2023-12-31\n\n/8vital')
    }
  } catch (error) {
    console.error(error);
    message.reply('Duh Nelin Error, Segera Lapor ke wa.me/+6282236464656 ya kak')
  }
})

client.on('ready', () => {
  console.log('Client is ready!');
});

client.on('disconnected', (message) => {
  message.reply('Duh Nelin Error, Segera Lapor ke wa.me/+6282236464656 ya kak')
})

client.initialize();