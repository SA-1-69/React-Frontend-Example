import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material'
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import sutEngineeringLogo from '../assets/sut_engineering.png'

export function AppShell() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={{ bgcolor: 'warning.main', borderBottom: 1, borderColor: 'divider', color: 'common.white' }}
      >
        <Toolbar>
          <Box
            component={RouterLink}
            to="/profile"
            sx={{ flexGrow: 1, display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <Box
              component="img"
              src={sutEngineeringLogo}
              alt="SUT Institute of Engineering"
              sx={{ height: 34, width: 'auto', display: 'block' }}
            />
          </Box>

          <Button color="inherit" component={RouterLink} to="/profile">
            Profile
          </Button>
          <Button color="inherit" component={RouterLink} to="/users">
            Users
          </Button>
          <Button
            color="inherit"
            onClick={() => {
              logout()
              navigate('/login')
            }}
            sx={{ ml: 1 }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {user ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Signed in as {user.first_name} {user.last_name} ({user.email})
          </Typography>
        ) : null}
        <Outlet />
      </Container>
    </Box>
  )
}
