export function calculatePlayerStats(events) {
  if (!events || events.length === 0) {
    return {
      goals: 0,
      assists: 0,
      shots: 0,
      keyPasses: 0,
      losses: 0,
      recoveries: 0,
      fouls: 0,
      yellowCards: 0,
      redCards: 0,
      saves: 0,
      clearances: 0,
      totalEvents: 0,
    };
  }

  const counts = {};
  for (let i = 0; i < events.length; i++) {
    const t = events[i].event_type;
    counts[t] = (counts[t] || 0) + 1;
  }

  return {
    goals: counts.gol || 0,
    assists: counts.asistencia || 0,
    shots: counts.tiro || 0,
    keyPasses: counts.pase_clave || 0,
    losses: counts.perdida || 0,
    recoveries: counts.recuperacion || 0,
    fouls: counts.falta || 0,
    yellowCards: counts.tarjeta_amarilla || 0,
    redCards: counts.tarjeta_roja || 0,
    saves: counts.parada || 0,
    clearances: counts.despeje || 0,
    totalEvents: events.length,
  };
}

export function calculateTeamStats(events, players, teamId, matches) {
  const stats = {
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
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

  if (matches && matches.length > 0 && teamId) {
    stats.played = matches.length;
    for (const m of matches) {
      if (!m.result) continue;
      const parts = m.result.split('-');
      if (parts.length !== 2) continue;
      const gf = parseInt(parts[0], 10);
      const ga = parseInt(parts[1], 10);
      if (isNaN(gf) || isNaN(ga)) continue;
      const isHome = m.team_id === teamId;
      const myGoals = isHome ? gf : ga;
      const theirGoals = isHome ? ga : gf;
      stats.goalsFor += myGoals;
      stats.goalsAgainst += theirGoals;
      if (myGoals > theirGoals) stats.won++;
      else if (myGoals < theirGoals) stats.lost++;
      else stats.drawn++;
    }
  }

  const counts = {};
  const playerEventCounts = {};
  if (!events || events.length === 0) return stats;
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    counts[e.event_type] = (counts[e.event_type] || 0) + 1;
    if (e.player_id) {
      if (!playerEventCounts[e.player_id]) {
        playerEventCounts[e.player_id] = { goals: 0, assists: 0 };
      }
      if (e.event_type === 'gol') playerEventCounts[e.player_id].goals++;
      if (e.event_type === 'asistencia') playerEventCounts[e.player_id].assists++;
    }
  }

  stats.totalGoals = counts.gol || 0;
  stats.totalAssists = counts.asistencia || 0;
  stats.totalShots = counts.tiro || 0;
  stats.totalYellowCards = counts.tarjeta_amarilla || 0;
  stats.totalRedCards = counts.tarjeta_roja || 0;

  const getPlayerName = (id) => {
    const p = players.find((pl) => pl.id === id);
    return p ? p.name : 'Desconocido';
  };

  stats.topScorers = Object.entries(playerEventCounts)
    .map(([id, c]) => ({ name: getPlayerName(id), count: c.goals }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  stats.topAssists = Object.entries(playerEventCounts)
    .map(([id, c]) => ({ name: getPlayerName(id), count: c.assists }))
    .filter((a) => a.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const typeLabels = {
    gol: 'Goles',
    asistencia: 'Asistencias',
    tiro: 'Tiros',
    pase_clave: 'Pases clave',
    perdida: 'Pérdidas',
    recuperacion: 'Recuperaciones',
    falta: 'Faltas',
    tarjeta_amarilla: 'T. Amarillas',
    tarjeta_roja: 'T. Rojas',
    parada: 'Paradas',
    despeje: 'Despejes',
  };

  stats.eventsByType = Object.entries(typeLabels)
    .map(([type, label]) => ({
      name: label,
      value: counts[type] || 0,
    }))
    .filter((e) => e.value > 0);

  const minuteBuckets = {};
  events.forEach((e) => {
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

  const minuteData = {};

  events.forEach((e) => {
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

export function analyzeStrengthsWeaknesses(events) {
  if (!events || events.length === 0) {
    return { strengths: [], weaknesses: [], summary: 'Sin datos suficientes para analizar.' };
  }

  const stats = calculatePlayerStats(events);
  const total = stats.totalEvents;

  const metrics = [
    { key: 'goals', label: 'Goles', value: stats.goals, weight: 3, positive: true },
    { key: 'assists', label: 'Asistencias', value: stats.assists, weight: 2.5, positive: true },
    { key: 'shots', label: 'Tiros', value: stats.shots, weight: 1, positive: true },
    { key: 'keyPasses', label: 'Pases clave', value: stats.keyPasses, weight: 2, positive: true },
    {
      key: 'recoveries',
      label: 'Recuperaciones',
      value: stats.recoveries,
      weight: 1.5,
      positive: true,
    },
    { key: 'losses', label: 'Pérdidas', value: stats.losses, weight: 1.5, positive: false },
    { key: 'fouls', label: 'Faltas cometidas', value: stats.fouls, weight: 1, positive: false },
    {
      key: 'yellowCards',
      label: 'Tarjetas amarillas',
      value: stats.yellowCards,
      weight: 1.5,
      positive: false,
    },
    { key: 'redCards', label: 'Tarjetas rojas', value: stats.redCards, weight: 3, positive: false },
  ];

  const scored = metrics.map((m) => {
    const rate = total > 0 ? (m.value / total) * 100 : 0;
    const score = m.value * m.weight * (m.positive ? 1 : -1);
    return { ...m, rate: Math.round(rate * 10) / 10, score };
  });

  const strengths = scored
    .filter((m) => m.positive && m.value > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const weaknesses = scored
    .filter((m) => !m.positive && m.value > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  const topStrength = strengths[0];
  const topWeakness = weaknesses[0];

  let summary = '';
  if (topStrength && topWeakness) {
    summary = `${topStrength.label.toLowerCase()} como principal fortaleza (${topStrength.value} registros) y ${topWeakness.label.toLowerCase()} como área de mejora (${topWeakness.value} registros).`;
  } else if (topStrength) {
    summary = `Principal fortaleza: ${topStrength.label.toLowerCase()} (${topStrength.value} registros). Sin debilidades significativas detectadas.`;
  } else if (topWeakness) {
    summary = `Área de mejora principal: ${topWeakness.label.toLowerCase()} (${topWeakness.value} registros).`;
  } else {
    summary = 'Datos insuficientes para un análisis detallado.';
  }

  return { strengths, weaknesses, summary, totalEvents: total };
}
