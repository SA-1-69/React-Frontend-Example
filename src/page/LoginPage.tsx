import { useMemo, useState } from 'react'
import { Box, Button, Card, CardContent, Container, TextField, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/http'
import { ErrorAlert } from '../components/ErrorAlert'
import { useAuth } from '../auth/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => email.trim().length > 0 && password.length > 0, [email, password])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await login({ email, password })
      navigate('/profile', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail ? `${err.message}: ${err.detail}` : err.message)
      } else {
        setError('Login failed')
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
            Login
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Sign in with your account
          </Typography>

          <ErrorAlert message={error} />

          <Box component="form" onSubmit={onSubmit} noValidate>
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
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={!canSubmit || submitting}
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>

            <Button
              component={RouterLink}
              to="/register"
              fullWidth
              sx={{ mt: 1 }}
            >
              Create an account
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
