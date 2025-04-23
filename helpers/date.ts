export const formatDateInPolish = (date: Date) => {
  const months = [
    'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
  ]
  const day = date.getDate()
  const month = months[date.getMonth()]
  return `${day} ${month}`
} 