# Madden Records 🏈

A mobile-first PWA for tracking head-to-head Madden NFL game results. Record scores, view standings, track streaks, and dig into stats — all in a dark, football-themed UI.

---

## Features

- **Home dashboard** — W/L records, current win/loss streaks, and last game result with team helmets
- **Games list** — full game history with team colors, scores, and win streak badges; swipe left to edit or delete
- **Records** — longest win streak, largest margin of victory, most points scored
- **Stats** — win percentage, head-to-head record, best team, most/least used team, average score
- **PWA** — installable on iOS and Android via "Add to Home Screen"

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express |
| Database | PostgreSQL 16 |
| Container | Docker / Docker Compose |
| Kubernetes | Helm chart (v0.1.9) |

---

## Running Locally

**Prerequisites:** Docker and Docker Compose

```bash
git clone https://github.com/frobobbo/madden-records.git
cd madden-records
docker compose up --build
```

The app will be available at `http://localhost:8080`.

To change the port or database credentials, create a `.env` file:

```env
APP_PORT=8080
DB_NAME=madden
DB_USER=madden
DB_PASSWORD=madden
```

---

## Deploying with Helm

### Prerequisites

- Kubernetes cluster
- Helm 3
- `kubectl` configured for your cluster

### Basic install

```bash
helm install madden ./helm/madden-records \
  --namespace apps \
  --create-namespace \
  --set postgresql.auth.password=<your-password>
```

### Expose the app

Enable the ingress in `values.yaml` or via `--set`:

```bash
helm install madden ./helm/madden-records \
  --namespace apps \
  --set postgresql.auth.password=<your-password> \
  --set ingress.enabled=true \
  --set ingress.host=madden.example.com
```

### Using an external PostgreSQL instance

```bash
helm install madden ./helm/madden-records \
  --namespace apps \
  --set postgresql.enabled=false \
  --set externalDatabase.host=<host> \
  --set externalDatabase.password=<password>
```

---

## Importing Data

The Helm chart includes a post-install/upgrade Job that automatically imports data on deployment. If no import data is provided, the app starts with a blank database — no extra configuration needed.

### Data source: MongoDB export

If you have a MongoDB BSON export from the old app, convert it to the import format first:

```bash
# Install dependencies
pip3 install pymongo

# Generate import.json from the BSON export
python3 export.py
# Writes 'import.json' to the project root
```

> The export script handles relocated franchises automatically (STL→LAR, OAK→LV, SD→LAC, JAC→JAX).

### Loading data into Kubernetes

1. Create a ConfigMap from the generated file, using the naming convention `<release>-madden-records-import`:

```bash
kubectl create configmap madden-madden-records-import \
  --from-file=data.json=import.json \
  --namespace apps
```

2. Deploy or upgrade the Helm chart:

```bash
helm upgrade --install madden ./helm/madden-records \
  --namespace apps \
  --set postgresql.auth.password=<your-password>
```

The import Job will:
- Wait for PostgreSQL to be ready
- Check if the database already has data — if so, it skips silently
- Import all players and games from `data.json`
- Delete itself 5 minutes after completion

**If the ConfigMap does not exist**, the Job exits immediately and the app starts with an empty database. This is the default behaviour for a fresh install without any migration data.

### import.json format

The import file is a simple JSON structure. You can also create one manually:

```json
{
  "players": [
    { "name": "Player1" },
    { "name": "Player2" }
  ],
  "games": [
    {
      "date": "2019-04-29",
      "home": { "playerName": "Player1", "teamId": "min", "score": 16 },
      "away": { "playerName": "Player2", "teamId": "nyj", "score": 14 }
    }
  ]
}
```

`teamId` values are lowercase abbreviations: `kc`, `ne`, `sf`, `gb`, `lar`, `lv`, `lac`, etc.

---

## Project Structure

```
maddenRecords/
├── backend/
│   ├── scripts/
│   │   └── import.js        # Import script (runs inside Kubernetes Job)
│   └── src/
│       ├── db/index.js      # PostgreSQL connection and schema migration
│       ├── routes/          # Express API routes
│       └── index.js
├── frontend/
│   ├── public/
│   │   ├── helmets/         # 64 NFL helmet PNGs
│   │   ├── icons/           # PWA app icons
│   │   ├── logos/           # 32 NFL team logo PNGs
│   │   └── manifest.json    # PWA manifest
│   └── src/
│       ├── components/      # Header, BottomNav, TeamLogo, modals
│       ├── data/teams.js    # All 32 teams with colors and abbreviations
│       ├── pages/           # Home, Games, Records, Stats, Players
│       └── utils/stats.js   # All stat calculations
├── helm/madden-records/
│   └── templates/
│       └── job-import.yaml  # Post-install/upgrade import Job
├── export.py                # Converts MongoDB BSON export → import.json
└── docker-compose.yml
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check (503 until DB is ready) |
| GET | `/api/players` | List all players |
| POST | `/api/players` | Create a player |
| PUT | `/api/players/:id` | Update a player |
| DELETE | `/api/players/:id` | Delete a player |
| GET | `/api/games` | List all games (newest first) |
| POST | `/api/games` | Record a new game |
| PUT | `/api/games/:id` | Update a game |
| DELETE | `/api/games/:id` | Delete a game |
