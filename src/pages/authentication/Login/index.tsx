import { useMemo, useState, type SyntheticEvent } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { ApiError } from '../../../services/https'
import { ErrorAlert } from '../../../components/ErrorAlert'
import { useAuth } from '../../../auth/useAuth'
import sutEngineeringLogo from '../../../assets/sut_engineering.png'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => email.trim().length > 0 && password.length > 0, [email, password])

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await login({ email: email.trim(), password })
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
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'grey.100', p: 3 }}>
      <Card variant="outlined" sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'grid', justifyItems: 'center', mb: 2 }}>
            <Box
              component="img"
              src={sutEngineeringLogo}
              alt="SUT Institute of Engineering"
              sx={{ height: 44, width: 'auto' }}
            />
          </Box>

          <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
            Login
          </Typography>

          <ErrorAlert message={error} />

          <Box component="form" onSubmit={onSubmit} noValidate>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="dense"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="dense"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        edge="end"
                        onClick={() => setShowPassword((s) => !s)}
                      >
                        {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={!canSubmit || submitting}
            >
              {submitting ? 'Logging in…' : 'Log in'}
            </Button>

            <Link
              component={RouterLink}
              to="/register"
              underline="hover"
              sx={{ display: 'inline-block', mt: 1.5, fontSize: 13 }}
            >
              Or signup now !
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
