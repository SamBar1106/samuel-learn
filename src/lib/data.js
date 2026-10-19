import content from '../data/content.json' with { type: 'json' }

function readPage(pages, id, source) {
  const page = pages.find((item) => item.id === id)
  if (!page) throw new Error(`Unknown page: ${id}`)
  return { ...page, source }
}

function listAreas(areas, source) {
  return areas.map((area) => ({ ...area, source }))
}

function createLocalAdapter(pages, areas) {
  return {
    kind: 'local',
    async getPage(id) {
      return readPage(pages, id, 'local')
    },
    async listAreas() {
      return listAreas(areas, 'local')
    },
  }
}

function createSupabaseAdapter(pages, areas, { url, anonKey }) {
  return {
    kind: 'supabase',
    async getPage(id) {
      if (!url || !anonKey) throw new Error('Supabase adapter is missing configuration')
      // Stub: both env vars select this adapter, but it does not call Supabase yet.
      return readPage(pages, id, 'supabase')
    },
    async listAreas() {
      if (!url || !anonKey) throw new Error('Supabase adapter is missing configuration')
      return listAreas(areas, 'supabase')
    },
  }
}

function configured(value) {
  return typeof value === 'string' && value.trim() !== ''
}

export function chooseAdapter(env = {}, pages = content.pages, areas = content.areas) {
  const url = configured(env.VITE_SUPABASE_URL) ? env.VITE_SUPABASE_URL.trim() : ''
  const anonKey = configured(env.VITE_SUPABASE_ANON_KEY) ? env.VITE_SUPABASE_ANON_KEY.trim() : ''
  if (url && anonKey) return createSupabaseAdapter(pages, areas, { url, anonKey })
  return createLocalAdapter(pages, areas)
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
