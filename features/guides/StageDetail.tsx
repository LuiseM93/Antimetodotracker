
import React from 'react';
import { AntimethodStage } from '../../types';
import { STAGE_DETAILS } from '../../constants';
import { Card } from '../../components/Card';

interface StageDetailProps {
  stage: AntimethodStage;
}

export const StageDetail: React.FC<StageDetailProps> = ({ stage }) => {
  const details = STAGE_DETAILS[stage];

  if (!details) {
    return <p>Información de la etapa no encontrada.</p>;
  }

  return (
    <Card title={details.name} className={`border-l-4 border-[var(--color-accent)]`}>
      <div className="space-y-3">
        <p className={`text-lg font-semibold text-[var(--color-secondary)]`}>Objetivo Principal:</p>
        <p className={`text-[var(--color-text-main)]`}>{details.objective}</p>
        
        <p className={`text-lg font-semibold text-[var(--color-secondary)] mt-4`}>Descripción Detallada:</p>
        <p className={`text-[var(--color-text-main)] whitespace-pre-line`}>{details.longDescription}</p>
        
        <p className={`text-lg font-semibold text-[var(--color-secondary)] mt-4`}>Consejos Clave:</p>
        <ul className={`list-disc list-inside text-[var(--color-text-main)] space-y-1 pl-2`}>
            <li>Enfócate en contenido que realmente disfrutes.</li>
            <li>La consistencia es más importante que la perfección. Pequeñas sesiones diarias suman mucho.</li>
            <li>No temas cometer errores, son parte del proceso de adquisición.</li>
            { stage === AntimethodStage.TWO && <li>Aumenta el volumen de input. ¡Más series, más videos, más podcasts!</li>}
            { stage === AntimethodStage.THREE && <li>Intenta ver contenido sin subtítulos progresivamente. ¡Desafíate un poco!</li>}
        </ul>
      </div>
    </Card>
  );
};
