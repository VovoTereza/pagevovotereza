'use client';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { SyntheticEvent, useState } from 'react';
import Link from 'next/link';

export function LoginForm() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        password: form.get('password'),
      }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error || 'Não foi possível entrar.');
      setLoading(false);
      return;
    }
    window.location.assign('/admin');
  }
  return (
    <form className="login-form" onSubmit={submit}>
      <div className="login-mark">
        <LockKeyhole />
      </div>
      <p className="eyebrow">ÁREA RESTRITA</p>
      <h1>Painel Vovó Tereza</h1>
      <p>Entre para administrar produtos, ofertas, conteúdo e pedidos.</p>
      <Link className="primary-button" href="/signin-with-chatgpt?return_to=%2Fadmin">
        ENTRAR COM SEGURANÇA
      </Link>
      <div className="login-divider"><span>ou use as credenciais do servidor</span></div>
      <label>
        Email
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="voce@empresa.com.br"
        />
      </label>
      <label>
        Senha
        <div className="password-field">
          <input
            name="password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {show ? <EyeOff /> : <Eye />}
          </button>
        </div>
      </label>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <button className="primary-button" disabled={loading}>
        {loading ? 'ENTRANDO...' : 'ENTRAR COM EMAIL E SENHA'}
      </button>
      <small>
        As credenciais são configuradas somente no ambiente seguro do servidor.
      </small>
    </form>
  );
}
