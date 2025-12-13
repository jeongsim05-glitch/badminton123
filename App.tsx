import React, { useState, useEffect, useRef } from 'react';
import LandingPage from './components/LandingPage';
import Layout from './components/Layout';
import Members from './components/Members';
import Matches from './components/Matches';
import Financials from './components/Financials';
import Analysis from './components/Analysis';
import Documents from './components/Documents';
import Lessons from './components/Lessons';
import Bylaws from './components/Bylaws';
import AdminSettings from './components/AdminSettings';
import Coaching from './components/Coaching';
import Attendance from './components/Attendance';
import { Member, Match, Rank, Expense, Notice, FinancialRecord, Donation, GameType, GlobalSettings, AttendanceRecord } from './types';
import { loadAllData, saveData } from './services/sheetService';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState('members');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error'>('synced');
  
  // -- Global Settings --
  const [settings, setSettings] = useState<GlobalSettings>({
    monthlyFee: 30000,
    associateFee: 15000,
    initialCarryover: 5659886,
    enableAICoaching: false,
    enableAttendance: false
  });

  // -- Data States --
  const [members, setMembers] = useState<Member[]>([]);
  const [financialRecords, setFinancialRecords] = useState<Record<string, FinancialRecord>>({});
  const [matches, setMatches] = useState<Match[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Refs for debouncing saves
  const timeoutRef = useRef<{[key: string]: ReturnType<typeof setTimeout>}>({});

  // --- Generate Demo Data Helper ---
  const generateDemoData = async () => {
    console.log("Generating Demo Data and uploading to Sheet...");
    // Digitized data from the provided images (103 Regular + 6 Associate)
    const rawData = [
      // --- Regular Members (정회원) ---
      { id: '1', name: '강경화', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '2', name: '강민지', type: '정회원', joinDate: '2025-09-30', status: {10:'신규'} },
      { id: '3', name: '고은숙', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '4', name: '고주이', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '5', name: '김경아', type: '정회원', joinDate: '2025-06-06', status: {6:'신규', 7:'면제', 8:'면제'} },
      { id: '6', name: '김경윤', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O'} },
      { id: '7', name: '김동수', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O',11:'O',12:'O'} },
      { id: '8', name: '김동주', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '9', name: '김동준', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '10', name: '김동환', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'병가',8:'병가',9:'병가',10:'병가'} },
      { id: '11', name: '김미선', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '12', name: '김민정', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '13', name: '김보성', type: '정회원', joinDate: '2025-03-25', status: {4:'신규', 5:'면제', 6:'면제'} },
      { id: '14', name: '김성남', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '15', name: '김성빈', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O'} },
      { id: '16', name: '김순희', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '17', name: '김승태', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '18', name: '김완순', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '19', name: '김용숙', type: '정회원', joinDate: '2025-06-11', status: {6:'신규', 7:'면제', 8:'면제', 9:'O'} },
      { id: '20', name: '김인택', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '21', name: '김중진', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O'} },
      { id: '22', name: '김지연', type: '정회원', joinDate: '2025-09-18', status: {9:'신규'} },
      { id: '23', name: '김창석', type: '정회원', joinDate: '2025-08-27', status: {9:'신규'} },
      { id: '24', name: '김창원', type: '정회원', joinDate: '2025-09-03', status: {9:'신규', 10:'O'} },
      { id: '25', name: '김철규', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O'} },
      { id: '26', name: '김현민', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '27', name: '김현종', type: '정회원', joinDate: '2025-06-01', status: {6:'신규', 7:'면제', 8:'면제', 9:'O'} },
      { id: '28', name: '김형태', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O'} },
      { id: '29', name: '김혜빈', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '30', name: '나용상', type: '정회원', joinDate: '2020-01-01', status: {1:'면제', 2:'면제', 3:'O', 4:'O', 5:'O', 6:'O', 7:'O', 8:'O', 9:'O', 10:'O'} },
      { id: '31', name: '남재현', type: '정회원', joinDate: '2025-07-09', status: {7:'신규'} },
      { id: '32', name: '남주현', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '33', name: '노권철', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O',11:'O'} },
      { id: '34', name: '류택수', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '35', name: '명재홍', type: '정회원', joinDate: '2025-08-27', status: {9:'신규'} },
      { id: '36', name: '박동수', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '37', name: '박미화', type: '정회원', joinDate: '2025-06-23', status: {7:'신규', 8:'면제', 9:'면제', 10:'O', 11:'O', 12:'O'} },
      { id: '38', name: '박성오', type: '정회원', joinDate: '2025-10-13', status: {10:'신규'} },
      { id: '39', name: '박은진', type: '정회원', joinDate: '2025-03-03', status: {3:'신규', 4:'면제', 5:'면제', 6:'O', 7:'O', 8:'O', 9:'O', 10:'O'} },
      { id: '40', name: '박재훈', type: '정회원', joinDate: '2025-03-12', status: {3:'신규', 4:'면제', 5:'면제', 6:'O', 7:'O', 8:'O', 9:'O'} },
      { id: '41', name: '박종석', type: '정회원', joinDate: '2025-10-15', status: {10:'신규'} },
      { id: '42', name: '박주노', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '43', name: '배성준', type: '정회원', joinDate: '2025-09-02', status: {9:'신규', 10:'O'} },
      { id: '44', name: '배수미', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '45', name: '백효정', type: '정회원', joinDate: '2025-07-01', status: {7:'신규', 8:'면제', 9:'면제'} },
      { id: '46', name: '백승우', type: '정회원', joinDate: '2020-01-01', status: {} },
      { id: '47', name: '성채원', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '48', name: '송용필', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '49', name: '송중석', type: '정회원', joinDate: '2025-03-25', status: {4:'신규', 5:'면제', 6:'면제', 7:'O', 8:'O', 9:'O', 10:'O', 11:'O', 12:'O'} },
      { id: '50', name: '신동온', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '51', name: '신미영', type: '정회원', joinDate: '2025-03-03', status: {3:'신규', 4:'면제', 5:'면제', 6:'O', 7:'O', 8:'O'} },
      { id: '52', name: '신영숙', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '53', name: '신철원', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '54', name: '안병찬', type: '정회원', joinDate: '2025-09-08', status: {9:'신규', 10:'O'} },
      { id: '55', name: '안숙자', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '56', name: '양은철', type: '정회원', joinDate: '2025-06-24', status: {7:'신규', 8:'면제', 9:'면제'} },
      { id: '57', name: '오진동', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O'} },
      { id: '58', name: '우명자', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '59', name: '우정식', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O'} },
      { id: '60', name: '유 환', type: '정회원', joinDate: '2025-08-20', status: {8:'신규', 9:'O'} },
      { id: '61', name: '유재하', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O'} },
      { id: '62', name: '윤다정', type: '정회원', joinDate: '2025-08-01', status: {8:'신규', 9:'O'} },
      { id: '63', name: '이경희', type: '정회원', joinDate: '2025-09-18', status: {9:'신규', 10:'O'} },
      { id: '64', name: '이명열', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O'} },
      { id: '65', name: '이민규', type: '정회원', joinDate: '2025-05-12', status: {5:'신규', 6:'면제', 7:'면제', 8:'O', 9:'O', 10:'O'} },
      { id: '66', name: '이상근', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O'} },
      { id: '67', name: '이상림', type: '정회원', joinDate: '2025-03-01', status: {3:'신규', 4:'면제', 5:'면제', 6:'O', 7:'병가', 8:'O', 9:'O', 10:'O', 11:'O', 12:'O'} },
      { id: '68', name: '이상훈', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '69', name: '이석현', type: '정회원', joinDate: '2025-08-18', status: {8:'신규', 9:'O'} },
      { id: '70', name: '이수복', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O'} },
      { id: '71', name: '이영집', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O'} },
      { id: '72', name: '이은비', type: '정회원', joinDate: '2025-09-01', status: {9:'O'}, notes: '9월 복귀' },
      { id: '73', name: '이정식', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O'} },
      { id: '74', name: '이준희', type: '정회원', joinDate: '2025-06-04', status: {6:'신규', 7:'면제', 8:'면제'} },
      { id: '75', name: '이진환', type: '정회원', joinDate: '2025-08-05', status: {8:'신규', 9:'O'} },
      { id: '76', name: '이찬무', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '77', name: '이한슬', type: '정회원', joinDate: '2025-03-25', status: {4:'신규', 5:'면제', 6:'면제', 7:'O', 8:'O', 9:'O', 10:'O'} },
      { id: '78', name: '이현숙', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '79', name: '임경식', type: '정회원', joinDate: '2025-03-03', status: {3:'신규', 4:'면제', 5:'면제', 6:'O', 7:'O', 8:'O'} },
      { id: '80', name: '임용빈', type: '정회원', joinDate: '2025-06-17', status: {6:'신규', 7:'면제', 8:'면제'} },
      { id: '81', name: '임주연', type: '정회원', joinDate: '2025-05-26', status: {6:'신규', 7:'면제', 8:'면제'} },
      { id: '82', name: '임지우', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '83', name: '임형배', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '84', name: '장경진', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O'} },
      { id: '85', name: '장이슬', type: '정회원', joinDate: '2025-06-04', status: {6:'신규', 7:'면제', 8:'면제', 9:'병가', 10:'병가'} },
      { id: '86', name: '장한나', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '87', name: '전미영', type: '정회원', joinDate: '2025-09-03', status: {9:'신규'} },
      { id: '88', name: '전민영', type: '정회원', joinDate: '2025-08-20', status: {8:'신규', 9:'O'} },
      { id: '89', name: '정기환', type: '정회원', joinDate: '2025-06-09', status: {6:'신규', 7:'면제', 8:'면제', 9:'O', 10:'O'} },
      { id: '90', name: '조미현', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: '91', name: '조용흠', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O'} },
      { id: '92', name: '조익수', type: '정회원', joinDate: '2020-01-01', status: {1:'면제', 2:'면제', 3:'O', 4:'O', 5:'O', 6:'O', 7:'O', 8:'O', 9:'O', 10:'O'} },
      { id: '93', name: '진미화', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O'} },
      { id: '94', name: '차금선', type: '정회원', joinDate: '2025-05-01', status: {5:'신규', 6:'면제', 7:'면제'} },
      { id: '95', name: '채동호', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O'} },
      { id: '96', name: '최 돌', type: '정회원', joinDate: '2025-07-07', status: {7:'신규'} },
      { id: '97', name: '최윤규', type: '정회원', joinDate: '2020-01-01', status: {2:'신규', 3:'면제', 4:'면제', 5:'O', 6:'O', 7:'O', 8:'O', 9:'O', 10:'O', 11:'O', 12:'O'} },
      { id: '98', name: '최인호', type: '정회원', joinDate: '2025-08-18', status: {8:'신규'} },
      { id: '99', name: '최진용', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      { id: '100', name: '최철호', type: '정회원', joinDate: '2025-05-12', status: {5:'신규', 6:'면제', 7:'면제', 8:'O', 9:'O', 10:'O', 11:'O', 12:'O'} },
      { id: '101', name: '홍성옥', type: '정회원', joinDate: '2025-02-12', status: {2:'신규', 3:'면제', 4:'면제', 5:'O', 6:'O', 7:'O', 8:'O', 9:'O', 10:'O'} },
      { id: '102', name: '황덕현', type: '정회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O'}, notes: '회비보류' },
      { id: '103', name: '황신순', type: '정회원', joinDate: '2020-01-01', status: '연납' },
      
      // --- Associate Members (준회원) ---
      { id: 'A1', name: '강태구', type: '준회원', joinDate: '2020-01-01', status: {1:'O',2:'O',3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O'} },
      { id: 'A2', name: '김영호', type: '준회원', joinDate: '2025-03-01', status: {3:'O',4:'O',5:'O',6:'O',7:'O',8:'O',9:'O',10:'O'} },
      { id: 'A3', name: '김용선', type: '준회원', joinDate: '2020-01-01', status: '연납' },
      { id: 'A4', name: '장성일', type: '준회원', joinDate: '2025-07-01', status: {7:'O', 8:'O', 9:'O', 10:'O'} },
      { id: 'A5', name: '전우성', type: '준회원', joinDate: '2020-01-01', status: {1:'O'} },
      { id: 'A6', name: '조민규', type: '준회원', joinDate: '2020-01-01', status: {1:'O', 2:'O', 7:'O', 8:'O'}, notes: '대학생' },
    ];

    const initMembers: Member[] = [];
    const initRecords: Record<string, FinancialRecord> = {};
    const weekDays = ['월', '화', '수', '목', '금'];

    const executiveMap: Record<string, string> = {
        '장경진': '임원',
        '채동호': '임원',
        '김동주': '임원',
        '김성남': '임원',
        '김현민': '임원',
        '김중진': '임원',
        '박미화': '임원',
        '배수미': '임원',
        '김순희': '임원',
        '우명자': '임원',
        '김현종': '임원'
    };

    rawData.forEach((data, index) => {
       const hasLessons = Math.random() > 0.7;
       const lessonDays = hasLessons ? [weekDays[Math.floor(Math.random() * 5)]] : [];
       
       let position = data.type === '준회원' ? '준회원' : '회원';
       let password = undefined;
       
       if (executiveMap[data.name]) {
           position = executiveMap[data.name];
           password = '1234';
       }

       const birthYear = 1970 + Math.floor(Math.random() * 30);
       const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
       const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
       const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;

       const member: Member = {
          id: data.id,
          name: data.name,
          rank: Rank.B,
          position: position,
          password: password,
          memberType: data.type as '정회원' | '준회원',
          birthDate: birthDate,
          joinDate: data.joinDate,
          tenure: '1년',
          phone: `010-0000-${String(index).padStart(4,'0')}`,
          email: '',
          address: '',
          job: '',
          notes: (data as any).notes || '',
          isSickLeave: false,
          isFamilyMember: false,
          isCoupleMember: false,
          gender: Math.random() > 0.3 ? 'M' : 'F', 
          lessonDays: lessonDays
       };
       initMembers.push(member);

       const fee = data.type === '준회원' ? 15000 : 30000;
       const payments: { [month: number]: number } = {};
       const exemptMonths: number[] = [];

       if (data.status === '연납') {
          for(let m=1; m<=12; m++) payments[m] = fee;
       } else if (typeof data.status === 'object') {
          Object.entries(data.status).forEach(([monthStr, status]) => {
             const m = parseInt(monthStr);
             if (status === 'O') payments[m] = fee;
             else if (status === '면제' || status === '병가' || status === '신규') exemptMonths.push(m);
             if (status === '병가') member.isSickLeave = true; 
          });
       }

       initRecords[member.id] = {
          memberId: member.id,
          year: 2025,
          payments,
          exemptMonths
       };
    });

    setMembers(initMembers);
    setFinancialRecords(initRecords);
    
    // Save generated data to sheet immediately
    await saveData('members', initMembers);
    await saveData('financialRecords', Object.values(initRecords));
  };


  // --- 1. Load Data on Mount (From Sheet) ---
  useEffect(() => {
    const initData = async () => {
        setIsLoading(true);
        const data = await loadAllData();
        
        if (data && data.members && data.members.length > 0) {
            setMembers(data.members || []);
            setMatches(data.matches || []);
            setExpenses(data.expenses || []);
            setDonations(data.donations || []);
            setNotices(data.notices || []);
            setAttendanceRecords(data.attendance || []);
            if (data.settings) setSettings(prev => ({...prev, ...data.settings}));

            // Transform financial array back to Record object
            const recordsObj: Record<string, FinancialRecord> = {};
            if (Array.isArray(data.financialRecords)) {
                data.financialRecords.forEach((rec: any) => {
                    recordsObj[rec.memberId] = rec;
                });
            }
            setFinancialRecords(recordsObj);
        } else {
            // If data is empty (first run with new sheet), generate and upload demo data
            await generateDemoData();
        }
        setIsLoaded(true);
        setIsLoading(false);
    };

    initData();
  }, []);

  // --- 2. Save Data on Change (Debounced) ---
  const debouncedSave = (table: string, data: any) => {
      setSyncStatus('saving');
      if (timeoutRef.current[table]) clearTimeout(timeoutRef.current[table]);
      
      timeoutRef.current[table] = setTimeout(async () => {
          await saveData(table, data);
          setSyncStatus('synced');
      }, 2000); // Wait 2 seconds of inactivity before saving
  };

  useEffect(() => {
      if (!isLoaded) return;
      debouncedSave('members', members);
  }, [members, isLoaded]);

  useEffect(() => {
      if (!isLoaded) return;
      // Convert Record back to Array for storage
      const recordsArray = Object.values(financialRecords);
      debouncedSave('financialRecords', recordsArray);
  }, [financialRecords, isLoaded]);

  useEffect(() => {
      if (!isLoaded) return;
      debouncedSave('matches', matches);
  }, [matches, isLoaded]);

  useEffect(() => {
      if (!isLoaded) return;
      debouncedSave('expenses', expenses);
  }, [expenses, isLoaded]);

  useEffect(() => {
      if (!isLoaded) return;
      debouncedSave('donations', donations);
  }, [donations, isLoaded]);

  useEffect(() => {
      if (!isLoaded) return;
      debouncedSave('notices', notices);
  }, [notices, isLoaded]);

  useEffect(() => {
      if (!isLoaded) return;
      debouncedSave('settings', [settings]); // Settings as single row array
  }, [settings, isLoaded]);

  useEffect(() => {
      if (!isLoaded) return;
      debouncedSave('attendance', attendanceRecords);
  }, [attendanceRecords, isLoaded]);


  const renderContent = () => {
    switch (activeTab) {
      case 'members':
        return <Members members={members} setMembers={setMembers} currentUser={currentUser} />;
      case 'matches':
        return <Matches members={members} matches={matches} setMatches={setMatches} />;
      case 'financials':
        return <Financials 
            members={members} 
            expenses={expenses} 
            setExpenses={setExpenses} 
            records={financialRecords} 
            setRecords={setFinancialRecords} 
            donations={donations} 
            setDonations={setDonations}
            monthlyFee={settings.monthlyFee}
            setMonthlyFee={(val) => setSettings({...settings, monthlyFee: val as number})}
            associateFee={settings.associateFee}
            setAssociateFee={(val) => setSettings({...settings, associateFee: val as number})}
            initialCarryover={settings.initialCarryover}
            setInitialCarryover={(val) => setSettings({...settings, initialCarryover: val as number})}
        />;
      case 'lessons':
        return <Lessons members={members} currentUser={currentUser} />;
      case 'documents':
        return <Documents 
            members={members} 
            expenses={expenses} 
            notices={notices} 
            setNotices={setNotices} 
            records={financialRecords} 
            donations={donations}
            initialCarryover={settings.initialCarryover}
            monthlyFee={settings.monthlyFee}
            associateFee={settings.associateFee}
            currentUser={currentUser}
        />;
      case 'bylaws':
        return <Bylaws currentUser={currentUser} />;
      case 'analysis':
        return <Analysis members={members} matches={matches} />;
      case 'coaching':
        return <Coaching />;
      case 'attendance':
        return <Attendance members={members} attendanceRecords={attendanceRecords} setAttendanceRecords={setAttendanceRecords} />;
      case 'admin':
        return <AdminSettings settings={settings} setSettings={setSettings} />;
      default:
        return <Members members={members} setMembers={setMembers} currentUser={currentUser} />;
    }
  };

  // If not logged in, show Landing Page
  if (!currentUser) {
      if (isLoading) return <div className="h-screen flex items-center justify-center flex-col gap-4 bg-slate-900 text-white"><Loader2 className="w-10 h-10 animate-spin text-orange-500"/><p>서버와 데이터를 동기화 중입니다...</p><p className="text-xs text-slate-500">최초 실행 시 데이터 생성에 시간이 걸릴 수 있습니다.</p></div>;
      return <LandingPage members={members} onLogin={setCurrentUser} />;
  }

  return (
    <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        settings={settings} 
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        syncStatus={syncStatus}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;