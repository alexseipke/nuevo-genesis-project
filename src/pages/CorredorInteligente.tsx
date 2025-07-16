import React from 'react';
import { Header } from '@/components/Header';

const CorredorInteligente: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-gradient-sky">
      <Header 
        onExportKMZ={() => {}}
        onExportLitchi={() => {}}
        canExport={false}
        missionType="Corredor Inteligente"
      />
      
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Corredor Inteligente
          </h1>
          <p className="text-xl text-muted-foreground">
            En desarrollo... 🚧
          </p>
          <p className="text-muted-foreground mt-2">
            Esta funcionalidad se implementará próximamente
          </p>
        </div>
      </div>
    </div>
  );
};

export default CorredorInteligente;