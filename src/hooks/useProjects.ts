import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MissionParameters } from '@/types/mission';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  mission_type: string;
  parameters: MissionParameters;
  created_at: string;
  updated_at: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProjects = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProjects((data || []).map(item => ({
        ...item,
        parameters: item.parameters as unknown as MissionParameters
      })));
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los proyectos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProject = async (
    name: string,
    description: string,
    missionType: string,
    parameters: MissionParameters
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para guardar proyectos",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name,
          description,
          mission_type: missionType,
          parameters: parameters as any,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Proyecto guardado",
        description: `El proyecto "${name}" se ha guardado correctamente`,
      });

      await fetchProjects(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el proyecto",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateProject = async (
    id: string,
    name: string,
    description: string,
    parameters: MissionParameters
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name,
          description,
          parameters: parameters as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Proyecto actualizado",
        description: `El proyecto "${name}" se ha actualizado correctamente`,
      });

      await fetchProjects();
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el proyecto",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Proyecto eliminado",
        description: "El proyecto se ha eliminado correctamente",
      });

      await fetchProjects();
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el proyecto",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
    }
  }, [user]);

  return {
    projects,
    loading,
    saveProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
};