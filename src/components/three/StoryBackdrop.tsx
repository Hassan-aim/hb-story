import type { FC } from 'react'
import { storyChapters } from '../../data/story'
import type { EnvironmentName } from '../../data/story'
import { CampusBackdrop } from './backdrops/Campus'
import { PhoneBackdrop } from './backdrops/Phone'
import { RainNightBackdrop } from './backdrops/RainNight'
import { MontageBackdrop } from './backdrops/Montage'
import { SunsetSeaBackdrop } from './backdrops/SunsetSea'
import { WarmRoomBackdrop } from './backdrops/WarmRoom'
import { PromiseHillBackdrop } from './backdrops/PromiseHill'
import { DistanceBackdrop } from './backdrops/Distance'

const ENVIRONMENTS: Record<EnvironmentName, FC> = {
  campus: CampusBackdrop,
  phone: PhoneBackdrop,
  rain: RainNightBackdrop,
  montage: MontageBackdrop,
  sunset: SunsetSeaBackdrop,
  together: WarmRoomBackdrop,
  promise: PromiseHillBackdrop,
  distance: DistanceBackdrop,
  universe: UniverseFallback,
}

function UniverseFallback(): null {
  return null
}

export function StoryBackdrop({ chapter }: { chapter: number }) {
  const item = storyChapters.find((c) => c.id === chapter) ?? storyChapters[0]
  const Env = ENVIRONMENTS[item.env]
  return (
    <group key={`chapter-${item.id}`}>
      <Env />
    </group>
  )
}