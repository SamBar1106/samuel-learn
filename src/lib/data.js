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

export function loomModulesInOrder(loom = content.loom) {
  return loom?.modules ?? []
}

export function loomIndexMeta(loom = content.loom) {
  return {
    id: loom.id,
    titleKey: loom.titleKey,
    introKey: loom.introKey,
    soonKey: loom.soonKey,
  }
}

function pushKey(keys, key) {
  if (typeof key === 'string' && key !== '') keys.push(key)
}

export function contentTranslationKeys(source = content) {
  const keys = []
  for (const page of source.pages ?? []) {
    pushKey(keys, page.textKey)
    pushKey(keys, page.titleKey)
    pushKey(keys, page.sourceKey)
    for (const key of page.sectionKeys ?? []) pushKey(keys, key)
  }
  const loom = source.loom
  if (loom) {
    pushKey(keys, loom.titleKey)
    pushKey(keys, loom.introKey)
    pushKey(keys, loom.soonKey)
    for (const module of loom.modules ?? []) pushKey(keys, module.titleKey)
  }
  return keys
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

function loomMethods(loom, source) {
  return {
    async getLoomIndex() {
      return { ...loomIndexMeta(loom), source }
    },
    async listLoomModules() {
      return loomModulesInOrder(loom).map((module) => ({ ...module, source }))
    },
  }
}

function createLocalAdapter(pages, loom) {
  return {
    kind: 'local',
    async getPage(id) {
      return readPage(pages, id, 'local')
    },
    ...lessonMethods(pages, 'local'),
    ...loomMethods(loom, 'local'),
  }
}

function createSupabaseAdapter(pages, loom, { url, anonKey }) {
  const lessons = lessonMethods(pages, 'supabase')
  const loomIndex = loomMethods(loom, 'supabase')
  return {
    kind: 'supabase',
    async getPage(id) {
      if (!url || !anonKey) throw new Error('Supabase adapter is missing configuration')
      // Stub: both env vars select this adapter, but it does not call Supabase yet.
      return readPage(pages, id, 'supabase')
    },
    async getLesson(slug) {
      if (!url || !anonKey) throw new Error('Supabase adapter is missing configuration')
      return lessons.getLesson(slug)
    },
    async listLessons() {
      if (!url || !anonKey) throw new Error('Supabase adapter is missing configuration')
      return lessons.listLessons()
    },
    async getLoomIndex() {
      if (!url || !anonKey) throw new Error('Supabase adapter is missing configuration')
      return loomIndex.getLoomIndex()
    },
    async listLoomModules() {
      if (!url || !anonKey) throw new Error('Supabase adapter is missing configuration')
      return loomIndex.listLoomModules()
    },
  }
}

function configured(value) {
  return typeof value === 'string' && value.trim() !== ''
}

export function chooseAdapter(env = {}, pages = content.pages, loom = content.loom) {
  const url = configured(env.VITE_SUPABASE_URL) ? env.VITE_SUPABASE_URL.trim() : ''
  const anonKey = configured(env.VITE_SUPABASE_ANON_KEY) ? env.VITE_SUPABASE_ANON_KEY.trim() : ''
  if (url && anonKey) return createSupabaseAdapter(pages, loom, { url, anonKey })
  return createLocalAdapter(pages, loom)
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
