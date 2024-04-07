import { Game } from "../model/game"

const gameYear = 28 * 12 // we just use an even set of month lengths that is divisable by 7 days
const gameMonth = gameYear / 12.0
const gameWeek = gameMonth / 4.0
const gameDay = gameWeek / 7.0

const normalSpeedDayPerSecond = 1.0

export function applyTime(game: Game, timeDelta: number) {
  const previousDay = Math.floor(game.time.clock)
  game.time.clock += timeDelta * normalSpeedDayPerSecond
  const isNewDay = Math.floor(game.time.clock) > previousDay
  const isNewWeek = isNewDay ? Math.floor(game.time.clock) % gameWeek == 0 : false
  const isNewMonth = isNewDay ? Math.floor(game.time.clock) % gameMonth == 0 : false

  return { isNewDay, isNewWeek, isNewMonth }
}

export function year(game: Game) {
  return 1900 + Math.floor(game.time.clock / gameYear)
}

export function month(game: Game) {
  return Math.floor(game.time.clock / gameMonth)
}
