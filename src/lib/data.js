import content from '../data/content.json' with { type: 'json' }

function readPage(pages, id, source) {
  const page = pages.find((item) => item.id === id)
  if (!page) throw new Error(`Unknown page: ${id}`)
  return { ...page, source }
}

export function lessonsInOrder(pages = content.pages) {
  return pages.filter((page) => typeof page.slug === 'string' && page.slug !== '')
}

export function lessonAt(slug, pages = content.pages) {
  const lessons = lessonsInOrder(pages)
  const index = lessons.findIndex((page) => page.slug === slug)
  if (index === -1) return null
  const previous = lessons[index - 1]
  const next = lessons[index + 1]
  return {
    ...lessons[index],
    previousSlug: previous?.slug ?? null,
    previousTitleKey: previous?.titleKey ?? null,
    nextSlug: next?.slug ?? null,
    nextTitleKey: next?.titleKey ?? null,
  }
}

function lessonMethods(pages, source) {
  return {
    async getLesson(slug) {
      const lesson = lessonAt(slug, pages)
      if (!lesson) throw new Error(`Unknown lesson: ${slug}`)
      return { ...lesson, source }
    },
    async listLessons() {
      return lessonsInOrder(pages).map((page) => ({ ...page, source }))
    },
  }
}

function createLocalAdapter(pages) {
  return {
    kind: 'local',
    async getPage(id) {
      return readPage(pages, id, 'local')
    },
    ...lessonMethods(pages, 'local'),
  }
}

function createSupabaseAdapter(pages, { url, anonKey }) {
  return {
    kind: 'supabase',
    async getPage(id) {
      if (!url || !anonKey) throw new Error('Supabase adapter is missing configuration')
      // Stub: both env vars select this adapter, but it does not call Supabase yet.
      return readPage(pages, id, 'supabase')
    },
    async getLesson(slug) {
      if (!url || !anonKey) throw new Error('Supabase adapter is missing configuration')
      return lessonMethods(pages, 'supabase').getLesson(slug)
    },
    async listLessons() {
      if (!url || !anonKey) throw new Error('Supabase adapter is missing configuration')
      return lessonMethods(pages, 'supabase').listLessons()
    },
  }
}

function configured(value) {
  return typeof value === 'string' && value.trim() !== ''
}

export function chooseAdapter(env = {}, pages = content.pages) {
  const url = configured(env.VITE_SUPABASE_URL) ? env.VITE_SUPABASE_URL.trim() : ''
  const anonKey = configured(env.VITE_SUPABASE_ANON_KEY) ? env.VITE_SUPABASE_ANON_KEY.trim() : ''
  if (url && anonKey) return createSupabaseAdapter(pages, { url, anonKey })
  return createLocalAdapter(pages)
}

function clientEnv() {
  try {
    return {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    }
  } catch {
    return {}
  }
}

export const data = chooseAdapter(clientEnv())
