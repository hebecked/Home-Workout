import { row, type FirstReleaseBaseLocale, type LocalizedText } from './matrix';

export const EXERCISE_IDS = [
  'squat', 'sumo-squat', 'reverse-lunge', 'forward-lunge', 'split-squat', 'glute-bridge',
  'single-leg-glute-bridge', 'calf-raise', 'wall-sit', 'sumo-squat-hold', 'push-up',
  'scapular-push-up', 'incline-push-up', 'knee-push-up', 'pike-push-up', 'pull-up',
  'assisted-pull-up', 'chin-up', 'resistance-band-row', 'resistance-band-pull-apart',
  'dead-bug', 'lying-leg-raise', 'bird-dog', 'plank', 'side-plank', 'mountain-climber',
  'hollow-hold', 'jumping-jack', 'step-jack', 'high-knees', 'marching-in-place',
  'shadow-boxing', 'burpee', 'squat-to-reach', 'superman', 'superman-dynamic',
  'triceps-dip', 'heel-dig', 'shoulder-roll', 'arm-circle', 'active-recovery', 'leg-swing',
  'calf-stretch', 'hamstring-stretch', 'quadriceps-stretch', 'hip-flexor-stretch',
  'shoulder-upper-back-stretch', 'chest-stretch', 'child-pose', 'cat-cow', 'cobra-stretch',
  'yoga-bridge'
] as const;

export type ExerciseId = typeof EXERCISE_IDS[number];

/** Localized catalogue names. Every row must directly provide all supported locales. */
export const exerciseNames: Readonly<Record<ExerciseId, LocalizedText>> = {
  'squat': row('Kniebeuge', 'Squat', 'Squat', 'Sentadilla', 'Squat', 'Приседание', '深蹲', '스쿼트', 'スクワット', 'قرفصاء'),
  'sumo-squat': row('Sumo-Kniebeuge', 'Sumo squat', 'Sumosquat', 'Sentadilla sumo', 'Squat sumo', 'Приседание сумо', '相扑深蹲', '스모 스쿼트', 'スモウスクワット', 'قرفصاء السومو'),
  'reverse-lunge': row('Rückwärts-Ausfallschritt', 'Reverse lunge', 'Achterwaartse uitvalspas', 'Zancada hacia atrás', 'Fente arrière', 'Обратный выпад', '后撤弓步', '리버스 런지', 'リバースランジ', 'اندفاع خلفي'),
  'forward-lunge': row('Vorwärts-Ausfallschritt', 'Forward lunge', 'Voorwaartse uitvalspas', 'Zancada hacia delante', 'Fente avant', 'Выпад вперёд', '前弓步', '포워드 런지', 'フォワードランジ', 'اندفاع أمامي'),
  'split-squat': row('Geteilte Kniebeuge', 'Split squat', 'Splitsquat', 'Sentadilla dividida', 'Squat bulgare au sol', 'Разножка', '分腿蹲', '스플릿 스쿼트', 'スプリットスクワット', 'قرفصاء متباعدة'),
  'glute-bridge': row('Beckenheben', 'Glute bridge', 'Heupbrug', 'Puente de glúteos', 'Pont fessier', 'Ягодичный мостик', '臀桥', '글루트 브리지', 'グルートブリッジ', 'جسر الأرداف'),
  'single-leg-glute-bridge': row('Einbeiniges Beckenheben', 'Single-leg glute bridge', 'Heupbrug op één been', 'Puente de glúteos a una pierna', 'Pont fessier sur une jambe', 'Ягодичный мостик на одной ноге', '单腿臀桥', '싱글 레그 글루트 브리지', 'シングルレッグ・グルートブリッジ', 'جسر الأرداف بساق واحدة'),
  'calf-raise': row('Wadenheben', 'Calf raise', 'Kuitheffen', 'Elevación de talones', 'Élévation des mollets', 'Подъём на носки', '提踵', '카프 레이즈', 'カーフレイズ', 'رفع الساقين على أطراف القدم'),
  'wall-sit': row('Wandsitz', 'Wall sit', 'Muurzit', 'Sentadilla en pared', 'Chaise contre un mur', 'Стульчик у стены', '靠墙静蹲', '월 싯', 'ウォールシット', 'جلوس الحائط'),
  'sumo-squat-hold': row('Sumo-Kniebeugen-Halten', 'Sumo squat hold', 'Sumosquat vasthouden', 'Sentadilla sumo isométrica', 'Maintien du squat sumo', 'Удержание приседа сумо', '相扑深蹲保持', '스모 스쿼트 홀드', 'スモウスクワット・ホールド', 'ثبات قرفصاء السومو'),
  'push-up': row('Liegestütz', 'Push-up', 'Opdrukken', 'Flexión', 'Pompe', 'Отжимание', '俯卧撑', '푸시업', 'プッシュアップ', 'تمرين الضغط'),
  'scapular-push-up': row('Schulterblatt-Liegestütz', 'Scapular push-up', 'Schouderbladopdruk', 'Flexión escapular', 'Pompe scapulaire', 'Лопаточное отжимание', '肩胛俯卧撑', '스캐퓰러 푸시업', 'スキャプラ・プッシュアップ', 'ضغط لوح الكتف'),
  'incline-push-up': row('Erhöhter Liegestütz', 'Incline push-up', 'Schuine opdruk', 'Flexión inclinada', 'Pompe inclinée', 'Отжимание от опоры', '上斜俯卧撑', '인클라인 푸시업', 'インクライン・プッシュアップ', 'تمرين ضغط مائل'),
  'knee-push-up': row('Knie-Liegestütz', 'Knee push-up', 'Knieopdruk', 'Flexión de rodillas', 'Pompe sur les genoux', 'Отжимание с колен', '跪姿俯卧撑', '니 푸시업', 'ニープッシュアップ', 'تمرين الضغط على الركبتين'),
  'pike-push-up': row('Pike-Liegestütz', 'Pike push-up', 'Pike-opdruk', 'Flexión pike', 'Pompe en V', 'Отжимание уголком', '折刀俯卧撑', '파이크 푸시업', 'パイクプッシュアップ', 'تمرين ضغط بايك'),
  'pull-up': row('Klimmzug', 'Pull-up', 'Optrekken', 'Dominada prona', 'Traction pronation', 'Подтягивание прямым хватом', '正握引体向上', '풀업', 'プルアップ', 'عقلة بقبضة علوية'),
  'assisted-pull-up': row('Unterstützter Klimmzug', 'Assisted pull-up', 'Ondersteund optrekken', 'Dominada asistida', 'Traction assistée', 'Подтягивание с поддержкой', '辅助引体向上', '어시스티드 풀업', 'アシスト・プルアップ', 'عقلة بمساعدة'),
  'chin-up': row('Untergriff-Klimmzug', 'Chin-up', 'Optrekken met onderhandse greep', 'Dominada supina', 'Traction supination', 'Подтягивание обратным хватом', '反握引体向上', '친업', 'チンアップ', 'عقلة بقبضة سفلية'),
  'resistance-band-row': row('Bandrudern', 'Resistance-band row', 'Roeien met weerstandsband', 'Remo con banda', 'Tirage avec élastique', 'Тяга эспандера', '弹力带划船', '밴드 로우', 'レジスタンスバンド・ロウ', 'سحب بشريط المقاومة'),
  'resistance-band-pull-apart': row('Band auseinanderziehen', 'Resistance-band pull-apart', 'Weerstandsband uit elkaar trekken', 'Apertura con banda', 'Écarté avec élastique', 'Разведение эспандера', '弹力带拉开', '밴드 풀어파트', 'バンド・プルアパート', 'فتح شريط المقاومة'),
  'dead-bug': row('Käfer', 'Dead bug', 'Dead bug', 'Bicho muerto', 'Dead bug', 'Мёртвый жук', '死虫式', '데드 버그', 'デッドバグ', 'الحشرة الميتة'),
  'lying-leg-raise': row('Beinheben im Liegen', 'Lying leg raise', 'Liggend beenheffen', 'Elevación de piernas tumbado', 'Relevé de jambes allongé', 'Подъём ног лёжа', '仰卧举腿', '라잉 레그 레이즈', 'ライイング・レッグレイズ', 'رفع الساقين مستلقيًا'),
  'bird-dog': row('Vierfüßler diagonal', 'Bird dog', 'Bird dog', 'Perro de muestra', 'Bird dog', 'Птица-собака', '鸟狗式', '버드 독', 'バードドッグ', 'تمرين بيرد دوغ'),
  'plank': row('Unterarmstütz', 'Plank', 'Plank', 'Plancha', 'Planche', 'Планка', '平板支撑', '플랭크', 'プランク', 'بلانك'),
  'side-plank': row('Seitstütz', 'Side plank', 'Zijplank', 'Plancha lateral', 'Planche latérale', 'Боковая планка', '侧平板支撑', '사이드 플랭크', 'サイドプランク', 'بلانك جانبي'),
  'mountain-climber': row('Bergsteiger', 'Mountain climber', 'Bergbeklimmer', 'Escalador', 'Mountain climber', 'Скалолаз', '登山者', '마운틴 클라이머', 'マウンテンクライマー', 'متسلق الجبال'),
  'hollow-hold': row('Hollow Hold', 'Hollow hold', 'Hollow hold', 'Hollow hold', 'Gainage hollow', 'Удержание лодочки', '中空保持', '할로우 홀드', 'ホローホールド', 'ثبات التجويف'),
  'jumping-jack': row('Hampelmann', 'Jumping jack', 'Jumping jack', 'Salto de tijera', 'Jumping jack', 'Прыжки ноги-врозь', '开合跳', '점핑 잭', 'ジャンピングジャック', 'قفز فتح وضم'),
  'step-jack': row('Seitlicher Step Jack', 'Step jack', 'Step jack', 'Paso de tijera', 'Step jack', 'Шаги ноги-врозь', '侧步开合', '스텝 잭', 'ステップジャック', 'خطوة فتح وضم'),
  'high-knees': row('Kniehebelauf', 'High knees', 'Knieheffen', 'Rodillas altas', 'Montées de genoux', 'Бег с высоким подниманием колен', '高抬腿', '하이 니즈', 'ハイニー', 'رفع الركبتين عاليًا'),
  'marching-in-place': row('Marschieren am Platz', 'Marching in place', 'Marcheren op de plaats', 'Marcha en el sitio', 'Marche sur place', 'Ходьба на месте', '原地踏步', '제자리 걷기', 'その場足踏み', 'المشي في المكان'),
  'shadow-boxing': row('Schattenboxen', 'Shadowboxing', 'Schaduwboksen', 'Boxeo de sombra', 'Boxe dans le vide', 'Бой с тенью', '空击拳', '섀도복싱', 'シャドーボクシング', 'ملاكمة الظل'),
  'burpee': row('Burpee', 'Burpee', 'Burpee', 'Burpee', 'Burpee', 'Бёрпи', '波比跳', '버피', 'バーピー', 'تمرين بيربي'),
  'squat-to-reach': row('Kniebeuge mit Strecken', 'Squat to reach', 'Squat met reiken', 'Sentadilla con alcance', 'Squat avec extension', 'Приседание с вытягиванием', '深蹲上举', '스쿼트 투 리치', 'スクワット・トゥ・リーチ', 'قرفصاء مع مد الذراعين'),
  'superman': row('Superman', 'Superman', 'Superman', 'Superman', 'Superman', 'Супермен', '超人式', '슈퍼맨', 'スーパーマン', 'سوبرمان'),
  'superman-dynamic': row('Superman dynamisch', 'Dynamic Superman', 'Dynamische Superman', 'Superman dinámico', 'Superman dynamique', 'Динамический супермен', '动态超人式', '다이내믹 슈퍼맨', 'ダイナミック・スーパーマン', 'سوبرمان ديناميكي'),
  'triceps-dip': row('Trizeps-Dip', 'Triceps dip', 'Tricepsdip', 'Fondo de tríceps', 'Dips triceps', 'Отжимание на трицепс от опоры', '肱三头肌臂屈伸', '트라이셉스 딥', 'トライセプスディップ', 'غطس العضلة ثلاثية الرؤوس'),
  'heel-dig': row('Fersen-Tippen', 'Heel digs', 'Hakken tikken', 'Toques de talón', 'Talons en avant', 'Касания пяткой', '脚跟点地', '힐 디그', 'ヒールディグ', 'لمس الكعب'),
  'shoulder-roll': row('Schulterkreisen', 'Shoulder rolls', 'Schouderrollen', 'Círculos de hombros', 'Roulements d’épaules', 'Круги плечами', '肩部绕环', '숄더 롤', 'ショルダーロール', 'تدوير الكتفين'),
  'arm-circle': row('Armkreisen', 'Arm circles', 'Armcirkels', 'Círculos de brazos', 'Cercles de bras', 'Круги руками', '手臂绕环', '암 서클', 'アームサークル', 'دوائر الذراعين'),
  'active-recovery': row('Aktive Erholung', 'Active recovery', 'Actief herstel', 'Recuperación activa', 'Récupération active', 'Активное восстановление', '主动恢复', '액티브 리커버리', 'アクティブリカバリー', 'تعافٍ نشط'),
  'leg-swing': row('Beinschwingen', 'Leg swings', 'Beenzwaaien', 'Balanceos de pierna', 'Balancements de jambe', 'Махи ногой', '摆腿', '레그 스윙', 'レッグスイング', 'مرجحة الساق'),
  'calf-stretch': row('Waden-Dehnung', 'Calf stretch', 'Kuitrek', 'Estiramiento de gemelos', 'Étirement du mollet', 'Растяжка икр', '小腿拉伸', '종아리 스트레칭', 'ふくらはぎストレッチ', 'إطالة ربلة الساق'),
  'hamstring-stretch': row('Oberschenkelrückseiten-Dehnung', 'Hamstring stretch', 'Hamstringrek', 'Estiramiento de isquiotibiales', 'Étirement des ischio-jambiers', 'Растяжка задней поверхности бедра', '腘绳肌拉伸', '햄스트링 스트레칭', 'ハムストリングストレッチ', 'إطالة أوتار الركبة'),
  'quadriceps-stretch': row('Oberschenkelvorderseiten-Dehnung', 'Quadriceps stretch', 'Quadricepsrek', 'Estiramiento de cuádriceps', 'Étirement des quadriceps', 'Растяжка квадрицепса', '股四头肌拉伸', '대퇴사두근 스트레칭', '大腿四頭筋ストレッチ', 'إطالة العضلة الرباعية'),
  'hip-flexor-stretch': row('Hüftbeuger-Dehnung', 'Hip-flexor stretch', 'Heupbuigerrek', 'Estiramiento del flexor de cadera', 'Étirement des fléchisseurs de hanche', 'Растяжка сгибателей бедра', '髋屈肌拉伸', '고관절 굴곡근 스트레칭', '股関節屈筋ストレッチ', 'إطالة مثنيات الورك'),
  'shoulder-upper-back-stretch': row('Schulter- und oberer Rücken-Stretch', 'Shoulder and upper-back stretch', 'Schouder- en bovenrugrek', 'Estiramiento de hombros y espalda alta', 'Étirement des épaules et du haut du dos', 'Растяжка плеч и верхней части спины', '肩部与上背拉伸', '어깨 및 상부 등 스트레칭', '肩と上背部のストレッチ', 'إطالة الكتفين وأعلى الظهر'),
  'chest-stretch': row('Brust-Dehnung', 'Chest stretch', 'Borstrek', 'Estiramiento de pecho', 'Étirement de la poitrine', 'Растяжка груди', '胸部拉伸', '가슴 스트레칭', '胸のストレッチ', 'إطالة الصدر'),
  'child-pose': row('Kindhaltung', "Child's pose", 'Kindhouding', 'Postura del niño', 'Posture de l’enfant', 'Поза ребёнка', '婴儿式', '아기 자세', 'チャイルドポーズ', 'وضعية الطفل'),
  'cat-cow': row('Katze-Kuh', 'Cat-cow', 'Kat-koe', 'Gato-vaca', 'Chat-vache', 'Кошка-корова', '猫牛式', '캣카우', 'キャット＆カウ', 'القطة والبقرة'),
  'cobra-stretch': row('Kobra-Dehnung', 'Cobra stretch', 'Cobrarek', 'Estiramiento cobra', 'Étirement cobra', 'Растяжка кобры', '眼镜蛇式拉伸', '코브라 스트레칭', 'コブラストレッチ', 'إطالة الكوبرا'),
  'yoga-bridge': row('Yoga-Brücke', 'Yoga bridge hold', 'Yogabrug vasthouden', 'Puente de yoga isométrico', 'Maintien du pont de yoga', 'Удержание моста в йоге', '瑜伽桥式保持', '요가 브리지 홀드', 'ヨガブリッジ・ホールド', 'ثبات جسر اليوغا')
};

const instructionTemplates = row(
  'Führe {name} langsam und kontrolliert aus. Nutze nur einen schmerzfreien Bewegungsumfang und höre bei Schmerzen oder Unwohlsein auf.',
  'Perform {name} slowly and with control. Use only a pain-free range of motion and stop if you feel pain or unwell.',
  'Voer {name} langzaam en gecontroleerd uit. Beweeg alleen binnen een pijnvrij bereik en stop bij pijn of onwel voelen.',
  'Realiza {name} despacio y con control. Muévete solo sin dolor y detente si sientes dolor o malestar.',
  'Effectuez {name} lentement et de manière contrôlée. Restez dans une amplitude sans douleur et arrêtez en cas de douleur ou de malaise.',
  'Выполняйте {name} медленно и контролируемо. Двигайтесь только без боли и остановитесь при боли или недомогании.',
  '缓慢并有控制地完成{name}。仅在无痛范围内活动，如感到疼痛或不适请停止。',
  '{name} 동작을 천천히 제어하며 실시하세요. 통증 없는 범위에서만 움직이고 통증이나 불편함이 있으면 중단하세요.',
  '{name}をゆっくりコントロールして行ってください。痛みのない範囲で動き、痛みや体調不良を感じたら中止してください。',
  'نفّذ {name} ببطء وتحكّم. تحرّك فقط ضمن نطاق خالٍ من الألم وتوقف إذا شعرت بألم أو توعك.'
);

export interface ExerciseTranslation {
  name: string;
  instructions: string;
}

export const baseExerciseTranslations: Readonly<Record<ExerciseId, Readonly<Record<FirstReleaseBaseLocale, ExerciseTranslation>>>> = Object.fromEntries(
  EXERCISE_IDS.map((id) => [id, Object.fromEntries(
    Object.entries(exerciseNames[id]).map(([locale, name]) => [locale, {
      name,
      instructions: instructionTemplates[locale as FirstReleaseBaseLocale].replace('{name}', name)
    }])
  )])
) as Record<ExerciseId, Record<FirstReleaseBaseLocale, ExerciseTranslation>>;
