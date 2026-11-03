export type ChoiceState = 'idle' | 'right' | 'wrong' | 'faded';

/** Trạng thái một ô sau khi bé chọn: chỉ tô ô bé chọn (không lộ đáp án đúng nếu bé sai) */
export const choiceState = (id: string, picked: string | null, correct: boolean): ChoiceState =>
  picked == null ? 'idle' : id === picked ? (correct ? 'right' : 'wrong') : 'faded';
