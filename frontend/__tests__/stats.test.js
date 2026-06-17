import {
  calculatePlayerStats,
  analyzeStrengthsWeaknesses,
  calculatePlayerTimeline,
} from '../lib/stats';
import '@testing-library/jest-dom/jest-globals';

describe('calculatePlayerStats', () => {
  it('returns zeros when no events', () => {
    const stats = calculatePlayerStats([]);
    expect(stats.goals).toBe(0);
    expect(stats.assists).toBe(0);
    expect(stats.totalEvents).toBe(0);
  });

  it('returns null-like for null input', () => {
    const stats = calculatePlayerStats(null);
    expect(stats.goals).toBe(0);
    expect(stats.totalEvents).toBe(0);
  });

  it('counts goals correctly', () => {
    const events = [{ event_type: 'gol' }, { event_type: 'gol' }, { event_type: 'asistencia' }];
    const stats = calculatePlayerStats(events);
    expect(stats.goals).toBe(2);
    expect(stats.assists).toBe(1);
    expect(stats.totalEvents).toBe(3);
  });

  it('counts all event types', () => {
    const events = [
      { event_type: 'gol' },
      { event_type: 'asistencia' },
      { event_type: 'tiro' },
      { event_type: 'pase_clave' },
      { event_type: 'perdida' },
      { event_type: 'recuperacion' },
      { event_type: 'falta' },
      { event_type: 'tarjeta_amarilla' },
      { event_type: 'tarjeta_roja' },
      { event_type: 'parada' },
      { event_type: 'despeje' },
    ];
    const stats = calculatePlayerStats(events);
    expect(stats.goals).toBe(1);
    expect(stats.assists).toBe(1);
    expect(stats.shots).toBe(1);
    expect(stats.keyPasses).toBe(1);
    expect(stats.losses).toBe(1);
    expect(stats.recoveries).toBe(1);
    expect(stats.fouls).toBe(1);
    expect(stats.yellowCards).toBe(1);
    expect(stats.redCards).toBe(1);
    expect(stats.saves).toBe(1);
    expect(stats.clearances).toBe(1);
    expect(stats.totalEvents).toBe(11);
  });
});

describe('analyzeStrengthsWeaknesses', () => {
  it('returns empty analysis for no events', () => {
    const result = analyzeStrengthsWeaknesses([]);
    expect(result.strengths).toHaveLength(0);
    expect(result.weaknesses).toHaveLength(0);
    expect(result.summary).toContain('Sin datos');
  });

  it('identifies strengths from positive events', () => {
    const events = Array(10)
      .fill({ event_type: 'gol' })
      .concat(Array(5).fill({ event_type: 'asistencia' }));
    const result = analyzeStrengthsWeaknesses(events);
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.strengths[0].label).toBe('Goles');
  });

  it('identifies weaknesses from negative events', () => {
    const events = Array(8)
      .fill({ event_type: 'perdida' })
      .concat(Array(3).fill({ event_type: 'falta' }));
    const result = analyzeStrengthsWeaknesses(events);
    expect(result.weaknesses.length).toBeGreaterThan(0);
  });

  it('returns totalEvents count', () => {
    const events = Array(5).fill({ event_type: 'gol' });
    const result = analyzeStrengthsWeaknesses(events);
    expect(result.totalEvents).toBe(5);
  });
});

describe('calculatePlayerTimeline', () => {
  it('returns empty array for no events', () => {
    expect(calculatePlayerTimeline([])).toEqual([]);
  });

  it('groups events by minute', () => {
    const events = [
      { minute: 10, event_type: 'gol' },
      { minute: 10, event_type: 'asistencia' },
      { minute: 25, event_type: 'gol' },
    ];
    const timeline = calculatePlayerTimeline(events);
    expect(timeline).toHaveLength(2);
    expect(timeline[0].minute).toBe(10);
    expect(timeline[0].goals).toBe(1);
    expect(timeline[0].assists).toBe(1);
    expect(timeline[1].minute).toBe(25);
    expect(timeline[1].goals).toBe(1);
  });

  it('ignores events without minute', () => {
    const events = [{ event_type: 'gol' }, { minute: 10, event_type: 'gol' }];
    const timeline = calculatePlayerTimeline(events);
    expect(timeline).toHaveLength(1);
  });
});
