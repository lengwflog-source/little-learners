# Dữ liệu Lớp 3 (Starter, Unit 1-20). Nội dung do tác giả tự soạn dựa trên danh mục từ vựng,
# mẫu câu và dạng bài của hai tập "Bài tập bổ trợ" (không sao chép câu hỏi gốc).
# unit(n, tên EN, tên VI, từ vựng[(từ, emoji, nghĩa)], câu theo từ {từ: câu}, ghi nhớ[g(...)], câu 2 {từ: câu}, hỏi-đáp[(hỏi, đáp, từ cần điền, emoji)])
def g(title, rows, note=''):
    h = '<ul>' + ''.join(f'<li><b>{e}</b>' + (f' – {v}' if v else '') + '</li>' for e, v in rows) + '</ul>'
    if note: h += f'<p>💡 {note}</p>'
    return {'title': title, 'html': h}

U = []
def unit(n, en, vi, v, s1, gr, s2=None, qa=None):
    U.append(dict(n=n, en=en, vi=vi, v=v, s1=s1, s2=s2 or {}, qa=qa or [], gram=gr))

N = lambda w, d, _=None: (w, d, '')   # số đếm: chỉ hiện chữ số

unit(0, 'Starter', 'Bảng chữ cái và số đếm',
 [N('one','1',''), N('two','2',''), N('three','3',''), N('four','4',''), N('five','5',''), N('six','6',''), N('seven','7',''), N('eight','8',''), N('nine','9',''), N('ten','10','')],
 {'one': "I'm one.", 'two': 'I have two pens.', 'three': 'I see three books.', 'four': 'I have four pencils.', 'five': "I'm five.", 'six': "I'm six.", 'seven': "I'm seven.", 'eight': "I'm eight.", 'nine': "I'm nine.", 'ten': "I'm ten."},
 [g('Đếm số từ 1 đến 10', [('one, two, three, four, five', '1, 2, 3, 4, 5'), ('six, seven, eight, nine, ten', '6, 7, 8, 9, 10')], 'Đọc to từng số và đếm ngón tay cùng bạn nhé.'),
  g('Đánh vần tên', [('B – E – N: Ben', ''), ('L – I – N – H: Linh', ''), ('N – A – M: Nam', '')], 'Bảng chữ cái có 26 chữ: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z.')],
 {'two': 'I have two erasers.'},
 [('How old are you?', "I'm eight.", 'eight', '8'), ('How old are you?', "I'm ten.", 'ten', '10')])

unit(1, 'Hello', 'Chào hỏi',
 [('hello', '🗣️', 'xin chào'), ('hi', '😀', 'chào (thân mật)'), ('goodbye', '👋', 'tạm biệt'), ('bye', '🖐️', 'tạm biệt (thân mật)'), ('fine', '😊', 'khỏe'), ('thank you', '🙏', 'cảm ơn')],
 {'hello': 'Hello, I am Ben.', 'hi': 'Hi, I am Mai.', 'goodbye': 'Goodbye, Minh.', 'bye': 'Bye, Lucy.', 'fine': 'I am fine.', 'thank you': 'Thank you, Ben.'},
 [g('Chào hỏi', [('Hello! / Hi!', 'Xin chào!'), ('Goodbye! / Bye!', 'Tạm biệt!')], 'Hi và Bye dùng với bạn bè, thân mật hơn Hello và Goodbye.'),
  g('Giới thiệu tên', [('I am Ben. = I’m Ben.', 'Mình là Ben.'), ('How are you? – I’m fine, thank you.', 'Bạn khỏe không? – Mình khỏe, cảm ơn.')], 'I am viết tắt là I’m.')],
 {'fine': "I'm fine, thank you."},
 [('How are you?', "I'm fine, thank you.", 'fine', '😊'), ('Goodbye, Ben.', 'Bye, Mai.', 'Bye', '🖐️')])

unit(2, 'Our names', 'Tên của chúng mình',
 [('name', '🏷️', 'tên'), ('my', '👈', 'của tôi'), ('your', '👉', 'của bạn'), ('our', '🤝', 'của chúng ta'), ('what', '❔', 'cái gì'), ('how', '🤔', 'như thế nào')],
 {'name': 'My name is Nam.', 'my': 'My name is Linh.', 'your': "What's your name?", 'our': 'Our names are Bill and Mary.', 'what': "What's her name?", 'how': 'How do you spell your name?'},
 [g('Hỏi và nói tên', [("What's your name?", 'Tên bạn là gì?'), ('My name is Linh. / I’m Linh.', 'Tên mình là Linh.')], "What's = What is."),
  g('Hỏi tên người khác', [("What's his name? – His name is Bill.", 'Tên bạn ấy (nam) là gì?'), ("What's her name? – Her name is Mary.", 'Tên bạn ấy (nữ) là gì?')], 'his = của cậu ấy, her = của cô ấy.')],
 {'what': "What's your name?"},
 [("What's your name?", 'My name is Nam.', 'name', '🏷️'), ("What's her name?", 'Her name is Mary.', 'Her', '👩'), ("What's his name?", 'His name is Bill.', 'His', '🧑')])

unit(3, 'Our friends', 'Những người bạn của chúng mình',
 [('friend', '🧑‍🤝‍🧑', 'bạn bè'), ('Mr', '👨‍💼', 'thầy / ông'), ('Ms', '👩‍💼', 'cô / bà'), ('teacher', '🧑‍🏫', 'giáo viên'), ('this', '👇', 'đây (ở gần)'), ('that', '🔭', 'kia (ở xa)'), ('yes', '✅', 'vâng, đúng'), ('no', '❌', 'không')],
 {'friend': 'This is my friend.', 'Mr': 'This is Mr Long.', 'Ms': 'That is Ms Hoa.', 'teacher': 'Mr Long is my teacher.', 'this': 'This is my book.', 'that': 'That is my pen.', 'yes': 'Yes, it is.', 'no': "No, it isn't."},
 [g('Giới thiệu người hoặc vật', [('This is Linh.', 'Đây là Linh. (gần)'), ('That is Mr Long.', 'Kia là thầy Long. (xa)')], 'This dùng cho người, vật ở gần. That dùng cho người, vật ở xa.'),
  g('Hỏi và trả lời Yes/No', [('Is this your friend?', 'Đây là bạn của bạn à?'), ("Yes, it is. / No, it isn't.", 'Đúng vậy. / Không phải.')], "isn't = is not.")],
 {},
 [('Is this your friend?', 'Yes, it is.', 'yes', '✅'), ('Is that Ms Hoa?', "No, it isn't.", 'No', '❌')])

unit(4, 'Our bodies', 'Cơ thể của chúng mình',
 [('face', '🙂', 'khuôn mặt'), ('hair', '💇', 'tóc'), ('hand', '✋', 'bàn tay'), ('mouth', '👄', 'miệng'), ('nose', '👃', 'mũi'), ('eyes', '👀', 'đôi mắt'), ('ears', '👂', 'đôi tai'), ('open', '🔓', 'mở'), ('touch', '👆', 'chạm vào')],
 {'face': 'Touch your face.', 'hair': 'Touch your hair.', 'hand': 'Touch your hand.', 'mouth': 'Open your mouth.', 'nose': 'Touch your nose.', 'eyes': 'Open your eyes.', 'ears': 'Touch your ears.', 'open': 'Open your hand.', 'touch': 'Touch your nose.'},
 [g('Ra lệnh với bộ phận cơ thể', [('Touch your nose!', 'Hãy chạm vào mũi của bạn!'), ('Open your mouth!', 'Hãy mở miệng ra!')], 'Touch / Open + your + bộ phận cơ thể.'),
  g('Hỏi đây là gì', [("What's this? – It's a mouth.", 'Đây là gì? – Đó là cái miệng.'), ("What's this? – It's an ear.", 'Đây là gì? – Đó là cái tai.')], 'Dùng a trước phụ âm, an trước nguyên âm (a, e, i, o, u): a nose, an ear.')],
 {'mouth': "It's a mouth.", 'nose': "It's a nose.", 'hand': "It's a hand.", 'face': "It's a face."},
 [("What's this?", "It's a mouth.", 'mouth', '👄'), ("What's this?", "It's a nose.", 'nose', '👃'), ("What's this?", "It's a hand.", 'hand', '✋')])

unit(5, 'My hobbies', 'Sở thích của mình',
 [('hobby', '🎯', 'sở thích'), ('like', '👍', 'thích'), ('cook', '🍳', 'nấu ăn'), ('dance', '💃', 'nhảy múa'), ('paint', '🎨', 'tô màu, vẽ'), ('run', '🏃', 'chạy'), ('sing', '🎤', 'hát'), ('swim', '🏊', 'bơi'), ('walk', '🚶', 'đi bộ'), ('draw', '✏️', 'vẽ')],
 {'hobby': "What's your hobby?", 'like': 'I like drawing.', 'cook': 'I like cooking.', 'dance': "Let's dance!", 'paint': 'I like painting.', 'run': "Let's run!", 'sing': 'I like singing.', 'swim': 'I can swim.', 'walk': 'I like walking.', 'draw': 'She likes drawing.'},
 [g('Hỏi sở thích', [("What's your hobby?", 'Sở thích của bạn là gì?'), ("It's dancing. / I like dancing.", 'Là nhảy múa. / Mình thích nhảy múa.')], 'Sau like và It’s dùng động từ + ing: singing, cooking, painting.'),
  g('Hỏi sở thích của người khác', [("What's her hobby? – It's swimming.", 'Sở thích của bạn ấy là gì? – Là bơi.'), ('She likes drawing.', 'Cô ấy thích vẽ.')], 'Với he / she thêm s sau like: likes.')],
 {},
 [("What's your hobby?", "It's dancing.", 'dancing', '💃'), ("What's her hobby?", "It's swimming.", 'swimming', '🏊'), ("What's your hobby?", 'I like painting.', 'painting', '🎨')])

unit(6, 'Our school', 'Trường học của chúng mình',
 [('school', '🏫', 'trường học'), ('classroom', '🧑‍🏫', 'lớp học'), ('library', '📚', 'thư viện'), ('playground', '🛝', 'sân chơi'), ('computer room', '💻', 'phòng máy tính'), ('art room', '🖼️', 'phòng mỹ thuật'), ('music room', '🎵', 'phòng âm nhạc'), ('gym', '🏋️', 'phòng thể dục')],
 {'school': 'This is our school.', 'classroom': 'This is our classroom.', 'library': "Let's go to the library.", 'playground': "Let's go to the playground.", 'computer room': 'Is this the computer room?', 'art room': 'This is our art room.', 'music room': "Let's go to the music room.", 'gym': "Let's go to the gym."},
 [g('Hỏi đây có phải là nơi nào không', [('Is this our playground?', 'Đây là sân chơi của chúng ta phải không?'), ("Yes, it is. / No, it isn't.", 'Đúng vậy. / Không phải.')], 'Is this + our/his/her + nơi chốn?'),
  g('Rủ bạn cùng đi', [("Let's go to the library.", 'Cùng đến thư viện nào.'), ("OK, let's go.", 'Ừ, đi thôi.')], "Let's go to the + nơi chốn.")],
 {},
 [('Is this our playground?', 'Yes, it is.', 'yes', '🛝'), ('Is this our library?', "No, it isn't.", 'No', '📚'), ("Let's go to the gym.", "OK, let's go.", 'OK', '🏋️')])

unit(7, 'Classroom instructions', 'Mệnh lệnh trong lớp học',
 [('open', '📂', 'mở'), ('close', '📕', 'đóng'), ('come in', '🚪', 'vào trong'), ('go out', '🚶', 'đi ra ngoài'), ('sit down', '🪑', 'ngồi xuống'), ('stand up', '🧍', 'đứng lên'), ('speak', '🗣️', 'nói'), ('read', '📖', 'đọc'), ('book', '📘', 'quyển sách')],
 {'open': 'Open your book, please.', 'close': 'Close your book, please.', 'come in': 'Come in, please.', 'go out': 'Go out, please.', 'sit down': 'Sit down, please.', 'stand up': 'Stand up, please.', 'speak': 'Speak English, please.', 'read': 'Read the book, please.', 'book': 'This is my book.'},
 [g('Ra lệnh lịch sự', [('Open your book, please.', 'Làm ơn mở sách ra.'), ('Stand up, please.', 'Làm ơn đứng lên.')], 'Thêm please để câu nói lịch sự hơn.'),
  g('Xin phép thầy cô', [('May I come in?', 'Em vào lớp được không ạ?'), ('Yes, come in.', 'Được, em vào đi.')], 'May I + động từ? dùng để xin phép.')],
 {},
 [('May I come in?', 'Yes, come in.', 'come in', '🚪'), ('May I go out?', 'Yes, go out.', 'go out', '🚶')])

unit(8, 'My school things', 'Đồ dùng học tập của mình',
 [('pen', '🖊️', 'cây bút mực'), ('ruler', '📏', 'cái thước'), ('school bag', '🎒', 'cặp sách'), ('pencil', '✏️', 'bút chì'), ('pencil case', '🧰', 'hộp bút'), ('notebook', '📓', 'quyển vở'), ('eraser', '🧽', 'cục tẩy'), ('book', '📘', 'quyển sách')],
 {'pen': 'This is a pen.', 'ruler': 'That is a ruler.', 'school bag': 'This is my school bag.', 'pencil': 'That is a pencil.', 'pencil case': 'This is my pencil case.', 'notebook': 'This is a notebook.', 'eraser': 'That is an eraser.', 'book': 'That is my book.'},
 [g('Hỏi đây là đồ vật gì', [("What's this? – It's a pen.", 'Đây là gì? – Là cây bút.'), ("What's that? – It's an eraser.", 'Kia là gì? – Là cục tẩy.')], 'Dùng an trước nguyên âm: an eraser.'),
  g('Hỏi bạn có đồ vật không', [('Do you have a ruler?', 'Bạn có cái thước không?'), ("Yes, I do. / No, I don't.", 'Có. / Không có.')], "don't = do not.")],
 {'pen': "It's a pen.", 'eraser': "It's an eraser."},
 [("What's this?", "It's a pen.", 'pen', '🖊️'), ("What's that?", "It's an eraser.", 'eraser', '🧽'), ('Do you have a ruler?', 'Yes, I do.', 'do', '📏')])

unit(9, 'Colours', 'Màu sắc',
 [('colour', '🌈', 'màu sắc'), ('blue', '🔵', 'màu xanh dương'), ('brown', '🟤', 'màu nâu'), ('red', '🔴', 'màu đỏ'), ('yellow', '🟡', 'màu vàng'), ('orange', '🟠', 'màu cam'), ('green', '🟢', 'màu xanh lá'), ('white', '⚪', 'màu trắng'), ('black', '⚫', 'màu đen')],
 {'colour': 'What colour is it?', 'blue': "It's a blue pen.", 'brown': "It's a brown bag.", 'red': "It's a red ruler.", 'yellow': "It's a yellow book.", 'orange': "It's an orange pencil.", 'green': "It's a green eraser.", 'white': "It's a white notebook.", 'black': "It's a black pen."},
 [g('Hỏi về màu sắc', [('What colour is it?', 'Nó màu gì?'), ("It's red.", 'Nó màu đỏ.')], 'What colour is + đồ vật? – It’s + màu.'),
  g('Nói màu của đồ vật', [("It's a blue pen.", 'Đó là một cây bút màu xanh.'), ("It's an orange pencil.", 'Đó là một cây bút chì màu cam.')], 'Màu đứng trước danh từ. Dùng an trước orange.')],
 {},
 [('What colour is it?', "It's red.", 'red', '🔴'), ('What colour is the pen?', "It's blue.", 'blue', '🔵'), ('What colour is the bag?', "It's brown.", 'brown', '🟤')])

unit(10, 'Break time activities', 'Hoạt động giờ ra chơi',
 [('break time', '⏰', 'giờ ra chơi'), ('play', '🎮', 'chơi'), ('chat', '💬', 'trò chuyện'), ('badminton', '🏸', 'cầu lông'), ('basketball', '🏀', 'bóng rổ'), ('chess', '♟️', 'cờ vua'), ('football', '⚽', 'bóng đá'), ('table tennis', '🏓', 'bóng bàn'), ('volleyball', '🏐', 'bóng chuyền'), ('word puzzle', '🧩', 'trò chơi ô chữ')],
 {'break time': 'What do you do at break time?', 'play': "Let's play!", 'chat': 'I chat with my friends.', 'badminton': 'I play badminton at break time.', 'basketball': 'I play basketball at break time.', 'chess': 'I play chess at break time.', 'football': 'He plays football at break time.', 'table tennis': 'She plays table tennis at break time.', 'volleyball': 'They play volleyball at break time.', 'word puzzle': 'I do a word puzzle at break time.'},
 [g('Nói mình làm gì giờ ra chơi', [('I play badminton at break time.', 'Giờ ra chơi mình chơi cầu lông.'), ('I chat with my friends.', 'Mình trò chuyện với bạn bè.')], 'I + động từ + at break time.'),
  g('Nói về người khác', [('He plays football at break time.', 'Cậu ấy chơi bóng đá.'), ('What does she do at break time?', 'Cô ấy làm gì giờ ra chơi?')], 'He / She + động từ thêm s: plays. Câu hỏi với he / she dùng does.')],
 {},
 [('What do you do at break time?', 'I play chess.', 'chess', '♟️'), ('What does she do at break time?', 'She plays volleyball.', 'volleyball', '🏐'), ('What do you do at break time?', 'I chat with my friends.', 'chat', '💬')])

unit(11, 'My family', 'Gia đình của mình',
 [('grandfather', '👴', 'ông'), ('grandmother', '👵', 'bà'), ('father', '👨', 'bố'), ('mother', '👩', 'mẹ'), ('brother', '👦', 'anh / em trai'), ('sister', '👧', 'chị / em gái'),
  N('eleven', '11', ''), N('twelve', '12', ''), N('thirteen', '13', ''), N('fourteen', '14', ''), N('fifteen', '15', '')],
 {'grandfather': 'This is my grandfather.', 'grandmother': 'This is my grandmother.', 'father': 'He is my father.', 'mother': 'She is my mother.', 'brother': 'He is my brother.', 'sister': 'She is my sister.', 'eleven': "I'm eleven.", 'twelve': 'My brother is twelve.', 'thirteen': 'My sister is thirteen.', 'fourteen': 'My brother is fourteen.', 'fifteen': 'My sister is fifteen.'},
 [g('Giới thiệu người thân', [('This is my grandmother.', 'Đây là bà của mình.'), ('He is my father. / She is my mother.', 'Ông ấy là bố mình. / Bà ấy là mẹ mình.')], 'He dùng cho nam, she dùng cho nữ.'),
  g('Hỏi tuổi', [('How old are you? – I’m eleven.', 'Bạn bao nhiêu tuổi? – Mình mười một tuổi.'), ('How old is she? – She is thirteen.', 'Cô ấy bao nhiêu tuổi?')], 'Số từ 11 đến 15: eleven, twelve, thirteen, fourteen, fifteen.')],
 {},
 [('Who is he?', 'He is my brother.', 'brother', '👦'), ('How old are you?', "I'm eleven.", 'eleven', '11'), ('How old is she?', 'She is fifteen.', 'fifteen', '15')])

unit(12, 'Jobs', 'Nghề nghiệp',
 [('job', '💼', 'nghề nghiệp'), ('doctor', '🧑‍⚕️', 'bác sĩ'), ('driver', '🚌', 'tài xế'), ('teacher', '🧑‍🏫', 'giáo viên'), ('worker', '👷', 'công nhân'), ('cook', '🧑‍🍳', 'đầu bếp'), ('farmer', '🧑‍🌾', 'nông dân'), ('nurse', '💉', 'y tá'), ('singer', '🎤', 'ca sĩ'), ('pupil', '🧒', 'học sinh')],
 {'job': "What is his job?", 'doctor': 'He is a doctor.', 'driver': 'He is a driver.', 'teacher': 'She is a teacher.', 'worker': 'He is a worker.', 'cook': 'She is a cook.', 'farmer': 'He is a farmer.', 'nurse': 'She is a nurse.', 'singer': 'She is a singer.', 'pupil': 'He is a pupil.'},
 [g('Hỏi và nói nghề nghiệp', [('What is her job? – She’s a nurse.', 'Nghề của cô ấy là gì? – Cô ấy là y tá.'), ('What is his job? – He’s a driver.', 'Nghề của anh ấy là gì? – Anh ấy là tài xế.')], 'She’s = She is, He’s = He is.'),
  g('Hỏi xem có đúng nghề đó không', [('Is he a farmer?', 'Anh ấy là nông dân phải không?'), ("Yes, he is. / No, he isn't.", 'Đúng vậy. / Không phải.')], 'Is he / she + a + nghề nghiệp?')],
 {},
 [('What is her job?', "She's a nurse.", 'nurse', '💉'), ('What is his job?', "He's a driver.", 'driver', '🚌'), ('Is he a farmer?', 'Yes, he is.', 'yes', '🧑‍🌾')])

unit(13, 'My house', 'Ngôi nhà của mình',
 [('house', '🏠', 'ngôi nhà'), ('living room', '🛋️', 'phòng khách'), ('bedroom', '🛏️', 'phòng ngủ'), ('kitchen', '🍳', 'nhà bếp'), ('bathroom', '🛁', 'phòng tắm'), ('table', '🍽️', 'cái bàn'), ('chair', '🪑', 'cái ghế'), ('lamp', '💡', 'cái đèn'), ('here', '📍', 'ở đây'), ('there', '🔭', 'ở đó'), ('in', '📥', 'ở trong'), ('on', '🔝', 'ở trên')],
 {'house': 'This is my house.', 'living room': 'The sofa is in the living room.', 'bedroom': 'My bed is in the bedroom.', 'kitchen': 'My mother is in the kitchen.', 'bathroom': 'This is the bathroom.', 'table': 'The book is on the table.', 'chair': 'The bag is on the chair.', 'lamp': 'The lamp is here.', 'here': "It's here.", 'there': "It's there.", 'in': 'The cat is in the house.', 'on': 'The pen is on the table.'},
 [g('Hỏi vật ở đâu', [('Where is the lamp? – It’s here.', 'Cái đèn ở đâu? – Nó ở đây.'), ('Where is your book? – It’s on the table.', 'Quyển sách ở đâu? – Nó ở trên bàn.')], 'Where is + danh từ số ít? – It’s + nơi chốn.'),
  g('Hỏi nhiều vật ở đâu', [('Where are my pens? – They are on the chair.', 'Những cây bút của mình ở đâu? – Chúng ở trên ghế.')], 'Danh từ số nhiều dùng Where are… ? – They are…')],
 {},
 [('Where is the lamp?', "It's on the table.", 'on', '🔝'), ('Where is the cat?', "It's in the kitchen.", 'in', '📥'), ('Where are the books?', 'They are on the chair.', 'chair', '🪑')])

unit(14, 'My bedroom', 'Phòng ngủ của mình',
 [('bedroom', '🛏️', 'phòng ngủ'), ('bed', '😴', 'cái giường'), ('desk', '📚', 'bàn học'), ('door', '🚪', 'cái cửa ra vào'), ('window', '🪟', 'cửa sổ'), ('big', '🐘', 'to'), ('small', '🐜', 'nhỏ'), ('new', '✨', 'mới'), ('old', '🕰️', 'cũ')],
 {'bedroom': 'This is my bedroom.', 'bed': 'There is a bed in the bedroom.', 'desk': 'There is a desk in the room.', 'door': 'The door is new.', 'window': 'There are two windows in the room.', 'big': 'The window is big.', 'small': 'The bed is small.', 'new': 'My book is new.', 'old': 'My pens are old.'},
 [g('Nói có cái gì ở đâu', [('There is a desk in the bedroom.', 'Có một cái bàn học trong phòng ngủ.'), ('There are two windows in the room.', 'Có hai cái cửa sổ trong phòng.')], 'There is + a/an + danh từ số ít. There are + danh từ số nhiều.'),
  g('Mô tả đồ vật', [('The door is big.', 'Cái cửa thì to.'), ('The chairs are new.', 'Những cái ghế thì mới.')], 'Số ít dùng is, số nhiều dùng are.')],
 {},
 [('Is there a desk in the bedroom?', 'Yes, there is.', 'yes', '📚'), ('Are there two windows in the room?', 'Yes, there are.', 'are', '🪟'), ('Is there a lamp in the kitchen?', "No, there isn't.", "isn't", '💡')])

unit(15, 'At the dining table', 'Bên bàn ăn',
 [('bread', '🍞', 'bánh mì'), ('fish', '🐟', 'cá'), ('chicken', '🍗', 'thịt gà'), ('meat', '🥩', 'thịt'), ('milk', '🥛', 'sữa'), ('rice', '🍚', 'cơm'), ('water', '💧', 'nước'), ('juice', '🧃', 'nước ép'), ('eat', '😋', 'ăn'), ('drink', '🥤', 'uống')],
 {'bread': "I'd like some bread, please.", 'fish': 'Would you like some fish?', 'chicken': "I'd like some chicken, please.", 'meat': 'Would you like some meat?', 'milk': 'Would you like some milk?', 'rice': "I'd like some rice, please.", 'water': "I'd like some water, please.", 'juice': 'Would you like some juice?', 'eat': 'What would you like to eat?', 'drink': 'What would you like to drink?'},
 [g('Mời ai đó ăn hoặc uống', [('Would you like some milk?', 'Bạn có muốn uống sữa không?'), ('Yes, please. / No, thanks.', 'Có, cảm ơn. / Không, cảm ơn.')], 'Would you like some + đồ ăn / đồ uống?'),
  g('Nói mình muốn ăn hoặc uống gì', [('What would you like to eat? – I’d like some rice, please.', 'Bạn muốn ăn gì? – Mình muốn một ít cơm.'), ('What would you like to drink? – I’d like some water.', 'Bạn muốn uống gì? – Mình muốn một ít nước.')], 'I’d like = I would like.')],
 {},
 [('Would you like some milk?', 'Yes, please.', 'please', '🥛'), ('Would you like some bread?', 'No, thanks.', 'thanks', '🍞'), ('What would you like to drink?', "I'd like some water, please.", 'water', '💧'), ('What would you like to eat?', "I'd like some rice, please.", 'rice', '🍚')])

unit(16, 'My pets', 'Thú cưng của mình',
 [('pet', '🦴', 'thú cưng'), ('bird', '🐦', 'con chim'), ('cat', '🐱', 'con mèo'), ('dog', '🐶', 'con chó'), ('goldfish', '🐠', 'cá vàng'), ('parrot', '🦜', 'con vẹt'), ('rabbit', '🐰', 'con thỏ')],
 {'pet': 'I love my pet.', 'bird': 'I have a bird.', 'cat': 'I have a cat.', 'dog': 'I have a dog.', 'goldfish': 'I have two goldfish.', 'parrot': 'He has a parrot.', 'rabbit': 'She has a rabbit.'},
 [g('Hỏi bạn có thú cưng không', [('Do you have any rabbits?', 'Bạn có con thỏ nào không?'), ("Yes, I do. / No, I don't.", 'Có. / Không có.')], 'Do you have any + danh từ số nhiều?'),
  g('Hỏi về người khác và số lượng', [('Does she have any parrots? – Yes, she does.', 'Bạn ấy có con vẹt nào không? – Có.'), ('How many cats do you have? – I have three.', 'Bạn có bao nhiêu con mèo? – Mình có ba con.')], 'Với he / she dùng Does… have? – Yes, he / she does.')],
 {},
 [('Do you have any rabbits?', 'Yes, I do.', 'do', '🐰'), ('Do you have any goldfish?', "No, I don't.", "don't", '🐠'), ('How many cats do you have?', 'I have three.', 'three', '🐱'), ('Does she have any parrots?', 'Yes, she does.', 'does', '🦜')])

unit(17, 'Our toys', 'Đồ chơi của chúng mình',
 [('toy', '🪀', 'đồ chơi'), ('doll', '🪆', 'búp bê'), ('car', '🚗', 'ô tô'), ('bus', '🚍', 'xe buýt'), ('train', '🚂', 'tàu hỏa'), ('plane', '✈️', 'máy bay'), ('ship', '🚢', 'con tàu'), ('truck', '🚚', 'xe tải'), ('teddy bear', '🧸', 'gấu bông'), ('kite', '🎏', 'con diều')],
 {'toy': 'My toy is new.', 'doll': 'She has a doll.', 'car': 'He has a car.', 'bus': 'They have a bus.', 'train': 'He has a train.', 'plane': 'He has a plane.', 'ship': 'She has a ship.', 'truck': 'They have a truck.', 'teddy bear': 'She has a teddy bear.', 'kite': 'They have a kite.'},
 [g('Nói ai có đồ chơi gì', [('He has a plane.', 'Cậu ấy có một chiếc máy bay.'), ('They have a car.', 'Họ có một chiếc ô tô.')], 'He / She + has. They / I / You + have.'),
  g('Nói ai không có đồ chơi', [("He doesn't have a plane.", 'Cậu ấy không có máy bay.'), ("They don't have a bus.", 'Họ không có xe buýt.')], "doesn't (he / she) và don't (they / I / you) đứng trước have.")],
 {'plane': "He doesn't have a plane.", 'doll': "She doesn't have a doll."},
 [('Do you have a car?', 'Yes, I do.', 'do', '🚗'), ('Does he have a plane?', "No, he doesn't.", "doesn't", '✈️'), ('What toys do you have?', 'I have a doll.', 'doll', '🪆')])

unit(18, 'Playing and doing', 'Chơi và làm',
 [('writing', '✍️', 'đang viết'), ('dancing', '💃', 'đang nhảy múa'), ('singing', '🎤', 'đang hát'), ('reading', '📖', 'đang đọc'), ('playing basketball', '🏀', 'đang chơi bóng rổ'), ('drawing a picture', '🖼️', 'đang vẽ tranh'), ('watching TV', '📺', 'đang xem ti vi'), ('listening to music', '🎧', 'đang nghe nhạc')],
 {'writing': "I'm writing.", 'dancing': "I'm dancing.", 'singing': "I'm singing.", 'reading': "I'm reading a book.", 'playing basketball': "I'm playing basketball.", 'drawing a picture': "I'm drawing a picture.", 'watching TV': "I'm watching TV.", 'listening to music': "I'm listening to music."},
 [g('Nói mình đang làm gì', [("I'm reading a book.", 'Mình đang đọc sách.'), ("I'm watching TV.", 'Mình đang xem ti vi.')], "I'm + động từ-ing. (I'm = I am)"),
  g('Hỏi bạn đang làm gì', [('What are you doing? – I’m writing.', 'Bạn đang làm gì thế? – Mình đang viết.'), ('Are you singing? – Yes, I am. / No, I’m not.', 'Bạn đang hát phải không? – Đúng. / Không phải.')], 'Động từ kết thúc bằng e bỏ e rồi thêm ing: write → writing, dance → dancing.')],
 {},
 [('What are you doing?', "I'm reading.", 'reading', '📖'), ('Are you singing?', 'Yes, I am.', 'yes', '🎤'), ('Are you dancing?', "No, I'm not.", 'No', '💃')])

unit(19, 'Outdoor activities', 'Hoạt động ngoài trời',
 [('cycling', '🚴', 'đang đạp xe'), ('flying a kite', '🪁', 'đang thả diều'), ('painting', '🎨', 'đang vẽ, tô màu'), ('playing badminton', '🏸', 'đang chơi cầu lông'), ('running', '🏃', 'đang chạy'), ('skating', '⛸️', 'đang trượt patin'), ('skipping', '🪢', 'đang nhảy dây'), ('walking', '🚶', 'đang đi bộ'), ('park', '🌳', 'công viên')],
 {'cycling': "He's cycling in the park.", 'flying a kite': "She's flying a kite.", 'painting': "He's painting.", 'playing badminton': 'They are playing badminton.', 'running': "She's running.", 'skating': "He's skating.", 'skipping': "She's skipping.", 'walking': 'They are walking in the park.', 'park': 'We are in the park.'},
 [g('Nói người khác đang làm gì', [("He's flying a kite.", 'Cậu ấy đang thả diều.'), ("She's skipping.", 'Cô ấy đang nhảy dây.')], "He's / She's + động từ-ing."),
  g('Hỏi người khác đang làm gì', [("What's he doing? – He's cycling.", 'Cậu ấy đang làm gì? – Đang đạp xe.'), ('Is she painting? – No, she isn’t.', 'Cô ấy đang vẽ phải không? – Không phải.')], 'Động từ có một nguyên âm + một phụ âm gấp đôi phụ âm rồi thêm ing: swim → swimming, run → running.')],
 {},
 [("What's he doing?", "He's cycling.", 'cycling', '🚴'), ("What's she doing?", "She's skipping.", 'skipping', '🪢'), ('Is he painting?', "No, he isn't.", "isn't", '🎨'), ('Is she flying a kite?', 'Yes, she is.', 'yes', '🪁')])

unit(20, 'At the zoo', 'Ở sở thú',
 [('zoo', '🦁', 'sở thú'), ('animal', '🐾', 'động vật'), ('tiger', '🐯', 'con hổ'), ('monkey', '🐒', 'con khỉ'), ('peacock', '🦚', 'con công'), ('elephant', '🐘', 'con voi'), ('giraffe', '🦒', 'hươu cao cổ'), ('dance', '🕺', 'nhảy múa'), ('count', '🔢', 'đếm')],
 {'zoo': 'We are at the zoo.', 'animal': 'I like animals.', 'tiger': 'I can see a tiger.', 'monkey': 'I can see a monkey.', 'peacock': 'I can see a peacock.', 'elephant': 'I can see an elephant.', 'giraffe': 'I can see a giraffe.', 'dance': 'The monkey can dance.', 'count': 'The parrot can count.'},
 [g('Hỏi và nói mình nhìn thấy gì', [('What can you see? – I can see a tiger.', 'Bạn nhìn thấy gì? – Mình thấy một con hổ.'), ('What can he see? – He can see a peacock.', 'Cậu ấy nhìn thấy gì? – Cậu ấy thấy một con công.')], 'I / He / She can see + a / an + con vật.'),
  g('Hỏi con vật đang làm gì', [("What's the monkey doing? – It's dancing.", 'Con khỉ đang làm gì? – Nó đang nhảy múa.')], "It's + động từ-ing.")],
 {},
 [('What can you see?', 'I can see a tiger.', 'tiger', '🐯'), ('What can he see?', 'He can see a peacock.', 'peacock', '🦚'), ("What's the monkey doing?", "It's dancing.", 'dancing', '🐒')])
