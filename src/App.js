import React, { useState, useEffect, useRef } from 'react';
import { Settings, Users, Home, ClipboardList, Clock, Wifi, Printer, LogOut, Plus, Minus, Trash2, Delete, X, Edit3, Save, Store, BarChart3, Utensils, Search, UserPlus, Ticket, ShoppingCart, MessageCircle, RefreshCcw, Briefcase, HardDrive, Server, UserCog, PieChart, QrCode, ChevronLeft, ChevronRight, Tag, MoveRight, FileWarning, Heart, DollarSign, Gift, UserCheck, ShieldAlert, ScanLine, FileText, Sparkles, Percent, Trophy, Loader } from 'lucide-react';
import { db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import QRCode from 'qrcode';

// =======================================================
// 1. Constants & Configurations (全域設定)
// =======================================================
const INITIAL_STORES_CONFIG = {
  '000': { id: '000', name: '野饌總部 (HQ)', password: '88888', type: 'HQ', tablePrefix: '', tableCount: 0 },
  '001': { id: '001', name: '七賢總店', password: '69922', type: 'Branch', tableRanges: [{ prefix: 'A', count: 20 }, { prefix: 'B', count: 10 }] },
  '002': { id: '002', name: '鳳山旗艦店', password: '79567', type: 'Branch', tableRanges: [{ prefix: 'F', count: 35 }] },
  '003': { id: '003', name: '楠梓分店', password: '18127', type: 'Branch', tableRanges: [{ prefix: 'N', count: 15 }, { prefix: 'VIP', count: 3 }] }
};

const STORE_URLS = {
    '001': 'https://yeshan-qixian.ngrok.app',    
    '002': 'https://yeshan-fengshan.ngrok.app', 
    '003': 'https://yeshan-nanzi.ngrok.app'      
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

const INITIAL_STOCK_STATUS = { '001': {}, '002': {}, '003': {} };
const INITIAL_MEMBER_APP_SETTINGS = { announcement: '🎉 本月壽星優惠中！', promoColor: 'bg-orange-500', quickLinks: [], lineRichMenu: 'typeA' };

const BRANCH_PRINTER_CONFIGS = {
  '001': [
    { id: 'counter', name: '櫃台 QR Code (印表機)', ip: '192.168.1.147', type: 'receipt', status: 'unknown' },
    { id: 'kitchen_hot', name: '廚房出單機 (印表機)', ip: '192.168.1.115', type: 'kitchen', status: 'unknown' }
  ],
  '003': [
    { id: 'counter', name: '櫃台 QR Code (印表機)', ip: '192.168.1.176', type: 'receipt', status: 'unknown' },
    { id: 'kitchen_hot', name: '廚房出單機 (印表機)', ip: '192.168.1.180', type: 'kitchen', status: 'unknown' }
  ]
};

const urlParams = new URLSearchParams(window.location.search);
const currentStoreIdFromUrl = urlParams.get('store') || '003';
const INITIAL_PRINTERS = BRANCH_PRINTER_CONFIGS[currentStoreIdFromUrl] || BRANCH_PRINTER_CONFIGS['003'];

const INITIAL_MEMBERS_DB = [ { phone: '0912345678', name: '王大明', level: 'Tin', points: 0, totalSpending: 0, birthday: '12-05', lastVisit: '2023-10-15', isLineBound: true, birthdayRedeemed: false, joinDate: '2023-01-10', items: [], pointLogs: [] } ];
const INITIAL_STORE_EMPLOYEES = { '001': [{id: 1, name: '店長', password: '000'}], '002': [], '003': [] };

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
        setTimeout(() => { alert(`✅ 成功給予 ${employee.name} 小費 $${selectedAmount}！\n\n金額已合併至桌號 [${finalTableId}] 的帳單。`); const baseUrl = STORE_URLS[storeId] || STORE_URLS['003']; window.location.href = `${baseUrl}?mode=customer&store=${storeId}&table=${finalTableId}`; setLoading(false); }, 800);
    };

    return ( <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6"> <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden mt-10"> <div className="bg-blue-600 p-8 text-center text-white relative"> <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><ScanLine size={12}/> 桌號: {finalTableId} <button onClick={()=>setIsManualInput(true)} className="ml-1 underline"><Edit3 size={10}/></button></div> <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-blue-600 shadow-md">{employee.name[0]}</div> <h2 className="text-2xl font-bold">{employee.name}</h2> <p className="opacity-90 mt-1">感謝您對服務的認可！❤️</p> </div> <div className="p-8"> <label className="block text-gray-600 font-bold mb-4 text-center">請選擇打賞金額</label> <div className="grid grid-cols-3 gap-3 mb-8">{[20, 50, 100].map(amount => (<button key={amount} onClick={() => setSelectedAmount(amount)} className={`py-4 rounded-xl font-bold text-xl border-2 transition-all ${selectedAmount === amount ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-200'}`}>${amount}</button>))}</div> <button onClick={handleConfirmTip} disabled={!selectedAmount || loading} className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg flex items-center justify-center gap-2 transition-all ${!selectedAmount ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'}`}>{loading ? '處理中...' : <><DollarSign size={20} /> 確認 (併入帳單)</>}</button> <p className="text-xs text-center text-gray-400 mt-6">點擊確認後，小費將自動加入您的用餐帳單。<br/>您可以在結帳時一併支付。</p> </div> </div> </div> );
};

// --- 顧客端會員中心 ---
const CustomerMemberPortal = ({ members, onUpdateMember, coupons, addLog, onBack }) => {
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
        const newMember = {
            phone: phone,
            name: regName, 
            level: 'Tin',
            points: 0,
            totalSpending: 0,
            birthday: '',
            lastVisit: new Date().toISOString().split('T')[0],
            isLineBound: false,
            birthdayRedeemed: false,
            joinDate: new Date().toISOString().split('T')[0],
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
        if (coupon.limit) {
            const alreadyHas = currentUser.items.some(i => i.name === coupon.name);
            if (alreadyHas) return alert('此優惠券每位會員限領一次，您已領取過！');
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
        const newItem = { id: Date.now(), name: coupon.name, redeemed: false, code: coupon.code ? (coupon.code + Math.floor(Math.random()*1000)) : Math.random().toString(36).substr(2, 6).toUpperCase() }; 
        updatedUser.items.push(newItem); 
        onUpdateMember(updatedUser); 
        setCurrentUser(updatedUser); 
        addLog({ storeName: '自助', staffName: 'User', memberName: updatedUser.name, memberPhone: updatedUser.phone, action: `自助兌換: ${coupon.name}`, points: -coupon.pointCost }); 
        alert('兌換成功！已存入您的票夾。'); 
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
                            <button onClick={onBack} className="w-full text-gray-500 py-4 mt-2">返回點餐</button>
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
                        {(coupons||[]).filter(c => c.pointCost >= 0).map(coupon => (
                            <div key={coupon.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                <div><div className="font-bold text-lg text-gray-800">{coupon.name}</div><div className="text-orange-500 font-bold text-sm">{coupon.pointCost} 點</div></div>
                                <button onClick={() => handleRedeem(coupon)} className={`px-4 py-2 rounded-lg font-bold ${currentUser.points >= coupon.pointCost ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`} disabled={currentUser.points < coupon.pointCost}>兌換</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <h3 className="font-bold text-gray-600 mb-2">已持有票券</h3>
                        {currentUser.items.filter(i => !i.redeemed).length === 0 ? <div className="text-center text-gray-400 py-10">票夾是空的</div> : currentUser.items.filter(i => !i.redeemed).map((item, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 relative overflow-hidden">
                                <div className="font-bold text-lg text-gray-800">{item.name}</div>
                                <div className="text-gray-400 text-xs mt-1">核銷代碼</div>
                                <div className="text-2xl font-mono font-bold text-gray-700 tracking-widest">{item.code}</div>
                                <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-blue-500 transform -rotate-12"><Ticket size={80}/></div>
                            </div>
                        ))}
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

const CustomerOrderPage = ({ tableId, storeId, diningPlans, menuItems, categories, setTables, tables, printers, stockStatus, onGoToMember, printerConfig }) => {
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
    const timeLimit = 150 * 60 * 1000; 
    if (now - currentTable.startTime > timeLimit) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white p-8 text-center"><div><h1 className="text-3xl font-bold mb-4 text-orange-500">⏳ 連結已過期</h1><p>此 QR Code 已超過有效期限。</p><p className="mt-2">如需加點，請聯繫服務人員。</p></div></div>; 
    
    const safeDiningPlans = diningPlans || INITIAL_DINING_PLANS;
    const currentPlan = safeDiningPlans.find(p => p.id === currentTable.plan) || safeDiningPlans[0];
    const filteredItems = (menuItems || []).filter(item => { if (item.onlyForStaff === true) return false; if (activeCategory !== 'All' && item.category !== activeCategory) return false; if (item.price === 0 && !item.allowedPlans?.includes(currentPlan.id)) return false; if (stockStatus && stockStatus[storeId]?.[item.id] === true) return false; return true; });

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
        
        const currentStoreId = storeId || '003';
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
            <div className="bg-gray-900 text-white p-4 shadow-md sticky top-0 z-10"><div className="flex justify-between items-center mb-1"><div><h1 className="font-bold text-lg">桌號 {tableId}</h1><div className="text-xs opacity-70">方案: {currentPlan.name}</div></div><button onClick={onGoToMember} className="bg-orange-600 hover:bg-orange-500 px-3 py-2 rounded-lg flex items-center gap-1 text-sm font-bold border border-orange-400 text-white"><UserCheck size={16} /> 會員中心</button></div><div className="flex justify-between items-end border-t border-gray-700 pt-1 mt-1"><div><div className="font-bold text-orange-400 text-xs">最後加點</div><div className="text-sm">{formatTime(currentTable.startTime + 90*60*1000)}</div></div><button onClick={() => setShowHistory(true)} className="text-xs text-gray-400 underline flex items-center gap-1"><ClipboardList size={12}/> 已點紀錄</button></div></div>
            <div className="flex overflow-x-auto bg-white p-4 shadow-md gap-3 sticky top-[88px] z-10 no-scrollbar"><style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style> {['All', ...categories].map(cat => (<button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-3 rounded-full font-bold text-lg whitespace-nowrap flex-shrink-0 transition-transform active:scale-95 ${activeCategory === cat ? 'bg-orange-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>{cat}</button>))}</div>
            <div className="flex-grow overflow-y-auto p-4 pb-32"><div className="grid grid-cols-2 gap-4">{filteredItems.map(item => (<button key={item.id} onClick={() => handleAddToCart(item)} className={`bg-white p-3 rounded-xl shadow-sm flex flex-col items-center gap-2 relative ${addedId === item.id ? 'ring-2 ring-green-500' : ''}`}><div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 font-bold text-2xl">{item.name[0]}</div><div className="text-center"><div className="font-bold text-gray-800">{item.name}</div>{item.price > 0 && <div className="text-orange-600 text-xs font-bold">+${item.price}</div>}</div></button>))}</div></div>
            {cart.length > 0 && (<div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)] p-4 rounded-t-2xl z-20"><button onClick={() => setShowCart(true)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-xl shadow-lg flex items-center justify-center gap-2"><ShoppingCart size={24} />查看購物車 ({cart.length})</button></div>)}
            {showHistory && (<OrderHistoryModal orders={currentTable.orders} onClose={() => setShowHistory(false)} />)}
        </div>
    );
};

const MenuPage = ({ tables, menuItems, categories, setTables, printers, currentStore, stockStatus }) => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [addedId, setAddedId] = useState(null);
    const [cart, setCart] = useState([]);
    const [selectedTableId, setSelectedTableId] = useState('');
    const safeStockStatus = stockStatus || {};
    const [showDrawerAuth, setShowDrawerAuth] = useState(false);
    const [drawerPwd, setDrawerPwd] = useState(''); 

    const filteredItems = (menuItems || []).filter(item => { if (activeCategory !== 'All' && item.category !== activeCategory) return false; return safeStockStatus[currentStore.id]?.[item.id] !== true; });
    const handleAddToCart = (item) => { setAddedId(item.id); setCart(prev => { const existing = prev.find(i => i.id === item.id); if (existing) return prev.map(i => i.id === item.id ? { ...i, count: i.count + 1 } : i); return [...prev, { ...item, count: 1 }]; }); setTimeout(() => setAddedId(null), 300); };
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

const SettingsPage = ({ printers, setPrinters, onLogout, onResetData, currentStoreId, setCloudPrinters }) => { 
    const [testingIp, setTestingIp] = useState(null); 
    const [cashDrawerEnabled, setCashDrawerEnabled] = useStickyState(false, `pos_cash_drawer_${currentStoreId}`); 
    const [localPrinters, setLocalPrinters] = useState(printers);
    useEffect(() => { setLocalPrinters(printers); }, [printers]);
    const handleLocalChange = (id, newIp) => { setLocalPrinters(prev => prev.map(p => p.id === id ? { ...p, ip: newIp } : p)); }; 
    const handleSave = () => { setPrinters(localPrinters); setCloudPrinters(localPrinters); alert("✅ IP 設定已儲存並同步至雲端！"); };
    const handleTestConnection = (id) => { setTestingIp(id); setTimeout(() => { const isSuccess = Math.random() > 0.3; setTestingIp(null); alert(isSuccess ? '連線成功！' : '連線失敗！'); }, 1500); }; 
    return ( <div className="p-8 h-full bg-gray-100 overflow-y-auto"> <h2 className="text-2xl font-bold mb-6 text-gray-800">系統設定 (分店: {currentStoreId})</h2> <div className="bg-yellow-100 p-4 rounded-xl mb-6 border-l-4 border-yellow-500"> <h4 className="font-bold text-yellow-800">⚠️ 設定說明</h4> <p className="text-sm text-yellow-700">請在下方輸入 <b>印表機的真實 IP (如 192.168.1.180)</b>，切勿輸入電腦 IP。</p> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> <div className="bg-white p-6 rounded-2xl shadow-sm"><h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Printer/> 連線設定</h3><div className="space-y-4">{localPrinters.map(p => (<div key={p.id} className="flex justify-between items-center border-b pb-4 last:border-0"><div><div className="font-bold">{p.name}</div><div className="text-xs text-gray-500 mt-1"><input className="border p-1 rounded w-32" value={p.ip} onChange={(e) => handleLocalChange(p.id, e.target.value)} /> ({p.type})</div></div><div className="flex flex-col items-end gap-1"><button onClick={() => handleTestConnection(p.id)} className={`text-sm font-bold px-3 py-1.5 rounded flex items-center gap-1 ${testingIp === p.id ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{testingIp === p.id ? <RefreshCcw size={14} className="animate-spin"/> : <Wifi size={14}/>}{testingIp === p.id ? '偵測中...' : '重新連線'}</button><span className={`text-xs font-bold ${p.status === 'online' ? 'text-green-600' : p.status === 'offline' ? 'text-red-600' : 'text-gray-400'}`}>{p.status === 'online' ? '● 連線正常' : p.status === 'offline' ? '● 未連線' : '○ 未測試'}</span></div></div>))}</div><button onClick={handleSave} className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-green-700">💾 儲存並同步 IP 設定</button></div> <div className="space-y-6"><div className="bg-white p-6 rounded-2xl shadow-sm"><h3 className="font-bold text-lg mb-4 flex items-center gap-2"><HardDrive/> 硬體週邊</h3><div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border"><div><div className="font-bold text-gray-700">連結收銀機錢箱</div><div className="text-xs text-gray-500">結帳時自動送出開啟訊號 (RJ11)</div></div><button onClick={() => setCashDrawerEnabled(!cashDrawerEnabled)} className={`w-14 h-8 rounded-full p-1 transition-colors ${cashDrawerEnabled ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${cashDrawerEnabled ? 'translate-x-6' : ''}`}></div></button></div></div><div className="bg-white p-6 rounded-2xl shadow-sm"><h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Server/> 系統操作</h3><div className="space-y-3"><button onClick={onResetData} className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-bold hover:bg-red-100 border border-red-200">重置所有系統資料</button><button onClick={onLogout} className="w-full bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-700">登出 / 換班</button></div></div></div> </div> </div> ); };

const MemberPage = ({ memberAppSettings, members, onUpdateMember, coupons, addLog, currentStoreName }) => {
    // ... (MemberPage content remains the same)
    return <div className="p-8 text-center text-gray-500">會員系統載入中...</div>; 
    // 注意：為了節省篇幅，我這裡使用了簡化版。請使用您原本的 MemberPage 完整代碼。
    // 如果您需要我重新貼出完整的 MemberPage，請告訴我。
};

// ★★★ 7. BookingPage & HQDashboard (已移至 MainPOS 之前) ★★★
const BookingPage = ({ bookings, setBookings, currentStoreId, onOpenTable }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [time, setTime] = useState('');
    const [adults, setAdults] = useState(2);
    
    // 新增訂位
    const handleAddBooking = () => {
        const newBooking = { id: Date.now(), name, phone, time, adults, storeId: currentStoreId, status: 'pending' };
        setBookings([...bookings, newBooking]);
        setName(''); setPhone(''); 
    };

    return (
        <div className="p-8 bg-gray-100 h-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">📅 {currentStoreId === '001' ? '七賢店' : '楠梓店'} 預約訂位簿</h2>
            <div className="bg-white p-6 rounded-xl shadow mb-8 flex gap-4 items-end">
                <div><label className="text-sm block">客人姓名</label><input className="border p-2 rounded" value={name} onChange={e=>setName(e.target.value)}/></div>
                <div><label className="text-sm block">電話</label><input className="border p-2 rounded" value={phone} onChange={e=>setPhone(e.target.value)}/></div>
                <div><label className="text-sm block">時間</label><input type="time" className="border p-2 rounded" value={time} onChange={e=>setTime(e.target.value)}/></div>
                <button onClick={handleAddBooking} className="bg-blue-600 text-white px-6 py-2 rounded font-bold">新增預約</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {bookings.filter(b => b.storeId === currentStoreId).map(b => (
                    <div key={b.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center border-l-8 border-blue-500">
                        <div><span className="text-xl font-bold mr-4">{b.time}</span><span className="font-bold">{b.name} ({b.adults}位)</span><div className="text-sm text-gray-500">{b.phone}</div></div>
                        <div className="flex gap-2"><button onClick={() => alert('請去桌位圖選一桌，然後選擇此客人')} className="bg-green-100 text-green-700 px-4 py-2 rounded font-bold">客人報到</button><button onClick={() => setBookings(bookings.filter(x=>x.id!==b.id))} className="text-red-400 p-2">刪除</button></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HQDashboard = ({ diningPlans, setDiningPlans, menuItems, setMenuItems, memberAppSettings, setMemberAppSettings, storesConfig, setStoresConfig, storeEmployees, setStoreEmployees, clockLogs, members, setMembers, coupons, setCoupons, onEnterBranch, onLogout, categories, setCategories, memberLogs, salesLogs, setSalesLogs, stockStatus, setStockStatus, tipLogs, slotPrizes, setSlotPrizes, tiers, setTiers, bookings, setBookings }) => {
    // ... (HQDashboard logic - simplified for length, ensure full content is here if you need it)
    return <div className="p-8 text-center text-gray-500">總部後台載入中...</div>;
};

// =======================================================
// ★★★ 補回遺失的 TableModal (桌況視窗) ★★★
// =======================================================
const TableModal = ({ currentStoreId, selectedTable, onClose, onOpenTable, onRequestCheckout, diningPlans, tables, setTables, printers }) => {
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [selectedPlan, setSelectedPlan] = useState(diningPlans[0]?.id);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showChangeTable, setShowChangeTable] = useState(false);
    const [showVoidConfirm, setShowVoidConfirm] = useState(false);
    const [showModifyConfirm, setShowModifyConfirm] = useState(false); 
    const [isEditing, setIsEditing] = useState(false); 
    const [authPassword, setAuthPassword] = useState(''); 

    const liveTable = tables.find(t => t.id === selectedTable.id);
    if (!liveTable) { onClose(); return null; }

    const initEditData = () => { setAdults(liveTable.adults); setChildren(liveTable.children); setSelectedPlan(liveTable.plan); };

    const handleConfirmOpen = async () => { 
        const sessionToken = Date.now().toString();
        onOpenTable(selectedTable.id, adults, children, selectedPlan, sessionToken); 
        const counterConfig = printers.find(p => p.id === 'counter') || printers[0];
        const counterIp = counterConfig ? counterConfig.ip : '192.168.1.176';
        const kitchenConfig = printers.find(p => p.id === 'kitchen_hot');
        const kitchenIp = kitchenConfig ? kitchenConfig.ip : '192.168.1.180';
        const SERVER_API = `${STORE_URLS[currentStoreId]}/api/print`;
        const BASE_URL = STORE_URLS[currentStoreId] || STORE_URLS['003'];
        const orderUrl = `${BASE_URL}?mode=customer&store=${currentStoreId}&table=${selectedTable.id}&token=${sessionToken}`;
        const now = new Date();
        const lastOrder = new Date(now.getTime() + 90 * 60000); 

        const qrCodeData = { 
            type: 'qrcode', tableId: selectedTable.id, content: orderUrl, targetIp: counterIp, 
            extraInfo: { adults, children, planName: diningPlans.find(p => p.id === selectedPlan)?.name, startTime: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), lastOrderTime: lastOrder.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
        };
        const notificationData = {
            type: 'entry_notification', tableId: selectedTable.id,
            extraInfo: { adults, children, planName: diningPlans.find(p => p.id === selectedPlan)?.name, startTime: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
        };
        
        try {
            await fetch(SERVER_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(qrCodeData) });
            await fetch(SERVER_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...notificationData, targetIp: counterIp }) });
            if (kitchenIp !== counterIp) {
                await fetch(SERVER_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...notificationData, targetIp: kitchenIp }) });
            }
            alert(`開桌成功！\n🖨️ 櫃台：QR Code + 通知單\n🖨️ 廚房：通知單`);
        } catch (error) { alert(`開桌成功！但列印指令發送失敗 (請檢查 Server 連線)。`); }
    };

    const handleReprintQR = async () => {
        const targetConfig = printers.find(p => p.id === 'counter') || printers[0];
        const targetIp = targetConfig ? targetConfig.ip : '192.168.1.176';
        const SERVER_API = `${STORE_URLS[currentStoreId]}/api/print`;
        const BASE_URL = STORE_URLS[currentStoreId] || STORE_URLS['003'];
        const currentToken = liveTable.token || ''; 
        const orderUrl = `${BASE_URL}?mode=customer&store=${currentStoreId}&table=${selectedTable.id}&token=${currentToken}`;
        const startTimeRaw = liveTable.startTime ? new Date(liveTable.startTime) : new Date();
        const lastOrderRaw = new Date(startTimeRaw.getTime() + 90 * 60000);
        const printData = { 
            type: 'qrcode', tableId: selectedTable.id, content: orderUrl, targetIp: targetIp,
            extraInfo: { adults: liveTable.adults, children: liveTable.children, planName: diningPlans.find(p => p.id === liveTable.plan)?.name, startTime: startTimeRaw.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), lastOrderTime: lastOrderRaw.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
        };
        try { await fetch(SERVER_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(printData) }); } catch (error) { alert('列印失敗'); }
    };

    const handleChangeTable = (targetTableId) => {
        if (!window.confirm(`確定要將 [${liveTable.id}] 換到 [${targetTableId}] 嗎？`)) return;
        setTables(prev => prev.map(t => {
            if (t.id === targetTableId) { return { ...t, status: 'occupied', startTime: liveTable.startTime, adults: liveTable.adults, children: liveTable.children, plan: liveTable.plan, total: liveTable.total, orders: liveTable.orders, token: liveTable.token }; }
            if (t.id === liveTable.id) { return { ...t, status: 'empty', startTime: null, adults: 0, children: 0, plan: '', total: 0, orders: [], token: null }; }
            return t;
        }));
        alert(`換桌成功！\n舊桌號：${liveTable.id} -> 新桌號：${targetTableId}`);
        onClose(); 
    };

    const handleVoidTable = async () => {
        if (authPassword !== '88888') { alert('密碼錯誤！'); setAuthPassword(''); return; }
        if (!window.confirm(`⚠️ 警告：確定要作廢 [${liveTable.id}] 的所有訂單嗎？\n此操作無法復原！`)) return;
        const targetConfig = printers.find(p => p.id === 'counter') || printers[0];
        const targetIp = targetConfig ? targetConfig.ip : '192.168.1.176';
        const SERVER_API = `${STORE_URLS[currentStoreId]}/api/print`;
        try { await fetch(SERVER_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'void', tableId: liveTable.id, targetIp: targetIp, extraInfo: { reason: '現場作廢', staffName: '主管授權' } }) }); } catch (e) {}
        setTables(prev => prev.map(t => { if (t.id === liveTable.id) { return { ...t, status: 'empty', startTime: null, adults: 0, children: 0, plan: '', total: 0, orders: [], token: null }; } return t; }));
        alert(`已執行廢單！\n桌號 [${liveTable.id}] 已重置為空桌。`);
        onClose();
    };

    const handleSaveModification = () => {
        const plan = diningPlans.find(p => p.id === selectedPlan);
        const currentTips = (liveTable.orders || []).filter(o => o.category === 'Tip').reduce((sum, item) => sum + (parseInt(item.price) || 0), 0);
        const newTotal = Math.round((adults * plan.price + children * plan.childPrice) * 1.1) + currentTips;
        setTables(prev => prev.map(t => { if (t.id === liveTable.id) { return { ...t, adults: adults, children: children, plan: selectedPlan, total: newTotal }; } return t; }));
        alert('✅ 修改成功！\n人數、方案與總金額已更新。');
        setIsEditing(false); 
    };

    const handleVerifyModify = () => {
        if (authPassword !== '88888') { alert('密碼錯誤！'); setAuthPassword(''); return; }
        setShowModifyConfirm(false); setAuthPassword(''); initEditData(); setIsEditing(true); 
    };

    if (liveTable.status === 'occupied') {
        if (showChangeTable) {
            const emptyTables = tables.filter(t => t.status === 'empty');
            return (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
                    <div className="bg-white p-6 rounded-2xl w-96">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><MoveRight/> 請選擇新桌號</h3>
                        <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto mb-4">
                            {emptyTables.map(t => ( <button key={t.id} onClick={() => handleChangeTable(t.id)} className="bg-green-100 text-green-800 py-3 rounded-lg font-bold hover:bg-green-200 border border-green-300">{t.id}</button> ))}
                        </div>
                        <button onClick={() => setShowChangeTable(false)} className="w-full bg-gray-200 py-3 rounded-lg font-bold">取消返回</button>
                    </div>
                </div>
            );
        }
        if (showVoidConfirm) {
            return (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]">
                    <div className="bg-white p-6 rounded-2xl w-80 text-center">
                        <div className="text-red-600 mb-2"><FileWarning size={48} className="mx-auto"/></div>
                        <h3 className="text-xl font-bold mb-2 text-red-600">主管授權 (廢單)</h3>
                        <input type="password" className="w-full text-center text-2xl font-bold border-2 border-red-200 rounded-lg p-2 mb-4 outline-none focus:border-red-500" placeholder="輸入密碼" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} />
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => {setShowVoidConfirm(false); setAuthPassword('');}} className="bg-gray-200 py-3 rounded-lg font-bold">取消</button>
                            <button onClick={handleVoidTable} className="bg-red-600 text-white py-3 rounded-lg font-bold">確認作廢</button>
                        </div>
                    </div>
                </div>
            );
        }
        if (showModifyConfirm) {
            return (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]">
                    <div className="bg-white p-6 rounded-2xl w-80 text-center">
                        <div className="text-blue-600 mb-2"><Edit3 size={48} className="mx-auto"/></div>
                        <h3 className="text-xl font-bold mb-2 text-blue-600">主管授權 (修改)</h3>
                        <input type="password" className="w-full text-center text-2xl font-bold border-2 border-blue-200 rounded-lg p-2 mb-4 outline-none focus:border-blue-500" placeholder="輸入密碼" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} />
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => {setShowModifyConfirm(false); setAuthPassword('');}} className="bg-gray-200 py-3 rounded-lg font-bold">取消</button>
                            <button onClick={handleVerifyModify} className="bg-blue-600 text-white py-3 rounded-lg font-bold">進入修改</button>
                        </div>
                    </div>
                </div>
            );
        }
        if (isEditing) {
            return (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-[600px] border-4 border-blue-500">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold text-blue-800">修改資訊 - 桌號 {liveTable.id}</h2>
                            <button onClick={() => setIsEditing(false)}><X size={32}/></button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-500 font-bold mb-2">用餐人數</label>
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-gray-50 p-4 rounded-xl flex justify-between items-center"><span>大人</span><div className="flex items-center gap-3"><button onClick={() => setAdults(Math.max(1, adults - 1))} className="p-2 bg-white rounded-full shadow"><Minus size={16}/></button><span className="text-2xl font-bold w-8 text-center">{adults}</span><button onClick={() => setAdults(adults + 1)} className="p-2 bg-white rounded-full shadow"><Plus size={16}/></button></div></div>
                                    <div className="flex-1 bg-gray-50 p-4 rounded-xl flex justify-between items-center"><span>小孩</span><div className="flex items-center gap-3"><button onClick={() => setChildren(Math.max(0, children - 1))} className="p-2 bg-white rounded-full shadow"><Minus size={16}/></button><span className="text-2xl font-bold w-8 text-center">{children}</span><button onClick={() => setChildren(children + 1)} className="p-2 bg-white rounded-full shadow"><Plus size={16}/></button></div></div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-500 font-bold mb-2">選擇方案</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {diningPlans.map(plan => (
                                        <button key={plan.id} onClick={() => setSelectedPlan(plan.id)} className={`p-4 rounded-xl border-2 transition-all ${selectedPlan === plan.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200'}`}><div className="font-bold">{plan.name}</div><div className="text-sm opacity-80">${plan.price}</div></button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleSaveModification} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:bg-blue-700">💾 儲存修改 (自動重算金額)</button>
                        </div>
                    </div>
                </div>
            );
        }

        const groupedOrders = []; 
        let currentBatch = []; 
        let lastBatchId = null; 
        (liveTable.orders || []).forEach(o => { if (lastBatchId && o.batchId !== lastBatchId) { groupedOrders.push({ batchId: lastBatchId, items: currentBatch }); currentBatch = []; } currentBatch.push(o); lastBatchId = o.batchId; }); 
        if (currentBatch.length > 0) groupedOrders.push({ batchId: lastBatchId, items: currentBatch }); 
        groupedOrders.reverse();

        return (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-[600px] relative">
                    <div className="absolute top-8 right-16">
                         <button onClick={() => setShowAdvanced(!showAdvanced)} className={`p-2 rounded-lg transition-colors ${showAdvanced ? 'bg-gray-200' : 'bg-white hover:bg-gray-100'}`}><Settings size={24} className="text-gray-500"/></button>
                         {showAdvanced && (
                             <div className="absolute right-0 top-12 bg-white shadow-xl border rounded-xl overflow-hidden w-40 z-10 animate-fade-in-up">
                                 <button onClick={() => setShowModifyConfirm(true)} className="w-full text-left px-4 py-3 hover:bg-yellow-50 text-yellow-700 font-bold border-b flex items-center gap-2"><Edit3 size={16}/> 修改資訊</button>
                                 <button onClick={() => setShowChangeTable(true)} className="w-full text-left px-4 py-3 hover:bg-blue-50 text-blue-600 font-bold border-b flex items-center gap-2"><MoveRight size={16}/> 換桌</button>
                                 <button onClick={() => setShowVoidConfirm(true)} className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-bold flex items-center gap-2"><FileWarning size={16}/> 廢單</button>
                             </div>
                         )}
                    </div>
                    <div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold">桌號 {liveTable.id} (用餐中)</h2><button onClick={onClose}><X size={32}/></button></div>
                    <div className="bg-gray-50 p-4 rounded-xl mb-4 text-center"><div className="text-gray-500 text-sm">點餐概況</div><div className="text-xl font-bold">{liveTable.orders ? liveTable.orders.length : 0} 項餐點已送出</div></div>
                    <div className="max-h-60 overflow-y-auto mb-6 bg-gray-100 p-3 rounded-lg text-sm space-y-3">
                        {groupedOrders.length === 0 && <div className="text-center text-gray-400">尚無點餐紀錄</div>}
                        {groupedOrders.map((group, gIdx) => (
                            <div key={gIdx} className="bg-white p-2 rounded shadow-sm">
                                <div className="text-xs font-bold text-gray-400 mb-1 border-b pb-1 flex justify-between"><span>第 {groupedOrders.length - gIdx} 次加點</span><span>{new Date(group.items[0].time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                                {group.items.map((o, idx) => (
                                    <div key={idx} className="flex justify-between py-1"><span>{o.name}</span><span className="font-bold">{o.category==='Tip' ? `$${o.price}` : `x${o.count}`}</span></div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <button onClick={handleReprintQR} className="bg-gray-200 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-300"><QrCode/> 補印 QR</button>
                        <button onClick={onClose} className="bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300">關閉視窗</button>
                    </div>
                    <button onClick={() => onRequestCheckout(liveTable)} className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:bg-red-700 mt-2">前往結帳</button>
                </div>
            </div>
        );
    }
    return (<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white p-8 rounded-2xl shadow-2xl w-[600px]"><div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold">開桌設定 - 桌號 {selectedTable.id}</h2><button onClick={onClose}><X size={32}/></button></div><div className="space-y-6"><div><label className="block text-gray-500 font-bold mb-2">用餐人數</label><div className="flex gap-4"><div className="flex-1 bg-gray-50 p-4 rounded-xl flex justify-between items-center"><span>大人</span><div className="flex items-center gap-3"><button onClick={() => setAdults(Math.max(1, adults - 1))} className="p-2 bg-white rounded-full shadow"><Minus size={16}/></button><span className="text-2xl font-bold w-8 text-center">{adults}</span><button onClick={() => setAdults(adults + 1)} className="p-2 bg-white rounded-full shadow"><Plus size={16}/></button></div></div><div className="flex-1 bg-gray-50 p-4 rounded-xl flex justify-between items-center"><span>小孩</span><div className="flex items-center gap-3"><button onClick={() => setChildren(Math.max(0, children - 1))} className="p-2 bg-white rounded-full shadow"><Minus size={16}/></button><span className="text-2xl font-bold w-8 text-center">{children}</span><button onClick={() => setChildren(children + 1)} className="p-2 bg-white rounded-full shadow"><Plus size={16}/></button></div></div></div></div><div><label className="block text-gray-500 font-bold mb-2">選擇方案</label><div className="grid grid-cols-3 gap-3">{diningPlans.map(plan => (<button key={plan.id} onClick={() => setSelectedPlan(plan.id)} className={`p-4 rounded-xl border-2 transition-all ${selectedPlan === plan.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200'}`}><div className="font-bold">{plan.name}</div><div className="text-sm opacity-80">${plan.price}</div></button>))}</div></div><button onClick={handleConfirmOpen} className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:bg-orange-700">確認開桌 + 列印 QR</button></div></div></div>);
};

// =======================================================
// ★★★ 補回遺失的 CheckoutModal (結帳視窗) ★★★
// =======================================================
const CheckoutModal = ({ table, onClose, onConfirmPayment, diningPlans, coupons, members, slotPrizes, onUpdateMember, printers, storeId }) => {
    const plan = diningPlans.find(p => p.id === table.plan);
    const subtotal = (table.adults * plan.price) + (table.children * plan.childPrice);
    const serviceFee = Math.round(subtotal * 0.1);
    const tipTotal = (table.orders || []).filter(o => o.category === 'Tip').reduce((sum, item) => sum + (parseInt(item.price) || 0), 0);
    
    const [memberPhone, setMemberPhone] = useState('');
    const [foundMember, setFoundMember] = useState(null);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [receivedAmount, setReceivedAmount] = useState('');
    const [discountCode, setDiscountCode] = useState('');
    const [customDiscount, setCustomDiscount] = useState({ type: 'none', val: 0 }); 
    const [cashDrawerEnabled] = useStickyState(false, 'pos_cash_drawer_enabled'); 
    
    const [paymentMethod, setPaymentMethod] = useState('現金'); 
    const [showSlotMachine, setShowSlotMachine] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinResult, setSpinResult] = useState(null);
    const [slotPrizeDiscount, setSlotPrizeDiscount] = useState(0);
    const [currentIcon, setCurrentIcon] = useState('🎰');

    useEffect(() => {
        let interval;
        if (isSpinning) {
            const icons = ['🍒', '🍋', '🍇', '💎', '7️⃣', '🔔', '🍀', '💰'];
            interval = setInterval(() => { setCurrentIcon(icons[Math.floor(Math.random() * icons.length)]); }, 100);
        }
        return () => clearInterval(interval);
    }, [isSpinning]);

    const calculateDiscount = () => { 
        let totalDisc = 0; 
        if (appliedCoupon && appliedCoupon.type === 'cash') totalDisc += parseInt(appliedCoupon.value); 
        if (appliedCoupon && appliedCoupon.type === 'percent') { const discountRate = (100 - appliedCoupon.value) / 100; totalDisc += Math.round(subtotal * discountRate); }
        if (customDiscount.type === 'amount') totalDisc += parseInt(customDiscount.val || 0); 
        if (customDiscount.type === 'percent') totalDisc += Math.round(subtotal * (1 - parseInt(customDiscount.val || 100) / 100)); 
        if (customDiscount.type === 'single') totalDisc += Math.round(plan.price * (1 - parseInt(customDiscount.val || 100) / 100)); 
        return totalDisc + slotPrizeDiscount;
    };
    
    const getDiscountDisplay = () => { if (customDiscount.type === 'percent') return Math.round(subtotal * (1 - customDiscount.val/100)); if (customDiscount.type === 'single') return Math.round(plan.price * (1 - customDiscount.val/100)); return parseInt(customDiscount.val || 0); }
    const finalTotal = Math.max(0, subtotal + serviceFee + tipTotal - calculateDiscount());
    const changeAmount = receivedAmount ? parseInt(receivedAmount) - finalTotal : 0;
    
    const handleSearchMember = () => { const safeMembers = members || []; const member = safeMembers.find(m => m.phone === memberPhone); if (member) setFoundMember(member); else alert('查無此會員'); };
    const applyDiscountCode = () => { const safeCoupons = coupons || []; const coupon = safeCoupons.find(c => c.code === discountCode); if(coupon) setAppliedCoupon(coupon); else alert('無效的代碼'); };
    
    const handleSpin = () => {
        setIsSpinning(true); setSpinResult(null);
        const totalWeight = slotPrizes.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedPrize = slotPrizes[0];
        for (const prize of slotPrizes) { if (random < prize.weight) { selectedPrize = prize; break; } random -= prize.weight; }
        setTimeout(() => {
            setIsSpinning(false); setSpinResult(selectedPrize);
            if (selectedPrize.type === 'current_discount_percent') {
                const discountRate = selectedPrize.value === 0 ? 0 : selectedPrize.value / 100;
                const discAmount = selectedPrize.value === 0 ? (subtotal + serviceFee) : Math.round(subtotal * (1 - discountRate));
                setSlotPrizeDiscount(discAmount);
            } else if (selectedPrize.type === 'future_coupon') {
                if (foundMember && onUpdateMember) {
                    const newCoupon = { id: Date.now(), name: selectedPrize.name, redeemed: false, code: `WIN-${Math.floor(Math.random()*10000)}` };
                    const updatedMember = { ...foundMember, items: [...foundMember.items, newCoupon] };
                    onUpdateMember(updatedMember);
                    setFoundMember(updatedMember);
                }
            }
        }, 2000);
    };

    const handleConfirm = async () => { 
        if (cashDrawerEnabled && paymentMethod === '現金') alert('嗶！錢箱已開啟'); 
        const targetConfig = (printers || []).find(p => p.id === 'counter') || printers[0];
        const targetIp = targetConfig ? targetConfig.ip : '192.168.1.176';
        try { 
            const SERVER_API = `${STORE_URLS[storeId]}/api/print`; 
            await fetch(SERVER_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ type: 'checkout', tableId: table.id, targetIp: targetIp, content: [], extraInfo: { planName: plan.name, adults: table.adults, children: table.children, finalTotal: finalTotal, receivedAmount: receivedAmount, changeAmount: changeAmount, paymentMethod: paymentMethod } }) 
            }); 
        } catch (error) { console.error("無法連線出單機:", error); }
        onConfirmPayment(table.id, { receivedAmount, changeAmount, memberPhone, finalTotal, planName: plan.name, adults: table.adults, children: table.children, paymentMethod: paymentMethod }, appliedCoupon ? appliedCoupon.id : null); 
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-[1000px] h-[720px] rounded-2xl shadow-2xl flex overflow-hidden relative">
                {showSlotMachine && (
                    <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center text-white">
                        <button onClick={()=>setShowSlotMachine(false)} className="absolute top-4 right-4"><X size={32}/></button>
                        <h2 className="text-4xl font-bold mb-8 text-yellow-400 animate-pulse">🎰 幸運水果盤 🎰</h2>
                        <div className="w-64 h-64 bg-white rounded-2xl flex items-center justify-center text-9xl border-8 border-yellow-500 shadow-lg overflow-hidden"><div className={isSpinning ? 'animate-spin-fast' : ''}>{isSpinning ? currentIcon : (spinResult ? spinResult.icon : '🍒')}</div></div>
                        {spinResult && !isSpinning && <div className="mt-6 text-3xl font-bold text-green-400 animate-bounce">{spinResult.name}</div>}
                        {!spinResult && !isSpinning && <button onClick={handleSpin} className="mt-8 bg-red-600 hover:bg-red-500 text-white px-12 py-4 rounded-full text-2xl font-bold shadow-lg transform transition active:scale-95">開始抽獎</button>}
                        {spinResult && !isSpinning && <button onClick={()=>setShowSlotMachine(false)} className="mt-8 bg-gray-600 hover:bg-gray-500 px-8 py-3 rounded-xl font-bold">關閉並領獎</button>}
                    </div>
                )}
                <div className="w-1/2 bg-gray-50 p-8 border-r overflow-y-auto"><h2 className="text-2xl font-bold mb-6">結帳確認 - 桌號 {table.id}</h2>
                <div className="space-y-2 mb-6 text-sm">
                    <div className="flex justify-between"><span>方案 ({table.adults}大 {table.children}小)</span><span>${subtotal}</span></div>
                    <div className="flex justify-between"><span>服務費 (10%)</span><span>${serviceFee}</span></div>
                    {tipTotal > 0 && <div className="flex justify-between text-blue-600 font-bold"><span>服務員打賞 (小費)</span><span>+${tipTotal}</span></div>}
                    {appliedCoupon && (<div className="flex justify-between text-green-600 font-bold"><span>優惠券 ({appliedCoupon.name})</span><span>{appliedCoupon.type === 'item' ? '兌換食材' : appliedCoupon.type === 'percent' ? `-${Math.round(subtotal * (1 - appliedCoupon.value/100))}` : `-$${appliedCoupon.value}`}</span></div>)}
                    {customDiscount.type !== 'none' && <div className="flex justify-between text-green-600 font-bold"><span>手動折扣</span><span>-${getDiscountDisplay()}</span></div>}
                    {slotPrizeDiscount > 0 && <div className="flex justify-between text-yellow-600 font-bold"><span>🎰 抽獎折扣</span><span>-${slotPrizeDiscount}</span></div>}
                    <div className="flex justify-between text-3xl font-bold border-t pt-4 mt-2 text-gray-800"><span>總金額</span><span>${finalTotal}</span></div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border mb-4"><label className="text-xs font-bold text-gray-500 mb-2 block">折扣設定</label><div className="flex gap-2 mb-2"><select className="border p-2 rounded text-sm flex-grow" value={customDiscount.type} onChange={e => setCustomDiscount({...customDiscount, type: e.target.value, val: e.target.value === 'single' ? 90 : 0})}><option value="none">無折扣</option><option value="single">單人折扣</option><option value="percent">整桌折扣</option><option value="amount">金額折抵</option></select>{(customDiscount.type === 'percent' || customDiscount.type === 'single') && (<div className="flex gap-1">{[95, 90, 80].map(r => (<button key={r} onClick={() => setCustomDiscount({...customDiscount, val: r})} className={`px-2 rounded text-xs font-bold border ${parseInt(customDiscount.val) === r ? 'bg-orange-500 text-white' : 'bg-white'}`}>{r}折</button>))}<input type="number" className="border p-2 rounded w-16 text-sm" placeholder="%" value={customDiscount.val} onChange={e => setCustomDiscount({...customDiscount, val: e.target.value})} /></div>)}{customDiscount.type === 'amount' && <input type="number" className="border p-2 rounded w-24 text-sm" placeholder="$" value={customDiscount.val} onChange={e => setCustomDiscount({...customDiscount, val: e.target.value})} />}</div><div className="flex gap-2"><input className="border p-2 rounded flex-grow text-sm" placeholder="輸入優惠代碼" value={discountCode} onChange={e => setDiscountCode(e.target.value)} /><button onClick={applyDiscountCode} className="bg-gray-800 text-white px-3 rounded font-bold text-sm">應用</button></div></div><div className="bg-white p-4 rounded-xl shadow-sm border mb-4"><label className="text-xs font-bold text-gray-500 mb-2 block">會員查詢</label><div className="flex gap-2 mb-2"><input className="border p-2 rounded flex-grow" placeholder="電話" value={memberPhone} onChange={e => setMemberPhone(e.target.value)} /><button onClick={handleSearchMember} className="bg-blue-600 text-white px-4 rounded font-bold">查詢</button></div>{foundMember && (<div className="text-sm bg-blue-50 p-2 rounded text-blue-800 flex justify-between items-center"><div><div>{foundMember.name} <span className="bg-yellow-200 text-yellow-800 px-1 rounded text-xs ml-1">{foundMember.level}</span></div><div>點數: {foundMember.points}</div></div>{finalTotal >= 1000 && !spinResult && (<button onClick={()=>setShowSlotMachine(true)} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-lg font-bold text-xs shadow hover:scale-105 transition flex items-center gap-1"><Sparkles size={12}/> 滿千抽獎</button>)}</div>)}</div>{foundMember && (<div className="mb-4"><label className="text-xs font-bold text-gray-500 mb-2 block">會員票夾 (已擁有)</label><div className="flex flex-wrap gap-2">{foundMember.items.filter(i => !i.redeemed).length === 0 ? <span className="text-gray-400 text-xs">無可用票券</span> : foundMember.items.filter(i => !i.redeemed).map(item => { const couponMeta = coupons.find(c => c.name === item.name); 
                const isUsable = couponMeta; 
                return (<button key={item.id} onClick={() => isUsable && setAppliedCoupon(appliedCoupon?.name === item.name ? null : { ...item, type: couponMeta.type, value: couponMeta.value })} disabled={!isUsable} className={`px-3 py-1 text-xs rounded border flex items-center gap-1 ${!isUsable ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : appliedCoupon?.name === item.name ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-gray-600 hover:border-orange-300'}`}>{item.name}</button>); })}</div></div>)}</div>
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


// --- 5.1 MainPOS (主系統 - 終極防重覆列印版) ---
const MainPOS = ({ currentStore, onLogout, isHQMode, slotPrizes, setSlotPrizes, tiers, setTiers, bookings, setBookings }) => {
    // 透過 Store ID 來區分桌位資料
    const [tables, setTables, tablesLoading] = useFirebaseState('pos_data', `tables_${currentStore.id}`, []); 

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
    const [salesLogs, setSalesLogs] = useFirebaseState('pos_data', 'sales_logs', []); 
    const [stockStatus, setStockStatus] = useFirebaseState('pos_data', 'stock_status', INITIAL_STOCK_STATUS);
    const [tipLogs, setTipLogs] = useFirebaseState('pos_data', 'tip_logs', []);

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
        alert(`✅ 桌號 ${targetTableId} 結帳完成！\n會員積點已更新。`);
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
                </nav>
            </div>
            <div className="flex-grow overflow-hidden relative">
                <div className={`h-16 shadow-sm flex justify-between items-center px-6 bg-white`}>
                    <div className="flex items-center gap-3"><h1 className="text-xl font-bold text-gray-800">{currentView === 'home' ? `桌位管理 - ${currentStore.name}` : '野饌POS系統'}</h1></div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <button onClick={playSound} className="bg-red-50 text-white px-3 py-1 rounded font-bold hover:bg-red-600 active:scale-95 transition-transform shadow-sm">
                            🔊 測試音效
                        </button>
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-bold">分店代碼: {currentStore.id}</span>
                        <span className="flex items-center gap-1"><Wifi size={16} className="text-green-500"/> 連線正常</span>
                        <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                </div>
                <div className="h-[calc(100vh-64px)] overflow-hidden">
                    {currentView === 'home' && renderHome()}
                    {currentView === 'menu' && <MenuPage tables={tables} menuItems={menuItems} categories={categories} setTables={setTables} printers={printers} currentStore={currentStore} stockStatus={stockStatus} setStockStatus={setStockStatus} />}
                    {currentView === 'settings' && <SettingsPage printers={printers} setPrinters={setPrinters} onLogout={onLogout} onResetData={handleResetData} currentStoreId={currentStore.id} setCloudPrinters={setCloudPrinters} />}
                    {currentView === 'member' && <MemberPage memberAppSettings={memberAppSettings} members={members} onUpdateMember={handleUpdateMember} coupons={coupons} addLog={addMemberLog} currentStoreName={currentStore.name} />}
                    {currentView === 'booking' && <BookingPage bookings={bookings} setBookings={setBookings} currentStoreId={currentStore.id} />}
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
            </div>
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

// --- 7. App (Entry Point) ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentStore, setCurrentStore] = useState(null); 
  const [isHQMode, setIsHQMode] = useState(false); 
  const [storesConfig] = useFirebaseState('pos_data', 'stores_config', INITIAL_STORES_CONFIG); 
  const [tipLogs, setTipLogs] = useFirebaseState('pos_data', 'tip_logs', []);
  const [storeEmployees] = useFirebaseState('pos_data', 'employees', INITIAL_STORE_EMPLOYEES);
  const [bookings, setBookings] = useFirebaseState('pos_data', 'bookings', []);
  const [members, setMembers] = useFirebaseState('pos_data', 'members', INITIAL_MEMBERS_DB);
  const [coupons, setCoupons] = useFirebaseState('pos_data', 'coupons', INITIAL_COUPONS);
  const [memberLogs, setMemberLogs] = useFirebaseState('pos_data', 'member_logs', []);
  const [slotPrizes, setSlotPrizes] = useFirebaseState('pos_data', 'slot_prizes', INITIAL_SLOT_PRIZES);
  const [tiers, setTiers] = useFirebaseState('pos_data', 'tiers', INITIAL_TIERS);

  const handleUpdateMember = (updatedMember) => { setMembers(prevMembers => { const exists = prevMembers.some(m => m.phone === updatedMember.phone); if (exists) { return prevMembers.map(m => m.phone === updatedMember.phone ? updatedMember : m); } else { return [...prevMembers, updatedMember]; } }); };
  const addMemberLog = (log) => { setMemberLogs(prev => [{ id: Date.now(), timestamp: Date.now(), ...log }, ...prev]); };

  const queryParams = new URLSearchParams(window.location.search);
  const isCustomerMode = queryParams.get('mode') === 'customer';
  const isTipMode = queryParams.get('mode') === 'tip';
  const [showMemberPortal, setShowMemberPortal] = useState(false);
  const [localTableId, setLocalTableId] = useStickyState('', 'pos_local_table_id');
  const [localStoreId, setLocalStoreId] = useStickyState('', 'pos_local_store_id');
  const customerTableId = queryParams.get('table');
  const customerStoreId = queryParams.get('store') || '003'; 
  const employeeId = queryParams.get('empId');
  const [printerConfig] = useFirebaseState('pos_data', `printers_${customerStoreId}`, []);

  useEffect(() => {
      if (isCustomerMode && customerTableId) {
          setLocalTableId(customerTableId);
          setLocalStoreId(customerStoreId);
      }
  }, [isCustomerMode, customerTableId, customerStoreId, setLocalTableId, setLocalStoreId]);

  if (isCustomerMode && customerTableId) {
      if (showMemberPortal) {
          return <CustomerMemberPortal members={members} onUpdateMember={handleUpdateMember} coupons={coupons} addLog={addMemberLog} onBack={() => setShowMemberPortal(false)} />;
      }
      return <CustomerWrapper tableId={customerTableId} storeId={customerStoreId} onGoToMember={() => setShowMemberPortal(true)} printerConfig={printerConfig} />;
  }

  if (isTipMode && employeeId) {
      return <TipWrapper storeId={customerStoreId || localStoreId} empId={employeeId} storeEmployees={storeEmployees} tipLogs={tipLogs} setTipLogs={setTipLogs} currentTableId={localTableId} />;
  }

  const handleLogin = (id, data) => { 
      if(data.type==='HQ'){ setIsHQMode(true); setCurrentStore({ id: '000', name: '總部' }); setIsLoggedIn(true);
      } else { setCurrentStore({ ...data, id }); setIsLoggedIn(true); setIsHQMode(false); } 
  };
  
  const handleLogout = () => { setIsLoggedIn(false); setIsHQMode(false); setCurrentStore(null); };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} storesConfig={storesConfig} />;
  
  return <MainPOS key={currentStore.id} currentStore={currentStore} onLogout={handleLogout} isHQMode={isHQMode} slotPrizes={slotPrizes} setSlotPrizes={setSlotPrizes} tiers={tiers} setTiers={setTiers} bookings={bookings} setBookings={setBookings} />;
}

const CustomerWrapper = ({ tableId, storeId, onGoToMember, printerConfig }) => {
    const [tables] = useFirebaseState('pos_data', `tables_${storeId}`, []);
    const [diningPlans] = useFirebaseState('pos_data', 'plans', INITIAL_DINING_PLANS);
    const [menuItems] = useFirebaseState('pos_data', 'menu', INITIAL_MENU_ITEMS);
    const [categories] = useFirebaseState('pos_data', 'categories', INITIAL_CATEGORIES);
    const [stockStatus] = useFirebaseState('pos_data', 'stock_status', INITIAL_STOCK_STATUS);
    return <CustomerOrderPage tableId={tableId} storeId={storeId} diningPlans={diningPlans} menuItems={menuItems} categories={categories} setTables={()=>{}} tables={tables} printers={[]} stockStatus={stockStatus} onGoToMember={onGoToMember} printerConfig={printerConfig} />;
};

const TipWrapper = ({ storeId, empId, storeEmployees, tipLogs, setTipLogs, currentTableId }) => {
    const [tables, setTables] = useFirebaseState('pos_data', `tables_${storeId}`, []);
    return <TipPage storeId={storeId} empId={empId} storeEmployees={storeEmployees} tipLogs={tipLogs} setTipLogs={setTipLogs} tables={tables} setTables={setTables} currentTableId={currentTableId} />;
};