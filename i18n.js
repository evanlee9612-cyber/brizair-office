/* English / 한국어 switch. Screens are written in English; in Korean mode every on-screen text that matches
   this dictionary is swapped (customer names, numbers and printed documents are never changed). */
(function () {
  'use strict';
  const KO = {
    // nav & common
    'Home': '홈', 'Ask GPT': 'GPT 질문', 'Schedule': '일정', 'Stock': '재고', 'Customers': '고객', 'More': '더보기', 'Money': '돈',
    'Quotes & Forms': '견적서·양식', 'LG Monthly Report': 'LG 월별 보고', 'Activity': '최근 기록', 'Materials for AI': 'AI 자료',
    'Google Sheet': '구글시트', 'Open Google Sheet': '구글시트 열기', 'Help': '사용법', 'Log out': '로그아웃', 'New': '새로 만들기',
    'Up to date': '최신', 'Updating…': '불러오는 중…', 'Offline – tap to retry': '연결 안 됨 – 눌러서 다시', 'Office': '오피스',
    'Save': '저장', 'Cancel': '취소', 'Upload': '올리기', 'Edit': '수정', 'See all': '전체 보기', '+ Add': '+ 추가', 'Today': '오늘',
    'Loading your office data…': '업무 자료 불러오는 중…', 'Loading BRIZAIR Office…': '불러오는 중…',
    'DEMO — fake data. Nothing is saved to the real sheet.': '시범판 — 가짜 자료예요. 진짜 시트에 저장되지 않아요.',
    'Enter your 6-digit PIN': '6자리 비밀번호를 누르세요', 'Checking…': '확인 중…', 'Wrong PIN. Please try again.': '비밀번호가 틀렸어요. 다시 눌러 주세요.',
    // home
    'New job': '새 일정', 'Unit in / out': '유닛 입출고', 'Part in / out': '부품 입출고', 'Payment': '입금', 'Cleaning done': '청소 완료',
    'Quotation': '견적서', 'Jobs today': '오늘 작업', 'Next 7 days': '7일 안', 'Units in stock': '유닛 재고', 'Unpaid balance': '미수금',
    'No jobs today': '오늘 작업 없음', 'No jobs tomorrow': '내일 작업 없음', 'Cleaning due soon': '청소할 때 된 손님',
    'Nothing due in the next 30 days': '30일 안에 청소할 곳 없음', 'Recent activity': '최근 기록',
    'Changes made on this site will show here': '사이트에서 바꾼 내용이 여기 보여요',
    'Ask GPT anything — stock, prices, customers, schedule…': 'GPT에게 무엇이든 물어보세요 — 재고·가격·고객·일정…',
    'Payment received': '입금 받음', 'New installation': '새 설치', 'New contract (receivable)': '새 계약 (받을 돈)',
    // schedule
    'Calendar': '달력', 'List': '목록', 'Upcoming': '다가오는 일정', 'Recent': '지난 일정', 'No upcoming jobs': '다가오는 일정 없음',
    'Sun': '일', 'Mon': '월', 'Tue': '화', 'Wed': '수', 'Thu': '목', 'Fri': '금', 'Sat': '토',
    'Install': '설치', 'Service (AS)': 'AS 수리', 'Service': 'AS', 'Cleaning': '청소', 'Survey': '현장 확인', 'Delivery': '배달',
    'Pull-out': '철거', 'Meeting': '미팅', 'Other': '기타', 'Delivery / Pull-out': '배달·철거',
    'Scheduled': '예정', 'Confirmed': '확정', 'Done': '완료', 'Moved': '변경', 'Cancelled': '취소됨',
    '✅ Done': '✅ 완료', '✖ Cancelled': '✖ 취소', 'Colors:': '색:', 'Change status': '상태 바꾸기', 'When': '언제', 'Units': '유닛',
    'Technician': '기사', 'Notes': '메모', 'Added by': '작성', 'Service report': '서비스 리포트', 'Start-up report': '시운전 기록표',
    'Customer': '손님', 'Edit job': '일정 수정', 'Save job': '일정 저장', 'Date *': '날짜 *', 'Time': '시간', 'Job *': '작업 *',
    'Customer *': '손님 *', 'Location': '장소', 'Units / model': '유닛 / 모델',
    // stock
    'Aircon units': '에어컨 유닛', 'Parts': '부품', 'LG report': 'LG 보고', 'In / Out': '입출고', 'All': '전체', 'In stock': '재고 있음',
    'Zero stock': '재고 0', 'Nothing found': '찾는 게 없어요', 'In stock now': '지금 재고', 'Type': '종류', 'SRP': '손님가', 'Cost': '원가',
    'Supplier': '공급처', 'Part no.': '부품번호', 'Group': '분류', 'Customer price': '손님가', 'LG cost': 'LG 원가', 'Recent moves': '최근 입출고',
    'No moves recorded': '입출고 기록 없음', 'What?': '무엇?', 'Aircon unit': '에어컨 유닛', 'Part': '부품', 'Model *': '모델 *', 'Part *': '부품 *',
    'IN or OUT *': '들어옴(IN) / 나감(OUT) *', 'Qty *': '수량 *', 'Date': '날짜', 'Customer / supplier': '손님 / 공급처', 'PO / invoice #': 'PO / 인보이스 번호',
    'IN = came in (delivery from supplier) · OUT = went out (installed / sold / used)': 'IN = 들어옴(공급처 입고) · OUT = 나감(설치·판매·사용)',
    // customers
    'Search name, company, place, model or serial no.': '이름·회사·장소·모델·시리얼 번호로 찾기', 'Cleaning due (30 days)': '청소할 때 (30일 안)',
    'Recent installations': '최근 설치', 'No customer found': '손님을 못 찾았어요', 'Nothing due': '없음', 'Cleaned': '청소함', 'Add unit': '유닛 추가',
    'Jobs': '일정', 'No jobs in the schedule': '일정 없음', 'Receivables (name match)': '받을 돈 (이름 비슷한 것)', 'Customer not found': '손님을 못 찾았어요',
    'Find the customer or serial no.': '손님이나 시리얼 번호 찾기', 'Then choose the unit.': '그다음 유닛을 고르세요.', 'Cleaning date': '청소 날짜',
    'Company / project': '회사 / 현장', 'Description': '설명', 'Qty': '수량', 'Indoor SN': '실내기 시리얼', 'Outdoor SN': '실외기 시리얼',
    'Installed': '설치일', 'Start-up': '시운전일', 'Invoice date': '인보이스 날짜', 'Invoice name': '인보이스 이름', 'Remarks': '비고',
    'If this unit came from stock, also record it as OUT in Unit in / out.': '재고에서 나간 유닛이면 유닛 입출고에서 OUT도 기록해 주세요.',
    // money
    'New contract': '새 계약', 'Total unpaid': '미수금 합계', 'Open accounts': '남은 거래', 'Unpaid': '미수', 'Payments': '입금 기록', 'Fully paid': '완납',
    'Nothing unpaid 🎉': '미수금 없음 🎉', 'Balance now': '지금 잔액', 'Status': '상태', 'Contract': '계약', 'Balance Nov 12': '11/12 잔액',
    'Paid since': '그 뒤 입금', 'Ref': '참고번호', 'No payments recorded since Nov 12': '11/12 이후 입금 기록 없음', 'Statement': '청구서',
    'Customer / project *': '손님 / 건 *', 'Amount ₱ *': '금액 ₱ *', 'Method *': '방법 *', 'Received by': '받은 사람', 'Choose…': '고르세요…',
    'Not in the list? Add it first with “New contract” in Money.': '목록에 없으면 돈 → “새 계약”으로 먼저 추가하세요.',
    'Cash': '현금', 'Bank': '은행', 'GCash': 'GCash', 'Check': '수표', 'Contract price': '계약 금액', 'Balance to collect ₱ *': '받을 금액 ₱ *',
    'Ref (quotation / invoice no.)': '참고번호 (견적·인보이스)', 'Use a clear name. Payments are matched to this exact name.': '알아보기 쉬운 이름으로. 입금은 이 이름과 똑같이 맞춰져요.',
    'Statement of account': '거래처 청구서', 'Customer name on the statement': '청구서에 들어갈 이름', 'Include': '넣을 것', 'Print / PDF': '인쇄 / PDF',
    // quotes
    'New quotation': '새 견적서', 'Quotations': '견적서 목록', 'No quotations yet': '견적서 없음', 'Print a form': '양식 인쇄',
    'Service report (blank)': '서비스 리포트 (빈 양식)', 'Start-up report (blank)': '시운전 기록표 (빈 양식)', 'Quotes': '견적서',
    'Customer name *': '손님 이름 *', 'Company': '회사', 'Contact person': '담당자', 'Address': '주소', 'Phone': '전화', 'Email': '이메일',
    'Project / subject': '건명', 'Valid for': '유효 기간', 'Items': '품목', '+ Installation': '+ 설치비', '+ Materials': '+ 자재', '+ Other line': '+ 기타 줄',
    'Discount (₱)': '할인 (₱)', 'VAT': '부가세', 'Prices include 12% VAT': '부가세 12% 포함 가격', 'Add 12% VAT': '부가세 12% 별도', 'No VAT line': '부가세 줄 없음',
    'Subtotal': '소계', 'Discount': '할인', 'Total': '합계', 'VAT included': '포함된 부가세', 'VAT 12%': '부가세 12%',
    'Notes & terms (printed at the bottom)': '메모·조건 (견적서 아래에 인쇄)', 'Save & print / PDF': '저장 후 인쇄 / PDF', 'Status…': '상태…',
    'Unit price ₱': '단가 ₱', 'Amount': '금액', 'Quotation status': '견적서 상태', 'Draft': '작성 중', 'Sent': '보냄', 'Accepted': '수주', 'Lost': '실패',
    'Quotation not found': '견적서를 못 찾았어요',
    'Accepted? Add it in Money → New contract so the balance is tracked.': '수주했으면 돈 → 새 계약에 추가해야 잔액이 관리돼요.',
    'No items yet — add from stock or tap “+ Installation”.': '품목이 없어요 — 재고에서 추가하거나 “+ 설치비”를 누르세요.',
    'Tip: open a job in Schedule → “Service report” fills in the customer, model and technician for you.': '팁: 일정에서 작업을 열고 “서비스 리포트”를 누르면 손님·모델·기사가 자동으로 채워져요.',
    // report
    'Show items with no stock': '재고 없는 품목도 보기',
    'Same layout as the old Excel: beginning stock, daily IN and OUT, ending stock. Made automatically from Unit / Part in-out records.': '예전 엑셀과 같은 모양: 월초 재고, 날짜별 입고·출고, 월말 재고. 입출고 기록으로 자동으로 만들어져요.',
    'IN — deliveries (day of month)': '입고 (날짜)', 'OUT — issued / installed (day of month)': '출고 (날짜)', 'Item': '품목', 'Beg': '월초', 'End': '월말',
    // ask
    'GPT online': 'GPT 켜짐', '● GPT online': '● GPT 켜짐', '● GPT offline — Sir Kim\'s PC is off': '● GPT 꺼짐 — 의찬 형님 컴퓨터가 꺼져 있어요', 'Type your question…': '질문을 쓰세요…', 'Upload a file or photo': '파일·사진 올리기', 'Write a rule / answer': '규칙·답 적기',
    'Nothing uploaded yet': '올린 자료 없음', 'Open file': '파일 열기', 'Upload for GPT': 'GPT용 자료 올리기', 'File or photo *': '파일 또는 사진 *',
    'Title': '제목', 'Note for GPT (optional)': 'GPT에게 메모 (선택)', 'What should GPT know?': 'GPT가 알아야 할 내용',
    'PDF, Excel, Word, photo of a document (max 15 MB)': 'PDF·엑셀·워드·서류 사진 (15MB까지)',
    'Was this answer helpful?': '답이 도움이 됐나요?', 'Good': '좋아요', 'Wrong / not enough': '틀림 / 부족',
    'GPT needs this information': 'GPT가 몰라서 못 답한 것', 'Questions GPT could not answer well — upload the missing info so it can answer next time.': 'GPT가 잘 못 답한 질문이에요 — 빠진 자료를 올리면 다음엔 답해요.',
    // invoices, help, rating
    'Quotes & Invoices': '견적서·인보이스', 'Quotes, invoices & forms': '견적서·인보이스·양식', 'Invoices': '인보이스', 'Invoice': '인보이스', 'New invoice': '새 인보이스',
    'No invoices yet': '인보이스 없음', 'Make invoice': '인보이스 만들기', 'Invoice status': '인보이스 상태', 'Due date': '납기일', 'Customer P.O. no.': '손님 P.O 번호',
    'Payment terms': '지불 조건', 'Customer TIN': '손님 TIN(사업자번호)', 'Business style': '업종', 'Partially paid': '일부 입금', 'Paid': '완납',
    'Payment details (bank / GCash) — printed on the invoice': '입금 계좌 (은행·GCash) — 인보이스에 인쇄', 'Saved on this phone for the next invoice.': '다음 인보이스를 위해 이 폰에 저장돼요.',
    'Also add to Money (receivables) so payments are tracked': '돈(받을 돈)에도 추가해서 입금 관리하기',
    'Temporary invoice layout — it will be changed to BRIZAIR\'s own invoice form.': '임시 인보이스 양식이에요 — BRIZAIR 기존 양식으로 바뀔 예정이에요.',
    'Payments are recorded in Money → Payment received.': '입금은 돈 → 입금 받음에서 기록해요.',
    'Accepted? Tap “Make invoice”, or add it in Money → New contract so the balance is tracked.': '수주했으면 “인보이스 만들기”를 누르거나, 돈 → 새 계약에 추가하세요.',
    'All instructions': '전체 사용법', 'OK, got it': '알겠어요', 'Ask GPT in your language': '편한 언어로 GPT에게 물어보세요',
    'Everything you save goes to the BRIZAIR Office Sheet.': '저장한 내용은 모두 BRIZAIR 업무시트에 들어가요.',
    'Nothing is deleted. Made a mistake? Open it and fix it, or record a correction.': '지워지는 건 없어요. 틀렸으면 열어서 고치거나 바로잡는 기록을 하나 더 하세요.',
    'What was wrong or missing? (optional)': '무엇이 틀렸거나 빠졌나요? (선택)', 'Thanks — saved so we can teach GPT': '고마워요 — GPT를 가르치는 데 쓸게요',
    '👍 Good': '👍 좋아요', '👎 Wrong / not enough': '👎 틀림 / 부족',
    'Tap a day to see its jobs. Tap a job to change status (Confirmed / Done) or print the Service report.': '날짜를 누르면 그날 일정이 보여요. 일정을 누르면 상태(확정·완료)를 바꾸거나 서비스 리포트를 인쇄해요.',
    'New job: the blue “New job” button.': '새 일정: 파란 “새 일정” 버튼.',
    'Tap a model to see stock and recent moves, then IN or OUT.': '모델을 누르면 재고와 최근 입출고가 보이고, IN·OUT을 바로 기록해요.',
    'Unit came from the supplier = IN. Installed / sold = OUT.': '공급처에서 들어옴 = IN. 설치·판매 = OUT.',
    'Search by name, place, model or serial number.': '이름·장소·모델·시리얼 번호로 찾으세요.',
    'Open a customer → “Cleaned” after cleaning; next cleaning is set 6 months later.': '손님을 열고 청소 후 “청소함” → 다음 청소일이 6개월 뒤로 잡혀요.',
    'Customer paid → “Payment received”. The balance updates by itself.': '손님이 돈을 냈으면 → “입금 받음”. 잔액은 저절로 바뀌어요.',
    'New sale on credit → “New contract”. “Statement” prints a statement of account.': '외상 판매 → “새 계약”. “청구서”로 거래처 청구서를 인쇄해요.',
    'New quotation → add items from stock (price fills in) → Save & print / PDF.': '새 견적서 → 재고에서 품목 추가(가격 자동) → 저장 후 인쇄 / PDF.',
    'Quotation accepted → open it → “Make invoice”.': '견적이 수주되면 → 열어서 → “인보이스 만들기”.',
    'Type the customer, add items from stock, then Save & print / PDF.': '손님을 쓰고 재고에서 품목을 넣은 뒤 저장 후 인쇄 / PDF.',
    'Invoices can add themselves to Money so payments are tracked.': '인보이스는 돈(받을 돈)에 자동으로 추가할 수 있어요.',
    'Ask like you talk to a person. English, Tagalog, Kapampangan or Korean.': '사람한테 말하듯 물어보세요. 영어·타갈로그어·카팡팡안어·한국어 다 돼요.',
    'Answer wrong or missing? Tap 👎 — then upload the right info in Materials for AI.': '답이 틀리거나 부족하면 👎 → AI 자료에 맞는 정보를 올려 주세요.',
    'Upload price lists, LG brochures, warranty rules, sample documents, photos of papers.': '가격표·LG 안내서·보증 규정·서류 샘플·서류 사진을 올리세요.',
    'Or tap “Write a rule / answer” and type it. GPT reads it from the next question.': '또는 “규칙·답 적기”로 직접 쓰세요. 다음 질문부터 GPT가 읽어요.',
    'Choose units or parts and the month → Print / PDF for LG.': '유닛·부품과 달을 고르고 → LG용 인쇄 / PDF.',
    'Tap the big buttons on Home for daily work: New job, Unit in / out, Part in / out, Payment, Cleaning done, Quotation.': '매일 하는 일은 홈의 큰 버튼으로: 새 일정, 유닛 입출고, 부품 입출고, 입금, 청소 완료, 견적서.',
    'Not sure? Ask GPT (bottom middle) — e.g. “How do I record a unit we installed today?”': '모르겠으면 GPT에게 물어보세요 (아래 가운데) — 예: “오늘 설치한 유닛 어떻게 기록해?”',
    'Teach GPT. Upload price lists, LG brochures, rules, FAQ, sample quotations, photos of documents. GPT reads them before answering.': 'GPT를 가르쳐 주세요. 가격표·LG 안내서·규칙·자주 묻는 질문·견적서 샘플·서류 사진을 올리면 GPT가 읽고 답해요.',
    'GPT reads the whole office sheet and the uploaded materials, then answers. English, Tagalog, Kapampangan or Korean is OK.': 'GPT가 업무시트 전체와 올린 자료를 읽고 답해요. 영어·타갈로그어·카팡팡안어·한국어 다 돼요.',
    'Tip: one topic per upload, with a clear title (e.g. “LG price list Nov 2026”). Wrong or old? Tap ✕ to remove it.': '팁: 한 번에 한 주제, 알아보기 쉬운 제목으로 (예: “LG 가격표 2026년 11월”). 틀리거나 옛것이면 ✕로 지우세요.',
    'PARTIAL': '일부 입금', 'UNPAID': '미납', 'PAID': '완납',
    'Balance NOW = balance on Nov 12 (from the old Excel) minus payments recorded here. Cash, bank, payables and salary notes are in the sheet tab FINANCE NOTES.': '지금 잔액 = 11/12 잔액(예전 엑셀) − 여기서 기록한 입금. 현금·은행·갚을 돈·급여 메모는 시트의 FINANCE NOTES 탭에 있어요.',
    'Previous month': '이전 달', 'Next month': '다음 달', 'Send': '보내기', 'Close': '닫기', 'Customer name': '손님 이름',
    'Type to search existing customers': '기존 손님 이름을 쓰면 찾아져요', 'Type to search…': '쓰면 찾아져요…', 'Type name, place or SN…': '이름·장소·시리얼 번호…',
    'e.g. Supply and installation of 2 units split type': '예: 스플릿형 2대 공급 및 설치', 'e.g. 15 days': '예: 15일', 'e.g. 30 days, COD': '예: 30일, 착불(COD)',
    '➕ Add from stock: type model or part…': '➕ 재고에서 추가: 모델이나 부품 이름…', 'e.g. payment terms, delivery, warranty': '예: 지불 조건, 배송, 보증',
    'e.g. BDO · Account name: BRIZAIR CORP · Account no. ...': '예: BDO · 예금주: BRIZAIR CORP · 계좌번호 ...',
    'Address / building / room': '주소 / 건물 / 호수', 'e.g. 2 × HSN12ISB 1.5hp': '예: HSN12ISB 1.5hp 2대', 'Contact person, special request…': '담당자, 특별 요청…',
    'OR #, check #, bank ref…': 'OR 번호, 수표 번호, 은행 참조…', 'Save payment': '입금 저장', 'e.g. Kodec P.O 03500': '예: Kodec P.O 03500', 'e.g. due Dec 4, 2026': '예: 2026년 12월 4일까지',
    'e.g. LG price list Nov 2026': '예: LG 가격표 2026년 11월', 'e.g. Use this for quotations from Nov 2026': '예: 2026년 11월부터 견적에 사용',
    'e.g. Cleaning price, Warranty rule': '예: 청소 가격, 보증 규칙', 'e.g. HSN12ISB/HSU12ISB': '예: HSN12ISB/HSU12ISB', 'e.g. 1.5hp Split Type': '예: 1.5마력 스플릿형',
    'e.g. Cleaning is ₱1,500 per split-type unit. Floor stand ₱3,000. Free check-up within 1 year of installation.': '예: 스플릿형 청소 1대 ₱1,500, 스탠드형 ₱3,000. 설치 1년 안 무료 점검.',
    'Add this site to your phone\'s Home Screen: Chrome menu ⋮ → “Add to Home screen” (iPhone: Share → “Add to Home Screen”).': '휴대폰 홈 화면에 추가하면 앱처럼 써요: 크롬 메뉴 ⋮ → “홈 화면에 추가” (아이폰: 공유 → “홈 화면에 추가”).',
    'Everything is saved to the BRIZAIR Office Sheet. Every change is listed in Activity.': '모든 내용은 BRIZAIR 업무시트에 저장되고, 바뀐 내용은 “최근 기록”에 남아요.',
    '📅 New job': '📅 새 일정', '📦 Unit came in / went out': '📦 유닛 들어옴 / 나감', '🔧 Part used': '🔧 부품 사용', '💵 Customer paid': '💵 손님 입금',
    '🧽 Cleaning done': '🧽 청소 완료', '📄 Quotation': '📄 견적서', '🧾 Invoice': '🧾 인보이스', '💬 Ask GPT': '💬 GPT 질문',
    '🖨️ Service report / Start-up form': '🖨️ 서비스 리포트 / 시운전 기록표', '📊 LG monthly report': '📊 LG 월별 보고', '❓ Mistake?': '❓ 틀렸을 때',
    'Tap + → New job. Pick the date, job type and customer. When the job is done, open it and tap “Done”.': '+ → 새 일정. 날짜·작업·손님을 고르세요. 작업이 끝나면 열어서 “완료”를 누르세요.',
    'Tap + → Unit in / out. Choose the model, IN or OUT, and the quantity. Stock updates by itself.': '+ → 유닛 입출고. 모델, IN/OUT, 수량을 고르면 재고가 저절로 바뀌어요.',
    'Tap + → Part in / out → OUT. Write the customer name.': '+ → 부품 입출고 → OUT. 손님 이름을 쓰세요.',
    'Tap + → Payment. Choose the customer / project and type the amount. The balance updates by itself.': '+ → 입금. 손님 / 건을 고르고 금액을 쓰면 잔액이 저절로 바뀌어요.',
    'Customers → find the customer → “Cleaned” on the unit. Next cleaning (6 months) is automatic.': '고객 → 손님 찾기 → 유닛의 “청소함”. 다음 청소(6개월 뒤)는 자동이에요.',
    'Quotes & Invoices → New quotation. Add items from stock (price fills in), save, then Print / PDF and send to the customer.': '견적서·인보이스 → 새 견적서. 재고에서 품목 추가(가격 자동) → 저장 → 인쇄 / PDF로 손님에게 보내기.',
    'Quotes & Invoices → New invoice (or open a quotation → Make invoice). Save & print / PDF. It can add itself to Money so payments are tracked.': '견적서·인보이스 → 새 인보이스 (또는 견적서 열고 → 인보이스 만들기). 저장 후 인쇄 / PDF. 돈(받을 돈)에 자동 추가할 수 있어요.',
    'Bottom middle button. Ask in English, Tagalog, Kapampangan or Korean. Wrong answer? Tap 👎 and upload the right info in Materials for AI.': '아래 가운데 버튼. 영어·타갈로그어·카팡팡안어·한국어로 물어보세요. 답이 틀리면 👎 누르고 AI 자료에 맞는 정보를 올리세요.',
    'Open a job → Service report or Start-up report. Customer, model and technician are filled in.': '일정 열기 → 서비스 리포트 또는 시운전 기록표. 손님·모델·기사가 채워져 있어요.',
    'More → LG Monthly Report → choose the month → Print / PDF.': '더보기 → LG 월별 보고 → 달 고르기 → 인쇄 / PDF.',
    'Open the item again and fix it, or record a correction (e.g. an IN to cancel a wrong OUT). Nothing is deleted.': '다시 열어서 고치거나 바로잡는 기록을 하세요 (예: 잘못 넣은 OUT을 IN으로 상쇄). 지워지는 건 없어요.',
    'Sorry, GPT could not answer this one. Please ask again in a different way, or ask Sir Kim.': '죄송해요, 이 질문은 GPT가 답하지 못했어요. 다르게 다시 묻거나 대표님께 물어보세요.',
    // more / help
    'Money — unpaid & payments': '돈 — 미수금·입금', 'Materials for AI (upload)': 'AI 자료 올리기', 'Language': '언어', 'How to use': '사용법',
    'No activity yet': '기록 없음', 'Latest changes made on this site (also saved in the sheet tab APP LOG).': '사이트에서 바꾼 최근 내용 (시트 APP LOG 탭에도 저장돼요).',
    // toasts / confirms
    'Saved ✓': '저장했어요 ✓', 'Job added ✓': '일정 추가 ✓', 'Job updated ✓': '일정 수정 ✓', 'Payment saved ✓': '입금 저장 ✓', 'Contract added ✓': '계약 추가 ✓',
    'Installation saved ✓': '설치 저장 ✓', 'Cleaning saved ✓ next cleaning in 6 months': '청소 저장 ✓ 다음 청소는 6개월 뒤',
    'Saved ✓ GPT will use it': '저장 ✓ GPT가 이제 이걸 써요', 'Removed': '지웠어요', 'GPT answered your question ✓': 'GPT가 답했어요 ✓',
    'Date and customer are needed': '날짜와 손님이 필요해요', 'Choose IN or OUT': 'IN 또는 OUT을 고르세요', 'Qty must be 1 or more': '수량은 1 이상',
    'Choose the customer / project': '손님 / 건을 고르세요', 'Type the amount': '금액을 쓰세요', 'Name and balance are needed': '이름과 금액이 필요해요',
    'Customer and model are needed': '손님과 모델이 필요해요', 'Customer name is needed': '손님 이름이 필요해요', 'Add at least one item': '품목을 하나 이상 넣으세요',
    'Write something first': '먼저 내용을 쓰세요', 'Choose a file first': '먼저 파일을 고르세요', 'File is too big (max 15 MB)': '파일이 너무 커요 (15MB까지)',
    'Choose at least one': '하나 이상 고르세요', 'Log out on this device?': '이 기기에서 로그아웃할까요?', 'Thanks! ✓': '고마워요 ✓',
    'Please log in again': '다시 로그인해 주세요', 'Please log in again.': '다시 로그인해 주세요.'
  };
  const PATTERNS = [
    [/^Good (morning|afternoon|evening), Sir Kim$/, '안녕하세요, 대표님'],
    [/^Good morning, (.+)$/, '좋은 아침이에요, $1님'], [/^Good afternoon, (.+)$/, '안녕하세요, $1님'], [/^Good evening, (.+)$/, '수고 많으셨어요, $1님'],
    [/^(\d+) jobs?$/, '$1건'], [/^(\d+) units?$/, '$1대'], [/^(\d+) customers?$/, '손님 $1명'], [/^Units \((\d+)\)$/, '유닛 ($1)'],
    [/^Uploaded \((\d+)\)$/, '올린 자료 ($1)'], [/^All (\d+)$/, '전체 $1'], [/^Tomorrow · (.+)$/, '내일 · $1'], [/^Tomorrow$/, '내일'],
    [/^In stock now: (.+)$/, '지금 재고: $1'], [/^Total on hand: ?$/, '전체 재고: '], [/^\+(\d+) more$/, '+$1건 더'],
    [/^Search (.+)…$/, '검색…'], [/^Logged in as ?$/, '로그인: '], [/^Saved ✓ (.+)$/, '저장 ✓ $1'], [/^Status: (.+)$/, '상태: $1'],
    [/^Could not load: (.+)$/, '불러오기 실패: $1'], [/^Choose the (model|part) from the list$/, '목록에서 골라 주세요'],
    [/^Stock is only (-?\d+)\. Record OUT (\d+) anyway\?$/, '재고가 $1개뿐이에요. 그래도 OUT $2개를 기록할까요?'],
    [/^Uploaded ✓ GPT can read (.+) characters$/, '올렸어요 ✓ GPT가 글자 $1자를 읽을 수 있어요'],
    [/^Payment saved ✓ (.+)$/, '입금 저장 ✓ $1'], [/^Invoice saved, but could not add to Money: (.+)$/, '인보이스는 저장됐지만 돈에 추가 못 함: $1'],
    [/^(.+) → (Scheduled|Confirmed|Done|Moved|Cancelled)$/, '$1 → $2'], [/^Sent\. GPT will answer in about 20–60 seconds…$/, '보냈어요. GPT가 20~60초 안에 답해요…'],
    [/^GPT is reading the sheet…$/, 'GPT가 시트를 읽는 중…'], [/^Waiting — Sir Kim's PC is offline\. It will answer when the PC is on\.$/, '대기 중 — 의찬 형님 컴퓨터가 꺼져 있어요. 켜지면 답해요.'], [/^No jobs\. ?$/, '일정 없음. '], [/^\+ Add a job on this day$/, '+ 이날 일정 추가']
  ];
  const FRAG = [[/\bInstalled (?=[A-Z—])/g, '설치 '], [/ · Last cleaning /g, ' · 마지막 청소 '], [/ · Next$/g, ' · 다음'], [/^Next$/g, '다음'],
    [/\bIndoor SN /g, '실내기 SN '], [/\bOutdoor SN /g, '실외기 SN '], [/ in stock now\b/g, ' 지금 재고'], [/\bstock (\d)/g, '재고 $1']];

  let lang = 'en';
  try { lang = localStorage.getItem('brz_lang') || ''; } catch (e) { lang = ''; }
  const SKIP = el => el.closest && el.closest('#print, .doc, .bub, .noi18n, script, style');

  function trText(s) {
    if (lang !== 'ko' || !s) return s;
    const t = s.trim();
    if (!t) return s;
    let r = KO[t];
    if (r === undefined) for (const [re, to] of PATTERNS) if (re.test(t)) { r = t.replace(re, to); break; }
    if (r === undefined) { let x = t; FRAG.forEach(([re, to]) => { x = x.replace(re, to); }); if (x !== t) r = x; }
    if (r === undefined) return s;
    return s.replace(t, r);
  }
  function walk(root) {
    if (lang !== 'ko' || !root) return;
    if (root.nodeType === 3) { if (!SKIP(root.parentElement || document.body)) { const v = trText(root.nodeValue); if (v !== root.nodeValue) root.nodeValue = v; } return; }
    if (root.nodeType !== 1 || SKIP(root)) return;
    ['placeholder', 'aria-label', 'title'].forEach(a => { const v = root.getAttribute && root.getAttribute(a); if (v) { const n = trText(v); if (n !== v) root.setAttribute(a, n); } });
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = tw.nextNode())) {
      if (n.nodeType === 1) {
        if (SKIP(n)) continue;
        ['placeholder', 'aria-label', 'title'].forEach(a => { const v = n.getAttribute(a); if (v) { const x = trText(v); if (x !== v) n.setAttribute(a, x); } });
        if (n.tagName === 'OPTION') { const v = trText(n.textContent); if (v !== n.textContent) n.textContent = v; }
      } else if (n.parentElement && !SKIP(n.parentElement)) {
        const v = trText(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v;
      }
    }
  }
  const mo = new MutationObserver(ms => { if (lang !== 'ko') return; ms.forEach(m => m.addedNodes.forEach(walk)); });
  function start() { mo.observe(document.body, {childList: true, subtree: true}); walk(document.body); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  window.BRZ_I18N = {
    get lang() { return lang; },
    tr: trText,
    defaultFor(role) { if (!lang) { lang = role === 'owner' ? 'ko' : 'en'; } return lang; },
    set(l) { lang = l; try { localStorage.setItem('brz_lang', l); } catch (e) { } }
  };
})();
