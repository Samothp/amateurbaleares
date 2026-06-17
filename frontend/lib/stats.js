export function calculatePlayerStats(events) {
  if (!events || events.length === 0) {
    return { goals: 0, assists: 0, shots: 0, keyPasses: 0, losses: 0, recoveries: 0, fouls: 0, yellowCards: 0, redCards: 0, saves: 0, clearances: 0, totalEvents: 0 };
  }

  const count = (type) => events.filter(e => e.event_type === type).length;

  return {
    goals: count('gol'),
    assists: count('asistencia'),
    shots: count('tiro'),
    keyPasses: count('pase_clave'),
    losses: count('perdida'),
    recoveries: count('recuperacion'),
    fouls: count('falta'),
    yellowCards: count('tarjeta_amarilla'),
    redCards: count('tarjeta_roja'),
    saves: count('parada'),
    clearances: count('despeje'),
    totalEvents: events.length,
  };
}

export function calculateTeamStats(events, players) {
  const stats = {
    totalGoals: 0,
    totalAssists: 0,
    totalShots: 0,
    totalYellowCards: 0,
    totalRedCards: 0,
    topScorers: [],
    topAssists: [],
    eventsByType: [],
    eventsByMinute: [],
  };

  if (!events || events.length === 0) return stats;

  const count = (type) => events.filter(e => e.event_type === type).length;
  stats.totalGoals = count('gol');
  stats.totalAssists = count('asistencia');
  stats.totalShots = count('tiro');
  stats.totalYellowCards = count('tarjeta_amarilla');
  stats.totalRedCards = count('tarjeta_roja');

  const playerEventCounts = {};
  events.forEach(e => {
    if (!e.player_id) return;
    if (!playerEventCounts[e.player_id]) {
      playerEventCounts[e.player_id] = { goals: 0, assists: 0 };
    }
    if (e.event_type === 'gol') playerEventCounts[e.player_id].goals++;
    if (e.event_type === 'asistencia') playerEventCounts[e.player_id].assists++;
  });

  const getPlayerName = (id) => {
    const p = players.find(pl => pl.id === id);
    return p ? p.name : 'Desconocido';
  };

  stats.topScorers = Object.entries(playerEventCounts)
    .map(([id, c]) => ({ name: getPlayerName(id), count: c.goals }))
    .filter(s => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  stats.topAssists = Object.entries(playerEventCounts)
    .map(([id, c]) => ({ name: getPlayerName(id), count: c.assists }))
    .filter(a => a.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const typeLabels = {
    gol: 'Goles', asistencia: 'Asistencias', tiro: 'Tiros', pase_clave: 'Pases clave',
    perdida: 'Pérdidas', recuperacion: 'Recuperaciones', falta: 'Faltas',
    tarjeta_amarilla: 'T. Amarillas', tarjeta_roja: 'T. Rojas', parada: 'Paradas', despeje: 'Despejes',
  };

  stats.eventsByType = Object.entries(typeLabels).map(([type, label]) => ({
    name: label,
    value: count(type),
  })).filter(e => e.value > 0);

  const minuteBuckets = {};
  events.forEach(e => {
    if (e.minute == null) return;
    const bucket = Math.floor(e.minute / 15) * 15;
    const key = `${bucket}'-${bucket + 14}'`;
    minuteBuckets[key] = (minuteBuckets[key] || 0) + 1;
  });

  stats.eventsByMinute = Object.entries(minuteBuckets)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => {
      const minA = parseInt(a.name);
      const minB = parseInt(b.name);
      return minA - minB;
    });

  return stats;
}

export function calculatePlayerTimeline(events) {
  if (!events || events.length === 0) return [];

  const timeline = [];
  const minuteData = {};

  events.forEach(e => {
    if (e.minute == null) return;
    if (!minuteData[e.minute]) {
      minuteData[e.minute] = { minute: e.minute, goals: 0, assists: 0, events: 0 };
    }
    minuteData[e.minute].events++;
    if (e.event_type === 'gol') minuteData[e.minute].goals++;
    if (e.event_type === 'asistencia') minuteData[e.minute].assists++;
  });

  return Object.values(minuteData).sort((a, b) => a.minute - b.minute);
}
