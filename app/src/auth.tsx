import { useAuthActions } from '@convex-dev/auth/react';
import { useState } from 'react';
import type { FormEvent } from 'react';

export function AuthPanel({ onClose }: { onClose: () => void }) {
  const { signIn } = useAuthActions();
  const [mode, setMode] = useState<'signIn' | 'signUp' | 'reset'>('signIn');
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await signIn('password', new FormData(event.currentTarget));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to authenticate.');
    }
  };
  const reset = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(''); try { await signIn('password', new FormData(event.currentTarget)); setResetSent(true); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to send reset code.'); } };
  if (mode === 'reset') return <div className="auth-panel"><button className="back-button" onClick={onClose}>← Close</button><p className="eyebrow">Password reset</p><h2>{resetSent ? 'Check your email' : 'Reset your password'}</h2>{resetSent ? <p className="muted">We sent a reset code if an account exists for that email address.</p> : <form onSubmit={reset}><label>Email<input name="email" type="email" required /></label><input name="flow" type="hidden" value="reset" />{error && <p className="error-text">{error}</p>}<button type="submit">Send reset code</button></form>}<button className="text-button" onClick={() => setMode('signIn')}>Back to login</button></div>;
  return <div className="auth-panel"><button className="back-button" onClick={onClose}>← Close</button><p className="eyebrow">Menetap account</p><h2>{mode === 'signIn' ? 'Welcome back' : 'Create your account'}</h2><form onSubmit={submit}><label>Email<input name="email" type="email" required /></label><label>Password<input name="password" type="password" minLength={8} required /></label><input name="flow" type="hidden" value={mode} />{error && <p className="error-text">{error}</p>}<button type="submit">{mode === 'signIn' ? 'Log in' : 'Sign up'}</button></form><button className="text-button" onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}>{mode === 'signIn' ? 'Create an account' : 'Already have an account? Log in'}</button>{mode === 'signIn' && <button className="text-button" onClick={() => setMode('reset')}>Forgot password?</button>}</div>;
}
