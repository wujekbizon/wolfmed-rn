const MOTTOS = [
  'Każdy dzień to nowa szansa na naukę.',
  'Wiedza to klucz do sukcesu.',
  'Małymi krokami do wielkich celów.',
  'Nauka to najlepsza inwestycja.',
  'Dziś lepszy niż wczoraj.',
  'Medycyna to powołanie, nie zawód.',
  'Pomagam innym, rozwijam siebie.',
  'Systematyczność to podstawa sukcesu.',
  'Wiem więcej niż wczoraj, mniej niż jutro.',
  'Pacjent jest na pierwszym miejscu.',
]

export const generateRandomUsername = (): string =>
  'User-' + Math.random().toString(36).slice(2, 10)

export const generateRandomMotto = (): string =>
  MOTTOS[Math.floor(Math.random() * MOTTOS.length)]
