require('dotenv').config()
const qrcode = require('qrcode-terminal');
const moment = require('moment-timezone');
const {Pool} = require('pg');
const pool = new Pool()
const axios = require('axios');
const xml2js = require('xml2js');

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
          if(result.rows[i].status === 'done'){
            send.push(`~${result.rows[i].task_id} - ${result.rows[i].deskripsi}~\n`)
          }else{
            send.push(`${result.rows[i].task_id} - ${result.rows[i].deskripsi}\n`)
          }
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
          if(result.rows[i].status === 'done'){
            send.push(`~${result.rows[i].task_id} - ${result.rows[i].deskripsi}~\n`)
          }else{
            send.push(`${result.rows[i].task_id} - ${result.rows[i].deskripsi}\n`)
          }
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
    }else if(message.body.split(' ')[0].toLowerCase() === '/done'){
      const sql = 'update task set status = $1, updated_by = $2 where task_id = $3 returning deskripsi';
      const values = ['done', message.from.split('@')[0], message.body.split(' ')[1]];
      const result = await pool.query(sql, values);
      message.reply(`${result.rows[0].deskripsi} telah *BERHASIL DI UPDATE*`)
    }else if(message.body.split(' ')[0].toLowerCase() === '/job'){
      const sql = 'update task set status = $1, updated_by = $2 where task_id = $3 returning deskripsi';
      const values = ['', message.from.split('@')[0], message.body.split(' ')[1]];
      const result = await pool.query(sql, values);
      message.reply(`${result.rows[0].deskripsi} telah *BERHASIL DI UPDATE*`)
    }else if(message.body.split(' ')[0].toLowerCase() === '/log'){
      const sql = 'select * from task where tim ilike $1 and created = $2';
      const values = [message.body.split(' ')[1], message.body.split(' ')[2]]
      const result = await pool.query(sql, values)
      if(!result.rows.length){
        message.reply('Sepertinya Tidak Ada Data Yang Ditemukan Deh Kak')
      }else{
        for (let i = 0; i < result.rows.length; i++) {
          send.push(`${result.rows[i].task_id} - ${result.rows[i].deskripsi} - ${result.rows[i].status === 'done' ? '*done*' : '*pending*'} - diubah oleh : ${result.rows[i].updated_by}\n`)
        }
        message.reply(send.join(''))
      }
    }else if(message.body.split(' ')[0].toLowerCase() === '/gempa'){
      moment.suppressDeprecationWarnings = true
      const result = await axios({
        url: 'https://bmkg-content-inatews.storage.googleapis.com/live30event.xml',
        method: 'GET'
      })
      const xml = result.data
      const parser = new xml2js.Parser();
      const dataTemp = await parser.parseStringPromise(xml)
      let msgBody = ''
      for(let i = 0; i < 7; i++){
        let waktuTemp = moment.utc(dataTemp.Infogempa.gempa[i].waktu[0].replaceAll("/", "-")).format('YYYY-MM-DD HH:mm:ss');
        msgBody += `Waktu : ${moment.utc(waktuTemp).local().format('YYYY-MM-DD HH:mm:ss')}\n`
        msgBody += `Lintang : ${dataTemp.Infogempa.gempa[i].lintang[0]}\n`
        msgBody += `Bujur : ${dataTemp.Infogempa.gempa[i].bujur[0]}\n`
        msgBody += `Kedalaman : ${dataTemp.Infogempa.gempa[i].dalam[0]}\n`
        msgBody += `Magnitudo : *${dataTemp.Infogempa.gempa[i].mag[0]}*\n`
        msgBody += `Area : *${dataTemp.Infogempa.gempa[i].area[0]}*\n`
        msgBody += `Link : https://www.google.com/maps/search/?api=1&query=${dataTemp.Infogempa.gempa[i].lintang[0]},${dataTemp.Infogempa.gempa[i].bujur[0]}\n`
        msgBody += "==========\n"
      }
      message.reply(msgBody)
    }else if(message.body.split(' ')[0].toLowerCase() === '/add'){
      const taskNow =  moment.tz('Asia/Makassar').format().split('T')[0]
      const sql = 'insert into task(tim, deskripsi, created) values($1, $2, $3) returning task_id;'
      const values = [message.body.split(' ')[1], message.body.split(' ')[2], taskNow]
      const result = await pool.query(sql, values)
      if(!result.rows.length){
        message.reply('Sepertinya Tidak Ada Data Yang Ditambahkan Deh Kak')
      }else{
        message.reply(`Berhasil Ditambahkan Dengan ID ${result.rows[0]}`)
      }
    }else{
      message.reply('Halo Kak, Ada Yang Bisa Nelin Bantu?\n\nBerikut Perintah Yang Nelin Mengerti:\n\n/task <nama tim> <tahun-bulan-tanggal>\ncontohnya: /task cctv 2023-12-31\n\n/now <nama_tim>\ncontohnya: /now cctv\n\n/all <tahun-bulan-tanggal>\ncontohnya: /all 2023-12-31\n\n/8vital\n\n/done <nomor_task>\ncontohnya: /done 99\n\n/job <nomor_task>\ncontohnya: /job 99\n\n/gempa\n\n/add <nama_tim> <deskripsi>\ncontohnya: /add cctv pm kamera')
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