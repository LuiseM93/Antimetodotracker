
import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Política de Privacidad para El Antimétodo Tracker</h2>
      <p className="mb-4">**Última actualización:** 2025-08-01</p>
      <p className="mb-4">El Antimétodo Tracker se compromete a proteger tu privacidad. Esta aplicación está diseñada para ser una herramienta personal y comunitaria donde tú tienes el control.</p>
      <h3 className="text-xl font-bold mb-2">Datos que Recopilamos</h3>
      <p className="mb-4">Al iniciar sesión con un proveedor como Google, solicitamos acceso a tu dirección de correo electrónico y a tu información de perfil público (nombre y foto de perfil) con el único fin de crear y gestionar tu cuenta dentro de la aplicación.</p>
      <h3 className="text-xl font-bold mb-2">Uso de Datos</h3>
      <p className="mb-4">Tu información se utiliza exclusivamente para el funcionamiento de la aplicación:</p>
      <ul className="list-disc list-inside mb-4">
        <li>**Perfil de Usuario:** Para crear tu perfil público dentro de la comunidad, donde puedes mostrar tu progreso.</li>
        <li>**Identificación:** Para asociar tus registros de actividad, logros y publicaciones en el feed a tu cuenta.</li>
        <li>**Comunicación:** Ocasionalmente, podríamos usar tu correo electrónico para informarte sobre actualizaciones importantes de la aplicación o de seguridad.</li>
      </ul>
      <h3 className="text-xl font-bold mb-2">Almacenamiento y Seguridad de Datos</h3>
      <p className="mb-4">Tu historial de actividades, perfil y otros datos de la aplicación se almacenan de forma segura en nuestra base de datos, gestionada a través de Supabase. Implementamos las mejores prácticas de seguridad para proteger tu información.</p>
      <h3 className="text-xl font-bold mb-2">Control del Usuario y Propiedad de los Datos</h3>
      <p className="mb-4">Creemos firmemente que tus datos te pertenecen. Por ello, te ofrecemos control total:</p>
      <ul className="list-disc list-inside mb-4">
        <li>**Exportación:** Puedes exportar una copia completa de todos tus datos en cualquier momento desde la pantalla de `Configuración`.</li>
        <li>**Eliminación:** Puedes eliminar permanentemente toda tu cuenta y datos asociados desde la `Configuración`.</li>
      </ul>
      <p className="mb-4">**No compartimos ni vendemos tus datos personales a terceros bajo ninguna circunstancia.**</p>
      <p>Si tienes alguna pregunta sobre nuestra política de privacidad, no dudes en contactarnos.</p>
    </div>
  );
};

export default PrivacyPolicy;
