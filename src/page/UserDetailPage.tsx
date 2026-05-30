import { useEffect, useState } from 'react'
import { Alert, Card, CardContent, Link, Stack, Typography } from '@mui/material'
import { Link as RouterLink, useParams } from 'react-router-dom'
import type { User } from '../api/types'
import { ApiError } from '../api/http'
import { getUserById } from '../api/users'
import { ErrorAlert } from '../components/ErrorAlert'
import { useAuth } from '../auth/useAuth'

export default function UserDetailPage() {
  const { token } = useAuth()
  const params = useParams()
  const id = Number(params.id)

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!token) return
      if (!Number.isFinite(id) || id <= 0) {
        setError('Invalid user id')
        setLoading(false)
        return
      }

      setError(null)
      setLoading(true)

      try {
        const res = await getUserById(token, id)
        if (!cancelled) setUser(res)
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError) {
          setError(err.detail ? `${err.message}: ${err.detail}` : err.message)
        } else {
          setError('Failed to load user')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [token, id])

  let content = <Alert severity="warning">Not found</Alert>
  if (loading) {
    content = <Alert severity="info">Loading…</Alert>
  } else if (user) {
    content = (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {user.first_name} {user.last_name}
          </Typography>
          <Typography color="text.secondary">Email: {user.email}</Typography>
          <Typography color="text.secondary">ID: {user.id}</Typography>
          <Typography color="text.secondary">Age: {user.age}</Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Created: {new Date(user.created_at).toLocaleString()}
          </Typography>
          <Typography color="text.secondary">
            Updated: {new Date(user.updated_at).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Stack spacing={2}>
      <Link component={RouterLink} to="/users">
        ← Back to users
      </Link>

      <Typography variant="h5">User Detail</Typography>

      <ErrorAlert message={error} />

      {content}
    </Stack>
  )
}
