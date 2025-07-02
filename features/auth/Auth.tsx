import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { useAppContext } from '../../contexts/AppContext';
import { GoogleIcon } from '../../components/icons/GoogleIcon';

const inputBaseStyle = "w-full px-4 py-3 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";

export const AuthScreen: React.FC = () => {
    const { signInWithPassword, signUpWithPassword, signInWithGoogle } = useAppContext();
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
                authResponse = await signUpWithPassword({ email, password });
            }

            if (authResponse.error) {
                setError(authResponse.error.message);
            }
            // On success, the onAuthStateChange listener in AppContext will handle the session update.
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        const { error } = await signInWithGoogle();
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]">
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <img src="assets/logo.png" alt="Logo" className="w-24 h-24 mx-auto mb-4" />
                    <h1 className="text-4xl font-poppins font-bold text-white">El Antimétodo</h1>
                    <p className="text-purple-200 mt-2">Tu comunidad de adquisición de idiomas.</p>
                </div>

                <div className="bg-[var(--color-card-bg)] p-6 sm:p-8 rounded-xl shadow-2xl">
                    <h2 className="text-2xl font-bold text-center text-[var(--color-primary)] mb-6">
                        {isLoginView ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </h2>

                    {error && (
                        <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm" role="alert">
                            {error}
                        </p>
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
                            <label htmlFor="password"className="sr-only">Contraseña</label>
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
                        >
                            {isLoginView ? 'Regístrate' : 'Inicia Sesión'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
