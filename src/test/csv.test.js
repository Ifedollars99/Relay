import { describe, it, expect } from 'vitest'
import { toCSV } from '../lib/csv.js'

describe('toCSV', () => {
  it('returns empty string for no rows', () => {
    expect(toCSV([])).toBe('')
  })
  it('serializes headers and rows', () => {
    const csv = toCSV([{ id: 'RL-1', subject: 'Hello' }, { id: 'RL-2', subject: 'World' }])
    expect(csv.split('\n')).toEqual(['id,subject', 'RL-1,Hello', 'RL-2,World'])
  })
  it('escapes commas, quotes and newlines', () => {
    const csv = toCSV([{ a: 'say "hi", ok\nbye' }])
    expect(csv).toBe('a\n"say ""hi"", ok\nbye"')
  })
})
