import type { EnvironmentName } from '../data/story'
import type { AmbienceKind } from '../audio/AudioManager'

const AMBIENCE: Record<EnvironmentName, AmbienceKind> = {
  campus: 'birds',
  phone: 'night',
  rain: 'rain',
  montage: 'warm',
  sunset: 'wind',
  together: 'warm',
  promise: 'wind',
  distance: 'night',
  universe: 'night',
}

const THEME: Record<EnvironmentName, 'wonder' | 'night' | 'love' | 'hope'> = {
  campus: 'hope',
  phone: 'night',
  rain: 'night',
  montage: 'love',
  sunset: 'hope',
  together: 'love',
  promise: 'love',
  distance: 'night',
  universe: 'hope',
}

export function ambienceFor(env: EnvironmentName): AmbienceKind {
  return AMBIENCE[env]
}

export function themeFor(env: EnvironmentName): 'wonder' | 'night' | 'love' | 'hope' {
  return THEME[env]
}