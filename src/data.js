// Từ vựng theo chủ đề. Chủ đề lớp 2 bám theo tên các Unit của sách Tiếng Anh 2 Global Success,
// chủ đề lớp 1 là phần ôn lại kiến thức cơ bản.
// Mỗi từ: [tiếng Anh, nghĩa tiếng Việt, hình (emoji, số, hoặc mã màu #...), cụm danh từ dùng trong câu (tuỳ chọn)]

const T = (id, grade, icon, title, vi, color, sentence, words) => ({
  id,
  grade,
  icon,
  title,
  vi,
  color,
  sentence,
  words: words.map(([en, wvi, pic, np]) => ({ en, vi: wvi, pic, np: np || article(en) })),
});

function article(en) {
  return (/^[aeiou]/i.test(en) ? 'an ' : 'a ') + en;
}

export const TOPICS = [
  // ---------- Ôn lớp 1 ----------
  T('colors', 1, '🎨', 'Colours', 'Màu sắc', '#ff8fab', (w) => `It's ${w.en}.`, [
    ['red', 'màu đỏ', '#e53935'],
    ['blue', 'màu xanh dương', '#1e88e5'],
    ['green', 'màu xanh lá', '#43a047'],
    ['yellow', 'màu vàng', '#fdd835'],
    ['orange', 'màu cam', '#fb8c00'],
    ['pink', 'màu hồng', '#f06292'],
    ['purple', 'màu tím', '#8e24aa'],
    ['black', 'màu đen', '#212121'],
    ['white', 'màu trắng', '#ffffff'],
    ['brown', 'màu nâu', '#795548'],
  ]),
  T('numbers', 1, '🔢', 'Numbers', 'Số đếm 1–20', '#ffc75f', (w) => `I can count to ${w.en}.`, [
    ['one', 'số một', '1'],
    ['two', 'số hai', '2'],
    ['three', 'số ba', '3'],
    ['four', 'số bốn', '4'],
    ['five', 'số năm', '5'],
    ['six', 'số sáu', '6'],
    ['seven', 'số bảy', '7'],
    ['eight', 'số tám', '8'],
    ['nine', 'số chín', '9'],
    ['ten', 'số mười', '10'],
    ['eleven', 'số mười một', '11'],
    ['twelve', 'số mười hai', '12'],
    ['thirteen', 'số mười ba', '13'],
    ['fifteen', 'số mười lăm', '15'],
    ['twenty', 'số hai mươi', '20'],
  ]),
  T('body', 1, '🦷', 'My body', 'Cơ thể', '#ffab91', (w) => `Touch your ${w.en}.`, [
    ['eye', 'mắt', '👁️'],
    ['ear', 'tai', '👂'],
    ['nose', 'mũi', '👃'],
    ['mouth', 'miệng', '👄'],
    ['tooth', 'cái răng', '🦷'],
    ['hand', 'bàn tay', '✋'],
    ['foot', 'bàn chân', '🦶'],
    ['leg', 'cái chân', '🦵'],
  ]),
  T('family', 1, '👨‍👩‍👧', 'My family', 'Gia đình', '#b8a1ff', (w) => `This is my ${w.en}.`, [
    ['mother', 'mẹ', '👩'],
    ['father', 'bố', '👨'],
    ['sister', 'chị / em gái', '👧'],
    ['brother', 'anh / em trai', '👦'],
    ['baby', 'em bé', '👶'],
    ['grandma', 'bà', '👵'],
    ['grandpa', 'ông', '👴'],
  ]),

  // ---------- Lớp 2 ----------
  T('party', 2, '🎂', 'At my birthday party', 'Tiệc sinh nhật', '#ff8fab', (w) => `I have ${w.np}.`, [
    ['cake', 'bánh kem', '🎂'],
    ['candle', 'cây nến', '🕯️'],
    ['balloon', 'bóng bay', '🎈'],
    ['gift', 'món quà', '🎁'],
    ['pizza', 'bánh pizza', '🍕'],
    ['popcorn', 'bỏng ngô', '🍿', 'some popcorn'],
    ['candy', 'kẹo', '🍬'],
    ['card', 'tấm thiệp', '💌'],
  ]),
  T('backyard', 2, '🪁', 'In the backyard', 'Ở sân sau', '#90f1a8', (w) => `I can see ${w.np}.`, [
    ['kite', 'con diều', '🪁'],
    ['kitten', 'mèo con', '🐱'],
    ['bike', 'xe đạp', '🚲'],
    ['ball', 'quả bóng', '⚽'],
    ['tree', 'cái cây', '🌳'],
    ['flower', 'bông hoa', '🌼'],
    ['bird', 'con chim', '🐦'],
    ['puppy', 'chó con', '🐶'],
  ]),
  T('seaside', 2, '🏖️', 'At the seaside', 'Ở bãi biển', '#7bdff2', (w) => `Look at the ${w.en}.`, [
    ['sea', 'biển', '🌊'],
    ['sun', 'mặt trời', '☀️'],
    ['sand', 'cát', '🏖️'],
    ['shell', 'vỏ sò', '🐚'],
    ['boat', 'con thuyền', '⛵'],
    ['fish', 'con cá', '🐟'],
    ['crab', 'con cua', '🦀'],
    ['umbrella', 'cái ô', '⛱️'],
  ]),
  T('countryside', 2, '🌾', 'In the countryside', 'Ở nông thôn', '#c5e17a', (w) => `I can see the ${w.en}.`, [
    ['river', 'dòng sông', '🏞️'],
    ['rainbow', 'cầu vồng', '🌈'],
    ['rice', 'cây lúa', '🌾'],
    ['road', 'con đường', '🛣️'],
    ['mountain', 'ngọn núi', '⛰️'],
    ['house', 'ngôi nhà', '🏡'],
    ['moon', 'mặt trăng', '🌙'],
  ]),
  T('classroom', 2, '✏️', 'In the classroom', 'Trong lớp học', '#ffd166', (w) => `I have ${w.np}.`, [
    ['book', 'quyển sách', '📕'],
    ['pen', 'bút mực', '🖊️'],
    ['pencil', 'bút chì', '✏️'],
    ['ruler', 'thước kẻ', '📏'],
    ['bag', 'cặp sách', '🎒'],
    ['crayon', 'bút sáp màu', '🖍️'],
    ['scissors', 'cái kéo', '✂️', 'scissors'],
    ['chair', 'cái ghế', '🪑'],
  ]),
  T('farm', 2, '🐄', 'On the farm', 'Ở nông trại', '#a0e7a0', (w) => `It's ${w.np}.`, [
    ['cow', 'con bò', '🐄'],
    ['pig', 'con lợn', '🐖'],
    ['hen', 'con gà mái', '🐔'],
    ['duck', 'con vịt', '🦆'],
    ['goat', 'con dê', '🐐'],
    ['horse', 'con ngựa', '🐎'],
    ['sheep', 'con cừu', '🐑'],
    ['egg', 'quả trứng', '🥚'],
  ]),
  T('kitchen', 2, '🍳', 'In the kitchen', 'Trong bếp', '#ffb4a2', (w) => `This is ${w.np}.`, [
    ['cup', 'cái cốc', '☕'],
    ['bowl', 'cái bát', '🥣'],
    ['plate', 'cái đĩa', '🍽️'],
    ['spoon', 'cái thìa', '🥄'],
    ['knife', 'con dao', '🔪'],
    ['pot', 'cái nồi', '🍲'],
    ['bread', 'bánh mì', '🍞', 'bread'],
    ['milk', 'sữa', '🥛', 'milk'],
  ]),
  T('grocery', 2, '🛒', 'In the grocery store', 'Ở cửa hàng', '#ffc75f', (w) => `I want ${w.np}.`, [
    ['apple', 'quả táo', '🍎'],
    ['banana', 'quả chuối', '🍌'],
    ['orange', 'quả cam', '🍊'],
    ['grapes', 'quả nho', '🍇', 'some grapes'],
    ['tomato', 'quả cà chua', '🍅'],
    ['carrot', 'củ cà rốt', '🥕'],
    ['corn', 'bắp ngô', '🌽', 'some corn'],
    ['lemon', 'quả chanh', '🍋'],
  ]),
  T('zoo', 2, '🦁', 'At the zoo', 'Ở sở thú', '#ffd6a5', (w) => `I can see ${w.np}.`, [
    ['lion', 'sư tử', '🦁'],
    ['tiger', 'con hổ', '🐯'],
    ['monkey', 'con khỉ', '🐒'],
    ['elephant', 'con voi', '🐘'],
    ['zebra', 'ngựa vằn', '🦓'],
    ['giraffe', 'hươu cao cổ', '🦒'],
    ['bear', 'con gấu', '🐻'],
    ['snake', 'con rắn', '🐍'],
  ]),
  T('playground', 2, '🛝', 'In the playground', 'Ở sân chơi', '#9bf6ff', (w) => `I can ${w.en}.`, [
    ['run', 'chạy', '🏃'],
    ['jump', 'nhảy', '🤸'],
    ['swim', 'bơi', '🏊'],
    ['dance', 'nhảy múa', '💃'],
    ['sing', 'hát', '🎤'],
    ['skate', 'trượt patin', '🛼'],
    ['climb', 'leo trèo', '🧗'],
  ]),
  T('cafe', 2, '🧃', 'At the café', 'Ở quán', '#ffadad', (w) => `I'd like ${w.np}.`, [
    ['juice', 'nước ép', '🧃', 'some juice'],
    ['jam', 'mứt', '🍓', 'some jam'],
    ['tea', 'trà', '🍵', 'some tea'],
    ['cookie', 'bánh quy', '🍪'],
    ['sandwich', 'bánh kẹp', '🥪'],
    ['donut', 'bánh vòng', '🍩'],
    ['ice cream', 'kem', '🍦', 'an ice cream'],
    ['water', 'nước', '💧', 'some water'],
  ]),
  T('home', 2, '🏠', 'At home', 'Ở nhà', '#caffbf', (w) => `This is my ${w.en}.`, [
    ['bed', 'cái giường', '🛏️'],
    ['door', 'cái cửa', '🚪'],
    ['window', 'cửa sổ', '🪟'],
    ['lamp', 'cái đèn', '💡'],
    ['sofa', 'ghế sofa', '🛋️'],
    ['clock', 'đồng hồ', '⏰'],
    ['bath', 'bồn tắm', '🛁'],
  ]),
  T('clothes', 2, '👕', 'In the clothes shop', 'Ở cửa hàng quần áo', '#bdb2ff', (w) => `I like ${w.np}.`, [
    ['shirt', 'áo sơ mi', '👕'],
    ['dress', 'váy liền', '👗'],
    ['hat', 'cái mũ', '👒'],
    ['cap', 'mũ lưỡi trai', '🧢'],
    ['shoes', 'đôi giày', '👟', 'these shoes'],
    ['socks', 'đôi tất', '🧦', 'these socks'],
    ['jacket', 'áo khoác', '🧥'],
    ['jeans', 'quần bò', '👖', 'these jeans'],
  ]),
  T('campsite', 2, '⛺', 'At the campsite', 'Đi cắm trại', '#a3c4f3', (w) => `Look at the ${w.en}.`, [
    ['tent', 'cái lều', '⛺'],
    ['fire', 'đống lửa', '🔥'],
    ['torch', 'đèn pin', '🔦'],
    ['star', 'ngôi sao', '⭐'],
    ['moon', 'mặt trăng', '🌙'],
    ['map', 'bản đồ', '🗺️'],
    ['owl', 'con cú', '🦉'],
  ]),
];

// ---------- Lớp 3: theo tên các Unit sách Tiếng Anh 3 Global Success ----------
// `ask` = câu hỏi mẫu đi kèm câu trả lời (hiện ở phần Học từ)
const capFirst = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const G3 = (id, icon, title, vi, color, ask, sentence, words) => ({
  ...T(id, 3, icon, title, vi, color, sentence, words),
  ask,
});

TOPICS.push(
  G3('g3hello', '👋', 'Unit 1: Hello', 'Chào hỏi', '#ffd166', null, (w) => `${capFirst(w.en)}, Mai!`, [
    ['hello', 'xin chào', '👋'],
    ['good morning', 'chào buổi sáng', '🌅'],
    ['good afternoon', 'chào buổi chiều', '🌞'],
    ['good evening', 'chào buổi tối', '🌆'],
    ['good night', 'chúc ngủ ngon', '🌙'],
    ['goodbye', 'tạm biệt', '🚌'],
    ['thank you', 'cảm ơn', '🙏'],
  ]),
  G3('g3friends', '🧑‍🤝‍🧑', 'Unit 2–3: Names & friends', 'Tên và bạn bè', '#b8f2a6', "Who's this?", (w) => `This is ${w.np}.`, [
    ['boy', 'bạn trai', '👦'],
    ['girl', 'bạn gái', '👧'],
    ['friend', 'người bạn', '🧑‍🤝‍🧑', 'my friend'],
    ['teacher', 'giáo viên', '🧑‍🏫', 'my teacher'],
    ['baby', 'em bé', '👶'],
    ['family', 'gia đình', '👨‍👩‍👧', 'my family'],
  ]),
  G3('g3body', '💪', 'Unit 4: Our bodies', 'Cơ thể', '#ffab91', "What's this?", (w) => `It's my ${w.en}.`, [
    ['hair', 'tóc', '💇'],
    ['face', 'khuôn mặt', '😊'],
    ['eye', 'mắt', '👁️'],
    ['ear', 'tai', '👂'],
    ['nose', 'mũi', '👃'],
    ['mouth', 'miệng', '👄'],
    ['hand', 'bàn tay', '✋'],
    ['arm', 'cánh tay', '💪'],
    ['leg', 'cái chân', '🦵'],
  ]),
  G3('g3hobbies', '🎨', 'Unit 5: My hobbies', 'Sở thích', '#ff8fab', "What's your hobby?", (w) => `I like ${w.en}.`, [
    ['swimming', 'bơi', '🏊'],
    ['dancing', 'nhảy múa', '💃'],
    ['singing', 'hát', '🎤'],
    ['drawing', 'vẽ', '🖍️'],
    ['painting', 'tô màu', '🎨'],
    ['cooking', 'nấu ăn', '🍳'],
    ['running', 'chạy', '🏃'],
    ['reading', 'đọc sách', '📚'],
  ]),
  G3('g3school', '🏫', 'Unit 6: Our school', 'Trường học', '#7bdff2', "Where's the library?", (w) => `Let's go to the ${w.en}.`, [
    ['classroom', 'lớp học', '🏫'],
    ['library', 'thư viện', '📚'],
    ['gym', 'phòng thể dục', '🤸'],
    ['playground', 'sân chơi', '🛝'],
    ['computer room', 'phòng máy tính', '💻'],
    ['art room', 'phòng mĩ thuật', '🎨'],
    ['music room', 'phòng âm nhạc', '🎵'],
  ]),
  G3('g3instructions', '🙋', 'Unit 7: Classroom instructions', 'Mệnh lệnh trong lớp', '#c5e17a', null, (w) => `${capFirst(w.en)}, please.`, [
    ['stand up', 'đứng lên', '🧍'],
    ['sit down', 'ngồi xuống', '🪑'],
    ['open your book', 'mở sách ra', '📖'],
    ['close your book', 'gấp sách lại', '📕'],
    ['come in', 'mời vào', '🚪'],
    ['be quiet', 'giữ trật tự', '🤫'],
    ['raise your hand', 'giơ tay lên', '✋'],
  ]),
  G3('g3things', '🎒', 'Unit 8: My school things', 'Đồ dùng học tập', '#ffc75f', 'Yes, it is.', (w) => `Is this your ${w.en}?`, [
    ['school bag', 'cặp sách', '🎒'],
    ['notebook', 'quyển vở', '📓'],
    ['pencil', 'bút chì', '✏️'],
    ['pen', 'bút mực', '🖊️'],
    ['ruler', 'thước kẻ', '📏'],
    ['book', 'quyển sách', '📕'],
    ['crayon', 'bút sáp màu', '🖍️'],
  ]),
  G3('g3break', '⚽', 'Unit 10: Break time activities', 'Giờ ra chơi', '#9bf6ff', 'What do you do at break time?', (w) => `I play ${w.en}.`, [
    ['football', 'bóng đá', '⚽'],
    ['basketball', 'bóng rổ', '🏀'],
    ['volleyball', 'bóng chuyền', '🏐'],
    ['badminton', 'cầu lông', '🏸'],
    ['chess', 'cờ vua', '♟️'],
    ['table tennis', 'bóng bàn', '🏓'],
    ['hide and seek', 'trốn tìm', '🙈'],
  ]),
  G3('g3family', '👨‍👩‍👧‍👦', 'Unit 11: My family', 'Gia đình', '#b8a1ff', "Who's that?", (w) => `That's my ${w.en}.`, [
    ['father', 'bố', '👨'],
    ['mother', 'mẹ', '👩'],
    ['brother', 'anh / em trai', '👦'],
    ['sister', 'chị / em gái', '👧'],
    ['grandfather', 'ông', '👴'],
    ['grandmother', 'bà', '👵'],
  ]),
  G3('g3jobs', '🧑‍⚕️', 'Unit 12: Jobs', 'Nghề nghiệp', '#ffadad', "What's her job?", (w) => `She's ${w.np}.`, [
    ['doctor', 'bác sĩ', '🧑‍⚕️'],
    ['nurse', 'y tá', '👩‍⚕️'],
    ['teacher', 'giáo viên', '🧑‍🏫'],
    ['farmer', 'nông dân', '🧑‍🌾'],
    ['cook', 'đầu bếp', '🧑‍🍳'],
    ['driver', 'tài xế', '🚕'],
    ['worker', 'công nhân', '👷'],
    ['singer', 'ca sĩ', '🎤'],
  ]),
  G3('g3house', '🏠', 'Unit 13: My house', 'Ngôi nhà', '#caffbf', "Where's Mum?", (w) => `She's in the ${w.en}.`, [
    ['living room', 'phòng khách', '🛋️'],
    ['bedroom', 'phòng ngủ', '🛏️'],
    ['kitchen', 'nhà bếp', '🍳'],
    ['bathroom', 'phòng tắm', '🛁'],
    ['garden', 'khu vườn', '🌷'],
  ]),
  G3('g3bedroom', '🛏️', 'Unit 14: My bedroom', 'Phòng ngủ', '#a3c4f3', "What's in your bedroom?", (w) => `There is ${w.np} in my bedroom.`, [
    ['bed', 'cái giường', '🛏️'],
    ['lamp', 'cái đèn', '💡'],
    ['chair', 'cái ghế', '🪑'],
    ['window', 'cửa sổ', '🪟'],
    ['door', 'cái cửa', '🚪'],
    ['picture', 'bức tranh', '🖼️'],
    ['clock', 'đồng hồ', '⏰'],
  ]),
  G3('g3dining', '🍚', 'Unit 15: At the dining table', 'Bữa ăn', '#ffb4a2', 'Yes, please.', (w) => `Would you like ${w.np}?`, [
    ['rice', 'cơm', '🍚', 'some rice'],
    ['bread', 'bánh mì', '🍞', 'some bread'],
    ['egg', 'quả trứng', '🥚'],
    ['fish', 'cá', '🐟', 'some fish'],
    ['meat', 'thịt', '🍖', 'some meat'],
    ['chicken', 'thịt gà', '🍗', 'some chicken'],
    ['milk', 'sữa', '🥛', 'some milk'],
    ['water', 'nước', '💧', 'some water'],
  ]),
  G3('g3pets', '🐶', 'Unit 16: My pets', 'Thú cưng', '#ffd6a5', 'Yes, I do.', (w) => `Do you have ${w.np}?`, [
    ['dog', 'con chó', '🐕'],
    ['cat', 'con mèo', '🐈'],
    ['rabbit', 'con thỏ', '🐇'],
    ['parrot', 'con vẹt', '🦜'],
    ['goldfish', 'cá vàng', '🐠'],
    ['hamster', 'chuột hamster', '🐹'],
    ['turtle', 'con rùa', '🐢'],
  ]),
  G3('g3toys', '🧸', 'Unit 17: Our toys', 'Đồ chơi', '#ffc6ff', 'What toys do you like?', (w) => `I have ${w.np}.`, [
    ['doll', 'búp bê', '🪆'],
    ['teddy bear', 'gấu bông', '🧸'],
    ['robot', 'người máy', '🤖'],
    ['car', 'ô tô', '🚗'],
    ['train', 'tàu hoả', '🚂'],
    ['plane', 'máy bay', '✈️'],
    ['ball', 'quả bóng', '⚽'],
    ['kite', 'con diều', '🪁'],
  ]),
  G3('g3doing', '📺', 'Unit 18: Playing and doing', 'Đang làm gì', '#bdb2ff', 'What are you doing?', (w) => `I'm ${w.en}.`, [
    ['reading', 'đang đọc', '📖'],
    ['writing', 'đang viết', '✍️'],
    ['drawing', 'đang vẽ', '🖍️'],
    ['cooking', 'đang nấu ăn', '🍳'],
    ['listening to music', 'đang nghe nhạc', '🎧'],
    ['watching TV', 'đang xem ti vi', '📺'],
    ['sleeping', 'đang ngủ', '😴'],
  ]),
  G3('g3outdoor', '🚴', 'Unit 19: Outdoor activities', 'Hoạt động ngoài trời', '#90f1a8', 'What are they doing?', (w) => `They're ${w.en}.`, [
    ['cycling', 'đạp xe', '🚴'],
    ['skating', 'trượt patin', '🛼'],
    ['flying kites', 'thả diều', '🪁'],
    ['walking', 'đi bộ', '🚶'],
    ['skipping', 'nhảy dây', '🪢'],
    ['climbing', 'leo trèo', '🧗'],
    ['playing football', 'đá bóng', '⚽'],
  ]),
  G3('g3zoo', '🦘', 'Unit 20: At the zoo', 'Ở sở thú', '#ffd166', 'What is it doing?', (w) => `The ${w.en} is ${w.np}.`, [
    ['monkey', 'con khỉ (đang đu cây)', '🐒', 'swinging'],
    ['elephant', 'con voi (đang đi)', '🐘', 'walking'],
    ['tiger', 'con hổ (đang chạy)', '🐅', 'running'],
    ['peacock', 'con công (đang múa)', '🦚', 'dancing'],
    ['crocodile', 'cá sấu (đang bơi)', '🐊', 'swimming'],
    ['kangaroo', 'chuột túi (đang nhảy)', '🦘', 'jumping'],
    ['parrot', 'con vẹt (đang nói)', '🦜', 'talking'],
  ])
);

export const GRADES = [
  { id: 1, label: 'Lớp 1', note: 'Ôn lại' },
  { id: 2, label: 'Lớp 2', note: 'Sách Tiếng Anh 2' },
  { id: 3, label: 'Lớp 3', note: 'Sách Tiếng Anh 3' },
];

// Các hoạt động (đủ 4 kỹ năng nghe – nói – đọc – viết)
export const ACTIVITIES = [
  { id: 'learn', icon: '📚', title: 'Học từ', skill: 'Làm quen', color: '#ffd166' },
  { id: 'listen', icon: '🎧', title: 'Nghe chọn hình', skill: 'Nghe', color: '#7bdff2' },
  { id: 'read', icon: '📖', title: 'Đọc chọn hình', skill: 'Đọc', color: '#b8f2a6' },
  { id: 'spell', icon: '✏️', title: 'Ghép chữ', skill: 'Viết', color: '#ffb4a2' },
  { id: 'speak', icon: '🎤', title: 'Nói từ', skill: 'Nói', color: '#ff8fab' },
  { id: 'speakSentence', icon: '🗣️', title: 'Nói câu', skill: 'Nói', color: '#ffa8d4' },
  { id: 'sentence', icon: '🧩', title: 'Xếp câu', skill: 'Câu', color: '#b8a1ff' },
  { id: 'challenge', icon: '🏆', title: 'Thử thách', skill: 'Tổng hợp', color: '#ffc75f' },
];

export const shuffle = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const pick = (list) => list[Math.floor(Math.random() * list.length)];

// Lấy `n` lựa chọn gồm từ đúng và các từ khác cùng chủ đề (khác hình)
export function options(topic, word, n = 4) {
  const others = shuffle(topic.words.filter((w) => w.en !== word.en && w.pic !== word.pic)).slice(0, n - 1);
  return shuffle([word, ...others]);
}

// Các bé chơi game
export const PLAYERS = [
  { id: 'nic', name: 'Nic Sún Răng', short: 'Nic', face: '😁', color: '#7bdff2', shadow: '#3fb3cc' },
  { id: 'ny', name: 'Ny Đen Đen', short: 'Ny', face: '😎', color: '#ff8fab', shadow: '#d65b80' },
];
