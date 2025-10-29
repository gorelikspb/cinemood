export const EMOTION_TYPES = [
  'happy', 'sad', 'excited', 'nostalgic', 'thoughtful', 
  'scared', 'romantic', 'angry', 'surprised', 'disgusted',
  'tense', 'shocked', 'thrilled', 'melancholic', 'peaceful'
] as const;

export type EmotionType = typeof EMOTION_TYPES[number];

interface EmotionData {
  emoji: string;
  tooltipKey: EmotionType;
}

export const EMOTION_DATA: Record<EmotionType, EmotionData> = {
  happy: { emoji: '😊', tooltipKey: 'happy' },
  sad: { emoji: '😢', tooltipKey: 'sad' },
  excited: { emoji: '🤩', tooltipKey: 'excited' },
  nostalgic: { emoji: '🥺', tooltipKey: 'nostalgic' },
  thoughtful: { emoji: '🤔', tooltipKey: 'thoughtful' },
  scared: { emoji: '😨', tooltipKey: 'scared' },
  romantic: { emoji: '🥰', tooltipKey: 'romantic' },
  angry: { emoji: '😠', tooltipKey: 'angry' },
  surprised: { emoji: '😲', tooltipKey: 'surprised' },
  disgusted: { emoji: '🤢', tooltipKey: 'disgusted' },
  tense: { emoji: '😰', tooltipKey: 'tense' },
  shocked: { emoji: '😱', tooltipKey: 'shocked' },
  thrilled: { emoji: '😍', tooltipKey: 'thrilled' },
  melancholic: { emoji: '😔', tooltipKey: 'melancholic' },
  peaceful: { emoji: '😌', tooltipKey: 'peaceful' }
};

// Helper function to get emotion data with translation
export const getEmotionData = (emotionType: string, t: any) => {
  const data = EMOTION_DATA[emotionType as EmotionType];
  if (!data) {
    return { emoji: '😐', tooltip: 'Unknown emotion' };
  }
  return {
    emoji: data.emoji,
    tooltip: t[data.tooltipKey] as string
  };
};
