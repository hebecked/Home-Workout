import type { ExerciseId } from './exercises';
import { addedRow, row, type CompleteLocalizedText } from './matrix';

export const newExerciseInstructions: Partial<Readonly<Record<ExerciseId, CompleteLocalizedText>>> = {
  'hip-circles': {
    ...row(
      'Stelle die Füße etwa hüftbreit auf, beuge die Knie leicht und lege die Hände an die Hüften. Führe das Becken langsam in kleinen Kreisen, während Brustkorb und Füße möglichst ruhig bleiben. Wechsle nach der Hälfte der Zeit die Richtung und bleibe in einem angenehmen Bewegungsumfang.',
      'Stand with feet about hip-width apart, soften your knees, and place your hands on your hips. Slowly circle your pelvis while keeping your chest and feet as still as practical. Change direction halfway through and stay within a comfortable range.',
      'Sta met je voeten ongeveer op heupbreedte, buig je knieën licht en zet je handen op je heupen. Maak langzaam kleine cirkels met je bekken terwijl borstkas en voeten zo stil mogelijk blijven. Wissel halverwege van richting en blijf binnen een prettig bewegingsbereik.',
      'Coloca los pies al ancho de las caderas, flexiona ligeramente las rodillas y apoya las manos en las caderas. Traza círculos pequeños y lentos con la pelvis manteniendo el pecho y los pies lo más quietos posible. Cambia de dirección a mitad del tiempo y muévete solo dentro de un rango cómodo.',
      'Placez les pieds à la largeur des hanches, fléchissez légèrement les genoux et posez les mains sur les hanches. Décrivez lentement de petits cercles avec le bassin en gardant le buste et les pieds aussi immobiles que possible. Changez de sens à mi-temps et restez dans une amplitude confortable.',
      'Поставьте стопы на ширине таза, слегка согните колени и положите руки на бёдра. Медленно описывайте тазом небольшие круги, стараясь не двигать грудной клеткой и стопами. В середине времени смените направление и двигайтесь только в комфортной амплитуде.',
      '双脚约与髋同宽，膝盖微屈，双手扶髋。缓慢用骨盆画小圈，胸廓和双脚尽量保持不动。进行到一半时换方向，只在舒适范围内活动。',
      '발을 골반 너비로 벌리고 무릎을 살짝 굽힌 뒤 손을 골반에 댑니다. 가슴과 발은 가능한 한 고정한 채 골반으로 천천히 작은 원을 그립니다. 중간에 방향을 바꾸고 편안한 범위에서만 움직이세요.',
      '足を腰幅に開き、膝を軽く曲げて両手を腰に置きます。胸郭と足をできるだけ動かさず、骨盤で小さな円をゆっくり描きます。途中で方向を変え、無理のない範囲で動かしてください。',
      'قف والقدمان بعرض الوركين، واثن الركبتين قليلًا وضع يديك على الوركين. حرّك الحوض ببطء في دوائر صغيرة مع إبقاء الصدر والقدمين ثابتين قدر الإمكان. اعكس الاتجاه في منتصف الوقت والتزم بمدى حركة مريح.'
    ),
    ...addedRow(
      'Fique com os pés à largura das ancas, dobre ligeiramente os joelhos e coloque as mãos nas ancas. Faça pequenos círculos lentos com a bacia, mantendo o peito e os pés tão imóveis quanto possível. Inverta o sentido a meio e use apenas uma amplitude confortável.',
      'Stai con i piedi alla larghezza delle anche, piega leggermente le ginocchia e appoggia le mani sui fianchi. Disegna lentamente piccoli cerchi con il bacino mantenendo torace e piedi il più possibile fermi. Cambia direzione a metà e resta in un raggio confortevole.',
      'Stań ze stopami na szerokość bioder, lekko ugnij kolana i połóż dłonie na biodrach. Powoli zataczaj miednicą małe kręgi, utrzymując klatkę piersiową i stopy możliwie nieruchomo. W połowie czasu zmień kierunek i poruszaj się tylko w komfortowym zakresie.',
      'Ayaklarınızı kalça genişliğinde açın, dizlerinizi hafifçe bükün ve ellerinizi kalçalarınıza koyun. Göğsünüzü ve ayaklarınızı olabildiğince sabit tutarak leğen kemiğinizle yavaşça küçük daireler çizin. Sürenin yarısında yön değiştirin ve rahat bir aralıkta kalın.',
      'Поставте стопи на ширині таза, трохи зігніть коліна й покладіть руки на стегна. Повільно описуйте тазом невеликі кола, тримаючи грудну клітку та стопи якомога нерухомішими. На середині часу змініть напрямок і рухайтеся лише в комфортній амплітуді.',
      'पैरों को कूल्हों की चौड़ाई पर रखें, घुटने हल्के मोड़ें और हाथ कूल्हों पर रखें। छाती और पैरों को यथासंभव स्थिर रखते हुए श्रोणि से धीरे-धीरे छोटे गोले बनाएं। आधे समय पर दिशा बदलें और केवल आरामदायक सीमा में चलें।'
    )
  },
  'ankle-rocks': {
    ...row(
      'Nimm einen kleinen versetzten Stand ein und belaste den vorderen Fuß gleichmäßig. Schiebe das vordere Knie langsam über die Zehen nach vorn und wieder zurück, ohne die Ferse anzuheben; das Knie folgt der Fußrichtung. Wechsle nach der Hälfte der Zeit die Seite und verkleinere den Weg bei Schmerzen oder einem unangenehmen Druckgefühl im Sprunggelenk.',
      'Take a short staggered stance and keep pressure even across the front foot. Slowly guide the front knee forward over the toes and back without lifting the heel, keeping the knee in line with the foot. Change sides halfway through and shorten the range if you feel pain or pinching.',
      'Neem een korte schredestand aan en houd de voorste voet volledig op de vloer. Breng de voorste knie langzaam over de tenen naar voren en terug, met de knie in de richting van de voet. Wissel halverwege en verklein de beweging bij pijn of een knellend gevoel.',
      'Adopta una postura corta con un pie delante y mantén todo el pie delantero apoyado. Lleva lentamente la rodilla delantera hacia delante sobre los dedos y vuelve, sin levantar el talón y alineando la rodilla con el pie. Cambia de lado a mitad del tiempo y acorta el recorrido si hay dolor o pinzamiento.',
      'Adoptez une courte position décalée et gardez tout le pied avant au sol. Avancez lentement le genou avant au-dessus des orteils puis revenez sans lever le talon, en gardant le genou dans l’axe du pied. Changez de côté à mi-temps et réduisez l’amplitude en cas de douleur ou de pincement.',
      'Встаньте в короткую разножку и равномерно прижмите переднюю стопу к полу. Медленно ведите переднее колено вперёд над пальцами и обратно, не отрывая пятку и сохраняя направление колена по стопе. В середине времени смените сторону; уменьшите амплитуду при боли или защемлении.',
      '前后小幅分腿站立，前脚均匀踩实。前脚跟不抬起，前膝沿脚尖方向缓慢向前移动再返回。进行到一半时换边；如有疼痛或夹挤感，请缩小幅度。',
      '짧은 앞뒤 스탠스를 취하고 앞발 전체에 체중을 고르게 둡니다. 뒤꿈치를 들지 않은 채 앞무릎을 발가락 방향으로 천천히 앞으로 보냈다가 돌아옵니다. 중간에 다리를 바꾸고 통증이나 끼이는 느낌이 있으면 범위를 줄이세요.',
      '足を前後に小さく開き、前足全体に均等に体重をかけます。かかとを浮かせず、前膝をつま先の方向へゆっくり前後に動かします。途中で左右を替え、痛みや詰まり感があれば動きを小さくしてください。',
      'قف بوضعية قصيرة مع قدم أمام الأخرى وثبّت القدم الأمامية كاملة على الأرض. حرّك الركبة الأمامية ببطء فوق أصابع القدم ثم أعدها من دون رفع الكعب، مع إبقاء الركبة في اتجاه القدم. بدّل الجانب في منتصف الوقت وقلّل المدى عند الشعور بألم أو انحشار.'
    ),
    ...addedRow(
      'Adote uma passada curta e mantenha todo o pé da frente apoiado. Leve lentamente o joelho da frente sobre os dedos e volte sem levantar o calcanhar, mantendo o joelho alinhado com o pé. Troque de lado a meio e reduza o movimento se sentir dor ou compressão.',
      'Assumi una posizione sfalsata corta e mantieni tutto il piede anteriore a terra. Porta lentamente il ginocchio avanti sopra le dita e torna indietro senza sollevare il tallone, mantenendo il ginocchio in linea con il piede. Cambia lato a metà e riduci il movimento in caso di dolore o compressione.',
      'Stań w krótkim wykroku i równomiernie dociśnij przednią stopę. Powoli przesuń przednie kolano nad palce i cofnij je bez odrywania pięty, prowadząc kolano w linii stopy. W połowie czasu zmień stronę; zmniejsz zakres przy bólu lub uczuciu ucisku.',
      'Kısa bir adım duruşu alın ve öndeki ayağın tamamını yere bastırın. Topuğu kaldırmadan ön dizi ayak parmaklarının yönünde yavaşça ileri ve geri hareket ettirin. Sürenin yarısında taraf değiştirin; ağrı veya sıkışma hissinde aralığı küçültün.',
      'Станьте в коротку стійку з однією ногою попереду й рівномірно притисніть передню стопу. Повільно ведіть переднє коліно вперед над пальцями й назад, не відриваючи п’яту та зберігаючи напрямок коліна вздовж стопи. На середині часу змініть бік; зменште амплітуду за болю чи защемлення.',
      'एक पैर थोड़ा आगे रखकर खड़े हों और आगे वाले पूरे पैर पर समान दबाव रखें। एड़ी उठाए बिना आगे के घुटने को पैर की दिशा में पंजों के ऊपर धीरे आगे और पीछे ले जाएं। आधे समय पर पैर बदलें; दर्द या चुभन हो तो दूरी कम करें।'
    )
  },
  'torso-rotations': {
    ...row(
      'Stehe hüftbreit mit leicht gebeugten Knien. Drehe Brustkorb und locker gehaltene Arme langsam nach links und rechts, während Becken und Füße weitgehend nach vorn zeigen. Bleibe aufrecht, vermeide Schwung und nutze nur einen angenehmen Bewegungsumfang.',
      'Stand hip-width with soft knees. Slowly turn your rib cage and relaxed arms left and right while your pelvis and feet remain mostly forward. Stay tall, avoid momentum, and use only a comfortable range.',
      'Sta op heupbreedte met licht gebogen knieën. Draai je borstkas en ontspannen armen langzaam naar links en rechts terwijl bekken en voeten grotendeels naar voren blijven. Blijf rechtop, gebruik geen vaart en beweeg alleen binnen een prettig bereik.',
      'Ponte de pie con los pies al ancho de las caderas y las rodillas ligeramente flexionadas. Gira lentamente el pecho y los brazos relajados a izquierda y derecha mientras la pelvis y los pies permanecen casi al frente. Mantente erguido, sin impulso y dentro de un rango cómodo.',
      'Tenez-vous debout, pieds à la largeur des hanches et genoux légèrement fléchis. Tournez lentement la cage thoracique et les bras détendus à gauche et à droite, tandis que le bassin et les pieds restent autant que possible face à l’avant. Restez droit, sans élan et dans une amplitude confortable.',
      'Поставьте стопы на ширине таза и слегка согните колени. Медленно поворачивайте грудную клетку и расслабленные руки влево и вправо, оставляя таз и стопы преимущественно направленными вперёд. Сохраняйте вертикальное положение, не используйте инерцию и двигайтесь комфортно.',
      '双脚与髋同宽站立，膝盖微屈。骨盆和双脚尽量朝前，胸廓与放松的手臂缓慢左右转动。保持身体直立，不要借助惯性，只在舒适范围内活动。',
      '발을 골반 너비로 벌리고 무릎을 살짝 굽힙니다. 골반과 발은 가능한 한 정면을 유지한 채 가슴과 편안한 팔을 천천히 좌우로 돌립니다. 몸을 세우고 반동 없이 편안한 범위에서 움직이세요.',
      '足を腰幅に開き、膝を軽く曲げます。骨盤と足はできるだけ正面に保ち、胸郭と力を抜いた腕をゆっくり左右へ回します。上体を起こし、反動を使わず無理のない範囲で動いてください。',
      'قف والقدمان بعرض الوركين مع ثني بسيط للركبتين. أدر القفص الصدري والذراعين المسترخيتين ببطء يمينًا ويسارًا مع إبقاء الحوض والقدمين للأمام قدر الإمكان. ابق منتصبًا وتجنب الاندفاع والتزم بمدى مريح.'
    ),
    ...addedRow(
      'Fique com os pés à largura das ancas e os joelhos ligeiramente dobrados. Rode lentamente o peito e os braços relaxados para ambos os lados, mantendo a bacia e os pés quase voltados para a frente. Fique direito, sem impulso e numa amplitude confortável.',
      'Stai con i piedi alla larghezza delle anche e le ginocchia leggermente piegate. Ruota lentamente torace e braccia rilassate a destra e a sinistra, mantenendo bacino e piedi quasi rivolti in avanti. Rimani eretto, evita lo slancio e usa un raggio confortevole.',
      'Stań ze stopami na szerokość bioder i lekko ugnij kolana. Powoli obracaj klatkę piersiową i rozluźnione ramiona w obie strony, utrzymując miednicę i stopy skierowane głównie do przodu. Pozostań wyprostowany, bez zamachu i w komfortowym zakresie.',
      'Ayaklarınızı kalça genişliğinde açıp dizlerinizi hafifçe bükün. Leğen kemiği ve ayaklar çoğunlukla öne bakarken göğüs kafesini ve rahat kolları yavaşça sağa sola çevirin. Dik kalın, ivme kullanmayın ve rahat bir aralıkta hareket edin.',
      'Поставте стопи на ширині таза й трохи зігніть коліна. Повільно повертайте грудну клітку та розслаблені руки в обидва боки, залишаючи таз і стопи переважно спрямованими вперед. Тримайтеся вертикально, без інерції та в комфортній амплітуді.',
      'पैरों को कूल्हों की चौड़ाई पर रखकर घुटने हल्के मोड़ें। श्रोणि और पैरों को लगभग सामने रखते हुए छाती और ढीली भुजाओं को धीरे दाएं-बाएं घुमाएं। सीधे रहें, झटका न दें और केवल आरामदायक सीमा में चलें।'
    )
  },
  'bodyweight-good-morning': {
    ...row(
      'Stelle die Füße hüftbreit auf und beuge die Knie leicht. Schiebe die Hüfte nach hinten und neige den Oberkörper mit neutral gehaltener Wirbelsäule aus der Hüfte vor, bis du eine angenehme Spannung an der Oberschenkelrückseite spürst. Drücke die Füße in den Boden und richte dich wieder auf; runde den Rücken nicht.',
      'Stand with feet hip-width apart and soften your knees. Send your hips back and hinge forward from the hips while maintaining a neutral spine, until you feel comfortable tension behind the thighs. Press through your feet to stand; do not round your back.',
      'Sta met je voeten op heupbreedte en buig je knieën licht. Duw je heupen naar achteren en kantel met een neutrale rug vanuit de heupen naar voren tot je een prettige spanning achter in de bovenbenen voelt. Druk je voeten in de vloer om op te staan; maak je rug niet bol.',
      'Coloca los pies al ancho de las caderas y flexiona ligeramente las rodillas. Lleva las caderas hacia atrás e inclina el tronco desde las caderas, manteniendo la espalda neutra, hasta notar una tensión cómoda detrás de los muslos. Presiona los pies contra el suelo para subir; no redondees la espalda.',
      'Placez les pieds à la largeur des hanches et fléchissez légèrement les genoux. Reculez les hanches et inclinez le buste depuis les hanches en gardant la colonne neutre, jusqu’à sentir une tension confortable derrière les cuisses. Appuyez les pieds au sol pour vous redresser sans arrondir le dos.',
      'Поставьте стопы на ширине таза и слегка согните колени. Отведите таз назад и наклонитесь от тазобедренных суставов, сохраняя нейтральное положение позвоночника, до комфортного натяжения задней поверхности бёдер. Надавите стопами в пол и выпрямитесь, не округляя спину.',
      '双脚与髋同宽，膝盖微屈。臀部向后推，保持脊柱处于自然中立位，从髋部前倾，直到大腿后侧有舒适的拉伸感。双脚踩地站起，不要弓背。',
      '발을 골반 너비로 벌리고 무릎을 살짝 굽힙니다. 엉덩이를 뒤로 보내고 척추를 중립으로 유지하며 고관절에서 상체를 숙여 허벅지 뒤쪽에 편안한 긴장감이 느껴질 때까지 내려갑니다. 발로 바닥을 밀어 일어나며 등을 둥글게 말지 마세요.',
      '足を腰幅に開き、膝を軽く曲げます。背骨を自然な位置に保ち、腰を後ろへ引きながら股関節から前傾し、もも裏に心地よい張りを感じる位置まで動きます。足で床を押して戻り、背中を丸めないでください。',
      'قف والقدمان بعرض الوركين مع ثني بسيط للركبتين. ادفع الوركين للخلف وأمل الجذع من مفصل الورك مع إبقاء العمود الفقري في وضع محايد حتى تشعر بشد مريح خلف الفخذين. اضغط القدمين في الأرض للوقوف ولا تدوّر الظهر.'
    ),
    ...addedRow(
      'Fique com os pés à largura das ancas e dobre ligeiramente os joelhos. Leve as ancas para trás e incline-se a partir da anca, mantendo a coluna neutra, até sentir tensão confortável atrás das coxas. Pressione os pés no chão para subir sem arredondar as costas.',
      'Stai con i piedi alla larghezza delle anche e piega leggermente le ginocchia. Porta indietro le anche e inclina il busto dall’anca mantenendo la colonna neutra, finché senti una tensione confortevole dietro le cosce. Spingi i piedi a terra per risalire senza incurvare la schiena.',
      'Stań ze stopami na szerokość bioder i lekko ugnij kolana. Cofnij biodra i pochyl się z bioder, utrzymując kręgosłup w neutralnym ustawieniu, aż poczujesz komfortowe napięcie z tyłu ud. Dociśnij stopy do podłoża i wstań bez zaokrąglania pleców.',
      'Ayaklarınızı kalça genişliğinde açıp dizlerinizi hafifçe bükün. Kalçayı geriye gönderin ve omurganızı nötr tutarak kalçadan öne eğilin; arka bacaklarda rahat bir gerilim hissedin. Ayaklarınızla zemini itip doğrulun; sırtınızı yuvarlamayın.',
      'Поставте стопи на ширині таза й трохи зігніть коліна. Відведіть таз назад і нахиліться від кульшових суглобів, зберігаючи нейтральне положення хребта, до комфортного натягу задньої поверхні стегон. Натисніть стопами в підлогу й випряміться, не округлюючи спину.',
      'पैरों को कूल्हों की चौड़ाई पर रखकर घुटने हल्के मोड़ें। कूल्हों को पीछे ले जाएं और रीढ़ को तटस्थ रखते हुए कूल्हों से आगे झुकें, जब तक जांघों के पीछे आरामदायक खिंचाव महसूस हो। पैरों से जमीन दबाकर उठें; पीठ गोल न करें।'
    )
  },
  'dynamic-lunge-reach': {
    ...row(
      'Mache einen kontrollierten Schritt nach vorn und beuge beide Knie in einen bequemen Ausfallschritt; das vordere Knie folgt dabei der Fußrichtung. Strecke den Arm auf der Seite des vorderen Beins über den Kopf, ohne ins Hohlkreuz zu fallen, senke ihn wieder und drücke dich über den vorderen Fuß zurück. Wechsle die Seite und verkleinere Schrittlänge oder Tiefe, wenn die Position instabil wird.',
      'Take a controlled step forward and bend both knees into a comfortable lunge, keeping the front knee in line with the foot. Reach the arm on the same side as the front leg overhead without arching your lower back, lower it, and push through the front foot to return. Alternate sides and shorten the step or depth if the position becomes unsteady.',
      'Stap gecontroleerd naar voren en buig beide knieën tot een comfortabele uitvalspas, waarbij de voorste knie in lijn met de voet blijft. Strek de arm aan de kant van het voorste been boven je hoofd zonder je onderrug hol te trekken, laat hem zakken en duw via de voorste voet terug. Wissel van kant en maak de stap of diepte kleiner als je niet stabiel blijft.',
      'Da un paso controlado hacia delante y flexiona ambas rodillas hasta una zancada cómoda, manteniendo la rodilla delantera alineada con el pie. Estira el brazo del lado de la pierna delantera por encima de la cabeza sin arquear la zona lumbar, bájalo y empuja con el pie delantero para volver. Alterna los lados y reduce el paso o la profundidad si pierdes estabilidad.',
      'Faites un pas contrôlé vers l’avant et fléchissez les deux genoux dans une fente confortable, en gardant le genou avant dans l’axe du pied. Tendez le bras du côté de la jambe avant au-dessus de la tête sans cambrer le bas du dos, abaissez-le puis poussez sur le pied avant pour revenir. Alternez les côtés et réduisez le pas ou la profondeur si la position devient instable.',
      'Сделайте контролируемый шаг вперёд и согните оба колена до комфортного выпада, следя, чтобы переднее колено двигалось в направлении стопы. Поднимите над головой руку со стороны передней ноги, не прогибая поясницу, опустите её и оттолкнитесь передней стопой для возврата. Чередуйте стороны и уменьшите шаг или глубину, если теряете устойчивость.',
      '有控制地向前迈步，双膝弯曲进入舒适的弓步，保持前侧膝盖与脚尖方向一致。将前腿同侧的手臂向上伸展，但不要让下背部过度拱起，然后放下手臂并用前脚发力返回。左右交替；如无法保持稳定，请缩短步幅或减小下蹲深度。',
      '한 발을 천천히 앞으로 내딛고 양쪽 무릎을 굽혀 편안한 런지 자세를 만들며 앞쪽 무릎이 발 방향을 따라가도록 합니다. 허리가 과하게 꺾이지 않도록 앞쪽 다리와 같은 쪽 팔을 머리 위로 뻗었다가 내리고 앞발로 밀어 돌아옵니다. 양쪽을 번갈아 하며 불안정하면 보폭이나 깊이를 줄이세요.',
      '片足をコントロールして前へ踏み出し、両膝を曲げて無理のないランジになり、前脚の膝をつま先の向きにそろえます。腰を反らさず前脚と同じ側の腕を頭上へ伸ばし、腕を下ろして前足で床を押し戻ります。左右交互に行い、不安定なら歩幅や深さを小さくしてください。',
      'اخطُ للأمام بتحكم واثن الركبتين إلى وضع اندفاع مريح، مع إبقاء الركبة الأمامية في اتجاه القدم. مد الذراع التي على جهة الساق الأمامية فوق الرأس من دون تقويس أسفل الظهر، ثم اخفضها وادفع بالقدم الأمامية للعودة. بدّل الجانبين وقلّل طول الخطوة أو العمق إذا فقدت الثبات.'
    ),
    ...addedRow(
      'Dê um passo controlado em frente e dobre os dois joelhos numa passada confortável, mantendo o joelho da frente alinhado com o pé. Estenda o braço do lado da perna da frente acima da cabeça sem arquear a zona lombar, baixe-o e empurre com o pé da frente para voltar. Alterne os lados e reduza o passo ou a profundidade se perder estabilidade.',
      'Fai un passo controllato in avanti e piega entrambe le ginocchia in un affondo confortevole, mantenendo il ginocchio anteriore allineato con il piede. Porta il braccio dello stesso lato della gamba anteriore sopra la testa senza inarcare la zona lombare, abbassalo e spingi sul piede anteriore per tornare. Alterna i lati e riduci passo o profondità se perdi stabilità.',
      'Zrób kontrolowany krok w przód i ugnij oba kolana do wygodnego wykroku, prowadząc przednie kolano w kierunku stopy. Wyciągnij nad głowę rękę po stronie nogi wykrocznej bez wyginania odcinka lędźwiowego, opuść ją i odepchnij się przednią stopą. Zmieniaj strony i skróć krok lub zmniejsz głębokość, jeśli tracisz stabilność.',
      'Kontrollü bir adım öne atıp iki dizi rahat bir hamle pozisyonuna bükün ve öndeki dizi ayakla aynı hizada tutun. Belinizi aşırı çukurlaştırmadan öndeki bacakla aynı taraftaki kolu baş üstüne uzatın, indirin ve ön ayakla iterek geri dönün. Tarafları değiştirin; denge bozulursa adımı veya derinliği azaltın.',
      'Зробіть контрольований крок уперед і зігніть обидва коліна до комфортного випаду, стежачи, щоб переднє коліно рухалося в напрямку стопи. Витягніть над головою руку з боку передньої ноги, не прогинаючи поперек, опустіть її і відштовхніться передньою стопою для повернення. Чергуйте боки та зменште крок або глибину, якщо втрачаєте стійкість.',
      'नियंत्रित तरीके से एक कदम आगे रखें और दोनों घुटनों को आरामदायक लंज में मोड़ें; आगे वाले घुटने को पैर की दिशा में रखें। कमर को अधिक न मोड़ते हुए आगे वाले पैर की तरफ की भुजा सिर के ऊपर ले जाएं, नीचे लाएं और आगे वाले पैर से धक्का देकर लौटें। पैर बदलते रहें; अस्थिर हों तो कदम या गहराई कम करें।'
    )
  },
  inchworm: {
    ...row(
      'Beuge aus dem Stand bei Bedarf die Knie und setze die Hände vor den Füßen auf. Laufe mit den Händen in kleinen Schritten bis in einen stabilen hohen Stütz, ohne die Hüfte durchhängen zu lassen. Halte dann die Hände am Platz und gehe mit den Füßen in kleinen Schritten zu ihnen; beuge die Knie bei Bedarf. Richte dich kontrolliert auf; verkürze den Weg oder brich bei Schmerzen in Handgelenken, Schultern oder Rücken ab.',
      'From standing, bend your knees as needed and place your hands in front of your feet. Walk your hands forward in small steps to a stable high plank without letting your hips sag, then keep your hands planted and walk your feet toward them in small steps, bending your knees as needed. Rise with control; shorten the range or stop if your wrists, shoulders, or back hurt.',
      'Buig vanuit stand zo nodig je knieën en zet je handen voor je voeten op de vloer. Loop met kleine handstappen naar een stabiele hoge plank zonder je heupen te laten zakken. Houd daarna je handen op hun plaats en loop met kleine voetstappen naar je handen; buig je knieën zo nodig. Kom gecontroleerd overeind; verklein de afstand of stop bij pijn in polsen, schouders of rug.',
      'Desde la posición de pie, flexiona las rodillas si es necesario y apoya las manos delante de los pies. Camina con las manos en pasos cortos hasta una plancha alta estable sin dejar caer las caderas. Después mantén las manos fijas y acerca los pies con pasos cortos, flexionando las rodillas si lo necesitas. Incorpórate con control; acorta el recorrido o detente si duelen las muñecas, los hombros o la espalda.',
      'Debout, fléchissez les genoux si nécessaire et posez les mains devant les pieds. Avancez les mains par petits pas jusqu’à une planche haute stable sans laisser tomber les hanches, puis gardez les mains en place et rapprochez les pieds par petits pas, en fléchissant les genoux si nécessaire. Redressez-vous avec contrôle; réduisez le trajet ou arrêtez en cas de douleur aux poignets, aux épaules ou au dos.',
      'Из положения стоя при необходимости согните колени и поставьте руки на пол перед стопами. Маленькими шагами рук выйдите в устойчивую высокую планку, не провисая в тазу, затем оставьте руки на месте и маленькими шагами приблизьте к ним стопы, при необходимости сгибая колени. Поднимитесь контролируемо; сократите путь или остановитесь при боли в запястьях, плечах или спине.',
      '站立时可按需屈膝，将双手放到脚前的地面。双手小步向前移动到稳定的高位平板支撑，髋部不要下沉，然后保持双手原地不动，双脚小步走向双手，可按需屈膝。缓慢起身；如手腕、肩或背部疼痛，请缩短距离或停止。',
      '선 자세에서 필요하면 무릎을 굽히고 발 앞 바닥에 손을 짚습니다. 손을 작은 걸음으로 앞으로 옮겨 엉덩이가 처지지 않는 안정된 하이 플랭크까지 갑니다. 손을 제자리에 둔 채 발을 작은 걸음으로 손 쪽으로 옮기고 필요하면 무릎을 굽힙니다. 천천히 일어나고 손목, 어깨 또는 등에 통증이 있으면 거리를 줄이거나 중단하세요.',
      '立位から必要に応じて膝を曲げ、足の前の床に手をつきます。手を小刻みに前へ歩かせ、腰が落ちない安定したハイプランクまで進みます。手はその場に置き、必要に応じて膝を曲げながら足を小刻みに手へ近づけます。ゆっくり起き上がり、手首・肩・背中に痛みがあれば距離を短くするか中止してください。',
      'من الوقوف، اثن الركبتين عند الحاجة وضع اليدين على الأرض أمام القدمين. حرّك اليدين بخطوات صغيرة إلى بلانك عالٍ ثابت من دون هبوط الوركين ثم أبقِ اليدين في مكانهما وقرّب القدمين نحوهما بخطوات صغيرة مع ثني الركبتين عند الحاجة. انهض بتحكم، وقلّل المسافة أو توقف إذا شعرت بألم في الرسغين أو الكتفين أو الظهر.'
    ),
    ...addedRow(
      'De pé, dobre os joelhos se necessário e coloque as mãos no chão à frente dos pés. Avance as mãos em pequenos passos até uma prancha alta estável sem deixar cair as ancas. Depois mantenha as mãos no lugar e aproxime os pés com pequenos passos, dobrando os joelhos se necessário. Levante-se com controlo; reduza o percurso ou pare se doerem os pulsos, ombros ou costas.',
      'In piedi, piega le ginocchia se serve e appoggia le mani davanti ai piedi. Avanza con piccoli passi delle mani fino a un plank alto stabile senza far cedere le anche, poi tieni ferme le mani e avvicina i piedi con piccoli passi, piegando le ginocchia se necessario. Rialzati con controllo; riduci il percorso o fermati se senti dolore a polsi, spalle o schiena.',
      'Ze stania ugnij kolana w razie potrzeby i oprzyj dłonie przed stopami. Przesuwaj dłonie małymi krokami do stabilnej wysokiej deski bez opuszczania bioder, a potem zostaw dłonie w miejscu i zbliż do nich stopy małymi krokami, uginając kolana w razie potrzeby. Wstań z kontrolą; skróć zakres lub przerwij przy bólu nadgarstków, barków albo pleców.',
      'Ayakta gerekirse dizlerinizi büküp ellerinizi ayakların önünde yere koyun. Kalçayı düşürmeden küçük el adımlarıyla sağlam bir yüksek plank pozisyonuna ilerleyin. Elleri sabit tutup gerekirse dizleri bükerek küçük adımlarla ayakları ellere yaklaştırın. Kontrollü doğrulun; el bileği, omuz veya sırt ağrısında mesafeyi azaltın ya da durun.',
      'Стоячи, за потреби зігніть коліна й поставте долоні на підлогу перед стопами. Малими кроками рук вийдіть у стійку високу планку, не провисаючи тазом, а потім залиште руки на місці й малими кроками наблизьте до них стопи, за потреби згинаючи коліна. Підніміться контрольовано; скоротіть шлях або зупиніться за болю в зап’ястках, плечах чи спині.',
      'खड़े होकर जरूरत के अनुसार घुटने मोड़ें और हाथ पैरों के आगे जमीन पर रखें। हाथों को छोटे कदमों में आगे ले जाकर स्थिर हाई प्लैंक तक जाएं, कूल्हों को न लटकने दें, फिर हाथों को स्थिर रखकर पैरों को छोटे कदमों से हाथों की ओर लाएं और जरूरत हो तो घुटने मोड़ें। नियंत्रण से उठें; कलाई, कंधे या पीठ में दर्द हो तो दूरी कम करें या रुकें।'
    )
  },
};
