import dayjs from 'dayjs'

export const convertDatetimeToISO8601Format = (dateString: string): string => {
  return dayjs(dateString).format('YYYY-MM-DDTHH:mm:ss')
}

export const convertDateToISO8601Format = (dateString: string): string => {
  return dayjs(dateString).format('YYYY-MM-DD')
}

export const convertDateToShortFormat = (dateString: string): string => {
  return dayjs(dateString).format('M/D')
}

export const convertDatetimeToShortFormat = (dateString: string): string => {
  return dayjs(dateString).format('M/D H:mm')
}
