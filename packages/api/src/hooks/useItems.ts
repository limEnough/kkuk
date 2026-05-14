import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '../client';
import type { Item } from '../database.types';

const ITEMS_KEY = ['items'] as const;

/**
 * 참을 항목 목록 조회
 * 정렬 규칙: 기본 항목(is_default=true) 먼저 sort_order 순,
 *           그 다음 사용자 추가 항목이 created_at 순으로 뒤따름.
 */
export function useItems() {
  return useQuery({
    queryKey: ITEMS_KEY,
    queryFn: async (): Promise<Item[]> => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('is_default', { ascending: false })
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
}

export interface CreateItemInput {
  label: string;
  emoji: string;
  subText?: string | null;
  userId: string;
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ label, emoji, subText, userId }: CreateItemInput) => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('items')
        .insert({
          label,
          emoji,
          sub_text: subText ?? null,
          user_id: userId,
          is_default: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ITEMS_KEY });
    },
  });
}

export interface UpdateItemInput {
  id: string;
  label?: string;
  emoji?: string;
  subText?: string | null;
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, label, emoji, subText }: UpdateItemInput) => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('items')
        .update({
          ...(label !== undefined && { label }),
          ...(emoji !== undefined && { emoji }),
          ...(subText !== undefined && { sub_text: subText }),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ITEMS_KEY });
    },
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ITEMS_KEY });
    },
  });
}
