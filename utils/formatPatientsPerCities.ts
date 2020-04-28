type DataType = {
  リリース日: Date
  国籍: string | null
  住居地: string | null
  '年代・性別': string | null
  備考: string | null
  [key: string]: any
}

type CityDataType = {
  市町村コード: string
  市町村名: string
  人口: number
  検索ワード: string[]
}

type CitySummaryDataType = {
  cityCode: string // 市町村コード
  cityName: string // 市町村名
  patientsTotal: number // 患者数
  patientsPer100k: number // 10万人あたり患者数
  legendIndex: number // 該当凡例
}

type CitySummaryLegendType = {
  range: { min: number; max: number } | number //
  rangeName: string //
  foregroundColor: string //
  backgroundColor: string //
}

export default (
  cityData: CityDataType[],
  data: DataType[],
  legends: CitySummaryLegendType[]
) => {
  const livesToPatientNumMap = data.reduce((pre, cur) => {
    const city = cur['住居地']
    if (city == null) {
      return pre
    }

    const summary = pre.get(city)
    if (summary != null) {
      summary.count++
    } else {
      pre.set(city, {
        name: city,
        count: 1
      })
    }

    return pre
  }, new Map<string, any>())

  // console.debug(livesToPatientNumMap);

  const citySummaryMap = cityData.reduce((pre, city) => {
    const subTotal = city['検索ワード'].reduce((pre, word) => {
      pre += livesToPatientNumMap.get(word)?.count ?? 0
      return pre
    }, 0)

    pre.set(city['市町村コード'], {
      cityCode: city['市町村コード'],
      cityName: city['市町村名'],
      patientsTotal: subTotal,
      patientsPer100k: Math.floor((subTotal / city['人口']) * 1000000) / 10,
      legendIndex: -1
    })

    return pre
  }, new Map<string, CitySummaryDataType>())

  legends.push(
    ...[
      {
        range: 0,
        rangeName: '0人',
        foregroundColor: 'black',
        backgroundColor: 'white'
      },
      {
        range: { min: Number.MIN_SAFE_INTEGER, max: 2 },
        rangeName: '2人未満',
        foregroundColor: 'black',
        backgroundColor: '#c5eddf'
      },
      {
        range: { min: 2.0, max: 8.0 },
        rangeName: '2人以上',
        foregroundColor: 'white',
        backgroundColor: '#8abccf'
      },
      {
        range: { min: 8.0, max: 32.0 },
        rangeName: '8人以上',
        foregroundColor: 'white',
        backgroundColor: '#73a2c6'
      },
      {
        range: { min: 32.0, max: 128.0 },
        rangeName: '32人以上',
        foregroundColor: 'white',
        backgroundColor: '#4771b2'
      },
      {
        range: { min: 128, max: Number.MAX_SAFE_INTEGER },
        rangeName: '128人以上',
        foregroundColor: 'white',
        backgroundColor: '#00429d'
      }
    ]
  )

  Array.from(citySummaryMap.values()).map(summary => {
    const hitIndex = legends.findIndex(legend => {
      const target = summary.patientsPer100k
      if (typeof legend.range === 'number') {
        return legend.range === target
      } else {
        return legend.range.min <= target && target < legend.range.max
      }
    })

    summary.legendIndex = hitIndex

    return summary
  })

  return citySummaryMap
}
