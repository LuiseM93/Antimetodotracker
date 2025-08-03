import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Términos y Condiciones del Servicio para El Antimétodo Tracker</h1>
      <p className="text-sm text-gray-500 mb-6">Última actualización: 2025-08-01</p>

      <p className="mb-4">Bienvenido a El Antimétodo Tracker. Al utilizar nuestra aplicación, aceptas los siguientes términos y condiciones:</p>

      <h2 className="text-2xl font-semibold mb-3">1. Uso de la Aplicación:</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Te comprometes a utilizar la aplicación de manera responsable y respetuosa con los demás miembros de la comunidad.</li>
        <li>No utilizarás la aplicación para ningún propósito ilegal o no autorizado.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-3">2. Tu Cuenta:</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Eres responsable de mantener la seguridad de tu cuenta y contraseña.</li>
        <li>El Antimétodo Tracker no se hace responsable de las pérdidas o daños derivados de tu incapacidad para proteger tu información de inicio de sesión.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-3">3. Propiedad de los Datos:</h2>
      <p className="mb-4">Como se indica en nuestra Política de Privacidad, tú eres el único propietario de los datos que generas. Te proporcionamos las herramientas para exportar y eliminar tu información en cualquier momento.</p>

      <h2 className="text-2xl font-semibold mb-3">4. Disponibilidad del Servicio:</h2>
      <p className="mb-4">Nos esforzamos por mantener la aplicación disponible y funcional en todo momento, pero no garantizamos un servicio ininterrumpido. Podemos realizar tareas de mantenimiento que podrían afectar temporalmente la disponibilidad.</p>

      <h2 className="text-2xl font-semibold mb-3">5. Modificaciones de los Términos:</h2>
      <p className="mb-4">Nos reservamos el derecho de actualizar y cambiar los Términos y Condiciones del Servicio sin previo aviso. Se recomienda revisar esta página periódicamente.</p>
      <p>El uso continuado de la aplicación después de cualquier cambio constituirá tu consentimiento a dichos cambios.</p>
    </div>
  );
};

export default TermsOfService;
