import { Game } from "../model/game"
import { Simulation } from "../model/simulation"

const gameYear = 28 * 12 // we just use an even set of month lengths that is divisable by 7 days
const gameMonth = gameYear / 12.0
const gameWeek = gameMonth / 4.0
const gameDay = gameWeek / 7.0

const normalSpeedDayPerSecond = 1.0

export function applyTime(simulation: Simulation, timeDelta: number) {
  const previousDay = Math.floor(simulation.time.clock)
  simulation.time.clock += timeDelta * normalSpeedDayPerSecond
  const isNewDay = Math.floor(simulation.time.clock) > previousDay
  const isNewWeek = isNewDay ? Math.floor(simulation.time.clock) % gameWeek == 0 : false
  const isNewMonth = isNewDay ? Math.floor(simulation.time.clock) % gameMonth == 0 : false

  return { isNewDay, isNewWeek, isNewMonth }
}

export function year(simulation: Simulation) {
  return 1900 + Math.floor(simulation.time.clock / gameYear)
}

export function month(simulation: Simulation) {
  return Math.floor(simulation.time.clock / gameMonth)
}
