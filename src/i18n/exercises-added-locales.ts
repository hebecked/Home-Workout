import { addedRow, type AddedLocalizedText, type FirstReleaseAddedLocale } from './matrix';
import { EXERCISE_IDS, type ExerciseId, type ExerciseTranslation } from './exercises';
import { newExerciseInstructions } from './exercise-instructions-new';

export const addedExerciseNames: Readonly<Record<ExerciseId, AddedLocalizedText>> = {
  'squat': addedRow('Agachamento', 'Squat', 'Przysiad', 'Squat', 'Присідання', 'स्क्वाट'),
  'sumo-squat': addedRow('Agachamento sumô', 'Squat sumo', 'Przysiad sumo', 'Sumo squat', 'Присідання сумо', 'सूमो स्क्वाट'),
  'reverse-lunge': addedRow('Afundo para trás', 'Affondo indietro', 'Wykrok w tył', 'Geri hamle', 'Випад назад', 'रिवर्स लंज'),
  'forward-lunge': addedRow('Afundo para a frente', 'Affondo in avanti', 'Wykrok w przód', 'İleri hamle', 'Випад уперед', 'फॉरवर्ड लंज'),
  'split-squat': addedRow('Agachamento com pernas afastadas', 'Split squat', 'Przysiad wykroczny', 'Split squat', 'Присідання у випаді', 'स्प्लिट स्क्वाट'),
  'glute-bridge': addedRow('Ponte de glúteos', 'Ponte glutei', 'Most biodrowy', 'Kalça köprüsü', 'Сідничний місток', 'ग्लूट ब्रिज'),
  'single-leg-glute-bridge': addedRow('Ponte de glúteos unilateral', 'Ponte glutei su una gamba', 'Most biodrowy na jednej nodze', 'Tek bacak kalça köprüsü', 'Сідничний місток на одній нозі', 'सिंगल-लेग ग्लूट ब्रिज'),
  'calf-raise': addedRow('Elevação de gémeos', 'Sollevamento polpacci', 'Wspięcia na palce', 'Baldır kaldırma', 'Підйом на носки', 'काफ रेज़'),
  'wall-sit': addedRow('Agachamento na parede', 'Sedia al muro', 'Krzesełko przy ścianie', 'Duvar oturuşu', 'Стільчик біля стіни', 'वॉल सिट'),
  'sumo-squat-hold': addedRow('Agachamento sumô isométrico', 'Tenuta squat sumo', 'Przysiad sumo z zatrzymaniem', 'Sumo squat bekleme', 'Утримання присідання сумо', 'सूमो स्क्वाट होल्ड'),
  'push-up': addedRow('Flexão', 'Piegamento sulle braccia', 'Pompka', 'Şınav', 'Віджимання', 'पुश-अप'),
  'scapular-push-up': addedRow('Flexão escapular', 'Piegamento scapolare', 'Pompka łopatkowa', 'Skapular şınav', 'Лопаткове віджимання', 'स्कैपुलर पुश-अप'),
  'incline-push-up': addedRow('Flexão inclinada', 'Piegamento inclinato', 'Pompka na podwyższeniu', 'Eğimli şınav', 'Віджимання від опори', 'इंक्लाइन पुश-अप'),
  'knee-push-up': addedRow('Flexão de joelhos', 'Piegamento sulle ginocchia', 'Pompka na kolanach', 'Diz üstü şınav', 'Віджимання з колін', 'नी पुश-अप'),
  'pike-push-up': addedRow('Flexão pike', 'Piegamento pike', 'Pompka pike', 'Pike şınav', 'Віджимання куточком', 'पाइक पुश-अप'),
  'pull-up': addedRow('Elevação na barra', 'Trazione alla sbarra', 'Podciąganie nachwytem', 'Barfiks', 'Підтягування прямим хватом', 'पुल-अप'),
  'assisted-pull-up': addedRow('Elevação assistida', 'Trazione assistita', 'Podciąganie z asystą', 'Destekli barfiks', 'Підтягування з підтримкою', 'असिस्टेड पुल-अप'),
  'chin-up': addedRow('Elevação com pega supinada', 'Trazione a presa supina', 'Podciąganie podchwytem', 'Ters tutuş barfiks', 'Підтягування зворотним хватом', 'चिन-अप'),
  'resistance-band-row': addedRow('Remada com banda elástica', 'Rematore con elastico', 'Wiosłowanie gumą', 'Direnç bandı kürek', 'Тяга еспандера', 'रेज़िस्टेंस बैंड रो'),
  'resistance-band-pull-apart': addedRow('Abertura com banda elástica', 'Apertura con elastico', 'Rozciąganie gumy przed klatką', 'Direnç bandı açma', 'Розведення еспандера', 'रेज़िस्टेंस बैंड पुल-अपार्ट'),
  'dead-bug': addedRow('Inseto morto', 'Dead bug', 'Martwy robak', 'Dead bug', 'Мертвий жук', 'डेड बग'),
  'lying-leg-raise': addedRow('Elevação de pernas deitado', 'Sollevamento gambe da sdraiati', 'Unoszenie nóg w leżeniu', 'Yatarak bacak kaldırma', 'Підйом ніг лежачи', 'लाइंग लेग रेज़'),
  'bird-dog': addedRow('Bird dog', 'Bird dog', 'Bird dog', 'Bird dog', 'Птах-собака', 'बर्ड डॉग'),
  'plank': addedRow('Prancha', 'Plank', 'Deska', 'Plank', 'Планка', 'प्लैंक'),
  'side-plank': addedRow('Prancha lateral', 'Plank laterale', 'Deska bokiem', 'Yan plank', 'Бічна планка', 'साइड प्लैंक'),
  'mountain-climber': addedRow('Escalador', 'Mountain climber', 'Wspinaczka górska', 'Dağ tırmanışı', 'Альпініст', 'माउंटेन क्लाइंबर'),
  'hollow-hold': addedRow('Hollow hold', 'Tenuta hollow', 'Hollow hold', 'Hollow hold', 'Утримання човника', 'हॉलो होल्ड'),
  'jumping-jack': addedRow('Polichinelo', 'Jumping jack', 'Pajacyki', 'Jumping jack', 'Стрибки ноги нарізно', 'जंपिंग जैक'),
  'step-jack': addedRow('Step jack', 'Step jack', 'Pajacyk bez podskoku', 'Step jack', 'Кроки ноги нарізно', 'स्टेप जैक'),
  'high-knees': addedRow('Joelhos altos', 'Corsa a ginocchia alte', 'Bieg z wysokim unoszeniem kolan', 'Diz çekme koşusu', 'Біг із високим підніманням колін', 'हाई नीज़'),
  'marching-in-place': addedRow('Marcha no lugar', 'Marcia sul posto', 'Marsz w miejscu', 'Yerinde yürüme', 'Ходьба на місці', 'जगह पर मार्च'),
  'shadow-boxing': addedRow('Boxe de sombra', 'Boxe a vuoto', 'Boks z cieniem', 'Gölge boksu', 'Бій із тінню', 'शैडो बॉक्सिंग'),
  'burpee': addedRow('Burpee', 'Burpee', 'Burpee', 'Burpee', 'Берпі', 'बर्पी'),
  'squat-to-reach': addedRow('Agachamento com extensão', 'Squat con allungamento', 'Przysiad z wyciągnięciem rąk', 'Uzanmalı squat', 'Присідання з витягуванням рук', 'स्क्वाट टू रीच'),
  'superman': addedRow('Superman', 'Superman', 'Superman', 'Superman', 'Супермен', 'सुपरमैन'),
  'superman-dynamic': addedRow('Superman dinâmico', 'Superman dinamico', 'Dynamiczny superman', 'Dinamik superman', 'Динамічний супермен', 'डायनेमिक सुपरमैन'),
  'triceps-dip': addedRow('Mergulho de tríceps', 'Dip per tricipiti', 'Dip na triceps', 'Triseps dips', 'Віджимання на трицепс від опори', 'ट्राइसेप्स डिप'),
  'heel-dig': addedRow('Toque de calcanhar', 'Tocco del tallone', 'Dotknięcia piętą', 'Topuk dokundurma', 'Торкання п’ятою', 'हील डिग'),
  'shoulder-roll': addedRow('Rotação dos ombros', 'Rotazioni delle spalle', 'Krążenia barków', 'Omuz çevirme', 'Колові рухи плечима', 'शोल्डर रोल'),
  'arm-circle': addedRow('Círculos com os braços', 'Circonduzioni delle braccia', 'Krążenia ramion', 'Kol çevirme', 'Колові рухи руками', 'आर्म सर्कल'),
  'active-recovery': addedRow('Recuperação ativa', 'Recupero attivo', 'Aktywna regeneracja', 'Aktif toparlanma', 'Активне відновлення', 'एक्टिव रिकवरी'),
  'leg-swing': addedRow('Balanço da perna', 'Slanci della gamba', 'Wymachy nogą', 'Bacak sallama', 'Махи ногою', 'लेग स्विंग'),
  'hip-circles': addedRow('Círculos da anca', 'Circonduzioni dell’anca', 'Krążenia bioder', 'Kalça çemberleri', 'Колові рухи тазом', 'कूल्हे घुमाना'),
  'ankle-rocks': addedRow('Mobilização dinâmica do tornozelo', 'Mobilizzazione dinamica della caviglia', 'Mobilizacja stawu skokowego', 'Dinamik ayak bileği mobilizasyonu', 'Динамічна мобілізація гомілковостопа', 'टखना आगे-पीछे झुकाना'),
  'torso-rotations': addedRow('Rotações do tronco', 'Rotazioni del busto', 'Rotacje tułowia', 'Gövde rotasyonu', 'Повороти тулуба', 'धड़ घुमाना'),
  'bodyweight-good-morning': addedRow('Bom-dia com peso corporal', 'Good morning a corpo libero', 'Skłon „dzień dobry” bez obciążenia', 'Vücut ağırlığıyla good morning', 'Гудморнінг без обтяження', 'बॉडीवेट गुड मॉर्निंग'),
  'dynamic-lunge-reach': addedRow('Afundo dinâmico com alcance', 'Affondo dinamico con estensione delle braccia', 'Dynamiczny wykrok z sięgnięciem', 'Uzanmalı dinamik hamle', 'Динамічний випад із витягуванням', 'रीच के साथ डायनेमिक लंज'),
  'inchworm': addedRow('Caminhada da lagarta', 'Camminata a bruco', 'Marsz gąsienicy', 'Tırtıl yürüyüşü', 'Гусінь', 'इंचवर्म'),
  'calf-stretch': addedRow('Alongamento dos gémeos', 'Allungamento del polpaccio', 'Rozciąganie łydki', 'Baldır esnetme', 'Розтягування литки', 'काफ स्ट्रेच'),
  'hamstring-stretch': addedRow('Alongamento dos posteriores da coxa', 'Allungamento dei muscoli posteriori della coscia', 'Rozciąganie tylnej części uda', 'Arka bacak esnetme', 'Розтягування задньої поверхні стегна', 'हैमस्ट्रिंग स्ट्रेच'),
  'quadriceps-stretch': addedRow('Alongamento dos quadríceps', 'Allungamento dei quadricipiti', 'Rozciąganie mięśnia czworogłowego', 'Ön bacak esnetme', 'Розтягування квадрицепса', 'क्वाड्रिसेप्स स्ट्रेच'),
  'hip-flexor-stretch': addedRow('Alongamento dos flexores da anca', 'Allungamento dei flessori dell’anca', 'Rozciąganie zginaczy biodra', 'Kalça fleksörü esnetme', 'Розтягування згиначів стегна', 'हिप फ्लेक्सर स्ट्रेच'),
  'shoulder-upper-back-stretch': addedRow('Alongamento de ombros e costas superiores', 'Allungamento di spalle e parte alta della schiena', 'Rozciąganie barków i górnej części pleców', 'Omuz ve üst sırt esnetme', 'Розтягування плечей і верхньої частини спини', 'शोल्डर और अपर-बैक स्ट्रेच'),
  'chest-stretch': addedRow('Alongamento do peito', 'Allungamento del petto', 'Rozciąganie klatki piersiowej', 'Göğüs esnetme', 'Розтягування грудей', 'चेस्ट स्ट्रेच'),
  'child-pose': addedRow('Postura da criança', 'Posizione del bambino', 'Pozycja dziecka', 'Çocuk duruşu', 'Поза дитини', 'बालासन'),
  'cat-cow': addedRow('Gato-vaca', 'Gatto-mucca', 'Kot-krowa', 'Kedi-inek', 'Кішка-корова', 'कैट-काउ'),
  'cobra-stretch': addedRow('Alongamento cobra', 'Allungamento cobra', 'Rozciąganie w pozycji kobry', 'Kobra esnetme', 'Розтягування кобри', 'कोबरा स्ट्रेच'),
  'yoga-bridge': addedRow('Ponte de ioga isométrica', 'Tenuta del ponte yoga', 'Mostek jogi z zatrzymaniem', 'Yoga köprüsü bekleme', 'Утримання містка в йозі', 'योग ब्रिज होल्ड')
};

const addedInstructionTemplates = addedRow(
  'Execute {name} devagar e com controlo. Use apenas uma amplitude sem dor e pare se sentir dor ou mal-estar.',
  'Esegui {name} lentamente e con controllo. Muoviti solo senza dolore e fermati in caso di dolore o malessere.',
  'Wykonuj {name} powoli i z kontrolą. Poruszaj się wyłącznie bez bólu i przerwij, jeśli poczujesz ból lub złe samopoczucie.',
  '{name} hareketini yavaş ve kontrollü yapın. Yalnızca ağrısız hareket aralığında çalışın; ağrı veya rahatsızlık hissederseniz durun.',
  'Виконуйте {name} повільно та контрольовано. Рухайтеся лише без болю й зупиніться, якщо відчуєте біль або нездужання.',
  '{name} को धीरे और नियंत्रण के साथ करें। केवल दर्द-रहित सीमा में चलें और दर्द या अस्वस्थता होने पर रुक जाएँ।'
);

export const addedExerciseTranslations: Readonly<Record<ExerciseId, Readonly<Record<FirstReleaseAddedLocale, ExerciseTranslation>>>> = Object.fromEntries(
  EXERCISE_IDS.map((id) => [id, Object.fromEntries(
    Object.entries(addedExerciseNames[id]).map(([locale, name]) => [locale, {
      name,
      instructions: newExerciseInstructions[id]?.[locale as FirstReleaseAddedLocale] ?? addedInstructionTemplates[locale as FirstReleaseAddedLocale].replace('{name}', name)
    }])
  )])
) as Record<ExerciseId, Record<FirstReleaseAddedLocale, ExerciseTranslation>>;
