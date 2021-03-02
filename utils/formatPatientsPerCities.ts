import dayjs from 'dayjs'
import Enumerable, { IGrouping } from 'linq'
import { PatientsSummaryDaily } from './types'
import { makeWeekRanges, WeekRange } from './weeklizer'

type DataType = {
  発表日: string
  国籍: string | null
  住居地: string | null
  '年代・性別': string | null
  備考: string | null
  [key: string]: any
}

export type WeekCityPatientDataType = {
  開始日: string
  終了日: string
  市区村コード: string
  感染者数: number | null
}

export type CityDataType = {
  市町村コード: string
  市町村名: string
  人口: number
}

export const makeCityDataMap = (
  cityData: CityDataType[]
): Map<string, CityDataType> => {
  return cityData.reduce((map, city) => {
    map.set(city['市町村コード'], city)
    return map
  }, new Map<string, CityDataType>())
}

export const formatPatientsPerCitiesWeekly = (
  patientsSummary: PatientsSummaryDaily[]
): {
  weekRange: WeekRange
  cityNumMap: Map<string, WeekCityPatientDataType>
}[] => {
  const weekRanges = makeWeekRanges(
    dayjs(patientsSummary[0]['日付']),
    dayjs(patientsSummary.slice(-1)[0]['日付']),
    1
  )

  // 開始日、終了日の調整
  if (weekRanges.length > 0 && patientsSummary.length > 0) {
    weekRanges[0].from = dayjs(patientsSummary[0]['日付'])
    weekRanges[weekRanges.length - 1].to = dayjs(
      patientsSummary.slice(-1)[0]['日付']
    )
  }

  const containsWeek = (x: string) => {
    const d = dayjs(x)
    return weekRanges.find(r => r.from <= d && d <= r.to)
  }

  const weekCityPatientsMap = Enumerable.from(patientsSummary)
    .selectMany(row => {
      const wr = containsWeek(row['日付'])

      const places = row['住居地']
      if (places == null) {
        return []
      }
      const arr: WeekCityPatientDataType[] = []
      Object.keys(places).forEach(key => {
        const num = places[key]

        arr.push({
          開始日: wr?.from?.format('YYYY/MM/DD') ?? null,
          終了日: wr?.to?.format('YYYY/MM/DD') ?? null,
          市区村コード: key,
          感染者数: num
        } as WeekCityPatientDataType)
      })

      return arr
    })
    .groupBy(x => containsWeek(x.開始日))
    .where(x => x.key() != null)
    .cast<IGrouping<WeekRange, WeekCityPatientDataType>>()
    .select(x => ({ k: x.key(), data: Enumerable.from(x.getSource()) }))
    .select(grpOfWeek => {
      const grpOfCity = grpOfWeek.data
        .groupBy(x => x['市区村コード'])
        .select(sub => {
          const values = sub.getSource()
          if (values?.length === 0) {
            return null
          }

          const cloned = Object.assign({}, values[0])
          cloned['感染者数'] = Enumerable.from(values)
            .select(x => x['感染者数'] ?? 0)
            .sum()
          return cloned
        })
        .where(x => x != null)
        .cast<WeekCityPatientDataType>()

      const arr = grpOfCity
        .select(
          x => [x['市区村コード'], x] as [string, WeekCityPatientDataType]
        )
        .toArray()
      const cityNumMap = new Map<string, WeekCityPatientDataType>(arr)
      return { weekRange: grpOfWeek.k, cityNumMap }
    })

  const unioned = weekCityPatientsMap
    .union(
      Enumerable.from(weekRanges).select(w => ({
        weekRange: w,
        cityNumMap: new Map<string, WeekCityPatientDataType>()
      })),
      u => u.weekRange
    )
    .orderBy(x => x.weekRange.from)

  return unioned.toArray()
}
