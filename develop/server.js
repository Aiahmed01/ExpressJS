const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');


const app = express();
const PORT = process.env.PORT || 3002;


const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));



app.get('/api/notes', (req, res) =>
  readFileAsync('./db/db.json', 'utf-8').then((data) => {
    notes = [].concat(JSON.parse(data))
    res.json(notes)
  })
);

app.post('/api/notes', (req, res) => {
  const note = req.body;
  readFileAsync('./db/db.json', 'utf-8').then((data) => {
    notes = [].concat(JSON.parse(data))
    note.id = notes.length + 1
    notes.push(note)
    return notes
  }).then((notes) => {
    writeFileAsync('./db/db.json', JSON.stringify(notes))
    res.json(note)
  })
})
app.delete('/api/notes/:id', (req, res) => {
  const noteId = parseInt(req.params.id);

  readFileAsync('./db/db.json', 'utf-8')
    .then((data) => {
      const notes = JSON.parse(data);

      const index = notes.findIndex((note) => note.id === noteId);

      if (index !== -1) {
        notes.splice(index, 1);

        notes.forEach((note, i) => {
          note.id = i + 1;
        });

        return writeFileAsync('./db/db.json', JSON.stringify(notes))
          .then(() => {
            res.json({ message: 'Note deleted successfully' });
          })
          .catch((error) => {
            res.status(500).json({ error: 'Failed to delete note' });
          });
      } else {
        res.status(404).json({ error: 'Note not found' });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to delete note' });
    });
});



//--------------------------^^^

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'))
})
app.get('/notes', (req, res) => {

  res.sendFile(path.join(__dirname, './public/notes.html'))
})
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'))
})


app.listen(process.env.PORT || 3002 , () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);