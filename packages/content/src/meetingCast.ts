/** 開発会議にのみ登場する脇役。画面IDを持つ executives.ts の統括陣とは別枠。 */
export type MeetingCastId = 'design-chief' | 'design-associate';

export type MeetingCastDefinition = {
  id: MeetingCastId;
  role: string;
  name: string;
  focus: string;
};

export const meetingCast: readonly MeetingCastDefinition[] = [
  { id: 'design-chief', role: '設計課長', name: '本庄 悠', focus: '先進機能の具申。実現へ向けた段取りを主導する。' },
  { id: 'design-associate', role: '設計係長', name: '柚木 蒼太', focus: '新奇性のある提案。誰もやっていない着眼点を探す。' },
];

export function findMeetingCast(id: MeetingCastId): MeetingCastDefinition {
  const cast = meetingCast.find(candidate => candidate.id === id);
  if (!cast) throw new RangeError(`会議出席者の定義がありません: ${id}`);
  return cast;
}
