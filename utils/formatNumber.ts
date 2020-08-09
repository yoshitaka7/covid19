export const formatNumber = (x: number | undefined, digits: number = 1) => {
  if (x === undefined) {
    return ''
  }

  const per = 10 ** digits
  return Number(Math.round(x * per) / per).toLocaleString()
}
