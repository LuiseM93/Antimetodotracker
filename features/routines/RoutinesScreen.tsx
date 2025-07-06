import React from 'react';

const RoutinesScreen: React.FC = () => {
  return (
    <div className="min-h-screen" id="main-content">
      <header className="bg-[#4D34B8] text-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white text-[#4D34B8] w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">A</div>
            <h1 className="font-bold text-lg">El Antimetodo</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="focus:outline-none">
              <img alt="Bandera de España" className="w-6 h-6 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAh0ZlYjMvXfF_Hxws1ebTBlSlitvj8c1DlcNt8U66Gy8qUBvt6H2LrMDMAicpLKYSQn1hJgfisFfJ-iSiXnmiXjbU1ORt3pmUAJ1Haqj8FvGt4-F8JNIVM3QSNPt2wT_3vJeGZ5SJwg_q7VTKq--fYW8wJ9gZAkkqI0o-nYZBnF76IYtLxHIpLkEiQ3lvWgO3nZgp9ydsaPqMxZcPSvaJimgY1Ag6SWhqf6Mr4pZppuP8b5m1BGr3uy213GV-nLhcPB6vURlq3QA"/>
            </button>
            <button className="focus:outline-none">
              <span className="material-icons">settings</span>
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 pb-24">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Rutinas y Planificación</h2>
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Mis Hábitos Diarios</h3>
            <button className="bg-indigo-600 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors" onClick={() => openModal('addHabitModal')}>
              Añadir Nuevo Hábito
            </button>
          </div>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-900">Inmersión Diaria</h4>
                  <p className="text-sm text-gray-500">60 min óptimos</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Inmersión Activa</span>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Estudio</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100" onClick={() => openModal('addHabitModal')}>
                    <span className="material-icons text-base">edit</span>
                  </button>
                  <button className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100">
                    <span className="material-icons text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Mis Plantillas de Rutinas</h3>
            <button className="border border-indigo-600 text-indigo-600 text-sm font-medium py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors" onClick={() => openModal('createTemplateModal')}>
              Crear Nueva Plantilla
            </button>
          </div>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-900">Rutina Intensiva</h4>
                  <p className="text-sm text-gray-500">3 hábitos</p>
                </div>
                <div className="flex items-center space-x-1">
                  <button className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100" title="Cargar">
                    <span className="material-icons text-base">file_upload</span>
                  </button>
                  <button className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100" onClick={() => openModal('renameTemplateModal')} title="Renombrar">
                    <span className="material-icons text-base">drive_file_rename_outline</span>
                  </button>
                  <button className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100" title="Actualizar">
                    <span className="material-icons text-base">sync</span>
                  </button>
                  <button className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100" title="Eliminar">
                    <span className="material-icons text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-900">Mantenimiento Diario</h4>
                  <p className="text-sm text-gray-500">1 hábito</p>
                </div>
                <div className="flex items-center space-x-1">
                  <button className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100" title="Cargar">
                    <span className="material-icons text-base">file_upload</span>
                  </button>
                  <button className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100" onClick={() => openModal('renameTemplateModal')} title="Renombrar">
                    <span className="material-icons text-base">drive_file_rename_outline</span>
                  </button>
                  <button className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100" title="Actualizar">
                    <span className="material-icons text-base">sync</span>
                  </button>
                  <button className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100" title="Eliminar">
                    <span className="material-icons text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <button className="fixed bottom-24 right-4 bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-20">
        <span className="material-icons text-3xl">add</span>
      </button>
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.1)] flex justify-around py-2 z-20">
        <a className="text-center text-gray-500 hover:text-indigo-600 transition-colors" href="#">
          <span className="material-icons">dashboard</span>
          <span className="block text-xs">Dashboard</span>
        </a>
        <a className="text-center text-gray-500 hover:text-indigo-600 transition-colors" href="#">
          <span className="material-icons">track_changes</span>
          <span className="block text-xs">Tracker</span>
        </a>
        <a className="text-center text-indigo-600 font-medium transition-colors" href="#">
          <div className="bg-indigo-100 rounded-full p-2 inline-block">
            <span className="material-icons">list_alt</span>
          </div>
          <span className="block text-xs">Routines</span>
        </a>
        <a className="text-center text-gray-500 hover:text-indigo-600 transition-colors" href="#">
          <span className="material-icons">people</span>
          <span className="block text-xs">Social</span>
        </a>
        <a className="text-center text-gray-500 hover:text-indigo-600 transition-colors" href="#">
          <span className="material-icons">store</span>
          <span className="block text-xs">Store</span>
        </a>
      </nav>
      <div className="modal fixed inset-0 bg-black bg-opacity-50 items-center justify-center p-4 z-50" id="addHabitModal">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Añadir Nuevo Hábito</h3>
          <form>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="habitName">Nombre del Hábito</label>
                <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" id="habitName" placeholder="Ej: Inmersión Diaria" type="text"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="minMinutes">Mín. (check)</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" id="minMinutes" placeholder="30" type="number"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="optMinutes">Óptimos (meta)</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" id="optMinutes" placeholder="60" type="number"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categorías que cuentan</label>
                <div className="flex items-center gap-2 mb-3">
                  <select className="flex-grow w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                    <option>Inmersión Activa</option>
                    <option>Estudio</option>
                    <option>Lectura</option>
                    <option>Escucha</option>
                  </select>
                  <button className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-200" type="button">Añadir</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                               Inmersión Activa
                               <button className="ml-2 text-indigo-500 hover:text-indigo-800" type="button">
<span className="material-icons text-base">close</span>
</button>
                  </span>
                  <span className="flex items-center bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                               Estudio
                               <button className="ml-2 text-purple-500 hover:text-purple-800" type="button">
<span className="material-icons text-base">close</span>
</button>
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200" onClick={() => closeModal('addHabitModal')} type="button">Cancelar</button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700" type="submit">Añadir Hábito</button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal fixed inset-0 bg-black bg-opacity-50 items-center justify-center p-4 z-50" id="createTemplateModal">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Crear Nueva Plantilla</h3>
          <p className="text-sm text-gray-600 mb-4">Se creará una nueva plantilla con tus hábitos diarios actuales.</p>
          <form>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="templateName">Nombre de la Plantilla</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" id="templateName" placeholder="Ej: Rutina Intensiva" type="text"/>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200" onClick={() => closeModal('createTemplateModal')} type="button">Cancelar</button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700" type="submit">Crear Plantilla</button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal fixed inset-0 bg-black bg-opacity-50 items-center justify-center p-4 z-50" id="renameTemplateModal">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Renombrar Plantilla</h3>
          <form>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="renameTemplateName">Nuevo nombre</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" id="renameTemplateName" type="text" value="Rutina Intensiva"/>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200" onClick={() => closeModal('renameTemplateModal')} type="button">Cancelar</button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700" type="submit">Guardar</button>
            </div>
          </form>
        </div>
      </div>
      {/* The script tags for openModal, closeModal, and event listeners should ideally be handled in a React-friendly way,
          e.g., using useState for modal visibility and useEffect for event listeners.
          For now, I'm leaving them as is, assuming they might be handled globally or through a different mechanism.
          If this causes issues, further refactoring will be needed. */}
      <script>
        {`
        function openModal(modalId) {
            document.getElementById(modalId).classList.add('is-open');
        }
        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('is-open');
        }
        // Close modal on escape key press
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('is-open');
                });
            }
        });
        // Close modal on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.classList.remove('is-open');
                }
            });
        });
        `}
      </script>
    </div>
  );
};

export default RoutinesScreen;
