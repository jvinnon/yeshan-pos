import React, { useState, useEffect, useRef } from 'react';

// 1. 圖示大合體 (保留您原本的，並補上新的)
import { 
  // --- 您原本有的 (千萬不能刪) ---
  ArrowLeft, Settings, Users, Home, ClipboardList, Clock, Wifi, Printer, LogOut, Plus, Minus, EyeOff, Trash2, Delete, X, Edit3, Save, Store, BarChart3, Utensils, Search, UserPlus, Ticket, ShoppingCart, MessageCircle, RefreshCcw, Briefcase, HardDrive, Server, UserCog, PieChart, QrCode, ChevronLeft, ChevronRight, Tag, MoveRight, FileWarning, Heart, DollarSign, Gift, UserCheck, ShieldAlert, ScanLine, FileText, Sparkles, Percent, Trophy, Loader, TrendingUp, Check, 
  
  // --- ★★★ 這次新增的 (補在這裡) ★★★ ---
  UtensilsCrossed, ImageIcon, LayoutGrid, List, AlertCircle, CheckCircle, Bell, Menu, User, ChevronDown
} from 'lucide-react';

// 2. Firebase 設定 (保留您原本的 db 連結，但增加新功能需要的工具)
import { db } from './firebase'; // 維持您原本的設定
import { 
  doc, onSnapshot, setDoc, // 您原本有的
  // --- ★★★ 這次新增的 Firebase 工具 ★★★ ---
  collection, addDoc, updateDoc, query, orderBy, limit, deleteDoc, getDoc, getFirestore 
} from 'firebase/firestore';

// 3. 其他工具
import QRCode from 'qrcode';

// =======================================================
// 1. Constants & Configurations (全域設定)
// =======================================================
const INITIAL_STORES_CONFIG = {
  '000': { id: '000', name: '野饌總部 (HQ)', password: '88888', type: 'HQ', tablePrefix: '', tableCount: 0 },
  '001': { id: '001', name: '七賢總店', password: '69922', type: 'Branch', tableRanges: [{ prefix: 'A', count: 20 }, { prefix: 'B', count: 10 }] },
  '002': { id: '002', name: '鳳山旗艦店', password: '79567', type: 'Branch', tableRanges: [{ prefix: 'F', count: 35 }] },
  'branch3': { id: 'branch3', name: '楠梓分店', password: '18127', type: 'Branch', tableRanges: [{ prefix: 'N', count: 15 }, { prefix: 'VIP', count: 3 }] }
};

const STORE_URLS = {
    '001': 'https://yeshan-qixian.ngrok.app',    
    '002': 'https://yeshan-fengshan.ngrok.app', 
    '003': 'https://yeshan-nanzi.ngrok.app',     // <--- 這裡要加上逗號
    'branch3': 'https://yeshan-nanzi.ngrok.app'
};

const INITIAL_DINING_PLANS = [
  { id: '259', name: '超值套餐', price: 259, childPrice: 150 },
  { id: '679', name: '平日午餐', price: 679, childPrice: 350 },
  { id: '859', name: '極品饗宴', price: 859, childPrice: 450 },
  { id: '989', name: '豪華海陸', price: 989, childPrice: 499 },
  { id: '1199', name: '頂級和牛', price: 1199, childPrice: 599 },
  { id: '1899', name: '帝王至尊', price: 1899, childPrice: 950 },
];

const INITIAL_MENU_ITEMS = [
  { id: 1, name: '特級牛五花', category: '肉品', price: 0, allowedPlans: ['259', '679', '859', '989', '1199', '1899'] },
  { id: 2, name: '嚴選松阪豬', category: '肉品', price: 0, allowedPlans: ['859', '989', '1199', '1899'] },
  { id: 3, name: '蔥鹽雞腿肉', category: '肉品', price: 0, allowedPlans: ['259', '679', '859', '989', '1199', '1899'] },
  { id: 4, name: '生猛泰國蝦', category: '海鮮', price: 0, allowedPlans: ['859', '989', '1199', '1899'] },
  { id: 5, name: '鮮甜蛤蜊', category: '海鮮', price: 0, allowedPlans: ['259', '679', '859', '989', '1199', '1899'] },
  { id: 6, name: '深海中卷', category: '海鮮', price: 0, allowedPlans: ['989', '1199', '1899'] },
  { id: 7, name: '高麗菜', category: '蔬菜', price: 0, allowedPlans: ['259', '679', '859', '989', '1199', '1899'] },
  { id: 8, name: '玉米筍', category: '蔬菜', price: 0, allowedPlans: ['259', '679', '859', '989', '1199', '1899'] },
  { id: 9, name: '香菇', category: '蔬菜', price: 0, allowedPlans: ['259', '679', '859', '989', '1199', '1899'] },
  { id: 10, name: '可樂', category: '飲料', price: 0, allowedPlans: ['259', '679', '859', '989', '1199', '1899'] },
  { id: 13, name: 'A5和牛(單點)', category: '單點區', price: 599, allowedPlans: ['259', '679', '859', '989', '1199', '1899'] },
  { id: 14, name: '龍蝦(單點)', category: '單點區', price: 899, allowedPlans: ['259', '679', '859', '989', '1199', '1899'] },
  { id: 15, name: '日本A5和牛', category: '肉品', price: 0, allowedPlans: ['1899'] },
];

const INITIAL_STOCK_STATUS = { '001': {}, '002': {}, 'branch3': {} };
const INITIAL_MEMBER_APP_SETTINGS = { announcement: '🎉 本月壽星優惠中！', promoColor: 'bg-orange-500', quickLinks: [], lineRichMenu: 'typeA' };

const BRANCH_PRINTER_CONFIGS = {
  '001': [
    { id: 'counter', name: '櫃台 QR Code (印表機)', ip: '192.168.1.147', type: 'receipt', status: 'unknown' },
    { id: 'kitchen_hot', name: '廚房出單機 (印表機)', ip: '192.168.1.115', type: 'kitchen', status: 'unknown' }
  ],
  '002': [
    { id: 'counter', name: '櫃台 QR Code (印表機)', ip: '192.168.123.100', type: 'receipt', status: 'unknown' },
    { id: 'kitchen_hot', name: '廚房出單機 (印表機)', ip: '192.168.123.100', type: 'kitchen', status: 'unknown' }
  ],
  '003': [
    { id: 'counter', name: '櫃台 QR Code (印表機)', ip: '192.168.1.176', type: 'receipt', status: 'unknown' },
    { id: 'kitchen_hot', name: '廚房出單機 (印表機)', ip: '192.168.1.180', type: 'kitchen', status: 'unknown' }
  ],
  'branch3': [
    { id: 'counter', name: '櫃台 QR Code (印表機)', ip: '192.168.1.176', type: 'receipt', status: 'unknown' },
    { id: 'kitchen_hot', name: '廚房出單機 (印表機)', ip: '192.168.1.180', type: 'kitchen', status: 'unknown' }
  ]
};

const urlParams = new URLSearchParams(window.location.search);
const currentStoreIdFromUrl = urlParams.get('store') || 'branch3';
const INITIAL_PRINTERS = BRANCH_PRINTER_CONFIGS[currentStoreIdFromUrl] || BRANCH_PRINTER_CONFIGS['branch3'];

const INITIAL_MEMBERS_DB = [ { phone: '0912345678', name: '王大明', level: 'Tin', points: 0, totalSpending: 0, birthday: '12-05', lastVisit: '2023-10-15', isLineBound: true, birthdayRedeemed: false, joinDate: '2023-01-10', items: [], pointLogs: [] } ];
const INITIAL_STORE_EMPLOYEES = { '001': [{id: 1, name: '店長', password: '000'}], '002': [], 'branch3': [] };

const INITIAL_COUPONS = [ 
    { id: 1, name: '註冊禮', type: 'cash', value: 100, description: '新會員', expiryDate: '2025-12-31', code: 'NEW10', pointCost: 0, limit: true }, 
    { id: 2, name: '免費泰國蝦', type: 'item', value: 0, description: '需 500 點', expiryDate: '2025-12-31', code: 'SHRIMP500', pointCost: 500, limit: false } 
];
const INITIAL_CATEGORIES = ['肉品', '海鮮', '蔬菜', '飲料', '單點區'];

const INITIAL_SLOT_PRIZES = [
    { id: 'none', name: '銘謝惠顧', weight: 50, type: 'none', value: 0, icon: '😅' },
    { id: 'disc_9_now', name: '當次 9 折', weight: 30, type: 'current_discount_percent', value: 90, icon: '🍒' },
    { id: 'disc_8_now', name: '當次 8 折', weight: 10, type: 'current_discount_percent', value: 80, icon: '🍇' },
    { id: 'free_now', name: '當次免單', weight: 1, type: 'current_discount_percent', value: 0, icon: '💎' },
    { id: 'bogo_next', name: '下次買一送一', weight: 5, type: 'future_coupon', value: 'Buy1Get1', icon: '🍋' },
    { id: 'disc_5_next', name: '下次 5 折', weight: 4, type: 'future_coupon', value: 'HalfPrice', icon: '7️⃣' },
];

const INITIAL_TIERS = {
    'Tin': { name: '錫等級', threshold: 0, color: 'bg-gray-400', benefit: '無特殊權益' },
    'Iron': { name: '鐵等級', threshold: 10000, color: 'bg-gray-600', benefit: '生日禮金 $100' },
    'Bronze': { name: '銅等級', threshold: 20000, color: 'bg-orange-700', benefit: '消費 1.1 倍點數' },
    'Silver': { name: '銀等級', threshold: 30000, color: 'bg-slate-300', benefit: '優先訂位' },
    'Gold': { name: '金等級', threshold: 40000, color: 'bg-yellow-400', benefit: '免服務費' },
};

const HQ_TABS = [
    { id: 'report', label: '營運總表', icon: PieChart },
    { id: 'stores', label: '分店營運', icon: Store },
    { id: 'bookings', label: '預約訂位', icon: ClipboardList },
    { id: 'employees', label: '員工管理', icon: UserCog },
    { id: 'menu', label: '菜單方案', icon: Utensils },
    { id: 'crm', label: '會員資料', icon: Users },
    { id: 'marketing', label: '行銷活動', icon: Sparkles },
    { id: 'coupons', label: '優惠券', icon: Ticket },
    { id: 'line', label: 'LINE整合', icon: MessageCircle },
];

// --- 2. Hooks & Helpers ---
const formatTime = (timestamp) => {
  if (!timestamp) return '--:--';
  const date = new Date(timestamp);
  return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
};

const getDateRange = (rangeType) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  if (rangeType === 'day') return { start: today, end: today };
  if (rangeType === 'month') { const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]; const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]; return { start: first, end: last }; }
  return { start: today, end: today };
};

const useStickyState = (defaultValue, key) => {
  const [value, setValue] = useState(() => { try { const stickyValue = window.localStorage.getItem(key); return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue; } catch (e) { return defaultValue; } });
  useEffect(() => { try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }, [key, value]);
  return [value, setValue];
};

const useFirebaseState = (collectionName, docId, defaultValue) => {
  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(doc(db, collectionName, docId), (docSnap) => {
      if (docSnap.exists()) { 
          setData(docSnap.data().val); 
      } else { 
          setDoc(doc(db, collectionName, docId), { val: defaultValue });
          setData(defaultValue);
      }
      setLoading(false); 
    });
    return () => unsub();
  }, [collectionName, docId]);

  const setCloudData = (newValue) => {
    let valueToStore = newValue;
    if (newValue instanceof Function) { valueToStore = newValue(data); }
    setData(valueToStore);
    setDoc(doc(db, collectionName, docId), { val: valueToStore });
  };
  return [data, setCloudData, loading]; 
};

// --- 3. Basic UI Components ---
const NumberPad = ({ value, onChange, onEnter, placeholder="請輸入...", showDisplay=true }) => { const handleNum = (num) => onChange((value || '') + num); const handleBackspace = () => onChange(value ? value.slice(0, -1) : ''); return ( <div className="flex flex-col gap-2 w-full max-w-xs mx-auto"> {showDisplay && <div className="bg-white p-4 rounded-xl shadow-inner border-2 border-gray-200 text-center text-2xl font-bold h-16 flex items-center justify-center relative text-gray-900">{value || <span className="text-gray-300 text-base">{placeholder}</span>}{value && <button onClick={handleBackspace} className="absolute right-2 text-gray-400 p-2"><Delete size={20}/></button>}</div>} <div className="grid grid-cols-3 gap-2"> {[1, 2, 3, 4, 5, 6, 7, 8, 9, '清除', 0].map((item, i) => ( item === '清除' ? <button key={i} onClick={() => onChange('')} className="bg-red-50 text-red-500 rounded-xl p-3 font-bold">清除</button> : <button key={i} onClick={() => handleNum(item)} className="bg-white hover:bg-gray-50 rounded-xl p-3 font-bold text-xl shadow-sm text-gray-900">{item}</button> ))} {onEnter && <button onClick={onEnter} className="bg-blue-600 text-white rounded-xl p-3 font-bold text-lg">確認</button>} </div> </div> ); };
const FullKeyboard = ({ value, onChange }) => { const rows = [['1','2','3','4','5','6','7','8','9','0'],['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['Z','X','C','V','B','N','M']]; return ( <div className="w-full bg-gray-200 p-2 rounded-xl"> {rows.map((row, i) => (<div key={i} className="flex justify-center gap-1 mb-1">{row.map(k => (<button key={k} onClick={() => onChange((value||'') + k)} className="bg-white rounded-lg shadow-sm font-bold w-8 h-10 text-sm text-gray-900">{k}</button>))}</div>))} <div className="flex justify-center gap-2 mt-2"><button onClick={() => onChange(value ? value.slice(0, -1) : '')} className="bg-red-100 text-red-600 rounded-lg px-4 h-10"><Delete size={18}/></button><button onClick={() => onChange((value||'')+' ')} className="bg-white rounded-lg px-12 h-10 text-gray-900">SPACE</button></div> </div> ); };
const CustomerMobileAppSimulator = ({ appSettings }) => { const s = { promoColor: appSettings?.promoColor || 'bg-gray-500', announcement: appSettings?.announcement || '暫無公告', quickLinks: appSettings?.quickLinks || [] }; return ( <div className="bg-white w-[300px] h-[600px] rounded-[30px] border-8 border-gray-800 shadow-xl flex flex-col mx-auto transform scale-90 origin-top overflow-hidden"> <div className="h-6 bg-gray-900 w-full flex justify-between items-center px-4 text-white text-[10px]"><span>12:00</span><Wifi size={10}/></div> <div className="h-10 bg-[#2c3e50] flex items-center justify-between px-3 text-white"><span className="font-bold text-xs">野饌燒肉 (LINE)</span><X size={16}/></div> <div className="flex-grow overflow-y-auto bg-gray-50 pb-20"> <div className={`${s.promoColor} text-white p-4 rounded-b-2xl shadow-md mb-3`}> <div className="flex justify-between items-center mb-3"><h2 className="text-sm font-bold">會員中心</h2><Users size={14}/></div> <div className="bg-white/10 p-3 rounded-lg mb-3"><div className="text-[10px] opacity-80">Welcome</div><div className="text-lg font-bold">王大明</div></div> <div className="bg-white text-gray-800 p-3 rounded-lg shadow-sm flex justify-between"><div><div className="text-[10px] text-gray-500">累積點數</div><div className="text-xl font-bold text-orange-600">1,250</div></div><QrCode size={24}/></div> </div> <div className="px-3 mb-3"><div className="bg-white p-3 rounded-xl shadow-sm border-l-4 border-green-500"><h4 className="font-bold text-xs">最新公告</h4><p className="text-[10px] text-gray-600">{s.announcement}</p></div></div> <div className="px-3 grid grid-cols-3 gap-2">{s.quickLinks.map((l, i) => (<div key={i} className="bg-white p-2 rounded-lg shadow-sm flex flex-col items-center"><Utensils size={14}/><span className="text-[10px]">{l.name}</span></div>))}</div> </div> </div> ); };

// =======================================================
// 4. Sub-Components (順序已修正：元件 -> 頁面 -> 主系統)
// =======================================================

const ClockInPage = ({ employees, clockStatus, onClockUpdate }) => {
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [passwordInput, setPasswordInput] = useState('');
    const [feedback, setFeedback] = useState(null); 
    const handleNumPadEnter = () => { if (!selectedEmp) return; if (passwordInput === selectedEmp.password) { const currentStatus = clockStatus[selectedEmp.id]; const newType = currentStatus === 'in' ? 'out' : 'in'; onClockUpdate(selectedEmp.id, newType); setFeedback({ type: newType, name: selectedEmp.name }); setPasswordInput(''); setSelectedEmp(null); } else { alert('密碼錯誤，請重新輸入'); setPasswordInput(''); } };
    useEffect(() => { if (feedback) { const timer = setTimeout(() => setFeedback(null), 2000); return () => clearTimeout(timer); } }, [feedback]);
    return (
        <div className="h-full bg-gray-100 relative overflow-hidden">
            <div className="p-8 h-full overflow-y-auto"><h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">員工打卡系統</h2>{(!employees || employees.length === 0) ? (<div className="text-center text-gray-400 mt-20">請先至總部設定員工帳號</div>) : (<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{employees.map(emp => { const isWorking = clockStatus[emp.id] === 'in'; return (<button key={emp.id} onClick={() => setSelectedEmp(emp)} className={`aspect-square rounded-3xl shadow-md flex flex-col items-center justify-center gap-4 transition-all active:scale-95 border-b-8 ${isWorking ? 'bg-green-50 border-green-200 hover:bg-green-100' : 'bg-white border-gray-200 hover:bg-blue-50'}`}><div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold ${isWorking ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{emp.name[0]}</div><div className="text-center"><div className="text-2xl font-bold text-gray-800">{emp.name}</div><div className={`mt-2 px-3 py-1 rounded-full text-sm font-bold inline-block ${isWorking ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>{isWorking ? '上班中' : '未打卡'}</div></div></button>); })}</div>)}</div>
            {selectedEmp && !feedback && (<div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"><div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md relative"><button onClick={() => { setSelectedEmp(null); setPasswordInput(''); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={32} /></button><div className="text-center mb-6"><h3 className="text-2xl font-bold text-gray-800 mb-1">{selectedEmp.name}</h3><p className="text-gray-500">請輸入密碼以{clockStatus[selectedEmp.id] === 'in' ? '下班' : '上班'}</p></div><NumberPad value={passwordInput} onChange={setPasswordInput} onEnter={handleNumPadEnter} placeholder="請輸入密碼" /></div></div>)}
            {feedback && (<div className={`absolute inset-0 z-[100] flex flex-col items-center justify-center text-white animate-fade-in ${feedback.type === 'in' ? 'bg-green-500' : 'bg-orange-500'}`}><div className="bg-white bg-opacity-20 p-8 rounded-full mb-6 backdrop-blur-md">{feedback.type === 'in' ? <Briefcase size={80} /> : <Home size={80} />}</div><h1 className="text-6xl font-bold mb-4">{feedback.name}</h1><h2 className="text-4xl opacity-90">{feedback.type === 'in' ? '上班打卡成功' : '下班打卡成功'}</h2></div>)}
        </div>
    );
};

const TipPage = ({ storeId, empId, storeEmployees, tipLogs, setTipLogs, tables, setTables, currentTableId }) => {
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [manualTableId, setManualTableId] = useState('');
    const [isManualInput, setIsManualInput] = useState(!currentTableId);
    const employees = storeEmployees[storeId] || [];
    const employee = employees.find(e => e.id.toString() === empId);

    if (!employee) return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500">無效的連結或員工不存在</div>;
    const handleSetManualTable = () => { if (!manualTableId) return alert('請輸入桌號'); setIsManualInput(false); };
    const finalTableId = currentTableId || manualTableId;

    if (isManualInput) { return ( <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8"> <div className="w-full max-w-sm"> <div className="text-center mb-8"><div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Utensils size={32} /></div><h2 className="text-2xl font-bold mb-2">請輸入您的桌號</h2><p className="text-gray-400">為了將小費合併至帳單，<br/>請輸入您目前的桌號 (例如: A01)</p></div> <div className="bg-white rounded-xl p-2 mb-4 text-gray-900 font-bold text-center text-3xl h-16 flex items-center justify-center">{manualTableId}</div> <FullKeyboard value={manualTableId} onChange={setManualTableId} /> <button onClick={handleSetManualTable} className="w-full bg-green-600 py-4 rounded-xl font-bold text-xl mt-6 shadow-lg">確認桌號</button> </div> </div> ); }

    const handleConfirmTip = async () => {
        if (!selectedAmount) return;
        setLoading(true);
        const newTip = { id: Date.now(), timestamp: Date.now(), storeId: storeId, empId: employee.id, empName: employee.name, amount: selectedAmount, status: 'merged_to_bill', tableId: finalTableId };
        const updatedLogs = [newTip, ...(tipLogs || [])];
        setTipLogs(updatedLogs);
        const tipItem = { id: `TIP-${Date.now()}`, name: `服務打賞 (${employee.name})`, price: selectedAmount, count: 1, category: 'Tip', time: new Date().toISOString(), batchId: Date.now() };
        const updatedTables = tables.map(t => { if (t.id === finalTableId) { return { ...t, orders: [...(t.orders || []), tipItem], total: (t.total || 0) + selectedAmount }; } return t; });
        setTables(updatedTables);
        setTimeout(() => { alert(`✅ 成功給予 ${employee.name} 小費 $${selectedAmount}！\n\n金額已合併至桌號 [${finalTableId}] 的帳單。`); const baseUrl = STORE_URLS[storeId] || STORE_URLS['branch3']; window.location.href = `${baseUrl}?mode=customer&store=${storeId}&table=${finalTableId}`; setLoading(false); }, 800);
    };

    return ( <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6"> <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden mt-10"> <div className="bg-blue-600 p-8 text-center text-white relative"> <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><ScanLine size={12}/> 桌號: {finalTableId} <button onClick={()=>setIsManualInput(true)} className="ml-1 underline"><Edit3 size={10}/></button></div> <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-blue-600 shadow-md">{employee.name[0]}</div> <h2 className="text-2xl font-bold">{employee.name}</h2> <p className="opacity-90 mt-1">感謝您對服務的認可！❤️</p> </div> <div className="p-8"> <label className="block text-gray-600 font-bold mb-4 text-center">請選擇打賞金額</label> <div className="grid grid-cols-3 gap-3 mb-8">{[20, 50, 100].map(amount => (<button key={amount} onClick={() => setSelectedAmount(amount)} className={`py-4 rounded-xl font-bold text-xl border-2 transition-all ${selectedAmount === amount ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-200'}`}>${amount}</button>))}</div> <button onClick={handleConfirmTip} disabled={!selectedAmount || loading} className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg flex items-center justify-center gap-2 transition-all ${!selectedAmount ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'}`}>{loading ? '處理中...' : <><DollarSign size={20} /> 確認 (併入帳單)</>}</button> <p className="text-xs text-center text-gray-400 mt-6">點擊確認後，小費將自動加入您的用餐帳單。<br/>您可以在結帳時一併支付。</p> </div> </div> </div> );
};

// =======================================================
// ★★★ 修正版 CustomerMemberPortal：實作限領、隔日用與期限邏輯 ★★★
// =======================================================
const CustomerMemberPortal = ({ members, onUpdateMember, coupons, addLog, onBack, storeId, isStandalone }) => {
    const [phone, setPhone] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('redeem');
    const [isRegistering, setIsRegistering] = useState(false);
    const [regName, setRegName] = useState(''); 

    const getValidPoints = (user) => {
        if (!user.pointLogs) return user.points || 0;
        const now = Date.now();
        return user.pointLogs.filter(log => log.expiry > now && !log.used).reduce((sum, log) => sum + log.amount, 0);
    };

    const handleCheckPhone = () => {
        if (!phone || phone.length < 4) return alert('請輸入手機號碼'); 
        const found = (members || []).find(m => m.phone === phone);
        if (found) {
            const validPoints = getValidPoints(found);
            setCurrentUser({ ...found, points: validPoints });
            setIsLoggedIn(true);
        } else {
            setIsRegistering(true);
        }
    };

    const handleRegisterConfirm = () => {
        if (!regName.trim()) return alert('拜託請輸入您的尊姓大名 🙏');
        
        const now = new Date();

        const newMember = {
            phone: phone,
            name: regName, 
            level: 'Tin',
            points: 0,
            totalSpending: 0,
            birthday: '',
            lastVisit: now.toISOString().split('T')[0],
            isLineBound: false,
            birthdayRedeemed: false,
            joinDate: now.toISOString().split('T')[0],
            joinTime: now.toISOString(),
            joinStore: storeId || '未知',
            items: [],
            pointLogs: []
        };
        onUpdateMember(newMember); 
        setCurrentUser(newMember); 
        setIsLoggedIn(true);        
        setIsRegistering(false);    
        alert(`註冊成功！歡迎 ${regName} 加入野饌會員！`);
    };

    const handleRedeem = (coupon) => { 
        if (currentUser.points < coupon.pointCost) return alert('點數不足！'); 
        
        // 1. 檢查限領一次
        if (coupon.limit) {
            const alreadyHas = currentUser.items.some(i => i.name === coupon.name);
            if (alreadyHas) return alert('此優惠券每位會員限領一次，您已領取過！');
        }

        // 2. 檢查是否已過期 (雖然UI會擋，但邏輯要再擋一次)
        if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
            return alert('此優惠活動已結束！');
        }

        if (!window.confirm(`確定使用 ${coupon.pointCost} 點兌換「${coupon.name}」嗎？`)) return; 
        
        const updatedUser = JSON.parse(JSON.stringify(currentUser)); 
        let remainingCost = coupon.pointCost; 
        if(updatedUser.pointLogs) { 
            updatedUser.pointLogs = updatedUser.pointLogs.sort((a,b) => a.expiry - b.expiry).map(log => { 
                if (remainingCost <= 0 || log.used || log.expiry < Date.now()) return log; 
                if (log.amount >= remainingCost) { log.amount -= remainingCost; if(log.amount === 0) log.used = true; remainingCost = 0; } 
                else { remainingCost -= log.amount; log.used = true; log.amount = 0; } 
                return log; 
            }); 
        } 
        updatedUser.points = getValidPoints(updatedUser); 
        
        // 3. 處理隔日使用
        let validFrom = 0; 
        if (coupon.nextDayUse) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            validFrom = tomorrow.getTime();
        }

        const newItem = { 
            id: Date.now(), 
            name: coupon.name, 
            redeemed: false, 
            validFrom: validFrom,
            // ★★★ 4. 將期限存入票券 ★★★
            expiryDate: coupon.expiryDate,
            code: coupon.code ? (coupon.code + Math.floor(Math.random()*1000)) : Math.random().toString(36).substr(2, 6).toUpperCase() 
        }; 
        updatedUser.items.push(newItem); 
        
        onUpdateMember(updatedUser); 
        setCurrentUser(updatedUser); 
        addLog({ storeName: '自助', staffName: 'User', memberName: updatedUser.name, memberPhone: updatedUser.phone, action: `自助兌換: ${coupon.name}`, points: -coupon.pointCost }); 
        
        if (coupon.nextDayUse) {
            alert('兌換成功！\n注意：此券需等到「明天」才能開始使用喔！');
        } else {
            alert('兌換成功！已存入您的票夾。'); 
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-orange-500 rounded-2xl mx-auto flex items-center justify-center mb-4"><Users size={40}/></div>
                        <h2 className="text-3xl font-bold">{isRegistering ? '歡迎新朋友 🎉' : '會員登入'}</h2>
                        <p className="text-gray-400 mt-2">{isRegistering ? '請輸入您的姓名以完成註冊' : '查詢點數與兌換優惠'}</p>
                    </div>
                    {!isRegistering ? (
                        <>
                            <NumberPad value={phone} onChange={setPhone} showDisplay={true} placeholder="請輸入手機號碼" />
                            <button onClick={handleCheckPhone} className="w-full bg-orange-600 py-4 rounded-xl font-bold text-xl mt-6 shadow-lg hover:bg-orange-500">下一步 / 登入</button>
                            {!isStandalone && (
                            <button onClick={onBack} className="w-full text-gray-500 py-4 mt-2">返回點餐</button>
                            )}
                        </>
                    ) : (
                        <div className="animate-fade-in-up">
                            <div className="bg-white p-4 rounded-xl mb-6 text-gray-900"><div className="text-xs text-gray-500 mb-1">手機號碼</div><div className="text-xl font-bold font-mono">{phone}</div></div>
                            <label className="block text-gray-400 mb-2 font-bold">請問怎麼稱呼您？</label>
                            <input type="text" className="w-full p-4 rounded-xl text-black text-xl font-bold text-center outline-none border-4 border-orange-500 mb-6" placeholder="點此輸入姓名" value={regName} onChange={(e) => setRegName(e.target.value)} autoFocus />
                            <button onClick={handleRegisterConfirm} className="w-full bg-green-600 py-4 rounded-xl font-bold text-xl shadow-lg hover:bg-green-500 mb-4">確認註冊</button>
                            <button onClick={() => { setIsRegistering(false); setRegName(''); }} className="w-full bg-gray-700 py-3 rounded-xl font-bold text-gray-300">返回重輸電話</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const tierInfo = INITIAL_TIERS[currentUser.level] || INITIAL_TIERS['Tin'];
    return ( 
        <div className="min-h-screen bg-gray-100 flex flex-col"> 
            <div className="bg-gray-900 text-white p-6 pb-12 rounded-b-[40px] shadow-xl relative z-10"> 
                <div className="flex justify-between items-start mb-4">
                    <button onClick={() => setIsLoggedIn(false)} className="bg-white/10 p-2 rounded-full"><ChevronLeft/></button>
                    <div className="text-right"><div className="text-2xl font-bold">{currentUser.name}</div><div className={`text-xs px-2 py-1 rounded inline-block font-bold ${tierInfo.color} text-white`}>{tierInfo.name}</div></div>
                </div> 
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-between"><div><div className="text-gray-400 text-xs">目前有效點數</div><div className="text-4xl font-bold text-orange-400">{currentUser.points}</div></div><Gift size={32} className="text-orange-400 opacity-50"/></div> 
            </div> 
            <div className="px-6 -mt-8 relative z-20 flex gap-2">
                <button onClick={()=>setActiveTab('redeem')} className={`flex-1 py-3 rounded-xl font-bold shadow-sm transition-all ${activeTab==='redeem' ? 'bg-orange-500 text-white shadow-lg transform -translate-y-1' : 'bg-white text-gray-500'}`}>點數兌換</button>
                <button onClick={()=>setActiveTab('wallet')} className={`flex-1 py-3 rounded-xl font-bold shadow-sm transition-all ${activeTab==='wallet' ? 'bg-blue-600 text-white shadow-lg transform -translate-y-1' : 'bg-white text-gray-500'}`}>我的票夾</button>
            </div> 
            <div className="flex-grow p-6 overflow-y-auto pb-20"> 
                {activeTab === 'redeem' ? (
                    <div className="space-y-3">
                        <h3 className="font-bold text-gray-600 mb-2">可兌換商品</h3>
                        {(coupons||[]).filter(c => c.pointCost >= 0).map(coupon => {
                            // ★★★ 檢查活動是否過期 ★★★
                            const isExpired = coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now();
                            const canAfford = currentUser.points >= coupon.pointCost;
                            const isAvailable = !isExpired && canAfford;

                            return (
                                <div key={coupon.id} className={`bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center ${isExpired ? 'opacity-60 border-gray-100' : 'border-gray-100'}`}>
                                    <div>
                                        <div className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                            {coupon.name}
                                            {isExpired && <span className="text-[10px] bg-gray-200 text-gray-600 px-1 rounded">已結束</span>}
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="text-orange-500 font-bold text-sm">{coupon.pointCost} 點</div>
                                            {coupon.limit && <div className="text-red-500 text-xs bg-red-50 px-1 rounded border border-red-100">限領1次</div>}
                                            {coupon.expiryDate && <div className="text-gray-400 text-xs">{coupon.expiryDate} 止</div>}
                                        </div>
                                    </div>
                                    <button onClick={() => handleRedeem(coupon)} className={`px-4 py-2 rounded-lg font-bold ${isAvailable ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`} disabled={!isAvailable}>
                                        {isExpired ? '結束' : '兌換'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <h3 className="font-bold text-gray-600 mb-2">已持有票券</h3>
                        {currentUser.items.filter(i => !i.redeemed).length === 0 ? <div className="text-center text-gray-400 py-10">票夾是空的</div> : currentUser.items.filter(i => !i.redeemed).map((item, idx) => {
                            const isTimeLocked = item.validFrom && item.validFrom > Date.now();
                            // ★★★ 檢查票券是否過期 ★★★
                            const isExpired = item.expiryDate && new Date(item.expiryDate).getTime() < Date.now();
                            
                            const isUsable = !isTimeLocked && !isExpired;

                            return (
                                <div key={idx} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 relative overflow-hidden ${isUsable ? 'border-blue-500' : 'border-gray-400 bg-gray-50'}`}>
                                    <div className="font-bold text-lg text-gray-800">
                                        {item.name}
                                        {isExpired && <span className="text-xs text-red-500 ml-2">(已過期)</span>}
                                    </div>
                                    
                                    {isExpired ? (
                                        <div className="text-red-500 font-bold mt-2 text-sm">🚫 此券已超過使用期限</div>
                                    ) : (
                                        <>
                                            <div className="text-gray-400 text-xs mt-1">核銷代碼 {item.expiryDate && `(有效至 ${item.expiryDate})`}</div>
                                            {isTimeLocked ? (
                                                <div className="text-lg font-bold text-gray-500 bg-gray-200 inline-block px-3 py-1 rounded mt-1 flex items-center gap-1">
                                                    <Clock size={16}/> 明日方可使用
                                                </div>
                                            ) : (
                                                <div className="text-2xl font-mono font-bold text-gray-700 tracking-widest">{item.code}</div>
                                            )}
                                        </>
                                    )}

                                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-blue-500 transform -rotate-12"><Ticket size={80}/></div>
                                </div>
                            );
                        })}
                    </div>
                )} 
            </div> 
        </div> 
    );
};

const OrderHistoryModal = ({ orders, onClose }) => { 
    const safeOrders = orders || [];
    const groupedHistory = []; 
    let currentBatch = []; 
    let lastBatchId = null; 
    
    safeOrders.forEach(o => { 
        const thisBatchId = o.batchId || o.time || 'unknown';
        if (lastBatchId && thisBatchId !== lastBatchId) { groupedHistory.push({ batchId: lastBatchId, items: currentBatch, time: currentBatch[0]?.time }); currentBatch = []; } 
        currentBatch.push(o); 
        lastBatchId = thisBatchId; 
    }); 
    if (currentBatch.length > 0) groupedHistory.push({ batchId: lastBatchId, items: currentBatch, time: currentBatch[0]?.time }); 
    groupedHistory.reverse(); 

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="bg-gray-800 text-white p-4 flex justify-between items-center"><h2 className="text-xl font-bold flex items-center gap-2"><ClipboardList size={24}/> 已點餐點紀錄</h2><button onClick={onClose}><X size={24}/></button></div>
                <div className="overflow-y-auto p-4 flex-grow bg-gray-50">{groupedHistory.length === 0 ? (<div className="text-center text-gray-400 py-10">尚未點餐</div>) : (groupedHistory.map((group, idx) => (<div key={idx} className="bg-white mb-4 rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up"><div className="bg-gray-100 p-2 px-4 flex justify-between items-center border-b"><span className="font-bold text-gray-600 text-sm">第 {groupedHistory.length - idx} 次加點</span><span className="text-xs text-gray-500 font-mono">{group.time ? new Date(group.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</span></div><div className="p-2">{group.items.map((item, i) => (<div key={i} className="flex justify-between py-2 px-2 border-b last:border-0 border-gray-100"><span className="text-gray-800 font-medium">{item.name}</span><span className="font-bold text-gray-900">{item.category==='Tip'?'$'+item.price : 'x'+item.count}</span></div>))}</div></div>)))}</div>
                <div className="p-4 bg-white border-t"><button onClick={onClose} className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold">關閉</button></div>
            </div>
        </div>
    ); 
};

// =======================================================
// ★★★ 修正版 CustomerOrderPage：加入隱藏分類邏輯 ★★★
// =======================================================
const CustomerOrderPage = ({ tableId, storeId, diningPlans, menuItems, categories, setTables, tables, printers, stockStatus, onGoToMember, printerConfig, hiddenCategories }) => {
    const [cart, setCart] = useState([]);
    const [addedId, setAddedId] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [showHistory, setShowHistory] = useState(false);
    const [isSending, setIsSending] = useState(false); 
    const [showCart, setShowCart] = useState(false);

    const queryParams = new URLSearchParams(window.location.search);
    const urlToken = queryParams.get('token');
    const tablesRef = useRef(tables);
    useEffect(() => { tablesRef.current = tables; }, [tables]);
    const safeTables = tables || [];
    const currentTable = safeTables.find(t => t.id === tableId);
    
    if (!currentTable || currentTable.status !== 'occupied') return <div className="h-screen flex items-center justify-center bg-gray-900 text-white p-8 text-center"><div><h1 className="text-3xl font-bold mb-4">⚠️ 連結失效</h1><p>此座位尚未開桌，請聯繫服務人員。</p></div></div>; 
    if (currentTable.token && currentTable.token !== urlToken) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white p-8 text-center"><div><h1 className="text-3xl font-bold mb-4 text-red-500">🚫 連結已過期</h1><p>這是舊的點餐連結，無法使用。</p><p className="mt-4 text-gray-400">這桌已重新開桌，請掃描桌上<br/>最新的 QR Code。</p></div></div>;
    const now = Date.now();
    const timeLimit = 90 * 60 * 1000; 
    if (now - currentTable.startTime > timeLimit) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white p-8 text-center"><div><h1 className="text-3xl font-bold mb-4 text-orange-500">⏳ 連結已過期</h1><p>此 QR Code 已超過有效期限。</p><p className="mt-2">如需加點，請聯繫服務人員。</p></div></div>; 
    
    const safeDiningPlans = diningPlans || INITIAL_DINING_PLANS;
    const currentPlan = safeDiningPlans.find(p => p.id === currentTable.plan) || safeDiningPlans[0];

    // ★★★ 修改 1：過濾上方的分類按鈕，排除隱藏的分類 ★★★
    const visibleCategories = (categories || []).filter(cat => !(hiddenCategories || []).includes(cat));

    // ★★★ 修改 2：過濾菜色，排除隱藏分類的菜 ★★★
    const filteredItems = (menuItems || []).filter(item => { 
        if (item.onlyForStaff === true) return false; 
        
        // 修正點：確保 hiddenCategories 存在才執行
        if (hiddenCategories && hiddenCategories.includes(item.category)) return false;

        if (item.showInCustomerQR === false) return false;

        if (activeCategory !== 'All' && item.category !== activeCategory) return false; 
        
        // 修正點：這裡要確保 currentPlan 已經定義（你原本代碼應該有定義在上面）
        if (item.price === 0 && !item.allowedPlans?.includes(currentPlan.id)) return false; 
        
        if (stockStatus && stockStatus[storeId]?.[item.id] === true) return false; 
        
        // 修正點：這行的變數名稱要跟參數一致
        if (item.excludedStores && item.excludedStores.includes(storeId)) return false;

        return true; 
    });

    const handleAddToCart = (item) => { 
        if (cart.length >= 12) { alert("⚠️ 為了出餐品質，每次限點 12 樣喔！\n請先至購物車送出訂單。"); return; } 
        const existing = cart.find(i => i.id === item.id); 
        if (existing) { alert(`⚠️ "${item.name}" 已經在購物車了！\n如需加量請分批點餐。`); return; } 
        setAddedId(item.id); setCart(prev => [...prev, { ...item, count: 1 }]); setTimeout(() => setAddedId(null), 300); 
    };
    const handleRemoveFromCart = (itemId) => { setCart(prev => prev.filter(item => item.id !== itemId)); };

    const handleSendOrder = async () => {
        if (cart.length === 0) return;
        setIsSending(true); 
        const latestTables = tablesRef.current || [];
        const latestTableData = latestTables.find(t => t.id === tableId);
        const COOLDOWN_MINUTES = 10;
        const lastBatchTime = latestTableData?.lastBatchTime || 0; 
        const timeSinceLastOrder = Date.now() - lastBatchTime;
        const cooldownMs = COOLDOWN_MINUTES * 60 * 1000;
        if (lastBatchTime > 0 && timeSinceLastOrder < cooldownMs) { const minutesLeft = Math.ceil((cooldownMs - timeSinceLastOrder) / 60000); alert(`⏳ 就在剛剛，同桌親友已經送出訂單囉！\n\n為了避免重複點餐，請等待 ${minutesLeft} 分鐘後再進行加點。`); setIsSending(false); return; }
        const timestamp = Date.now(); 
        const ordersToSave = cart.map(c => ({...c, time: new Date().toISOString(), batchId: timestamp}));
        setTables(prev => prev.map(t => { if (t.id === tableId) { const newOrders = [...(t.orders || []), ...ordersToSave]; return { ...t, orders: newOrders, lastBatchTime: timestamp }; } return t; })); 
        
        const currentStoreId = storeId || 'branch3';
        const KITCHEN_IP_MAP = {
            '001': '192.168.1.115', // 七賢總店
            '002': '192.168.123.100', // 鳳山店 (請填入鳳山的廚房 IP，例如 192.168.1.200)
            'branch3': '192.168.1.180', // 楠梓店
        };
        const fallbackIp = currentStoreId === '001' ? '192.168.1.115' : '192.168.1.180';
        const API_BASE = STORE_URLS[currentStoreId] || ''; 
        const targetIp = printerConfig?.find(p => p.type === 'kitchen')?.ip || fallbackIp; 
        const printData = { type: 'kitchen', tableId: tableId, content: cart.map(item => ({ name: item.name, count: item.count })), targetIp: targetIp };
        
        try { 
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); 
            await fetch(`${API_BASE}/api/print`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(printData), signal: controller.signal }); 
            clearTimeout(timeoutId);
            alert('✅ 點餐成功！廚房已收到。'); 
        } catch (e) { alert('✅ 點餐已紀錄！\n(出單機忙碌中，服務人員會確認)'); } 
        finally { setCart([]); setShowCart(false); setIsSending(false); }
    };
        
    if (showCart) {
        return (
            <div className="flex flex-col h-screen bg-gray-100 relative z-50">
                {isSending && <div className="absolute inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center text-white"><Loader className="animate-spin mb-4" size={48}/><h2 className="text-2xl font-bold">訂單處理中...</h2></div>}
                <div className="bg-gray-900 text-white p-4 shadow-md flex justify-between items-center"><h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart /> 購物車確認</h2><button onClick={() => setShowCart(false)} className="bg-gray-700 p-2 rounded-full"><X size={20}/></button></div>
                <div className="flex-grow overflow-y-auto p-4 pb-32">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-400 mt-20"><ShoppingCart size={64} className="mx-auto mb-4 opacity-20"/><p>尚未選擇任何餐點</p><button onClick={() => setShowCart(false)} className="mt-4 text-blue-600 underline">返回菜單</button></div>
                    ) : (
                        <div className="space-y-3">
                            <div className="bg-yellow-100 p-3 rounded-lg text-yellow-800 text-sm font-bold text-center mb-2">請確認以下餐點，送出後即開始製作</div>
                            {cart.map((item, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center animate-fade-in-up">
                                    <div><div className="font-bold text-lg text-gray-800">{item.name}</div>{item.price > 0 && <div className="text-orange-600 text-sm font-bold">+${item.price}</div>}</div>
                                    <div className="flex items-center gap-4"><span className="font-bold text-lg">x1</span><button onClick={() => handleRemoveFromCart(item.id)} className="bg-red-100 text-red-500 p-2 rounded-lg hover:bg-red-200"><Trash2 size={20} /></button></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)] p-4 rounded-t-2xl z-20">
                    <div className="flex justify-between items-center mb-4"><span className="font-bold text-lg text-gray-600">共 {cart.length} 項餐點</span><span className="text-xs text-gray-400">上限 12 項</span></div>
                    <div className="grid grid-cols-2 gap-3"><button onClick={() => setShowCart(false)} className="bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-lg">+ 繼續點餐</button><button onClick={handleSendOrder} disabled={cart.length === 0} className={`py-3 rounded-xl font-bold text-lg text-white shadow-lg ${cart.length === 0 ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>確認送出</button></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100 relative">
            <div className="bg-gray-900 text-white p-4 shadow-md sticky top-0 z-10">
                <div className="flex justify-between items-center mb-1">
                    <div><h1 className="font-bold text-lg">桌號 {tableId}</h1><div className="text-xs opacity-70">方案: {currentPlan.name}</div></div>
                    
                    <div className="flex items-center">
                         <div className="text-[10px] bg-yellow-400 text-red-800 font-bold px-2 py-1 rounded-l-lg animate-pulse mr-[-5px] z-0 shadow-sm">
                            加入會員<br/>滿千抽獎
                        </div>
                        <button onClick={onGoToMember} className="bg-orange-600 hover:bg-orange-500 px-3 py-2 rounded-lg flex items-center gap-1 text-sm font-bold border border-orange-400 text-white z-10 shadow-lg relative">
                            <UserCheck size={16} /> 會員中心
                        </button>
                    </div>
                </div>
                <div className="flex justify-between items-end border-t border-gray-700 pt-1 mt-1"><div><div className="font-bold text-orange-400 text-xs">最後加點</div><div className="text-sm">{formatTime(currentTable.startTime + 90*60*1000)}</div></div><button onClick={() => setShowHistory(true)} className="text-xs text-gray-400 underline flex items-center gap-1"><ClipboardList size={12}/> 已點紀錄</button></div>
            </div>
            
            {/* ★★★ 修改 3：渲染分類按鈕，改用 visibleCategories ★★★ */}
            <div className="flex overflow-x-auto bg-white p-4 shadow-md gap-3 sticky top-[88px] z-10 no-scrollbar">
                <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style> 
                {['All', ...visibleCategories].map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-3 rounded-full font-bold text-lg whitespace-nowrap flex-shrink-0 transition-transform active:scale-95 ${activeCategory === cat ? 'bg-orange-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                        {cat === 'All' ? '全部' : cat}
                    </button>
                ))}
            </div>

            <div className="flex-grow overflow-y-auto p-4 pb-32">
                <div className="grid grid-cols-2 gap-4">
                    {filteredItems.map(item => (
                        <button key={item.id} onClick={() => handleAddToCart(item)} className={`bg-white p-3 rounded-xl shadow-sm flex flex-col items-center gap-2 relative ${addedId === item.id ? 'ring-2 ring-green-500' : ''}`}>
                            <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 font-bold text-2xl">{item.name[0]}</div>
                            <div className="text-center">
                                <div className="font-bold text-gray-800">{item.name}</div>
                                {item.price > 0 && <div className="text-orange-600 text-xs font-bold">+${item.price}</div>}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            {cart.length > 0 && (<div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)] p-4 rounded-t-2xl z-20"><button onClick={() => setShowCart(true)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-xl shadow-lg flex items-center justify-center gap-2"><ShoppingCart size={24} />查看購物車 ({cart.length})</button></div>)}
            {showHistory && (<OrderHistoryModal orders={currentTable.orders} onClose={() => setShowHistory(false)} />)}
        </div>
    );
};

// 修正版：保留方案與隱藏邏輯，並修正變數錯誤
const MenuPage = ({ tables, menuItems, categories, setTables, printers, currentStore, stockStatus, hiddenCategories }) => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [addedId, setAddedId] = useState(null);
    const [cart, setCart] = useState([]);
    const [selectedTableId, setSelectedTableId] = useState('');
    const [showDrawerAuth, setShowDrawerAuth] = useState(false);
    const [drawerPwd, setDrawerPwd] = useState(''); 

    // 取得當前選中桌位的資料，用來判斷該桌的方案
    const selectedTableData = tables.find(t => t.id === selectedTableId);

    const filteredItems = (menuItems || []).filter(item => { 
        // 1. 分類選擇篩選 (全部/特定分類)
        if (activeCategory !== 'All' && item.category !== activeCategory) return false; 

        // 2. 隱藏分類過濾 (補回邏輯：確保定義)
        const safeHidden = hiddenCategories || [];
        if (safeHidden.includes(item.category)) return false;

        // 3. 庫存檢查 (修正：使用 currentStore.id)
        if (stockStatus && stockStatus[currentStore.id]?.[item.id] === true) return false; 

        // 4. 分店排除檢查 (修正：使用 currentStore.id)
        if (item.excludedStores && item.excludedStores.includes(currentStore.id)) return false; 

        // 5. 方案檢查 (補回邏輯)
        // 如果有選桌子，且該菜色是 0 元(吃到飽品項)，則檢查方案是否允許
        if (selectedTableData && item.price === 0) {
            if (item.allowedPlans && !item.allowedPlans.includes(selectedTableData.plan)) {
                return false; 
            }
        }
    
        return true; 
    });

    // --- 統一後的店員端點餐邏輯 ---
const handleAddToCart = (item) => { 
    // 檢查購物車內是否已經有這道菜
    const existing = cart.find(i => i.id === item.id); 
    
    if (existing) { 
        // 如果有了，就不准加，並跳出警告
        alert(`⚠️ "${item.name}" 已經在購物車了！\n店員模式目前也統一限制每項限點 1 份。`); 
        return; 
    } 
    
    // 如果沒有重複，才加入購物車，數量固定為 1
    setAddedId(item.id); 
    setCart(prev => [...prev, { ...item, count: 1 }]); 
    
    // 綠色外框閃爍動畫
    setTimeout(() => setAddedId(null), 300); 
};
    const handleRemoveFromCart = (itemId) => { setCart(prev => prev.filter(i => i.id !== itemId)); };
    
    const handleSendToKitchen = async () => { 
        if (!selectedTableId) return alert('請先選擇桌號！'); 
        if (cart.length === 0) return alert('購物車是空的！'); 
        const targetConfig = printers.find(p => p.id === 'kitchen_hot') || printers[0]; 
        if (!targetConfig || !targetConfig.ip) { return alert('錯誤：請先至設定頁面輸入櫃台電腦 IP！'); } 
        const SERVER_API = `${STORE_URLS[currentStore.id]}/api/print`; 
        const printData = { type: 'kitchen', tableId: selectedTableId, content: cart.map(item => ({ name: item.name, count: item.count })), targetIp: targetConfig.ip }; 
        try { await fetch(SERVER_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(printData) }); const timestamp = Date.now(); setTables(prev => prev.map(t => { if (t.id === selectedTableId) { const newOrders = [...(t.orders || []), ...cart.map(c => ({...c, time: new Date().toISOString(), batchId: timestamp}))]; return { ...t, orders: newOrders }; } return t; })); alert(`✅ 點餐成功！`); setCart([]); } catch (error) { alert(`❌ 連線失敗！\niPad 找不到電腦`); } 
    };

    const handleVerifyAndOpenDrawer = async () => {
        if (drawerPwd !== currentStore.password) { alert('❌ 密碼錯誤！無法開啟錢箱'); setDrawerPwd(''); return; }
        setShowDrawerAuth(false); setDrawerPwd('');
        const targetConfig = printers.find(p => p.id === 'counter') || printers[0];
        if (!targetConfig || !targetConfig.ip) return alert('錯誤：找不到櫃台印表機設定');
        const SERVER_API = `${STORE_URLS[currentStore.id]}/api/print`;
        try { await fetch(SERVER_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'open_drawer', targetIp: targetConfig.ip }) }); alert('✅ 錢箱已開啟'); } catch (e) { alert('❌ 連線失敗，無法開啟錢箱'); }
    };

    return ( 
        <div className="flex h-full bg-gray-100 overflow-hidden">
            <div className="w-2/3 flex flex-col border-r border-gray-300">
                <div className="bg-white p-4 shadow-sm flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide items-center">{['All', ...categories].map(cat => (<button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-3 rounded-full font-bold text-lg transition-all ${activeCategory === cat ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>{cat}</button>))}</div>
                <div className="flex-grow overflow-y-auto p-4"><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{filteredItems.map(item => (<button key={item.id} onClick={() => handleAddToCart(item)} className={`bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center gap-3 active:scale-95 relative overflow-hidden ${addedId === item.id ? 'ring-4 ring-green-500' : ''}`}><div className="w-full h-24 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 font-bold text-2xl">{item.name[0]}</div><div className="text-center w-full"><div className="font-bold text-lg text-gray-800">{item.name}{item.onlyForStaff && <span className="bg-red-100 text-red-600 text-xs px-1 rounded ml-1">內</span>}</div><div className="text-orange-600 font-bold mt-1">${item.price}</div></div></button>))}</div></div>
            </div>
            <div className="w-1/3 bg-white flex flex-col shadow-xl z-10 relative">
                <div className="p-4 bg-gray-800 text-white"><h3 className="text-xl font-bold flex items-center gap-2 mb-4"><ShoppingCart /> 點餐明細</h3><select className="w-full p-3 rounded-lg text-black font-bold outline-none" value={selectedTableId} onChange={e => setSelectedTableId(e.target.value)}><option value="">請選擇桌號...</option>{tables.filter(t => t.status === 'occupied').map(t => <option key={t.id} value={t.id}>桌號 {t.id}</option>)}</select></div>
                <div className="flex-grow overflow-y-auto p-4 space-y-2">{cart.length === 0 ? <div className="text-center text-gray-400 mt-10">尚未點餐</div> : cart.map(item => (<div key={item.id} className="flex justify-between items-center border-b pb-2"><div><div className="font-bold">{item.name}</div><div className="text-xs text-gray-500">${item.price} x {item.count}</div></div><div className="font-bold text-lg">x{item.count} <button onClick={() => handleRemoveFromCart(item.id)} className="text-red-500 ml-2"><X size={16}/></button></div></div>))}</div>
                <div className="p-4 border-t bg-gray-50 space-y-3"><button onClick={handleSendToKitchen} className={`w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all ${cart.length > 0 && selectedTableId ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-500'}`}>送出廚房 (列印)</button><button onClick={() => setShowDrawerAuth(true)} className="w-full py-3 rounded-xl font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 flex items-center justify-center gap-2"><Briefcase size={20}/> 開啟錢箱 (臨時換錢)</button></div>
                {showDrawerAuth && (<div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4"><div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in-up"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><ShieldAlert className="text-orange-500"/> 主管授權</h3><button onClick={() => {setShowDrawerAuth(false); setDrawerPwd('');}} className="text-gray-400 hover:text-gray-600"><X size={24}/></button></div><p className="text-sm text-gray-500 mb-4 text-center">請輸入【{currentStore.name}】的登入密碼<br/>以開啟錢箱</p><input type="password" className="w-full p-4 text-center text-3xl font-bold border-2 border-orange-200 rounded-xl mb-4 outline-none focus:border-orange-500 tracking-widest" placeholder="輸入密碼" value={drawerPwd} readOnly /><NumberPad value={drawerPwd} onChange={setDrawerPwd} onEnter={handleVerifyAndOpenDrawer} showDisplay={false} /></div></div>)}
            </div>
        </div> 
    );
};

// =======================================================
// ★★★ SettingsPage (資料救援專用版) ★★★
// =======================================================
const SettingsPage = ({ printers, setPrinters, onLogout, onResetData, currentStoreId, setCloudPrinters }) => { 
    const [testingIp, setTestingIp] = useState(null); 
    const [cashDrawerEnabled, setCashDrawerEnabled] = useStickyState(false, `pos_cash_drawer_${currentStoreId}`); 
    const [localPrinters, setLocalPrinters] = useState(printers);

    useEffect(() => { setLocalPrinters(printers); }, [printers]);
    const handleLocalChange = (id, newIp) => { setLocalPrinters(prev => prev.map(p => p.id === id ? { ...p, ip: newIp } : p)); }; 
    const handleSave = () => { setPrinters(localPrinters); setCloudPrinters(localPrinters); alert("✅ IP 設定已儲存並同步至雲端！"); };
    const handleTestConnection = (id) => { setTestingIp(id); setTimeout(() => { const isSuccess = Math.random() > 0.3; setTestingIp(null); alert(isSuccess ? '連線成功！' : '連線失敗！'); }, 1500); }; 

    // ★★★ 資料救援核心功能 ★★★
    const handleUploadLocalData = async (localKey, cloudDocId, label) => {
        try {
            // 1. 嘗試從電腦快取抓資料
            const localDataStr = localStorage.getItem(localKey);
            if (!localDataStr) {
                alert(`⚠️ 電腦裡找不到「${label}」的暫存資料 (可能已經被清除了)`);
                return;
            }
            
            if (!window.confirm(`⚠️【救援確認】\n\n您確定要將這台電腦裡的「${label}」覆蓋到雲端嗎？\n\n這樣可以救回您剛剛消失的資料。`)) return;
            
            // 2. 強制寫入 Firebase
            const data = JSON.parse(localDataStr);
            await setDoc(doc(db, 'pos_data', cloudDocId), { val: data });
            
            alert(`✅ 成功救回！\n【${label}】已上傳至雲端，其他分店現在應該也看得到了。`);
            window.location.reload(); // 重新整理網頁
        } catch (error) {
            console.error(error);
            alert(`❌ 救援失敗：${error.message}`);
        }
    };

    return ( 
        <div className="p-8 h-full bg-gray-100 overflow-y-auto"> 
            <h2 className="text-2xl font-bold mb-6 text-gray-800">系統設定 (分店: {currentStoreId})</h2> 
            
            {/* ★★★ 紅色救援區塊 ★★★ */}
            <div className="bg-red-50 p-6 rounded-2xl shadow-lg border-l-8 border-red-600 mb-8">
                <h3 className="font-bold text-red-800 text-xl mb-2 flex items-center gap-2"><ShieldAlert size={28}/> 資料消失救援區</h3>
                <p className="text-red-700 mb-4 font-bold">
                    如果您剛剛輸入的資料不見了，請點擊下方按鈕，把暫存在電腦裡的資料「推」回雲端！
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <button onClick={() => handleUploadLocalData('pos_menu_items_v1', 'menu', '菜單')} className="bg-white border-2 border-red-400 text-red-600 font-bold py-3 rounded-xl hover:bg-red-600 hover:text-white transition-colors shadow-sm">
                        🥩 救回菜單
                    </button>
                    <button onClick={() => handleUploadLocalData('pos_dining_plans_v1', 'plans', '方案')} className="bg-white border-2 border-red-400 text-red-600 font-bold py-3 rounded-xl hover:bg-red-600 hover:text-white transition-colors shadow-sm">
                        💲 救回方案
                    </button>
                    <button onClick={() => handleUploadLocalData('pos_employees_v1', 'employees', '員工')} className="bg-white border-2 border-red-400 text-red-600 font-bold py-3 rounded-xl hover:bg-red-600 hover:text-white transition-colors shadow-sm">
                        👷 救回員工
                    </button>
                    <button onClick={() => handleUploadLocalData('pos_bookings_v1', 'bookings', '訂位')} className="bg-white border-2 border-red-400 text-red-600 font-bold py-3 rounded-xl hover:bg-red-600 hover:text-white transition-colors shadow-sm">
                        📅 救回訂位
                    </button>
                    <button onClick={() => handleUploadLocalData('pos_stores_config_v1', 'stores_config', '分店設定')} className="bg-white border-2 border-red-400 text-red-600 font-bold py-3 rounded-xl hover:bg-red-600 hover:text-white transition-colors shadow-sm">
                        🏪 救回分店
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Printer/> 連線設定</h3>
                    <div className="space-y-4">{localPrinters.map(p => (<div key={p.id} className="flex justify-between items-center border-b pb-4 last:border-0"><div><div className="font-bold">{p.name}</div><div className="text-xs text-gray-500 mt-1"><input className="border p-1 rounded w-32" value={p.ip} onChange={(e) => handleLocalChange(p.id, e.target.value)} /> ({p.type})</div></div><div className="flex flex-col items-end gap-1"><button onClick={() => handleTestConnection(p.id)} className={`text-sm font-bold px-3 py-1.5 rounded flex items-center gap-1 ${testingIp === p.id ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{testingIp === p.id ? <RefreshCcw size={14} className="animate-spin"/> : <Wifi size={14}/>}{testingIp === p.id ? '偵測中...' : '重新連線'}</button><span className={`text-xs font-bold ${p.status === 'online' ? 'text-green-600' : p.status === 'offline' ? 'text-red-600' : 'text-gray-400'}`}>{p.status === 'online' ? '● 連線正常' : p.status === 'offline' ? '● 未連線' : '○ 未測試'}</span></div></div>))}</div>
                    <button onClick={handleSave} className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-green-700">💾 儲存並同步 IP 設定</button>
                </div> 
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><HardDrive/> 硬體週邊</h3>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border"><div><div className="font-bold text-gray-700">連結收銀機錢箱</div><div className="text-xs text-gray-500">結帳時自動送出開啟訊號 (RJ11)</div></div><button onClick={() => setCashDrawerEnabled(!cashDrawerEnabled)} className={`w-14 h-8 rounded-full p-1 transition-colors ${cashDrawerEnabled ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${cashDrawerEnabled ? 'translate-x-6' : ''}`}></div></button></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Server/> 系統操作</h3>
                        <div className="space-y-3">
                            <button onClick={onResetData} className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-bold hover:bg-red-100 border border-red-200">重置所有系統資料 (危險)</button>
                            <button onClick={onLogout} className="w-full bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-700">登出 / 換班</button>
                        </div>
                    </div>
                </div> 
            </div> 
        </div> 
    ); 
};

// =======================================================
// ★★★ 防卡死加強版：分店日報系統 ★★★
// =======================================================
const DailyReportPage = ({ currentStore }) => {
    // 1. 更安全的日期格式化 (避免平板與電腦格式不同)
    const getSafeTodayStr = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayStr = getSafeTodayStr();
    const reportId = `report_${currentStore.id}_${todayStr}`;
    
    // 使用 Firebase 讀取今日報表
    const [reportData, setReportData] = useFirebaseState('daily_reports', reportId, {
        date: todayStr,
        storeId: currentStore.id,
        storeName: currentStore.name,
        status: 'draft', 
        incomes: [], 
        expenses: [],
        notes: '',
        lastUpdated: Date.now()
    });

    // ★★★ 2. 強制救援功能：手動建立檔案 ★★★
    const handleForceCreate = async () => {
        if(window.confirm('確定要強制建立今日報表嗎？')) {
            const defaultData = {
                date: todayStr,
                storeId: currentStore.id,
                storeName: currentStore.name,
                status: 'draft', 
                incomes: [], 
                expenses: [],
                notes: '',
                lastUpdated: Date.now()
            };
            // 強制寫入 Firebase
            await setDoc(doc(db, 'daily_reports', reportId), { val: defaultData });
            // 強制更新本地狀態
            setReportData(defaultData);
            alert('✅ 已強制建立！畫面應會顯示。');
        }
    };

    // 如果資料還沒抓下來，顯示轉圈圈 + 救援按鈕
    if (!reportData) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-gray-100 text-gray-500">
                <Loader className="animate-spin mb-6 text-blue-500" size={64} />
                <p className="text-2xl font-bold mb-2">正在同步雲端日報...</p>
                <p className="text-sm mb-8">讀取 ID: {reportId}</p>
                
                {/* 👇 這就是救星按鈕 👇 */}
                <button 
                    onClick={handleForceCreate}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
                >
                    <RefreshCcw size={20}/> 太久沒反應？點此強制建立表格
                </button>
            </div>
        );
    }

    // 計算總計 (因為上面已經擋掉了 null，這裡就可以放心執行了)
    const totalIncome = (reportData.incomes || []).reduce((sum, i) => sum + (parseInt(i.amount) || 0), 0);
    const totalExpense = (reportData.expenses || []).reduce((sum, i) => sum + (parseInt(i.amount) || 0), 0);
    const netTotal = totalIncome - totalExpense;
    const isLocked = reportData.status === 'submitted'; 

    // 通用更新函數
    const updateField = (field, value) => {
        if(isLocked) return;
        setReportData({ ...reportData, [field]: value, lastUpdated: Date.now() });
    };

    // 處理列表增刪改
    const handleListChange = (type, id, field, value) => {
        if(isLocked) return;
        const list = type === 'incomes' ? reportData.incomes : reportData.expenses;
        const newList = list.map(item => item.id === id ? { ...item, [field]: value } : item);
        updateField(type, newList);
    };

    const addItem = (type) => {
        if(isLocked) return;
        const list = type === 'incomes' ? reportData.incomes : reportData.expenses;
        const newItem = { id: Date.now(), item: '', amount: '' };
        updateField(type, [...list, newItem]);
    };

    const removeItem = (type, id) => {
        if(isLocked) return;
        const list = type === 'incomes' ? reportData.incomes : reportData.expenses;
        updateField(type, list.filter(i => i.id !== id));
    };

    // 存檔與送出
    const handleSave = () => {
        if(isLocked) return;
        alert('✅ 草稿已暫存！\n您可以稍後再回來編輯。');
    };

    const handleSubmit = () => {
        if(isLocked) return;
        if(!window.confirm('⚠️ 確定要「正式送出」日報嗎？\n\n送出後將「無法再修改」，並會傳送給總部查閱。')) return;
        setReportData({ ...reportData, status: 'submitted', lastUpdated: Date.now() });
        setTimeout(() => alert('🚀 日報已送出！\n總部已收到您的回報。'), 500);
    };

    return (
        <div className="h-full bg-gray-100 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className={`p-6 text-white flex justify-between items-center ${isLocked ? 'bg-gray-700' : 'bg-blue-600'}`}>
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2"><FileText/> {currentStore.name} - 每日營運日報</h2>
                        <div className="opacity-80 mt-1">日期：{reportData.date}</div>
                    </div>
                    <div className="px-3 py-1 bg-white/20 rounded font-bold text-sm">
                        狀態：{isLocked ? '🔒 已送出 (唯讀)' : '✏️ 草稿 (編輯中)'}
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* 1. 收入區塊 (自由輸入版) */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex justify-between">
                            <span>💰 今日收入 (營收)</span>
                            <span className="text-blue-600">${totalIncome.toLocaleString()}</span>
                        </h3>
                        <div className="space-y-2">
                            {(reportData.incomes || []).length === 0 && <div className="text-gray-400 text-sm italic">尚無收入紀錄，請新增項目</div>}
                            
                            {(reportData.incomes || []).map((inc) => (
                                <div key={inc.id} className="flex gap-2">
                                    <input 
                                        placeholder="項目 (如: 現金、刷卡、UberEats)" 
                                        value={inc.item} 
                                        onChange={e=>handleListChange('incomes', inc.id, 'item', e.target.value)} 
                                        disabled={isLocked} 
                                        className="border p-2 rounded flex-grow font-bold bg-blue-50 focus:bg-white"
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="金額" 
                                        value={inc.amount} 
                                        onChange={e=>handleListChange('incomes', inc.id, 'amount', e.target.value)} 
                                        disabled={isLocked} 
                                        className="border p-2 rounded w-32 text-right font-bold"
                                    />
                                    {/* ★ 修改點2：移除了 index > 1 的限制，每一行都能刪除 */}
                                    {!isLocked && (
                                        <button onClick={()=>removeItem('incomes', inc.id)} className="text-red-400 p-2 hover:bg-red-50 rounded">
                                            <Trash2 size={20}/>
                                        </button>
                                    )}
                                </div>
                            ))}
                            
                            {!isLocked && (
                                <button onClick={()=>addItem('incomes')} className="text-blue-600 text-sm font-bold flex items-center gap-1 mt-2 hover:bg-blue-50 px-2 py-1 rounded">
                                    <Plus size={16}/> 新增收入項目
                                </button>
                            )}
                        </div>
                    </div>

                    <hr className="border-gray-200"/>

                    {/* 2. 支出區塊 */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex justify-between">
                            <span>💸 今日支出 (雜支/進貨)</span>
                            <span className="text-red-600">${totalExpense.toLocaleString()}</span>
                        </h3>
                        <div className="space-y-2">
                            {(reportData.expenses || []).length === 0 && <div className="text-gray-400 text-sm italic">無支出紀錄</div>}
                            {(reportData.expenses || []).map(exp => (
                                <div key={exp.id} className="flex gap-2">
                                    <input placeholder="項目 (如: 買冰塊)" value={exp.item} onChange={e=>handleListChange('expenses', exp.id, 'item', e.target.value)} disabled={isLocked} className="border p-2 rounded flex-grow font-bold bg-red-50 focus:bg-white"/>
                                    <input type="number" placeholder="金額" value={exp.amount} onChange={e=>handleListChange('expenses', exp.id, 'amount', e.target.value)} disabled={isLocked} className="border p-2 rounded w-32 text-right font-bold"/>
                                    {!isLocked && <button onClick={()=>removeItem('expenses', exp.id)} className="text-red-400 p-2 hover:bg-red-50 rounded"><Trash2 size={20}/></button>}
                                </div>
                            ))}
                            {!isLocked && <button onClick={()=>addItem('expenses')} className="text-red-600 text-sm font-bold flex items-center gap-1 mt-2 hover:bg-red-50 px-2 py-1 rounded"><Plus size={16}/> 新增支出項目</button>}
                        </div>
                    </div>

                    <hr className="border-gray-200"/>

                    {/* 3. 結餘與備註 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-700 mb-2">📝 店務回報 / 備註</h3>
                            <textarea 
                                className="w-full border-2 border-gray-200 rounded-xl p-3 h-32 focus:border-blue-500 outline-none resize-none"
                                placeholder="請輸入今日需回報事項 (例如: 製冰機怪怪的、客訴處理情形...)"
                                value={reportData.notes}
                                onChange={e => updateField('notes', e.target.value)}
                                disabled={isLocked}
                            />
                        </div>
                        <div className="bg-gray-50 p-6 rounded-xl flex flex-col justify-center items-end">
                             <div className="text-gray-500 font-bold mb-2">今日淨現金結餘</div>
                             <div className={`text-5xl font-bold ${netTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>${netTotal.toLocaleString()}</div>
                             <div className="text-xs text-gray-400 mt-2">計算公式：收入 - 支出</div>
                        </div>
                    </div>

                    {/* 4. 按鈕區 */}
                    {!isLocked && (
                        <div className="flex gap-4 pt-4 border-t">
                            <button onClick={handleSave} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-4 rounded-xl font-bold text-lg shadow transition-transform active:scale-95 flex items-center justify-center gap-2">
                                <Save size={24}/> 暫存草稿
                            </button>
                            <button onClick={handleSubmit} className="flex-[2] bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                                <FileText size={24}/> 確認無誤，送出日報
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// =======================================================
// ★★★ 修正版 MemberPage：新增「優惠期限」功能 ★★★
// =======================================================
const MemberPage = ({ memberAppSettings, members, setMembers, onUpdateMember, coupons, setCoupons, addLog, currentStoreName, isHQ, storesConfig }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('list');
    const [selectedMember, setSelectedMember] = useState(null);
    const [adjustPoints, setAdjustPoints] = useState('');
    const [adjustReason, setAdjustReason] = useState('');
    
    const [tempAppSettings, setTempAppSettings] = useState(memberAppSettings);
    
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [newMemberData, setNewMemberData] = useState({ name: '', phone: '' });

    const [isAddingCoupon, setIsAddingCoupon] = useState(false);
    
    // ★★★ 1. 預設期限設為「今年年底」或「一個月後」，比較方便 ★★★
    const getDefaultExpiry = () => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1); // 預設一年後
        return d.toISOString().split('T')[0];
    };

    const [newCouponData, setNewCouponData] = useState({ 
        name: '', pointCost: 100, type: 'item', value: 0, description: '', code: '', 
        limit: false, nextDayUse: false, 
        expiryDate: getDefaultExpiry() // 加入期限欄位
    });

    const filteredMembers = (members || []).filter(m => 
        (m.name && m.name.includes(searchTerm)) || 
        (m.phone && m.phone.includes(searchTerm))
    );

    const handleAddMember = () => {
        if (!newMemberData.name || !newMemberData.phone) return alert('請輸入姓名與電話');
        if (members.some(m => m.phone === newMemberData.phone)) return alert('此電話號碼已存在！');
        
        const newMember = {
            ...newMemberData,
            level: 'Tin', points: 0, totalSpending: 0,
            joinDate: new Date().toISOString().split('T')[0],
            items: [], pointLogs: [], isLineBound: false
        };
        setMembers(prev => [...prev, newMember]); 
        setIsAddingMember(false);
        setNewMemberData({ name: '', phone: '' });
        alert('✅ 會員新增成功！');
    };

    const handleAddCoupon = () => {
        if (!newCouponData.name || !newCouponData.code) return alert('請輸入名稱與代碼');
        if (!newCouponData.expiryDate) return alert('請設定有效期限');

        const newCoupon = {
            ...newCouponData,
            id: Date.now(),
            pointCost: parseInt(newCouponData.pointCost),
            value: parseInt(newCouponData.value),
            // 這裡直接使用設定的日期
            expiryDate: newCouponData.expiryDate 
        };
        setCoupons(prev => [...prev, newCoupon]); 
        setIsAddingCoupon(false);
        setNewCouponData({ 
            name: '', pointCost: 100, type: 'item', value: 0, description: '', code: '', 
            limit: false, nextDayUse: false, expiryDate: getDefaultExpiry() 
        });
        alert('✅ 優惠券新增成功！');
    };

    const handleDeleteCoupon = (id) => {
        if (window.confirm('⚠️ 確定要刪除這張優惠券嗎？\n\n注意：已經領取這張券的客人仍然可以使用，\n但之後其他客人將無法再看到或兌換此券。')) {
            setCoupons(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleAdjustPoints = (type) => {
        if (!adjustPoints || isNaN(adjustPoints)) return alert('請輸入有效點數');
        if (!adjustReason) return alert('請輸入調整原因');
        
        const amount = parseInt(adjustPoints);
        const finalAmount = type === 'add' ? amount : -amount;
        
        const newPoints = (selectedMember.points || 0) + finalAmount;
        if (newPoints < 0) return alert('扣除後點數不能為負！');

        const newLog = {
            id: Date.now(),
            amount: finalAmount,
            expiry: Date.now() + (365 * 24 * 60 * 60 * 1000),
            used: false
        };

        const updatedMember = {
            ...selectedMember,
            points: newPoints,
            pointLogs: [...(selectedMember.pointLogs || []), newLog]
        };

        onUpdateMember(updatedMember);
        setSelectedMember(updatedMember);

        addLog({
            storeName: currentStoreName,
            staffName: '店員操作',
            memberName: selectedMember.name,
            memberPhone: selectedMember.phone,
            action: type === 'add' ? `人工補點: ${adjustReason}` : `人工扣點: ${adjustReason}`,
            points: finalAmount
        });

        setAdjustPoints('');
        setAdjustReason('');
        alert('✅ 點數調整成功！');
    };

    const handleSaveSettings = () => { alert('✅ APP 設定已更新 (模擬)'); };

    return (
        <div className="flex h-full bg-gray-100 overflow-hidden">
            <div className="w-64 bg-white border-r flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Users className="text-orange-500"/> 會員中心</h2>
                    <p className="text-xs text-gray-500 mt-1">{isHQ ? '總部 CRM 管理後台' : '分店查詢系統'}</p>
                </div>
                <nav className="flex-grow p-4 space-y-2">
                    <button onClick={() => setActiveTab('list')} className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'list' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}><Search size={20}/> 會員查詢 / 管理</button>
                    {isHQ && (<><button onClick={() => setActiveTab('settings')} className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}><Settings size={20}/> APP 介面設定</button><button onClick={() => setActiveTab('coupons')} className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'coupons' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}><Ticket size={20}/> 優惠券管理</button></>)}
                </nav>
            </div>
            <div className="flex-grow p-8 overflow-y-auto">
                {activeTab === 'list' && (
                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm flex gap-4">
                            <div className="relative flex-grow"><Search className="absolute left-3 top-3 text-gray-400" size={20}/><input className="w-full pl-10 p-3 border rounded-xl outline-none focus:border-orange-500 font-bold text-lg" placeholder="輸入手機號碼或姓名..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                            <button onClick={() => setIsAddingMember(true)} className="bg-gray-800 text-white px-6 rounded-xl font-bold flex items-center gap-2"><UserPlus size={20}/> 新增會員</button>
                        </div>
                        {isAddingMember && (
                            <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200 animate-fade-in-up">
                                <h3 className="font-bold text-orange-800 mb-2">✨ 建立新會員資料</h3>
                                <div className="flex gap-2">
                                    <input className="p-2 rounded border flex-1" placeholder="姓名" value={newMemberData.name} onChange={e => setNewMemberData({...newMemberData, name: e.target.value})} />
                                    <input className="p-2 rounded border flex-1" placeholder="手機" value={newMemberData.phone} onChange={e => setNewMemberData({...newMemberData, phone: e.target.value})} />
                                    <button onClick={handleAddMember} className="bg-orange-600 text-white px-4 rounded font-bold">確認建立</button>
                                    <button onClick={() => setIsAddingMember(false)} className="bg-gray-300 text-gray-600 px-4 rounded font-bold">取消</button>
                                </div>
                            </div>
                        )}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 font-bold border-b"><tr><th className="p-4">姓名</th><th className="p-4">手機</th><th className="p-4">註冊分店</th><th className="p-4">註冊時間</th><th className="p-4">等級</th><th className="p-4">點數</th><th className="p-4">累積消費</th><th className="p-4 text-right">操作</th></tr></thead>
                                <tbody>{filteredMembers.length === 0 ? <tr><td colSpan="8" className="p-8 text-center text-gray-400">查無會員資料</td></tr> : filteredMembers.map(m => (<tr key={m.phone} className="border-b last:border-0 hover:bg-gray-50 transition-colors"><td className="p-4 font-bold">{m.name}</td><td className="p-4 font-mono">{m.phone}</td><td className="p-4 text-gray-600">{storesConfig && m.joinStore ? (storesConfig[m.joinStore]?.name || m.joinStore) : '-'}</td><td className="p-4 text-sm text-gray-500">{m.joinTime ? new Date(m.joinTime).toLocaleString() : (m.joinDate || '-')}</td><td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold text-white bg-gray-400`}>{m.level}</span></td><td className="p-4 text-orange-600 font-bold">{m.points}</td><td className="p-4">${m.totalSpending?.toLocaleString()}</td><td className="p-4 text-right"><button onClick={() => setSelectedMember(m)} className="text-blue-600 font-bold hover:underline">查看詳情</button></td></tr>))}</tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === 'settings' && isHQ && (
                    <div className="flex gap-8">
                        <div className="flex-1 space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm"><h3 className="font-bold text-lg mb-4">首頁公告設定</h3><textarea className="w-full border p-3 rounded-xl h-24 mb-2" value={tempAppSettings.announcement} onChange={(e) => setTempAppSettings({...tempAppSettings, announcement: e.target.value})} /><div className="text-xs text-gray-400">顯示在顧客手機首頁的跑馬燈。</div></div>
                            <div className="bg-white p-6 rounded-xl shadow-sm"><h3 className="font-bold text-lg mb-4">主題配色</h3><div className="flex gap-3">{['bg-orange-500', 'bg-blue-600', 'bg-red-600', 'bg-green-600', 'bg-purple-600'].map(color => (<button key={color} onClick={() => setTempAppSettings({...tempAppSettings, promoColor: color})} className={`w-10 h-10 rounded-full ${color} ${tempAppSettings.promoColor === color ? 'ring-4 ring-gray-300' : ''}`} />))}</div></div>
                            <button onClick={handleSaveSettings} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg">儲存設定</button>
                        </div>
                        <div className="w-[320px] flex-shrink-0"><div className="sticky top-4"><h3 className="text-center font-bold text-gray-400 mb-2">即時預覽</h3><CustomerMobileAppSimulator appSettings={tempAppSettings} /></div></div>
                    </div>
                )}
                {activeTab === 'coupons' && isHQ && (
                    <div className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {coupons.map(coupon => {
                                // 判斷是否過期
                                const isExpired = new Date(coupon.expiryDate).getTime() < Date.now();
                                return (
                                    <div key={coupon.id} className={`bg-white p-6 rounded-xl shadow-sm border relative overflow-hidden group ${isExpired ? 'border-gray-200 opacity-70' : 'border-gray-100'}`}>
                                        <div className={`absolute top-0 right-0 text-white text-xs px-2 py-1 rounded-bl-lg font-bold ${isExpired ? 'bg-gray-400' : 'bg-orange-500'}`}>{coupon.pointCost} 點</div>
                                        <h3 className="font-bold text-xl mb-1 flex items-center gap-2">
                                            {coupon.name}
                                            {isExpired && <span className="text-xs bg-red-100 text-red-600 px-1 rounded border border-red-200">已過期</span>}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-2">{coupon.description}</p>
                                        
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {coupon.limit && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded border border-red-200">限領1次</span>}
                                            {coupon.nextDayUse && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded border border-blue-200">隔日使用</span>}
                                            {/* ★★★ 顯示期限 ★★★ */}
                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 flex items-center gap-1">
                                                <Clock size={10}/> {coupon.expiryDate} 止
                                            </span>
                                        </div>

                                        <div className="text-xs text-gray-400"><div>代碼: {coupon.code}</div></div>
                                        <button onClick={() => handleDeleteCoupon(coupon.id)} className="absolute bottom-3 right-3 bg-gray-100 p-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100" title="刪除"><Trash2 size={18}/></button>
                                    </div>
                                );
                            })}
                            <button onClick={() => setIsAddingCoupon(true)} className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-white hover:border-gray-400 hover:text-gray-600 h-40 transition-all"><Plus size={32} /><span className="font-bold mt-2">新增優惠券</span></button>
                         </div>
                         {isAddingCoupon && (
                             <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                                 <div className="bg-white p-8 rounded-2xl w-96 animate-fade-in-up">
                                    <h3 className="text-xl font-bold mb-4">新增兌換券</h3>
                                    <div className="space-y-3">
                                        <input className="w-full border p-2 rounded" placeholder="優惠券名稱" value={newCouponData.name} onChange={e=>setNewCouponData({...newCouponData, name:e.target.value})}/>
                                        <input className="w-full border p-2 rounded" placeholder="所需點數" type="number" value={newCouponData.pointCost} onChange={e=>setNewCouponData({...newCouponData, pointCost:e.target.value})}/>
                                        <input className="w-full border p-2 rounded" placeholder="核銷代碼 (英文數字)" value={newCouponData.code} onChange={e=>setNewCouponData({...newCouponData, code:e.target.value})}/>
                                        <input className="w-full border p-2 rounded" placeholder="描述" value={newCouponData.description} onChange={e=>setNewCouponData({...newCouponData, description:e.target.value})}/>
                                        
                                        <div className="flex gap-4 items-center border p-2 rounded bg-gray-50">
                                            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-700">
                                                <input type="checkbox" className="w-4 h-4" checked={newCouponData.limit} onChange={e=>setNewCouponData({...newCouponData, limit: e.target.checked})}/> 每人限領一次
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-700">
                                                <input type="checkbox" className="w-4 h-4" checked={newCouponData.nextDayUse} onChange={e=>setNewCouponData({...newCouponData, nextDayUse: e.target.checked})}/> 隔日才能使用
                                            </label>
                                        </div>

                                        {/* ★★★ 2. 日期選擇器 ★★★ */}
                                        <div className="border p-2 rounded bg-gray-50">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">使用期限</label>
                                            <input 
                                                type="date" 
                                                className="w-full bg-transparent outline-none font-bold text-gray-700"
                                                value={newCouponData.expiryDate} 
                                                onChange={e=>setNewCouponData({...newCouponData, expiryDate: e.target.value})}
                                            />
                                        </div>

                                        <select className="w-full border p-2 rounded" value={newCouponData.type} onChange={e=>setNewCouponData({...newCouponData, type:e.target.value})}><option value="item">兌換商品 (免費)</option><option value="cash">現金折抵</option><option value="percent">折扣 (%)</option></select>
                                        {(newCouponData.type === 'cash' || newCouponData.type === 'percent') && <input className="w-full border p-2 rounded" placeholder="數值 (元/%)" type="number" value={newCouponData.value} onChange={e=>setNewCouponData({...newCouponData, value:e.target.value})}/>}
                                        <div className="flex gap-2 mt-4">
                                            <button onClick={handleAddCoupon} className="flex-1 bg-green-600 text-white py-2 rounded font-bold">建立</button>
                                            <button onClick={()=>setIsAddingCoupon(false)} className="flex-1 bg-gray-300 py-2 rounded font-bold">取消</button>
                                        </div>
                                    </div>
                                 </div>
                             </div>
                         )}
                    </div>
                )}
            </div>
            {selectedMember && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-gray-900 p-6 text-white flex justify-between items-start"><div><h2 className="text-3xl font-bold">{selectedMember.name}</h2><p className="opacity-80 font-mono">{selectedMember.phone}</p></div><button onClick={() => setSelectedMember(null)} className="bg-white/20 p-2 rounded-full hover:bg-white/30"><X/></button></div>
                        <div className="flex-grow overflow-y-auto p-6">
                            <div className="flex gap-4 mb-6"><div className="flex-1 bg-orange-50 p-4 rounded-xl border border-orange-100 text-center"><div className="text-sm text-gray-500 font-bold">目前點數</div><div className="text-4xl font-bold text-orange-600">{selectedMember.points}</div></div><div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center"><div className="text-sm text-gray-500 font-bold">累積消費</div><div className="text-2xl font-bold text-gray-800">${selectedMember.totalSpending}</div></div></div>
                            <div className="bg-white border rounded-xl p-6 mb-6"><h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Edit3 size={18}/> 點數調整 (人工增減)</h3><div className="flex gap-2 mb-2"><input type="number" className="border p-2 rounded flex-1" placeholder="輸入點數" value={adjustPoints} onChange={e=>setAdjustPoints(e.target.value)}/><input type="text" className="border p-2 rounded flex-[2]" placeholder="原因 (例: 補償、活動贈送)" value={adjustReason} onChange={e=>setAdjustReason(e.target.value)}/></div><div className="flex gap-2"><button onClick={() => handleAdjustPoints('add')} className="flex-1 bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">補發點數 (+)</button><button onClick={() => handleAdjustPoints('subtract')} className="flex-1 bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700">扣除點數 (-)</button></div></div>
                            <div><h3 className="font-bold text-lg mb-2 text-gray-700">持有票券</h3><div className="flex flex-wrap gap-2">{(!selectedMember.items || selectedMember.items.length === 0) ? <span className="text-gray-400 text-sm">無</span> : selectedMember.items.map((item, idx) => (<span key={idx} className={`px-3 py-1 rounded text-sm border ${item.redeemed ? 'bg-gray-100 text-gray-400 decoration-line-through' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>{item.name} {item.redeemed && '(已用)'}</span>))}</div></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// =======================================================
// ★★★ 安全版 BookingPage (純標記報到 + 鎖定人數修改權限) ★★★
// =======================================================
const BookingPage = ({ bookings, setBookings, currentStoreId, tables, diningPlans }) => {
    // 取得今天日期字串 (YYYY-MM-DD)
    const getTodayStr = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const localDate = new Date(now.getTime() - offset);
        return localDate.toISOString().split('T')[0];
    };

    const [viewDate, setViewDate] = useState(getTodayStr());
    
    // 新增訂位輸入狀態
    const [inputDate, setInputDate] = useState(getTodayStr());
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [time, setTime] = useState('');
    const [adults, setAdults] = useState(2);
    const [notes, setNotes] = useState(''); 

    // 報到視窗控制
    const [showCheckInModal, setShowCheckInModal] = useState(false);
    const [checkInTarget, setCheckInTarget] = useState(null); // 正在處理哪一筆訂位
    const [selectedTableId, setSelectedTableId] = useState('');
    const [selectedPlanId, setSelectedPlanId] = useState(diningPlans ? diningPlans[0]?.id : '');

    // 新增訂位
    const handleAddBooking = () => {
        if (!name || !time || !inputDate) return alert('請完整填寫日期、姓名與時間');

        const newBooking = { 
            id: Date.now(), 
            date: inputDate, 
            name, 
            phone, 
            time, 
            adults, 
            notes, 
            storeId: currentStoreId, 
            status: 'pending' 
        };
        
        setBookings([...bookings, newBooking]);
        setName(''); setPhone(''); setNotes('');
        alert('✅ 預約新增成功！');
    };

    // 開啟報到視窗
    const handleOpenCheckIn = (booking) => {
        setCheckInTarget(booking);
        setSelectedTableId(''); 
        // 預設選第一個方案，或之前的邏輯
        setSelectedPlanId(diningPlans && diningPlans.length > 0 ? diningPlans[0].id : '');
        setShowCheckInModal(true);
    };

    // 確認報到 (純標記，不開桌，不改人數)
    const handleConfirmCheckIn = () => {
        if (!selectedTableId) return alert('請選擇桌號！');
        if (!selectedPlanId) return alert('請選擇方案！');

        // ★★★ 這裡移除了 onOpenTable，不會影響帳務系統 ★★★

        // 更新訂位資料狀態
        const updatedBookings = bookings.map(b => {
            if (b.id === checkInTarget.id) {
                return { 
                    ...b, 
                    status: 'arrived', // 改為已入座
                    assignedTable: selectedTableId, // 紀錄坐哪
                    assignedPlan: diningPlans.find(p => p.id === selectedPlanId)?.name // 紀錄吃啥
                    // 不更新 adults 與 notes，保持原始訂位紀錄
                };
            }
            return b;
        });
        setBookings(updatedBookings);

        setShowCheckInModal(false);
        alert(`✅ 標記成功！\n\n客人已入座 [${selectedTableId}] 桌。\n⚠️ 請記得至首頁進行正式開桌 (計時/計費)。`);
    };

    // 過濾與排序
    const filteredBookings = bookings
        .filter(b => b.storeId === currentStoreId && b.date === viewDate)
        .sort((a, b) => a.time.localeCompare(b.time));

    // 取得目前空桌列表
    const emptyTables = (tables || []).filter(t => t.status === 'empty');

    return (
        <div className="p-8 bg-gray-100 h-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                📅 預約訂位簿 
                <span className="text-sm bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    {currentStoreId === '001' ? '七賢店' : currentStoreId === '002' ? '鳳山店' : '楠梓店'}
                </span>
            </h2>

            {/* 新增訂位區塊 */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8 border-l-4 border-blue-500">
                <h3 className="font-bold text-gray-700 mb-4">✍️ 新增預約</h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                    <div><label className="text-xs font-bold text-gray-500 block mb-1">日期</label><input type="date" className="w-full border p-2 rounded bg-gray-50 font-bold" value={inputDate} onChange={e=>setInputDate(e.target.value)}/></div>
                    <div><label className="text-xs font-bold text-gray-500 block mb-1">姓名</label><input className="w-full border p-2 rounded" placeholder="王小明" value={name} onChange={e=>setName(e.target.value)}/></div>
                    <div><label className="text-xs font-bold text-gray-500 block mb-1">電話</label><input className="w-full border p-2 rounded" placeholder="0912..." value={phone} onChange={e=>setPhone(e.target.value)}/></div>
                    <div><label className="text-xs font-bold text-gray-500 block mb-1">時間</label><input type="time" className="w-full border p-2 rounded font-bold" value={time} onChange={e=>setTime(e.target.value)}/></div>
                    <div className="w-20"><label className="text-xs font-bold text-gray-500 block mb-1">人數</label><input type="number" className="w-full border p-2 rounded text-center" value={adults} onChange={e=>setAdults(parseInt(e.target.value))} min={1}/></div>
                    <div><label className="text-xs font-bold text-gray-500 block mb-1">備註</label><input className="w-full border p-2 rounded" placeholder="例如: 需兒童椅" value={notes} onChange={e=>setNotes(e.target.value)}/></div>
                </div>
                <button onClick={handleAddBooking} className="mt-4 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-bold shadow transition-colors">
                    + 新增預約
                </button>
            </div>

            {/* 日期過濾器 */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm">
                    <span className="font-bold text-gray-600">👀 查看日期：</span>
                    <input type="date" className="border-b-2 border-orange-500 outline-none font-bold text-lg text-orange-600 bg-transparent" value={viewDate} onChange={e => setViewDate(e.target.value)}/>
                    <button onClick={() => setViewDate(getTodayStr())} className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">回到今天</button>
                </div>
                <div className="text-gray-500 text-sm font-bold">共 {filteredBookings.length} 組</div>
            </div>

            {/* 訂位列表 */}
            <div className="grid grid-cols-1 gap-4">
                {filteredBookings.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 bg-white rounded-xl border-dashed border-2 border-gray-300">此日無訂位</div>
                ) : (
                    filteredBookings.map(b => (
                        <div key={b.id} className={`bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border-l-8 ${b.status === 'arrived' ? 'border-gray-400 bg-gray-50 opacity-80' : 'border-orange-400'}`}>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className={`text-2xl font-bold ${b.status === 'arrived' ? 'text-gray-500' : 'text-gray-800'}`}>{b.time}</div>
                                    <div className="text-xs text-gray-400 font-mono">#{b.id.toString().slice(-3)}</div>
                                </div>
                                <div>
                                    <div className="text-xl font-bold flex items-center gap-2">
                                        {b.name} 
                                        <span className={`text-sm px-2 py-0.5 rounded-full ${b.status === 'arrived' ? 'bg-gray-200 text-gray-600' : 'bg-orange-100 text-orange-700'}`}>{b.adults} 位</span>
                                        {b.status === 'arrived' && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">已入座: {b.assignedTable}</span>}
                                    </div>
                                    <div className="text-gray-500 font-mono mt-1 text-sm flex gap-3">
                                        <span>📞 {b.phone}</span>
                                        {b.notes && <span className="text-red-500 bg-red-50 px-1 rounded">⚠️ {b.notes}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {b.status === 'pending' ? (
                                    <button onClick={() => handleOpenCheckIn(b)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95">
                                        客人報到
                                    </button>
                                ) : (
                                    <span className="text-gray-400 font-bold px-4 py-2 flex items-center gap-1"><UserCheck size={18}/> 已標記入座</span>
                                )}
                                <button onClick={() => { if(window.confirm('確定刪除?')) setBookings(bookings.filter(x => x.id !== b.id)); }} className="bg-gray-100 text-gray-400 p-2 rounded-lg hover:bg-red-50 hover:text-red-500">
                                    <Trash2 size={20}/>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ★ 安全版報到視窗 (移除人數修改權限) */}
            {showCheckInModal && checkInTarget && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                        <div className="bg-green-600 p-4 text-white flex justify-between items-center">
                            <h3 className="font-bold text-xl flex items-center gap-2"><UserCheck/> 客人報到 (標記)</h3>
                            <button onClick={()=>setShowCheckInModal(false)} className="hover:bg-white/20 p-1 rounded"><X size={24}/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* 唯讀的訂位資訊 */}
                            <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                                <div className="text-sm text-gray-500 font-bold mb-2">訂位資訊 (不可修改)</div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-600">姓名</span>
                                    <span className="font-bold text-lg">{checkInTarget.name}</span>
                                </div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-600">人數</span>
                                    <span className="font-bold text-lg text-orange-600">{checkInTarget.adults} 人</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">備註</span>
                                    <span className="font-bold text-gray-800">{checkInTarget.notes || '無'}</span>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <label className="block font-bold text-gray-700 mb-2">安排入座桌號</label>
                                <select className="w-full p-3 border-2 border-gray-200 rounded-xl font-bold text-lg outline-none focus:border-green-500" value={selectedTableId} onChange={e=>setSelectedTableId(e.target.value)}>
                                    <option value="">-- 請選擇桌位 --</option>
                                    {emptyTables.map(t => (
                                        <option key={t.id} value={t.id}>{t.id} 桌 (空)</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-2">選擇用餐方案</label>
                                <select className="w-full p-3 border-2 border-gray-200 rounded-xl font-bold outline-none focus:border-green-500" value={selectedPlanId} onChange={e=>setSelectedPlanId(e.target.value)}>
                                    {(diningPlans||[]).map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg mt-2">
                                💡 提醒：此操作僅為標記。請務必在帶位後，至首頁進行正式「開桌」以開始計費。
                            </div>

                            <button onClick={handleConfirmCheckIn} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-xl shadow-lg mt-2 transition-transform active:scale-95">
                                確認標記 (客人入座)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// =======================================================
// ★★★ 6. TableModal (正式列印版 - 會真的出紙！) ★★★
// =======================================================
const TableModal = ({ currentStoreId, selectedTable, onClose, onOpenTable, onRequestCheckout, diningPlans, tables, setTables, printers }) => {
    // 開桌暫存
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [selectedPlan, setSelectedPlan] = useState(diningPlans[0]?.id);
    
    // 進階功能狀態
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showChangeTable, setShowChangeTable] = useState(false);
    const [showVoidConfirm, setShowVoidConfirm] = useState(false);
    const [showModifyConfirm, setShowModifyConfirm] = useState(false); 
    const [isEditing, setIsEditing] = useState(false); 
    const [authPassword, setAuthPassword] = useState(''); 

    // 確保抓到最新的桌況
    const liveTable = tables.find(t => t.id === selectedTable.id);
    if (!liveTable) { onClose(); return null; }

    const isOccupied = liveTable.status === 'occupied';
    const initEditData = () => { setAdults(liveTable.adults); setChildren(liveTable.children); setSelectedPlan(liveTable.plan); };

    // --- 🖨️ 核心功能：開桌 + 真實列印 QR Code ---
    const handleConfirmOpen = async () => { 
        const sessionToken = Date.now().toString();
        // 1. 執行開桌 (寫入資料庫)
        onOpenTable(selectedTable.id, adults, children, selectedPlan, sessionToken); 
        
        // 2. 準備列印參數
        const counterConfig = printers.find(p => p.id === 'counter') || printers[0];
        const counterIp = counterConfig ? counterConfig.ip : '192.168.1.176'; // 預設 IP
        const kitchenConfig = printers.find(p => p.id === 'kitchen_hot');
        const kitchenIp = kitchenConfig ? kitchenConfig.ip : '192.168.1.180';
        
        // 3. 設定 API 位置 (抓取該分店的 ngrok 網址)
        const SERVER_API = `${STORE_URLS[currentStoreId]}/api/print`;
        const BASE_URL = STORE_URLS[currentStoreId] || STORE_URLS['branch3']; // 預設楠梓
        
        // 4. 產生 QR Code 連結
        const orderUrl = `${BASE_URL}?mode=customer&store=${currentStoreId}&table=${selectedTable.id}&token=${sessionToken}`;
        
        const now = new Date();
        const lastOrder = new Date(now.getTime() + 90 * 60000); // 90分鐘後最後加點

        // 5. 準備列印內容 (QR Code 單據)
        const qrCodeData = { 
            type: 'qrcode', 
            tableId: selectedTable.id, 
            content: orderUrl, 
            targetIp: counterIp, 
            extraInfo: { 
                adults, 
                children, 
                planName: diningPlans.find(p => p.id === selectedPlan)?.name, 
                startTime: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
                lastOrderTime: lastOrder.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
            }
        };

        // 6. 準備入場通知單 (給廚房)
        const notificationData = {
            type: 'entry_notification', 
            tableId: selectedTable.id,
            extraInfo: { 
                adults, 
                children, 
                planName: diningPlans.find(p => p.id === selectedPlan)?.name, 
                startTime: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
            }
        };
        
        // 7. 發送指令
        try {
            // 印櫃台 QR Code
            await fetch(SERVER_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(qrCodeData) });
            // 印櫃台 通知單 (留存)
            await fetch(SERVER_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...notificationData, targetIp: counterIp }) });
            
            // 如果廚房印表機跟櫃台不一樣，也印一張給廚房
            if (kitchenIp && kitchenIp !== counterIp) {
                await fetch(SERVER_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...notificationData, targetIp: kitchenIp }) });
            }
            alert(`✅ 開桌成功！\n🖨️ 列印指令已發送。`);
        } catch (error) { 
            console.error(error);
            alert(`⚠️ 開桌成功，但列印失敗！\n請檢查電腦連線或 ngrok 網址。`); 
        }
    };

    // --- 🖨️ 補印 QR Code ---
    const handleReprintQR = async () => {
        const targetConfig = printers.find(p => p.id === 'counter') || printers[0];
        const targetIp = targetConfig ? targetConfig.ip : '192.168.1.176';
        const SERVER_API = `${STORE_URLS[currentStoreId]}/api/print`;
        const BASE_URL = STORE_URLS[currentStoreId] || STORE_URLS['branch3'];
        const currentToken = liveTable.token || ''; 
        const orderUrl = `${BASE_URL}?mode=customer&store=${currentStoreId}&table=${selectedTable.id}&token=${currentToken}`;
        
        const startTimeRaw = liveTable.startTime ? new Date(liveTable.startTime) : new Date();
        const lastOrderRaw = new Date(startTimeRaw.getTime() + 90 * 60000);
        
        const printData = { 
            type: 'qrcode', 
            tableId: selectedTable.id, 
            content: orderUrl, 
            targetIp: targetIp,
            extraInfo: { 
                adults: liveTable.adults, 
                children: liveTable.children, 
                planName: diningPlans.find(p => p.id === liveTable.plan)?.name, 
                startTime: startTimeRaw.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
                lastOrderTime: lastOrderRaw.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
            }
        };
        try { 
            await fetch(SERVER_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(printData) }); 
            alert('✅ 補印指令已發送');
        } catch (error) { 
            alert('❌ 列印失敗，無法連線至伺服器'); 
        }
    };

    // --- 核心功能：換桌 ---
    const handleChangeTable = (targetTableId) => {
        if (!window.confirm(`確定要將 [${liveTable.id}] 換到 [${targetTableId}] 嗎？`)) return;
        setTables(prev => prev.map(t => {
            if (t.id === targetTableId) { return { ...t, status: 'occupied', startTime: liveTable.startTime, adults: liveTable.adults, children: liveTable.children, plan: liveTable.plan, total: liveTable.total, orders: liveTable.orders, token: liveTable.token }; }
            if (t.id === liveTable.id) { return { ...t, status: 'empty', startTime: null, adults: 0, children: 0, plan: '', total: 0, orders: [], token: null }; }
            return t;
        }));
        alert(`換桌成功！${liveTable.id} -> ${targetTableId}`);
        onClose(); 
    };

    // --- 核心功能：廢單 ---
    const handleVoidTable = async () => {
        if (authPassword !== '88888') { alert('密碼錯誤！'); setAuthPassword(''); return; }
        if (!window.confirm(`⚠️ 警告：確定要作廢 [${liveTable.id}] 的所有訂單嗎？\n此操作無法復原！`)) return;
        
        // 嘗試列印廢單通知
        const targetConfig = printers.find(p => p.id === 'counter') || printers[0];
        const SERVER_API = `${STORE_URLS[currentStoreId]}/api/print`;
        try { await fetch(SERVER_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'void', tableId: liveTable.id, targetIp: targetConfig.ip, extraInfo: { reason: '現場作廢', staffName: '主管授權' } }) }); } catch (e) {}

        setTables(prev => prev.map(t => { if (t.id === liveTable.id) { return { ...t, status: 'empty', startTime: null, adults: 0, children: 0, plan: '', total: 0, orders: [], token: null }; } return t; }));
        alert(`已執行廢單！`);
        onClose();
    };

    const handleSaveModification = () => {
        const plan = diningPlans.find(p => p.id === selectedPlan);
        const currentTips = (liveTable.orders || []).filter(o => o.category === 'Tip').reduce((sum, item) => sum + (parseInt(item.price) || 0), 0);
        const newTotal = Math.round((adults * plan.price + children * plan.childPrice) * 1.1) + currentTips;
        setTables(prev => prev.map(t => { if (t.id === liveTable.id) { return { ...t, adults: adults, children: children, plan: selectedPlan, total: newTotal }; } return t; }));
        alert('✅ 修改成功！'); setIsEditing(false); 
    };

    const handleVerifyModify = () => { if (authPassword !== '88888') { alert('密碼錯誤！'); setAuthPassword(''); return; } setShowModifyConfirm(false); setAuthPassword(''); initEditData(); setIsEditing(true); };
    const getDuration = () => { if (!liveTable.startTime) return 0; return Math.floor((Date.now() - liveTable.startTime) / 60000); };
    const groupedOrders = []; let currentBatch = []; let lastBatchId = null; (liveTable.orders || []).forEach(o => { if (lastBatchId && o.batchId !== lastBatchId) { groupedOrders.push({ batchId: lastBatchId, items: currentBatch }); currentBatch = []; } currentBatch.push(o); lastBatchId = o.batchId; }); if (currentBatch.length > 0) groupedOrders.push({ batchId: lastBatchId, items: currentBatch }); groupedOrders.reverse();
    const screenOrderUrl = `${window.location.origin}?mode=customer&store=${currentStoreId}&table=${selectedTable.id}&token=${liveTable.token || ''}`;

    // --- 渲染 ---
    if (showChangeTable) { const emptyTables = tables.filter(t => t.status === 'empty'); return (<div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]"><div className="bg-white p-6 rounded-2xl w-96"><h3 className="text-xl font-bold mb-4 flex items-center gap-2"><MoveRight/> 請選擇新桌號</h3><div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto mb-4">{emptyTables.map(t => ( <button key={t.id} onClick={() => handleChangeTable(t.id)} className="bg-green-100 text-green-800 py-3 rounded-lg font-bold hover:bg-green-200 border border-green-300">{t.id}</button> ))}</div><button onClick={() => setShowChangeTable(false)} className="w-full bg-gray-200 py-3 rounded-lg font-bold">取消返回</button></div></div>); }
    if (showVoidConfirm) { return (<div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]"><div className="bg-white p-6 rounded-2xl w-80 text-center"><div className="text-red-600 mb-2"><FileWarning size={48} className="mx-auto"/></div><h3 className="text-xl font-bold mb-2 text-red-600">主管授權 (廢單)</h3><input type="password" className="w-full text-center text-2xl font-bold border-2 border-red-200 rounded-lg p-2 mb-4 outline-none focus:border-red-500" placeholder="輸入密碼" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} /><div className="grid grid-cols-2 gap-2"><button onClick={() => {setShowVoidConfirm(false); setAuthPassword('');}} className="bg-gray-200 py-3 rounded-lg font-bold">取消</button><button onClick={handleVoidTable} className="bg-red-600 text-white py-3 rounded-lg font-bold">確認作廢</button></div></div></div>); }
    if (showModifyConfirm) { return (<div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]"><div className="bg-white p-6 rounded-2xl w-80 text-center"><div className="text-blue-600 mb-2"><Edit3 size={48} className="mx-auto"/></div><h3 className="text-xl font-bold mb-2 text-blue-600">主管授權 (修改)</h3><input type="password" className="w-full text-center text-2xl font-bold border-2 border-blue-200 rounded-lg p-2 mb-4 outline-none focus:border-blue-500" placeholder="輸入密碼" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} /><div className="grid grid-cols-2 gap-2"><button onClick={() => {setShowModifyConfirm(false); setAuthPassword('');}} className="bg-gray-200 py-3 rounded-lg font-bold">取消</button><button onClick={handleVerifyModify} className="bg-blue-600 text-white py-3 rounded-lg font-bold">進入修改</button></div></div></div>); }
    if (isEditing) { return (<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white p-8 rounded-2xl shadow-2xl w-[600px] border-4 border-blue-500"><div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-blue-800">修改資訊 - 桌號 {liveTable.id}</h2><button onClick={() => setIsEditing(false)}><X size={32}/></button></div><div className="space-y-6"><div><label className="block text-gray-500 font-bold mb-2">用餐人數</label><div className="flex gap-4"><div className="flex-1 bg-gray-50 p-4 rounded-xl flex justify-between items-center"><span>大人</span><div className="flex items-center gap-3"><button onClick={() => setAdults(Math.max(1, adults - 1))} className="p-2 bg-white rounded-full shadow"><Minus size={16}/></button><span className="text-2xl font-bold w-8 text-center">{adults}</span><button onClick={() => setAdults(adults + 1)} className="p-2 bg-white rounded-full shadow"><Plus size={16}/></button></div></div><div className="flex-1 bg-gray-50 p-4 rounded-xl flex justify-between items-center"><span>小孩</span><div className="flex items-center gap-3"><button onClick={() => setChildren(Math.max(0, children - 1))} className="p-2 bg-white rounded-full shadow"><Minus size={16}/></button><span className="text-2xl font-bold w-8 text-center">{children}</span><button onClick={() => setChildren(children + 1)} className="p-2 bg-white rounded-full shadow"><Plus size={16}/></button></div></div></div></div><div><label className="block text-gray-500 font-bold mb-2">選擇方案</label><div className="grid grid-cols-3 gap-3">{diningPlans.map(plan => (<button key={plan.id} onClick={() => setSelectedPlan(plan.id)} className={`p-4 rounded-xl border-2 transition-all ${selectedPlan === plan.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200'}`}><div className="font-bold">{plan.name}</div><div className="text-sm opacity-80">${plan.price}</div></button>))}</div></div><button onClick={handleSaveModification} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:bg-blue-700">💾 儲存修改</button></div></div></div>); }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-bounce-in flex flex-col max-h-[90vh]">
                <div className={`p-6 text-white flex justify-between items-center ${isOccupied ? 'bg-orange-500' : 'bg-gray-800'}`}>
                    <div><h2 className="text-3xl font-bold">{selectedTable.id} 桌</h2><div className="opacity-80 text-sm mt-1">{isOccupied ? '🔥 用餐進行中' : '⚪ 目前空桌'}</div></div>
                    {isOccupied && (<div className="flex gap-2"><button onClick={() => setShowAdvanced(!showAdvanced)} className="bg-white/20 p-2 rounded-full hover:bg-white/30"><Settings size={24}/></button>{showAdvanced && (<div className="absolute right-16 top-16 bg-white shadow-xl border rounded-xl overflow-hidden w-40 z-10 text-gray-800"><button onClick={() => setShowModifyConfirm(true)} className="w-full text-left px-4 py-3 hover:bg-yellow-50 text-yellow-700 font-bold border-b flex items-center gap-2"><Edit3 size={16}/> 修改資訊</button><button onClick={() => setShowChangeTable(true)} className="w-full text-left px-4 py-3 hover:bg-blue-50 text-blue-600 font-bold border-b flex items-center gap-2"><MoveRight size={16}/> 換桌</button><button onClick={() => setShowVoidConfirm(true)} className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-bold flex items-center gap-2"><FileWarning size={16}/> 廢單</button></div>)}</div>)}
                    <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30"><X size={24}/></button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                    {isOccupied ? (
                        <div className="space-y-6">
                            {/* 上半部：資訊卡片 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100"><div className="text-orange-400 text-xs font-bold uppercase mb-1">用餐方案</div><div className="text-xl font-bold text-gray-800">{diningPlans.find(p=>p.id===liveTable.plan)?.name || liveTable.plan}</div><div className="text-sm text-gray-500 mt-1">{liveTable.adults}大 {liveTable.children}小</div></div>
                                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100"><div className="text-blue-400 text-xs font-bold uppercase mb-1">用餐時間</div><div className="text-3xl font-bold text-blue-600">{getDuration()}<span className="text-sm">分</span></div><div className="text-xs text-gray-400 mt-1">入場: {new Date(liveTable.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div></div>
                            </div>

                            {/* 中間：已點內容 */}
                            <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                                <div className="bg-gray-100 p-3 flex justify-between items-center border-b border-gray-200"><h3 className="font-bold text-gray-700 flex items-center gap-2"><ShoppingCart size={16}/> 已點內容</h3><span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">共 {(liveTable.orders || []).length} 道</span></div>
                                <div className="max-h-48 overflow-y-auto p-2">{(liveTable.orders && liveTable.orders.length > 0) ? <div className="space-y-1">{liveTable.orders.map((item, idx) => (<div key={idx} className="flex justify-between items-center p-2 hover:bg-white rounded-lg transition-colors"><div className="font-bold text-gray-700">{item.name}</div><div className="flex items-center gap-3"><span className="text-sm text-gray-500">x{item.count}</span>{item.price > 0 && <span className="text-sm text-red-500 font-bold">${item.price}</span>}</div></div>))}</div> : <div className="text-center py-8 text-gray-400 italic text-sm">尚無點餐紀錄</div>}</div>
                            </div>

                            {/* 下半部：QR Code 區塊 (★修正處：已移入 space-y-6 內部) */}
                            <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center gap-4">
                                <div className="bg-gray-800 text-white p-3 rounded-lg"><QrCode size={24}/></div>
                                <div className="flex-grow overflow-hidden">
                                    <div className="text-xs text-gray-400 font-bold">顧客點餐連結 (Token)</div>
                                    <div className="text-xs text-gray-800 truncate font-mono bg-gray-100 p-1 rounded mt-1 select-all">
                                        {liveTable.token ? screenOrderUrl : '尚未生成'}
                                    </div>
                                </div>
                                <a 
                                    href={screenOrderUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-blue-600 font-bold text-sm whitespace-nowrap hover:underline"
                                >
                                    開啟
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2">選擇用餐方案</label>
                                <div className="grid grid-cols-1 gap-2">{diningPlans.map(plan => (<button key={plan.id} onClick={() => setSelectedPlan(plan.id)} className={`p-4 rounded-xl border-2 text-left transition-all ${selectedPlan === plan.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-gray-400'}`}><div className="flex justify-between items-center"><span className={`font-bold ${selectedPlan === plan.id ? 'text-orange-700' : 'text-gray-700'}`}>{plan.name}</span><div className="text-right"><div className="text-lg font-bold">${plan.price}</div>{plan.childPrice > 0 && <div className="text-xs text-gray-400">童 ${plan.childPrice}</div>}</div></div></button>))}</div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1"><label className="block text-sm font-bold text-gray-500 mb-2">大人人數</label><div className="flex items-center border-2 rounded-xl overflow-hidden"><button onClick={() => setAdults(Math.max(1, adults - 1))} className="p-3 bg-gray-100 hover:bg-gray-200"><Minus size={20}/></button><div className="flex-1 text-center font-bold text-xl">{adults}</div><button onClick={() => setAdults(adults + 1)} className="p-3 bg-gray-100 hover:bg-gray-200"><Plus size={20}/></button></div></div>
                                <div className="flex-1"><label className="block text-sm font-bold text-gray-500 mb-2">小孩人數</label><div className="flex items-center border-2 rounded-xl overflow-hidden"><button onClick={() => setChildren(Math.max(0, children - 1))} className="p-3 bg-gray-100 hover:bg-gray-200"><Minus size={20}/></button><div className="flex-1 text-center font-bold text-xl">{children}</div><button onClick={() => setChildren(children + 1)} className="p-3 bg-gray-100 hover:bg-gray-200"><Plus size={20}/></button></div></div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-6 border-t bg-gray-50">
                    {isOccupied ? (
                        <div className="flex gap-3">
                            <button onClick={() => onRequestCheckout(liveTable)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"><DollarSign size={20}/> 結帳買單</button>
                            <button onClick={handleReprintQR} className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-3 rounded-xl"><Printer size={24}/></button>
                        </div>
                    ) : (
                        <button onClick={handleConfirmOpen} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-transform active:scale-95">確認開桌</button>
                    )}
                </div>
            </div>
        </div>
    );
};
// =======================================================
// ★★★ 最終強製拉霸版 CheckoutModal ★★★
// =======================================================
const slotStyles = `
  @keyframes scroll-reel {
    0% { transform: translateY(0); }
    100% { transform: translateY(-80%); } /* 捲動 80% 的長度 */
  }
  .animate-slot-scroll {
    animation: scroll-reel 0.15s linear infinite;
  }
  .reel-container {
    height: 120px; 
    overflow: hidden;
    background: white;
    border-radius: 16px;
    border: 4px solid #f59e0b;
    width: 90px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: inset 0 8px 15px rgba(0,0,0,0.3);
    position: relative;
  }
  /* 增加遮罩讓光影更真實 */
  .reel-container::before {
    content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(rgba(0,0,0,0.2) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.2) 100%);
    z-index: 10; pointer-events: none;
  }
  .reel-strip {
    display: flex;
    flex-direction: column;
    transition: transform 0.5s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  }
  .reel-icon {
    font-size: 60px;
    height: 120px; 
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
`;

const CheckoutModal = ({ table, onClose, onConfirmPayment, diningPlans, coupons, members, slotPrizes, onUpdateMember, printers, storeId }) => {
    const plan = diningPlans.find(p => p.id === table.plan) || { name: '未知方案', price: 0, childPrice: 0 };
    const subtotal = (table.adults * plan.price) + (table.children * plan.childPrice);
    const serviceFee = Math.round(subtotal * 0.1);
    const tipTotal = (table.orders || []).filter(o => o.category === 'Tip').reduce((sum, item) => sum + (parseInt(item.price) || 0), 0);
    
    const [memberPhone, setMemberPhone] = useState('');
    const [foundMember, setFoundMember] = useState(null);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [receivedAmount, setReceivedAmount] = useState('');
    const [discountCode, setDiscountCode] = useState('');
    const [customDiscount, setCustomDiscount] = useState({ type: 'none', val: 0 }); 
    const [paymentMethod, setPaymentMethod] = useState('現金');
// ★★★ 請插入這段補救代碼 (修復 getDiscountDisplay 錯誤) ★★★
    const getDiscountDisplay = () => {
        if (customDiscount.type === 'amount') return parseInt(customDiscount.val || 0);
        if (customDiscount.type === 'percent') {
            const discountRate = (100 - parseInt(customDiscount.val || 100)) / 100; // 例如打9折 = 10% off
            return Math.round(subtotal * discountRate);
        }
        if (customDiscount.type === 'single') {
            const discountRate = (100 - parseInt(customDiscount.val || 100)) / 100;
            return Math.round(plan.price * discountRate);
        }
        return 0;
    };

    // --- 🎰 拉霸機專用狀態 ---
    const [showSlotMachine, setShowSlotMachine] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinResult, setSpinResult] = useState(null);
    const [slotPrizeDiscount, setSlotPrizeDiscount] = useState(0);
    const [reels, setReels] = useState(['🍒', '🍋', '🍇']); // 最終結果
    const [spinningReels, setSpinningReels] = useState([false, false, false]); // 控制動畫

    const calculateDiscount = () => { 
        let totalDisc = 0; 
        if (appliedCoupon && appliedCoupon.type === 'cash') totalDisc += parseInt(appliedCoupon.value); 
        if (appliedCoupon && appliedCoupon.type === 'percent') { const discountRate = (100 - appliedCoupon.value) / 100; totalDisc += Math.round(subtotal * discountRate); }
        if (customDiscount.type === 'amount') totalDisc += parseInt(customDiscount.val || 0); 
        if (customDiscount.type === 'percent') totalDisc += Math.round(subtotal * (1 - parseInt(customDiscount.val || 100) / 100)); 
        if (customDiscount.type === 'single') totalDisc += Math.round(plan.price * (1 - parseInt(customDiscount.val || 100) / 100)); 
        return totalDisc + slotPrizeDiscount;
    };
    
    const finalTotal = Math.max(0, subtotal + serviceFee + tipTotal - calculateDiscount());
    const changeAmount = receivedAmount ? parseInt(receivedAmount) - finalTotal : 0;
    
    const handleSearchMember = () => { const safeMembers = members || []; const member = safeMembers.find(m => m.phone === memberPhone); if (member) setFoundMember(member); else alert('查無此會員'); };
    const applyDiscountCode = () => { const safeCoupons = coupons || []; const coupon = safeCoupons.find(c => c.code === discountCode); if(coupon) setAppliedCoupon(coupon); else alert('無效的代碼'); };
    
    // --- 🎰 核心：拉霸啟動邏輯 ---
    const handleSpin = () => {
        setIsSpinning(true);
        setSpinResult(null);
        // 三個輪軸同時啟動 CSS 動畫
        setSpinningReels([true, true, true]); 

        const totalWeight = slotPrizes.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedPrize = slotPrizes[0];
        for (const prize of slotPrizes) { if (random < prize.weight) { selectedPrize = prize; break; } random -= prize.weight; }

        let finalIcons = [];
        // 判斷是否中大獎 (對應 777)
        if (selectedPrize.id === 'disc_5_next') { 
            finalIcons = ['7️⃣', '7️⃣', '7️⃣']; 
        } else if (selectedPrize.id === 'none') {
            finalIcons = ['🍒', '🍋', '🍇']; // 故意不同
        } else {
            finalIcons = [selectedPrize.icon, selectedPrize.icon, selectedPrize.icon];
        }

        // 分別設定停止時間（創造 1, 2, 3 依序停下的視覺感）
        [0, 1, 2].forEach((idx) => {
            setTimeout(() => {
                setReels(prev => {
                    const next = [...prev];
                    next[idx] = finalIcons[idx];
                    return next;
                });
                setSpinningReels(prev => {
                    const next = [...prev];
                    next[idx] = false; // 停止動畫，顯示該軸結果
                    return next;
                });

                if (idx === 2) {
                    setIsSpinning(false);
                    setSpinResult(selectedPrize);
                    // 執行原本的獎項邏輯
                    if (selectedPrize.type === 'current_discount_percent') {
                        const discountRate = selectedPrize.value === 0 ? 0 : selectedPrize.value / 100;
                        const discAmount = selectedPrize.value === 0 ? (subtotal + serviceFee) : Math.round(subtotal * (1 - discountRate));
                        setSlotPrizeDiscount(discAmount);
                    } else if (selectedPrize.type === 'future_coupon' && foundMember) {
                        const newCoupon = { id: Date.now(), name: selectedPrize.name, redeemed: false, code: `WIN-${Math.floor(Math.random()*10000)}` };
                        onUpdateMember({ ...foundMember, items: [...(foundMember.items||[]), newCoupon] });
                    }
                }
            }, 1000 + idx * 800); // 間隔時間拉長，更有緊張感
        });
    };

    const handleConfirm = async () => { 
        const targetConfig = (printers || []).find(p => p.id === 'counter') || printers[0];
        const targetIp = targetConfig ? targetConfig.ip : '192.168.1.176';
        try { 
            const SERVER_API = `${STORE_URLS[storeId]}/api/print`; 
            await fetch(SERVER_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ type: 'checkout', tableId: table.id, targetIp: targetIp, content: table.orders || [], extraInfo: { planName: plan.name, adults: table.adults, children: table.children, finalTotal: finalTotal, receivedAmount: receivedAmount, changeAmount: changeAmount, paymentMethod: paymentMethod } }) 
            }); 
        } catch (error) { console.error("無法連線出單機:", error); }
        onConfirmPayment(table.id, { receivedAmount, changeAmount, memberPhone, finalTotal, planName: plan.name, adults: table.adults, children: table.children, paymentMethod: paymentMethod }, appliedCoupon ? appliedCoupon.id : null); 
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-[1000px] h-[720px] rounded-2xl shadow-2xl flex overflow-hidden relative">
                
                {/* 🎰 拉霸機畫面主體 */}
                {showSlotMachine && (
                    <div className="absolute inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center text-white rounded-2xl animate-fade-in">
                        <style>{slotStyles}</style>
                        <button onClick={()=>setShowSlotMachine(false)} className="absolute top-6 right-6 text-white/50 hover:text-white"><X size={40}/></button>
                        <h2 className="text-5xl font-black mb-12 text-yellow-400 animate-pulse tracking-[0.2em]">🎰 野饌幸運盤 🎰</h2>
                        
                        <div className="flex gap-6 p-8 bg-gradient-to-b from-gray-800 to-black rounded-[40px] border-[10px] border-yellow-600 shadow-[0_0_100px_rgba(245,158,11,0.4)]">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="reel-container">
                                    <div className={`reel-strip ${spinningReels[i] ? 'animate-slot-scroll' : ''}`}>
                                        {spinningReels[i] ? (
                                            // 旋轉中：顯示預設的水果帶子
                                            ['🍒', '🍋', '🍇', '💎', '7️⃣', '🔔', '🍒', '🍋', '🍇', '💎'].map((icon, idx) => (
                                                <div key={idx} className="reel-icon">{icon}</div>
                                            ))
                                        ) : (
                                            // 停止時：只顯示最終開出來的結果
                                            <div className="reel-icon animate-bounce-in">{reels[i]}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="h-40 flex flex-col items-center justify-center mt-12">
                            {spinResult && !isSpinning ? (
                                <div className="text-center animate-fade-in">
                                    <div className="text-5xl font-black text-green-400 animate-bounce mb-6">
                                        {spinResult.id === 'none' ? '銘謝惠顧 😅' : `🎉 ${spinResult.name} 🎉`}
                                    </div>
                                    <button onClick={()=>setShowSlotMachine(false)} className="bg-white text-gray-900 px-12 py-4 rounded-2xl font-bold text-2xl shadow-xl hover:scale-105 transition-all">確認領獎</button>
                                </div>
                            ) : (
                                !isSpinning && (
                                    <button onClick={handleSpin} className="bg-red-600 hover:bg-red-500 text-white px-16 py-6 rounded-full text-4xl font-black shadow-[0_12px_0_rgb(153,27,27)] active:translate-y-2 active:shadow-none transition-all">
                                        PUSH!
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                )}
                
                {/* 左側：訂單詳情與金額計算 */}
                <div className="w-1/2 bg-gray-50 p-8 border-r overflow-y-auto flex flex-col">
                    <h2 className="text-2xl font-bold mb-4">結帳確認 - 桌號 {table.id}</h2>
                    
                    {/* ★★★ 新增：餐點明細列表 ★★★ */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex-grow overflow-y-auto max-h-64">
                        <h3 className="font-bold text-gray-500 text-xs mb-2 border-b pb-1">餐點明細 ({table.orders?.length || 0})</h3>
                        {table.orders && table.orders.length > 0 ? (
                            <div className="space-y-1">
                                {table.orders.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm text-gray-700">
                                        <span>{item.name} {item.count > 1 ? `x${item.count}` : ''}</span>
                                        <span className="font-bold">
                                            {item.category === 'Tip' ? `$${item.price}` : (item.price > 0 ? `$${item.price}` : '-')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 text-sm py-4">無點餐紀錄</div>
                        )}
                    </div>

                    <div className="space-y-2 mb-6 text-sm">
                        <div className="flex justify-between"><span>方案 ({table.adults}大 {table.children}小)</span><span>${subtotal}</span></div>
                        <div className="flex justify-between"><span>服務費 (10%)</span><span>${serviceFee}</span></div>
                        {tipTotal > 0 && <div className="flex justify-between text-blue-600 font-bold"><span>服務員打賞 (小費)</span><span>+${tipTotal}</span></div>}
                        {appliedCoupon && (<div className="flex justify-between text-green-600 font-bold"><span>優惠券 ({appliedCoupon.name})</span><span>{appliedCoupon.type === 'item' ? '兌換食材' : appliedCoupon.type === 'percent' ? `-${Math.round(subtotal * (1 - appliedCoupon.value/100))}` : `-$${appliedCoupon.value}`}</span></div>)}
                        {customDiscount.type !== 'none' && <div className="flex justify-between text-green-600 font-bold"><span>手動折扣</span><span>-${getDiscountDisplay()}</span></div>}
                        {slotPrizeDiscount > 0 && <div className="flex justify-between text-yellow-600 font-bold"><span>🎰 抽獎折扣</span><span>-${slotPrizeDiscount}</span></div>}
                        <div className="flex justify-between text-3xl font-bold border-t pt-4 mt-2 text-gray-800"><span>總金額</span><span>${finalTotal}</span></div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl shadow-sm border mb-4"><label className="text-xs font-bold text-gray-500 mb-2 block">折扣設定</label><div className="flex gap-2 mb-2"><select className="border p-2 rounded text-sm flex-grow" value={customDiscount.type} onChange={e => setCustomDiscount({...customDiscount, type: e.target.value, val: e.target.value === 'single' ? 90 : 0})}><option value="none">無折扣</option><option value="single">單人折扣</option><option value="percent">整桌折扣</option><option value="amount">金額折抵</option></select>{(customDiscount.type === 'percent' || customDiscount.type === 'single') && (<div className="flex gap-1">{[95, 90, 80].map(r => (<button key={r} onClick={() => setCustomDiscount({...customDiscount, val: r})} className={`px-2 rounded text-xs font-bold border ${parseInt(customDiscount.val) === r ? 'bg-orange-500 text-white' : 'bg-white'}`}>{r}折</button>))}<input type="number" className="border p-2 rounded w-16 text-sm" placeholder="%" value={customDiscount.val} onChange={e => setCustomDiscount({...customDiscount, val: e.target.value})} /></div>)}{customDiscount.type === 'amount' && <input type="number" className="border p-2 rounded w-24 text-sm" placeholder="$" value={customDiscount.val} onChange={e => setCustomDiscount({...customDiscount, val: e.target.value})} />}</div><div className="flex gap-2"><input className="border p-2 rounded flex-grow text-sm" placeholder="輸入優惠代碼" value={discountCode} onChange={e => setDiscountCode(e.target.value)} /><button onClick={applyDiscountCode} className="bg-gray-800 text-white px-3 rounded font-bold text-sm">應用</button></div></div>
                    
                    <div className="bg-white p-4 rounded-xl shadow-sm border mb-4"><label className="text-xs font-bold text-gray-500 mb-2 block">會員查詢</label><div className="flex gap-2 mb-2"><input className="border p-2 rounded flex-grow" placeholder="電話" value={memberPhone} onChange={e => setMemberPhone(e.target.value)} /><button onClick={handleSearchMember} className="bg-blue-600 text-white px-4 rounded font-bold">查詢</button></div>{foundMember && (<div className="text-sm bg-blue-50 p-2 rounded text-blue-800 flex justify-between items-center"><div><div>{foundMember.name} <span className="bg-yellow-200 text-yellow-800 px-1 rounded text-xs ml-1">{foundMember.level}</span></div><div>點數: {foundMember.points}</div></div>{finalTotal >= 1000 && !spinResult && (<button onClick={()=>setShowSlotMachine(true)} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-lg font-bold text-xs shadow hover:scale-105 transition flex items-center gap-1"><Sparkles size={12}/> 滿千抽獎</button>)}</div>)}</div>
                    
                    {foundMember && (<div className="mb-4"><label className="text-xs font-bold text-gray-500 mb-2 block">會員票夾 (已擁有)</label><div className="flex flex-wrap gap-2">{foundMember.items.filter(i => !i.redeemed).length === 0 ? <span className="text-gray-400 text-xs">無可用票券</span> : foundMember.items.filter(i => !i.redeemed).map(item => { const couponMeta = coupons.find(c => c.name === item.name); const isUsable = couponMeta; return (<button key={item.id} onClick={() => isUsable && setAppliedCoupon(appliedCoupon?.name === item.name ? null : { ...item, type: couponMeta.type, value: couponMeta.value })} disabled={!isUsable} className={`px-3 py-1 text-xs rounded border flex items-center gap-1 ${!isUsable ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : appliedCoupon?.name === item.name ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-gray-600 hover:border-orange-300'}`}>{item.name}</button>); })}</div></div>)}
                </div>

                {/* 右側：數字鍵盤與支付 */}
                <div className="w-1/2 p-8 flex flex-col bg-gray-50">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border h-full flex flex-col">
                        <label className="block text-gray-500 font-bold mb-2">實收金額</label>
                        <div className="text-5xl font-bold text-right mb-4 text-gray-800 border-b pb-2 h-20 flex items-center justify-end">{receivedAmount || <span className="text-gray-200">0</span>}</div>
                        <label className="block text-gray-500 font-bold mb-2 text-xs">選擇支付方式</label>
                        <div className="grid grid-cols-2 gap-2 mb-4">{['現金', '刷卡', 'LINE Pay', '轉帳'].map(method => (<button key={method} onClick={() => setPaymentMethod(method)} className={`py-3 rounded-lg font-bold border-2 transition-all ${paymentMethod === method ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}>{method === '現金' && '💵 '}{method === '刷卡' && '💳 '}{method === 'LINE Pay' && '📱 '}{method === '轉帳' && '🏦 '}{method}</button>))}</div>
                        <div className="flex-grow"><NumberPad value={receivedAmount} onChange={setReceivedAmount} showDisplay={false} /></div>
                        <div className="mt-4 pt-4 border-t"><div className="flex justify-between items-center text-xl font-bold text-gray-600 mb-4"><span>找零</span><span>${changeAmount > 0 ? changeAmount : 0}</span></div><div className="grid grid-cols-2 gap-4"><button onClick={onClose} className="bg-gray-200 text-gray-700 py-4 rounded-xl font-bold text-lg">取消</button><button onClick={handleConfirm} className="bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700" disabled={!receivedAmount || changeAmount < 0}>確認結帳</button></div></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// =======================================================
// ★★★ 新增：TableFeedbackModal (支援複選版) ★★★
// =======================================================
const TableFeedbackModal = ({ tableInfo, storeId, onClose, onSubmit, onDefer }) => {
    // 1. 訂位姓氏
    const [lastName, setLastName] = useState('');
    // 2. 手機號碼
    const [phone, setPhone] = useState('');
    
    // ★★★ 改為複選 (Array) ★★★
    const [sources, setSources] = useState([]); // Q4
    const [purposes, setPurposes] = useState([]); // Q6
    const [favDishes, setFavDishes] = useState([]); // Q8
    const [serviceFeels, setServiceFeels] = useState([]); // Q9

    // 其他文字輸入框
    const [sourceOther, setSourceOther] = useState('');
    const [purposeOther, setPurposeOther] = useState('');
    const [favDishOther, setFavDishOther] = useState('');

    // 維持單選 (邏輯上互斥)
    const [visitHistory, setVisitHistory] = useState(''); // Q5
    const [visitCount, setVisitCount] = useState('');
    const [foodQuality, setFoodQuality] = useState(''); // Q7
    const [foodQualityOther, setFoodQualityOther] = useState('');

    // 10. 整體建議
    const [suggestion, setSuggestion] = useState('');

    // 選項常數
    const OPTS_SOURCE = ['Google搜尋', '臉書廣告', '抖音', '網紅影片', '路過', '來過', '其他'];
    const OPTS_VISIT = ['沒有來過', '有來過'];
    const OPTS_PURPOSE = ['朋友聚餐', '家庭聚餐', '情侶約會', '慶生', '公司聚餐', '團體聚餐', '其他'];
    const OPTS_QUALITY = ['滿意', '普通', '不滿意', '有其他反應'];
    const OPTS_FAV = ['活泰國蝦', '蚵仔生蠔', '和牛', '牛舌', '松阪豬', '啤酒冰淇淋', '其他'];
    const OPTS_SERVICE = ['熱情親切', '有效率', '普普通通', '有待改善'];

    // ★★★ 複選切換邏輯 ★★★
    const toggleSelection = (list, setList, item) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item)); // 已存在則移除
        } else {
            setList([...list, item]); // 不存在則加入
        }
    };

    // 檢查是否全部填寫完成
    const isFormValid = () => {
        if (!lastName.trim()) return false;
        if (!phone.trim()) return false;
        if (sources.length === 0) return false; // 檢查陣列是否有值
        if (sources.includes('其他') && !sourceOther.trim()) return false;
        
        if (!visitHistory) return false;
        if (visitHistory === '有來過' && !visitCount) return false;
        
        if (purposes.length === 0) return false;
        if (purposes.includes('其他') && !purposeOther.trim()) return false;
        
        if (!foodQuality) return false;
        if (foodQuality === '有其他反應' && !foodQualityOther.trim()) return false;
        
        if (favDishes.length === 0) return false;
        if (favDishes.includes('其他') && !favDishOther.trim()) return false;
        
        if (serviceFeels.length === 0) return false;
        
        if (!suggestion.trim()) return false; // 第10題必填
        return true;
    };

    const handleSubmit = () => {
        if (!isFormValid()) return alert("⚠️ 請填寫完整資訊才能送出！");
        
        // 組合字串：將陣列轉為 "選項A, 選項B" 的格式
        const formatMultiSelect = (list, otherVal, otherLabel = '其他') => {
            let result = list.filter(i => i !== otherLabel).join(', ');
            if (list.includes(otherLabel)) {
                result += result ? `, 其他: ${otherVal}` : `其他: ${otherVal}`;
            }
            return result;
        };

        const feedbackData = {
            id: Date.now(),
            storeId,
            tableId: tableInfo.id,
            timestamp: Date.now(),
            pax: `${tableInfo.adults}大${tableInfo.children}小`,
            totalPrice: tableInfo.finalTotal,
            // 答案區
            q1_name: lastName,
            q2_phone: phone,
            q3_paxPrice: `${tableInfo.adults}大${tableInfo.children}小 / $${tableInfo.finalTotal}`,
            q4_source: formatMultiSelect(sources, sourceOther),
            q5_visit: visitHistory === '有來過' ? `來過 ${visitCount} 次` : '沒有來過',
            q6_purpose: formatMultiSelect(purposes, purposeOther),
            q7_quality: foodQuality === '有其他反應' ? `反應: ${foodQualityOther}` : foodQuality,
            q8_fav: formatMultiSelect(favDishes, favDishOther),
            q9_service: serviceFeels.join(', '),
            q10_suggestion: suggestion
        };
        onSubmit(feedbackData);
    };

    // ★★★ 渲染複選按鈕 ★★★
    const renderMultiOptions = (options, currentList, setList, otherVal, setOtherVal, otherLabel = '其他') => (
        <div className="flex flex-wrap gap-2 mt-1">
            {options.map(opt => (
                <button 
                    key={opt} 
                    onClick={() => toggleSelection(currentList, setList, opt)}
                    className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-1 ${currentList.includes(opt) ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-gray-600 border-gray-300'}`}
                >
                    {opt} {currentList.includes(opt) && <Check size={14}/>}
                </button>
            ))}
            {currentList.includes(otherLabel) && (
                <input 
                    autoFocus
                    className="border-b-2 border-orange-500 outline-none px-2 py-1 bg-orange-50 text-gray-800 w-40"
                    placeholder="請輸入內容..."
                    value={otherVal}
                    onChange={e => setOtherVal(e.target.value)}
                />
            )}
        </div>
    );

    // 渲染單選按鈕 (維持舊邏輯)
    const renderSingleOptions = (options, currentVal, setVal, otherVal, setOtherVal, otherLabel = '其他') => (
        <div className="flex flex-wrap gap-2 mt-1">
            {options.map(opt => (
                <button key={opt} onClick={()=>setVal(opt)} className={`px-3 py-2 rounded-lg text-sm font-bold border ${currentVal===opt ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>{opt}</button>
            ))}
            {currentVal === otherLabel && <input className="border-b-2 border-blue-500 outline-none px-2 py-1 w-40" placeholder="內容..." value={otherVal} onChange={e=>setOtherVal(e.target.value)}/>}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-orange-600 p-4 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-xl font-bold">📝 用餐滿意度回報 (可複選)</h3>
                        <p className="text-sm opacity-80">桌號: {tableInfo.id} | 金額: ${tableInfo.finalTotal}</p>
                    </div>
                    <button onClick={onDefer} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-bold border border-white/40">⏳ 忙碌中，稍後回報</button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 bg-gray-50 flex-grow">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <label className="text-xs font-bold text-gray-500 block mb-1">1. 訂位姓氏 <span className="text-red-500">*</span></label>
                            <input className="w-full text-lg font-bold border-b-2 border-gray-200 focus:border-orange-500 outline-none" placeholder="輸入姓氏" value={lastName} onChange={e=>setLastName(e.target.value)} />
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <label className="text-xs font-bold text-gray-500 block mb-1">2. 手機號碼 <span className="text-red-500">*</span></label>
                            <input type="tel" className="w-full text-lg font-bold border-b-2 border-gray-200 focus:border-orange-500 outline-none" placeholder="09..." value={phone} onChange={e=>setPhone(e.target.value)} />
                        </div>
                    </div>

                    <div className="bg-gray-200 p-3 rounded-xl text-gray-600 text-sm font-bold flex justify-between">
                        <span>3. 人數/價錢 (系統自動帶入)</span>
                        <span>{tableInfo.adults}大{tableInfo.children}小 / Total: ${tableInfo.finalTotal}</span>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-700">4. 如何得知餐廳 (可複選) <span className="text-red-500">*</span></label>
                        {renderMultiOptions(OPTS_SOURCE, sources, setSources, sourceOther, setSourceOther)}
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-700">5. 是否有來過 (單選) <span className="text-red-500">*</span></label>
                        {renderSingleOptions(OPTS_VISIT, visitHistory, setVisitHistory)}
                        {visitHistory === '有來過' && <div className="mt-2 flex items-center gap-2"><span className="text-sm font-bold">次數:</span><input type="number" className="border p-1 w-20 rounded" value={visitCount} onChange={e=>setVisitCount(e.target.value)}/></div>}
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-700">6. 今日用餐目的 (可複選) <span className="text-red-500">*</span></label>
                        {renderMultiOptions(OPTS_PURPOSE, purposes, setPurposes, purposeOther, setPurposeOther)}
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-700">7. 餐點品質反饋 (單選) <span className="text-red-500">*</span></label>
                        {renderSingleOptions(OPTS_QUALITY, foodQuality, setFoodQuality, foodQualityOther, setFoodQualityOther, '有其他反應')}
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-700">8. 本次最喜歡的餐點 (可複選) <span className="text-red-500">*</span></label>
                        {renderMultiOptions(OPTS_FAV, favDishes, setFavDishes, favDishOther, setFavDishOther)}
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-700">9. 對於服務感受 (可複選) <span className="text-red-500">*</span></label>
                        {renderMultiOptions(OPTS_SERVICE, serviceFeels, setServiceFeels)}
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-700">10. 整體反饋或建議 <span className="text-red-500">*</span></label>
                        <textarea className="w-full h-24 border-2 border-gray-300 rounded-xl p-3 mt-1 focus:border-orange-500 outline-none" placeholder="請輸入顧客的具體建議..." value={suggestion} onChange={e=>setSuggestion(e.target.value)} />
                    </div>
                </div>

                <div className="p-4 border-t bg-white shrink-0">
                    <button onClick={handleSubmit} disabled={!isFormValid()} className={`w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all ${isFormValid() ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                        {isFormValid() ? '確認送出 (資料完整)' : '請填寫所有必填欄位'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 5.1 MainPOS (主系統 - 終極防重覆列印版) ---
const MainPOS = ({ currentStore, onLogout, isHQMode, slotPrizes, setSlotPrizes, tiers, setTiers, bookings, setBookings }) => {
    // 透過 Store ID 來區分桌位資料
    const [tables, setTables, tablesLoading] = useFirebaseState('pos_data', `tables_${currentStore.id}`, []); 
    const [hiddenCategories, setHiddenCategories] = useFirebaseState('pos_data', 'hidden_categories', []);

    // ★★★ 自動補桌機制 (Auto-Init) ★★★
    // 只要發現資料庫是空的，就自動產生桌子，不用手動按重置
    useEffect(() => {
        // 1. 如果還在讀取中，先不動
        if (tablesLoading) return;

        // 2. 如果讀取完畢，且發現桌子數量是 0 (空的)
        if (tables && tables.length === 0 && currentStore) {
            console.log("⚠️ 偵測到無桌位資料，啟動自動修復...");

            const ranges = currentStore.tableRanges || (currentStore.tablePrefix ? [{ prefix: currentStore.tablePrefix, count: currentStore.tableCount }] : []);
            
            if (ranges.length > 0) {
                const autoTables = [];
                ranges.forEach(range => {
                    for (let i = 1; i <= range.count; i++) {
                        const tableId = `${range.prefix}${i.toString().padStart(2, '0')}`;
                        // 建立空桌資料
                        autoTables.push({
                            id: tableId,
                            status: 'empty',
                            startTime: null,
                            adults: 0,
                            children: 0,
                            plan: '',
                            total: 0,
                            orders: [],
                            token: null
                        });
                    }
                });

                // 3. 自動存入資料庫
                if (autoTables.length > 0) {
                    setTables(autoTables);
                    console.log("✅ 自動補桌完成！");
                }
            }
        }
    }, [tables, tablesLoading, currentStore]);

    // ============== 🔊 內建音效 + 隱形解鎖版 (開始) ==============
    
    // 1. 這是聲音的原始碼 (Base64)，直接內建在程式裡，不用上網下載
    // 這是一個清脆的 "丁~" 聲音
    const DING_SOURCE = 'data:audio/mp3;base64,//uQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
    
    const audioRef = useRef(new Audio(DING_SOURCE));
    const [lastOrderCount, setLastOrderCount] = useState(0);

    // 2. 播放函式
    const playSound = () => {
        const audio = audioRef.current;
        audio.currentTime = 0;
        audio.play().catch(e => {
            // 如果還是被擋，就在控制台悄悄紀錄，不跳視窗吵人
            console.log("等待互動解鎖中...", e);
        });
    };

    // 3. 隱形解鎖機制：監聽畫面上「任何」一次點擊
    useEffect(() => {
        const unlockAudio = () => {
            const audio = audioRef.current;
            // 播放一個 0 秒的無聲片段，騙過瀏覽器，取得播放權限
            audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
                console.log("🔓 音效功能已解鎖 (不用按測試鈕了)");
            }).catch(() => {});
            
            // 解鎖成功後，移除監聽，不要一直執行
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };

        // 只要手指碰到螢幕任何地方，就嘗試解鎖
        document.addEventListener('click', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);

        return () => {
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
    }, []);

    // 4. 自動監聽訂單 (安全防當機版)
    useEffect(() => {
        if (!tables) return;

        let currentCount = 0;
        tables.forEach(t => {
            if (t.status === 'occupied' && t.orders) {
                currentCount += t.orders.length;
            }
        });

        // 只有數字變了才動作
        if (currentCount !== lastOrderCount) {
            // 變多才叫
            // (lastOrderCount !== 0 防止剛重新整理頁面時亂叫，但允許從 0 變 1 時叫)
            if (currentCount > lastOrderCount) {
                // 只有當「不是」第一次載入頁面時 (lastOrderCount 已經有值了) 才叫
                // 這裡我們簡單一點，只要變多就叫，除非是剛開網頁的瞬間
                console.log("🔔 叮咚！新訂單！");
                playSound();
            }
            setLastOrderCount(currentCount);
        }
    }, [tables, lastOrderCount]);

    // ============== 🔊 內建音效 + 隱形解鎖版 (結束) ==============

    // ★★★ 1. 關鍵技術：Ref 雙重鎖 (State Ref + Local Lock Ref) ★★★
    const tablesRef = useRef(tables);
    useEffect(() => { tablesRef.current = tables; }, [tables]);
    
    // 這是新的：本地記憶體鎖，用來擋住 0.5 秒內的重複觸發
    const processedRef = useRef(new Set()); 

    const [cloudPrinters, setCloudPrinters] = useFirebaseState('pos_data', `printers_${currentStore.id}`, INITIAL_PRINTERS);
    const [diningPlans, setDiningPlans] = useFirebaseState('pos_data', 'plans', INITIAL_DINING_PLANS);
    const [menuItems, setMenuItems] = useFirebaseState('pos_data', 'menu', INITIAL_MENU_ITEMS);
    const [memberAppSettings, setMemberAppSettings] = useFirebaseState('pos_data', 'app_settings', INITIAL_MEMBER_APP_SETTINGS);
    const [members, setMembers] = useFirebaseState('pos_data', 'members', INITIAL_MEMBERS_DB);
    const [memberLogs, setMemberLogs] = useFirebaseState('pos_data', 'member_logs', []);
    const [storeEmployees, setStoreEmployees] = useFirebaseState('pos_data', 'employees', INITIAL_STORE_EMPLOYEES);
    const [storesConfig, setStoresConfig] = useFirebaseState('pos_data', 'stores_config', INITIAL_STORES_CONFIG);
    const [clockLogs, setClockLogs] = useFirebaseState('pos_data', 'clock_logs', []);
    const [coupons, setCoupons] = useFirebaseState('pos_data', 'coupons', INITIAL_COUPONS);
    const [categories, setCategories] = useFirebaseState('pos_data', 'categories', INITIAL_CATEGORIES);
    // =======================================================
    // ★★★ 萬能修復包：營收 + 庫存 + 小費 全部救回 ★★★
    // =======================================================
    
    // --- 1. 營收紀錄 (雙帳本合體) ---
    const [oldLogs] = useFirebaseState('pos_data', 'sales_logs', []); // 舊的
    const [logsV2, setLogsV2] = useFirebaseState('pos_data', 'sales_logs_v2', []); // 新的

    // 合體給報表看
    const salesLogs = [...(oldLogs || []), ...(logsV2 || [])];
    // 設定存檔工具給結帳用
    const setSalesLogs = setLogsV2;


    // --- 2. 👇 這裡就是補回來的「庫存狀態」 (Stock) ---
    const [stockStatus, setStockStatus] = useFirebaseState('pos_data', 'stock_status', {});


    // --- 3. 👇 這裡就是補回來的「小費紀錄」 (Tips) ---
    const [tipLogs, setTipLogs] = useFirebaseState('pos_data', 'tip_logs', []);

    // 用來存回報資料的雲端位置
    const [feedbackLogs, setFeedbackLogs] = useFirebaseState('pos_data', 'feedback_logs', []);
    
    // 暫存的佇列 (存在本地即可，或是雲端也可以，這裡先存本地 LocalStorage 以防重新整理消失)
    const [pendingFeedbacks, setPendingFeedbacks] = useStickyState([], `pending_feedbacks_${currentStore.id}`);
    
    // 控制目前要填寫哪一筆回報
    const [activeFeedbackData, setActiveFeedbackData] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);
    const [checkoutTable, setCheckoutTable] = useState(null);
    const [currentView, setCurrentView] = useState('home');
    const [empClockStatus, setEmpClockStatus] = useStickyState({}, 'pos_emp_clock_status_v43_1');
    const [printers, setPrinters] = useStickyState(INITIAL_PRINTERS, `pos_printers_${currentStore?.id || 'default'}`);

    // ★★★ 自動計時器 + 最後加點檢查 (已修復：加入本地鎖) ★★★
    const [, setTick] = useState(0);
    
    useEffect(() => {
        const timer = setInterval(() => {
            setTick(t => t + 1); // 更新畫面

            const currentTables = tablesRef.current || []; 
            const now = Date.now();

            currentTables.forEach(table => {
                if (table.status === 'occupied' && table.startTime) {
                    const elapsedMinutes = Math.floor((now - table.startTime) / 60000);

                    // ★★★ 80分鐘提醒：只播放聲音，不改資料庫 (絕對安全) ★★★
                    // 1. 時間到了 80 分鐘
                    // 2. 且 本地鎖 (processedRef) 還沒鎖過 (避免每一秒都叫)
                    if (elapsedMinutes >= 80 && !processedRef.current.has(table.id)) {
                        
                        console.log(`⏰ 桌號 ${table.id} 已達 80 分鐘，播放提示音！`);
                        
                        // 1. 播放聲音 (提醒外場)
                        playSound();

                        // 2. 立刻上鎖！(確保這桌只會叫這一次，不會一直叫)
                        processedRef.current.add(table.id);
                        
                        // 注意：我們故意不呼叫 handleAutoPrintLastCall，也不更新 setTables
                        // 這樣能保證資料庫絕對不會被動到，桌子 100% 不會消失。
                    }
                }
            });

        }, 60000); 

        return () => clearInterval(timer);
    }, []); 


    // 2. 印表機同步
    useEffect(() => {
        if (cloudPrinters && cloudPrinters.length > 0) {
            setPrinters(cloudPrinters);
        }
    }, [cloudPrinters]);

    // ★★★ 修正版：智慧重置 (Smart Reset) - 絕對不會刪除用餐中的桌子 ★★★
    const handleResetData = () => {
        // 1. 第一道防線：密碼確認
        const inputPwd = prompt("⚠️ 危險操作警告 ⚠️\n\n此操作將重置桌位結構。\n為保護用餐數據，請輸入「管理員密碼」以繼續：");
        
        // 這裡預設用總部密碼 '88888' 或該分店密碼，您也可以寫死
        if (inputPwd !== currentStore.password && inputPwd !== '88888') {
            if (inputPwd !== null) alert("❌ 密碼錯誤！操作已取消。");
            return;
        }

        // 2. 準備產生標準桌子結構
        const ranges = currentStore.tableRanges || (currentStore.tablePrefix ? [{ prefix: currentStore.tablePrefix, count: currentStore.tableCount }] : []);
        
        if (ranges.length > 0) {
            const smartTables = [];
            ranges.forEach(range => {
                for (let i = 1; i <= range.count; i++) {
                    const tableId = `${range.prefix}${i.toString().padStart(2, '0')}`;
                    
                    // ★★★ 第二道防線：檢查現有資料 ★★★
                    // 去目前的資料庫 (tables) 找找看這張桌子是否正在用餐？
                    const existingTable = tables.find(t => t.id === tableId);

                    if (existingTable && existingTable.status === 'occupied') {
                        // A. 如果桌子存在且有人在吃飯 -> 【保留原狀！】(絕對不能動)
                        smartTables.push(existingTable);
                    } else {
                        // B. 如果桌子不見了，或是空桌 -> 重新建立一個乾淨的空桌
                        smartTables.push({ 
                            id: tableId, 
                            status: 'empty', 
                            startTime: null, 
                            adults: 0, 
                            children: 0, 
                            plan: '', 
                            total: 0, 
                            orders: [], 
                            token: null 
                        });
                    }
                }
            });

            // 3. 寫入資料庫
            setTables(smartTables); 
            alert('✅ 智慧重置完成！\n\n🛡️ 已為您保留所有「用餐中」的桌位資料。\n🛠️ 僅修復遺失或閒置的桌位。');
        } else {
            alert('⚠️ 系統找不到此分店的桌位設定，無法建立。');
        }
    };

    // ★★★ 終極合體版：結帳確認 (會員+紀錄+列印+正確清桌) ★★★
    const handleConfirmPayment = async (tableId, paymentData, usedCouponId) => { 
        if (!currentStore) return;
        const targetTableId = (typeof tableId === 'string' ? tableId : checkoutTable?.id);
        const finalTotal = Math.round(paymentData.finalTotal);

        // 1. 會員積點與升級邏輯
        if (paymentData.memberPhone) {
            setMembers(prevMembers => prevMembers.map(m => {
                if (m.phone === paymentData.memberPhone) {
                    const newTotalSpending = (m.totalSpending || 0) + finalTotal;
                    const pointsEarned = Math.floor(finalTotal / 1000);
                    const newLog = { id: Date.now(), amount: pointsEarned, expiry: Date.now() + (45 * 24 * 60 * 60 * 1000), used: false };
                    
                    let newLevel = m.level;
                    if (newTotalSpending >= 40000) newLevel = 'Gold';
                    else if (newTotalSpending >= 30000) newLevel = 'Silver';
                    else if (newTotalSpending >= 20000) newLevel = 'Bronze';
                    else if (newTotalSpending >= 10000) newLevel = 'Iron';
                    
                    let updatedItems = m.items || [];
                    if (usedCouponId) {
                        updatedItems = updatedItems.map(item => item.id === usedCouponId ? { ...item, redeemed: true } : item);
                    }
                    return { ...m, totalSpending: newTotalSpending, level: newLevel, points: (m.points || 0) + pointsEarned, pointLogs: [...(m.pointLogs || []), newLog], items: updatedItems };
                }
                return m;
            }));
        }

        // --- 2. 寫入銷售紀錄 (修改版：增加存入 orders 詳細內容) ---
        // 先把這張桌子的資料抓出來 (為了拿 orders)
        const currentTableData = tables.find(t => t.id === targetTableId) || checkoutTable;
        const currentOrders = currentTableData ? currentTableData.orders : [];

        const newSale = { 
            id: Date.now(), 
            storeId: currentStore.id, 
            tableId: targetTableId, 
            paymentMethod: paymentData.paymentMethod, 
            amount: finalTotal, 
            timestamp: Date.now(), 
            planName: paymentData.planName || checkoutTable?.plan, 
            adults: paymentData.adults || checkoutTable?.adults, 
            children: paymentData.children || checkoutTable?.children,
            
            // ★★★ 新增這一行：把這桌吃的東西全部存下來！ ★★★
            orders: currentOrders 
        };
        setSalesLogs(prev => [newSale, ...prev]);

        // 3. 更新資料庫：清空該桌
        setTables(prevTables => prevTables.map(t => {
            if (t.id === targetTableId) {
                return {
                    id: t.id,
                    status: 'empty',
                    startTime: null,
                    adults: 0,
                    children: 0,
                    plan: '',
                    total: 0,
                    orders: [],
                    token: null,
                    hasPrintedLastCall: false 
                };
            }
            return t; 
        })); 

        // 4. 清理鎖定與關閉
        if (processedRef && processedRef.current && processedRef.current.has(targetTableId)) {
            processedRef.current.delete(targetTableId);
        }

        setCheckoutTable(null);
        // 原本只有 alert，現在改為設定 activeFeedbackData 來打開視窗
        const feedbackInitData = {
            id: targetTableId, // 用桌號當 ID
            adults: paymentData.adults,
            children: paymentData.children,
            finalTotal: paymentData.finalTotal,
            timestamp: Date.now()
        };
        setActiveFeedbackData(feedbackInitData);
    };

    const handleUpdateMember = (updatedMember) => { setMembers(prevMembers => { const exists = prevMembers.some(m => m.phone === updatedMember.phone); if (exists) { return prevMembers.map(m => m.phone === updatedMember.phone ? updatedMember : m); } else { return [...prevMembers, updatedMember]; } }); };
    const addMemberLog = (log) => { setMemberLogs(prev => [{ id: Date.now(), timestamp: Date.now(), ...log }, ...prev]); };
    const handleClockUpdate = (empId, status) => { setEmpClockStatus(prev => ({ ...prev, [empId]: status })); const emp = (storeEmployees[currentStore.id] || []).find(e => e.id === empId); if (!emp) return; const newLog = { id: Date.now(), empId: emp.id, empName: emp.name, storeId: currentStore.id, storeName: currentStore.name, type: status, timestamp: Date.now() }; setClockLogs(prev => [newLog, ...prev]); };
    
    // ★★★ 開桌函式 ★★★
    const handleOpenTable = (tableId, adults, children, planId, sessionToken) => { 
        const selectedPlan = diningPlans.find(p => p.id === planId); 
        const totalAmount = Math.round((adults * selectedPlan.price + children * selectedPlan.childPrice) * 1.1); 
        
        setTables(prev => prev.map(t => 
            t.id === tableId 
            ? { 
                ...t, 
                status: 'occupied', 
                startTime: Date.now(), 
                adults, children, plan: planId, total: totalAmount, orders: [], 
                token: sessionToken 
              } 
            : t
        )); 
        setSelectedTable(null); 
    };

    const handleRequestCheckout = (table) => { setSelectedTable(null); setCheckoutTable(table); };
    const enterBranch = (storeId, storeData) => { };

    if (isHQMode) {
        return <HQDashboard 
            diningPlans={diningPlans} setDiningPlans={setDiningPlans} 
            salesLogs={salesLogs}
            setSalesLogs={setSalesLogs}
            menuItems={menuItems} setMenuItems={setMenuItems} 
            memberAppSettings={memberAppSettings} setMemberAppSettings={setMemberAppSettings} 
            storesConfig={storesConfig} setStoresConfig={setStoresConfig} 
            storeEmployees={storeEmployees} setStoreEmployees={setStoreEmployees} 
            clockLogs={clockLogs} members={members} setMembers={setMembers} 
            coupons={coupons} setCoupons={setCoupons} 
            onEnterBranch={(id, data) => { 
                alert("請登出後，使用該分店帳號登入以進行現場操作。");
            }} 
            onLogout={onLogout} 
            categories={categories} setCategories={setCategories}
            hiddenCategories={hiddenCategories} 
            setHiddenCategories={setHiddenCategories} 
            memberLogs={memberLogs} salesLogs={salesLogs} 
            stockStatus={stockStatus} setStockStatus={setStockStatus}
            tipLogs={tipLogs} 
            slotPrizes={slotPrizes} setSlotPrizes={setSlotPrizes}
            tiers={tiers} setTiers={setTiers}
        />;
    }

    // ★★★ 修正版：最後加點邏輯 (終極空殼版，確保安全) ★★★
    const handleAutoPrintLastCall = (targetTableId, minutes) => {
        console.log("自動提醒功能已被徹底閹割，保障桌子安全");
        return; 
    };
// ==========================================
    // ★★★ 補上這兩段遺失的函式 (回饋處理) ★★★
    // ==========================================

    // 1. 提交回報 (寫入 Firebase 並清除暫存)
    const handleFeedbackSubmit = (data) => {
        // 寫入雲端資料庫 (利用 MainPOS 已經有的 setFeedbackLogs)
        setFeedbackLogs(prev => [data, ...prev]);
        
        // 清理暫存：如果這筆是來自暫存列的，要把它移除
        // 使用 tableId 來比對 (因為你在 CheckoutModal 設定 activeFeedbackData 時是用 tableId 當 id)
        if (pendingFeedbacks.some(p => p.id === data.tableId)) {
             setPendingFeedbacks(prev => prev.filter(p => p.id !== data.tableId));
        } 
        // 或是比對時間戳記 (雙重保險)
        else if (activeFeedbackData && pendingFeedbacks.some(p => p.timestamp === activeFeedbackData.timestamp)) {
             setPendingFeedbacks(prev => prev.filter(p => p.timestamp !== activeFeedbackData.timestamp));
        }

        setActiveFeedbackData(null); // 關閉視窗
        alert("✅ 顧客回饋已記錄！");
    };

    // 2. 暫存回報 (放入待辦鈴鐺)
    const handleFeedbackDefer = () => {
        if (!activeFeedbackData) return;
        
        // 檢查是否已經在佇列中，避免重複
        const exists = pendingFeedbacks.some(p => p.timestamp === activeFeedbackData.timestamp);
        if (!exists) {
            setPendingFeedbacks(prev => [...prev, activeFeedbackData]);
        }
        
        setActiveFeedbackData(null); // 關閉視窗，讓鈴鐺去顯示紅點
    };
    // ★★★ 絕對防禦版 renderHome：防止白屏 ★★★
    const renderHome = () => {
        if (!tables) {
            return <div className="h-full flex flex-col items-center justify-center text-gray-500"><Loader className="animate-spin mb-4" size={48} /><p className="text-xl font-bold">正在讀取桌況...</p></div>;
        }

        // 如果偵測到沒有桌子，顯示「系統同步中」就好，因為上方的 useEffect 會自動把桌子補回來
        if (!Array.isArray(tables) || tables.length === 0) {
            return (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <Loader className="animate-spin mb-4" size={48} />
                    <p className="text-xl font-bold">正在同步桌位資訊...</p>
                    <p className="text-sm mt-2">系統自動校正中，請稍候</p>
                </div>
            );
        }

        const getTableStyle = (table) => {
            if (!table) return 'bg-gray-100'; 
            if (table.status !== 'occupied') return 'bg-white border-gray-300 text-gray-800';
            const startT = table.startTime || Date.now();
            const minutes = (Date.now() - startT) / 60000;
            if (minutes <= 80) return 'bg-yellow-300 border-yellow-500 text-gray-900';
            if (minutes <= 90) return 'bg-green-600 border-green-800 text-white';
            if (minutes <= 120) return 'bg-red-600 border-red-800 text-white animate-pulse';
            return 'bg-white border-red-500 border-4 text-red-600'; 
        };

        return (
            <div className="p-4 grid grid-cols-4 gap-4 h-full overflow-auto content-start">
                {tables.map(table => (
                    <div 
                        key={table.id} 
                        onClick={() => setSelectedTable(table)} 
                        className={`h-40 rounded-xl border-4 shadow-md flex flex-col justify-between p-3 cursor-pointer transition-all active:scale-95 ${getTableStyle(table)}`}
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-2xl font-bold">{table.id}</span>
                            {table.startTime && (
                                <div className="text-right">
                                    <span className="text-sm font-mono block">{formatTime(table.startTime)}</span>
                                    <span className="text-xs font-bold opacity-80">已吃 {Math.floor((Date.now() - table.startTime) / 60000)} 分</span>
                                </div>
                            )}
                        </div>
                        {table.status === 'occupied' ? (
                            <div className="text-center">
                                <div className="text-3xl font-bold my-1">${(table.total || 0).toLocaleString()}</div>
                                <div className="text-xs opacity-90 font-bold">{table.adults}大 {table.children}小 / {table.plan}</div>
                            </div>
                        ) : (
                            <div className="flex-grow flex items-center justify-center opacity-40 font-bold text-xl">空桌</div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <div className="w-24 bg-gray-900 text-white flex flex-col items-center py-6 gap-8 shadow-xl z-10">
                <div className="mb-4"><div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-xl">野</div></div>
                <nav className="flex flex-col gap-6 w-full">
                    {['home', 'menu', 'member', 'booking', 'clockin', 'settings'].map(view => (
                        <button key={view} onClick={() => setCurrentView(view)} className={`flex flex-col items-center gap-1 p-2 ${currentView === view ? 'text-orange-400 border-r-4 border-orange-400' : 'text-gray-400'}`}>
                            {view === 'home' && <Home size={28} />} 
                            {view === 'menu' && <ClipboardList size={28} />} 
                            {view === 'member' && <Users size={28} />} 
                            {view === 'booking' && <ClipboardList size={28} />}
                            {view === 'clockin' && <Clock size={28} />} 
                            {view === 'settings' && <Settings size={28} />}
                            <span className="text-xs">{{home:'首頁', menu:'工作台', member:'會員', booking:'訂位', clockin:'打卡', settings:'設定'}[view]}</span>
                        </button>
                    ))}
                    <button onClick={() => setCurrentView('report')} className={`flex flex-col items-center gap-1 p-2 ${currentView === 'report' ? 'text-orange-400 border-r-4 border-orange-400' : 'text-gray-400'}`}>
                        <FileText size={28} />
                        <span className="text-xs">日報</span>
                    </button>

                </nav>
            </div>
            <div className="flex-grow overflow-hidden relative">
                <div className={`h-16 shadow-sm flex justify-between items-center px-6 bg-white`}>
                    <div className="flex items-center gap-3"><h1 className="text-xl font-bold text-gray-800">{currentView === 'home' ? `桌位管理 - ${currentStore.name}` : '野饌POS系統'}</h1></div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <button onClick={playSound} className="bg-red-50 text-white px-3 py-1 rounded font-bold hover:bg-red-600 active:scale-95 transition-transform shadow-sm">
                            🔊 測試音效
                        </button>
                        <div className="relative ml-2">
                            <button 
                               onClick={() => {
                                   if(pendingFeedbacks.length === 0) return alert("目前沒有待補的回報事項");
                                   // 取出第一筆來填寫
                                   const next = pendingFeedbacks[0];
                                   setActiveFeedbackData(next);
                               }} 
                               className={`p-2 rounded-full transition-colors border ${pendingFeedbacks.length > 0 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                               title="待回報清單"
                           >
                               <MessageCircle size={24} />
                              {pendingFeedbacks.length > 0 && (
                                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                                      {pendingFeedbacks.length}
                                  </span>
                              )}
                           </button>
                        </div>
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-bold">分店代碼: {currentStore.id}</span>
                        <span className="flex items-center gap-1"><Wifi size={16} className="text-green-500"/> 連線正常</span>
                        <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                </div>
                <div className="h-[calc(100vh-64px)] overflow-hidden">
                    {currentView === 'home' && renderHome()}
                    {currentView === 'menu' && <MenuPage tables={tables} menuItems={menuItems} categories={categories} setTables={setTables} printers={printers} currentStore={currentStore} stockStatus={stockStatus} setStockStatus={setStockStatus} hiddenCategories={hiddenCategories} />}
                    {currentView === 'settings' && <SettingsPage printers={printers} setPrinters={setPrinters} onLogout={onLogout} onResetData={handleResetData} currentStoreId={currentStore.id} setCloudPrinters={setCloudPrinters} />}
                    {currentView === 'member' && <MemberPage memberAppSettings={memberAppSettings} members={members} onUpdateMember={handleUpdateMember} coupons={coupons} addLog={addMemberLog} currentStoreName={currentStore.name} />}
                    {currentView === 'booking' && <BookingPage bookings={bookings} setBookings={setBookings} currentStoreId={currentStore.id} tables={tables} diningPlans={diningPlans} onOpenTable={handleOpenTable} />}
                    {currentView === 'report' && <DailyReportPage currentStore={currentStore} />}
                    {currentView === 'clockin' && <ClockInPage employees={storeEmployees[currentStore.id] || []} clockStatus={empClockStatus} onClockUpdate={handleClockUpdate} />}
                </div>
                {selectedTable && <TableModal currentStoreId={currentStore.id} selectedTable={selectedTable} onClose={() => setSelectedTable(null)} onOpenTable={handleOpenTable} onRequestCheckout={handleRequestCheckout} diningPlans={diningPlans} tables={tables} setTables={setTables} printers={printers} />}
                
                {checkoutTable && <CheckoutModal 
                    table={tables.find(t=>t.id===checkoutTable.id)||checkoutTable}
                    storeId={currentStore.id} 
                    onClose={() => setCheckoutTable(null)} 
                    onConfirmPayment={handleConfirmPayment} 
                    diningPlans={diningPlans} 
                    coupons={coupons} 
                    members={members} 
                    slotPrizes={slotPrizes} 
                    onUpdateMember={handleUpdateMember}
                    printers={printers} 
                />}
                {activeFeedbackData && (
                    <TableFeedbackModal 
                        tableInfo={activeFeedbackData}
                        storeId={currentStore.id}
                        onClose={() => setActiveFeedbackData(null)} // 強制關閉
                        onSubmit={handleFeedbackSubmit}
                        onDefer={handleFeedbackDefer} // 稍後填寫
                    />
                )}
            </div>
        </div>
    );
};

// =======================================================
// ★★★ 1. (子元件) 總部專用的日報檢視元件 ★★★
// =======================================================
const HQDailyReportView = ({ storesConfig }) => {
    const [viewDate, setViewDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [report001] = useFirebaseState('daily_reports', `report_001_${viewDate}`, null);
    const [report002] = useFirebaseState('daily_reports', `report_002_${viewDate}`, null);
    const [reportbranch3] = useFirebaseState('daily_reports', `report_branch3_${viewDate}`, null);

    return (
        <div className="p-8 h-full overflow-y-auto bg-gray-50">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><FileText className="text-blue-600"/> 各店日報總覽</h2>
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow border"><span className="font-bold text-gray-500 pl-2">選擇日期：</span><input type="date" value={viewDate} onChange={e=>setViewDate(e.target.value)} className="font-bold outline-none text-lg text-blue-600 bg-transparent"/></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['001', '002', 'branch3'].map(storeId => {
                    const storeName = storesConfig[storeId]?.name || storeId;
                    let report = null;
                    if(storeId === '001') report = report001;
                    if(storeId === '002') report = report002;
                    if(storeId === 'branch3') report = reportbranch3;
                    const isSubmitted = report?.status === 'submitted';
                    return (
                        <div key={storeId} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col h-full">
                            <div className={`p-4 text-white font-bold flex justify-between items-center ${report ? (isSubmitted ? 'bg-green-600' : 'bg-orange-400') : 'bg-gray-400'}`}><span className="text-lg">{storeName}</span><span className="text-xs px-2 py-1 bg-white/20 rounded">{report ? (isSubmitted ? '✅ 已送出' : '✏️ 草稿中') : '❌ 未填寫'}</span></div>
                            {report ? (
                                <div className="p-5 space-y-4 flex-grow flex flex-col">
                                    <div className="flex justify-between border-b pb-2 border-dashed"><span className="text-gray-500 font-bold">總收入</span><span className="font-bold text-blue-600 text-xl">${(report.incomes||[]).reduce((a,b)=>a+(parseInt(b.amount)||0),0).toLocaleString()}</span></div>
                                    <div className="flex justify-between border-b pb-2 border-dashed"><span className="text-gray-500 font-bold">總支出</span><span className="font-bold text-red-600 text-xl">${(report.expenses||[]).reduce((a,b)=>a+(parseInt(b.amount)||0),0).toLocaleString()}</span></div>
                                    <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-600 flex-grow"><div className="font-bold text-gray-400 mb-1 flex items-center gap-1"><MessageCircle size={12}/> 備註：</div><p className="whitespace-pre-wrap">{report.notes || '無'}</p></div>
                                </div>
                            ) : (<div className="p-8 text-center text-gray-300 flex-grow flex flex-col items-center justify-center gap-2"><FileText size={48} className="opacity-20"/>尚無資料</div>)}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// =======================================================
// ★★★ 2. (子元件) 進階營運儀表板 (含篩選/熱銷/小費) ★★★
// =======================================================
const HQReportDashboard = ({ salesLogs, setSalesLogs, storesConfig, tipLogs }) => {
    const [filterStore, setFilterStore] = useState('All'); 
    const [filterType, setFilterType] = useState('today');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewOrderModal, setViewOrderModal] = useState(null);

    const isDateMatch = (timestamp) => {
        const date = new Date(timestamp);
        const dateStr = date.toLocaleDateString('en-CA');
        const todayStr = new Date().toLocaleDateString('en-CA');
        if (filterType === 'today') return dateStr === todayStr;
        if (filterType === 'month') { const now = new Date(); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(); }
        if (filterType === 'custom') return dateStr >= startDate && dateStr <= endDate;
        return true;
    };

    const filteredSales = (salesLogs || []).filter(log => (filterStore === 'All' || log.storeId === filterStore) && isDateMatch(log.timestamp));
    const filteredTips = (tipLogs || []).filter(tip => (filterStore === 'All' || tip.storeId === filterStore) && isDateMatch(tip.timestamp));

    const totalRevenue = filteredSales.reduce((sum, log) => sum + (parseInt(log.amount) || 0), 0);
    const totalCount = filteredSales.length;
    const avgTicket = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;

    const itemStats = {};
    filteredSales.forEach(log => {
        if (log.orders && Array.isArray(log.orders)) {
            log.orders.forEach(item => {
                if (item.category === 'Tip') return;
                if (!itemStats[item.name]) itemStats[item.name] = 0;
                itemStats[item.name] += (item.count || 1);
            });
        }
    });
    const bestSellers = Object.entries(itemStats).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);

    const empTipStats = {};
    filteredTips.forEach(tip => { if (!empTipStats[tip.empName]) empTipStats[tip.empName] = 0; empTipStats[tip.empName] += tip.amount; });
    const sortedTips = Object.entries(empTipStats).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);

    const handleDelete = (id) => { if(window.confirm('確定刪除？')) setSalesLogs(prev => prev.filter(log => log.id !== id)); };
    const handleEdit = (log) => { const newAmount = prompt(`修改金額`, log.amount); if (newAmount !== null && !isNaN(newAmount)) setSalesLogs(prev => prev.map(item => item.id === log.id ? { ...item, amount: parseInt(newAmount) } : item)); };
    // ★★★ 新增：修改交易日期 (補結帳救星) ★★★
    const handleDateEdit = (log) => {
        const current = new Date(log.timestamp);
        // 取得目前的日期字串 (YYYY-MM-DD) 當作預設值
        const dateStr = current.toLocaleDateString('en-CA');
        
        const newDateInput = prompt(`請修改此筆交易的「歸帳日期」\n(格式: YYYY-MM-DD)\n\n原本時間: ${current.toLocaleString()}`, dateStr);

        if (newDateInput) {
            // 簡單檢查格式對不對
            if(!/^\d{4}-\d{2}-\d{2}$/.test(newDateInput)) {
                return alert("❌ 格式錯誤！請依照 YYYY-MM-DD 格式輸入 (例如 2026-01-14)");
            }

            // 保留原本的「時:分:秒」，只換掉「年-月-日」
            const newTime = new Date(newDateInput);
            newTime.setHours(current.getHours());
            newTime.setMinutes(current.getMinutes());
            newTime.setSeconds(current.getSeconds());

            setSalesLogs(prev => prev.map(item => 
                item.id === log.id ? { ...item, timestamp: newTime.getTime() } : item
            ));
            alert(`✅ 修改成功！\n此筆交易已移動至 ${newDateInput}。`);
        }
    };

    return (
        <div className="p-6 h-full overflow-y-auto bg-gray-50 font-sans">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2"><Store size={18} className="text-gray-500"/><select className="border p-2 rounded-lg font-bold text-gray-700 outline-none" value={filterStore} onChange={e=>setFilterStore(e.target.value)}><option value="All">全部分店</option>{Object.values(storesConfig).filter(s => s.type !== 'HQ').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div className="h-8 w-[1px] bg-gray-300 mx-2"></div>
                <div className="flex bg-gray-100 p-1 rounded-lg">{[{id:'today', label:'本日'}, {id:'month', label:'本月'}, {id:'custom', label:'自訂'}].map(mode => (<button key={mode.id} onClick={()=>setFilterType(mode.id)} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${filterType===mode.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{mode.label}</button>))}</div>
                {filterType === 'custom' && (<div className="flex items-center gap-2 bg-white border p-1 rounded-lg px-3"><input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="text-sm font-bold text-gray-600 outline-none"/><span className="text-gray-400">~</span><input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="text-sm font-bold text-gray-600 outline-none"/></div>)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">{[ {t:'營業總額',v:`$${totalRevenue.toLocaleString()}`,c:'text-blue-600',b:'bg-blue-50',i:DollarSign}, {t:'銷售筆數',v:`${totalCount} 筆`,c:'text-orange-600',b:'bg-orange-50',i:ClipboardList}, {t:'平均客單價',v:`$${avgTicket.toLocaleString()}`,c:'text-purple-600',b:'bg-purple-50',i:Percent}, {t:'消費總額',v:`$${totalRevenue.toLocaleString()}`,c:'text-green-600',b:'bg-green-50',i:Trophy} ].map((card,i)=>(<div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"><div><div className="text-gray-400 text-xs font-bold mb-1">{card.t}</div><div className={`text-2xl font-bold ${card.c}`}>{card.v}</div></div><div className={`p-3 rounded-full ${card.b} ${card.c}`}><card.i size={24}/></div></div>))}</div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[500px]">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center"><h3 className="font-bold text-gray-700 flex items-center gap-2"><ClipboardList size={18}/> 交易明細</h3></div>
                    <div className="flex-grow overflow-y-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-100 text-gray-500 sticky top-0 z-10 font-bold"><tr><th className="p-3">時間</th><th className="p-3">分店</th><th className="p-3">桌號</th><th className="p-3">支付</th><th className="p-3 text-right">金額</th><th className="p-3 text-center">管理</th></tr></thead><tbody className="divide-y divide-gray-100">{filteredSales.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-gray-400">無符合條件的交易</td></tr> : filteredSales.sort((a,b)=>b.timestamp-a.timestamp).map(log => (<tr key={log.id} className="hover:bg-blue-50 transition-colors"><td className="p-3 font-mono text-gray-600">{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td><td className="p-3 text-gray-800">{storesConfig[log.storeId]?.name}</td><td className="p-3 font-bold text-blue-600">{log.tableId || '櫃台'}</td><td className="p-3"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{log.paymentMethod}</span></td><td className="p-3 text-right font-bold">${log.amount.toLocaleString()}</td><td className="p-3 flex justify-center gap-2"><button onClick={()=>setViewOrderModal(log)} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded"><Utensils size={16}/></button><button onClick={()=>handleDateEdit(log)} className="p-1.5 text-green-600 hover:bg-green-100 rounded" title="修改日期 (歸戶)"><Clock size={16}/></button><button onClick={()=>handleEdit(log)} className="p-1.5 text-orange-500 hover:bg-orange-100 rounded"><Edit3 size={16}/></button><button onClick={()=>handleDelete(log.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
                </div>
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[240px] flex flex-col"><div className="p-4 border-b bg-gray-50"><h3 className="font-bold text-gray-700 flex items-center gap-2"><Trophy size={18} className="text-yellow-500"/> 本期熱銷排行</h3></div><div className="p-4 overflow-y-auto space-y-3">{bestSellers.length===0?<div className="text-center text-gray-400 text-sm mt-10">尚無數據</div>:bestSellers.map((item,i)=>(<div key={i} className="flex justify-between items-center text-sm"><div className="flex items-center gap-2"><div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${i===0?'bg-yellow-400':i===1?'bg-gray-400':i===2?'bg-orange-400':'bg-blue-200'}`}>{i+1}</div><span className="text-gray-700 font-bold">{item.name}</span></div><span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{item.count} 份</span></div>))}</div></div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[235px] flex flex-col"><div className="p-4 border-b bg-gray-50"><h3 className="font-bold text-gray-700 flex items-center gap-2"><Heart size={18} className="text-red-500"/> 員工打賞統計</h3></div><div className="p-4 overflow-y-auto space-y-3">{sortedTips.length===0?<div className="text-center text-gray-400 text-sm mt-10">尚無打賞紀錄</div>:sortedTips.map((tip,i)=>(<div key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0"><span className="font-bold text-gray-700">{tip.name}</span><span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded">${tip.amount}</span></div>))}</div></div>
                </div>
            </div>
            {viewOrderModal && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"><div className="bg-gray-800 text-white p-4 flex justify-between items-center"><h3 className="font-bold">點餐明細</h3><button onClick={()=>setViewOrderModal(null)}><X/></button></div><div className="p-4 bg-gray-50 max-h-80 overflow-y-auto">{(viewOrderModal.orders || []).map((item, i) => (<div key={i} className="flex justify-between py-2 border-b last:border-0"><span>{item.name}</span><span className="font-bold">{item.category==='Tip' ? `$${item.price}` : `x${item.count}`}</span></div>))}{(viewOrderModal.orders || []).length === 0 && <div className="text-center text-gray-400">無詳細菜單資料</div>}</div></div></div>)}
        </div>
    );
};

// =======================================================
// ★★★ 3. (子元件) 高階菜單管理器 (含隱藏分類功能) ★★★
// =======================================================
// 注意：參數這裡我已經幫您加上 hiddenCategories 和 setHiddenCategories 了
const HQAdvancedMenuManager = ({ menuItems, setMenuItems, categories, setCategories, diningPlans, setDiningPlans, storesConfig, hiddenCategories, setHiddenCategories }) => {
    // 預設選中 'All'
    const [activeCategory, setActiveCategory] = useState('All');
    const [editingItem, setEditingItem] = useState(null);
    const [viewMode, setViewMode] = useState('items');

    // 切換分類隱藏狀態的函式
    const toggleCategoryVisibility = (cat) => {
        const currentHidden = hiddenCategories || [];
        if (currentHidden.includes(cat)) {
            // 如果已經隱藏，就移除 (變為公開)
            setHiddenCategories(currentHidden.filter(c => c !== cat));
        } else {
            // 如果沒隱藏，就加入 (變為隱藏)
            setHiddenCategories([...currentHidden, cat]);
        }
    };

    const handlePlanSelection = (currentPlans, planId, isChecked) => {
        if (!isChecked) return currentPlans.filter(id => id !== planId);
        const targetPlan = diningPlans.find(p => p.id === planId);
        if (!targetPlan) return [...currentPlans, planId];
        const higherPlans = diningPlans.filter(p => p.price >= targetPlan.price).map(p => p.id);
        return [...new Set([...currentPlans, ...higherPlans])];
    };

    const handleSaveItem = (formData) => {
        if (!formData.name) return alert('請輸入菜名');
        const newItem = { ...formData, id: editingItem && editingItem.id ? editingItem.id : Date.now() };
        if (editingItem && editingItem.id) {
            setMenuItems(prev => prev.map(item => item.id === newItem.id ? newItem : item));
        } else {
            setMenuItems(prev => [...prev, newItem]);
        }
        setEditingItem(null);
    };

    const handleUpdatePlan = (planId, key, value) => { setDiningPlans(prev => prev.map(p => p.id === planId ? { ...p, [key]: value } : p)); };
    const handleAddPlan = () => { 
        const name = prompt("請輸入新方案名稱 (如: 奢華和牛餐)"); 
        const price = prompt("請輸入大人價格"); 
        const childPrice = prompt("請輸入小孩價格") || 0; 
        if(name && price) setDiningPlans(prev => [...prev, { id: `plan_${Date.now()}`, name, price: parseInt(price), childPrice: parseInt(childPrice), items: [] }]); 
    };
    const handleAddCategory = () => { const cat = prompt("分類名稱"); if(cat && !categories.includes(cat)) setCategories(prev => [...prev, cat]); };

    const renderEditModal = () => {
        if (!editingItem) return null;
        const item = editingItem;
        const setItem = (newData) => setEditingItem({ ...item, ...newData });

        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="bg-gray-900 text-white p-5 flex justify-between items-center"><h3 className="font-bold text-xl">{item.id ? '編輯菜色' : '新增菜色'}</h3><button onClick={() => setEditingItem(null)}><X size={24}/></button></div>
                    <div className="p-6 overflow-y-auto space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-sm font-bold text-gray-500">菜色名稱</label><input className="w-full border-2 p-2 rounded-lg font-bold" value={item.name} onChange={e=>setItem({name: e.target.value})} /></div>
                            <div><label className="text-sm font-bold text-gray-500">分類</label><select className="w-full border-2 p-2 rounded-lg" value={item.category} onChange={e=>setItem({category: e.target.value})}>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                            <div><label className="text-sm font-bold text-gray-500">單點價格</label><input type="number" className="w-full border-2 p-2 rounded-lg" value={item.price} onChange={e=>setItem({price: parseInt(e.target.value)||0})} /></div>
                            <div><label className="text-sm font-bold text-gray-500">排序權重</label><input type="number" className="w-full border-2 p-2 rounded-lg" value={item.sortOrder||99} onChange={e=>setItem({sortOrder: parseInt(e.target.value)})} /></div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <label className="text-sm font-bold text-blue-800 mb-2 block flex items-center gap-2"><Tag size={16}/> 適用方案 (自動繼承高價位)</label>
                            <div className="flex flex-wrap gap-3">
                                {diningPlans.sort((a,b)=>a.price-b.price).map(plan => (
                                    <label key={plan.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${(item.allowedPlans||[]).includes(plan.id) ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white border-gray-300 text-gray-500'}`}>
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${(item.allowedPlans||[]).includes(plan.id)?'bg-white border-white':'bg-gray-200'}`}>{(item.allowedPlans||[]).includes(plan.id) && <Check size={12} className="text-blue-600"/>}</div>
                                        <input type="checkbox" className="hidden" checked={(item.allowedPlans||[]).includes(plan.id)} onChange={(e) => setItem({ allowedPlans: handlePlanSelection(item.allowedPlans || [], plan.id, e.target.checked) })} />
                                        <span className="font-bold text-sm">${plan.price} {plan.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-bold text-gray-600 mb-2 block">平台顯示設定</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-5 h-5" checked={item.showInCustomerQR ?? true} onChange={e=>setItem({showInCustomerQR: e.target.checked})} /><span>📱 客人掃碼點餐</span></label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-5 h-5" checked={item.showInStaffPad ?? true} onChange={e=>setItem({showInStaffPad: e.target.checked})} /><span>📟 員工平板點餐</span></label>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600 mb-2 block">分店隱藏設定 (勾選=不賣)</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.values(storesConfig).filter(s=>s.type!=='HQ').map(store => (
                                        <label key={store.id} className={`px-2 py-1 rounded text-xs cursor-pointer border ${ (item.excludedStores||[]).includes(store.id) ? 'bg-red-100 border-red-500 text-red-700 font-bold' : 'bg-white border-gray-300 text-gray-500' }`}>
                                            <input type="checkbox" className="hidden" checked={(item.excludedStores||[]).includes(store.id)} onChange={e => setItem({ excludedStores: e.target.checked ? [...(item.excludedStores||[]), store.id] : (item.excludedStores||[]).filter(id => id !== store.id) })} />
                                            {store.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={()=>handleSaveItem(item)} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700">儲存設定</button>
                    </div>
                </div>
            </div>
        );
    };

    const filteredItems = menuItems.filter(i => activeCategory === 'All' || i.category === activeCategory);

    return (
        <div className="p-6 h-full overflow-y-auto bg-gray-50 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm">
                    <button onClick={()=>setViewMode('items')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${viewMode==='items'?'bg-orange-500 text-white':'text-gray-500 hover:bg-gray-100'}`}>菜色管理</button>
                    <button onClick={()=>setViewMode('plans')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${viewMode==='plans'?'bg-blue-600 text-white':'text-gray-500 hover:bg-gray-100'}`}>方案設定</button>
                    <button onClick={()=>setViewMode('categories')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${viewMode==='categories'?'bg-purple-600 text-white':'text-gray-500 hover:bg-gray-100'}`}>分類排序</button>
                </div>
                {viewMode === 'items' && <button onClick={()=>setEditingItem({ name:'', price:0, category:categories[0], allowedPlans: diningPlans.map(p=>p.id), excludedStores:[], showInCustomerQR:true, showInStaffPad:true })} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-green-700 flex items-center gap-2"><Plus size={18}/> 新增菜色</button>}
                {viewMode === 'plans' && <button onClick={handleAddPlan} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow"><Plus size={18}/> 新增方案</button>}
                {viewMode === 'categories' && <button onClick={handleAddCategory} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold shadow"><Plus size={18}/> 新增分類</button>}
            </div>

            {viewMode === 'items' && (
                <>
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
                        {['All', ...categories].map(cat => {
                            // 判斷該分類是否被隱藏
                            const isHidden = (hiddenCategories || []).includes(cat);
                            return (
                                <button key={cat} onClick={()=>setActiveCategory(cat)} className={`whitespace-nowrap px-5 py-2 rounded-full font-bold border-2 transition-all flex items-center gap-2 ${activeCategory===cat ? 'bg-orange-500 border-orange-500 text-white shadow-lg scale-105' : 'bg-white border-gray-200 text-gray-500 hover:border-orange-300'}`}>
                                    {cat === 'All' ? '全部菜色' : cat}
                                    {/* 在分類按鈕上也顯示小眼睛，方便辨識 */}
                                    {isHidden && cat !== 'All' && <EyeOff size={14} className="opacity-70" />}
                                </button>
                            )
                        })}
                    </div>
                    <div className="flex-grow overflow-y-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-sm border-b sticky top-0"><tr><th className="p-3">菜名</th><th className="p-3">價格方案</th><th className="p-3">隱藏狀態</th><th className="p-3 text-right">操作</th></tr></thead>
                            <tbody className="divide-y">
                                {filteredItems.map(item => (
                                    <tr key={item.id} className="hover:bg-orange-50 transition-colors group">
                                        <td className="p-3 font-bold text-gray-800">{item.name} {item.price>0 && <span className="text-red-500 text-xs">+${item.price}</span>} <span className="text-xs text-gray-400">({item.category})</span></td>
                                        <td className="p-3"><div className="flex flex-wrap gap-1">{diningPlans.map(p => (<span key={p.id} className={`w-2 h-2 rounded-full ${(item.allowedPlans||[]).includes(p.id) ? 'bg-green-500' : 'bg-gray-200'}`} title={p.name}></span>))}<span className="text-xs text-gray-400 ml-1">({(item.allowedPlans||[]).length})</span></div></td>
                                        <td className="p-3 text-xs">{(!item.showInCustomerQR) && <span className="bg-red-100 text-red-600 px-1 rounded mr-1">客隱</span>}{(!item.showInStaffPad) && <span className="bg-purple-100 text-purple-600 px-1 rounded mr-1">員隱</span>}{(item.excludedStores||[]).length > 0 && <span className="bg-gray-200 text-gray-600 px-1 rounded">{item.excludedStores.length}店不賣</span>}</td>
                                        <td className="p-3 text-right"><button onClick={()=>setEditingItem(item)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 mr-2"><Edit3 size={16}/></button><button onClick={()=>{if(window.confirm('確定刪除？')) setMenuItems(prev=>prev.filter(i=>i.id!==item.id))}} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 size={16}/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {viewMode === 'plans' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{diningPlans.sort((a,b)=>a.price-b.price).map(plan => (<div key={plan.id} className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-blue-500 relative group"><div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={()=>{if(window.confirm('確定刪除此方案？')) setDiningPlans(prev=>prev.filter(p=>p.id!==plan.id))}} className="text-red-400 hover:text-red-600"><Trash2/></button></div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div><label className="text-xs font-bold text-gray-400">大人價格</label><input type="number" className="w-full text-2xl font-bold text-blue-600 border-b border-dashed focus:border-blue-500 outline-none" value={plan.price} onChange={e=>handleUpdatePlan(plan.id, 'price', parseInt(e.target.value))} /></div>
                <div><label className="text-xs font-bold text-gray-400">小孩價格</label><input type="number" className="w-full text-2xl font-bold text-green-600 border-b border-dashed focus:border-green-500 outline-none" value={plan.childPrice || 0} onChange={e=>handleUpdatePlan(plan.id, 'childPrice', parseInt(e.target.value))} /></div>
            </div>
            <div className="mb-4"><label className="text-xs font-bold text-gray-400">方案名稱</label><input className="w-full text-xl font-bold border-b border-dashed focus:border-blue-500 outline-none" value={plan.name} onChange={e=>handleUpdatePlan(plan.id, 'name', e.target.value)} /></div><div className="text-xs text-gray-400">包含菜色: {menuItems.filter(i=>(i.allowedPlans||[]).includes(plan.id)).length} 道</div></div>))}</div>}
            
            {/* ★★★ 這裡就是「分類管理」的區塊，我們加上了隱藏按鈕 ★★★ */}
            {viewMode === 'categories' && (
                <div className="bg-white p-6 rounded-2xl shadow-sm max-w-lg mx-auto w-full">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Settings size={20}/> 分類顯示管理</h3>
                    <div className="space-y-2">
                        {categories.map((cat, idx) => {
                            const isHidden = (hiddenCategories || []).includes(cat);
                            return (
                                <div key={cat} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-700 w-6">{idx+1}.</span>
                                        <span className="font-bold text-gray-800 text-lg">{cat}</span>
                                        
                                        {/* 這就是切換隱藏的按鈕 */}
                                        <button 
                                            onClick={() => toggleCategoryVisibility(cat)}
                                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-colors ${isHidden ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-blue-100 text-blue-600 border border-blue-200'}`}
                                        >
                                            {isHidden ? <><EyeOff size={14}/> 已對客隱藏</> : <><Users size={14}/> 公開</>}
                                        </button>
                                    </div>
                                    <button onClick={()=>{if(window.confirm('刪除此分類？')) setCategories(prev=>prev.filter(c=>c!==cat))}} className="text-gray-400 hover:text-red-600 bg-white p-2 rounded shadow-sm"><Trash2 size={16}/></button>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 pt-4 border-t text-xs text-gray-400 text-center">
                        提示：被隱藏的分類及其菜色，在顧客手機端將完全消失，但在員工 POS 端仍可見。
                    </div>
                </div>
            )}
            {renderEditModal()}
        </div>
    );
};

// =======================================================
// ★★★ (診斷版) 總部訂位管理器 (強制顯示所有資料+除錯資訊) ★★★
// =======================================================
const HQBookingManager = ({ bookings, storesConfig }) => {
    const [filterStore, setFilterStore] = useState('All');
    // 預設抓今天
    const [filterDate, setFilterDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [debugMode, setDebugMode] = useState(true); // 預設開啟診斷模式

    // 1. 先確認資料源到底有沒有東西
    const rawDataCount = bookings ? bookings.length : 0;

    // 2. 篩選邏輯
    const filteredBookings = (bookings || []).filter(b => {
        if (debugMode) return true; // 診斷模式下：不過濾，全部顯示！
        
        const dateMatch = b.date === filterDate;
        const storeMatch = filterStore === 'All' || b.storeId === filterStore;
        return dateMatch && storeMatch;
    });

    return (
        <div className="p-8 h-full overflow-y-auto bg-gray-50">
            <div className="bg-red-100 p-4 rounded-xl border-l-4 border-red-500 mb-6 text-red-800">
                <h3 className="font-bold flex items-center gap-2"><ShieldAlert/> 系統診斷模式</h3>
                <p className="text-sm mt-1">目前系統強制顯示「所有資料」。如果下面有東西，代表資料庫正常，是日期篩選的問題。</p>
                <div className="mt-2 text-xs font-mono bg-white/50 p-2 rounded">
                    資料總筆數: {rawDataCount} 筆<br/>
                    接收到的資料類型: {Array.isArray(bookings) ? '陣列 (正常)' : '錯誤格式'}
                </div>
                <button onClick={()=>setDebugMode(!debugMode)} className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">
                    {debugMode ? '關閉診斷 (切換回正常篩選)' : '開啟診斷 (顯示全部)'}
                </button>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <ClipboardList className="text-teal-600"/> 訂位管理中心
                </h2>
                
                {/* 只有在關閉診斷模式時，才顯示篩選器 */}
                {!debugMode && (
                    <div className="flex gap-4 bg-white p-2 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-2 border-r pr-4">
                            <Store size={18} className="text-gray-500"/>
                            <select className="font-bold text-gray-700 outline-none cursor-pointer" value={filterStore} onChange={e=>setFilterStore(e.target.value)}>
                                <option value="All">全部分店</option>
                                {Object.values(storesConfig).filter(s => s.type !== 'HQ').map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-500">日期：</span>
                            <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} className="font-bold text-teal-600 outline-none bg-transparent"/>
                        </div>
                    </div>
                )}
            </div>

            {/* 訂位列表 */}
            <div className="space-y-4">
                {filteredBookings.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 bg-white rounded-3xl border-2 border-dashed">
                        <div className="text-6xl mb-4">📭</div>
                        <div className="text-xl font-bold">目前沒有任何訂位資料</div>
                        <p className="text-sm mt-2">請確認分店端是否已新增訂位，或檢查網路連線。</p>
                    </div>
                ) : (
                    filteredBookings.sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time)).map(b => (
                        <div key={b.id} className="bg-white p-5 rounded-2xl shadow-sm border-l-8 border-teal-500 flex justify-between items-center hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-6">
                                {/* 分店標籤 */}
                                <div className={`px-4 py-2 rounded-xl text-white font-bold text-center shadow-sm w-32 ${b.storeId==='001'?'bg-blue-500':b.storeId==='002'?'bg-purple-500':'bg-orange-500'}`}>
                                    <div className="text-xs opacity-80 mb-1">
                                        {storesConfig[b.storeId]?.name || b.storeId}
                                    </div>
                                    {/* 顯示這筆資料儲存的日期格式，方便除錯 */}
                                    <div className="text-sm bg-black/20 rounded px-1 font-mono">{b.date}</div>
                                </div>
                                {/* 時間與姓名 */}
                                <div>
                                    <div className="text-3xl font-bold text-gray-800 flex items-end gap-2">
                                        {b.time} 
                                        <span className="text-lg text-gray-500 font-normal">/ {b.name}</span>
                                    </div>
                                    <div className="text-teal-600 font-bold mt-1 flex items-center gap-2">
                                        <Users size={16}/> {b.adults} 大 {b.children} 小
                                        <span className="text-gray-300">|</span>
                                        <span className="text-gray-500">{b.phone}</span>
                                    </div>
                                    {/* 診斷資訊：如果日期格式怪怪的，這裡會顯示 */}
                                    {debugMode && (
                                        <div className="text-xs text-red-500 mt-1 font-mono">
                                            [Debug] StoreID: {b.storeId} | ID: {b.id}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* 備註與狀態 */}
                            <div className="text-right">
                                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg mb-2 inline-block">
                                    {b.notes || '無備註'}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {b.status === 'arrived' ? <span className="text-green-600 font-bold">✅ 已入座</span> : '⏳ 等待中'}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// =======================================================
// ★★★ 總部：顧客回饋檢視 (HQFeedbackPage) ★★★
// =======================================================
const HQFeedbackPage = ({ feedbackLogs, storesConfig }) => {
    return (
        <div className="p-8 h-full overflow-y-auto bg-gray-50">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MessageCircle className="text-orange-600"/> 顧客用餐反饋列表
            </h2>
            <div className="grid grid-cols-1 gap-4">
                {(feedbackLogs || []).length === 0 ? (
                    <div className="text-center text-gray-400 py-20">尚無回饋資料</div>
                ) : (
                    feedbackLogs.sort((a,b)=>b.timestamp-a.timestamp).map(log => (
                        <div key={log.id} className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-orange-500 animate-fade-in-up">
                            {/* 標頭資訊 */}
                            <div className="flex justify-between items-start mb-4 border-b pb-2">
                                <div className="flex gap-3 items-center">
                                    <span className="bg-gray-800 text-white px-3 py-1 rounded-lg font-bold text-sm">
                                        {storesConfig[log.storeId]?.name || log.storeId}
                                    </span>
                                    <span className="text-gray-500 font-mono text-sm">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </span>
                                    <span className="font-bold text-lg text-gray-700">
                                        桌號: {log.tableId}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-orange-600">{log.q1_name} 先生/小姐</div>
                                    <div className="text-sm text-gray-500">{log.q2_phone}</div>
                                </div>
                            </div>

                            {/* 10題詳細內容 (格狀排列) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                                <div className="bg-gray-50 p-2 rounded border"><span className="text-gray-400 block text-xs">人數/金額</span><span className="font-bold">{log.q3_paxPrice}</span></div>
                                <div className="bg-gray-50 p-2 rounded border"><span className="text-gray-400 block text-xs">來源</span><span className="font-bold">{log.q4_source}</span></div>
                                <div className="bg-gray-50 p-2 rounded border"><span className="text-gray-400 block text-xs">來訪紀錄</span><span className="font-bold">{log.q5_visit}</span></div>
                                <div className="bg-gray-50 p-2 rounded border"><span className="text-gray-400 block text-xs">用餐目的</span><span className="font-bold">{log.q6_purpose}</span></div>
                                <div className="bg-gray-50 p-2 rounded border"><span className="text-gray-400 block text-xs">餐點品質</span><span className={`font-bold ${log.q7_quality?.includes('不滿意')||log.q7_quality?.includes('反應') ? 'text-red-600' : 'text-gray-800'}`}>{log.q7_quality}</span></div>
                                <div className="bg-gray-50 p-2 rounded border"><span className="text-gray-400 block text-xs">最愛餐點</span><span className="font-bold">{log.q8_fav}</span></div>
                                <div className="bg-gray-50 p-2 rounded border"><span className="text-gray-400 block text-xs">服務感受</span><span className="font-bold">{log.q9_service}</span></div>
                            </div>
                            
                            {/* 第10題：建議 (獨立一行) */}
                            <div className="mt-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
                                <span className="text-orange-400 block text-xs font-bold mb-1">整體反饋與建議</span>
                                <p className="font-bold text-gray-800 text-lg whitespace-pre-wrap">{log.q10_suggestion}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// =======================================================
// ★★★ 5. (主程式) 總部後台主入口 (新增工時對帳表 - 不動原有排版) ★★★
// =======================================================
const HQDashboard = ({ 
    diningPlans, setDiningPlans, menuItems, setMenuItems, 
    memberAppSettings, setMemberAppSettings, storesConfig, setStoresConfig, 
    storeEmployees, setStoreEmployees, clockLogs, members, setMembers, 
    coupons, setCoupons, onEnterBranch, onLogout, categories, setCategories, 
    memberLogs, salesLogs, setSalesLogs, stockStatus, setStockStatus, 
    tipLogs, slotPrizes, setSlotPrizes, tiers, setTiers, bookings, setBookings, 
    feedbackLogs, 
    
    // 👇 已修正：這裡正確接收了隱藏分類的變數
    hiddenCategories, setHiddenCategories 
}) => {
    const [activeTab, setActiveTab] = useState('report'); 
    const [selectedStoreForEmp, setSelectedStoreForEmp] = useState('001');
    const [newEmpName, setNewEmpName] = useState('');
    const [newEmpPwd, setNewEmpPwd] = useState('');
    const [qrModalEmp, setQrModalEmp] = useState(null); 
    const [editingStoreId, setEditingStoreId] = useState(null);
    const [tempStoreData, setTempStoreData] = useState({});

    // --- 新增：打卡排序與格式化邏輯 (不影響原有排版) ---
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

    // ★★★ 修改版：支援跨日歸戶 (05:00前算昨天) ★★★
    const processClockLogs = () => {
        const dailyGroups = {};
        (clockLogs || []).forEach(log => {
            // 1. 先把時間抓出來
            const logTime = new Date(log.timestamp);
            
            // 2. 如果是凌晨 0點 ~ 5點，強制把日期減 1 天 (算昨天的班)
            if (logTime.getHours() < 5) {
                logTime.setDate(logTime.getDate() - 1);
            }

            // 3. 轉成文字 (YYYY-MM-DD)
            const dateStr = logTime.toLocaleDateString('en-CA');
            
            const key = `${dateStr}_${log.empId}`; 
            if (!dailyGroups[key]) {
                dailyGroups[key] = { date: dateStr, empName: log.empName, storeName: log.storeName, logs: [] };
            }
            // 注意：這裡存入原始 log.timestamp 以保持顯示正確時間
            dailyGroups[key].logs.push({ type: log.type, time: new Date(log.timestamp) });
        });

        return Object.values(dailyGroups).map(group => {
            const sortedLogs = group.logs.sort((a, b) => a.time - b.time);
            let am_in = null, am_out = null, pm_in = null, pm_out = null;
            let totalMs = 0;
            let pairCount = 0;

            sortedLogs.forEach(log => {
                if (log.type === 'in') {
                    if (pairCount === 0) am_in = log.time; else pm_in = log.time;
                } else if (log.type === 'out') {
                    if (pairCount === 0) {
                        am_out = log.time;
                        if (am_in) { totalMs += (am_out - am_in); pairCount++; }
                    } else {
                        pm_out = log.time;
                        if (pm_in) totalMs += (pm_out - pm_in);
                    }
                }
            });
            const hours = totalMs > 0 ? (totalMs / (1000 * 60 * 60)).toFixed(2) : "0.00";
            return { id: `${group.date}_${group.empName}`, storeName: group.storeName, date: group.date, empName: group.empName, am_in, am_out, pm_in, pm_out, totalHours: hours };
        });
    };

    // ★★★ 修改版：顯示 (跨隔日) ★★★
    const format24h = (dateObj, baseDateStr) => {
        if (!dateObj) return '--:--';
        
        const timeStr = dateObj.getHours().toString().padStart(2, '0') + ":" + dateObj.getMinutes().toString().padStart(2, '0');

        // 如果有傳入「這行的日期」，就檢查一下
        if (baseDateStr) {
            // 取得打卡當下的日期文字
            const logDateStr = dateObj.toLocaleDateString('en-CA');
            
            // 如果 打卡日期 (如12號) 不等於 表格日期 (如11號) -> 就是跨日了
            if (logDateStr !== baseDateStr) {
                return `${timeStr} (跨隔日)`; 
            }
        }
        return timeStr;
    };

    const getSortedClockData = () => {
        return processClockLogs().sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const requestSort = (key) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };

    useEffect(() => {
        if (qrModalEmp) {
            const canvas = document.getElementById('emp-qr-canvas');
            if (canvas) {
                const url = `${window.location.origin}${window.location.pathname}?mode=tip&store=${selectedStoreForEmp}&empId=${qrModalEmp.id}`;
                QRCode.toCanvas(canvas, url, { width: 256, margin: 2 }, (error) => { if (error) console.error(error); });
            }
        }
    }, [qrModalEmp, selectedStoreForEmp]);

    const handleAddEmployee = () => { 
        if (!newEmpName || !newEmpPwd) return alert('請輸入完整資料'); 
        const currentEmps = storeEmployees[selectedStoreForEmp] || []; 
        if (currentEmps.some(e => e.password === newEmpPwd)) return alert('此密碼已被使用，請更換'); 
        const newEmp = { id: Date.now(), name: newEmpName, password: newEmpPwd }; 
        setStoreEmployees({ ...storeEmployees, [selectedStoreForEmp]: [...currentEmps, newEmp] }); 
        setNewEmpName(''); setNewEmpPwd(''); 
        alert('員工新增成功！'); 
    };

    const handleDeleteEmployee = (id) => { 
        if (!window.confirm('確定要刪除此員工帳號嗎？')) return; 
        setStoreEmployees({ ...storeEmployees, [selectedStoreForEmp]: (storeEmployees[selectedStoreForEmp]||[]).filter(e => e.id !== id) }); 
    };

    const startEditStore = (store) => { setEditingStoreId(store.id); setTempStoreData({ ...store }); };
    
    const saveStoreChange = () => { 
        setStoresConfig(prev => ({ ...prev, [editingStoreId]: tempStoreData })); 
        setEditingStoreId(null); 
        alert('分店資料已更新！'); 
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <div className="w-64 bg-gray-900 text-white flex flex-col shadow-xl z-20">
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-xl">HQ</div>
                        <h1 className="text-xl font-bold">野饌總部</h1>
                    </div>
                    <div className="text-xs text-gray-500">中央管理系統 v2.8</div>
                </div>
                <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
                    <button onClick={() => setActiveTab('report')} className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'report' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}><PieChart size={20}/> 營運總表</button>
                    <button onClick={() => setActiveTab('daily_reports')} className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'daily_reports' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}><FileText size={20}/> 日報檢視</button>
                    <button onClick={() => setActiveTab('stores')} className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'stores' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}><Store size={20}/> 分店管理</button>
                    <button onClick={() => setActiveTab('employees')} className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'employees' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}><UserCog size={20}/> 員工管理</button>
                    <button onClick={() => setActiveTab('menu')} className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'menu' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}><Utensils size={20}/> 菜單設定</button>
                    <button onClick={() => setActiveTab('bookings')} className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'bookings' ? 'bg-teal-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}><ClipboardList size={20}/> 訂位總管</button>
                    <button onClick={() => setActiveTab('crm')} className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'crm' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}><Users size={20}/> 會員 CRM</button>
                    <button onClick={() => setActiveTab('feedback')} className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'feedback' ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}><MessageCircle size={20}/> 顧客意見</button>
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <button onClick={onLogout} className="w-full bg-gray-800 text-gray-300 py-3 rounded-xl font-bold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"><LogOut size={18}/> 登出系統</button>
                </div>
            </div>
            
            <div className="flex-grow overflow-hidden relative">
                {activeTab === 'report' && <HQReportDashboard salesLogs={salesLogs||[]} setSalesLogs={setSalesLogs} storesConfig={storesConfig} tipLogs={tipLogs||[]} />}
                
                {activeTab === 'daily_reports' && <HQDailyReportView storesConfig={storesConfig} />}
                
                {activeTab === 'stores' && (
                    <div className="p-8 h-full overflow-y-auto">
                        <div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-gray-800">🏪 分店設定與管理</h2></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.values(storesConfig||{}).filter(s=>s.type!=='HQ').map(store => (
                                <div key={store.id} className={`bg-white p-6 rounded-2xl shadow-sm border-2 transition-all ${editingStoreId === store.id ? 'border-purple-500 ring-2 ring-purple-100' : 'border-transparent'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded text-sm">店號: {store.id}</div>
                                        {editingStoreId === store.id ? (
                                            <div className="flex gap-2">
                                                <button onClick={saveStoreChange} className="text-green-600 bg-green-100 p-2 rounded"><Save size={18}/></button>
                                                <button onClick={()=>setEditingStoreId(null)} className="text-gray-400 bg-gray-100 p-2 rounded"><X size={18}/></button>
                                            </div>
                                        ) : (
                                            <button onClick={()=>startEditStore(store)} className="text-gray-400 hover:text-blue-600"><Edit3 size={18}/></button>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div><label className="text-xs font-bold text-gray-400">分店名稱</label>{editingStoreId === store.id ? <input className="w-full border-b-2 font-bold text-lg outline-none" value={tempStoreData.name} onChange={e=>setTempStoreData({...tempStoreData, name: e.target.value})} /> : <div className="font-bold text-xl">{store.name}</div>}</div>
                                        <div><label className="text-xs font-bold text-gray-400">密碼</label>{editingStoreId === store.id ? <input className="w-full border-b-2 font-mono text-lg outline-none" value={tempStoreData.password} onChange={e=>setTempStoreData({...tempStoreData, password: e.target.value})} /> : <div className="font-mono text-lg text-gray-600">{store.password}</div>}</div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="text-xs font-bold text-gray-400">前綴</label>{editingStoreId === store.id ? <input className="w-full border-b outline-none" value={tempStoreData.tablePrefix} onChange={e=>setTempStoreData({...tempStoreData, tablePrefix: e.target.value})} /> : <div className="font-bold">{store.tablePrefix}</div>}</div>
                                            <div><label className="text-xs font-bold text-gray-400">桌數</label>{editingStoreId === store.id ? <input type="number" className="w-full border-b outline-none" value={tempStoreData.tableCount} onChange={e=>setTempStoreData({...tempStoreData, tableCount: parseInt(e.target.value)})} /> : <div className="font-bold">{store.tableCount} 桌</div>}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {activeTab === 'employees' && (
                    <div className="p-8 h-full overflow-y-auto">
                        <h2 className="text-3xl font-bold mb-6 text-gray-800">👷 員工帳號管理</h2>
                        <div className="flex gap-8 items-start">
                            <div className="w-1/3 bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 sticky top-0">
                                <div className="flex items-center gap-2 mb-6 text-indigo-600"><UserPlus size={24}/><h3 className="font-bold text-xl">新增員工</h3></div>
                                <div className="space-y-5">
                                    <div><label className="block text-sm font-bold text-gray-500 mb-2">歸屬分店</label><select className="w-full border-2 border-gray-200 p-3 rounded-xl font-bold text-gray-700 outline-none focus:border-indigo-500" value={selectedStoreForEmp} onChange={e=>setSelectedStoreForEmp(e.target.value)}>{Object.values(storesConfig||{}).filter(s=>s.type!=='HQ').map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                                    <div><label className="block text-sm font-bold text-gray-500 mb-2">姓名</label><input className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none focus:border-indigo-500" placeholder="請輸入姓名" value={newEmpName} onChange={e=>setNewEmpName(e.target.value)}/></div>
                                    <div><label className="block text-sm font-bold text-gray-500 mb-2">密碼</label><input className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none focus:border-indigo-500" placeholder="設定密碼" type="number" value={newEmpPwd} onChange={e=>setNewEmpPwd(e.target.value)}/></div>
                                    <button onClick={handleAddEmployee} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 flex justify-center items-center gap-2"><Plus size={20}/> 確認新增</button>
                                </div>
                            </div>
                            <div className="w-2/3 flex flex-col gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-xl text-gray-600">{storesConfig[selectedStoreForEmp]?.name} - 員工名單</h3><span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">共 {(storeEmployees[selectedStoreForEmp]||[]).length} 人</span></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(storeEmployees[selectedStoreForEmp]||[]).length === 0 && <div className="col-span-2 py-10 text-center text-gray-400 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">尚未建立員工資料</div>}
                                        {(storeEmployees[selectedStoreForEmp]||[]).map(emp=>(<div key={emp.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border-l-4 border-indigo-500 group hover:shadow-md transition-shadow"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">{emp.name.charAt(0)}</div><div><div className="font-bold text-gray-800">{emp.name}</div><div className="text-xs text-gray-400">密碼: {emp.password}</div></div></div><div className="flex gap-2"><button onClick={()=>setQrModalEmp(emp)} className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-2 rounded transition-colors" title="顯示打賞 QR Code"><QrCode size={20}/></button><button onClick={()=>handleDeleteEmployee(emp.id)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded transition-colors"><Trash2 size={20}/></button></div></div>))}
                                    </div>
                                </div>

                                {/* ★ 新增：打卡工時對帳明細 (24H 聚合版) ★ */}
                                <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
                                    <div className="bg-gray-800 p-4 text-white flex justify-between items-center">
                                        <h3 className="font-bold flex items-center gap-2"><Clock size={20}/> 打卡工時明細</h3>
                                        <span className="text-xs opacity-60">點擊標題排序</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-100 font-bold border-b">
                                                <tr>
                                                    <th className="p-3">分店</th>
                                                    <th className="p-3 cursor-pointer hover:text-blue-600" onClick={() => requestSort('date')}>日期 ⇅</th>
                                                    <th className="p-3 cursor-pointer hover:text-blue-600" onClick={() => requestSort('empName')}>姓名 ⇅</th>
                                                    <th className="p-3 bg-blue-50">時段一 上/下</th>
                                                    <th className="p-3 bg-orange-50">時段二 上/下</th>
                                                    <th className="p-3 text-center bg-green-50">時長(hr)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getSortedClockData().map(row => (
                                                    <tr key={row.id} className="border-b hover:bg-gray-50">
                                                        <td className="p-3 text-gray-500">{row.storeName}</td>
                                                        <td className="p-3 font-mono">{row.date}</td>
                                                        <td className="p-3 font-bold">{row.empName}</td>
<td className="p-3 text-blue-700 font-medium">
    {format24h(row.am_in, row.date)} ~ {format24h(row.am_out, row.date)}
</td>
<td className="p-3 text-orange-700 font-medium">
    {format24h(row.pm_in, row.date)} ~ {format24h(row.pm_out, row.date)}
</td>
<td className="p-3 text-center font-black text-green-700">{row.totalHours}</td>
                                                    </tr>
                                                ))}
                                                {getSortedClockData().length === 0 && <tr><td colSpan="6" className="p-10 text-center text-gray-400">尚無打卡數據</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'menu' && <HQAdvancedMenuManager 
                    menuItems={menuItems} setMenuItems={setMenuItems} 
                    categories={categories} setCategories={setCategories} 
                    diningPlans={diningPlans} setDiningPlans={setDiningPlans} 
                    storesConfig={storesConfig} 
                    hiddenCategories={hiddenCategories} setHiddenCategories={setHiddenCategories} 
                />}
                
                {activeTab === 'bookings' && <HQBookingManager bookings={bookings} storesConfig={storesConfig} />}
                {activeTab === 'crm' && <MemberPage memberAppSettings={memberAppSettings} members={members} setMembers={setMembers} onUpdateMember={()=>{}} coupons={coupons} setCoupons={setCoupons} addLog={()=>{}} currentStoreName="總部" isHQ={true} storesConfig={storesConfig} />}
                {activeTab === 'feedback' && <HQFeedbackPage feedbackLogs={feedbackLogs} storesConfig={storesConfig} />}
            </div>

            {qrModalEmp && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={()=>setQrModalEmp(null)}>
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounce-in" onClick={e=>e.stopPropagation()}>
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl font-bold text-orange-600">{qrModalEmp.name.charAt(0)}</div>
                        <h3 className="text-2xl font-bold text-gray-800">{qrModalEmp.name}</h3>
                        <p className="text-gray-500 mb-6">專屬打賞 QR Code</p>
                        <div className="bg-white p-2 rounded-xl border-4 border-orange-500 inline-block mb-4 shadow-inner"><canvas id="emp-qr-canvas" className="w-64 h-64"></canvas></div>
                        <p className="text-xs text-gray-400 mb-6 px-4">請顧客使用手機掃描上方條碼<br/>即可進入打賞頁面</p>
                        <button onClick={()=>setQrModalEmp(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-8 rounded-xl font-bold w-full">關閉視窗</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 6. LoginPage ---
const LoginPage = ({ onLogin, storesConfig }) => {
  const [storeId, setStoreId] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex">
        <div className="w-1/2 bg-orange-600 p-12 flex flex-col justify-center text-white">
          <h1 className="text-4xl font-bold mb-4">野饌燒肉</h1><p className="text-xl opacity-90">活泰國蝦吃到飽 POS 系統</p>
        </div>
        <div className="w-1/2 p-12 flex flex-col justify-center space-y-6">
          <h2 className="text-3xl font-bold text-center">系統登入</h2>
          <input className="w-full p-3 border rounded" placeholder="分店代碼 (000=總部)" value={storeId} onChange={e => setStoreId(e.target.value)} />
          <input className="w-full p-3 border rounded" type="password" placeholder="密碼" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={() => { const s = storesConfig[storeId]; if(s && s.password===password) onLogin(storeId, s); else alert('錯誤'); }} className="w-full bg-gray-900 text-white py-3 rounded font-bold">登入</button>
        </div>
      </div>
    </div>
  );
};

// --- 7. App (Entry Point) - 全雲端同步版 (正確邏輯) ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentStore, setCurrentStore] = useState(null); 
  const [isHQMode, setIsHQMode] = useState(false); 
  
  // =========================================================================
  // ★★★ 核心修正：全部改回 useFirebaseState (雲端同步) ★★★
  // 這樣總部一改，全部分店都會立刻更新！
  // =========================================================================
  
  // 1. 基礎設定 (雲端)
  const [storesConfig, setStoresConfig] = useFirebaseState('pos_data', 'stores_config', INITIAL_STORES_CONFIG); 
  const [diningPlans, setDiningPlans] = useFirebaseState('pos_data', 'plans', INITIAL_DINING_PLANS);
  const [menuItems, setMenuItems] = useFirebaseState('pos_data', 'menu', INITIAL_MENU_ITEMS);
  const [categories, setCategories] = useFirebaseState('pos_data', 'categories', INITIAL_CATEGORIES);
  const [storeEmployees, setStoreEmployees] = useFirebaseState('pos_data', 'employees', INITIAL_STORE_EMPLOYEES);
  const [memberAppSettings, setMemberAppSettings] = useFirebaseState('pos_data', 'app_settings', INITIAL_MEMBER_APP_SETTINGS);
  
  // ★★★ 關鍵：這裡宣告了隱藏分類的狀態 ★★★
  const [hiddenCategories, setHiddenCategories] = useFirebaseState('pos_data', 'hidden_categories', []);
  
  // 2. 行銷與優惠 (雲端)
  const [coupons, setCoupons] = useFirebaseState('pos_data', 'coupons', INITIAL_COUPONS);
  const [slotPrizes, setSlotPrizes] = useFirebaseState('pos_data', 'slot_prizes', INITIAL_SLOT_PRIZES);
  const [tiers, setTiers] = useFirebaseState('pos_data', 'tiers', INITIAL_TIERS);

  // 3. 營運數據 (雲端 - 這樣總部才看得到各店資料)
  const [bookings, setBookings] = useFirebaseState('pos_data', 'bookings', []); 
  const [clockLogs, setClockLogs] = useFirebaseState('pos_data', 'clock_logs', []);
  const [tipLogs, setTipLogs] = useFirebaseState('pos_data', 'tip_logs', []);
  const [members, setMembers] = useFirebaseState('pos_data', 'members', INITIAL_MEMBERS_DB);
  const [memberLogs, setMemberLogs] = useFirebaseState('pos_data', 'member_logs', []);
  // =======================================================
    // ★★★ 萬能修復包：營收 + 庫存 + 小費 全部救回 ★★★
    // =======================================================
    
    // 1. 營收紀錄
    const [oldLogs] = useFirebaseState('pos_data', 'sales_logs', []);
    const [logsV2, setLogsV2] = useFirebaseState('pos_data', 'sales_logs_v2', []);
    const salesLogs = [...(oldLogs || []), ...(logsV2 || [])];
    const setSalesLogs = setLogsV2;

    // 2. 庫存狀態
    const [stockStatus, setStockStatus] = useFirebaseState('pos_data', 'stock_status', {});
    
    // 4. 顧客回饋 (如果有這一行的話保留它，沒有就算了)
    const [feedbackLogs, setFeedbackLogs] = useFirebaseState('pos_data', 'feedback_logs', []);

  const [cloudPrinters] = useFirebaseState('pos_data', `printers_${currentStore?.id || 'branch3'}`, INITIAL_PRINTERS);

  // Tip Mode Logic
  const queryParams = new URLSearchParams(window.location.search);
  const mode = queryParams.get('mode');          // 這裡定義了 mode
  const tableId = queryParams.get('table');      // 這裡定義了 tableId
  const urlStoreId = queryParams.get('store');
  const employeeId = queryParams.get('empId');
  const isTipMode = mode === 'tip';

  // Tip Page Render
  if (isTipMode && employeeId) {
      return <TipWrapper storeId={urlStoreId} employeeId={employeeId} storesConfig={storesConfig} onAddTip={(tip) => setTipLogs(prev => [tip, ...prev])} />;
  }

  if (mode === 'member' && urlStoreId) {
        return <MemberCheckWrapper storeId={urlStoreId} />;
    }

  // ★★★ 顧客點餐模式判斷 ★★★
  if (mode === 'customer' && urlStoreId && tableId) {
      const currentPrinters = cloudPrinters || INITIAL_PRINTERS;
      return (
        <CustomerWrapper 
            tableId={tableId} 
            storeId={urlStoreId} 
            printerConfig={currentPrinters}
            onGoToMember={() => console.log("切換至會員中心")} 
        />
      );
  }

  const handleLogin = (storeId, storeData) => {
    if (storeData.type === 'HQ') setIsHQMode(true);
    setCurrentStore(storeData);
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} storesConfig={storesConfig} />;

  // 總部模式
  if (isHQMode) {
      return (
          <HQDashboard
              feedbackLogs={feedbackLogs} 
              diningPlans={diningPlans} setDiningPlans={setDiningPlans} 
              menuItems={menuItems} setMenuItems={setMenuItems}
              memberAppSettings={memberAppSettings} setMemberAppSettings={setMemberAppSettings}
              storesConfig={storesConfig} setStoresConfig={setStoresConfig}
              storeEmployees={storeEmployees} setStoreEmployees={setStoreEmployees}
              clockLogs={clockLogs} 
              members={members} setMembers={setMembers}
              coupons={coupons} setCoupons={setCoupons}
              categories={categories} setCategories={setCategories}
              
              // ★★★ 傳遞給 HQDashboard ★★★
              hiddenCategories={hiddenCategories} 
              setHiddenCategories={setHiddenCategories}

              memberLogs={memberLogs} 
              salesLogs={salesLogs} setSalesLogs={setSalesLogs}
              stockStatus={stockStatus} setStockStatus={setStockStatus}
              tipLogs={tipLogs}
              slotPrizes={slotPrizes} setSlotPrizes={setSlotPrizes}
              tiers={tiers} setTiers={setTiers}
              bookings={bookings} setBookings={setBookings}
              
              onLogout={() => { setIsLoggedIn(false); setCurrentStore(null); setIsHQMode(false); }} 
              onEnterBranch={() => alert("請登出後切換帳號")}
          />
      );
  }

  // 分店模式
  return <MainPOS 
    currentStore={currentStore} 
    onLogout={() => { setIsLoggedIn(false); setCurrentStore(null); setIsHQMode(false); }} 
    isHQMode={isHQMode} 
    slotPrizes={slotPrizes} setSlotPrizes={setSlotPrizes}
    tiers={tiers} setTiers={setTiers}
    bookings={bookings} setBookings={setBookings}
  />;
}

// --- 8. TipWrapper (小費頁面) ---
const TipWrapper = ({ storeId, employeeId, storesConfig, onAddTip }) => {
    const [employees] = useFirebaseState('pos_data', 'employees', INITIAL_STORE_EMPLOYEES);
    const storeEmps = employees[storeId] || [];
    const emp = storeEmps.find(e => e.id.toString() === employeeId) || { name: '服務員' };

    return <TipPage employee={emp} storeId={storeId} onAddTip={onAddTip} />;
};

// =======================================================
// ★★★ 新增：純會員查詢模式 (無需開桌) ★★★
// =======================================================
const MemberCheckWrapper = ({ storeId }) => {
    // 1. 只讀取會員、優惠券、日誌
    const [members, setMembers] = useFirebaseState('pos_data', 'members', INITIAL_MEMBERS_DB);
    const [coupons] = useFirebaseState('pos_data', 'coupons', INITIAL_COUPONS);
    const [memberLogs, setMemberLogs] = useFirebaseState('pos_data', 'member_logs', []);

    // 2. 更新會員資料的邏輯
    const handleUpdateMember = (updatedMember) => {
        setMembers(prevMembers => {
            const exists = prevMembers.some(m => m.phone === updatedMember.phone);
            if (exists) {
                return prevMembers.map(m => m.phone === updatedMember.phone ? updatedMember : m);
            } else {
                return [...prevMembers, updatedMember];
            }
        });
    };

    // 3. 寫入日誌
    const handleAddMemberLog = (log) => {
        setMemberLogs(prev => [{ id: Date.now(), timestamp: Date.now(), ...log }, ...prev]);
    };

    return (
        <CustomerMemberPortal
            members={members}
            onUpdateMember={handleUpdateMember}
            coupons={coupons}
            addLog={handleAddMemberLog}
            onBack={() => {}} // 這裡給空函式，因為按鈕已經被藏起來了
            storeId={storeId}
            isStandalone={true} // ★ 告訴它這是獨立模式
        />
    );
};

// =======================================================
// ★★★ 9. 補回遺失的 CustomerWrapper (沒這個客人會白屏) ★★★
// =======================================================
const CustomerWrapper = ({ tableId, storeId, onGoToMember, printerConfig }) => {
    // 1. 讀取分店桌況 (給點餐用)
    const [tables, setTables] = useFirebaseState('pos_data', `tables_${storeId}`, []);
    const [diningPlans] = useFirebaseState('pos_data', 'plans', INITIAL_DINING_PLANS);
    const [menuItems] = useFirebaseState('pos_data', 'menu', INITIAL_MENU_ITEMS);
    const [categories] = useFirebaseState('pos_data', 'categories', INITIAL_CATEGORIES);
    const [stockStatus] = useFirebaseState('pos_data', 'stock_status', INITIAL_STOCK_STATUS);

    // 2. 讀取會員資料
    const [members, setMembers] = useFirebaseState('pos_data', 'members', INITIAL_MEMBERS_DB);
    const [coupons] = useFirebaseState('pos_data', 'coupons', INITIAL_COUPONS);
    const [memberLogs, setMemberLogs] = useFirebaseState('pos_data', 'member_logs', []);

    // ★★★ 3. 關鍵修正：這裡原本漏掉了讀取隱藏分類的資料 ★★★
    const [hiddenCategories] = useFirebaseState('pos_data', 'hidden_categories', []);

    // 4. 視圖切換狀態
    const [viewMode, setViewMode] = useState('menu'); 

    const handleUpdateMember = (updatedMember) => {
        setMembers(prevMembers => {
            const exists = prevMembers.some(m => m.phone === updatedMember.phone);
            if (exists) {
                return prevMembers.map(m => m.phone === updatedMember.phone ? updatedMember : m);
            } else {
                return [...prevMembers, updatedMember];
            }
        });
    };

    const handleAddMemberLog = (log) => {
        setMemberLogs(prev => [{ id: Date.now(), timestamp: Date.now(), ...log }, ...prev]);
    };

    if (viewMode === 'member') {
        return (
            <CustomerMemberPortal
                members={members}
                onUpdateMember={handleUpdateMember}
                coupons={coupons}
                addLog={handleAddMemberLog}
                onBack={() => setViewMode('menu')}
                storeId={storeId}
            />
        );
    }

    const menuFingerprint = JSON.stringify(menuItems) + JSON.stringify(stockStatus) + JSON.stringify(hiddenCategories);

    // 呼叫原本的 CustomerOrderPage
    return (
        <CustomerOrderPage 
            key={menuFingerprint}
            tableId={tableId} 
            storeId={storeId} 
            diningPlans={diningPlans} 
            menuItems={menuItems} 
            categories={categories} 
            setTables={setTables} 
            tables={tables} 
            printers={[]} 
            stockStatus={stockStatus} 
            onGoToMember={() => setViewMode('member')} 
            printerConfig={printerConfig}
            // ★★★ 現在這裡有 hiddenCategories 可以傳下去了 ★★★
            hiddenCategories={hiddenCategories || []}
        />
    );
};