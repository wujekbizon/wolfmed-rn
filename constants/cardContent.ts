import { Href } from '@/.expo/types/router'
import { CardContent } from '@/types/dataTypes'

export const cards: CardContent[] = [
  {
    category: 'Testy',
    title: 'Testy Medyczne',
    content: 'Odkryj różnorodne testy medyczne i dowiedz się więcej o ich zastosowaniu.',
    date: '2024-09-18',
    testsLabel: 'testów',
    testsNumber: 587,
    image: require('../assets/images/heart.png'),
    link: '/learn' as Href<string>,
  },
  {
    category: 'Procedury',
    title: 'Procedury Medyczne',
    content: 'Zapoznaj się z różnymi procedurami medycznymi i ich znaczeniem w opiece zdrowotnej.',
    date: '2024-09-18',
    testsLabel: 'procedur',
    testsNumber: 30,
    image: require('../assets/images/syringie.png'),
    link: '/procedures' as Href<string>,
  },
]
