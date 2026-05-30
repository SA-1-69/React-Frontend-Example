import { useMemo, useState } from 'react'
import { Box, Button, Card, CardContent, Container, TextField, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/http'
import { ErrorAlert } from '../components/ErrorAlert'
import { useAuth } from '../auth/useAuth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(
    () => name.trim().length >= 3 && email.trim().length > 0 && password.length >= 8,
    [name, email, password],
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await register({ name, email, password })
      navigate('/profile', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail ? `${err.message}: ${err.detail}` : err.message)
      } else {
        setError('Registration failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card variant="outlined">
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Register
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Create a new account
          </Typography>

          <ErrorAlert message={error} />

          <Box component="form" onSubmit={onSubmit} noValidate>
            <TextField
              label="Name"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              helperText="At least 3 characters"
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              helperText="Min 8 characters"
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={!canSubmit || submitting}
            >
              {submitting ? 'Creating…' : 'Create account'}
            </Button>

            <Button component={RouterLink} to="/login" fullWidth sx={{ mt: 1 }}>
              Back to login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
