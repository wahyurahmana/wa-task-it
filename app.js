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
    if(message.body.split(' ')[0] === '/task'){
      const sql = 'select * from task where tim = $1 and created = $2';
      const values = [message.body.split(' ')[1], message.body.split(' ')[2]]
      const result = await pool.query(sql, values)
      for (let i = 0; i < result.rows.length; i++) {
        send.push(`- ${result.rows[i].deskripsi}\n`)
      }
      if(send.length === 0){
        message.reply('Sepertinya Tidak Ada Data Yang Ditemukan Deh Kak')
      }else{
        message.reply(send.join(''))
      }
    }else if(message.body.split(' ')[0] === '/now'){
      const taskNow =  moment.tz('Asia/Makassar').format().split('T')[0]
      const sql = 'select * from task where tim = $1 and created = $2';
      const values = [message.body.split(' ')[1], taskNow]
      const result = await pool.query(sql, values)
      for (let i = 0; i < result.rows.length; i++) {
        send.push(`- ${result.rows[i].deskripsi}\n`)
      }
      if(send.length === 0){
        message.reply('Sepertinya Tidak Ada Data Yang Ditemukan Deh Kak')
      }else{
        message.reply(send.join(''))
      }
    }else{
      message.reply('Halo Kak, Ada Yang Bisa Nelin Bantu?\n\nBerikut Perintah Yang Nelin Mengerti:\n\n/task <nama tim> <tahun-bulan-tanggal>\ncontohnya /task cctv 2023-12-31\n\n/now <nama_tim>\ncontohnya /now cctv')
    }
  } catch (error) {
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