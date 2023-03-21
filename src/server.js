// Importi
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose();

// pieslēdzamies mūsu datubāzei
const database = new sqlite3.Database("./src/db/database.db");

// inicializējam express aplikāciju
const app = express()

// ļaujam piekļūt serverim no citiem domēniem
app.use(cors({
  origin: '*'
}))

// ļaujam no frontend sūtīt jsonu
app.use(bodyParser.json());

// palaižas vienreiz uz servera palaišanu
database.serialize(() => {

// Uztaisa tabulas, ja tās neeksistē
database.run(`
  CREATE TABLE IF NOT EXISTS japanu (
    id INTEGER PRIMARY KEY,
    kanji CHAR(255) NOT NULL,
    onyomi VARCHAR(255),
    kunyomi VARCHAR(255),
    latValTulk VARCHAR(255),
    checked BOOL
  );
`);
database.run(`
  CREATE TABLE IF NOT EXISTS anglu (
    id INTEGER PRIMARY KEY,
    word CHAR(255) NOT NULL,
    latValTulk VARCHAR(255),
    checked BOOL
  );
`);
  
// Ja nav nekādi japāņu vārdi, tos pievieno
database.get('SELECT * from japanu', (err, words) => {
  if (!words) {
    database.run(`
      INSERT INTO japanu (kanji, onyomi, kunyomi, latValTulk, checked)
      VALUES('U2FsdGVkX1/WATqBP94OVTkwdFPl+Z9cCV68S4NHtoE=','U2FsdGVkX18vcKAgmyhVhE9aPBItmosuUt4yBfUwI98lGati55sUpj3n1IM+wwqW','U2FsdGVkX1/4NPAysDnnTLjqcop6YlIJh+vTwPSzexY4clcioy08tn5Rlbwq2oh3','U2FsdGVkX1/pJKpWvOZxSQRuQTO85ALQ7srxBtXEoiPY8p/bqhuhn5UdnVDUUDiZ',1), 
      ('U2FsdGVkX18pFeGHAW4YGyYemsbk9QPSs9psjCuD2XY=','U2FsdGVkX18AjmhvEMtNrLlphSC9UFOHy4GnJMURdso=','U2FsdGVkX1/RZF6T+Z7CN7Fyc7huDESbv7oTcIGWBiY=','U2FsdGVkX1/BHXpp56kk1kwltGKYiNXkhKYZK3Jn84LvpnIB8eCIvhEBYCN4fiHv',1)`
    );
  }
})

// Ja nav nekādi angļu vārdi, tos pievieno
database.get('SELECT * from anglu', (err, words) => {
  if (!words) {
    database.run(`
      INSERT INTO anglu (word, latValTulk, checked)
      VALUES('U2FsdGVkX18znmXxfazRtjyrJfuFeYrqFA5oY8DDuUE=','U2FsdGVkX1+cnBUfeYGfYf6NIdptAzjhUWUK4ye5wz0I0kCOto+zRsXaSxcn1+eO',1), 
      ('U2FsdGVkX19hv3fHMDEtem0oA4QdWWniwVeXWYBQdCc=','U2FsdGVkX19Brk+C54WIStnOf+Ne46txjXN22wYuKEI=',1)`
    );
  }
})
});

// kontrolieris kurš atbild par to, kad tiks prasīts GET piepeasījums uz root, 
// jeb šajā gadījumā http://localhost:3004/
app.get('/', (req, res) => {
  database.all(`SELECT * FROM japanu`, (err, word) => {
    res.json({
      vardi: word
    })
  })
})

// Atgriež visus japāņu vārdus no datubāzes
app.get('/japanu', (req, res) => {
  database.all('SELECT * FROM japanu', (error, words) => {
    res.json(words)
  })
})

// Atgriež visus angļu vārdus no datubāzes
app.get('/anglu', (req, res) => {
  database.all('SELECT * FROM anglu', (error, words) => {
    res.json(words)
  })
})

// Pievieno vārdu japāņu vārdu datubāzei
app.post('/japanu', (req, res) => {
  database.run(`
  INSERT INTO japanu (kanji, onyomi, kunyomi, latValTulk, checked)
  VALUES("${req.body.kanji}",
  '${req.body.onyomi}',
  '${req.body.kunyomi}',
  '${req.body.latValTulk}',
  1);
  `, () => {
    res.json('Jauns vārds pievienots veiksmīgi')
  });
});

// Pievieno vārdu angļu vārdu datubāzei
app.post('/anglu', (req, res) => {
  database.run(`
  INSERT INTO anglu (word, latValTulk,checked)
  VALUES("${req.body.word}",
  '${req.body.latValTulk}',
  1);
  `, () => {
    res.json('Jauns vārds pievienots veiksmīgi')
  });
});

// Dzēš vārdu no angļu vārdu datubāzes
app.delete('/anglu/:id', (req, res) => {
  database.run(`DELETE FROM anglu WHERE id = ${req.params.id}`, () => {   
    res.json('Projekts dzests!')
  })
})

// Dzēš vārdu no japāņu vārdu datubāzes
app.delete('/japanu/:id', (req, res) => {
  database.run(`DELETE FROM japanu WHERE id = ${req.params.id}`, () => {   
    res.json('Projekts dzests!')
  })
})

// palaižam serveri ar 3004 portu
app.listen(3004, () => {
  console.log(`Example app listening on port 3004`)
})