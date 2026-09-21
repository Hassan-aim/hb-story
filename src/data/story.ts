export type EnvironmentName =
  | 'campus' // Hyderabad training campus · golden afternoon
  | 'phone' // night · floating phone
  | 'rain' // proposal night
  | 'montage' // silent love montage
  | 'sunset' // acceptance · sunset sea
  | 'together' // warm togetherness
  | 'promise' // sunset hill · silhouettes
  | 'distance' // split-screen long distance
  | 'universe' // cinematic night sky

export interface StoryChapter {
  id: number
  key: string
  title: string
  kicker: string // small label shown above the title
  env: EnvironmentName
  lines: string[]
}

export const storyChapters: StoryChapter[] = [
  {
    id: 1,
    key: 'first-glance',
    title: 'The First Glance',
    kicker: 'Chapter One',
    env: 'campus',
    lines: [
      'It began on a golden afternoon at a training campus in Hyderabad.',
      'Hassan stood by the window, drinking water, lost in a world of his own.',
      'And then he looked outside — and the whole world seemed to slow down.',
      'She was there. Laughing. Taking pictures. Surrounded by flowers and butterflies.',
      'In that single glance, a story quietly began.',
      'Neither of them knew it yet. But somewhere, the universe had already started writing.',
    ],
  },
  {
    id: 2,
    key: 'instagram-request',
    title: 'Instagram Request',
    kicker: 'Chapter Two',
    env: 'phone',
    lines: [
      'That evening, a small glow changed everything.',
      'N. Sai Bhargavi sent you a follow request.',
      'One tap. One conversation. And something neither of them could explain.',
      'Late-night messages. Stickers. Laughter. The screen became a tiny universe of its own.',
      'They talked like they had known each other for years.',
    ],
  },
  {
    id: 3,
    key: 'proposal',
    title: 'The Proposal',
    kicker: 'Chapter Three',
    env: 'rain',
    lines: [
      'The night was raining — and so was his heart.',
      'With a trembling hand, he typed three words.',
      'I love you.',
      'Painful pause. A breath that lasted forever...',
      "I'm sorry...",
      'The rain kept falling. And love, somehow, went quiet.',
      'But even silence can speak.',
    ],
  },
  {
    id: 4,
    key: 'silent-love',
    title: 'Silent Love',
    kicker: 'Chapter Four',
    env: 'montage',
    lines: [
      'Some love stories are loud. This one stayed quiet.',
      'Good morning messages.',
      'Late-night conversations.',
      'Missed calls. Inside jokes. Unspoken feelings.',
      'Every small moment was a page in a diary nobody else could read.',
      'In silence, their love grew roots.',
    ],
  },
  {
    id: 5,
    key: 'acceptance',
    title: 'Acceptance',
    kicker: 'Chapter Five',
    env: 'sunset',
    lines: [
      'Then, on an ordinary evening, the sky turned golden.',
      'One message. Simple. Brave.',
      'Hassan...',
      'I Love You.',
      'And just like that — the heartbeats began.',
      'The sun gave way to a sky full of stars, celebrating a love finally spoken aloud.',
    ],
  },
  {
    id: 6,
    key: 'together',
    title: 'Together',
    kicker: 'Chapter Six',
    env: 'together',
    lines: [
      'After that, everything felt warmer.',
      'Studying together. Dreaming together.',
      'Coffee cups. Shared projects. Long walks through the rain.',
      'Homework somehow became beautiful.',
      'They were building something — a "together" that felt like home.',
    ],
  },
  {
    id: 7,
    key: 'promise',
    title: 'The Promise',
    kicker: 'Chapter Seven',
    env: 'promise',
    lines: [
      'On a sunset hill, beneath golden clouds...',
      'Two silhouettes, holding hands against the wind.',
      'They made a promise.',
      'No matter where life takes us...',
      "We'll always choose each other.",
    ],
  },
  {
    id: 8,
    key: 'long-distance',
    title: 'Long Distance',
    kicker: 'Beyond the Chapters',
    env: 'distance',
    lines: [
      'Six months later, life carried them to different places.',
      'Two cities. Two schedules. Two dreams.',
      'Their love became long distance.',
      'But distance never stopped their story.',
      'Midnight calls. Good-night messages. Study sessions side by side, miles apart.',
      'They kept pursuing their dreams — growing together, building something healthy across the miles.',
    ],
  },
]

export const distanceLines = [
  'Mutual support.',
  'Education. Growth.',
  'Honest communication.',
  'A love that lifts both.',
]

export interface StoryIdiom {
  title: string
  narration: string[]
}

export const endingStory: StoryIdiom = {
  title: 'To Be Continued...',
  narration: [
    'Every love story has its distances, its quiet pages, and its golden hours.',
    'This one is still being written.',
  ],
}

export const replayLine = 'Forever Starts Here ❤️'

// Names used through the experience — keep spellings canonical.
export const NAMES = {
  his: 'Hassan',
  hers: 'Bhagi',
  full: 'N. Sai Bhargavi',
  logo: 'HB',
} as const

export const introNarration = 'Every love story begins with a single heartbeat...'
export const hbInstruction = 'Click my heart ❤️'
export const storyTitle = 'Our Love Story'

export const titles = {
  video: 'Hassan ❤️ Bhagi',
}