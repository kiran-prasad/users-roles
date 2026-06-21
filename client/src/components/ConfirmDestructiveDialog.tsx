import type { ReactNode } from 'react'
import { AlertDialog, Button, Flex } from '@radix-ui/themes'

interface Props {
  open: boolean
  isPending: boolean
  title: string
  description: ReactNode
  confirmLabel: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/**
 * Shared destructive-confirmation AlertDialog (Delete user / Delete role).
 * Geometry matches Figma node 3:3455 (520px max width, 12px radius).
 */
export function ConfirmDestructiveDialog({
  open,
  isPending,
  title,
  description,
  confirmLabel,
  onOpenChange,
  onConfirm,
}: Props) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content size="2" maxWidth="520px" style={{ borderRadius: 12 }}>
        <AlertDialog.Title>{title}</AlertDialog.Title>
        <AlertDialog.Description size="2">{description}</AlertDialog.Description>
        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="outline" color="gray" autoFocus>
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <Button
            variant="surface"
            color="red"
            onClick={onConfirm}
            disabled={isPending}
            loading={isPending}
          >
            {confirmLabel}
          </Button>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}
