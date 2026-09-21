import { useEffect } from 'react'
import { useExperience } from '../../state/experience'
import { storyChapters } from '../../data/story'
import { chapterCameras, ENDING_CAMERA, INTRO_CAMERA, PORTAL_CAMERA, THROUGH_PORTAL_CAMERA } from '../../data/cameras'
import { ambienceFor, themeFor } from '../../story/config'
import { audio } from '../../audio/AudioManager'
import { flyTo, cameraShake } from '../../three/cameraController'
import { bus } from '../../utils/bus'

function flash(level: 'explosion' | 'soft' | 'portal') {
  bus.emit('flash', level)
}

/* Burns the cinematic sequence: audio, camera, ambience per phase/chapter. */
export function SequenceDirector() {
  const { state, dispatch, isReducedMotion } = useExperience()
  const { phase, chapter } = state

  /* title → slow dolly into the universe */
  useEffect(() => {
    if (phase === 'title' && state.started) {
      flyTo({ position: [0, 0.2, 6.6], target: [0, 0, 0], fov: 55 }, 7, 'power2.out')
    }
  }, [phase, state.started])

  /* intro → home in on the beating heart */
  useEffect(() => {
    if (phase === 'intro') {
      flyTo(INTRO_CAMERA, 3.2, 'power2.inOut')
    }
  }, [phase])

  /* transform */
  useEffect(() => {
    if (phase === 'hbTransform') {
      audio.whoosh()
      audio.setTheme('love')
    }
  }, [phase])

  /* crystal heart */
  useEffect(() => {
    if (phase === 'hb') {
      audio.setTheme('love')
      flash('soft')
    }
  }, [phase])

  /* explosion */
  useEffect(() => {
    if (phase !== 'explosion') return
    audio.boom()
    flash('explosion')
    if (!isReducedMotion) cameraShake(0.75)
    const t = window.setTimeout(() => dispatch({ type: 'PORTAL_ENTER' }), 3400)
    return () => clearTimeout(t)
  }, [phase, dispatch, isReducedMotion])

  /* portal → story */
  useEffect(() => {
    if (phase !== 'portal') return
    audio.whoosh()
    audio.setTheme('love')
    flyTo(PORTAL_CAMERA.pose, PORTAL_CAMERA.duration, 'power2.inOut')
    const t1 = window.setTimeout(() => flyTo(THROUGH_PORTAL_CAMERA, 2.6, 'power2.in'), 2300)
    const t2 = window.setTimeout(() => {
      flash('portal')
      dispatch({ type: 'ENTER_STORY' })
    }, 4500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [phase, dispatch])

  /* chapters */
  useEffect(() => {
    if (phase !== 'story') return
    const item = storyChapters.find((c) => c.id === chapter) ?? storyChapters[0]
    audio.setAmbience(ambienceFor(item.env))
    audio.setTheme(themeFor(item.env))
    audio.fadeInMusic(2)
    const cam = chapterCameras[chapter]
    if (cam) flyTo(cam.pose, cam.duration, 'power2.inOut')
  }, [phase, chapter])

  /* ending */
  useEffect(() => {
    if (phase !== 'ending') return
    audio.setTheme('hope')
    audio.setAmbience('none')
    audio.chime(0.6)
    flyTo(ENDING_CAMERA.pose, ENDING_CAMERA.duration, 'power3.inOut')
  }, [phase])

  return null
}