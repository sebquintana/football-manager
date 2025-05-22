# ⚽ Football Manager API

Una API simple para crear, gestionar y balancear partidos de fútbol amateur entre amigos.  
Implementada en **TypeScript**, con **NestJS**, arquitectura **hexagonal** y persistencia en **archivos locales versionables**.

---

## 🚀 Funcionalidades

- ✅ Crear jugadores
- ✅ Ver lista de jugadores con sus estadísticas y ELO
- ✅ Registrar partidos jugados y actualizar ELO
- ✅ Generar combinaciones de equipos balanceados automáticamente
- ✅ Persistencia en archivos `.json`
- ✅ Backups automáticos y restauración manual

---

## 📦 Comandos disponibles

### 🔄 Backup

Guarda una copia con timestamp de los archivos `player`, `match` y `team`.

```bash
npm run backup
```

Ejemplo de archivos generados:
backups/player-db_2025-05-21T22-13-00-000Z.json
backups/match-db_2025-05-21T22-13-00-000Z.json

### ♻️ Restaurar backup
Reemplaza los archivos actuales por uno de los backups guardados.
Solo pasá el timestamp (sin .json).

```bash
npm run restore 2025-05-21T22-13-00-000Z
```
Esto restaura los tres archivos:

- player-db.json
- match-db.json
- team-db.json

### 📂 Estructura de datos

#### Jugadores (player-db.json)
Cada jugador contiene:

id, name, elo, initialElo
totalMatchesPlayed, winCount, lossCount, drawCount
goalsFor, goalsAgainst
history: historial de cambios de ELO

#### Partidos (match-db.json)
Cada partido incluye:

id, date, teamA, teamB
winner: 'A' | 'B' | 'draw'
goalDifference

#### Equipos (team-db.json)
Cada equipo tiene:

id
players: lista de jugadores

### 📡 Endpoints disponibles
🔹 Crear jugador
POST /players
```json
{
  "name": "Santi",
  "initialElo": 1000
}
```

🔹 Listar jugadores
GET /players

Respuesta:
```json
[
  {
    "id": "uuid-123",
    "name": "Santi",
    "elo": 1000,
    "initialElo": 1000,
    "totalMatchesPlayed": 0,
    "winCount": 0,
    "lossCount": 0,
    "drawCount": 0,
    "goalsFor": 0,
    "goalsAgainst": 0,
    "history": []
  }
]
```

🔹 Registrar un partido
POST /matches

```json
{
  "teamAIds": ["uuid-1", "uuid-2", "uuid-3", "uuid-4", "uuid-5"],
  "teamBIds": ["uuid-6", "uuid-7", "uuid-8", "uuid-9", "uuid-10"],
  "winner": "A",
  "goalDifference": 2,
  "date": "2025-05-21T21:00:00Z"
}
```

🔹 Generar equipos balanceados
POST /teams/balance

```json
{
  "playerIds": [
    "uuid-1", "uuid-2", "uuid-3", "uuid-4", "uuid-5",
    "uuid-6", "uuid-7", "uuid-8", "uuid-9", "uuid-10"
  ]
}
```

Respuesta
```json
[
  {
    "teamA": ["Santi", "Goro", "Naza", "Seba Q", "Teo"],
    "eloA": 5005,
    "teamB": ["Axel", "Nahue", "Nico", "Seba P", "Luca"],
    "eloB": 4990,
    "difference": 15
  },
  ...
]
```


✍️ Autor
Desarrollado por seq
Hecho con ❤️ y fútbol
