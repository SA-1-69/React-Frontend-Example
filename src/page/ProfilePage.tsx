import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { ApiError } from '../api/http'
import { ErrorAlert } from '../components/ErrorAlert'
import { useAuth } from '../auth/useAuth'

export default function ProfilePage() {
  const { user, updateProfile, deleteAccount } = useAuth()

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const canSave = useMemo(() => {
    if (!user) return false
    const nameChanged = name.trim().length >= 3 && name.trim() !== user.name
    const emailChanged = email.trim().length > 0 && email.trim() !== user.email
    const passwordChanged = password.length >= 8
    return nameChanged || emailChanged || passwordChanged
  }, [user, name, email, password])

  async function onSave() {
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      await updateProfile({
        name: name.trim() !== '' ? name.trim() : undefined,
        email: email.trim() !== '' ? email.trim() : undefined,
        password: password !== '' ? password : undefined,
      })
      setPassword('')
      setSuccess('Profile updated')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail ? `${err.message}: ${err.detail}` : err.message)
      } else {
        setError('Update failed')
      }
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!window.confirm('Delete your account? This cannot be undone.')) return
    setError(null)
    setSuccess(null)

    try {
      await deleteAccount()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail ? `${err.message}: ${err.detail}` : err.message)
      } else {
        setError('Delete failed')
      }
    }
  }

  if (!user) {
    return <Alert severity="info">Loading profile…</Alert>
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">My Profile</Typography>

      <Card variant="outlined">
        <CardContent>
          <ErrorAlert message={error} />
          {success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          ) : null}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>

          <TextField
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mt: 2 }}
            fullWidth
            helperText="Leave blank to keep current password (min 8 chars if set)"
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => void onSave()} disabled={!canSave || saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => void onDelete()}
              disabled={saving}
            >
              Delete account
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Created: {new Date(user.created_at).toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Updated: {new Date(user.updated_at).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  )
}
