
import React, { useState } from 'react';
import { AntimethodStage } from '../../types.ts';
import { StageDetail } from './StageDetail.tsx';
import { ResourceList } from './ResourceList.tsx';
import { STAGE_DETAILS, ANTIMETHOD_ACTIVITIES_DETAILS } from '../../constants.ts';
import { Button } from '../../components/Button.tsx';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { Card } from '../../components/Card.tsx';
import { Modal } from '../../components/Modal.tsx'; 
import { ArrowUpTrayIcon } from '../../components/icons/ArrowUpTrayIcon.tsx'; 
import { ExternalLinkIcon } from '../../components/icons/ExternalLinkIcon.tsx';

type GuideView = 'activities' | 'stages' | 'resources';

const inputBaseStyle = "mt-1 block w-full sm:w-auto p-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-md shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";

const AI_IMPORT_GUIDE_URL = "https://luisem93.github.io/ElAntimetodo/importar-tracker";

export const GuidesScreen: React.FC = () => {
  const { userProfile } = useAppContext();
  const [activeView, setActiveView] = useState<GuideView>('activities'); 
  const [isImportGuideModalOpen, setIsImportGuideModalOpen] = useState(false);
  
  const initialStage = userProfile?.currentStage || AntimethodStage.ONE;
  const [selectedStage, setSelectedStage] = useState<AntimethodStage>(initialStage);

  const validStagesForSelection = (Object.keys(STAGE_DETAILS)
    .map(Number)
    .filter(stageKey => Object.values(AntimethodStage).includes(stageKey as AntimethodStage)) 
  ) as AntimethodStage[];
  
  const modalFooterContent = (
    <div className="flex justify-end items-center w-full gap-2">
      <Button onClick={() => setIsImportGuideModalOpen(false)} variant="ghost" size="md">
        Cerrar
      </Button>
    </div>
  );


  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className={`text-3xl font-poppins font-bold text-[var(--color-primary)] mb-4 sm:mb-0`}>Guía y Recursos</h1>
        <div className="flex space-x-2 flex-wrap gap-2">
          <Button variant={activeView === 'activities' ? 'primary' : 'outline'} onClick={() => setActiveView('activities')}>
            Actividades Clave
          </Button>
          <Button variant={activeView === 'stages' ? 'primary' : 'outline'} onClick={() => setActiveView('stages')}>
            Guía de Etapas
          </Button>
          <Button variant={activeView === 'resources' ? 'primary' : 'outline'} onClick={() => setActiveView('resources')}>
            Recursos Útiles
          </Button>
        </div>
      </div>

      <Card title="Utilidades Adicionales" className="mt-4">
        <Button 
            onClick={() => setIsImportGuideModalOpen(true)}
            variant="secondary"
            leftIcon={<ArrowUpTrayIcon className="w-5 h-5"/>}
            className="w-full sm:w-auto"
        >
            Guía para Importar Historial con IA
        </Button>
      </Card>


      {activeView === 'activities' && (
        <div>
          <h2 className={`text-2xl font-poppins font-semibold text-[var(--color-primary)] mb-3`}>Actividades Clave del Antimétodo</h2>
          <p className={`text-[var(--color-text-main)] mb-6`}>
            Estas son las prácticas fundamentales recomendadas por El Antimétodo. Entender cada una te ayudará a aplicar la filosofía de manera efectiva.
          </p>
          <div className="space-y-4">
            {ANTIMETHOD_ACTIVITIES_DETAILS.map(activity => (
              <Card key={activity.name} title={activity.name} className="shadow-md">
                <p className={`text-[var(--color-text-main)]`}>{activity.description}</p>
                {activity.category && (
                    <p className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                        Categoría principal para registro: <span className="font-semibold">{activity.category}</span>
                    </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeView === 'stages' && (
        <div>
          <h2 className={`text-2xl font-poppins font-semibold text-[var(--color-primary)] mb-2`}>Las Etapas del Antimétodo</h2>
          <p className={`text-[var(--color-text-main)] mb-3`}>Un camino claro hacia la fluidez natural.</p>
          <p className={`text-[var(--color-text-main)] mb-3`}>
            El Antimétodo se divide en etapas progresivas, diseñadas para llevarte de la mano desde los
            conceptos básicos hasta la comunicación efectiva. Cada etapa se enfoca en habilidades específicas,
            construyendo una base sólida para la siguiente.
          </p>
          <p className={`text-[var(--color-text-main)] mb-6`}>
            Para una guía más detallada sobre cómo organizar tu tiempo en cada etapa y ejemplos prácticos,
            visita nuestra sección de Rutinas. Si tienes dudas, la sección de Preguntas Frecuentes (FAQ) tiene
            muchas respuestas. Y para herramientas específicas, ¡no olvides consultar nuestros Recursos!
          </p>
          
          <p className={`text-[var(--color-text-main)] mb-6`}>
            Tu etapa actual es: <strong className={`text-[var(--color-accent)]`}>{STAGE_DETAILS[userProfile?.currentStage || AntimethodStage.ONE]?.name || 'No definida'}</strong>.
          </p>
          <div className="mb-6">
            <label htmlFor="stageSelector" className={`block text-sm font-medium text-[var(--color-text-main)] mb-1`}>Selecciona una etapa para ver detalles:</label>
            <select
              id="stageSelector"
              value={selectedStage}
              onChange={(e) => setSelectedStage(Number(e.target.value) as AntimethodStage)}
              className={inputBaseStyle}
            >
              {validStagesForSelection.map(stageVal => (
                 <option key={stageVal} value={stageVal}>
                     {STAGE_DETAILS[stageVal]?.name || `Etapa ${stageVal}`}
                 </option>
              ))}
            </select>
          </div>
          {STAGE_DETAILS[selectedStage] ? (
            <StageDetail stage={selectedStage} />
          ) : (
            <p className={`text-[var(--color-text-light)]`}>Por favor, selecciona una etapa válida.</p>
          )}
        </div>
      )}

      {activeView === 'resources' && (
        <div>
           <h2 className={`text-2xl font-poppins font-semibold text-[var(--color-primary)] mb-3`}>Explorador de Recursos</h2>
          <p className={`text-[var(--color-text-main)] mb-6`}>
            Descubre herramientas y recursos gratuitos y de pago recomendados para complementar tu aprendizaje de idiomas, organizados por categoría.
          </p>
          <ResourceList />
        </div>
      )}

      <Modal 
        isOpen={isImportGuideModalOpen} 
        onClose={() => setIsImportGuideModalOpen(false)}
        title="Guía de Importación con IA"
        size="md"
        footerContent={modalFooterContent}
      >
        <div className="space-y-4">
            <p className="text-[var(--color-text-main)]">
                Para obtener instrucciones detalladas sobre cómo importar tu historial de actividades desde otros trackers utilizando Inteligencia Artificial, por favor visita nuestra guía completa en línea.
            </p>
            <p className="text-[var(--color-text-main)]">
                Allí encontrarás el prompt necesario y todos los pasos a seguir.
            </p>
            <Button
                variant="primary"
                onClick={() => window.open(AI_IMPORT_GUIDE_URL, '_blank', 'noopener,noreferrer')}
                leftIcon={<ExternalLinkIcon className="w-5 h-5"/>}
                className="w-full"
            >
                Visitar Guía de Importación
            </Button>
        </div>
      </Modal>

    </div>
  );
};