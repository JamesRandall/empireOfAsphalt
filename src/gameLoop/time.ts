import { Game } from "../model/game"

const gameYear = 365.0
const gameMonth = gameYear / 12.0
const gameWeek = gameMonth / 4.0
const gameDay = gameWeek / 7.0

const normalSpeedDayPerSecond = 1.0

export function applyTime(game: Game, timeDelta: number) {
  game.time += timeDelta * normalSpeedDayPerSecond
}

export function year(game: Game) {
  return 1900 + Math.floor(game.time / gameYear)
}

export function month(game: Game) {
  return Math.floor(game.time / gameMonth)
}
