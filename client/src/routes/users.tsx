import { createFileRoute } from '@tanstack/react-router'
import { UsersTab } from '../features/users/UsersTab'
import { listSearchSchema } from './_listSearchSchema'

export const Route = createFileRoute('/users')({
  validateSearch: listSearchSchema,
  component: UsersTab,
})
