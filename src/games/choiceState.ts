export type ChoiceState = 'idle' | 'right' | 'wrong' | 'faded';

/** Trạng thái một ô lựa chọn */
export const choiceState = (id: string, answer: string, wrong: string[], done: boolean): ChoiceState =>
  done ? (id === answer ? 'right' : 'faded') : wrong.includes(id) ? 'wrong' : 'idle';
