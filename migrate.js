#!/usr/bin/env node
/**
 * Migración: data/*.json → Supabase (PostgreSQL)
 * Uso: DATABASE_URL=postgresql://... node migrate.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const players = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/player-db.json'), 'utf8'));
const matches = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/match-db.json'), 'utf8'));

// Mapa (playerId, matchId) → elo_after, construido desde el historial de cada jugador
const eloAfterMap = new Map();
for (const player of players) {
  for (const entry of player.history) {
    if (entry.matchId) {
      eloAfterMap.set(`${player.id}::${entry.matchId}`, entry.newElo);
    }
  }
}

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Conectado a la base de datos');

  try {
    await client.query('BEGIN');

    // 1. Players
    console.log(`Insertando ${players.length} jugadores...`);
    for (const p of players) {
      await client.query(
        `INSERT INTO players (id, name, elo, initial_elo, total_matches_played, win_count, loss_count, draw_count, goals_for, goals_against, history)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, elo = EXCLUDED.elo, initial_elo = EXCLUDED.initial_elo,
           total_matches_played = EXCLUDED.total_matches_played, win_count = EXCLUDED.win_count,
           loss_count = EXCLUDED.loss_count, draw_count = EXCLUDED.draw_count,
           goals_for = EXCLUDED.goals_for, goals_against = EXCLUDED.goals_against,
           history = EXCLUDED.history`,
        [p.id, p.name, p.elo, p.initialElo, p.totalMatchesPlayed, p.winCount, p.lossCount, p.drawCount, p.goalsFor, p.goalsAgainst, JSON.stringify(p.history)]
      );
    }
    console.log('✓ Jugadores insertados');

    // 2. Matches + match_players
    console.log(`Insertando ${matches.length} partidos...`);
    let matchPlayersCount = 0;
    let warnings = 0;

    for (const match of matches) {
      await client.query(
        `INSERT INTO matches (id, date, winner, goal_difference)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (id) DO UPDATE SET date = EXCLUDED.date, winner = EXCLUDED.winner, goal_difference = EXCLUDED.goal_difference`,
        [match.id, match.date, match.winner, match.goalDifference]
      );

      const slots = [
        ...match.teamA.players.map(p => ({ player: p, team: 'A' })),
        ...match.teamB.players.map(p => ({ player: p, team: 'B' })),
      ];

      for (const { player, team } of slots) {
        const eloBefore = player.elo;
        const eloAfter = eloAfterMap.get(`${player.id}::${match.id}`);

        if (eloAfter === undefined) {
          console.warn(`  ⚠ Sin elo_after: jugador ${player.name} en partido ${match.id} — usando elo_before como fallback`);
          warnings++;
        }

        await client.query(
          `INSERT INTO match_players (match_id, player_id, team, elo_before, elo_after)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (match_id, player_id) DO UPDATE SET team = EXCLUDED.team, elo_before = EXCLUDED.elo_before, elo_after = EXCLUDED.elo_after`,
          [match.id, player.id, team, eloBefore, eloAfter ?? eloBefore]
        );
        matchPlayersCount++;
      }
    }

    await client.query('COMMIT');
    console.log(`✓ Partidos insertados`);
    console.log(`✓ ${matchPlayersCount} filas en match_players`);
    if (warnings > 0) console.warn(`⚠ ${warnings} advertencias (ver arriba)`);
    console.log('\nMigración completada.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error — se hizo rollback:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
