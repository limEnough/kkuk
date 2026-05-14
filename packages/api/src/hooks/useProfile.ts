import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '../client';
import type { Profile, Hammer } from '../database.types';

export function useProfile(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async (): Promise<Profile | null> => {
      if (!userId) return null;
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      nickname,
      selectedHammerId,
    }: {
      userId: string;
      nickname?: string;
      selectedHammerId?: string;
    }) => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...(nickname !== undefined && { nickname }),
          ...(selectedHammerId !== undefined && {
            selected_hammer_id: selectedHammerId,
          }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['profile', variables.userId] });
    },
  });
}

export function useHammers() {
  return useQuery({
    queryKey: ['hammers'],
    queryFn: async (): Promise<Hammer[]> => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('hammers')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 60, // 1시간 (잘 안 바뀜)
  });
}
