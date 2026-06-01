import { useMemo, useState, type SyntheticEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../../services/https'
import { ErrorAlert } from '../../../components/ErrorAlert'
import * as authApi from '../../../api/auth'
import * as usersApi from '../../../api/users'

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

export default function CreateCustomerPage() {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthDay, setBirthDay] = useState('')
  const [genderId, setGenderId] = useState<string>('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const computedAge = useMemo(() => {
    if (!birthDay) return undefined

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDay)
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
  }, [birthDay])

  const canSubmit = useMemo(
    () =>
      firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      email.trim().length > 0 &&
      password.length >= 8,
    [firstName, lastName, email, password],
  )

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const genderNumber = genderId === '' ? undefined : Number(genderId)

      const res = await authApi.register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        age: computedAge,
        gender_id:
          genderNumber !== undefined && Number.isFinite(genderNumber) ? genderNumber : undefined,
      })

      if (birthDay) {
        const rfc3339 = dateOnlyToRfc3339Utc(birthDay)
        if (rfc3339) {
          await usersApi.updateProfile(res.token, { birth_day: rfc3339 })
        }
      }

      navigate('/users', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail ? `${err.message}: ${err.detail}` : err.message)
      } else {
        setError('Create user failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Add user</Typography>

      <Card variant="outlined">
        <CardContent>
          <ErrorAlert message={error} />

          <Box component="form" onSubmit={onSubmit} noValidate>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
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
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                helperText="Min 8 characters"
              />

              <TextField
                label="Birth day"
                type="date"
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                helperText="Optional"
              />

              <TextField
                label="Age"
                type="number"
                value={computedAge ?? ''}
                disabled
                helperText="Computed from birth day"
                slotProps={{ htmlInput: { min: 0, max: 150 } }}
              />

              <TextField
                select
                label="Gender"
                value={genderId}
                onChange={(e) => setGenderId(e.target.value)}
                helperText="Optional"
              >
                <MenuItem value="">Not specified</MenuItem>
                <MenuItem value="1">Male</MenuItem>
                <MenuItem value="2">Female</MenuItem>
                <MenuItem value="3">Other</MenuItem>
              </TextField>
            </Box>

            {canSubmit ? null : (
              <Alert severity="info" sx={{ mt: 2 }}>
                Fill in required fields to create a user.
              </Alert>
            )}

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ mt: 2, justifyContent: 'flex-end' }}
            >
              <Button variant="outlined" onClick={() => navigate('/users')}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={!canSubmit || submitting}>
                {submitting ? 'Creating…' : 'Create user'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  )
}
