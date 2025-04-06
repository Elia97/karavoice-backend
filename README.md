# 🎤 KaraVoice Backend API

Backend per la gestione di eventi karaoke e musicali, pensato per semplificare la creazione, gestione e prenotazione di eventi in locali pubblici.

---

## 🔧 Stack Tecnologico

| Componente     | Tecnologia             |
| -------------- | ---------------------- |
| Linguaggio     | JavaScript (ES2021)    |
| Runtime        | Node.js                |
| Framework      | Express.js             |
| ORM            | Sequelize              |
| Database       | PostgreSQL             |
| Autenticazione | JWT + bcrypt           |
| Validazione    | express-validator      |
| Logging        | morgan + custom logger |

---

## 🔐 Sicurezza & Ruoli

- JWT viene generato al login e decodificato nei middleware
- Ruoli:
  - `admin`: gestisce eventi, locazioni, utenti
  - `user`: prenota eventi e visualizza info personali

---

## 🚀 Setup locale

```bash
git clone https://github.com/Elia97/karavoice-backend.git
cd karavoice-backend
npm install
cp .env.example .env
# Imposta le variabili: DB, JWT_SECRET, ecc.
npm run dev
```

---

## 🗂️ Architettura del Progetto

KaraVoice è progettata seguendo una struttura modulare e scalabile, ispirata al pattern MVC (Model-View-Controller) esteso con l'aggiunta di livelli intermedi (middlewares, services, helpers) per una migliore separazione delle responsabilità. L'obiettivo è garantire leggibilità del codice, facilità di manutenzione e rapidità nell'estensione futura del progetto.

### 📁 Struttura delle cartelle

L’intero backend è organizzato in moduli tematici, con una netta separazione tra routing, controller, logica applicativa e accesso ai dati.

```bash
karavoice-backend/
│
├── config/             # Configurazioni generali (es. connessione DB, setup Sequelize, variabili d’ambiente)
├── controllers/        # Logica dei singoli endpoint HTTP per ogni risorsa REST
├── docs/               # Documentazione tecnica del progetto (Markdown, API specs, diagrammi, ecc.)
├── middlewares/        # Middleware personalizzati (es. autenticazione, validazione, gestione errori)
├── migrations/         # Script Sequelize CLI per la gestione delle migrazioni del database
├── models/             # Definizione dei modelli Sequelize e relazioni tra entità
├── routes/             # Definizione delle rotte Express organizzate per modulo
├── seeders/            # Script Sequelize CLI per il seeding iniziale dei dati nel database
├── services/           # Logica di business riutilizzabile, astratta dai controller
├── tests/              # Test automatici (unit test, integration test) organizzati per modulo
├── uploads/            # Directory temporanea per il salvataggio di file caricati (es. immagini utenti)
├── utils/              # Funzioni e classi di utilità generiche (es. logger, formatter, helpers vari)
└── index.js            # Entry point principale dell’app Express, avvia il server e carica le dipendenze
```

### 🧱 Componenti principali

- Router: definisce le rotte REST per ciascun modulo (`/api/users`, `/api/events`, ecc.).
- Controller: gestisce le richieste HTTP e risposte, orchestrando l’esecuzione tra middleware, servizi e modelli.
- Model: definisce la struttura dei dati, le relazioni e i metodi personalizzati usando Sequelize.
- Middleware: intercetta le richieste per gestire autorizzazioni, validazioni, errori.
- Service (opzionale): incapsula logiche di business complesse o condivise tra più controller.

---

## 🧱 Modelli Dati principali

### 🧍 Modello utente

| Campo             | Tipo     | Descrizione            |
| ----------------- | -------- | ---------------------- |
| `id`              | `UUID`   | Identificativo univoco |
| `name`            | `String` | Nome utente            |
| `email`           | `String` | Email univoca          |
| `password_hashed` | `String` | Password criptata      |
| `role`            | `String` | 'user' o 'admin'       |
| `last_login_at`   | `Date`   | Data ultimo accesso    |

#### Validazione utente

- `name`: non può essere vuoto
- `email`:
  - Formato valido (`isEmail`)
  - Non vuoto (`notEmpty`)
  - Unico (`unique`)
- `password_hashed`: non può essere vuoto
- `role`: deve essere `"user"` o `"admin"` (default: `"user"`)

#### Hook utente

- `beforeCreate`: hash della password prima della creazione dell'utente
- `beforeUpdate`: hash della password se modificata

#### Associazione utente

Il modello `User` è collegato al modello `Booking` attraverso una relazione uno-a-molti: ogni utente può infatti effettuare più prenotazioni per eventi musicali.

Questa relazione è definita con il metodo `hasMany`, dove l'utente funge da entità principale (`source`) e le prenotazioni da entità figlie (`target`). La chiave esterna utilizzata per collegare le due entità è `user_id`, presente nella tabella delle prenotazioni.

#### Metodi utente

- `isPasswordValid(password)` → verifica se una password fornita è corretta
- `updateLastLogin(userId)` → aggiorna il campo `last_login_at`
- `findByEmail(email)` → trova un utente tramite email
- `findByRole(role)` → restituisce tutti gli utenti con un determinato ruolo
- `findInactiveUsers(days)` → restituisce utenti che non effettuano login da $n$ giorni

#### Note utente

- **Autenticazione**: integrazione con JWT
- **Sicurezza**: hashing con `bcrypt`, validazioni forti
- **Soft delete**: attivo con `paranoid: true`
- **Timestamps**: attivi (`createdAt`, `updatedAt`, `deleteAt`)

### 🎤 Modello evento

| Campo         | Tipo     | Descrizione                                |
| ------------- | -------- | ------------------------------------------ |
| `id`          | `UUID`   | Identificativo univoco                     |
| `name`        | `String` | Titolo dell’evento                         |
| `description` | `Text`   | Descrizione dettagliata                    |
| `image`       | `String` | URL dell’immagine promozionale dell’evento |
| `location_id` | `UUID`   | Riferimento alla location associata        |
| `date`        | `Date`   | Giorno in cui si svolge l’evento           |
| `start_time`  | `Time`   | Orario di inizio (formato HH:MM)           |
| `end_time`    | `Time`   | Orario di fine (formato HH:MM)             |

#### Validazione evento

- `name`: obbligatorio, minimo 3 caratteri, massimo 255
- `description`: obbligatoria, non può essere vuota
- `category`: deve essere una tra "karaoke", "dj set" o "live music"
- `image`: deve essere un URL valido
- `location_id`: obbligatorio, deve puntare a una location esistente
- `date`: deve essere una data valida e futura
- `start_time / end_time`: formato obbligatorio HH:MM (regex validata)

#### Associazione evento

Il modello `Event` è legato a due entità fondamentali: le **location** e le **prenotazioni**.

Ogni evento è associato a una `Location` tramite una relazione molti-a-uno (`belongsTo`). Questo consente di sapere dove si svolge ciascun evento e recuperare in modo efficiente le informazioni relative al locale.

Inoltre, un evento può avere molteplici `Booking`, ovvero prenotazioni da parte degli utenti. La relazione è di tipo uno-a-molti (`hasMany`) e consente di elencare tutte le partecipazioni confermate a un dato evento.

Queste relazioni permettono di ricostruire facilmente il contesto completo dell’evento (quando, dove, chi partecipa).

#### Metodi evento

- `findUpcomingEvents()` → Restituisce tutti gli eventi futuri ordinati per data crescente. Include anche i dati della location associata
- `findByLocation(locationId)` → Restituisce tutti gli eventi collegati a una determinata location

#### Note evento

- **Indicizzazione intelligente** su `name + date` per velocizzare le ricerche per nome e data.
- **Collegamenti ottimizzati** su `location_id` per join efficienti.
- **Soft delete** attivo (`paranoid: true`) per non perdere eventi eliminati ma recuperarli all’occorrenza.
- **Timestamp automatici** (`createdAt`, `updatedAt`, `deletedAt`) per tracciare ogni modifica.

### 📍 Modello locazione

| Campo       | Tipo      | Descrizione                                    |
| ----------- | --------- | ---------------------------------------------- |
| `id`        | `UUID`    | Identificativo univoco                         |
| `name`      | `String`  | Nome del locale                                |
| `address`   | `String`  | Indirizzo completo                             |
| `city`      | `String`  | Città in cui si trova il locale                |
| `province`  | `String`  | Provincia (opzionale)                          |
| `zip_code`  | `String`  | Codice di avviamento postale                   |
| `country`   | `String`  | Paese (default: "Italia")                      |
| `latitude`  | `Decimal` | Coordinata geografica nord-sud della location  |
| `longitude` | `Decimal` | Coordinata geografica est-ovest della location |

#### Validazione locazione

- `name`, `address`, `city`, `zip_code`, `country`, `latitude`, `longitude` sono tutti obbligatori
- `zip_code`: deve contenere solo numeri e avere una lunghezza compresa tra 4 e 10 caratteri
- `latitude / longitude`: devono essere valori decimali validi
- `country`: viene impostato automaticamente a "Italia" se non specificato

#### Associazione locazione

Il modello `Location` è il punto di riferimento geografico per tutti gli eventi musicali ospitati all’interno della piattaforma.

Attraverso una relazione uno-a-molti (`hasMany`), ogni location può ospitare più `Event`. Questa relazione è fondamentale per costruire viste aggregate come "Eventi in una città" o "Eventi in una location specifica".

#### Metodi locazione

- `isDuplicateAddress(address)` → Controlla se un indirizzo è già stato registrato nel sistema. Utile per prevenire duplicati durante la creazione o la sincronizzazione di location esterne
- `findClosest(latitude, longitude)` → Restituisce la location più vicina a una coppia di coordinate. Perfetta per esperienze geolocalizzate o suggerimenti basati sulla posizione dell’utente
- `findByCity(city)` → Recupera tutte le location presenti in una determinata città. Utile per filtri geografici lato utente o backend
- `findNearby(latitude, longitude, radius)` → Ritorna tutte le location all'interno di un certo raggio (in km) rispetto a una posizione geografica. Ideale per trovare locali "vicino a me" su mappe o app mobile

#### Note locazione

- **Indicizzazione geografica avanzata** su `city`, `province`, `zip_code`, oltre che su `latitude` / `longitude`, per supportare filtri veloci e ricerche geospaziali.
- **Soft delete** attivo (`paranoid: true`) per non eliminare definitivamente i dati e consentire recuperi.
- **Timestamps automatici** (`createdAt`, `updatedAt`, `deletedAt`) attivi.

### 📅 Modello prenotazione

| Campo          | Tipo      | Descrizione                                                                            |
| -------------- | --------- | -------------------------------------------------------------------------------------- |
| `id`           | `UUID`    | Identificativo univoco                                                                 |
| `user_id`      | `UUID`    | Identificativo dell'utente che ha effettuato la prenotazione                           |
| `event_id`     | `UUID`    | Identificativo dell'evento per cui è stata effettuata la prenotazione                  |
| `status`       | `String`  | Stato della prenotazione: può essere pending, confirmed, o canceled (default: pending) |
| `participants` | `Integer` | Numero di partecipanti per l'evento (default: 1)                                       |
| `notes`        | `Text`    | Note aggiuntive della prenotazione (facoltative)                                       |

#### Validazione prenotazione

- `user_id` e `event_id`: obbligatori e devono essere riferimenti validi ad un utente e ad un evento esistenti nel sistema
- `status`: deve essere uno dei seguenti valori: `pending`, `confirmed`, `canceled`
- `participants`: deve essere un valore numerico maggiore o uguale a 1
- `notes`: opzionale, può contenere note aggiuntive

#### Associazione prenotazione

Il modello `Booking` ha due relazioni molti-a-uno:

- Relazione con `User`: Ogni prenotazione è associata a un singolo utente, attraverso la chiave esterna `user_id`. Con il metodo `belongsTo`, è possibile accedere all'utente che ha effettuato la prenotazione.
- Relazione con `Event`: Ogni prenotazione è associata a un singolo evento, attraverso la chiave esterna `event_id`. Con il metodo `belongsTo`, è possibile accedere all'evento per cui è stata fatta la prenotazione.

Con queste relazioni, è possibile ottenere informazioni sia sugli utenti che sugli eventi associati a ciascuna prenotazione.

#### Metodi prenotazione

- `findByUser(userId)` → Restituisce tutte le prenotazioni effettuate da un determinato utente. Include informazioni sull'evento e sulla location in cui si svolge l'evento
- `findByEvent(eventId)` → Restituisce tutte le prenotazioni per un determinato evento. Include informazioni sull'utente che ha effettuato la prenotazione
- `updateStatus(bookingId, status)` → Aggiorna lo stato di una prenotazione. Accetta come parametri l'ID della prenotazione e il nuovo stato desiderato (`pending`, `confirmed`, `canceled`).
  Se lo stato non è valido o la prenotazione non esiste, l'operazione fallirà con un messaggio di errore

#### Note prenotazione

- **Indicizzazione**: È presente un indice univoco su `user_id` e `event_id`, impedendo la duplicazione delle prenotazioni per lo stesso utente su uno stesso evento.
- **Soft delete** attivo (`paranoid: true`) per non eliminare definitivamente i dati.
- **Timestamps automatici** per tracciare la creazione e l'aggiornamento delle prenotazioni.

---

## 📡 API Endpoints

### 🔐 Rotte autenticazione

| Metodo | Endpoint                | Descrizione                                    |
| ------ | ----------------------- | ---------------------------------------------- |
| POST   | `/auth/register`        | Registra nuovo utente                          |
| POST   | `/auth/login`           | Login con email/password, ritorna un token JWT |
| POST   | `/auth/change-password` | Cambia la password dell'utente                 |
| POST   | `/auth/restore-user`    | Ripristina un utente                           |

> Il JWT va incluso nei request header:  
> `Authorization: Bearer <token>`

#### POST `/auth/register`

```json
{
  "name": "Mario Rossi",
  "email": "mario@example.com",
  "password": "password",
  "role": "admin" // opzionale, default: "user"
}
```

- `201 Created` → Utente creato con successo
- `409 Conflict` → Email già registrata
- `500 Internal Server Error` → Errore generico

#### POST `/auth/login`

```json
{
  "email": "mario@example.com",
  "password": "password"
}
```

- `200 Ok` → Token restituito
- `401 Unauthorized` → Credenziali non valide
- `500 Internal Server Error` → Errore generico

#### POST `/auth/change-password`

```json
{
  "email": "mario@example.com",
  "oldPassword": "password",
  "newPassword": "newpassword"
}
```

- `200 Ok` → Password aggiornata
- `401 Unauthorized` → Password vecchia errata
- `404 Not Found` → Utente non trovato
- `500 Internal Server Error` → Errore generico

#### POST `/auth/restore-user`

```json
{
  "email": "mario@example.com"
}
```

- `200 Ok` → Utente ripristinato
- `404 Not Found` → Utente non trovato o non eliminato
- `500 Internal Server Error` → Errore generico

---

### 👥 Rotte utenti

| Metodo | Endpoint                    | Descrizione                                  | Autenticazione |
| ------ | --------------------------- | -------------------------------------------- | -------------- |
| GET    | `/api/users`                | Lista tutti gli utenti                       | Admin          |
| GET    | `/api/users/:id`            | Recupera un utente tramite ID                | Admin o Owner  |
| GET    | `/api/users/email/:email`   | Recupera un utente tramite email             | Admin          |
| GET    | `/api/users/role/:role`     | Recupera tutti gli utenti con un certo ruolo | Admin          |
| GET    | `/api/users/inactive/:days` | Recupera utenti inattivi da $n$ giorni       | Admin          |
| PUT    | `/api/users/:id`            | Aggiorna i dati di un utente                 | Admin o Owner  |
| PUT    | `/api/users/last-login/:id` | Aggiorna l’ultimo login                      | Admin o Owner  |
| DELETE | `/api/users/:id`            | Elimina un utente                            | Admin o Owner  |

> Tutte le rotte richiedono autenticazione tramite JWT.
> Le rotte marcate come "Admin o Owner" consentono l'accesso anche all'utente stesso.

#### GET `/api/users`

- `200 Ok` → Lista utenti
- `500 Internal Server Error` → Errore di recupero

#### GET `/api/users/:id`

- `200 Ok` → Utente trovato
- `404 Not Found` → Nessun utente con quell'id
- `500 Internal Server Error` → Errore generico

#### GET `/api/users/email/:email`

- `200 Ok` → Utente trovato
- `404 Not Found` → Nessun utente con quell'email
- `500 Internal Server Error` → Errore generico

#### GET `/api/users/role/:role`

- `200 Ok` → Lista utenti filtrati per ruolo
- `500 Internal Server Error` → Errore generico

#### GET `/api/users/inactive/:days`

- `200 Ok` → Lista utenti inattivi
- `500 Internal Server Error` → Errore generico

#### PUT `/api/users/:id`

```json
{
  "name": "Nuovo nome",
  "email": "nuova.email@example.com"
}
```

- `200 Ok` → Utente aggiornato
- `404 Not Found` → Nessun utente con quell'id
- `500 Internal Server Error` → Errore generico

#### PUT `/api/users/last-login/:id`

- `200 Ok` → Login aggiornato
- `500 Internal Server Error` → Errore generico

#### DELETE `/api/users/:id`

- `204 No Content` → Utente eliminato
- `404 Not Found` → Nessun utente con quell'id
- `500 Internal Server Error` → Errore generico

---

### 🎤 Rotte eventi

| Metodo | Endpoint               | Descrizione                         | Autenticazione |
| ------ | ---------------------- | ----------------------------------- | -------------- |
| GET    | `/api/events/upcoming` | Elenco eventi futuri (pubblico)     | No             |
| GET    | `/api/events/:id`      | Recupera un evento specifico per ID | Sì             |
| GET    | `/api/events`          | Elenco completo degli eventi        | Admin          |
| POST   | `/api/events`          | Crea un nuovo evento                | Admin          |
| PUT    | `/api/events/:id`      | Modifica un evento esistente        | Admin          |
| DELETE | `/api/events/:id`      | Elimina un evento                   | Admin          |

> Le rotte protette richiedono autenticazione JWT.
> Le operazioni CRUD sono riservate agli amministratori

#### GET `/api/events/upcoming`

- `200 Ok` → Lista eventi futuri
- `500 Internal Server Error` → Errore generico

#### GET `/api/events/:id`

- `200 Ok` → Evento trovato
- `404 Not Found` → Nessun evento trovato
- `500 Internal Server Error` → Errore generico

#### GET `/api/events`

- `200 Ok` → Lista completa eventi
- `500 Internal Server Error` → Errore generico

#### POST `/api/events`

```json
{
  "name": "nome evento",
  "description": "descrizione",
  "category": "karaoke / dj set / live music",
  "image": "URL",
  "location_id": "UUID",
  "start-time": "HH:MM",
  "end-time": "HH:MM",
  "date": "2025-06-15T20:00:00Z"
}
```

- `201 Created` → Eventi creato con successo
- `500 Internal Server Error` → Errore generico

#### PUT `/api/events/:id`

```json
{
  "name": "nome nuovo",
  "date": "2025-06-20T20:00:00Z"
}
```

- `200 Ok` → Evento aggiornato
- `404 Not Found` → Evento non trovato
- `500 Internal Server Error` → Errore generico

#### DELETE `/api/events/:id`

- `200 Ok` → Evento eliminato
- `404 Not Found` → Evento non trovato
- `500 Internal Server Error` → Errore generico

---

### 📍 Rotte locazioni

| Metodo | Endpoint                       | Descrizione                                                 | Autenticazione |
| ------ | ------------------------------ | ----------------------------------------------------------- | -------------- |
| GET    | `/api/locations`               | Elenco completo delle locazioni                             | Admin          |
| GET    | `/api/locations/:id`           | Dettaglio di una locazione per ID                           | Admin          |
| GET    | `/api/locations/by-city/:city` | Tutte le locazioni nella città specificata                  | Sì             |
| GET    | `/api/locations/closest`       | Locazione più vicina a una coppia di coordinate (geolocal.) | No             |
| GET    | `/api/locations/nearby`        | Locazioni entro un certo raggio da coordinate date          | No             |
| POST   | `/api/locations`               | Crea nuova location                                         | Admin          |
| PUT    | `/api/locations/:id`           | Modifica location                                           | Admin          |
| DELETE | `/api/locations/:id`           | Elimina location                                            | Admin          |

> Le coordinate devono essere passate come quey params (latitude, longitude, radius)

#### GET `/api/locations`

- `200 Ok` → Lista completa locazioni
- `500 Internal Server Error` → Errore generico

#### GET `/api/locations/:id`

- `200 Ok` → Locazione trovata
- `404 Not Found` → Locazione non trovata
- `500 Internal Server Error` → Errore generico

#### GET `/api/locations/by-city/:city`

- `200 Ok` → Lista locazioni per città
- `500 Internal Server Error` → Errore generico

#### GET `/api/locations/closest?latitude=X&longitude=Y`

- `200 Ok` → Locazione più vicina
- `404 Not Found` → Nessuna locazione trovata
- `500 Internal Server Error` → Errore generico

#### GET `/api/locations/closest?latitude=X&longitude=Y&radius=Z`

- `200 Ok` → Lista locazioni vicine
- `404 Not Found` → Nessuna locazione trovata
- `500 Internal Server Error` → Errore generico

#### POST `/api/locations`

```json
{
  "name": "Locale",
  "address": "Via Roma, 10",
  "city": "Milano",
  "province": "MI",
  "zip-code": 20019,
  "country": "Italia", // default: Italia
  "latitude": 45.4654219,
  "longitude": 9.1859243
}
```

- `201 Created` → Locazione creata
- `400 Not Found` → Indirizzo duplicato
- `500 Internal Server Error` → Errore generico

#### PUT `/api/locations/:id`

```json
{
  "address": "Via Milano, 20",
  "city": "Roma",
  "latitude": 41.9,
  "longitude": 12.483333
}
```

- `200 Ok` → Locazione aggiornata
- `404 Not Found` → Locazione non trovata
- `500 Internal Server Error` → Errore generico

#### DELETE `/api/locations/:id`

- `204 No Content` → Locazione eliminata
- `404 Not Found` → Locazione non trovata
- `500 Internal Server Error` → Errore generico

---

### 📅 Rotte prenotazioni

| Metodo | Endpoint                       | Descrizione                                 | Autenticazione |
| ------ | ------------------------------ | ------------------------------------------- | -------------- |
| GET    | `/api/bookings`                | Recupera tutte le prenotazioni              | Admin          |
| GET    | `/api/bookings/user`           | Lista prenotazioni dell’utente              | Admin o Owner  |
| GET    | `/api/bookings/event/:eventId` | Prenotazioni relative a un evento specifico | Admin          |
| GET    | `/api/bookings/:id`            | Recupera una prenotazione tramite ID        | Admin o Owner  |
| POST   | `/api/bookings`                | Crea una nuova prenotazione                 | Admin o Owner  |
| PUT    | `/api/bookings/:id/status`     | Aggiorna lo stato di una prenotazione       | Admin o Owner  |
| DELETE | `/api/bookings/:id`            | Elimina una prenotazione                    | Admin o Owner  |

> Le prenotazioni possono includere note opzionali, numero di partecipanti, e uno stato personalizzabile (pending, confirmed, cancelled)

#### GET `/api/bookings`

- `200 Ok` → Lista completa prenotazioni
- `500 Internal Server Error` → Errore generico

#### GET `/api/bookings/user`

- `200 Ok` → Lista prenotazioni dell'utente
- `404 Not Found` → Nessuna prenotazioni trovata
- `500 Internal Server Error` → Errore generico

#### GET `/api/bookings/event/:eventId`

- `200 Ok` → Lista prenotazioni per evento
- `404 Not Found` → Nessuna prenotazioni trovata
- `500 Internal Server Error` → Errore generico

#### GET `/api/bookings/:id`

- `200 Ok` → Prenotazione trovata
- `404 Not Found` → Prenotazione non trovata
- `500 Internal Server Error` → Errore generico

#### POST `/api/bookings`

```json
{
  "user_id": "UUID",
  "event_id": "UUID",
  "status": "pending | confirmed | cancelled", // default: pending
  "participants": 3,
  "notes": "Note aggiuntive"
}
```

- `201 Created` → Prenotazione creata
- `500 Internal Server Error` → Errore generico

#### PUT `/api/bookings/:id/status`

```json
{
  "status": "confirmed"
}
```

- `200 Ok` → Stato aggiornato
- `404 Not Found` → Prenotazione non trovata
- `500 Internal Server Error` → Errore generico

#### DELETE `/api/bookings/:id`

- `204 No Content` → Prenotazione eliminata
- `404 Not Found` → Prenotazione non trovata
- `500 Internal Server Error` → Errore generico
