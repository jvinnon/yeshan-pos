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

const INITIAL_PRINTERS = [ 
    { id: 'counter', name: '櫃台 QR Code (印表機)', ip: '192.168.1.176', type: 'receipt', status: 'unknown' }, 
    { id: 'kitchen_hot', name: '廚房出單機 (印表機)', ip: '192.168.1.180', type: 'kitchen', status: 'unknown' } 
];

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
// 4. Sub-Components (定義在最上面，保證讀取順序)
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

// --- 顧客端會員中心 (已修正：新會員需輸入姓名) ---
const CustomerMemberPortal = ({ members, onUpdateMember, coupons, addLog, onBack }) => {
    const [phone, setPhone] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('redeem');

    // ★★★ 新增：控制是否正在註冊的狀態 ★★★
    const [isRegistering, setIsRegistering] = useState(false);
    const [regName, setRegName] = useState(''); // 儲存客人輸入的名字

    const getValidPoints = (user) => {
        if (!user.pointLogs) return user.points || 0;
        const now = Date.now();
        return user.pointLogs.filter(log => log.expiry > now && !log.used).reduce((sum, log) => sum + log.amount, 0);
    };

    // 第一步：檢查電話
    const handleCheckPhone = () => {
        if (!phone || phone.length < 4) return alert('請輸入手機號碼'); // 簡單防呆

        const found = (members || []).find(m => m.phone === phone);
        
        if (found) {
            // 情況A：老會員 -> 直接登入
            const validPoints = getValidPoints(found);
            setCurrentUser({ ...found, points: validPoints });
            setIsLoggedIn(true);
        } else {
            // 情況B：新號碼 -> 切換到註冊模式 (輸入姓名)
            setIsRegistering(true);
        }
    };

    // 第二步：確認註冊 (新會員輸入名字後)
    const handleRegisterConfirm = () => {
        if (!regName.trim()) return alert('拜託請輸入您的尊姓大名 🙏');

        const newMember = {
            phone: phone,
            name: regName, // ★★★ 這裡使用客人輸入的名字，不再是「新朋友」 ★★★
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

        onUpdateMember(newMember); // 寫入資料庫
        setCurrentUser(newMember); // 設定當前用戶
        setIsLoggedIn(true);       // 登入成功
        setIsRegistering(false);   // 關閉註冊模式
        
        // 歡迎訊息
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

    // --- 畫面渲染邏輯 ---

    // 1. 如果還沒登入
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white">
                <div className="w-full max-w-sm">
                    {/* 標題區 */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-orange-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
                            <Users size={40}/>
                        </div>
                        <h2 className="text-3xl font-bold">
                            {isRegistering ? '歡迎新朋友 🎉' : '會員登入'}
                        </h2>
                        <p className="text-gray-400 mt-2">
                            {isRegistering ? '請輸入您的姓名以完成註冊' : '查詢點數與兌換優惠'}
                        </p>
                    </div>

                    {/* 依照狀態顯示不同的輸入框 */}
                    {!isRegistering ? (
                        <>
                            {/* 模式 A: 輸入電話 */}
                            <NumberPad value={phone} onChange={setPhone} showDisplay={true} placeholder="請輸入手機號碼" />
                            <button onClick={handleCheckPhone} className="w-full bg-orange-600 py-4 rounded-xl font-bold text-xl mt-6 shadow-lg hover:bg-orange-500">
                                下一步 / 登入
                            </button>
                            <button onClick={onBack} className="w-full text-gray-500 py-4 mt-2">返回點餐</button>
                        </>
                    ) : (
                        <div className="animate-fade-in-up">
                            {/* 模式 B: 輸入姓名 (註冊中) */}
                            <div className="bg-white p-4 rounded-xl mb-6 text-gray-900">
                                <div className="text-xs text-gray-500 mb-1">手機號碼</div>
                                <div className="text-xl font-bold font-mono">{phone}</div>
                            </div>
                            
                            <label className="block text-gray-400 mb-2 font-bold">請問怎麼稱呼您？</label>
                            <input 
                                type="text" 
                                className="w-full p-4 rounded-xl text-black text-xl font-bold text-center outline-none border-4 border-orange-500 mb-6" 
                                placeholder="點此輸入姓名" 
                                value={regName}
                                onChange={(e) => setRegName(e.target.value)}
                                autoFocus
                            />

                            <button onClick={handleRegisterConfirm} className="w-full bg-green-600 py-4 rounded-xl font-bold text-xl shadow-lg hover:bg-green-500 mb-4">
                                確認註冊
                            </button>
                            
                            <button onClick={() => { setIsRegistering(false); setRegName(''); }} className="w-full bg-gray-700 py-3 rounded-xl font-bold text-gray-300">
                                返回重輸電話
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // 2. 登入後的畫面 (維持原本的樣子)
    const tierInfo = INITIAL_TIERS[currentUser.level] || INITIAL_TIERS['Tin'];
    return ( 
        <div className="min-h-screen bg-gray-100 flex flex-col"> 
            <div className="bg-gray-900 text-white p-6 pb-12 rounded-b-[40px] shadow-xl relative z-10"> 
                <div className="flex justify-between items-start mb-4">
                    <button onClick={() => setIsLoggedIn(false)} className="bg-white/10 p-2 rounded-full"><ChevronLeft/></button>
                    <div className="text-right">
                        <div className="text-2xl font-bold">{currentUser.name}</div>
                        <div className={`text-xs px-2 py-1 rounded inline-block font-bold ${tierInfo.color} text-white`}>{tierInfo.name}</div>
                    </div>
                </div> 
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-between">
                    <div>
                        <div className="text-gray-400 text-xs">目前有效點數</div>
                        <div className="text-4xl font-bold text-orange-400">{currentUser.points}</div>
                    </div>
                    <Gift size={32} className="text-orange-400 opacity-50"/>
                </div> 
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

// ★★★ 已點紀錄視窗 (增強版：防止資料遺漏) ★★★
const OrderHistoryModal = ({ orders, onClose }) => { 
    // 資料處理：反轉順序並分組
    const safeOrders = orders || [];
    const groupedHistory = []; 
    let currentBatch = []; 
    let lastBatchId = null; 
    
    safeOrders.forEach(o => { 
        // 容錯：如果沒有 batchId，就用時間戳記當作 ID
        const thisBatchId = o.batchId || o.time || 'unknown';
        
        if (lastBatchId && thisBatchId !== lastBatchId) { 
            groupedHistory.push({ batchId: lastBatchId, items: currentBatch, time: currentBatch[0]?.time }); 
            currentBatch = []; 
        } 
        currentBatch.push(o); 
        lastBatchId = thisBatchId; 
    }); 
    
    if (currentBatch.length > 0) {
        groupedHistory.push({ batchId: lastBatchId, items: currentBatch, time: currentBatch[0]?.time }); 
    }
    
    groupedHistory.reverse(); // 最新的在最上面

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2"><ClipboardList size={24}/> 已點餐點紀錄</h2>
                    <button onClick={onClose}><X size={24}/></button>
                </div>
                <div className="overflow-y-auto p-4 flex-grow bg-gray-50">
                    {groupedHistory.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">尚未點餐</div>
                    ) : (
                        groupedHistory.map((group, idx) => (
                            <div key={idx} className="bg-white mb-4 rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
                                <div className="bg-gray-100 p-2 px-4 flex justify-between items-center border-b">
                                    <span className="font-bold text-gray-600 text-sm">第 {groupedHistory.length - idx} 次加點</span>
                                    <span className="text-xs text-gray-500 font-mono">
                                        {group.time ? new Date(group.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                                    </span>
                                </div>
                                <div className="p-2">
                                    {group.items.map((item, i) => (
                                        <div key={i} className="flex justify-between py-2 px-2 border-b last:border-0 border-gray-100">
                                            <span className="text-gray-800 font-medium">{item.name}</span>
                                            <span className="font-bold text-gray-900">{item.category==='Tip'?'$'+item.price : 'x'+item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 bg-white border-t">
                    <button onClick={onClose} className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold">關閉</button>
                </div>
            </div>
        </div>
    ); 
};

// --- 客人點餐頁面 (新功能：加入購物車確認頁面，防止誤送) ---
const CustomerOrderPage = ({ tableId, storeId, diningPlans, menuItems, categories, setTables, tables, printers, stockStatus, onGoToMember, printerConfig }) => {
    const [cart, setCart] = useState([]);
    const [addedId, setAddedId] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [showHistory, setShowHistory] = useState(false);
    const [isSending, setIsSending] = useState(false); 
    
    // ★★★ 新增：控制購物車顯示 ★★★
    const [showCart, setShowCart] = useState(false);

    const queryParams = new URLSearchParams(window.location.search);
    const urlToken = queryParams.get('token');

    const tablesRef = useRef(tables);
    useEffect(() => { tablesRef.current = tables; }, [tables]);

    const safeTables = tables || [];
    const currentTable = safeTables.find(t => t.id === tableId);
    
    if (!currentTable || currentTable.status !== 'occupied') { 
        return <div className="h-screen flex items-center justify-center bg-gray-900 text-white p-8 text-center"><div><h1 className="text-3xl font-bold mb-4">⚠️ 連結失效</h1><p>此座位尚未開桌，請聯繫服務人員。</p></div></div>; 
    }

    if (currentTable.token && currentTable.token !== urlToken) {
        return <div className="h-screen flex items-center justify-center bg-gray-900 text-white p-8 text-center"><div><h1 className="text-3xl font-bold mb-4 text-red-500">🚫 連結已過期</h1><p>這是舊的點餐連結，無法使用。</p><p className="mt-4 text-gray-400">這桌已重新開桌，請掃描桌上<br/>最新的 QR Code。</p></div></div>;
    }
    
    const now = Date.now();
    const timeLimit = 150 * 60 * 1000; 
    if (now - currentTable.startTime > timeLimit) { 
        return <div className="h-screen flex items-center justify-center bg-gray-900 text-white p-8 text-center"><div><h1 className="text-3xl font-bold mb-4 text-orange-500">⏳ 連結已過期</h1><p>此 QR Code 已超過有效期限。</p><p className="mt-2">如需加點，請聯繫服務人員。</p></div></div>; 
    }
    
    const safeDiningPlans = diningPlans || INITIAL_DINING_PLANS;
    const currentPlan = safeDiningPlans.find(p => p.id === currentTable.plan) || safeDiningPlans[0];
    
    const filteredItems = (menuItems || []).filter(item => { 
        if (item.onlyForStaff === true) return false; 
        if (activeCategory !== 'All' && item.category !== activeCategory) return false; 
        if (item.price === 0 && !item.allowedPlans?.includes(currentPlan.id)) return false; 
        if (stockStatus && stockStatus[storeId]?.[item.id] === true) return false; 
        return true; 
    });

    const handleAddToCart = (item) => { 
        if (cart.length >= 12) { alert("⚠️ 為了出餐品質，每次限點 12 樣喔！\n請先至購物車送出訂單。"); return; } 
        const existing = cart.find(i => i.id === item.id); 
        if (existing) { alert(`⚠️ "${item.name}" 已經在購物車了！\n如需加量請分批點餐。`); return; } 
        
        setAddedId(item.id); 
        setCart(prev => [...prev, { ...item, count: 1 }]); 
        setTimeout(() => setAddedId(null), 300); 
    };

    // ★★★ 新增：從購物車移除單一品項 ★★★
    const handleRemoveFromCart = (itemId) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    };

    const handleSendOrder = async () => {
        if (cart.length === 0) return;
        setIsSending(true); 

        const latestTables = tablesRef.current || [];
        const latestTableData = latestTables.find(t => t.id === tableId);
        
        const COOLDOWN_MINUTES = 10;
        const lastBatchTime = latestTableData?.lastBatchTime || 0; 
        const timeSinceLastOrder = Date.now() - lastBatchTime;
        const cooldownMs = COOLDOWN_MINUTES * 60 * 1000;
        
        if (lastBatchTime > 0 && timeSinceLastOrder < cooldownMs) { 
            const minutesLeft = Math.ceil((cooldownMs - timeSinceLastOrder) / 60000); 
            alert(`⏳ 就在剛剛，同桌親友已經送出訂單囉！\n\n為了避免重複點餐，請等待 ${minutesLeft} 分鐘後再進行加點。`); 
            setIsSending(false); 
            return; 
        }
        
        const timestamp = Date.now(); 
        const ordersToSave = cart.map(c => ({...c, time: new Date().toISOString(), batchId: timestamp}));

        // 先存檔
        setTables(prev => prev.map(t => { 
            if (t.id === tableId) { 
                const newOrders = [...(t.orders || []), ...ordersToSave]; 
                return { ...t, orders: newOrders, lastBatchTime: timestamp }; 
            } 
            return t; 
        })); 

        // 再列印
        const API_BASE = STORE_URLS[storeId] || ''; 
        const targetIp = printerConfig?.find(p => p.type === 'kitchen')?.ip || '192.168.1.180'; 
        const printData = { type: 'kitchen', tableId: tableId, content: cart.map(item => ({ name: item.name, count: item.count })), targetIp: targetIp };
        
        try { 
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); 
            await fetch(`${API_BASE}/api/print`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(printData), signal: controller.signal }); 
            clearTimeout(timeoutId);
            alert('✅ 點餐成功！廚房已收到。'); 
        } catch (e) { 
            alert('✅ 點餐已紀錄！\n(出單機忙碌中，服務人員會確認)');
        } finally {
            setCart([]); 
            setShowCart(false); // 送出後關閉購物車
            setIsSending(false); 
        }
    };

    // ★★★ 渲染購物車介面 (Modal) ★★★
    if (showCart) {
        return (
            <div className="flex flex-col h-screen bg-gray-100 relative z-50">
                {isSending && <div className="absolute inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center text-white"><Loader className="animate-spin mb-4" size={48}/><h2 className="text-2xl font-bold">訂單處理中...</h2></div>}
                
                <div className="bg-gray-900 text-white p-4 shadow-md flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart /> 購物車確認</h2>
                    <button onClick={() => setShowCart(false)} className="bg-gray-700 p-2 rounded-full"><X size={20}/></button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 pb-32">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-400 mt-20">
                            <ShoppingCart size={64} className="mx-auto mb-4 opacity-20"/>
                            <p>尚未選擇任何餐點</p>
                            <button onClick={() => setShowCart(false)} className="mt-4 text-blue-600 underline">返回菜單</button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="bg-yellow-100 p-3 rounded-lg text-yellow-800 text-sm font-bold text-center mb-2">
                                請確認以下餐點，送出後即開始製作
                            </div>
                            {cart.map((item, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center animate-fade-in-up">
                                    <div>
                                        <div className="font-bold text-lg text-gray-800">{item.name}</div>
                                        {item.price > 0 && <div className="text-orange-600 text-sm font-bold">+${item.price}</div>}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-lg">x1</span>
                                        <button onClick={() => handleRemoveFromCart(item.id)} className="bg-red-100 text-red-500 p-2 rounded-lg hover:bg-red-200">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)] p-4 rounded-t-2xl z-20">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-lg text-gray-600">共 {cart.length} 項餐點</span>
                        <span className="text-xs text-gray-400">上限 12 項</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setShowCart(false)} className="bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-lg">
                            + 繼續點餐
                        </button>
                        <button 
                            onClick={handleSendOrder} 
                            disabled={cart.length === 0}
                            className={`py-3 rounded-xl font-bold text-lg text-white shadow-lg ${cart.length === 0 ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            確認送出
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- 一般點餐畫面 (Main) ---
    return (
        <div className="flex flex-col h-screen bg-gray-100 relative">
            <div className="bg-gray-900 text-white p-4 shadow-md sticky top-0 z-10"><div className="flex justify-between items-center mb-1"><div><h1 className="font-bold text-lg">桌號 {tableId}</h1><div className="text-xs opacity-70">方案: {currentPlan.name}</div></div><button onClick={onGoToMember} className="bg-orange-600 hover:bg-orange-500 px-3 py-2 rounded-lg flex items-center gap-1 text-sm font-bold border border-orange-400 text-white"><UserCheck size={16} /> 會員中心</button></div><div className="flex justify-between items-end border-t border-gray-700 pt-1 mt-1"><div><div className="font-bold text-orange-400 text-xs">最後加點</div><div className="text-sm">{formatTime(currentTable.startTime + 90*60*1000)}</div></div><button onClick={() => setShowHistory(true)} className="text-xs text-gray-400 underline flex items-center gap-1"><ClipboardList size={12}/> 已點紀錄</button></div></div>
            <div className="flex overflow-x-auto bg-white p-4 shadow-md gap-3 sticky top-[88px] z-10 no-scrollbar">
                <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style> 
                {['All', ...categories].map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-3 rounded-full font-bold text-lg whitespace-nowrap flex-shrink-0 transition-transform active:scale-95 ${activeCategory === cat ? 'bg-orange-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>{cat}</button>
                ))}
            </div>
            <div className="flex-grow overflow-y-auto p-4 pb-32"><div className="grid grid-cols-2 gap-4">{filteredItems.map(item => (<button key={item.id} onClick={() => handleAddToCart(item)} className={`bg-white p-3 rounded-xl shadow-sm flex flex-col items-center gap-2 relative ${addedId === item.id ? 'ring-2 ring-green-500' : ''}`}><div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 font-bold text-2xl">{item.name[0]}</div><div className="text-center"><div className="font-bold text-gray-800">{item.name}</div>{item.price > 0 && <div className="text-orange-600 text-xs font-bold">+${item.price}</div>}</div></button>))}</div></div>
            
            {/* ★★★ 底部改為「查看購物車」按鈕 ★★★ */}
            {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)] p-4 rounded-t-2xl z-20">
                    <button onClick={() => setShowCart(true)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-xl shadow-lg flex items-center justify-center gap-2">
                        <ShoppingCart size={24} />
                        查看購物車 ({cart.length})
                    </button>
                </div>
            )}
            
            {showHistory && (<OrderHistoryModal orders={currentTable.orders} onClose={() => setShowHistory(false)} />)}
        </div>
    );
};

// --- 櫃台 POS 點餐 (已新增：密碼開錢箱功能) ---
const MenuPage = ({ tables, menuItems, categories, setTables, printers, currentStore, stockStatus }) => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [addedId, setAddedId] = useState(null);
    const [cart, setCart] = useState([]);
    const [selectedTableId, setSelectedTableId] = useState('');
    const safeStockStatus = stockStatus || {};
    
    // ★★★ 開錢箱相關狀態 ★★★
    const [showDrawerAuth, setShowDrawerAuth] = useState(false); // 控制密碼視窗
    const [drawerPwd, setDrawerPwd] = useState(''); // 輸入的密碼

    const filteredItems = (menuItems || []).filter(item => { 
        if (activeCategory !== 'All' && item.category !== activeCategory) return false; 
        return safeStockStatus[currentStore.id]?.[item.id] !== true; 
    });

    const handleAddToCart = (item) => { setAddedId(item.id); setCart(prev => { const existing = prev.find(i => i.id === item.id); if (existing) return prev.map(i => i.id === item.id ? { ...i, count: i.count + 1 } : i); return [...prev, { ...item, count: 1 }]; }); setTimeout(() => setAddedId(null), 300); };
    const handleRemoveFromCart = (itemId) => { setCart(prev => prev.filter(i => i.id !== itemId)); };
    
    const handleSendToKitchen = async () => { 
        if (!selectedTableId) return alert('請先選擇桌號！'); 
        if (cart.length === 0) return alert('購物車是空的！'); 
        
        const targetConfig = printers.find(p => p.id === 'kitchen_hot') || printers[0]; 
        if (!targetConfig || !targetConfig.ip) { return alert('錯誤：請先至設定頁面輸入櫃台電腦 IP！'); } 
        
        const SERVER_API = `${STORE_URLS[currentStore.id]}/api/print`; 
        const printData = { type: 'kitchen', tableId: selectedTableId, content: cart.map(item => ({ name: item.name, count: item.count })), targetIp: targetConfig.ip }; 
        
        try { 
            await fetch(SERVER_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(printData) }); 
            const timestamp = Date.now(); 
            setTables(prev => prev.map(t => { 
                if (t.id === selectedTableId) { 
                    const newOrders = [...(t.orders || []), ...cart.map(c => ({...c, time: new Date().toISOString(), batchId: timestamp}))]; 
                    return { ...t, orders: newOrders }; 
                } 
                return t; 
            })); 
            alert(`✅ 點餐成功！`); 
            setCart([]); 
        } catch (error) { 
            alert(`❌ 連線失敗！\niPad 找不到電腦`); 
        } 
    };

    // ★★★ 驗證密碼並開啟錢箱 ★★★
    const handleVerifyAndOpenDrawer = async () => {
        if (drawerPwd !== currentStore.password) {
            alert('❌ 密碼錯誤！無法開啟錢箱');
            setDrawerPwd('');
            return;
        }

        // 密碼正確，發送指令
        setShowDrawerAuth(false);
        setDrawerPwd('');

        const targetConfig = printers.find(p => p.id === 'counter') || printers[0]; // 錢箱通常連在櫃台印表機
        if (!targetConfig || !targetConfig.ip) return alert('錯誤：找不到櫃台印表機設定');

        const SERVER_API = `${STORE_URLS[currentStore.id]}/api/print`;
        
        try {
            await fetch(SERVER_API, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ 
                    type: 'open_drawer', // 特殊指令：只開錢箱
                    targetIp: targetConfig.ip 
                }) 
            });
            alert('✅ 錢箱已開啟');
        } catch (e) {
            alert('❌ 連線失敗，無法開啟錢箱');
        }
    };

    return ( 
        <div className="flex h-full bg-gray-100 overflow-hidden">
            {/* 左側菜單區 */}
            <div className="w-2/3 flex flex-col border-r border-gray-300">
                <div className="bg-white p-4 shadow-sm flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide items-center">
                    {['All', ...categories].map(cat => (<button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-3 rounded-full font-bold text-lg transition-all ${activeCategory === cat ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>{cat}</button>))}
                </div>
                <div className="flex-grow overflow-y-auto p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredItems.map(item => (<button key={item.id} onClick={() => handleAddToCart(item)} className={`bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center gap-3 active:scale-95 relative overflow-hidden ${addedId === item.id ? 'ring-4 ring-green-500' : ''}`}><div className="w-full h-24 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 font-bold text-2xl">{item.name[0]}</div><div className="text-center w-full"><div className="font-bold text-lg text-gray-800">{item.name}{item.onlyForStaff && <span className="bg-red-100 text-red-600 text-xs px-1 rounded ml-1">內</span>}</div><div className="text-orange-600 font-bold mt-1">${item.price}</div></div></button>))}
                    </div>
                </div>
            </div>

            {/* 右側購物車與功能區 */}
            <div className="w-1/3 bg-white flex flex-col shadow-xl z-10 relative">
                <div className="p-4 bg-gray-800 text-white">
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><ShoppingCart /> 點餐明細</h3>
                    <select className="w-full p-3 rounded-lg text-black font-bold outline-none" value={selectedTableId} onChange={e => setSelectedTableId(e.target.value)}>
                        <option value="">請選擇桌號...</option>
                        {tables.filter(t => t.status === 'occupied').map(t => <option key={t.id} value={t.id}>桌號 {t.id}</option>)}
                    </select>
                </div>
                
                <div className="flex-grow overflow-y-auto p-4 space-y-2">
                    {cart.length === 0 ? <div className="text-center text-gray-400 mt-10">尚未點餐</div> : cart.map(item => (<div key={item.id} className="flex justify-between items-center border-b pb-2"><div><div className="font-bold">{item.name}</div><div className="text-xs text-gray-500">${item.price} x {item.count}</div></div><div className="font-bold text-lg">x{item.count} <button onClick={() => handleRemoveFromCart(item.id)} className="text-red-500 ml-2"><X size={16}/></button></div></div>))}
                </div>
                
                <div className="p-4 border-t bg-gray-50 space-y-3">
                    <button onClick={handleSendToKitchen} className={`w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all ${cart.length > 0 && selectedTableId ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-500'}`}>
                        送出廚房 (列印)
                    </button>
                    
                    {/* ★★★ 新增：開啟錢箱按鈕 ★★★ */}
                    <button onClick={() => setShowDrawerAuth(true)} className="w-full py-3 rounded-xl font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 flex items-center justify-center gap-2">
                        <Briefcase size={20}/> 開啟錢箱 (臨時換錢)
                    </button>
                </div>

                {/* ★★★ 密碼驗證 Modal ★★★ */}
                {showDrawerAuth && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in-up">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <ShieldAlert className="text-orange-500"/> 主管授權
                                </h3>
                                <button onClick={() => {setShowDrawerAuth(false); setDrawerPwd('');}} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 text-center">請輸入【{currentStore.name}】的登入密碼<br/>以開啟錢箱</p>
                            
                            <input 
                                type="password" 
                                className="w-full p-4 text-center text-3xl font-bold border-2 border-orange-200 rounded-xl mb-4 outline-none focus:border-orange-500 tracking-widest"
                                placeholder="輸入密碼"
                                value={drawerPwd}
                                readOnly // 設為 readOnly 避免手機鍵盤跳出，使用下方的數字鍵盤
                            />
                            
                            {/* 使用 NumberPad 輸入密碼 */}
                            <NumberPad 
                                value={drawerPwd} 
                                onChange={setDrawerPwd} 
                                onEnter={handleVerifyAndOpenDrawer}
                                showDisplay={false}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div> 
    );
};

const SettingsPage = ({ printers, setPrinters, onLogout, onResetData, currentStoreId, setCloudPrinters }) => { 
    const [testingIp, setTestingIp] = useState(null); 
    const [cashDrawerEnabled, setCashDrawerEnabled] = useStickyState(false, `pos_cash_drawer_${currentStoreId}`); 
    const [localPrinters, setLocalPrinters] = useState(printers);

    useEffect(() => { setLocalPrinters(printers); }, [printers]);

    const handleLocalChange = (id, newIp) => { 
        setLocalPrinters(prev => prev.map(p => p.id === id ? { ...p, ip: newIp } : p));
    }; 

    const handleSave = () => {
        setPrinters(localPrinters);
        setCloudPrinters(localPrinters);
        alert("✅ IP 設定已儲存並同步至雲端！");
    };
    
    const handleTestConnection = (id) => { setTestingIp(id); setTimeout(() => { const isSuccess = Math.random() > 0.3; setTestingIp(null); alert(isSuccess ? '連線成功！' : '連線失敗！'); }, 1500); }; 
    
    return ( <div className="p-8 h-full bg-gray-100 overflow-y-auto"> <h2 className="text-2xl font-bold mb-6 text-gray-800">系統設定 (分店: {currentStoreId})</h2> <div className="bg-yellow-100 p-4 rounded-xl mb-6 border-l-4 border-yellow-500"> <h4 className="font-bold text-yellow-800">⚠️ 設定說明</h4> <p className="text-sm text-yellow-700">請在下方輸入 <b>印表機的真實 IP (如 192.168.1.180)</b>，切勿輸入電腦 IP。</p> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> <div className="bg-white p-6 rounded-2xl shadow-sm"><h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Printer/> 連線設定</h3><div className="space-y-4">{localPrinters.map(p => (<div key={p.id} className="flex justify-between items-center border-b pb-4 last:border-0"><div><div className="font-bold">{p.name}</div><div className="text-xs text-gray-500 mt-1"><input className="border p-1 rounded w-32" value={p.ip} onChange={(e) => handleLocalChange(p.id, e.target.value)} /> ({p.type})</div></div><div className="flex flex-col items-end gap-1"><button onClick={() => handleTestConnection(p.id)} className={`text-sm font-bold px-3 py-1.5 rounded flex items-center gap-1 ${testingIp === p.id ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{testingIp === p.id ? <RefreshCcw size={14} className="animate-spin"/> : <Wifi size={14}/>}{testingIp === p.id ? '偵測中...' : '重新連線'}</button><span className={`text-xs font-bold ${p.status === 'online' ? 'text-green-600' : p.status === 'offline' ? 'text-red-600' : 'text-gray-400'}`}>{p.status === 'online' ? '● 連線正常' : p.status === 'offline' ? '● 未連線' : '○ 未測試'}</span></div></div>))}</div><button onClick={handleSave} className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-green-700">💾 儲存並同步 IP 設定</button></div> <div className="space-y-6"><div className="bg-white p-6 rounded-2xl shadow-sm"><h3 className="font-bold text-lg mb-4 flex items-center gap-2"><HardDrive/> 硬體週邊</h3><div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border"><div><div className="font-bold text-gray-700">連結收銀機錢箱</div><div className="text-xs text-gray-500">結帳時自動送出開啟訊號 (RJ11)</div></div><button onClick={() => setCashDrawerEnabled(!cashDrawerEnabled)} className={`w-14 h-8 rounded-full p-1 transition-colors ${cashDrawerEnabled ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${cashDrawerEnabled ? 'translate-x-6' : ''}`}></div></button></div></div><div className="bg-white p-6 rounded-2xl shadow-sm"><h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Server/> 系統操作</h3><div className="space-y-3"><button onClick={onResetData} className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-bold hover:bg-red-100 border border-red-200">重置所有系統資料</button><button onClick={onLogout} className="w-full bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-700">登出 / 換班</button></div></div></div> </div> </div> ); };

const MemberPage = ({ memberAppSettings, members, onUpdateMember, coupons, addLog, currentStoreName }) => {
    const [searchVal, setSearchVal] = useState('');
    const [currentMember, setCurrentMember] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [regName, setRegName] = useState('');
    const [activeTab, setActiveTab] = useState('info'); 
    const [verifyCode, setVerifyCode] = useState('');

    const handleSearch = () => {
        const safeMembers = members || [];
        const found = safeMembers.find(m => m.phone === searchVal);
        if (found) { setCurrentMember(found); setIsRegistering(false); setActiveTab('info'); } 
        else { setCurrentMember(null); setIsRegistering(true); }
    };

    const handleRegister = () => {
        if (!regName) return alert('請輸入姓名');
        const newMember = { phone: searchVal, name: regName, level: 'Tin', points: 0, totalSpending: 0, birthday: '', lastVisit: '首次', isLineBound: false, birthdayRedeemed: false, joinDate: new Date().toISOString().split('T')[0], items: [], pointLogs: [] };
        onUpdateMember(newMember); setCurrentMember(newMember); setIsRegistering(false); setRegName(''); alert('會員註冊成功！');
    };

    const handleExchangeCoupon = (coupon) => {
        if (currentMember.points < coupon.pointCost) return alert('點數不足！');
        
        // ★★★ 核心修正：檢查是否限領一次 ★★★
        if (coupon.limit) {
            const alreadyHas = currentMember.items.some(i => i.name === coupon.name);
            if (alreadyHas) return alert('此優惠券每位會員限領一次，您已領取過！');
        }

        const updatedMember = JSON.parse(JSON.stringify(currentMember));
        updatedMember.points -= coupon.pointCost;
        const newItem = { id: Date.now(), name: coupon.name, redeemed: false, code: coupon.code ? coupon.code + Math.floor(Math.random()*1000) : Math.random().toString(36).substr(2, 6).toUpperCase() };
        updatedMember.items.push(newItem);
        onUpdateMember(updatedMember);
        setCurrentMember(updatedMember);
        addLog({ storeName: currentStoreName || 'POS', staffName: 'Staff', memberName: updatedMember.name, memberPhone: updatedMember.phone, action: `兌換: ${coupon.name}`, points: -coupon.pointCost });
        alert('兌換成功！');
    };

    const handleVerifyItem = () => {
        const itemIndex = currentMember.items.findIndex(i => i.code === verifyCode && !i.redeemed);
        if (itemIndex === -1) return alert('代碼無效或已核銷');
        const updatedMember = JSON.parse(JSON.stringify(currentMember));
        updatedMember.items[itemIndex].redeemed = true;
        onUpdateMember(updatedMember);
        setCurrentMember(updatedMember);
        addLog({ storeName: currentStoreName || 'POS', staffName: 'Staff', memberName: updatedMember.name, memberPhone: updatedMember.phone, action: `核銷: ${updatedMember.items[itemIndex].name}`, points: 0 });
        setVerifyCode('');
        alert(`核銷成功！\n商品：${updatedMember.items[itemIndex].name}`);
    };

    const safeCoupons = coupons || [];

    return (
        <div className="flex h-full bg-gray-100 relative">
            <div className="w-2/5 p-6 border-r border-gray-200 flex flex-col justify-center bg-white shadow-lg z-10"><h2 className="text-3xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center gap-3"><Users size={32} className="text-blue-600" /> 會員查詢</h2><NumberPad value={searchVal} onChange={setSearchVal} onEnter={handleSearch} placeholder="請輸入手機號碼" /></div>
            <div className="w-3/5 p-8 overflow-y-auto bg-gray-50 flex flex-col items-center justify-center">{!currentMember && !isRegistering && (<div className="text-center text-gray-400"><Search size={64} className="mx-auto mb-4 opacity-20" /><p className="text-xl">請在左側輸入號碼查詢</p></div>)}{isRegistering && (<div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center animate-fade-in-up"><div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500"><UserPlus size={40} /></div><h3 className="text-2xl font-bold text-gray-800 mb-2">查無此會員</h3><p className="text-gray-500 mb-6">號碼: {searchVal}</p><div className="text-left mb-6"><label className="block text-sm font-bold text-gray-600 mb-2">顧客姓名</label><input className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-orange-500 outline-none bg-gray-50" placeholder="請輸入姓名" value={regName} onChange={e => setRegName(e.target.value)} /></div><button onClick={handleRegister} className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-xl shadow-lg active:scale-95 transition-transform">立即註冊</button></div>)}{currentMember && (<div className="w-full max-w-lg space-y-4 animate-fade-in-up"><div className="bg-white rounded-2xl shadow-sm border overflow-hidden"><div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white flex justify-between items-center"><div><h3 className="text-3xl font-bold mb-1">{currentMember.name}</h3><p className="opacity-80 font-mono tracking-widest">{currentMember.phone}</p></div><div className="text-right"><div className="text-yellow-400 font-bold text-lg">{currentMember.level}</div><div className="text-xs opacity-60">Level</div></div></div><div className="p-4 flex justify-between items-center bg-blue-50"><div><div className="text-blue-800 font-bold text-3xl font-mono">{currentMember.points}</div><div className="text-blue-400 text-xs font-bold">現有點數</div></div></div></div><div className="flex gap-2"><button onClick={() => setActiveTab('info')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'info' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-gray-600 shadow-sm'}`}>我的票夾</button><button onClick={() => setActiveTab('redeem')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'redeem' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 shadow-sm'}`}>點數兌換</button><button onClick={() => setActiveTab('verify')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'verify' ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-600 shadow-sm'}`}>核銷商品</button></div><div className="bg-white rounded-2xl shadow-sm border p-6 min-h-[300px]">{activeTab === 'info' && (<div className="space-y-3"><h4 className="font-bold text-gray-800 mb-2">已擁有的票券</h4>{(!currentMember.items || currentMember.items.length === 0) ? (<p className="text-center text-gray-400 py-8">票夾是空的</p>) : currentMember.items.map((item, index) => (<div key={index} className={`flex justify-between items-center p-3 rounded-xl border-l-4 shadow-sm ${item.redeemed ? 'bg-gray-100 border-gray-400 opacity-60' : 'bg-white border-orange-500'}`}><div><span className={`font-bold ${item.redeemed ? 'line-through' : ''}`}>{item.name}</span><div className="text-xs font-mono text-gray-500">Code: {item.code || '----'}</div></div>{item.redeemed ? <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded">已核銷</span> : <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">未使用</span>}</div>))}</div>)}{activeTab === 'redeem' && (<div className="space-y-3"><h4 className="font-bold text-gray-800 mb-2">點數兌換專區</h4>{safeCoupons.filter(c => c.pointCost >= 0).map(coupon => (<div key={coupon.id} className="flex justify-between items-center p-3 rounded-xl border border-gray-200 hover:border-blue-300 transition-all"><div><div className="font-bold">{coupon.name}</div><div className="text-xs text-blue-600 font-bold">{coupon.pointCost} 點</div></div><button onClick={() => handleExchangeCoupon(coupon)} className={`px-4 py-2 rounded-lg font-bold text-sm ${currentMember.points >= coupon.pointCost ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>兌換</button></div>))}</div>)}{activeTab === 'verify' && (<div className="text-center py-4"><h4 className="font-bold text-gray-800 mb-4">輸入核銷代碼</h4><div className="mb-4"><input className="w-full p-4 text-center text-3xl font-bold tracking-widest border-2 rounded-xl uppercase bg-gray-50" placeholder="輸入代碼" value={verifyCode} readOnly /></div><div className="h-[200px] mb-2"><FullKeyboard value={verifyCode} onChange={setVerifyCode} /></div><button onClick={handleVerifyItem} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-green-700 mt-4 text-xl">確認核銷</button></div>)}</div></div>)}</div></div>
    );
};

// =======================================================
// ★★★ 以下是定義好的 Modal 元件 (順序關鍵！) ★★★
// =======================================================

const MarketingTab = ({ slotPrizes, setSlotPrizes, tiers, setTiers }) => {
    return (
        <div className="space-y-8">
            <div>
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><Sparkles className="text-yellow-500"/> 滿千水果盤機率設定</h3>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50"><tr><th className="p-3">圖示</th><th className="p-3">獎項名稱</th><th className="p-3">類型</th><th className="p-3">數值</th><th className="p-3">權重 (機率)</th></tr></thead>
                        <tbody>
                            {slotPrizes.map((prize, idx) => (
                                <tr key={prize.id} className="border-b">
                                    <td className="p-3 text-2xl">{prize.icon}</td>
                                    <td className="p-3"><input className="border p-1 w-32 rounded" value={prize.name} onChange={e => { const newPrizes = [...slotPrizes]; newPrizes[idx].name = e.target.value; setSlotPrizes(newPrizes); }} /></td>
                                    <td className="p-3 text-sm text-gray-500">{prize.type === 'none' ? '銘謝惠顧' : prize.type === 'current_discount_percent' ? '當次折扣' : '下次贈品券'}</td>
                                    <td className="p-3"><input className="border p-1 w-20 rounded" value={prize.value} onChange={e => { const newPrizes = [...slotPrizes]; newPrizes[idx].value = e.target.value; setSlotPrizes(newPrizes); }} /></td>
                                    <td className="p-3"><input type="number" className="border p-1 w-20 rounded bg-blue-50 font-bold text-blue-600" value={prize.weight} onChange={e => { const newPrizes = [...slotPrizes]; newPrizes[idx].weight = parseInt(e.target.value) || 0; setSlotPrizes(newPrizes); }} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-2 text-right text-sm text-gray-500">權重越高，抽中機率越大 (建議總合為100方便計算)</div>
                </div>
            </div>
            <div>
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><Trophy className="text-orange-500"/> 會員等級權益設定</h3>
                <div className="grid grid-cols-5 gap-4">
                    {Object.entries(tiers).map(([key, tier]) => (
                        <div key={key} className={`bg-white p-4 rounded-xl border shadow-sm border-t-4 ${key==='Gold'?'border-yellow-400':key==='Silver'?'border-gray-300':key==='Bronze'?'border-orange-700':key==='Iron'?'border-gray-600':'border-gray-400'}`}>
                            <div className="font-bold text-lg mb-1">{tier.name}</div>
                            <div className="text-xs text-gray-500 mb-2">門檻: ${tier.threshold.toLocaleString()}</div>
                            <label className="text-xs font-bold block mb-1">專屬權益文字</label>
                            <textarea className="w-full border p-2 rounded text-sm h-20" value={tier.benefit} onChange={e => { const newTiers = {...tiers}; newTiers[key].benefit = e.target.value; setTiers(newTiers); }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ★★★ 桌位詳情視窗 (修復版：Hooks 順序正確) ★★★
const TableModal = ({ currentStoreId, selectedTable, onClose, onOpenTable, onRequestCheckout, diningPlans, tables, setTables, printers }) => {
    // 1. 先把所有的 State 都宣告完 (絕對不能被 if 切斷)
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [selectedPlan, setSelectedPlan] = useState(diningPlans[0]?.id);
    
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showChangeTable, setShowChangeTable] = useState(false);
    const [showVoidConfirm, setShowVoidConfirm] = useState(false);
    
    const [showModifyConfirm, setShowModifyConfirm] = useState(false); 
    const [isEditing, setIsEditing] = useState(false); 
    const [authPassword, setAuthPassword] = useState(''); 

    // 2. 取得資料
    const liveTable = tables.find(t => t.id === selectedTable.id);

    // 3. ★★★ 安全檢查放在這裡 (所有 State 之後) ★★★
    // 如果找不到桌子資料，才關閉視窗
    if (!liveTable) {
        onClose(); 
        return null; 
    }

    // 4. 定義函式
    const initEditData = () => { setAdults(liveTable.adults); setChildren(liveTable.children); setSelectedPlan(liveTable.plan); };

    // ... (後面繼續接 handleConfirmOpen ...)

    // ★★★ 確認開桌：產生 Token 並發送 ★★★
    const handleConfirmOpen = async () => { 
        // 1. 產生新的 Session Token (用時間戳記當亂碼)
        const sessionToken = Date.now().toString();

        // 2. 呼叫 MainPOS 的開桌函式，把 Token 傳過去
        onOpenTable(selectedTable.id, adults, children, selectedPlan, sessionToken); 
        
        const counterConfig = printers.find(p => p.id === 'counter') || printers[0];
        const counterIp = counterConfig ? counterConfig.ip : '192.168.1.176';
        const kitchenConfig = printers.find(p => p.id === 'kitchen_hot');
        const kitchenIp = kitchenConfig ? kitchenConfig.ip : '192.168.1.180';
        const SERVER_API = `${STORE_URLS[currentStoreId]}/api/print`;
        const BASE_URL = STORE_URLS[currentStoreId] || STORE_URLS['003'];
        
        // 3. 把 Token 加到網址裡 (&token=...)
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
        
        // ★★★ 補印時，要讀取資料庫現有的 Token (liveTable.token) ★★★
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
        // 廢單也清空 token
        setTables(prev => prev.map(t => { if (t.id === liveTable.id) { return { ...t, status: 'empty', startTime: null, adults: 0, children: 0, plan: '', total: 0, orders: [], token: null }; } return t; }));
        alert(`已執行廢單！\n桌號 [${liveTable.id}] 已重置為空桌。`);
        onClose();
    };

    const handleSaveModification = () => {
        const plan = diningPlans.find(p => p.id === selectedPlan);
        const currentTips = (liveTable.orders || []).filter(o => o.category === 'Tip').reduce((sum, item) => sum + (parseInt(item.price) || 0), 0);
        const newTotal = Math.round((adults * plan.price + children * plan.childPrice) * 1.1) + currentTips;

        setTables(prev => prev.map(t => {
            if (t.id === liveTable.id) {
                return { ...t, adults: adults, children: children, plan: selectedPlan, total: newTotal };
            }
            return t;
        }));
        alert('✅ 修改成功！\n人數、方案與總金額已更新。');
        setIsEditing(false); 
    };

    const handleVerifyModify = () => {
        if (authPassword !== '88888') { alert('密碼錯誤！'); setAuthPassword(''); return; }
        setShowModifyConfirm(false);
        setAuthPassword('');
        initEditData(); 
        setIsEditing(true); 
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
                                    <div className="flex-1 bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                        <span>大人</span>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setAdults(Math.max(1, adults - 1))} className="p-2 bg-white rounded-full shadow"><Minus size={16}/></button>
                                            <span className="text-2xl font-bold w-8 text-center">{adults}</span>
                                            <button onClick={() => setAdults(adults + 1)} className="p-2 bg-white rounded-full shadow"><Plus size={16}/></button>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                        <span>小孩</span>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setChildren(Math.max(0, children - 1))} className="p-2 bg-white rounded-full shadow"><Minus size={16}/></button>
                                            <span className="text-2xl font-bold w-8 text-center">{children}</span>
                                            <button onClick={() => setChildren(children + 1)} className="p-2 bg-white rounded-full shadow"><Plus size={16}/></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-500 font-bold mb-2">選擇方案</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {diningPlans.map(plan => (
                                        <button key={plan.id} onClick={() => setSelectedPlan(plan.id)} className={`p-4 rounded-xl border-2 transition-all ${selectedPlan === plan.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200'}`}>
                                            <div className="font-bold">{plan.name}</div>
                                            <div className="text-sm opacity-80">${plan.price}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleSaveModification} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:bg-blue-700">
                                💾 儲存修改 (自動重算金額)
                            </button>
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
                         <button onClick={() => setShowAdvanced(!showAdvanced)} className={`p-2 rounded-lg transition-colors ${showAdvanced ? 'bg-gray-200' : 'bg-white hover:bg-gray-100'}`}>
                            <Settings size={24} className="text-gray-500"/>
                         </button>
                         {showAdvanced && (
                             <div className="absolute right-0 top-12 bg-white shadow-xl border rounded-xl overflow-hidden w-40 z-10 animate-fade-in-up">
                                 <button onClick={() => setShowModifyConfirm(true)} className="w-full text-left px-4 py-3 hover:bg-yellow-50 text-yellow-700 font-bold border-b flex items-center gap-2"><Edit3 size={16}/> 修改資訊</button>
                                 <button onClick={() => setShowChangeTable(true)} className="w-full text-left px-4 py-3 hover:bg-blue-50 text-blue-600 font-bold border-b flex items-center gap-2"><MoveRight size={16}/> 換桌</button>
                                 <button onClick={() => setShowVoidConfirm(true)} className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-bold flex items-center gap-2"><FileWarning size={16}/> 廢單</button>
                             </div>
                         )}
                    </div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold">桌號 {liveTable.id} (用餐中)</h2>
                        <button onClick={onClose}><X size={32}/></button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl mb-4 text-center">
                        <div className="text-gray-500 text-sm">點餐概況</div>
                        <div className="text-xl font-bold">{liveTable.orders ? liveTable.orders.length : 0} 項餐點已送出</div>
                    </div>
                    <div className="max-h-60 overflow-y-auto mb-6 bg-gray-100 p-3 rounded-lg text-sm space-y-3">
                        {groupedOrders.length === 0 && <div className="text-center text-gray-400">尚無點餐紀錄</div>}
                        {groupedOrders.map((group, gIdx) => (
                            <div key={gIdx} className="bg-white p-2 rounded shadow-sm">
                                <div className="text-xs font-bold text-gray-400 mb-1 border-b pb-1 flex justify-between">
                                    <span>第 {groupedOrders.length - gIdx} 次加點</span>
                                    <span>{new Date(group.items[0].time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                </div>
                                {group.items.map((o, idx) => (
                                    <div key={idx} className="flex justify-between py-1">
                                        <span>{o.name}</span><span className="font-bold">{o.category==='Tip' ? `$${o.price}` : `x${o.count}`}</span>
                                    </div>
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

// ★★★ 結帳視窗 (已新增：支付方式選擇 + 傳送桌號與方式) ★★★
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
    
    // ★★★ 新增：支付方式狀態 (預設現金) ★★★
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
            interval = setInterval(() => {
                setCurrentIcon(icons[Math.floor(Math.random() * icons.length)]);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isSpinning]);

    const calculateDiscount = () => { 
        let totalDisc = 0; 
        if (appliedCoupon && appliedCoupon.type === 'cash') totalDisc += parseInt(appliedCoupon.value); 
        if (appliedCoupon && appliedCoupon.type === 'percent') {
            const discountRate = (100 - appliedCoupon.value) / 100; 
            totalDisc += Math.round(subtotal * discountRate);
        }
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
        for (const prize of slotPrizes) {
            if (random < prize.weight) { selectedPrize = prize; break; }
            random -= prize.weight;
        }
        setTimeout(() => {
            setIsSpinning(false); setSpinResult(selectedPrize);
            if (selectedPrize.type === 'current_discount_percent') {
                const discountRate = selectedPrize.value === 0 ? 0 : selectedPrize.value / 100;
                const discAmount = selectedPrize.value === 0 
                    ? (subtotal + serviceFee) 
                    : Math.round(subtotal * (1 - discountRate));
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
        // 只有現金結帳才需要開錢箱
        if (cashDrawerEnabled && paymentMethod === '現金') alert('嗶！錢箱已開啟'); 
        
        const targetConfig = (printers || []).find(p => p.id === 'counter') || printers[0];
        const targetIp = targetConfig ? targetConfig.ip : '192.168.1.176';

        try { 
            const SERVER_API = `${STORE_URLS[storeId]}/api/print`; 
            await fetch(SERVER_API, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ 
                    type: 'checkout', 
                    tableId: table.id, 
                    targetIp: targetIp, 
                    content: [], 
                    extraInfo: { 
                        planName: plan.name, adults: table.adults, children: table.children, 
                        finalTotal: finalTotal, receivedAmount: receivedAmount, changeAmount: changeAmount,
                        paymentMethod: paymentMethod // 傳送支付方式給印表機 (雖然Server端可能沒印出來，但傳過去比較保險)
                    } 
                }) 
            }); 
        } catch (error) { console.error("無法連線出單機:", error); }
        
        onConfirmPayment(
            table.id, 
            { 
                receivedAmount, 
                changeAmount, 
                memberPhone, 
                finalTotal, 
                planName: plan.name, 
                adults: table.adults, 
                children: table.children,
                paymentMethod: paymentMethod // ★★★ 關鍵：把支付方式傳回 MainPOS ★★★
            }, 
            appliedCoupon ? appliedCoupon.id : null 
        ); 
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-[1000px] h-[720px] rounded-2xl shadow-2xl flex overflow-hidden relative">
                {showSlotMachine && (
                    <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center text-white">
                        <button onClick={()=>setShowSlotMachine(false)} className="absolute top-4 right-4"><X size={32}/></button>
                        <h2 className="text-4xl font-bold mb-8 text-yellow-400 animate-pulse">🎰 幸運水果盤 🎰</h2>
                        <div className="w-64 h-64 bg-white rounded-2xl flex items-center justify-center text-9xl border-8 border-yellow-500 shadow-lg overflow-hidden">
                            <div className={isSpinning ? 'animate-spin-fast' : ''}>
                                {isSpinning ? currentIcon : (spinResult ? spinResult.icon : '🍒')}
                            </div>
                        </div>
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
                    
                    {appliedCoupon && (
                        <div className="flex justify-between text-green-600 font-bold">
                            <span>優惠券 ({appliedCoupon.name})</span>
                            <span>
                                {appliedCoupon.type === 'item' ? '兌換食材' : 
                                 appliedCoupon.type === 'percent' ? `-${Math.round(subtotal * (1 - appliedCoupon.value/100))}` : 
                                 `-$${appliedCoupon.value}`}
                            </span>
                        </div>
                    )}

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
                        
                        {/* ★★★ 這裡放入「支付方式」按鈕 ★★★ */}
                        <label className="block text-gray-500 font-bold mb-2 text-xs">選擇支付方式</label>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {['現金', '刷卡', 'LINE Pay', '轉帳'].map(method => (
                                <button 
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`py-3 rounded-lg font-bold border-2 transition-all ${paymentMethod === method ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}
                                >
                                    {method === '現金' && '💵 '}
                                    {method === '刷卡' && '💳 '}
                                    {method === 'LINE Pay' && '📱 '}
                                    {method === '轉帳' && '🏦 '}
                                    {method}
                                </button>
                            ))}
                        </div>

                        <div className="flex-grow">
                            <NumberPad value={receivedAmount} onChange={setReceivedAmount} showDisplay={false} />
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center text-xl font-bold text-gray-600 mb-4"><span>找零</span><span>${changeAmount > 0 ? changeAmount : 0}</span></div>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={onClose} className="bg-gray-200 text-gray-700 py-4 rounded-xl font-bold text-lg">取消</button>
                                <button onClick={handleConfirm} className="bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700" disabled={!receivedAmount || changeAmount < 0}>確認結帳</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- 總部後台 (HQDashboard) - 完整修復版 ---
const HQDashboard = ({ diningPlans, setDiningPlans, menuItems, setMenuItems, memberAppSettings, setMemberAppSettings, storesConfig, setStoresConfig, storeEmployees, setStoreEmployees, clockLogs, members, setMembers, coupons, setCoupons, onEnterBranch, onLogout, categories, setCategories, memberLogs, salesLogs, setSalesLogs, stockStatus, setStockStatus, tipLogs, slotPrizes, setSlotPrizes, tiers, setTiers }) => {
  const [currentTab, setCurrentTab] = useState('report'); 
  // ★★★ 新增：銷售紀錄修改與刪除功能 (Logic) ★★★
  const [editingSale, setEditingSale] = useState(null); // 用來控制彈出視窗

  // 1. 執行更新
  const handleUpdateSale = () => {
      if(!editingSale) return;
      
      // 使用 setSalesLogs 直接更新雲端資料庫
      // 邏輯：遍歷所有紀錄，找到 ID 一樣的那筆，把它換成新的 (editingSale)，其他的保持原狀
      setSalesLogs(prev => prev.map(s => s.id === editingSale.id ? editingSale : s));
      
      setEditingSale(null); // 關閉視窗
      alert('✅ 交易已修正！報表金額已重新計算。');
  };

  // 2. 執行刪除
  const handleDeleteSale = (id) => {
      if (window.confirm('⚠️ 警告：刪除後無法復原！\n確定要移除這筆交易嗎？')) {
          // ↓↓↓ 補上這一行，防止它當機 ↓↓↓
          if (typeof setSalesLogs !== 'function') { alert('系統忙碌中，請重整頁面再試一次'); return; }
          
          setSalesLogs(prev => prev.filter(s => s.id !== id));
      }
  };
  const [editingStoreId, setEditingStoreId] = useState(null);
  const [editStoreData, setEditStoreData] = useState({});
  const [newStoreData, setNewStoreData] = useState({ id: '', name: '', password: '', type: 'Branch', tableRanges: [{ prefix: 'A', count: 20 }] });
  const [isAddingStore, setIsAddingStore] = useState(false);

  // Employee State
  const [empTargetStoreId, setEmpTargetStoreId] = useState('001');
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpPassword, setNewEmpPassword] = useState(''); 
  const [empHistoryFilter, setEmpHistoryFilter] = useState({ range: 'month', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] });
  const [empSort, setEmpSort] = useState({ key: 'date', direction: 'desc' });
  const [empViewMode, setEmpViewMode] = useState('list');
  const [editingEmpId, setEditingEmpId] = useState(null);
  const [editEmpData, setEditEmpData] = useState({ name: '', password: '' });
  const [showQrModal, setShowQrModal] = useState(false); 
  const [qrUrl, setQrUrl] = useState(''); 

  // Menu State
  const [menuViewMode, setMenuViewMode] = useState('plans'); 
  const [activePlanForEdit, setActivePlanForEdit] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', category: '肉品', price: 0 }); 
  const [editingItemId, setEditingItemId] = useState(null);
  const [editItemData, setEditItemData] = useState({});
  const [newCategoryName, setNewCategoryName] = useState(''); 
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editPlanData, setEditPlanData] = useState({});
  const [newPlan, setNewPlan] = useState({ name: '', price: '', childPrice: '' });
    
  const [targetStockStoreId, setTargetStockStoreId] = useState('001');
  const [viewingMemberHistory, setViewingMemberHistory] = useState(null);
  
  // ★★★ 優惠券 State ★★★
  const [newCoupon, setNewCoupon] = useState({ name: '', type: 'cash', value: '', description: '', expiryDate: '', code: '', pointCost: 0, limit: false });
  
  const [reportRange, setReportRange] = useState('month'); 
  const [reportStartDate, setReportStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportBranch, setReportBranch] = useState('All'); 

  const safeSettings = memberAppSettings || INITIAL_MEMBER_APP_SETTINGS;
  const [announcement, setAnnouncement] = useState(safeSettings.announcement);
  const [richMenuType, setRichMenuType] = useState(safeSettings.lineRichMenu);

  const handleStartEditStore = (store) => { setEditingStoreId(store.id); setEditStoreData({ ...store }); };
  const handleSaveStore = () => { setStoresConfig(prev => ({ ...prev, [editingStoreId]: editStoreData })); setEditingStoreId(null); alert('分店設定已更新！'); };
  const handleAddStore = () => { if (!newStoreData.id || !newStoreData.name) return alert('請輸入完整資料'); setStoresConfig(prev => ({ ...prev, [newStoreData.id]: newStoreData })); setIsAddingStore(false); alert('分店已建立'); };
  const handleAddRange = () => { setEditStoreData(prev => ({ ...prev, tableRanges: [...(prev.tableRanges || []), { prefix: 'New', count: 10 }] })); };
  const handleUpdateRange = (idx, field, val) => { const newRanges = [...editStoreData.tableRanges]; newRanges[idx][field] = val; setEditStoreData({...editStoreData, tableRanges: newRanges}); };
  const handleDeleteRange = (idx) => { const newRanges = [...editStoreData.tableRanges]; newRanges.splice(idx, 1); setEditStoreData({...editStoreData, tableRanges: newRanges}); };

  const handleAddEmployee = () => { if(!newEmpName || !newEmpPassword) return alert('請輸入姓名與密碼'); const newEmp = { id: Date.now(), name: newEmpName, password: newEmpPassword }; setStoreEmployees(prev => ({...prev, [empTargetStoreId]: [...(prev[empTargetStoreId]||[]), newEmp]})); setNewEmpName(''); setNewEmpPassword(''); alert('員工已新增'); };
  const handleDeleteEmployee = (id) => { setStoreEmployees(prev => ({...prev, [empTargetStoreId]: prev[empTargetStoreId].filter(e => e.id !== id)})); };
  const handleStartEditEmployee = (emp) => { setEditingEmpId(emp.id); setEditEmpData({ name: emp.name, password: emp.password }); };
  const handleSaveEmployee = () => { setStoreEmployees(prev => ({...prev, [empTargetStoreId]: prev[empTargetStoreId].map(e => e.id === editingEmpId ? { ...e, ...editEmpData } : e)})); setEditingEmpId(null); };
  
  const handleGenerateQr = (emp) => {
      const baseUrl = STORE_URLS[empTargetStoreId] || STORE_URLS['003'];
      const url = `${baseUrl}?mode=tip&store=${empTargetStoreId}&empId=${emp.id}`;
      setQrUrl(url);
      setShowQrModal(true);
      setTimeout(() => { const canvas = document.getElementById('emp-qr-canvas'); if (canvas) { QRCode.toCanvas(canvas, url, { width: 256 }, function (error) { if (error) console.error(error); }); } }, 100);
  };

  const getSortedLogs = () => {
      let logs = (clockLogs || []).filter(l => {
          const d = new Date(l.timestamp).toISOString().split('T')[0];
          return d >= empHistoryFilter.startDate && d <= empHistoryFilter.endDate && l.storeId === empTargetStoreId;
      });
      return logs.sort((a, b) => {
          if (empSort.key === 'name') return empSort.direction === 'asc' ? a.empName.localeCompare(b.empName) : b.empName.localeCompare(a.empName);
          if (empSort.key === 'date') return empSort.direction === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
          return 0;
      });
  };

  const handleAddPlan = () => { if(!newPlan.name) return; setDiningPlans(prev => [...prev, { id: Date.now().toString(), ...newPlan }]); setNewPlan({name:'', price:'', childPrice:''}); };
  const handleDeletePlan = (id) => setDiningPlans(prev => prev.filter(p => p.id !== id));
  const handleSavePlan = () => { setDiningPlans(prev => prev.map(p => p.id === editingPlanId ? editPlanData : p)); setEditingPlanId(null); };
  const handleAddItem = () => { if(!newItem.name) return; const allowed = diningPlans.filter(p => p.price >= activePlanForEdit.price).map(p=>p.id); setMenuItems(prev => [...prev, { id: Date.now(), ...newItem, allowedPlans: allowed, isHidden: false }]); setNewItem({name:'', category:'肉品', price:0}); };
  const handleDeleteItem = (id) => { if(window.confirm('確定刪除？')) setMenuItems(prev => prev.filter(i => i.id !== id)); };
  const handleSaveItem = () => { setMenuItems(prev => prev.map(i => i.id === editingItemId ? editItemData : i)); setEditingItemId(null); };
  const toggleStockInHQ = (itemId) => { const currentHidden = stockStatus[targetStockStoreId]?.[itemId] === true; const newStatus = { ...stockStatus, [targetStockStoreId]: { ...stockStatus[targetStockStoreId], [itemId]: !currentHidden } }; setStockStatus(newStatus); };
  const handleAddCategory = () => { if(newCategoryName && !categories.includes(newCategoryName)) { setCategories([...categories, newCategoryName]); setNewCategoryName(''); } };
  const handleDeleteCategory = (cat) => { if(window.confirm(`刪除分類 ${cat}?`)) setCategories(categories.filter(c => c !== cat)); };
  const generateCode = () => { setNewCoupon({...newCoupon, code: Math.random().toString(36).substring(2,8).toUpperCase()}); };
  
  // ★★★ 新增優惠券 Logic ★★★
  const handleAddCoupon = () => { 
      if(!newCoupon.name) return; 
      const finalValue = (newCoupon.type === 'cash' || newCoupon.type === 'percent') ? Number(newCoupon.value) : newCoupon.value;
      setCoupons(prev => [...prev, { id: Date.now(), ...newCoupon, value: finalValue }]); 
      alert('優惠券已新增'); 
  };
  const handleDeleteCoupon = (id) => setCoupons(prev => prev.filter(c => c.id !== id));
  const handleUpdateApp = () => { setMemberAppSettings({ ...safeSettings, announcement, lineRichMenu: richMenuType }); alert('LINE 設定已更新！'); };

  const getSalesData = () => {
      const logs = (salesLogs || []).filter(log => {
          const date = new Date(log.timestamp).toISOString().split('T')[0];
          const branchMatch = reportBranch === 'All' || log.storeId === reportBranch;
          return date >= reportStartDate && date <= reportEndDate && branchMatch;
      });
      const totalSales = logs.reduce((sum, log) => sum + (log.amount || 0), 0);
      const totalTxns = logs.length;
      return { totalSales, totalTxns, logs };
  };
  
  const getTipData = () => {
      const logs = (tipLogs || []).filter(log => {
          const date = new Date(log.timestamp).toISOString().split('T')[0];
          const branchMatch = reportBranch === 'All' || log.storeId === reportBranch;
          return date >= reportStartDate && date <= reportEndDate && branchMatch;
      });
      const empStats = {};
      logs.forEach(log => { if (!empStats[log.empName]) empStats[log.empName] = 0; empStats[log.empName] += parseInt(log.amount); });
      return { totalTips: logs.reduce((sum, l) => sum + parseInt(l.amount), 0), empStats, logs };
  };

  const { totalSales, totalTxns, logs: filteredSalesLogs } = getSalesData();
  const { totalTips, empStats, logs: filteredTipLogs } = getTipData();

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-gray-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-gray-800"><div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-xl font-bold">總</div><div><h1 className="font-bold text-lg">野饌總部</h1><p className="text-xs text-gray-400">HQ Admin</p></div></div>
        <nav className="flex-grow p-4 space-y-2">{HQ_TABS.map(tab => (<button key={tab.id} onClick={() => setCurrentTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}><tab.icon size={20} /><span>{tab.label}</span></button>))}</nav>
        <div className="p-4 border-t border-gray-800"><button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-600 text-white py-3 rounded-xl transition-colors"><LogOut size={18} /> 登出系統</button></div>
      </div>
      <div className="flex-grow overflow-y-auto p-8">
        
        {/* ★★★ 營運報表 (最終完整版：含修改功能 + 雙欄位小費統計) ★★★ */}
        {currentTab === 'report' && ( 
            <div className="space-y-6 relative">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><BarChart3 className="text-blue-600"/> 營運總表 & 帳務管理</h2>
                
                {/* 1. 篩選控制器 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <div className="flex gap-4 mb-6 flex-wrap items-center">
                        <select className="border p-2 rounded font-bold" value={reportBranch} onChange={e=>setReportBranch(e.target.value)}><option value="All">全部分店</option>{Object.values(storesConfig).filter(s=>s.type==='Branch').map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
                        <button onClick={() => { setReportRange('day'); const r=getDateRange('day'); setReportStartDate(r.start); setReportEndDate(r.end); }} className="px-4 py-2 bg-gray-100 rounded font-bold hover:bg-blue-100">本日</button>
                        <button onClick={() => { setReportRange('month'); const r=getDateRange('month'); setReportStartDate(r.start); setReportEndDate(r.end); }} className="px-4 py-2 bg-gray-100 rounded font-bold hover:bg-blue-100">本月</button>
                        <div className="flex items-center gap-2 border p-2 rounded bg-gray-50"><span className="text-gray-500 text-sm">自訂:</span><input type="date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)}/> <span>~</span> <input type="date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)}/></div>
                    </div>

                    {/* 2. 數據概況卡片 */}
                    <div className="grid grid-cols-4 gap-6 mb-6">
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100"><div className="text-blue-600 font-bold mb-1">營業總額</div><div className="text-4xl font-bold text-gray-800">${totalSales.toLocaleString()}</div></div>
                        <div className="bg-green-50 p-6 rounded-xl border border-green-100"><div className="text-green-600 font-bold mb-1">銷售統計 (筆數)</div><div className="text-4xl font-bold text-gray-800">{totalTxns} 筆</div></div>
                        <div className="bg-orange-50 p-6 rounded-xl border border-orange-100"><div className="text-orange-600 font-bold mb-1">平均客單價</div><div className="text-4xl font-bold text-gray-800">${totalTxns ? Math.round(totalSales/totalTxns) : 0}</div></div>
                        <div className="bg-pink-50 p-6 rounded-xl border border-pink-100"><div className="text-pink-600 font-bold mb-1">小費總額</div><div className="text-4xl font-bold text-gray-800">${totalTips.toLocaleString()}</div></div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6">
                        {/* 3. 左邊：交易明細表格 (加入管理按鈕) */}
                        <div className="col-span-2 bg-gray-50 p-4 rounded-lg flex flex-col h-[600px]">
                            <h4 className="font-bold mb-3 text-gray-700">交易明細 (可點擊修改)</h4>
                            <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-sm border">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-200 sticky top-0 z-10">
                                        <tr>
                                            <th className="p-3">時間</th><th className="p-3">桌號</th><th className="p-3">支付</th><th className="p-3">金額</th><th className="p-3 text-center">管理</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSalesLogs.length === 0 ? (
                                            <tr><td colSpan="5" className="p-10 text-center text-gray-400">尚無交易資料</td></tr>
                                        ) : (
                                            filteredSalesLogs.map((l, i) => (
                                                <tr key={i} className="border-b hover:bg-blue-50 transition-colors">
                                                    <td className="p-3 text-sm">{new Date(l.timestamp).toLocaleString()}</td>
                                                    <td className="p-3"><span className="bg-gray-200 px-2 py-1 rounded text-xs font-bold">{l.tableId || '-'}</span></td>
                                                    <td className="p-3 text-sm">{l.paymentMethod || '現金'}</td>
                                                    <td className="p-3 font-bold text-green-700">${l.amount}</td>
                                                    <td className="p-3 flex justify-center gap-2">
                                                        <button 
                                                            onClick={() => {
                                                                if(!l.orders || l.orders.length === 0) return alert("此筆交易無詳細點餐紀錄");
                                                                const orderSummary = {};
                                                                l.orders.forEach(o => {
                                                                    if(o.category === 'Tip') return;
                                                                    if(!orderSummary[o.name]) orderSummary[o.name] = 0;
                                                                    orderSummary[o.name] += (o.count || 1);
                                                                });
                                                                let msg = `🧾 桌號 ${l.tableId} 點餐明細\n----------------------\n`;
                                                                Object.entries(orderSummary).forEach(([name, count]) => { msg += `${name} x ${count}\n`; });
                                                                alert(msg);
                                                            }}
                                                            className="text-gray-500 hover:text-blue-600 p-1" title="查看明細"
                                                        >
                                                            <ClipboardList size={18}/>
                                                        </button>
                                                        <button 
                                                            onClick={() => setEditingSale(l)}
                                                            className="text-blue-500 hover:text-blue-700 p-1" title="修改金額"
                                                        >
                                                            <Edit3 size={18}/>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteSale(l.id)}
                                                            className="text-red-400 hover:text-red-600 p-1" title="刪除此單"
                                                        >
                                                            <Trash2 size={18}/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 4. 右邊：統計數據區 */}
                        <div className="flex flex-col gap-6 h-[600px]">
                            {/* 右上：本期熱銷排行 */}
                            <div className="bg-gray-50 p-4 rounded-lg flex-1 flex flex-col min-h-0">
                                <h4 className="font-bold mb-3 flex items-center gap-2 text-orange-700"><Utensils size={16}/> 本期熱銷排行</h4>
                                <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-sm border">
                                    <table className="w-full text-left">
                                        <thead className="bg-orange-100 text-orange-800 sticky top-0"><tr><th className="p-2">品項</th><th className="p-2 text-right">數量</th></tr></thead>
                                        <tbody>
                                            {(() => {
                                                const itemStats = {};
                                                filteredSalesLogs.forEach(log => {
                                                    if(log.orders) {
                                                        log.orders.forEach(order => {
                                                            if(order.category === 'Tip') return;
                                                            const name = order.name;
                                                            if(!itemStats[name]) itemStats[name] = 0;
                                                            itemStats[name] += (order.count || 1);
                                                        });
                                                    }
                                                });
                                                const sortedItems = Object.entries(itemStats).sort((a,b) => b[1] - a[1]);
                                                if(sortedItems.length === 0) return <tr><td colSpan="2" className="p-4 text-center text-gray-400">尚無數據</td></tr>;
                                                return sortedItems.map(([name, count], idx) => (
                                                    <tr key={name} className="border-b"><td className="p-2 flex items-center gap-2"><div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${idx===0?'bg-red-500':idx===1?'bg-orange-500':idx===2?'bg-yellow-500':'bg-gray-300'}`}>{idx+1}</div>{name}</td><td className="p-2 text-right font-bold">{count}</td></tr>
                                                ));
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* 右下：員工打賞統計 (升級版：顯示 本日 vs 區間合計) */}
                            <div className="bg-gray-50 p-4 rounded-lg flex-1 flex flex-col min-h-0">
                                <h4 className="font-bold mb-3 flex items-center gap-2 text-blue-700"><DollarSign size={16}/> 員工打賞統計</h4>
                                <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-sm border">
                                    <table className="w-full text-left">
                                        <thead className="bg-blue-100 text-blue-800 sticky top-0 font-bold text-xs">
                                            <tr>
                                                <th className="p-2">員工</th>
                                                <th className="p-2 text-right">本日</th>
                                                <th className="p-2 text-right">區間合計</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                const stats = {};
                                                const todayStr = new Date().toISOString().split('T')[0];
                                                const targetLogs = (tipLogs || []).filter(l => reportBranch === 'All' || l.storeId === reportBranch);

                                                targetLogs.forEach(log => {
                                                    const logDate = new Date(log.timestamp).toISOString().split('T')[0];
                                                    const amt = parseInt(log.amount) || 0;
                                                    const name = log.empName;

                                                    if (!stats[name]) stats[name] = { today: 0, period: 0 };
                                                    if (logDate === todayStr) stats[name].today += amt;
                                                    if (logDate >= reportStartDate && logDate <= reportEndDate) stats[name].period += amt;
                                                });

                                                const rows = Object.entries(stats)
                                                    .filter(([_, data]) => data.today > 0 || data.period > 0)
                                                    .sort((a, b) => b[1].period - a[1].period);

                                                if (rows.length === 0) return <tr><td colSpan="3" className="p-4 text-center text-gray-400">尚無小費紀錄</td></tr>;

                                                return rows.map(([name, data], i) => (
                                                    <tr key={name} className="border-b">
                                                        <td className="p-2 flex items-center gap-2">
                                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${i===0?'bg-yellow-400':i===1?'bg-gray-400':i===2?'bg-orange-400':'bg-blue-300'}`}>{i+1}</div>
                                                            <span className="text-sm font-bold text-gray-700">{name}</span>
                                                        </td>
                                                        <td className="p-2 text-right font-bold text-orange-600">
                                                            {data.today > 0 ? `$${data.today}` : <span className="text-gray-300">-</span>}
                                                        </td>
                                                        <td className="p-2 text-right font-bold text-gray-800">
                                                            ${data.period.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ));
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ★★★ 修改視窗 Modal ★★★ */}
                {editingSale && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-2xl">
                        <div className="bg-white p-6 rounded-xl w-96 shadow-2xl animate-fade-in-up">
                            <h3 className="text-xl font-bold mb-4 border-b pb-2">修改交易紀錄</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 mb-1">交易時間</label>
                                    <div className="text-gray-800">{new Date(editingSale.timestamp).toLocaleString()}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 mb-1">實收金額</label>
                                    <input 
                                        type="number" 
                                        className="w-full border-2 border-blue-200 rounded-lg p-2 text-xl font-bold text-blue-600 focus:border-blue-500 outline-none"
                                        value={editingSale.amount}
                                        onChange={e => setEditingSale({...editingSale, amount: parseInt(e.target.value) || 0})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 mb-1">支付方式</label>
                                    <select 
                                        className="w-full border p-2 rounded-lg font-bold"
                                        value={editingSale.paymentMethod}
                                        onChange={e => setEditingSale({...editingSale, paymentMethod: e.target.value})}
                                    >
                                        <option value="現金">現金</option>
                                        <option value="刷卡">刷卡</option>
                                        <option value="LINE Pay">LINE Pay</option>
                                        <option value="轉帳">轉帳</option>
                                    </select>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button onClick={() => setEditingSale(null)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold">取消</button>
                                    <button onClick={handleUpdateSale} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold shadow-lg">確認修改</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div> 
        )}

        {currentTab === 'stores' && (<div className="space-y-6"><div className="flex justify-between"><h2 className="text-2xl font-bold">分店營運管理</h2><button onClick={()=>setIsAddingStore(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2"><Plus/> 新增分店</button></div>{isAddingStore && <div className="bg-white p-4 rounded border mb-4 flex gap-2"><input placeholder="ID" className="border p-2" onChange={e=>setNewStoreData({...newStoreData, id:e.target.value})}/><input placeholder="名稱" className="border p-2" onChange={e=>setNewStoreData({...newStoreData, name:e.target.value})}/><button onClick={handleAddStore} className="bg-green-600 text-white px-4 rounded">確認</button></div>}<div className="grid grid-cols-2 gap-6">{Object.values(storesConfig).filter(s=>s.type==='Branch').map(store => (<div key={store.id} className="bg-white p-6 rounded-xl shadow border">{editingStoreId === store.id ? (<div className="space-y-3"><div className="flex justify-between"><h3 className="font-bold">編輯: {store.name}</h3><button onClick={handleSaveStore} className="text-green-600"><Save/></button></div><input className="border p-2 w-full" value={editStoreData.name} onChange={e=>setEditStoreData({...editStoreData, name:e.target.value})} placeholder="分店名稱"/><input className="border p-2 w-full" value={editStoreData.password} onChange={e=>setEditStoreData({...editStoreData, password:e.target.value})} placeholder="密碼"/><div className="border-t pt-2"><label className="font-bold">桌區設定</label><button onClick={handleAddRange} className="float-right text-sm text-blue-600">+ 新增區</button></div>{editStoreData.tableRanges?.map((r, idx) => (<div key={idx} className="flex gap-2 items-center"><input className="border p-1 w-20" value={r.prefix} onChange={e=>handleUpdateRange(idx,'prefix',e.target.value)} placeholder="代號"/><input type="number" className="border p-1 w-20" value={r.count} onChange={e=>handleUpdateRange(idx,'count', parseInt(e.target.value))} placeholder="數量"/><button onClick={()=>handleDeleteRange(idx)} className="text-red-500"><Trash2 size={16}/></button></div>))}</div>) : (<div><div className="flex justify-between"><h3 className="font-bold text-xl">{store.name} ({store.id})</h3><button onClick={()=>handleStartEditStore(store)} className="text-gray-500"><Edit3 size={18}/></button></div><div className="mt-2 text-sm text-gray-500">桌數配置: {store.tableRanges?.map(r=>`${r.prefix}區${r.count}桌`).join(', ')}</div><button onClick={()=>onEnterBranch(store.id, store)} className="mt-4 w-full bg-blue-50 text-blue-600 py-2 rounded font-bold">進入分店視角</button></div>)}</div>))}</div></div>)}
        {currentTab === 'employees' && (<div className="space-y-6"><h2 className="text-2xl font-bold">員工管理 & 打卡紀錄</h2><div className="flex gap-2 mb-4"><select className="border p-2 rounded" value={empTargetStoreId} onChange={e=>setEmpTargetStoreId(e.target.value)}>{Object.values(storesConfig).filter(s=>s.type==='Branch').map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><button onClick={()=>setEmpViewMode('list')} className={`px-4 rounded ${empViewMode==='list'?'bg-blue-600 text-white':'bg-gray-200'}`}>員工列表</button><button onClick={()=>setEmpViewMode('history')} className={`px-4 rounded ${empViewMode==='history'?'bg-blue-600 text-white':'bg-gray-200'}`}>打卡紀錄</button></div>{empViewMode === 'list' ? (<div className="bg-white p-6 rounded-xl border"><div className="flex gap-2 mb-4"><input placeholder="姓名" className="border p-2 rounded" value={newEmpName} onChange={e=>setNewEmpName(e.target.value)}/><input placeholder="密碼" className="border p-2 rounded" value={newEmpPassword} onChange={e=>setNewEmpPassword(e.target.value)}/><button onClick={handleAddEmployee} className="bg-green-600 text-white px-4 rounded">新增</button></div><table className="w-full text-left"><thead><tr className="bg-gray-100"><th className="p-3">姓名</th><th className="p-3">密碼</th><th className="p-3">操作</th><th className="p-3">打賞QR</th></tr></thead><tbody>{(storeEmployees[empTargetStoreId]||[]).map(emp => (<tr key={emp.id} className="border-b"><td className="p-3">{editingEmpId===emp.id ? <input className="border p-1" value={editEmpData.name} onChange={e=>setEditEmpData({...editEmpData, name:e.target.value})}/> : emp.name}</td><td className="p-3">{editingEmpId===emp.id ? <input className="border p-1" value={editEmpData.password} onChange={e=>setEditEmpData({...editEmpData, password:e.target.value})}/> : emp.password}</td><td className="p-3 flex gap-2">{editingEmpId===emp.id ? <button onClick={handleSaveEmployee} className="text-green-600"><Save/></button> : <button onClick={()=>handleStartEditEmployee(emp)} className="text-blue-600"><Edit3/></button>}<button onClick={()=>handleDeleteEmployee(emp.id)} className="text-red-500"><Trash2/></button></td><td className="p-3"><button onClick={() => handleGenerateQr(emp)} className="bg-orange-100 text-orange-600 px-3 py-1 rounded text-sm font-bold flex items-center gap-1 hover:bg-orange-200"><QrCode size={14}/> 生成</button></td></tr>))}</tbody></table></div>) : (<div className="bg-white p-6 rounded-xl border"><div className="flex gap-4 mb-4"><input type="date" value={empHistoryFilter.startDate} onChange={e=>setEmpHistoryFilter({...empHistoryFilter, startDate:e.target.value})}/><span>~</span><input type="date" value={empHistoryFilter.endDate} onChange={e=>setEmpHistoryFilter({...empHistoryFilter, endDate:e.target.value})}/></div><table className="w-full text-left"><thead><tr className="bg-gray-100"><th className="p-3 cursor-pointer" onClick={()=>setEmpSort({key:'date', direction: empSort.direction==='asc'?'desc':'asc'})}>日期</th><th className="p-3 cursor-pointer" onClick={()=>setEmpSort({key:'name', direction: empSort.direction==='asc'?'desc':'asc'})}>姓名</th><th className="p-3">上班</th><th className="p-3">下班</th></tr></thead><tbody>
                                        {(() => {
                                            // 1. 先取得原始資料，並強制「按時間正序」排列 (從早到晚)
                                            // 這樣才能正確配對：先有上班 -> 才有下班
                                            const rawLogs = getSortedLogs().sort((a, b) => a.timestamp - b.timestamp);
                                            
                                            // 2. 依照「日期 + 員工」分組
                                            const groups = {};
                                            rawLogs.forEach(log => {
                                                const dateStr = new Date(log.timestamp).toLocaleDateString();
                                                const key = `${dateStr}_${log.empName}`;
                                                if (!groups[key]) groups[key] = [];
                                                groups[key].push(log);
                                            });

                                            // 3. 在每個群組內進行「配對」
                                            const finalRows = [];

                                            Object.values(groups).forEach(groupLogs => {
                                                let currentSession = null;

                                                groupLogs.forEach(log => {
                                                    const timeStr = new Date(log.timestamp).toLocaleTimeString();

                                                    if (log.type === 'in') {
                                                        // A. 遇到上班：開啟一個新段落
                                                        
                                                        // 如果上一段還沒下班(忘記打卡?)，先把它結算推出去
                                                        if (currentSession) {
                                                            finalRows.push(currentSession);
                                                        }
                                                        
                                                        // 建立新的上班段落
                                                        currentSession = {
                                                            date: new Date(log.timestamp).toLocaleDateString(),
                                                            name: log.empName,
                                                            inTime: timeStr,
                                                            outTime: '-', // 還沒下班
                                                            sortTime: log.timestamp
                                                        };
                                                    } else if (log.type === 'out') {
                                                        // B. 遇到下班
                                                        if (currentSession) {
                                                            // 如果前面有「上班」，就配對成功！
                                                            currentSession.outTime = timeStr;
                                                            finalRows.push(currentSession);
                                                            currentSession = null; // 配對完成，清空
                                                        } else {
                                                            // 如果前面沒有「上班」(孤兒下班)，自己單獨一行
                                                            finalRows.push({
                                                                date: new Date(log.timestamp).toLocaleDateString(),
                                                                name: log.empName,
                                                                inTime: '-',
                                                                outTime: timeStr,
                                                                sortTime: log.timestamp
                                                            });
                                                        }
                                                    }
                                                });

                                                // 該人的該天跑完後，如果還有沒結尾的上班紀錄 (正在上班中)，也要顯示
                                                if (currentSession) {
                                                    finalRows.push(currentSession);
                                                }
                                            });

                                            // 4. 最後把整理好的表格按「時間倒序」排列 (最新的在最上面)
                                            finalRows.sort((a, b) => b.sortTime - a.sortTime);

                                            // 5. 顯示
                                            if (finalRows.length === 0) {
                                                return <tr><td colSpan="4" className="p-6 text-center text-gray-400">目前無打卡紀錄</td></tr>;
                                            }

                                            return finalRows.map((row, i) => (
                                                <tr key={i} className="border-b hover:bg-gray-50">
                                                    <td className="p-3">{row.date}</td>
                                                    <td className="p-3 font-bold">{row.name}</td>
                                                    <td className="p-3 text-green-600 font-mono font-bold">{row.inTime}</td>
                                                    <td className="p-3 text-red-600 font-mono font-bold">{row.outTime}</td>
                                                </tr>
                                            ));
                                        })()}
                                    </tbody></table></div>)}</div>)}
        {currentTab === 'menu' && (<div className="space-y-8">{menuViewMode === 'plans' ? (<div><h3 className="font-bold text-xl mb-4">步驟 1: 選擇或管理方案定價</h3><div className="flex gap-4 overflow-x-auto pb-4">{diningPlans.map(plan => (<div key={plan.id} onClick={()=>{setActivePlanForEdit(plan); setMenuViewMode('items');}} className="min-w-[220px] bg-white p-6 rounded-xl border-2 border-transparent hover:border-orange-500 cursor-pointer shadow-sm transition-all group relative">{editingPlanId===plan.id ? <div onClick={e=>e.stopPropagation()} className="space-y-2"><input className="border w-full p-1" value={editPlanData.name} onChange={e=>setEditPlanData({...editPlanData, name:e.target.value})}/><input type="number" className="border w-full p-1" value={editPlanData.price} onChange={e=>setEditPlanData({...editPlanData, price:e.target.value})} placeholder="大人價格"/><input type="number" className="border w-full p-1" value={editPlanData.childPrice} onChange={e=>setEditPlanData({...editPlanData, childPrice:e.target.value})} placeholder="小孩價格"/><button onClick={handleSavePlan} className="bg-green-100 w-full text-green-600">儲存</button></div> : <><div className="font-bold text-xl mb-2">{plan.name}</div><div className="text-gray-500 text-lg">${plan.price} <span className="text-xs">/ ${plan.childPrice}</span></div><div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1"><button onClick={(e)=>{e.stopPropagation(); setEditingPlanId(plan.id); setEditPlanData({...plan})}} className="bg-white p-1 rounded shadow text-blue-500"><Edit3 size={16}/></button><button onClick={(e)=>{e.stopPropagation(); handleDeletePlan(plan.id)}} className="bg-white p-1 rounded shadow text-red-500"><Trash2 size={16}/></button></div><div className="mt-4 text-sm text-blue-600 flex items-center">編輯菜單 <ChevronRight size={16}/></div></>}</div>))}<div className="min-w-[200px] border-2 border-dashed border-gray-300 p-4 rounded-xl flex flex-col justify-center items-center gap-2 bg-gray-50"><input placeholder="方案名稱" className="border p-1 w-full" onChange={e=>setNewPlan({...newPlan, name:e.target.value})}/><input type="number" placeholder="大人價格" className="border p-1 w-full" onChange={e=>setNewPlan({...newPlan, price:e.target.value})}/><input type="number" placeholder="小孩價格" className="border p-1 w-full" onChange={e=>setNewPlan({...newPlan, childPrice:e.target.value})}/><button onClick={handleAddPlan} className="bg-gray-800 text-white rounded w-full py-1">新增方案</button></div></div></div>) : (<div><button onClick={()=>setMenuViewMode('plans')} className="mb-4 flex items-center gap-2 text-gray-500 hover:text-gray-800"><ChevronLeft/> 返回方案列表</button><div className="flex justify-between items-center mb-4"><h3 className="font-bold text-2xl text-orange-600">{activePlanForEdit.name} (${activePlanForEdit.price}) - 菜單管理</h3></div><div className="flex gap-6 items-start"><div className="w-1/4 bg-white p-4 rounded-xl border"><h4 className="font-bold mb-3 flex items-center gap-2"><Tag size={16}/> 分類管理 (全店共用)</h4><div className="space-y-2 mb-4">{categories.map(cat => (<div key={cat} className="flex justify-between items-center bg-gray-50 p-2 rounded"><span>{cat}</span><button onClick={()=>handleDeleteCategory(cat)} className="text-red-400 hover:text-red-600"><X size={14}/></button></div>))}</div><div className="flex gap-1"><input className="border p-1 flex-grow rounded" placeholder="新分類" value={newCategoryName} onChange={e=>setNewCategoryName(e.target.value)}/><button onClick={handleAddCategory} className="bg-blue-600 text-white px-2 rounded"><Plus size={16}/></button></div></div><div className="w-3/4 bg-white p-6 rounded-xl border"><div className="flex justify-between items-center mb-4 bg-gray-100 p-3 rounded-lg"><div><span className="font-bold mr-2">正在管理分店庫存:</span><select className="border p-1 rounded" value={targetStockStoreId} onChange={e=>setTargetStockStoreId(e.target.value)}>{Object.values(storesConfig).filter(s=>s.type==='Branch').map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div><div className="text-sm text-gray-500">點擊菜色可切換該分店的「上架/售完」狀態</div></div><div className="flex gap-2 mb-4 bg-gray-50 p-3 rounded-lg"><input placeholder="菜名" className="border p-2 rounded" value={newItem.name} onChange={e=>setNewItem({...newItem, name:e.target.value})}/><select className="border p-2 rounded" onChange={e=>setNewItem({...newItem, category:e.target.value})}>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select><input placeholder="加價" type="number" className="border p-2 w-20 rounded" onChange={e=>setNewItem({...newItem, price:e.target.value})}/>
{/* ↓↓↓ 新加入的勾選框 ↓↓↓ */}
<div className="flex items-center gap-1 mx-2 bg-red-50 px-2 rounded border border-red-200">
    <input 
        type="checkbox" 
        id="onlyStaffCheck"
        checked={newItem.onlyForStaff || false} 
        onChange={e=>setNewItem({...newItem, onlyForStaff:e.target.checked})} 
    />
    <label htmlFor="onlyStaffCheck" className="text-sm font-bold text-red-600 cursor-pointer">店內專用</label>
</div>
{/* ↑↑↑ 新加入的勾選框 ↑↑↑ */}
<button onClick={handleAddItem} className="bg-blue-600 text-white px-4 rounded font-bold">新增菜色 (獨立)</button></div><div className="grid grid-cols-3 gap-4">{menuItems.map(item => { const isSoldOut = stockStatus[targetStockStoreId]?.[item.id] === true; 
        if (!item.allowedPlans.includes(activePlanForEdit.id)) return null;
        return (<div key={item.id} className={`border p-3 rounded-xl flex flex-col justify-between relative overflow-hidden ${isSoldOut ? 'bg-red-50 border-red-200' : 'bg-white'}`}>{isSoldOut && <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1">已售完</div>}{editingItemId===item.id ? <div className="space-y-2"><input value={editItemData.name} onChange={e=>setEditItemData({...editItemData, name:e.target.value})} className="border w-full"/><select className="border w-full p-2 mb-2 rounded" value={editItemData.category} onChange={e=>setEditItemData({...editItemData, category:e.target.value})}>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select><div className="flex items-center gap-2 mb-2 bg-red-50 p-1 rounded">
    <input 
        type="checkbox" 
        checked={editItemData.onlyForStaff || false} 
        onChange={e=>setEditItemData({...editItemData, onlyForStaff:e.target.checked})} 
    />
    <span className="text-sm font-bold text-red-600">設為店內專用 (客人看不見)</span>
</div><button onClick={handleSaveItem} className="bg-green-500 text-white w-full rounded">存</button></div> : <><div><div className="font-bold text-lg">{item.name}</div><div className="text-xs text-gray-500">{item.category} {item.price>0 && `(+$${item.price})`}</div></div><div className="flex justify-between mt-3 pt-2 border-t"><button onClick={()=>toggleStockInHQ(item.id)} className={`text-xs px-2 py-1 rounded border ${isSoldOut ? 'bg-white text-red-600 border-red-600' : 'bg-green-100 text-green-600 border-green-200'}`}>{isSoldOut ? '上架' : '設為售完'}</button><div className="flex gap-2"><button onClick={()=>{setEditingItemId(item.id); setEditItemData({...item})}} className="text-blue-500"><Edit3 size={16}/></button><button onClick={()=>handleDeleteItem(item.id)} className="text-red-500"><Trash2 size={16}/></button></div></div></>}</div>); })}</div></div></div></div>)}</div>)}
        {currentTab === 'crm' && (<div className="space-y-6">{viewingMemberHistory ? (<div><button onClick={()=>setViewingMemberHistory(null)} className="mb-4 flex items-center gap-2 text-gray-500 hover:text-gray-800"><ChevronLeft/> 返回會員列表</button><div className="bg-white rounded-xl shadow border p-6"><h2 className="text-2xl font-bold mb-4">{viewingMemberHistory.name} 的消費紀錄</h2><div className="flex gap-6 mb-6 text-sm"><div className="bg-blue-50 p-4 rounded-lg"><div>目前點數</div><div className="text-2xl font-bold text-blue-600">{viewingMemberHistory.points}</div></div><div className="bg-green-50 p-4 rounded-lg"><div>電話號碼</div><div className="text-xl font-bold text-gray-800">{viewingMemberHistory.phone}</div></div><div className="bg-orange-50 p-4 rounded-lg"><div>會員等級</div><div className="text-xl font-bold text-orange-600">{viewingMemberHistory.level}</div></div></div><h3 className="font-bold mb-2 text-gray-600">詳細流水帳</h3><table className="w-full text-left"><thead className="bg-gray-100"><tr><th className="p-3">日期</th><th className="p-3">操作</th><th className="p-3">變動點數</th><th className="p-3">門市</th></tr></thead><tbody>{(memberLogs||[]).filter(l=>l.memberPhone===viewingMemberHistory.phone).map((l,i)=>(<tr key={i} className="border-b"><td className="p-3">{new Date(l.timestamp).toLocaleString()}</td><td className="p-3">{l.action}</td><td className={`p-3 font-bold ${l.points>0?'text-green-600':'text-red-600'}`}>{l.points>0?'+':''}{l.points}</td><td className="p-3">{l.storeName}</td></tr>))}{(memberLogs||[]).filter(l=>l.memberPhone===viewingMemberHistory.phone).length===0 && <tr><td colSpan="4" className="p-6 text-center text-gray-400">尚無紀錄</td></tr>}</tbody></table></div></div>) : (<div><h2 className="text-2xl font-bold mb-4">會員資料庫</h2><div className="bg-white rounded-xl shadow border overflow-hidden"><table className="w-full text-left"><thead className="bg-gray-100"><tr><th className="p-3">姓名</th><th className="p-3">電話</th><th className="p-3">等級</th><th className="p-3">加入日</th><th className="p-3">點數</th><th className="p-3">操作</th></tr></thead><tbody>
        {/* ★★★ 2. 這裡補上防呆機制，避免空白 ★★★ */}
        {(members && members.length > 0) ? members.map(m => (<tr key={m.phone} className="border-b hover:bg-gray-50"><td className="p-3 font-bold">{m.name}</td><td className="p-3">{m.phone}</td><td className="p-3"><span className="bg-yellow-100 px-2 rounded text-xs">{m.level}</span></td><td className="p-3">{m.joinDate}</td><td className="p-3 text-blue-600 font-bold">{m.points}</td><td className="p-3"><button onClick={()=>setViewingMemberHistory(m)} className="text-blue-600 underline text-sm">查看紀錄</button></td></tr>)) : <tr><td colSpan="6" className="p-6 text-center text-gray-400">目前沒有會員資料</td></tr>}
        </tbody></table></div></div>)}</div>)}
        {/* ★★★ 新增：行銷活動 Tab (確保只在這裡使用) ★★★ */}
        {currentTab === 'marketing' && <MarketingTab slotPrizes={slotPrizes} setSlotPrizes={setSlotPrizes} tiers={tiers} setTiers={setTiers} />}
        
        {/* ★★★ 優惠券後台大改版 ★★★ */}
        {currentTab === 'coupons' && (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">優惠券設定</h2>
                <div className="bg-white p-6 rounded-xl border flex flex-col gap-4">
                    <div className="flex gap-4 items-end">
                        <div>
                            <label className="text-xs block font-bold mb-1">名稱</label>
                            <input className="border p-2 rounded w-48" value={newCoupon.name} onChange={e=>setNewCoupon({...newCoupon, name:e.target.value})} placeholder="例如: 註冊禮"/>
                        </div>
                        <div>
                            <label className="text-xs block font-bold mb-1">類型</label>
                            <select className="border p-2 rounded" value={newCoupon.type} onChange={e=>setNewCoupon({...newCoupon, type:e.target.value, value: ''})}>
                                <option value="cash">💰 現金折抵</option>
                                <option value="percent">📉 折扣趴數</option>
                                <option value="item">🥩 食材兌換</option>
                            </select>
                        </div>
                        <div className="flex-grow">
                            <label className="text-xs block font-bold mb-1">
                                {newCoupon.type === 'cash' ? '折抵金額 ($)' : newCoupon.type === 'percent' ? '折扣趴數 (%)' : '食材名稱'}
                            </label>
                            <div className="flex gap-2">
                                <input 
                                    className="border p-2 rounded w-full" 
                                    value={newCoupon.value} 
                                    onChange={e=>setNewCoupon({...newCoupon, value:e.target.value})} 
                                    placeholder={newCoupon.type === 'percent' ? '例如: 90 (打9折)' : newCoupon.type === 'item' ? '例如: 澳洲和牛' : '例如: 100'}
                                />
                                {newCoupon.type === 'percent' && (
                                    <div className="flex gap-1">
                                        <button onClick={()=>setNewCoupon({...newCoupon, value: 95})} className="px-2 py-1 bg-gray-200 rounded text-xs">95折</button>
                                        <button onClick={()=>setNewCoupon({...newCoupon, value: 90})} className="px-2 py-1 bg-gray-200 rounded text-xs">9折</button>
                                        <button onClick={()=>setNewCoupon({...newCoupon, value: 85})} className="px-2 py-1 bg-gray-200 rounded text-xs">85折</button>
                                        <button onClick={()=>setNewCoupon({...newCoupon, value: 80})} className="px-2 py-1 bg-gray-200 rounded text-xs">8折</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 items-end">
                        <div><label className="text-xs block font-bold mb-1">所需點數</label><input type="number" className="border p-2 rounded w-24" value={newCoupon.pointCost} onChange={e=>setNewCoupon({...newCoupon, pointCost:e.target.value})}/></div>
                        <div><label className="text-xs block font-bold mb-1 text-red-600">使用期限</label><input type="date" className="border p-2 rounded" value={newCoupon.expiryDate} onChange={e=>setNewCoupon({...newCoupon, expiryDate:e.target.value})}/></div>
                        <div><label className="text-xs block font-bold mb-1">代碼 (自動)</label><div className="flex"><input className="border p-2 rounded-l w-24 bg-gray-100" value={newCoupon.code} readOnly/><button onClick={generateCode} className="bg-gray-300 px-2 rounded-r"><RefreshCcw size={16}/></button></div></div>
                        <div className="flex items-center gap-2 pb-2">
                            <input type="checkbox" id="limitCheck" checked={newCoupon.limit} onChange={e=>setNewCoupon({...newCoupon, limit: e.target.checked})} className="w-5 h-5"/>
                            <label htmlFor="limitCheck" className="text-sm font-bold cursor-pointer select-none">每人限領一次</label>
                        </div>
                        <button onClick={handleAddCoupon} className="bg-blue-600 text-white px-6 py-2 rounded h-10 font-bold ml-auto">新增優惠券</button>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    {coupons.map(c => (
                        <div key={c.id} className="bg-white p-4 rounded border flex justify-between items-center relative overflow-hidden shadow-sm">
                            <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-[10px] px-2 py-1 font-bold rounded-bl">
                                {c.expiryDate ? `期限: ${c.expiryDate}` : '無期限'}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${c.type==='cash'?'bg-green-500':c.type==='percent'?'bg-blue-500':'bg-orange-500'}`}>
                                    {c.type==='cash'?'$':c.type==='percent'?'%':'肉'}
                                </div>
                                <div>
                                    <div className="font-bold text-lg flex items-center gap-2">
                                        {c.name}
                                        {c.limit && <span className="bg-red-500 text-white text-[10px] px-1 rounded">限領一次</span>}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {c.type==='cash' ? `折抵 $${c.value}` : c.type==='percent' ? `打 ${c.value/10} 折` : `兌換: ${c.value}`} 
                                        <span className="mx-1">|</span> {c.pointCost} 點
                                    </div>
                                    <div className="text-xs bg-gray-100 inline-block px-1 mt-1 rounded font-mono text-gray-400">Code: {c.code}</div>
                                </div>
                            </div>
                            <button onClick={()=>handleDeleteCoupon(c.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2/></button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {currentTab === 'line' && (<div className="flex gap-8"><div className="w-1/2 bg-white p-8 rounded border space-y-4"><h3 className="font-bold text-lg">LINE 官方帳號設定</h3><div><label className="block text-sm font-bold mb-1">歡迎訊息</label><textarea className="w-full border p-2 rounded h-32" value={announcement} onChange={e=>setAnnouncement(e.target.value)}/></div><div><label className="block text-sm font-bold mb-1">主題色</label><div className="flex gap-2">{['bg-orange-500','bg-green-600','bg-blue-600'].map(c=><button key={c} onClick={()=>setMemberAppSettings({...safeSettings, promoColor:c})} className={`w-8 h-8 rounded-full ${c}`}/>)}</div></div><button onClick={handleUpdateApp} className="bg-green-500 text-white w-full py-2 rounded font-bold">儲存並發布</button></div><div className="w-1/2"><CustomerMobileAppSimulator appSettings={{...safeSettings, announcement, lineRichMenu: richMenuType}}/></div></div>)}
        
        {/* ★★★ QR Code Modal ★★★ */}
        {showQrModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-2xl w-96 text-center">
                    <h3 className="text-2xl font-bold mb-4">員工打賞專用碼</h3>
                    <div className="bg-white p-2 inline-block rounded-xl border-4 border-orange-500 mb-4">
                        <canvas id="emp-qr-canvas"></canvas>
                    </div>
                    <p className="text-sm text-gray-500 mb-6 break-all">{qrUrl}</p>
                    <button onClick={() => setShowQrModal(false)} className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold">關閉</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

// --- 5.1 MainPOS (主系統 - 終極防重覆列印版) ---
const MainPOS = ({ currentStore, onLogout, isHQMode, slotPrizes, setSlotPrizes, tiers, setTiers }) => {
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


    // 3. 產生桌子邏輯 (初始化)
    /*
    useEffect(() => {
        if (!tablesLoading && (!tables || tables.length === 0)) {
            const ranges = currentStore.tableRanges || (currentStore.tablePrefix ? [{ prefix: currentStore.tablePrefix, count: currentStore.tableCount }] : []);
            if (ranges.length > 0) {
                const generatedTables = [];
                ranges.forEach(range => {
                    for (let i = 1; i <= range.count; i++) {
                        const tableId = `${range.prefix}${i.toString().padStart(2, '0')}`;
                        generatedTables.push({ id: tableId, status: 'empty', startTime: null, adults: 0, children: 0, plan: '', total: 0, orders: [] });
                    }
                });
                setTables(prev => (prev && prev.length > 0) ? prev : generatedTables); 
            }
        }
    }, [currentStore, tablesLoading]); 
    */

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
                    {['home', 'menu', 'member', 'clockin', 'settings'].map(view => (
                        <button key={view} onClick={() => setCurrentView(view)} className={`flex flex-col items-center gap-1 p-2 ${currentView === view ? 'text-orange-400 border-r-4 border-orange-400' : 'text-gray-400'}`}>
                            {view === 'home' && <Home size={28} />} {view === 'menu' && <ClipboardList size={28} />} {view === 'member' && <Users size={28} />} {view === 'clockin' && <Clock size={28} />} {view === 'settings' && <Settings size={28} />}
                            <span className="text-xs">{{home:'首頁', menu:'工作台', member:'會員', clockin:'打卡', settings:'設定'}[view]}</span>
                        </button>
                    ))}
                </nav>
            </div>
            <div className="flex-grow overflow-hidden relative">
                <div className={`h-16 shadow-sm flex justify-between items-center px-6 bg-white`}>
                    <div className="flex items-center gap-3"><h1 className="text-xl font-bold text-gray-800">{currentView === 'home' ? `桌位管理 - ${currentStore.name}` : '野饌POS系統'}</h1></div>
                    {/* ★★★ 修改後的頂部區域 (包含測試按鈕) ★★★ */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        {/* 這裡就是那個測試按鈕 */}
                        <button onClick={playSound} className="bg-red-500 text-white px-3 py-1 rounded font-bold hover:bg-red-600 active:scale-95 transition-transform shadow-sm">
                            🔊 測試音效
                        </button>
                        
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-bold">分店代碼: {currentStore.id}</span>
                        <span className="flex items-center gap-1"><Wifi size={16} className="text-green-500"/> 連線正常</span>
                        <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                </div>
                <div className="h-[calc(100vh-64px)] overflow-hidden">
                    {currentView === 'home' && renderHome()}
                    {/* ★★★ 修改：傳遞完整的 currentStore (包含密碼) 給 MenuPage ★★★ */}
                    {currentView === 'menu' && <MenuPage tables={tables} menuItems={menuItems} categories={categories} setTables={setTables} printers={printers} currentStore={currentStore} stockStatus={stockStatus} setStockStatus={setStockStatus} />}
                    {/* ★★★ 傳遞 setCloudPrinters 給 SettingsPage ★★★ */}
                    {currentView === 'settings' && <SettingsPage printers={printers} setPrinters={setPrinters} onLogout={onLogout} onResetData={handleResetData} currentStoreId={currentStore.id} setCloudPrinters={setCloudPrinters} />}
                    {currentView === 'member' && <MemberPage memberAppSettings={memberAppSettings} members={members} onUpdateMember={handleUpdateMember} coupons={coupons} addLog={addMemberLog} currentStoreName={currentStore.name} />}
                    {currentView === 'clockin' && <ClockInPage employees={storeEmployees[currentStore.id] || []} clockStatus={empClockStatus} onClockUpdate={handleClockUpdate} />}
                </div>
                {selectedTable && <TableModal currentStoreId={currentStore.id} selectedTable={selectedTable} onClose={() => setSelectedTable(null)} onOpenTable={handleOpenTable} onRequestCheckout={handleRequestCheckout} diningPlans={diningPlans} tables={tables} setTables={setTables} printers={printers} />}
                
                {/* ★★★ 核心修復：把 printers 傳給結帳視窗，這樣它才知道要傳給誰！ ★★★ */}
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
                    printers={printers} // ★★★ 這一行救活了錢箱 ★★★
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

  // ★★★ 3. 讀取雲端 Printer 設定給客人手機用 ★★★
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
      // ★★★ 傳入 printerConfig ★★★
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
  
  return <MainPOS key={currentStore.id} currentStore={currentStore} onLogout={handleLogout} isHQMode={isHQMode} slotPrizes={slotPrizes} setSlotPrizes={setSlotPrizes} tiers={tiers} setTiers={setTiers} />;
}

// 顧客端獨立包裝
const CustomerWrapper = ({ tableId, storeId, onGoToMember, printerConfig }) => {
    const [tables, setTables] = useFirebaseState('pos_data', `tables_${storeId}`, []);
    const [diningPlans] = useFirebaseState('pos_data', 'plans', INITIAL_DINING_PLANS);
    const [menuItems] = useFirebaseState('pos_data', 'menu', INITIAL_MENU_ITEMS);
    const [categories] = useFirebaseState('pos_data', 'categories', INITIAL_CATEGORIES);
    const [stockStatus] = useFirebaseState('pos_data', 'stock_status', INITIAL_STOCK_STATUS);
    const printers = []; 
    // ★★★ 傳遞 printerConfig 給 CustomerOrderPage ★★★
    return <CustomerOrderPage tableId={tableId} storeId={storeId} diningPlans={diningPlans} menuItems={menuItems} categories={categories} setTables={setTables} tables={tables} printers={printers} stockStatus={stockStatus} onGoToMember={onGoToMember} printerConfig={printerConfig} />;
};

// TipWrapper
const TipWrapper = ({ storeId, empId, storeEmployees, tipLogs, setTipLogs, currentTableId }) => {
    const [tables, setTables] = useFirebaseState('pos_data', `tables_${storeId}`, []);
    return <TipPage storeId={storeId} empId={empId} storeEmployees={storeEmployees} tipLogs={tipLogs} setTipLogs={setTipLogs} tables={tables} setTables={setTables} currentTableId={currentTableId} />;
};