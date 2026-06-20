const BUSINESS_TIME_ZONE = process.env.BUSINESS_TIME_ZONE || 'America/Sao_Paulo'

type DateParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: BUSINESS_TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

function partsInBusinessTimeZone(date: Date): DateParts {
  const parts = formatter.formatToParts(date)
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value)

  return {
    year: value('year'),
    month: value('month'),
    day: value('day'),
    hour: value('hour'),
    minute: value('minute'),
    second: value('second'),
  }
}

function offsetInBusinessTimeZone(date: Date): number {
  const parts = partsInBusinessTimeZone(date)
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  )

  return asUtc - (date.getTime() - date.getUTCMilliseconds())
}

export function dateFromBusinessTime(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0
): Date {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond))
  const firstOffset = offsetInBusinessTimeZone(utcGuess)
  const firstResult = new Date(utcGuess.getTime() - firstOffset)
  const secondOffset = offsetInBusinessTimeZone(firstResult)

  if (secondOffset !== firstOffset) {
    return new Date(utcGuess.getTime() - secondOffset)
  }

  return firstResult
}

export function parseBusinessDateOnly(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) throw new Error('Data invalida. Use o formato YYYY-MM-DD.')

  const [, year, month, day] = match
  return dateFromBusinessTime(Number(year), Number(month), Number(day))
}

export function parseBusinessDateTime(value: string): Date {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/.exec(value)

  if (!match) {
    throw new Error('Data/hora invalida. Use o formato YYYY-MM-DDTHH:mm:ss sem timezone.')
  }

  const [, year, month, day, hour, minute, second = '0'] = match
  return dateFromBusinessTime(
    Number(year),
    Number(month),
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  )
}

export function businessDayRange(date: Date) {
  const parts = partsInBusinessTimeZone(date)

  return {
    inicio: dateFromBusinessTime(parts.year, parts.month, parts.day, 0, 0, 0, 0),
    fim: dateFromBusinessTime(parts.year, parts.month, parts.day, 23, 59, 59, 999),
  }
}

export function businessMonthRange(date: Date) {
  const parts = partsInBusinessTimeZone(date)
  const nextMonth = parts.month === 12 ? 1 : parts.month + 1
  const nextMonthYear = parts.month === 12 ? parts.year + 1 : parts.year

  return {
    inicio: dateFromBusinessTime(parts.year, parts.month, 1, 0, 0, 0, 0),
    fim: new Date(dateFromBusinessTime(nextMonthYear, nextMonth, 1, 0, 0, 0, 0).getTime() - 1),
  }
}

export function businessWeekday(date: Date): number {
  const parts = partsInBusinessTimeZone(date)
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay()
}

export function businessMinutes(date: Date): number {
  const parts = partsInBusinessTimeZone(date)
  return parts.hour * 60 + parts.minute
}

export function dateAtBusinessMinutes(date: Date, minutes: number): Date {
  const parts = partsInBusinessTimeZone(date)
  return dateFromBusinessTime(
    parts.year,
    parts.month,
    parts.day,
    Math.floor(minutes / 60),
    minutes % 60
  )
}
