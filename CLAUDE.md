# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start:dev     # Run in watch mode (development)
npm run build         # Compile with NestJS CLI
npm run lint          # Lint and auto-fix with ESLint
npm run format        # Format with Prettier
npm run test          # Run Jest tests
npm run test:watch    # Run tests in watch mode
npm run test:cov      # Run tests with coverage
npm run backup        # Snapshot data/*.json files to backups/ with timestamp
npm run restore <ts>  # Restore data files from a backup timestamp
```

The app runs on port `3000` by default (configurable via `PORT` env var). CORS is enabled for `http://localhost:3001`.

## Architecture

This is a **NestJS + TypeScript** API following **hexagonal (clean) architecture**:

```
src/
  domain/           # Core business logic — no framework dependencies
    entities/       # Plain classes: Player, Match, Team, EloChange, BalancedTeams
    ports/          # Repository interfaces (PlayerRepository, MatchRepository)
    services/       # MatchResultService — pure ELO calculation logic
    errors/         # Custom domain errors
  application/
    use-cases/      # One class per feature (CreateMatchUseCase, GenerateBalancedTeamsUseCase, etc.)
    dto/            # Input/output DTOs for use cases
  infrastructure/
    adapters/persistence/files/   # Concrete file-based repository implementations
    http/controllers/             # NestJS controllers, one per resource
  utils/
    combinations.ts # Combinatorics helper for team balancing
```

### Dependency Injection

Repositories are bound to string tokens in `AppModule`:

- `'PlayerRepository'` → `FilePlayerRepository`
- `'MatchRepository'` → `FileMatchRepository`
- `'TeamRepository'` → `FileTeamRepository`

Use cases inject them with `@Inject('PlayerRepository')`, etc.

### Persistence

Data is stored as JSON files under `data/` (not committed):

- `data/player-db.json`
- `data/match-db.json`
- `data/team-db.json`

The `backups/` directory holds timestamped snapshots created by `npm run backup`.

### Path Aliases

Configured in `tsconfig.json`:

| Alias | Resolves to |
|---|---|
| `@domain/*` | `src/domain/*` |
| `@application/*` | `src/application/*` |
| `@infrastructure/*` | `src/infrastructure/*` |
| `@utils/*` | `src/utils/*` |

### ELO System

Implemented in `MatchResultService` (`src/domain/services/match-result.service.ts`):

- Win: `+10 + goalDifference`
- Loss: `-10 - goalDifference`
- Draw: `+5`

### Team Balancing

`GenerateBalancedTeamsUseCase` generates all 5-player combinations from a pool, scores each split using a weighted formula (ELO 40%, win rate 30%, recent form 20%, team synergy 10%), and returns the top 15 most balanced options. Hard constraint: "Nico" and "Nahue" cannot be on the same team.

### API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/players` | Create player |
| `GET` | `/players` | List all players |
| `GET` | `/players/ranking` | Players ranked by ELO |
| `GET` | `/players/:id/information` | Detailed player stats |
| `POST` | `/match` | Record a match result |
| `GET` | `/matches` | Match history summary |
| `POST` | `/teams/balance` | Generate balanced team options |
| `GET` | `/statistics/general` | General statistics |

Match creation uses player **names** (case-insensitive), not IDs.
