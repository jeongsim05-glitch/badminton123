import { Member, Match, FinancialRecord, Expense, Donation, Notice, GlobalSettings, AttendanceRecord } from "../types";

// 배포된 Google Apps Script 웹 앱 URL
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz671_SVZXq53NWzs4om3MY8Hkmlng7HF_K_PApOjcu75hdwEpeaB8OUNlzLhpv8F1JLg/exec"; 

// --- Translation Maps (Korean <-> English) ---

// 1. Table Name Mapping
const TABLE_MAP: Record<string, string> = {
  'members': '회원명부',
  'matches': '경기기록',
  'financialRecords': '회비납부내역',
  'expenses': '지출내역',
  'donations': '찬조내역',
  'notices': '공지사항',
  'attendance': '출석부',
  'settings': '환경설정'
};

// 2. Column Header Mapping
const HEADER_MAP: Record<string, Record<string, string>> = {
  'members': {
    'id': '고유번호', 'name': '이름', 'rank': '급수', 'position': '직책', 
    'password': '비밀번호', 'memberType': '회원구분', 'birthDate': '생년월일', 
    'joinDate': '가입일', 'tenure': '근속기간', 'phone': '전화번호', 
    'email': '이메일', 'address': '주소', 'job': '직업', 'notes': '비고',
    'isSickLeave': '병가여부', 'isFamilyMember': '가족회원여부', 
    'isCoupleMember': '부부회원여부', 'gender': '성별', 
    'accountNumber': '계좌번호', 'topSize': '상의사이즈', 'bottomSize': '하의사이즈',
    'lessonDays': '레슨요일'
  },
  'matches': {
    'id': '매치ID', 'type': '경기종목', 'team1': '팀1정보', 'team2': '팀2정보',
    'score1': '점수1', 'score2': '점수2', 'date': '날짜', 'winner': '승리팀'
  },
  'financialRecords': {
    'memberId': '회원ID', 'year': '연도', 'payments': '납부내역', 'exemptMonths': '면제월'
  },
  'expenses': {
    'id': '지출ID', 'date': '날짜', 'category': '항목', 'description': '내용', 
    'amount': '금액', 'receiptUrl': '영수증URL'
  },
  'donations': {
    'id': '찬조ID', 'date': '날짜', 'eventName': '행사명', 
    'donorName': '기부자', 'amount': '금액', 'item': '물품'
  },
  'notices': {
    'id': '공지ID', 'month': '해당월', 'agenda': '안건', 
    'events': '행사', 'nextSchedule': '다음일정'
  },
  'attendance': {
    'date': '날짜', 'memberIds': '출석회원ID'
  },
  'settings': {
    'monthlyFee': '정회원비', 'associateFee': '준회원비', 
    'initialCarryover': '이월금', 'enableAICoaching': 'AI코칭사용', 
    'enableAttendance': '출석부사용'
  }
};

// Helper: Translate Object Keys (English -> Korean)
const translateToKorean = (tableName: string, data: any[]) => {
  const map = HEADER_MAP[tableName];
  if (!map) return data;

  return data.map(item => {
    const newItem: any = {};
    Object.keys(item).forEach(key => {
      const koreanKey = map[key] || key; // If no map, keep original
      newItem[koreanKey] = item[key];
    });
    return newItem;
  });
};

// Helper: Translate Object Keys (Korean -> English)
const translateToEnglish = (tableName: string, data: any[]) => {
  const map = HEADER_MAP[tableName];
  if (!map) return data;

  // Create reverse map
  const reverseMap: Record<string, string> = {};
  Object.entries(map).forEach(([eng, kor]) => reverseMap[kor] = eng);

  return data.map(item => {
    const newItem: any = {};
    Object.keys(item).forEach(key => {
      const englishKey = reverseMap[key] || key;
      newItem[englishKey] = item[key];
    });
    return newItem;
  });
};


// Data mapping helper
interface SheetData {
  members: Member[];
  matches: Match[];
  financialRecords: any[]; // Raw array from sheet
  expenses: Expense[];
  donations: Donation[];
  notices: Notice[];
  attendance: AttendanceRecord[];
  settings: GlobalSettings;
}

export const loadAllData = async (): Promise<SheetData | null> => {
  if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL.includes("YOUR_GAS_WEB_APP_URL")) {
      console.warn("GAS URL not set. Using local mode.");
      return null;
  }

  try {
    const response = await fetch(GAS_WEB_APP_URL);
    const rawData = await response.json();
    
    // Translate incoming Korean data back to English structure for the App
    return {
        members: translateToEnglish('members', rawData.members || []),
        matches: translateToEnglish('matches', rawData.matches || []),
        financialRecords: translateToEnglish('financialRecords', rawData.financialRecords || []),
        expenses: translateToEnglish('expenses', rawData.expenses || []),
        donations: translateToEnglish('donations', rawData.donations || []),
        notices: translateToEnglish('notices', rawData.notices || []),
        attendance: translateToEnglish('attendance', rawData.attendance || []),
        settings: translateToEnglish('settings', rawData.settings ? [rawData.settings] : [])[0] || null
    };

  } catch (error) {
    console.error("Failed to fetch data from sheet:", error);
    return null;
  }
};

export const saveData = async (table: string, data: any[]) => {
  if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL.includes("YOUR_GAS_WEB_APP_URL")) return;

  // 1. Translate Data Keys to Korean
  const koreanData = translateToKorean(table, data);

  // 2. Translate Table Name to Korean
  const koreanTableName = TABLE_MAP[table] || table;
  
  try {
    await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        table: koreanTableName, // Send Korean Table Name
        data: koreanData        // Send Korean Data
      })
    });
  } catch (error) {
    console.error(`Failed to save ${table}:`, error);
  }
};
