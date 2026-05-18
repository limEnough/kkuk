import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '../client';
import type { PressRecord } from '../database.types';

const RECORDS_KEY = ['press_records'] as const;

/** 참은 기록 저장 — 꾹 누르기 완료 시 호출 */
export function useCreatePressRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      userId: string;
      itemId: string | null;
      itemLabel: string;
      itemEmoji: string;
      durationMs: number;
      messageId: string;
      messageContent: string;
    }) => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('press_records')
        .insert({
          user_id: input.userId,
          item_id: input.itemId,
          item_label_snapshot: input.itemLabel,
          item_emoji_snapshot: input.itemEmoji,
          duration_ms: Math.round(input.durationMs), // int 컬럼 — 소수 ms 방지

          message_id: input.messageId,
          message_content: input.messageContent,
        })
        .select()
        .single();

      if (error) throw error;

      // 획득 문장 도감에도 upsert
      await supabase
        .from('collected_messages')
        .upsert(
          {
            user_id: input.userId,
            message_id: input.messageId,
            message_content: input.messageContent,
            collect_count: 1,
          },
          { onConflict: 'user_id,message_id', ignoreDuplicates: false },
        )
        .select();

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RECORDS_KEY });
      qc.invalidateQueries({ queryKey: ['collected_messages'] });
    },
  });
}

/** 특정 월의 기록 조회 — 캘린더 */
export function useMonthlyRecords(year: number, month: number) {
  return useQuery({
    queryKey: [...RECORDS_KEY, 'monthly', year, month],
    queryFn: async (): Promise<PressRecord[]> => {
      const supabase = getSupabaseClient();
      const start = new Date(year, month - 1, 1).toISOString();
      const end = new Date(year, month, 1).toISOString();

      const { data, error } = await supabase
        .from('press_records')
        .select('*')
        .gte('created_at', start)
        .lt('created_at', end)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
}

/** 획득한 응원 문장 도감 */
export function useCollectedMessages() {
  return useQuery({
    queryKey: ['collected_messages'],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('collected_messages')
        .select('*')
        .order('first_collected_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
}
