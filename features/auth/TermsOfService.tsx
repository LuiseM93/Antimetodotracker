
import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Términos y Condiciones del Servicio para El Antimétodo Tracker</h2>
      <p className="mb-4">**Última actualización:** 2025-08-01</p>
      <p className="mb-4">Bienvenido a El Antimétodo Tracker. Al utilizar nuestra aplicación, aceptas los siguientes términos y condiciones:</p>
      <ol className="list-decimal list-inside mb-4">
        <li className="mb-2">
          **Uso de la Aplicación:**
          <ul className="list-disc list-inside ml-4">
            <li>Te comprometes a utilizar la aplicación de manera responsable y respetuosa con los demás miembros de la comunidad.</li>
            <li>No utilizarás la aplicación para ningún propósito ilegal o no autorizado.</li>
          </ul>
        </li>
        <li className="mb-2">
          **Tu Cuenta:**
          <ul className="list-disc list-inside ml-4">
            <li>Eres responsable de mantener la seguridad de tu cuenta y contraseña.</li>
            <li>El Antimétodo Tracker no se hace responsable de las pérdidas o daños derivados de tu incapacidad para proteger tu información de inicio de sesión.</li>
          </ul>
        </li>
        <li className="mb-2">
          **Propiedad de los Datos:**
          <ul className="list-disc list-inside ml-4">
            <li>Como se indica en nuestra Política de Privacidad, tú eres el único propietario de los datos que generas. Te proporcionamos las herramientas para exportar y eliminar tu información en cualquier momento.</li>
          </ul>
        </li>
        <li className="mb-2">
          **Disponibilidad del Servicio:**
          <ul className="list-disc list-inside ml-4">
            <li>Nos esforzamos por mantener la aplicación disponible y funcional en todo momento, pero no garantizamos un servicio ininterrumpido. Podemos realizar tareas de mantenimiento que podrían afectar temporalmente la disponibilidad.</li>
          </ul>
        </li>
        <li className="mb-2">
          **Modificaciones de los Términos:**
          <ul className="list-disc list-inside ml-4">
            <li>Nos reservamos el derecho de actualizar y cambiar los Términos y Condiciones del Servicio sin previo aviso. Se recomienda revisar esta página periódicamente.</li>
          </ul>
        </li>
      </ol>
      <p>El uso continuado de la aplicación después de cualquier cambio constituirá tu consentimiento a dichos cambios.</p>
    </div>
  );
};

export default TermsOfService;
