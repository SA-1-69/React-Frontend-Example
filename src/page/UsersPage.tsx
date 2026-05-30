import { useEffect, useState } from 'react'
import { Alert, Stack, Typography } from '@mui/material'
import type { User } from '../api/types'
import { ApiError } from '../api/http'
import { getAllUsers } from '../api/users'
import { ErrorAlert } from '../components/ErrorAlert'
import { UsersTable } from '../components/UsersTable'
import { useAuth } from '../auth/useAuth'

export default function UsersPage() {
  const { token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!token) return
      setError(null)
      setLoading(true)

      try {
        const res = await getAllUsers(token)
        if (!cancelled) setUsers(res)
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError) {
          setError(err.detail ? `${err.message}: ${err.detail}` : err.message)
        } else {
          setError('Failed to load users')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <Stack spacing={2}>
      <Typography variant="h5">All Users</Typography>
      <ErrorAlert message={error} />
      {loading ? <Alert severity="info">Loading…</Alert> : <UsersTable users={users} />}
    </Stack>
  )
}
