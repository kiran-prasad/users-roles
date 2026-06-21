import { http, HttpResponse, delay } from 'msw'
import { setupServer } from 'msw/node'
import type { Role, User } from '../api/types'

const ROLES: Role[] = [
  {
    id: 'role-eng',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    name: 'Engineering',
    description: 'Builds software',
    isDefault: true,
  },
  {
    id: 'role-design',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    name: 'Design',
    description: 'Designs things',
    isDefault: false,
  },
]

function user(
  id: string,
  first: string,
  last: string,
  roleId: string,
  createdAt = '2024-08-27T23:16:10.554Z',
): User {
  return {
    id,
    createdAt,
    updatedAt: createdAt,
    first,
    last,
    roleId,
    photo: `https://i.pravatar.cc/40?img=${id}`,
  }
}

let users: User[] = [
  user('u-mark', 'Mark', 'Tipton', 'role-design', '2024-08-27T23:16:10.554Z'),
  user('u-lareina', 'Lareina', 'Cline', 'role-eng', '2024-08-22T23:16:10.554Z'),
  user('u-terry', 'Terry', 'Graf', 'role-eng', '2024-07-29T23:16:10.554Z'),
]
let roles: Role[] = [...ROLES]

interface FailOnce {
  next: boolean
}
export const failNext: FailOnce = { next: false }

function paged<T>(list: T[], page: number, pageSize = 10) {
  const pages = Math.max(1, Math.ceil(list.length / pageSize))
  const data = list.slice((page - 1) * pageSize, page * pageSize)
  return {
    data,
    next: page < pages ? page + 1 : null,
    prev: page > 1 ? page - 1 : null,
    pages,
  }
}

function maybeFail(): Response | null {
  if (failNext.next) {
    failNext.next = false
    return HttpResponse.json({ message: 'Server Error' }, { status: 500 })
  }
  return null
}

export const handlers = [
  http.get('http://localhost:3002/users', async ({ request }) => {
    await delay(20)
    const fail = maybeFail()
    if (fail) return fail
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const search = (url.searchParams.get('search') ?? '').toLowerCase()
    const filtered = search
      ? users.filter(
          (u) => u.first.toLowerCase().includes(search) || u.last.toLowerCase().includes(search),
        )
      : users
    return HttpResponse.json(paged(filtered, page))
  }),

  http.patch('http://localhost:3002/users/:id', async ({ request, params }) => {
    await delay(20)
    const fail = maybeFail()
    if (fail) return fail
    const id = String(params.id)
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    const body = (await request.json()) as Partial<User>
    users[idx] = { ...users[idx], ...body, updatedAt: new Date().toISOString() }
    return HttpResponse.json(users[idx])
  }),

  http.delete('http://localhost:3002/users/:id', async ({ params }) => {
    await delay(20)
    const fail = maybeFail()
    if (fail) return fail
    const id = String(params.id)
    const target = users.find((u) => u.id === id)
    if (!target) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    users = users.filter((u) => u.id !== id)
    return HttpResponse.json(target)
  }),

  http.get('http://localhost:3002/roles', async ({ request }) => {
    await delay(20)
    const fail = maybeFail()
    if (fail) return fail
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const search = (url.searchParams.get('search') ?? '').toLowerCase()
    const filtered = search
      ? roles.filter(
          (r) =>
            r.name.toLowerCase().includes(search) ||
            (r.description ?? '').toLowerCase().includes(search),
        )
      : roles
    return HttpResponse.json(paged(filtered, page))
  }),

  http.patch('http://localhost:3002/roles/:id', async ({ request, params }) => {
    await delay(20)
    const fail = maybeFail()
    if (fail) return fail
    const id = String(params.id)
    const idx = roles.findIndex((r) => r.id === id)
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    const body = (await request.json()) as { name?: string; description?: string }
    if (body.name && roles.some((r) => r.id !== id && r.name === body.name)) {
      return HttpResponse.json(
        { message: 'Role with given name already exists' },
        { status: 400 },
      )
    }
    roles[idx] = { ...roles[idx], ...body, updatedAt: new Date().toISOString() }
    return HttpResponse.json(roles[idx])
  }),
]

export const server = setupServer(...handlers)

// Reset helpers for tests
export function resetData() {
  users = [
    user('u-mark', 'Mark', 'Tipton', 'role-design', '2024-08-27T23:16:10.554Z'),
    user('u-lareina', 'Lareina', 'Cline', 'role-eng', '2024-08-22T23:16:10.554Z'),
    user('u-terry', 'Terry', 'Graf', 'role-eng', '2024-07-29T23:16:10.554Z'),
  ]
  roles = [...ROLES]
  failNext.next = false
}
