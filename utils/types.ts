export type PatientsSummaryDaily = {
  日付: string
  小計: number
  合算?: string
  平均?: number
}

export type PatientsSummaryWeekly = {
  開始日: string
  終了日: string
  小計: number
  合算?: string
}

export type DataDaily = {
  // eslint-disable-next-line camelcase
  patients_summary: {
    date: string
    data: PatientsSummaryDaily[]
  }
}

export type InspectionsSummaryDaily = {
  日付: string
  小計: number
  合算?: string
}

export type InspectionsSummaryWeekly = {
  開始日: string
  終了日: string
  小計: number
  合算?: string
}

export type DataWeekly = {
  // eslint-disable-next-line camelcase
  patients_summary: {
    date: string
    data: PatientsSummaryWeekly[]
  }
  // eslint-disable-next-line camelcase
  inspections_summary: {
    date: string
    data: InspectionsSummaryWeekly[]
  }
}

export type MainSummaryDataType = {
  更新日時: string
  検査実施人数: number
  陽性患者数: number
  入院中: number
  軽症中等症: number
  重症: number
  転院: number
  施設入所: number
  死亡: number
  退院: number
}
