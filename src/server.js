const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose();
// pieslēdzamies mūsu DB
const database = new sqlite3.Database("./src/db/database.db");
// inicializējam express appu
const app = express()
// ļaujam piekļūt serverim no citiem domēniem
app.use(cors({
  origin: '*'
}))
// ļaujam no FE sūtīt jsonu
app.use(bodyParser.json());


// uz servera palaišanu
database.serialize(() => {



// Uztaisa tabulas, ja tās neeksistē
database.run(`
  CREATE TABLE IF NOT EXISTS japanese (
    id INTEGER PRIMARY KEY,
    kanji CHAR(255) NOT NULL,
    onyomi VARCHAR(255),
    kunyomi VARCHAR(255),
    latValTulk VARCHAR(255),
    checked BOOL
  );
`);
database.run(`
  CREATE TABLE IF NOT EXISTS english (
    id INTEGER PRIMARY KEY,
    word CHAR(255) NOT NULL,
    latValTulk VARCHAR(255),
    checked BOOL
  );
`);

  
// Ja nav nekādi japāņu vārdi, tos pievieno
database.get('SELECT * from japanese', (err, words) => {
  if (!words) {
    database.run(`
      INSERT INTO japanese (kanji, onyomi, kunyomi, latValTulk, checked)
      VALUES('ka','hito','bito','cilvēks/ persona',1), ('la','hito','lito','cilvēks/ persona',1)`
    );
  }
})

// Ja nav nekādi angļu vārdi, tos pievieno
database.get('SELECT * from english', (err, words) => {
  if (!words) {
    database.run(`
      INSERT INTO english (word, latValTulk, checked)
      VALUES('person','cilvēks/ persona',1), ('kool','auksts/ vēss',1)`
    );
  }
})


});







// controlieris kurš atbild par to, kad tiks prasīts GET piepeasījums uz root, 
// jeb šajā gadījumā http://localhost:3004/







app.get('/', (req, res) => {
  // izvēlamies visus datus no japanese
  database.all(`SELECT * FROM japanese`, (err, word) => {
    res.json({
      vardi: word
    })
  })
})



// Atgriež visus japāņu vārdus no DB
app.get('/japanese', (req, res) => {
  database.all('SELECT * FROM japanese', (error, words) => {
    res.json(words)
  })
})

// Atgriež visus angļu vārdus no DB
app.get('/english', (req, res) => {
  database.all('SELECT * FROM english', (error, words) => {
    res.json(words)
  })
})





// Pievieno jaunu vārdu japāņu valodā
app.post('/japanese', (req, res) => {
  database.run(`
  INSERT INTO japanese (kanji, onyomi, kunyomi, latValTulk, checked)
  VALUES("${req.body.kanji}",
  '${req.body.kunyomi}',
  '${req.body.onyomi}',
  '${req.body.latValTulk}',
  1);
  `, () => {
    res.json('Jauns vārds pievienots veiksmīgi')
  });
});




app.post('/english', (req, res) => {

  database.run(`
  INSERT INTO english (word, latValTulk,checked)
  VALUES("${req.body.word}",
  '${req.body.latValTulk}',
  1);
  `, () => {
    res.json('Jauns vārds pievienots veiksmīgi')
  });
});




// app.delete('/english', (req, res) =>{

//   database.run(`
//   DELETE FROM english WHERE id=${req.body.id}
//   `, () => {
    
//     res.json(`Vārds izdzēsts veiksmīgi  ${req.body.id}` )
//   })
// })


app.delete('/english', (req, res, next) => {
  const id = req.body;
  console.log('1answer',req.body.id)
  console.log('2answer',res.body.id)
  database.run('DELETE FROM english WHERE id = ?', id, (err) => {
    if (err) {
      res.status(500).json({ message: 'An error occurred while deleting the word.' });
    } else {
      res.status(200).json({ message: 'Word deleted successfully.' });
    }
  });
});


// const handleDelete = (word) => {
//   console.log(word);
//   db.run(`DELETE FROM english WHERE word = ?`, word, (error) => {
//     if (error) {
//       console.error(error);
//       alert("An error occurred while deleting the word. Please try again later.");
//     } else {
//       alert("Word deleted successfully.");
//       fetchAllWords();
//     }
//   });
// };





app.delete('/japanese', (req, res) =>{
  console.log('1answer',req.body.id)
  console.log('2answer',res.body.id)
  database.run(`
  DELETE FROM english WHERE id=${req.body.id}
  `, () => {
    
    res.json(`Vārds izdzēsts veiksmīgi  ${req.body.id}` )
  })
})






// palaižam serveri ar 3004 portu
app.listen(3004, () => {
  console.log(`Example app listening on port 3004`)
})


// GET http://localhost:3004/autors

    // database.get atgriež tikai vienu pirmo atrasto rezutlātu
      // database.all atgriež visus atrastos rezultātus