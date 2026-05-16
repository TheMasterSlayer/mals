'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, MenuItem, CircularProgress, InputAdornment, IconButton, Grid,
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack, Shield } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi, getApiError } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { Role } from '@/lib/types';

const schema = z.object({
  username: z.string().min(3, 'Min 3 characters').max(50),
  email:    z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  role:     z.enum(['ADMIN', 'COMMANDER', 'LOGISTICS_OFFICER'] as const),
  rank:     z.string().max(30).optional(),
  unit:     z.string().max(100).optional(),
});
type FormData = z.infer<typeof schema>;

const ROLES: { value: Role; label: string }[] = [
  { value: 'LOGISTICS_OFFICER', label: 'Logistics Officer' },
  { value: 'COMMANDER',         label: 'Commander' },
  { value: 'ADMIN',             label: 'Administrator' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'LOGISTICS_OFFICER' },
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    setLoading(true);
    try {
      const user = await authApi.register(data);
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
      <Card sx={{ maxWidth: 560, width: '100%' }}>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 1 }}>
            <Shield sx={{ color: 'primary.main', fontSize: 32 }} />
            <Box>
              <Typography variant="h6" fontWeight={700}>Request Access</Typography>
              <Typography variant="caption" color="text.secondary" letterSpacing={1}>
                NEW ACCOUNT REGISTRATION
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('username')}
                  label="Username"
                  fullWidth
                  error={!!errors.username}
                  helperText={errors.username?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('role')}
                  select
                  label="Role"
                  fullWidth
                  defaultValue="LOGISTICS_OFFICER"
                  error={!!errors.role}
                  helperText={errors.role?.message}
                >
                  {ROLES.map(r => (
                    <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  {...register('email')}
                  label="Email Address"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  {...register('password')}
                  label="Password"
                  type={showPw ? 'text' : 'password'}
                  fullWidth
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('rank')}
                  label="Rank (optional)"
                  fullWidth
                  error={!!errors.rank}
                  helperText={errors.rank?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('unit')}
                  label="Unit / Installation (optional)"
                  fullWidth
                  error={!!errors.unit}
                  helperText={errors.unit?.message}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 3, py: 1.5, fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={24} /> : 'SUBMIT REQUEST'}
            </Button>
          </Box>

          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/login')}
            sx={{ mt: 2 }}
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
