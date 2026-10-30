export const formatYears = (years: number, abbreviated = false): string => {
  const unit =
    years === 1 ? (abbreviated ? 'yr' : 'year') : abbreviated ? 'yrs' : 'years'

  return `${years} ${unit}`
}
