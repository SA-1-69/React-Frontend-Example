import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { ApiError } from '../api/http'
import { ErrorAlert } from '../components/ErrorAlert'
import { useAuth } from '../auth/useAuth'
import type { User } from '../api/types'

export default function ProfilePage() {
  const { user, deleteAccount } = useAuth()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  if (!user) {
    return <Alert severity="info">Loading profile…</Alert>
  }

  async function onDelete() {
    if (!globalThis.confirm('Delete your account? This cannot be undone.')) return
    setDeleteError(null)
    setDeleteBusy(true)

    try {
      await deleteAccount()
    } catch (err) {
      if (err instanceof ApiError) {
        setDeleteError(err.detail ? `${err.message}: ${err.detail}` : err.message)
      } else {
        setDeleteError('Delete failed')
      }
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">My Profile</Typography>

      <Card variant="outlined">
        <CardContent>
          <ErrorAlert message={deleteError} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                First name
              </Typography>
              <Typography>{user.first_name}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Last name
              </Typography>
              <Typography>{user.last_name}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography>{user.email}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Age
              </Typography>
              <Typography>{user.age}</Typography>
            </Box>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              variant="contained"
              startIcon={<EditOutlinedIcon />}
              onClick={() => setEditOpen(true)}
            >
              Edit profile
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineOutlinedIcon />}
              onClick={() => void onDelete()}
              disabled={deleteBusy}
            >
              {deleteBusy ? 'Deleting…' : 'Delete account'}
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

      {editOpen ? (
        <EditProfileDialog
          key={user.id}
          open={editOpen}
          user={user}
          onClose={() => setEditOpen(false)}
        />
      ) : null}
    </Stack>
  )
}

function EditProfileDialog({
  open,
  user,
  onClose,
}: Readonly<{ open: boolean; user: User; onClose: () => void }>) {
  const { updateProfile } = useAuth()

  const [firstName, setFirstName] = useState(user.first_name)
  const [lastName, setLastName] = useState(user.last_name)
  const [email, setEmail] = useState(user.email)
  const [password, setPassword] = useState('')
  const [age, setAge] = useState<string>(String(user.age))

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const canSave = useMemo(() => {
    const firstNameChanged = firstName.trim().length >= 2 && firstName.trim() !== user.first_name
    const lastNameChanged = lastName.trim().length >= 2 && lastName.trim() !== user.last_name
    const emailChanged = email.trim().length > 0 && email.trim() !== user.email
    const passwordChanged = password.length >= 8
    const ageNumber = Number(age)
    const ageChanged = age.trim() !== '' && Number.isFinite(ageNumber) && ageNumber !== user.age
    return firstNameChanged || lastNameChanged || emailChanged || passwordChanged || ageChanged
  }, [user, firstName, lastName, email, password, age])

  async function onSave() {
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      const firstNameValue = firstName.trim()
      const lastNameValue = lastName.trim()
      const emailValue = email.trim()
      const ageValue = age.trim()
      const ageNumber = ageValue === '' ? undefined : Number(ageValue)

      await updateProfile({
        first_name: firstNameValue || undefined,
        last_name: lastNameValue || undefined,
        email: emailValue || undefined,
        password: password || undefined,
        age: ageNumber !== undefined && Number.isFinite(ageNumber) ? ageNumber : undefined,
      })

      setSuccess('Profile updated')
      onClose()
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit profile</DialogTitle>
      <DialogContent>
        <ErrorAlert message={error} />
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        ) : null}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            mt: 1,
          }}
        >
          <TextField
            label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <TextField
            label="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            slotProps={{ htmlInput: { min: 0, max: 150 } }}
            helperText="Optional (0-150)"
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
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => void onSave()} disabled={!canSave || saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
