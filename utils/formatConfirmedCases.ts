interface History {
  更新日時: string
  検査実施人数: number
  陽性患者数: number
  入院中: number
  軽症中等症: number
  重症: number
  施設入所: number
  退院: number
  転院: number
  死亡: number
  備考: string
}

type DataType = {
  date: string
  data: History[]
}

export default (data: DataType) => {
  const length = data.data.length
  const latest = data.data[length - 1]
  return latest
}
