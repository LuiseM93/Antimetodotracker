
import React from 'react';
import { Resource } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export const ResourceList: React.FC = () => {
  const { resources } = useAppContext(); 

  const groupedResources = resources.reduce((acc, resource) => {
    (acc[resource.category] = acc[resource.category] || []).push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  if (resources.length === 0) {
    return <p className={`text-[var(--color-text-light)]`}>No hay recursos disponibles en este momento.</p>;
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedResources).map(([category, items]) => (
        <Card key={category} title={category} className={`border-l-4 border-[var(--color-secondary)]`}>
          <ul className="space-y-4">
            {items.map(resource => (
              <li key={resource.id} className={`p-4 bg-white rounded-lg shadow-sm border border-[var(--color-light-purple)]`}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                  <h4 className={`text-lg font-poppins font-semibold text-[var(--color-primary)]`}>{resource.name}</h4>
                  {resource.isCommunityRecommended && (
                    <span className={`px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full`}>
                      Recomendado
                    </span>
                  )}
                </div>
                <p className={`text-sm text-[var(--color-text-main)] mb-3`}>{resource.description}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(resource.link, '_blank', 'noopener,noreferrer')}
                >
                  Visitar Recurso
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
};
