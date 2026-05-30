import { useMemo, useState, type SyntheticEvent } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/http'
import { ErrorAlert } from '../components/ErrorAlert'
import { useAuth } from '../auth/useAuth'
import sutEngineeringLogo from '../assets/sut_engineering.png'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [birthDay, setBirthDay] = useState('')
  const [genderId, setGenderId] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(
    () =>
      firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      email.trim().length > 0 &&
      password.length >= 8,
    [firstName, lastName, email, password],
  )

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

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const genderNumber = genderId === '' ? undefined : Number(genderId)

      await register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        age: computedAge,
        birth_day: birthDay || undefined,
        gender_id:
          genderNumber !== undefined && Number.isFinite(genderNumber) ? genderNumber : undefined,
      })
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
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'grey.100', p: 3 }}>
      <Card variant="outlined" sx={{ width: '100%', maxWidth: 520 }}>
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
            Sign Up
          </Typography>

          <ErrorAlert message={error} />

          <Box component="form" onSubmit={onSubmit} noValidate>
            <TextField
              label="ชื่อจริง"
              fullWidth
              margin="dense"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              required
            />
            <TextField
              label="นามสกุล"
              fullWidth
              margin="dense"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              required
            />
            <TextField
              label="อีเมล"
              type="email"
              fullWidth
              margin="dense"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
              <TextField
                label="รหัสผ่าน"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="dense"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                helperText="อย่างน้อย 8 ตัวอักษร"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          edge="end"
                          onClick={() => setShowPassword((s) => !s)}
                        >
                          {showPassword ? (
                            <VisibilityOffOutlinedIcon />
                          ) : (
                            <VisibilityOutlinedIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                label="วันเดือนปี เกิด"
                type="date"
                fullWidth
                margin="dense"
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                helperText="(ใช้สำหรับ UI)"
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
              <TextField
                label="อายุ"
                type="number"
                fullWidth
                margin="dense"
                value={computedAge ?? ''}
                disabled
                helperText="คำนวณจากวันเกิด"
                slotProps={{ htmlInput: { min: 0, max: 150 } }}
              />

              <TextField
                select
                label="เพศ"
                fullWidth
                margin="dense"
                value={genderId}
                onChange={(e) => setGenderId(e.target.value)}
                helperText="กรุณาเลือกเพศ"
              >
                <MenuItem value="">กรุณาเลือกเพศ</MenuItem>
                <MenuItem value="1">ชาย</MenuItem>
                <MenuItem value="2">หญิง</MenuItem>
                <MenuItem value="3">อื่น ๆ</MenuItem>
              </TextField>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={!canSubmit || submitting}
            >
              {submitting ? 'Signing up…' : 'Sign up'}
            </Button>

            <Link
              component={RouterLink}
              to="/login"
              underline="hover"
              sx={{ display: 'inline-block', mt: 1.5, fontSize: 13 }}
            >
              Or signin now !
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
