import dayjs, { Dayjs } from 'dayjs'

type PatientsSummaryDaily = {
  日付: string
  小計: number
}

type PatientsSummaryWeekly = {
  開始日: string
  終了日: string
  小計: number
}

type DataWeekly = {
  // eslint-disable-next-line camelcase
  patients_summary: {
    date: string
    data: PatientsSummaryWeekly[]
  }
}

type WeekRange = {
  from: Dayjs
  to: Dayjs
}

type WeeklizedPatientsSummary = {
  from: Dayjs
  to: Dayjs
  data: PatientsSummaryDaily[]
}

export default (Data: any): DataWeekly => {
  const chunkStartYoubi = 7 // 0:日曜日、1:月曜日…

  const patientsSummaryWeekly = weeklizePatientsSummary(
    Data.patients_summary.data as PatientsSummaryDaily[],
    chunkStartYoubi
  )
  console.debug('patientsSummaryWeekly', patientsSummaryWeekly)

  return {
    patients_summary: {
      date: Data.patients_summary.date,
      data: patientsSummaryWeekly
    }
  } as DataWeekly
}

const weeklizePatientsSummary = (
  patientsSummaryDaily: PatientsSummaryDaily[],
  chunkStartYoubi: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
): PatientsSummaryWeekly[] => {
  const beginDate = dayjs('2020-01-25') // dayjs(patientsSummaryDaily[0]["日付"]);
  const lastDate = dayjs('2020-05-04') // dayjs(patientsSummaryDaily[patientsSummaryDaily.length - 1]["日付"]);

  const weekRanges = makeWeekRanges(beginDate, lastDate, chunkStartYoubi)
  console.log('weekRanges', weekRanges)

  const weeklizedPatientsSummaries: WeeklizedPatientsSummary[] = weekRanges.map(
    x => ({ from: x.from, to: x.to, data: [] })
  )

  for (const cur of patientsSummaryDaily) {
    const dt = dayjs(cur['日付'])
    const foundIndex = weeklizedPatientsSummaries.findIndex(
      x => x.from <= dt && dt < x.to
    )

    if (foundIndex >= 0) {
      weeklizedPatientsSummaries[foundIndex].data.push(cur)
    }
  }
  console.log('weeklizedPatients', weeklizedPatientsSummaries)

  const patientsSummaryWeekly = weeklizedPatientsSummaries.map(week => {
    const sum = week.data.reduce((pre, x) => pre + Number(x['小計']), 0)

    return {
      開始日: week.from.format('YYYY-MM-DD'),
      終了日: week.to.format('YYYY-MM-DD'),
      小計: sum
    } as PatientsSummaryWeekly
  })
  console.debug('patientsSummaryWeekly', patientsSummaryWeekly)

  // 開始日、終了日の調整
  patientsSummaryWeekly[0]['開始日'] = patientsSummaryDaily[0]['日付']
  patientsSummaryWeekly[patientsSummaryWeekly.length - 1]['終了日'] =
    patientsSummaryDaily[patientsSummaryDaily.length - 1]['日付']

  return patientsSummaryWeekly
}

const makeWeekRanges = (
  beginDate: Dayjs,
  lastDate: Dayjs,
  chunkStartYoubi: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
): WeekRange[] => {
  const beginYoubiOffset = chunkStartYoubi - beginDate.day()
  const beginStartWeekDate = beginDate.add(beginYoubiOffset, 'day')
  const diffWeeks = lastDate.diff(beginStartWeekDate, 'week')
  console.log('diffWeeks', diffWeeks)

  const weeks: WeekRange[] = []
  for (let index = 0; index <= diffWeeks; index++) {
    const startDt = beginStartWeekDate.add(index, 'week')
    const endDt = beginStartWeekDate.add(index + 1, 'week').add(-1, 'second')
    weeks.push({ from: startDt, to: endDt })
  }
  return weeks
}
