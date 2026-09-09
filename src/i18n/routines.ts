import { addedRow, row, type AddedLocalizedText, type LocalizedText } from './matrix';

export const ROUTINE_IDS = [
  '30-minute-full-body',
  'gentle-start',
  'full-body-strength',
  'cardio-base',
  'active-circuit',
  'advanced-bodyweight'
] as const;

export type RoutineId = typeof ROUTINE_IDS[number];

const baseRoutineNames: Readonly<Record<RoutineId, LocalizedText>> = {
  '30-minute-full-body': row('30 Minuten Ganzkörper', '30-minute full body', '30 minuten hele lichaam', '30 minutos de cuerpo completo', 'Corps entier en 30 minutes', 'Всё тело за 30 минут', '30 分钟全身训练', '30분 전신 운동', '30分全身ワークアウト', 'تمرين كامل الجسم لمدة 30 دقيقة'),
  'gentle-start': row('Sanfter Einstieg', 'Gentle start', 'Rustige start', 'Inicio suave', 'Démarrage en douceur', 'Мягкий старт', '轻松入门', '가벼운 시작', 'やさしいスタート', 'بداية لطيفة'),
  'full-body-strength': row('Ganzkörper-Kraftaufbau', 'Full-body strength', 'Kracht voor het hele lichaam', 'Fuerza de cuerpo completo', 'Renforcement du corps entier', 'Силовая тренировка всего тела', '全身力量训练', '전신 근력', '全身筋力トレーニング', 'قوة الجسم بالكامل'),
  'cardio-base': row('Ausdauer-Basis', 'Cardio base', 'Conditiebasis', 'Base de cardio', 'Base cardio', 'Базовая кардиотренировка', '基础有氧训练', '기초 유산소', '有酸素運動の基礎', 'أساس التمارين الهوائية'),
  'active-circuit': row('Aktiver Zirkel', 'Active circuit', 'Actief circuit', 'Circuito activo', 'Circuit actif', 'Активная круговая тренировка', '活力循环训练', '액티브 서킷', 'アクティブサーキット', 'دائرة نشطة'),
  'advanced-bodyweight': row('Fortgeschrittenes Körpergewichtstraining', 'Advanced bodyweight', 'Gevorderd trainen met lichaamsgewicht', 'Peso corporal avanzado', 'Poids du corps avancé', 'Продвинутая тренировка с весом тела', '进阶自重训练', '고급 맨몸 운동', '上級自重トレーニング', 'تمارين وزن الجسم المتقدمة')
};

const addedRoutineNames: Readonly<Record<RoutineId, AddedLocalizedText>> = {
  '30-minute-full-body': addedRow('Corpo inteiro em 30 minutos', 'Corpo intero in 30 minuti', 'Całe ciało w 30 minut', '30 dakikalık tüm vücut', 'Усе тіло за 30 хвилин', '30 मिनट पूरे शरीर का व्यायाम'),
  'gentle-start': addedRow('Início suave', 'Inizio graduale', 'Łagodny start', 'Hafif başlangıç', 'М’який старт', 'हल्की शुरुआत'),
  'full-body-strength': addedRow('Força para o corpo inteiro', 'Forza per tutto il corpo', 'Siła całego ciała', 'Tüm vücut kuvveti', 'Силове тренування всього тіла', 'पूरे शरीर की ताकत'),
  'cardio-base': addedRow('Base de cardio', 'Base cardio', 'Podstawy cardio', 'Kardiyo temeli', 'Базове кардіо', 'कार्डियो आधार'),
  'active-circuit': addedRow('Circuito ativo', 'Circuito attivo', 'Aktywny obwód', 'Aktif devre', 'Активне колове тренування', 'एक्टिव सर्किट'),
  'advanced-bodyweight': addedRow('Peso corporal avançado', 'Corpo libero avanzato', 'Zaawansowany trening z masą ciała', 'İleri seviye vücut ağırlığı', 'Просунуте тренування з вагою тіла', 'उन्नत बॉडीवेट')
};

export const routineNames = Object.fromEntries(ROUTINE_IDS.map((id) => [id, {
  ...baseRoutineNames[id],
  ...addedRoutineNames[id]
}])) as Readonly<Record<RoutineId, LocalizedText & AddedLocalizedText>>;
