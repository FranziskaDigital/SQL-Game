// Initialisierung der Datenbank
let db;

async function initDB() {
  const response = await fetch('db.sqlite');
  const arrayBuffer = await response.arrayBuffer();
  db = await new Promise((resolve, reject) => {
    const sqlite3 = window.SQL;
    const db = sqlite3.openDB(arrayBuffer, (err, db) => {
      if (err) reject(err);
      else resolve(db);
    });
  });

  // Initialisiere die Tabellen
  await runSQL(`
    CREATE TABLE IF NOT EXISTS Schatz (
      id INTEGER PRIMARY KEY,
      beschreibung TEXT
    );
    INSERT INTO Schatz (id, beschreibung) VALUES (1, 'Ein SQL-Abenteuer ist immer ein Erfolg!');
    
    CREATE TABLE IF NOT EXISTS Spieler (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      level INTEGER DEFAULT 1
    );
    INSERT INTO Spieler (name) VALUES ('Abenteurer');
    
    CREATE TABLE IF NOT EXISTS Rätsel (
      id INTEGER PRIMARY KEY,
      frage TEXT,
      antwort TEXT
    );
    INSERT INTO Rätsel (frage, antwort) VALUES ('Welcher Befehl zeigt alle Daten?', 'SELECT * FROM');
  `);
}

// Führe SQL-Befehl aus
async function sendSQL() {
  const input = document.getElementById('sqlInput').value.trim();
  const output = document.getElementById('output');
  const story = document.getElementById('story');

  if (!input) {
    output.textContent = "Bitte gib einen SQL-Befehl ein!";
    return;
  }

  try {
    const result = await runSQL(input);
    if (result && result.length > 0) {
      output.textContent = "✅ Ergebnis:\n" + JSON.stringify(result, null, 2);
    } else {
      output.textContent = "✅ Befehl erfolgreich ausgeführt.";
    }

    // Prüfe, ob der Schatz gefunden wurde
    const schatz = await runSQL("SELECT beschreibung FROM Schatz WHERE id = 1");
    if (schatz && schatz.length > 0) {
      story.textContent = "Du hast den Schatz gefunden! 🎉";
      document.getElementById('win').style.display = 'block';
    }

  } catch (err) {
    output.textContent = "❌ Fehler: " + err.message;
  }
}

// Wrapper für SQL-Ausführung
async function runSQL(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// Starte das Spiel
window.onload = async () => {
  await initDB();
  document.getElementById('story').textContent = "Du stehst vor einer alten Datenbank. Was willst du tun? Gib einen SQL-Befehl ein!";
};