'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, InputAdornment, IconButton, Divider, CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Shield } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi, getApiError } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [error,  setError]  = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    setLoading(true);
    try {
      const user = await authApi.login(data);
      setUser(user);
      router.push('/dashboard');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A1628 0%, #0D2137 50%, #1A3A5C 100%)',
        p: 2,
      }}
    >
      {/* Classification banner */}
      <Box
        sx={{
          position: 'fixed', top: 0, left: 0, right: 0,
          bgcolor: '#15803D', py: 0.5, textAlign: 'center',
        }}
      >
        <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, letterSpacing: 3 }}>
          UNCLASSIFIED // FOR OFFICIAL USE ONLY
        </Typography>
      </Box>

      <Card sx={{ maxWidth: 440, width: '100%', bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          {/* Logo / branding */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 64, height: 64, borderRadius: '50%',
                bgcolor: 'primary.main', display: 'flex',
                alignItems: 'center', justifyContent: 'center', mb: 2,
              }}
            >
              <Shield sx={{ fontSize: 36, color: '#000' }} />
            </Box>
            <Typography variant="h5" fontWeight={700} letterSpacing={1}>
              MALS
            </Typography>
            <Typography variant="caption" color="text.secondary" letterSpacing={2}>
              MILITARY ASSET & LOGISTICS MANAGEMENT
            </Typography>
          </Box>

          <Typography variant="overline" color="text.secondary" display="block" mb={2}>
            Secure Authentication Required
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              {...register('email')}
              label="Email Address"
              type="email"
              fullWidth
              autoComplete="email"
              autoFocus
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
            />
            <TextField
              {...register('password')}
              label="Password"
              type={showPw ? 'text' : 'password'}
              fullWidth
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw(p => !p)} edge="end" size="small">
                      {showPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ py: 1.5, fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={24} /> : 'AUTHENTICATE'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">OR</Typography>
          </Divider>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => router.push('/register')}
            sx={{ borderStyle: 'dashed' }}
          >
            Request New Account
          </Button>

          <Box
            sx={{
              mt: 3, p: 2, borderRadius: 1,
              bgcolor: 'rgba(0,180,216,0.06)',
              border: '1px solid rgba(0,180,216,0.2)',
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Default credentials (seed data):
            </Typography>
            <Typography variant="caption" display="block">
              admin@mals.mil / Admin@12345
            </Typography>
            <Typography variant="caption" display="block">
              hayes@mals.mil / Command@12345
            </Typography>
            <Typography variant="caption" display="block">
              chen@mals.mil / Logistics@12345
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Footer */}
      <Box sx={{ position: 'fixed', bottom: 8, textAlign: 'center', width: '100%' }}>
        <Typography variant="caption" color="text.secondary">
          Authorized users only. All access is monitored and logged.
        </Typography>
      </Box>
    </Box>
  );
}
