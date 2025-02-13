require('dotenv').config()
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const moment = require('moment-timezone');
const {Pool} = require('pg');
const pool = new Pool()

const client = new Client({
	authStrategy: new LocalAuth({
    clientId: 'WA_TASK_IT'
  }),
  puppeteer: {
    headless: true,
    args : ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions']
  },
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
  },
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('message', async message => {
	try {
    const teamIT = ['tsi', 'aims', 'telkom', 'itfm', 'ruswin', 'wireless', 'indosat', 'lan/wan', 'telkomsel', 'voice', 'xl', 'satnet', 'mii']
    const send = [];
    if(message.body.split(' ')[0].toLowerCase() === '/task'){
      const sql = 'select * from task where tim ilike $1 and created = $2';
      const values = [message.body.split(' ')[1], message.body.split(' ')[2]]
      const result = await pool.query(sql, values)
      if(!result.rows.length){
        const pesan = ['Mau Cari Apa?', 'Belum DiUpload Datanya!', 'Coba Tanya Sama Yang Presenter, Sudah Dikirim Belum?', 'Belum Ada!', 'Lihat Command Yang Benar!','Ketik Yang Benar!']
        const balas = Math.floor(Math.random() * pesan.length)
        message.reply(pesan[balas])
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
        const pesan = ['Mau Cari Apa?', 'Belum DiUpload Datanya!', 'Coba Tanya Sama Yang Presenter, Sudah Dikirim Belum?', 'Belum Ada!', 'Lihat Command Yang Benar!','Ketik Yang Benar!']
        const balas = Math.floor(Math.random() * pesan.length)
        message.reply(pesan[balas])
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
        const pesan = ['Mau Cari Apa?', 'Belum DiUpload Datanya!', 'Coba Tanya Sama Yang Presenter, Sudah Dikirim Belum?', 'Belum Ada!', 'Lihat Command Yang Benar!','Ketik Yang Benar!']
        const balas = Math.floor(Math.random() * pesan.length)
        message.reply(pesan[balas])
      }else{
        for (let i = 0; i < result.rows.length; i++) {
          send.push(`*${result.rows[i].tim}* - ${result.rows[i].deskripsi}\n`)
        }
        message.reply(send.join(''))
      }
    }else if(message.body.split(' ')[0].toLowerCase() === '/8vital'){
      message.reply('1. *JANGAN PERNAH* mengoperasikan peralatan apapun kecuali telah dilatih, kompeten, dan mendapat izin mengoperasikannya.\n\n2. *JANGAN PERNAH* melepas, memotong, atau memodifikasi alat pelindung keselamatan tanpa izin.\n\n3. *JANGAN PERNAH* bekerja pada peralatan tanpa dilengkapi dengan prosedur isolasi.\n\n4. *JANGAN PERNAH* menggunakan alat angkat diluar kriteria desain yang telah ditentukan atau memosisikan diri di bawah muatan yang menggantung.\n\n5. *JANGAN PERNAH* bekerja di ketinggian tanpa mengenakan alat pelindung bahaya terjatuh.\n\n6. *JANGAN PERNAH* memasuki ruang terbatas atau area terlarang tanpa izin.\n\n7. *JANGAN PERNAH* menggunakan telepon genggam saat mengoperasikan kendaraan atau perlatan bergerak.\n\n8. *JANGAN PERNAH* mengoperasikan atau duduk sebagai penumpang pada kendaraan atau peralatan bergerak tanpa menggunakan sabuk pengaman.')
    }else if(message.body.split(' ')[0].toLowerCase() === '/done'){
      const taskId = message.body.split(' ')[1].split(',')
      for(let i = 0; i < taskId.length; i++){
        if(!isNaN(taskId[i])){
          const sql = 'update task set status = $1, updated_by = $2 where task_id = $3 returning deskripsi';
          const values = ['done', message.from.split('@')[0], taskId[i]];
          const result = await pool.query(sql, values);
          message.reply(`${result.rows[0].deskripsi} telah *BERHASIL DI UPDATE*`)
        }else{
          message.reply(`Mau Cari Apa? Ketik Yang Benar!`)
        }
      }
    }else if(message.body.split(' ')[0].toLowerCase() === '/job'){
      const taskId = message.body.split(' ')[1].split(',')
      for(let i = 0; i < taskId.length; i++){
        if(!isNaN(taskId[i])){
          const sql = 'update task set status = $1, updated_by = $2 where task_id = $3 returning deskripsi';
          const values = ['', message.from.split('@')[0], taskId[i]];
          const result = await pool.query(sql, values);
          message.reply(`${result.rows[0].deskripsi} telah *BERHASIL DI UPDATE*`)
        }else{
          message.reply(`Mau Cari Apa? Ketik Yang Benar!`)
        }
      }
      
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
    }else if(message.body.split(' ')[0].toLowerCase() === '/add'){
      //validasi nama tim harus benar
      if(!teamIT.includes(message.body.split(' ')[1].toLocaleLowerCase())){
        message.reply('Lihat Baik-Baik, Nama TIM nya Ada Gk?')
      }else{
        //proses membuat created today
        const taskNow =  moment.tz('Asia/Makassar').format().split('T')[0]
        //proses membuat temporary deksripsi
        const temp = message.body.split(' ');
        temp.splice(0,2);
        const sql = 'insert into task(tim, deskripsi, created) values($1, $2, $3) returning task_id;'
        const values = [message.body.split(' ')[1], temp.join(' '), taskNow]
        const result = await pool.query(sql, values)
        if(!result.rows.length){
          message.reply('Mau Tambah Apa? Coba Yang Benar Ketiknya!')
        }else{
          message.reply(`Sudah Masuk Tasknya Bro Dengan ID *${result.rows[0].task_id}*`)
          message.reply('Langsung Donekan Aja Kalau Sudah Selesai!')
        }
      }
    }else if(message.body.split(' ')[0].toLowerCase() === '/update'){
      //pengambilan data sebelum dirubah
      const sqlGet = 'select * from task where task_id = $1;'
      const valuesGet = [message.body.split(' ')[1]]
      const resultGet = await pool.query(sqlGet, valuesGet)
      //proses membuat temporary deksripsi
      const temp = message.body.split(' ');
      temp.splice(0,2);
      const sql = 'update task set deskripsi = $1, updated_by = $2 where task_id = $3 returning task_id;'
      const values = [temp.join(' '),message.from.split('@')[0], message.body.split(' ')[1]]
      const result = await pool.query(sql, values)
      if(!result.rows.length){
        message.reply('Mau Update Apa? Coba Yang Benar Ketiknya!')
      }else{
        message.reply(`Ingat Yang Sebelumnya Ini *${resultGet.rows[0].deskripsi}*, Jangan Asal Update Aja! Kerja Yang Benar!`)
      }
    }else{
      message.reply('Halo Kak, Ada Yang Bisa Nelin Bantu?\n\nBerikut Perintah Yang Nelin Mengerti:\n\n/task <nama tim> <tahun-bulan-tanggal>\ncontohnya: /task cctv 2023-12-31\n\n/now <nama_tim>\ncontohnya: /now cctv\n\n/all <tahun-bulan-tanggal>\ncontohnya: /all 2023-12-31\n\n/done <nomor_task>\ncontohnya: /done 99\n\n/job <nomor_task>\ncontohnya: /job 99\n\n/log <nama tim> <tahun-bulan-tanggal>\ncontohnya: /log cctv 2023-12-31\n\n/gempa\n\n/add <nama_tim> <deskripsi>\ncontohnya: /add cctv pm kamera\n\n/update <nomor_task> <deskripsi>\ncontohnya: /update 123 penarikan kabel 100-999 m')
    }
  } catch (error) {
    console.error(error);
    message.reply('Ketik Yang Benar! Mau Cari Apa?')
  }
});


client.initialize();
