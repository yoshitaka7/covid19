import dayjs from 'dayjs'
import Enumerable, { IGrouping } from 'linq'
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
  住居地: string
  感染者数: number | null
}

export type CityDataType = {
  市町村コード: string
  市町村名: string
  人口: number
  検索ワード: string[]
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
  data: DataType[]
): {
  weekRange: WeekRange
  cityNumMap: Map<string, WeekCityPatientDataType>
}[] => {
  const weekRanges = makeWeekRanges(
    dayjs(data[0]['発表日']),
    dayjs(data[data.length - 1]['発表日']),
    1
  )

  const containsWeek = (x: string) => {
    const d = dayjs(x)
    return weekRanges.find(r => r.from <= d && d <= r.to)
  }

  const weekCityPatientsMap = Enumerable.from(data)
    .select(x => {
      const wr = containsWeek(x['発表日'])
      return {
        開始日: wr?.from?.format('YYYY/MM/DD') ?? null,
        終了日: wr?.to?.format('YYYY/MM/DD') ?? null,
        住居地: x['住居地'],
        感染者数: null
      } as WeekCityPatientDataType
    })
    .groupBy(x => containsWeek(x.開始日))
    .where(x => x.key() != null)
    .cast<IGrouping<WeekRange, WeekCityPatientDataType>>()
    .select(x => ({ k: x.key(), data: Enumerable.from(x.getSource()) }))
    .select(grpOfWeek => {
      const grpOfCity = grpOfWeek.data
        .groupBy(x => x['住居地'])
        .select(sub => {
          const values = sub.getSource()
          if (values?.length === 0) {
            return null
          }

          const cloned = Object.assign({}, values[0])
          cloned['感染者数'] = values.length
          return cloned
        })
        .where(x => x != null)
        .cast<WeekCityPatientDataType>()

      const arr = grpOfCity
        .select(x => [x['住居地'], x] as [string, WeekCityPatientDataType])
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
