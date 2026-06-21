import { createFileRoute } from '@tanstack/react-router'
import { RolesTab } from '../features/roles/RolesTab'
import { listSearchSchema } from './_listSearchSchema'

export const Route = createFileRoute('/roles')({
  validateSearch: listSearchSchema,
  component: RolesTab,
})
