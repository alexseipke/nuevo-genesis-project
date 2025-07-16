import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  FolderOpen, 
  Trash2, 
  Edit, 
  Calendar,
  MapPin
} from 'lucide-react';
import { useProjects, Project } from '@/hooks/useProjects';
import { MissionParameters } from '@/types/mission';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectManagerProps {
  currentMissionType: string | null;
  currentParameters: MissionParameters;
  onLoadProject: (project: Project) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  currentMissionType,
  currentParameters,
  onLoadProject,
}) => {
  const { projects, loading, saveProject, deleteProject } = useProjects();
  const { user } = useAuth();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveProject = async () => {
    if (!currentMissionType || !projectName.trim()) return;

    setSaving(true);
    const success = await saveProject(
      projectName.trim(),
      projectDescription.trim(),
      currentMissionType,
      currentParameters
    );

    if (success) {
      setSaveDialogOpen(false);
      setProjectName('');
      setProjectDescription('');
    }
    setSaving(false);
  };

  const handleLoadProject = (project: Project) => {
    onLoadProject(project);
    setLoadDialogOpen(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      await deleteProject(projectId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMissionTypeLabel = (type: string) => {
    switch (type) {
      case 'orbita-inteligente':
        return 'Órbita Inteligente';
      case 'corredor-inteligente':
        return 'Corredor Inteligente';
      case 'grandes-areas':
        return 'Grandes Áreas';
      case 'inspecciones-verticales':
        return 'Inspecciones Verticales';
      case 'vias-caminos':
        return 'Vías y Caminos';
      default:
        return type;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {/* Save Project Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={!currentMissionType}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Guardar
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Guardar Proyecto</DialogTitle>
            <DialogDescription>
              Guarda tu configuración actual como un proyecto reutilizable
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Nombre del proyecto</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Mi misión de inspección"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Descripción (opcional)</Label>
              <Textarea
                id="project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Descripción de la misión..."
                maxLength={500}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSaveDialogOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveProject}
                disabled={!projectName.trim() || saving}
              >
                {saving ? 'Guardando...' : 'Guardar Proyecto'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Project Dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Cargar
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mis Proyectos</DialogTitle>
            <DialogDescription>
              Selecciona un proyecto guardado para cargar su configuración
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Cargando proyectos...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No tienes proyectos guardados aún</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {projects.map((project) => (
                  <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{project.name}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {project.description || 'Sin descripción'}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {getMissionTypeLabel(project.mission_type)}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(project.updated_at)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleLoadProject(project)}
                        >
                          Cargar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};