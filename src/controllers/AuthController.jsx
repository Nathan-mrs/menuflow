import { useEffect, useState } from 'react';
import { request } from '../models/api';
export function useAuth() {
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { request('/session').then(setSession).catch(error => setError(error.message)); }, []);
  const login = async (email, password) => {
    setBusy(true); setError('');
    try { setSession(await request('/session', { method: 'POST', body: { email, password } })); }
    catch (error) { setError(error.message); }
    finally { setBusy(false); }
  };
  const logout = async () => {
    setBusy(true);
    try { await request('/session', { method: 'DELETE', body: {} }); setSession({ authenticated: false, configured: true }); }
    catch (error) { setError(error.message); }
    finally { setBusy(false); }
  };
  return { session, error, busy, login, logout };
}
