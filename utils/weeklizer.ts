import dayjs, { Dayjs } from 'dayjs'
import {
  PatientsSummaryDaily,
  DataWeekly,
  PatientsSummaryWeekly,
  InspectionsSummaryDaily,
  InspectionsSummaryWeekly
} from '../utils/types'

type WeekRange = {
  from: Dayjs
  to: Dayjs
}

type WeeklizedPatientsSummary = {
  from: Dayjs
  to: Dayjs
  data: PatientsSummaryDaily[]
}

type WeeklizedInspectionsSummary = {
  from: Dayjs
  to: Dayjs
  data: InspectionsSummaryDaily[]
}

export default (Data: any): DataWeekly => {
  const chunkStartYoubi = 1 // 0:日曜日、1:月曜日…

  const patientsSummaryWeekly = weeklizePatientsSummary(
    Data.patients_summary.data as PatientsSummaryDaily[],
    chunkStartYoubi
  )

  const inspectionsSummaryWeekly = weeklizeInspectionsSummary(
    Data.inspections_summary.data as InspectionsSummaryDaily[],
    chunkStartYoubi
  )

  return {
    patients_summary: {
      date: Data.patients_summary.date,
      data: patientsSummaryWeekly
    },
    inspections_summary: {
      date: Data.inspections_summary.date,
      data: inspectionsSummaryWeekly
    }
  } as DataWeekly
}

const weeklizePatientsSummary = (
  patientsSummaryDaily: PatientsSummaryDaily[],
  chunkStartYoubi: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
): PatientsSummaryWeekly[] => {
  const beginDate = dayjs(patientsSummaryDaily[0]['日付']) // dayjs('2020-01-25')
  const lastDate = dayjs(
    patientsSummaryDaily[patientsSummaryDaily.length - 1]['日付']
  ) // dayjs('2020-05-04')

  const weekRanges = makeWeekRanges(beginDate, lastDate, chunkStartYoubi)

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

  const patientsSummaryWeekly = weeklizedPatientsSummaries.map(week => {
    const sum = week.data.reduce((pre, x) => pre + Number(x['小計']), 0)

    return {
      開始日: week.from.format('YYYY-MM-DD'),
      終了日: week.to.format('YYYY-MM-DD'),
      小計: sum
    } as PatientsSummaryWeekly
  })

  // 開始日、終了日の調整
  patientsSummaryWeekly[0]['開始日'] = '2020-01-30' // 初回データは 1月30日（木曜日）～3月1日（日曜日） の合算
  patientsSummaryWeekly[patientsSummaryWeekly.length - 1]['終了日'] =
    patientsSummaryDaily[patientsSummaryDaily.length - 1]['日付']

  return patientsSummaryWeekly
}

const weeklizeInspectionsSummary = (
  inspectionsSummaryDaily: InspectionsSummaryDaily[],
  chunkStartYoubi: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
): PatientsSummaryWeekly[] => {
  const firstData = inspectionsSummaryDaily[0]
  let beginDate = dayjs(firstData['日付']) // dayjs('2020-01-25')
  if (firstData['合算']) {
    beginDate = beginDate.add(-7, 'day')
  }
  const lastDate = dayjs(
    inspectionsSummaryDaily[inspectionsSummaryDaily.length - 1]['日付']
  ) // dayjs('2020-05-04')

  const weekRanges = makeWeekRanges(beginDate, lastDate, chunkStartYoubi)

  const weeklizedInspectionsSummaries: WeeklizedInspectionsSummary[] = weekRanges.map(
    x => ({ from: x.from, to: x.to, data: [] })
  )

  for (const cur of inspectionsSummaryDaily) {
    const dt = dayjs(cur['日付'])
    const foundIndex = weeklizedInspectionsSummaries.findIndex(
      x => x.from <= dt && dt < x.to
    )

    if (foundIndex >= 0) {
      weeklizedInspectionsSummaries[foundIndex].data.push(cur)
    }
  }

  const inspectionsSummaryWeekly = weeklizedInspectionsSummaries.map(week => {
    const sum = week.data.reduce((pre, x) => pre + Number(x['小計']), 0)

    return {
      開始日: week.from.format('YYYY-MM-DD'),
      終了日: week.to.format('YYYY-MM-DD'),
      小計: sum
    } as InspectionsSummaryWeekly
  })

  // 開始日、終了日の調整
  inspectionsSummaryWeekly[0]['開始日'] = inspectionsSummaryDaily[0]['日付']
  inspectionsSummaryWeekly[inspectionsSummaryWeekly.length - 1]['終了日'] =
    inspectionsSummaryDaily[inspectionsSummaryDaily.length - 1]['日付']

  return inspectionsSummaryWeekly
}

const makeWeekRanges = (
  beginDate: Dayjs,
  lastDate: Dayjs,
  chunkStartYoubi: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
): WeekRange[] => {
  const beginYoubiOffset = chunkStartYoubi - beginDate.day()
  const beginStartWeekDate = beginDate.add(beginYoubiOffset, 'day')
  const diffWeeks = lastDate.diff(beginStartWeekDate, 'week')

  const weeks: WeekRange[] = []
  for (let index = 0; index <= diffWeeks; index++) {
    const startDt = beginStartWeekDate.add(index, 'week')
    const endDt = beginStartWeekDate.add(index + 1, 'week').add(-1, 'second')
    weeks.push({ from: startDt, to: endDt })
  }
  return weeks
}
