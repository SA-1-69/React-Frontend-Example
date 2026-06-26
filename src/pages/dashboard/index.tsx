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
  MenuItem,
  Stack,
  TextField,
  Typography,
  Avatar,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined'
import TransgenderOutlinedIcon from '@mui/icons-material/TransgenderOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import { ApiError } from '../../services/https'
import { ErrorAlert } from '../../components/ErrorAlert'
import { useAuth } from '../../auth/useAuth'
import type { User } from '../../interface/IUserInterface'

function toDateOnly(value: string | null): string {
  if (!value) return ''
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value)
  return match ? match[1] : ''
}

function dateOnlyToRfc3339Utc(dateOnly: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly)
  if (!match) return null

  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, monthIndex, day))
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function computeAgeFromDateOnly(dateOnly: string): number | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly)
  if (!match) return undefined

  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  const day = Number(match[3])
  const birth = new Date(year, monthIndex, day)
  if (Number.isNaN(birth.getTime())) return undefined

  const today = new Date()
  let ageYears = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  const dayDiff = today.getDate() - birth.getDate()
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ageYears -= 1
  if (ageYears < 0) return undefined
  return ageYears
}

function getGenderLabel(genderId: number | null): string {
  if (genderId === 1) return 'Male'
  if (genderId === 2) return 'Female'
  if (genderId === 3) return 'Other'
  return 'Not specified'
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Not specified'
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

export default function DashboardPage() {
  const { user, deleteAccount } = useAuth()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  if (!user) {
    return <Alert severity="info">Loading profile…</Alert>
  }

  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()

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
    <Box
      sx={{
        maxWidth: 1000,
        mx: 'auto',
        width: '100%',
        py: { xs: 2, md: 4 },
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={3} sx={{ width: '100%', alignItems: 'center' }}>
        <Box sx={{ width: '100%', textAlign: 'left' }}>
          <Typography variant="h4" sx={{ fontWeight: '600', color: 'text.primary' }}>
            Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage your account settings and personal details.
          </Typography>
        </Box>

        <ErrorAlert message={deleteError} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
            gap: 3,
            width: '100%',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                borderRadius: 3,
                borderColor: 'divider',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
              }}
            >
              <CardContent
                sx={{
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Avatar
                  src={user.image_url}
                  alt={`${user.first_name} ${user.last_name}`}
                  sx={{
                    width: 80,
                    height: 80,
                    fontSize: '2rem',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #3f51b5 0%, #0039cb 100%)',
                    mb: 2,
                    boxShadow: '0px 8px 16px rgba(63, 81, 181, 0.2)',
                  }}
                >
                  {initials}
                </Avatar>

                <Typography variant="h6" sx={{ fontWeight: '600' }}>
                  {user.first_name} {user.last_name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
                  {user.email}
                </Typography>

                <Stack spacing={1.5} sx={{ width: '100%' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<EditOutlinedIcon />}
                    onClick={() => setEditOpen(true)}
                    sx={{
                      borderRadius: 2,
                      py: 1,
                      textTransform: 'none',
                      fontWeight: '600',
                      boxShadow: 'none',
                      '&:hover': { boxShadow: 'none' },
                    }}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineOutlinedIcon />}
                    onClick={() => void onDelete()}
                    disabled={deleteBusy}
                    sx={{
                      borderRadius: 2,
                      py: 1,
                      textTransform: 'none',
                      fontWeight: '600',
                    }}
                  >
                    {deleteBusy ? 'Deleting…' : 'Delete Account'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                borderColor: 'divider',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: '600', mb: 3 }}>
                  Personal Information
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 3,
                  }}
                >
                  <Stack spacing={0.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <PersonOutlineOutlinedIcon fontSize="small" />
                      <Typography variant="body2">First Name</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: '500' }}>{user.first_name}</Typography>
                  </Stack>

                  <Stack spacing={0.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <PersonOutlineOutlinedIcon fontSize="small" />
                      <Typography variant="body2">Last Name</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: '500' }}>{user.last_name}</Typography>
                  </Stack>

                  <Stack spacing={0.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <EmailOutlinedIcon fontSize="small" />
                      <Typography variant="body2">Email Address</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: '500' }}>{user.email}</Typography>
                  </Stack>

                  <Stack spacing={0.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <CakeOutlinedIcon fontSize="small" />
                      <Typography variant="body2">Age</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: '500' }}>{user.age} years old</Typography>
                  </Stack>

                  <Stack spacing={0.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <CalendarTodayOutlinedIcon fontSize="small" />
                      <Typography variant="body2">Birth Day</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: '500' }}>{formatDate(user.birth_day)}</Typography>
                  </Stack>

                  <Stack spacing={0.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <TransgenderOutlinedIcon fontSize="small" />
                      <Typography variant="body2">Gender</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: '500' }}>{getGenderLabel(user.gender_id)}</Typography>
                  </Stack>
                </Box>

                <Divider sx={{ my: 4 }} />

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 1, sm: 4 }}
                  sx={{ color: 'text.secondary' }}
                >
                  <Typography variant="caption">
                    Account Created: {new Date(user.created_at).toLocaleString()}
                  </Typography>
                  <Typography variant="caption">
                    Last Updated: {new Date(user.updated_at).toLocaleString()}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Stack>

      {/* ✅ EditProfileDialog */}
      <EditProfileDialog
        open={editOpen}
        user={user}
        onClose={() => setEditOpen(false)}
      />
    </Box>
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
  const [imageURL, setImageURL] = useState(user.image_url)
  const [birthDay, setBirthDay] = useState<string>(toDateOnly(user.birth_day))
  const [genderId, setGenderId] = useState<string>(user.gender_id ? String(user.gender_id) : '')

  const computedAge = useMemo(() => {
    if (!birthDay) return undefined
    return computeAgeFromDateOnly(birthDay)
  }, [birthDay])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const canSave = useMemo(() => {
    const firstNameChanged = firstName.trim().length >= 2 && firstName.trim() !== user.first_name
    const lastNameChanged = lastName.trim().length >= 2 && lastName.trim() !== user.last_name
    const emailChanged = email.trim().length > 0 && email.trim() !== user.email
    const passwordChanged = password.length >= 8
    const birthDayChanged = birthDay !== '' && birthDay !== toDateOnly(user.birth_day)
    const genderChanged = genderId !== '' && Number(genderId) !== (user.gender_id ?? 0)
    const imageURLChanged = imageURL !== '' && imageURL !== user.image_url
    return (
      firstNameChanged ||
      lastNameChanged ||
      emailChanged ||
      passwordChanged ||
      birthDayChanged ||
      genderChanged ||
      imageURLChanged
    )
  }, [user, firstName, lastName, email, password, birthDay, genderId, imageURL])

  async function onSave() {
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      const firstNameValue = firstName.trim()
      const lastNameValue = lastName.trim()
      const emailValue = email.trim()
      const genderNumber = genderId === '' ? undefined : Number(genderId)
      const birthRfc3339 = birthDay === '' ? undefined : dateOnlyToRfc3339Utc(birthDay) ?? undefined
      const ageNumber = birthDay === '' ? undefined : computedAge
      const imageURLValue = imageURL.trim()
      await updateProfile({
        first_name: firstNameValue || undefined,
        last_name: lastNameValue || undefined,
        email: emailValue || undefined,
        password: password || undefined,
        age: ageNumber !== undefined && Number.isFinite(ageNumber) ? ageNumber : undefined,
        birth_day: birthRfc3339,
        image_url: imageURLValue || undefined,
        gender_id:
          genderNumber !== undefined && Number.isFinite(genderNumber) ? genderNumber : undefined,
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
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1,
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: '600' }}>Edit Profile</DialogTitle>
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
            gap: 2.5,
            mt: 1.5,
          }}
        >
          <TextField
            label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Age"
            type="number"
            value={birthDay === '' ? user.age : (computedAge ?? '')}
            disabled
            slotProps={{ htmlInput: { min: 0, max: 150 } }}
            helperText={birthDay === '' ? 'Age from profile' : 'Computed from birth day'}
            fullWidth
          />

          <TextField
            label="Birth day"
            type="date"
            value={birthDay}
            onChange={(e) => setBirthDay(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Optional"
            fullWidth
          />

          <TextField
            label="Image URL"
            value={imageURL}
            onChange={(e) => setImageURL(e.target.value)}
            helperText="Optional"
            fullWidth
          />

          <TextField
            select
            label="Gender"
            value={genderId}
            onChange={(e) => setGenderId(e.target.value)}
            helperText="Optional"
            fullWidth
          >
            <MenuItem value="">Not specified</MenuItem>
            <MenuItem value="1">Male</MenuItem>
            <MenuItem value="2">Female</MenuItem>
            <MenuItem value="3">Other</MenuItem>
          </TextField>
        </Box>

        <TextField
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mt: 2.5 }}
          fullWidth
          helperText="Leave blank to keep current password (min 8 chars if set)"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={saving}
          sx={{ textTransform: 'none', fontWeight: '600' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => void onSave()}
          disabled={!canSave || saving}
          sx={{
            textTransform: 'none',
            fontWeight: '600',
            borderRadius: 2,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          }}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}