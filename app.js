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
    }else{
      message.reply('Halo Kak, Ada Yang Bisa Nelin Bantu?\n\nBerikut Perintah Yang Nelin Mengerti:\n\n/task <nama tim> <tahun-bulan-tanggal>\ncontohnya: /task cctv 2023-12-31\n\n/now <nama_tim>\ncontohnya: /now cctv\n\n/all <tahun-bulan-tanggal>\ncontohnya: /all 2023-12-31')
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