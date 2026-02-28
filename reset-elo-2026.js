#!/usr/bin/env node
/**
 * Reset de ELO para temporada 2026
 * Aplica regresión parcial a la media: new_elo = round(1000 + (elo - 1000) * FACTOR)
 *
 * Uso: DATABASE_URL=postgresql://... node reset-elo-2026.js
 * Factor configurable: REGRESSION_FACTOR=0.5 (default)
 */

const { Client } = require('pg');

const FACTOR = parseFloat(process.env.REGRESSION_FACTOR ?? '0.5');
const BASE = 1000;

async function resetElo() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log(`Conectado. Factor de regresión: ${FACTOR}`);

  try {
    const { rows: players } = await client.query(
      'SELECT id, name, elo, history FROM players ORDER BY elo DESC',
    );

    console.log(`\nJugadores a actualizar (${players.length}):`);
    console.log('─'.repeat(45));

    await client.query('BEGIN');

    const resetAt = new Date().toISOString();
    for (const player of players) {
      const oldElo = player.elo;
      const newElo = Math.round(BASE + (oldElo - BASE) * FACTOR);
      const historyEntry = {
        oldElo,
        newElo,
        changedAt: resetAt,
        matchId: 'season-reset-2026',
      };

      const updatedHistory = [...(player.history ?? []), historyEntry];

      await client.query('UPDATE players SET elo = $1, history = $2 WHERE id = $3', [
        newElo,
        JSON.stringify(updatedHistory),
        player.id,
      ]);

      const arrow = newElo > oldElo ? '↑' : newElo < oldElo ? '↓' : '=';
      console.log(
        `${player.name.padEnd(12)} ${String(oldElo).padStart(4)} → ${String(newElo).padStart(4)} ${arrow}`,
      );
    }

    await client.query('COMMIT');
    console.log('─'.repeat(45));
    console.log('✓ Reset completado. Temporada 2026 lista.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error — se hizo rollback:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetElo();
