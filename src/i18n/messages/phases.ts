import { row } from '../matrix';

export const phaseMessages = {
  'home.phases': row('{count} Phasen', '{count} phases', '{count} fasen', '{count} fases', '{count} phases', '{count} этапов', '{count} 个阶段', '{count}단계', '{count}フェーズ', '{count} مراحل'),
  'phase.label': row('Phase {current} / {total}', 'Phase {current} / {total}', 'Fase {current} / {total}', 'Fase {current} / {total}', 'Phase {current} / {total}', 'Этап {current} / {total}', '阶段 {current} / {total}', '단계 {current} / {total}', 'フェーズ {current} / {total}', 'المرحلة {current} / {total}'),
  'phase.training': row('Training', 'Training', 'Training', 'Entrenamiento', 'Entraînement', 'Тренировка', '训练', '운동', 'トレーニング', 'التمرين'),
  'phase.activeRecovery': row('Aktive Erholung', 'Active recovery', 'Actief herstel', 'Recuperación activa', 'Récupération active', 'Активное восстановление', '主动恢复', '액티브 리커버리', 'アクティブリカバリー', 'تعافٍ نشط'),
  'phase.coolDown': row('Abkühlen und Dehnen', 'Cool-down and stretching', 'Cooling-down en rekken', 'Vuelta a la calma y estiramientos', 'Retour au calme et étirements', 'Заминка и растяжка', '放松与拉伸', '정리 운동과 스트레칭', 'クールダウンとストレッチ', 'تهدئة وإطالة'),
  'editor.phases': row('03 · Phasen', '03 · Phases', '03 · Fasen', '03 · Fases', '03 · Phases', '03 · Этапы', '03 · 阶段', '03 · 단계', '03 · フェーズ', '03 · المراحل'),
  'editor.phaseIntro': row('Runden wiederholen die Übungsfolge; Wiederholungen zählen jeweils eine Bewegung.', 'Rounds repeat the exercise sequence; repetitions count one movement.', 'Rondes herhalen de reeks oefeningen; herhalingen tellen telkens één beweging.', 'Las rondas repiten la secuencia de ejercicios; cada repetición cuenta un movimiento.', 'Les tours répètent la suite d’exercices ; une répétition correspond à un mouvement.', 'Круги повторяют последовательность упражнений; одно повторение считается одним движением.', '每轮会重复动作顺序；一次重复计为一个动作。', '라운드는 운동 순서를 반복하며, 반복 횟수는 동작 한 번을 뜻합니다.', 'ラウンドでは種目の並びを繰り返し、1回の反復を1動作として数えます。', 'تكرر الجولات تسلسل التمارين، ويُحسب كل تكرار حركة واحدة.'),
  'editor.addTrainingBlock': row('Trainingsblock hinzufügen', 'Add training block', 'Trainingsblok toevoegen', 'Añadir bloque de entrenamiento', 'Ajouter un bloc d’entraînement', 'Добавить тренировочный блок', '添加训练区块', '운동 블록 추가', 'トレーニングブロックを追加', 'إضافة مجموعة تدريب'),
  'editor.restAfterPhase': row('Pause nach der Phase (Sekunden)', 'Rest after phase (seconds)', 'Rust na de fase (seconden)', 'Descanso después de la fase (segundos)', 'Repos après la phase (secondes)', 'Отдых после этапа (секунды)', '阶段后休息（秒）', '단계 후 휴식(초)', 'フェーズ後の休憩（秒）', 'الراحة بعد المرحلة (ثوانٍ)'),
  'editor.untimed': row('Ohne Timer', 'Untimed', 'Zonder timer', 'Sin temporizador', 'Sans minuteur', 'Без таймера', '不计时', '타이머 없음', 'タイマーなし', 'دون مؤقت'),
  'editor.removePhase': row('Phase entfernen', 'Remove phase', 'Fase verwijderen', 'Eliminar fase', 'Supprimer la phase', 'Удалить этап', '移除阶段', '단계 제거', 'フェーズを削除', 'إزالة المرحلة')
} as const;

export const addedPhaseMessages = {
  pt: {
    'home.phases': '{count} fases',
    'phase.label': 'Fase {current} / {total}', 'phase.training': 'Treino', 'phase.activeRecovery': 'Recuperação ativa', 'phase.coolDown': 'Volta à calma e alongamento', 'editor.phases': '03 · Fases', 'editor.phaseIntro': 'As rondas repetem a sequência de exercícios; cada repetição conta um movimento.', 'editor.addTrainingBlock': 'Adicionar bloco de treino', 'editor.restAfterPhase': 'Descanso após a fase (segundos)', 'editor.untimed': 'Sem temporizador', 'editor.removePhase': 'Remover fase'
  },
  it: {
    'home.phases': '{count} fasi',
    'phase.label': 'Fase {current} / {total}', 'phase.training': 'Allenamento', 'phase.activeRecovery': 'Recupero attivo', 'phase.coolDown': 'Defaticamento e stretching', 'editor.phases': '03 · Fasi', 'editor.phaseIntro': 'I giri ripetono la sequenza di esercizi; ogni ripetizione conta un movimento.', 'editor.addTrainingBlock': 'Aggiungi blocco di allenamento', 'editor.restAfterPhase': 'Riposo dopo la fase (secondi)', 'editor.untimed': 'Senza timer', 'editor.removePhase': 'Rimuovi fase'
  },
  pl: {
    'home.phases': '{count} faz',
    'phase.label': 'Faza {current} / {total}', 'phase.training': 'Trening', 'phase.activeRecovery': 'Aktywna regeneracja', 'phase.coolDown': 'Wyciszenie i rozciąganie', 'editor.phases': '03 · Fazy', 'editor.phaseIntro': 'Rundy powtarzają sekwencję ćwiczeń; jedno powtórzenie oznacza jeden ruch.', 'editor.addTrainingBlock': 'Dodaj blok treningowy', 'editor.restAfterPhase': 'Odpoczynek po fazie (sekundy)', 'editor.untimed': 'Bez timera', 'editor.removePhase': 'Usuń fazę'
  },
  tr: {
    'home.phases': '{count} aşama',
    'phase.label': 'Aşama {current} / {total}', 'phase.training': 'Antrenman', 'phase.activeRecovery': 'Aktif toparlanma', 'phase.coolDown': 'Soğuma ve esneme', 'editor.phases': '03 · Aşamalar', 'editor.phaseIntro': 'Turlar egzersiz sırasını tekrarlar; her tekrar bir hareket sayılır.', 'editor.addTrainingBlock': 'Antrenman bloğu ekle', 'editor.restAfterPhase': 'Aşama sonrası dinlenme (saniye)', 'editor.untimed': 'Zamanlayıcısız', 'editor.removePhase': 'Aşamayı kaldır'
  },
  uk: {
    'home.phases': '{count} етапів',
    'phase.label': 'Етап {current} / {total}', 'phase.training': 'Тренування', 'phase.activeRecovery': 'Активне відновлення', 'phase.coolDown': 'Заминка й розтягування', 'editor.phases': '03 · Етапи', 'editor.phaseIntro': 'Кола повторюють послідовність вправ; одне повторення означає один рух.', 'editor.addTrainingBlock': 'Додати тренувальний блок', 'editor.restAfterPhase': 'Відпочинок після етапу (секунди)', 'editor.untimed': 'Без таймера', 'editor.removePhase': 'Видалити етап'
  },
  hi: {
    'home.phases': '{count} चरण',
    'phase.label': 'चरण {current} / {total}', 'phase.training': 'प्रशिक्षण', 'phase.activeRecovery': 'सक्रिय रिकवरी', 'phase.coolDown': 'कूल-डाउन और स्ट्रेचिंग', 'editor.phases': '03 · चरण', 'editor.phaseIntro': 'हर राउंड में व्यायाम क्रम दोहरता है; एक दोहराव को एक गति माना जाता है।', 'editor.addTrainingBlock': 'प्रशिक्षण ब्लॉक जोड़ें', 'editor.restAfterPhase': 'चरण के बाद आराम (सेकंड)', 'editor.untimed': 'बिना टाइमर', 'editor.removePhase': 'चरण हटाएँ'
  }
} as const;
