import { useEffect, useState } from 'react'
import content from '../data/content.json' with { type: 'json' }
import { data } from './data'

const lessonSeed = content.pages.find((page) => page.id === 'lesson-component-etymology')

export function useLessonPage() {
  const [page, setPage] = useState({ ...lessonSeed, source: data.kind })

  useEffect(() => {
    let active = true
    data.getPage('lesson-component-etymology').then(
      (result) => {
        if (active) setPage(result)
      },
      () => {
        if (active) setPage({ ...lessonSeed, source: data.kind })
      },
    )
    return () => {
      active = false
    }
  }, [])

  return page
}

export function useAreas() {
  const [areas, setAreas] = useState(content.areas.map((area) => ({ ...area, source: data.kind })))

  useEffect(() => {
    let active = true
    data.listAreas().then(
      (result) => {
        if (active) setAreas(result)
      },
      () => {
        if (active) setAreas(content.areas.map((area) => ({ ...area, source: data.kind })))
      },
    )
    return () => {
      active = false
    }
  }, [])

  return areas
}
