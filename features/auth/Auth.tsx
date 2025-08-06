import React, { useState } from 'react';
import { Button } from '../../components/Button.tsx';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { GoogleIcon } from '../../components/icons/GoogleIcon.tsx';


const inputBaseStyle = "w-full px-4 py-3 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";

export const AuthScreen: React.FC = () => {
    const { signInWithPassword, signUp, signInWithGoogle } = useAppContext();
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            let authResponse;
            if (isLoginView) {
                authResponse = await signInWithPassword({ email, password });
            } else {
                authResponse = await signUp({ 
                    email, 
                    password,
                    options: {
                        emailRedirectTo: window.location.origin
                    }
                });
            }

            if (authResponse.error) {
                console.error('Auth error:', authResponse.error);
                setError(authResponse.error.message);
            } else if (!isLoginView && authResponse.data?.user && !authResponse.data?.session) {
                // Sign up successful but needs email confirmation
                setError("Cuenta creada exitosamente. Por favor, revisa tu email para confirmar tu cuenta.");
            }
            // On success, the onAuthStateChange listener in AppContext will handle the session update.
        } catch (err: any) {
            console.error('Auth action error:', err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const { error } = await signInWithGoogle();
            if (error) {
                console.error('Google sign in error:', error);
                setError(error.message);
            }
            // Note: For OAuth, the redirect happens automatically, so we don't set loading to false here
            // unless there's an error
        } catch (err: any) {
            console.error('Google sign in error:', err);
            setError(err.message || 'Error al iniciar sesión con Google');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]">
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <img src="./assets/logo.png" alt="Logo" className="w-24 h-24 mx-auto mb-4" />
                    <h1 className="text-4xl font-poppins font-bold text-white">El Antimétodo</h1>
                    <p className="text-purple-200 mt-2">Tu comunidad de adquisición de idiomas.</p>
                </div>

                <div className="bg-[var(--color-card-bg)] p-6 sm:p-8 rounded-xl shadow-2xl">
                    <h2 className="text-2xl font-bold text-center text-[var(--color-primary)] mb-6">
                        {isLoginView ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </h2>

                    {error && (
                        <div className={`mb-4 p-3 rounded-lg text-sm ${
                            error.includes('exitosamente') 
                                ? 'bg-green-100 border border-green-400 text-green-700' 
                                : 'bg-red-100 border border-red-400 text-red-700'
                        }`} role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleAuthAction} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                required
                                className={inputBaseStyle}
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Contraseña</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Contraseña"
                                required
                                minLength={6}
                                className={inputBaseStyle}
                                disabled={loading}
                            />
                        </div>
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={loading}
                            disabled={loading}
                        >
                            {loading ? 'Procesando...' : (isLoginView ? 'Iniciar Sesión' : 'Crear Cuenta')}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[var(--color-border-light)]" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[var(--color-card-bg)] text-[var(--color-text-light)]">O continúa con</span>
                        </div>
                    </div>
                    
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={handleGoogleSignIn}
                        leftIcon={<GoogleIcon />}
                        disabled={loading}
                    >
                        Google
                    </Button>

                    <p className="mt-6 text-center text-sm">
                        {isLoginView ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                        <button
                            onClick={() => {
                                setIsLoginView(!isLoginView);
                                setError(null);
                            }}
                            className="font-medium text-[var(--color-accent)] hover:underline ml-1"
                            disabled={loading}
                        >
                            {isLoginView ? 'Regístrate' : 'Inicia Sesión'}
                        </button>
                    </p>

                    <div className="mt-6 text-center text-xs text-[var(--color-text-light)]">
                        <p>
                            Al registrarte, aceptas nuestros{' '}
                            <a href="https://elantimetodo.com/terminos.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-accent)]">
                                Términos de Servicio
                            </a>
                            {' '}
                            y
                            {' '}
                            <a href="https://elantimetodo.com/privacidad.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-accent)]">
                                Política de Privacidad
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};