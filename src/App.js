import React, { useState, useEffect, useMemo } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  Wallet,
  User,
  Plus,
  Trash2,
  LogOut,
  Utensils,
  Plane,
  Home,
  ShoppingBag,
  Bus,
  Sparkles,
  Baby,
  Users,
  Calculator,
  CheckCircle2,
  Circle,
  ArrowRightCircle,
  Receipt,
  Package,
  CheckSquare,
  CheckCircle,
  Undo2,
  ChevronDown,
  ChevronUp,
  SplitSquareVertical,
  ArrowDown,
  Edit3,
  Check,
  PieChart,
  Tag,
  Pencil,
  CalendarClock,
} from "lucide-react";

// ==========================================
// ☁️ Firebase 雲端資料庫設定區
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyBBmyWNbb9qgyT8ylNMTmUctgsBFpNn_Dg",
  authDomain: "pusan-d58e1.firebaseapp.com",
  projectId: "pusan-d58e1",
  storageBucket: "pusan-d58e1.firebasestorage.app",
  messagingSenderId: "76540176833",
  appId: "1:76540176833:web:b6e11a24dd17cf2c096740",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const PROJECT_ID = "busan-trip-app";

// ==========================================
// 🚀 常數設定與資料區
// ==========================================
const USERS = [
  { name: "黃子庭", initial: "黃", color: "bg-slate-800", isChild: false },
  { name: "馬國郡", initial: "馬", color: "bg-slate-700", isChild: false },
  { name: "邱靖涵", initial: "邱", color: "bg-stone-600", isChild: false },
  { name: "袁家駿", initial: "袁", color: "bg-zinc-700", isChild: false },
  {
    name: "樂樂",
    fullName: "袁紹軒",
    icon: Baby,
    color: "bg-amber-500",
    isChild: true,
  },
];

const EXCHANGE_RATE_TWD_TO_KRW = 42.5;

const CATEGORIES = [
  { name: "飲食", icon: Utensils },
  { name: "交通", icon: Bus },
  { name: "住宿", icon: Home },
  { name: "購物", icon: ShoppingBag },
  { name: "機票", icon: Plane },
];

const SPLIT_OPTIONS = [
  { id: "大家共同", label: "四人平分", desc: "黃馬邱袁", icon: Users },
  { id: "黃馬共同", label: "黃馬負擔", desc: "子庭+國郡", icon: Users },
  { id: "邱袁共同", label: "邱袁負擔", desc: "含樂樂👶", icon: Baby },
  { id: "個人專屬", label: "單獨個人", desc: "指定某人負擔", icon: User },
];

const getSplitIndividuals = (type, payerName, personalTarget) => {
  if (type === "大家共同") return ["黃子庭", "馬國郡", "邱靖涵", "袁家駿"];
  if (type === "黃馬共同") return ["黃子庭", "馬國郡"];
  if (type === "邱袁共同") return ["邱靖涵", "袁家駿"];
  if (type === "個人專屬") return [personalTarget || payerName];
  return [type];
};

// 格式化日期給 input type="datetime-local" 使用
const formatForInput = (isoString) => {
  if (!isoString) return new Date().toISOString().slice(0, 16);
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 16);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  } catch (e) {
    return new Date().toISOString().slice(0, 16);
  }
};

// ==========================================
// 🚀 主應用程式元件
// ==========================================
export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== "undefined")
      return localStorage.getItem("busan_trip_user") || null;
    return null;
  });

  const [activeTab, setActiveTab] = useState("expenses");
  const [showCalculator, setShowCalculator] = useState(false);
  const [undoNotification, setUndoNotification] = useState(null);

  const [authUser, setAuthUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [packingItems, setPackingItems] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([
    "⚡ 220V 圓頭轉接頭 (Type C/F)",
    "💳 T-money 或 WOWPASS 交通卡",
    "🛂 護照紙本影本 (備用)",
    "🧥 防風保暖外套 (海風大)",
  ]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("驗證失敗:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setAuthUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authUser) return;
    const unsubExpenses = onSnapshot(
      collection(db, "artifacts", PROJECT_ID, "expenses"),
      (snapshot) => {
        const loadedExpenses = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setExpenses(loadedExpenses);
      }
    );
    const unsubPacking = onSnapshot(
      collection(db, "artifacts", PROJECT_ID, "packingItems"),
      (snapshot) => {
        const loadedItems = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        loadedItems.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        setPackingItems(loadedItems);
      }
    );
    return () => {
      unsubExpenses();
      unsubPacking();
    };
  }, [authUser]);

  const handleLogin = (name) => {
    setCurrentUser(name);
    localStorage.setItem("busan_trip_user", name);
  };
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("busan_trip_user");
  };

  const triggerUndo = (msg, rollbackFn) => {
    const id = Date.now();
    setUndoNotification({ id, msg, rollback: rollbackFn });
    setTimeout(
      () => setUndoNotification((curr) => (curr?.id === id ? null : curr)),
      5000
    );
  };

  const executeUndo = () => {
    if (undoNotification && undoNotification.rollback) {
      undoNotification.rollback();
      setUndoNotification(null);
    }
  };

  const addExpense = async (data) => {
    const docId = Date.now().toString();
    await setDoc(doc(db, "artifacts", PROJECT_ID, "expenses", docId), {
      ...data,
      id: docId,
    });
    triggerUndo(`已新增「${data.title}」`, () =>
      deleteDoc(doc(db, "artifacts", PROJECT_ID, "expenses", docId))
    );
  };
  const updateExpense = async (id, newData) => {
    const oldData = expenses.find((e) => e.id === id);
    await setDoc(doc(db, "artifacts", PROJECT_ID, "expenses", id.toString()), {
      ...newData,
      id: id.toString(),
    });
    triggerUndo(`已修改「${newData.title}」`, () =>
      setDoc(
        doc(db, "artifacts", PROJECT_ID, "expenses", id.toString()),
        oldData
      )
    );
  };
  const deleteExpense = async (id) => {
    const oldData = expenses.find((e) => e.id === id);
    await deleteDoc(
      doc(db, "artifacts", PROJECT_ID, "expenses", id.toString())
    );
    triggerUndo(`已刪除「${oldData.title}」`, () =>
      setDoc(
        doc(db, "artifacts", PROJECT_ID, "expenses", id.toString()),
        oldData
      )
    );
  };
  const toggleSettleStatus = async (id) => {
    const oldData = expenses.find((e) => e.id === id);
    const newData = { ...oldData, isSettled: !oldData.isSettled };
    await setDoc(
      doc(db, "artifacts", PROJECT_ID, "expenses", id.toString()),
      newData
    );
    triggerUndo(
      newData.isSettled
        ? `已結清「${newData.title}」`
        : `已取消結清「${newData.title}」`,
      () =>
        setDoc(
          doc(db, "artifacts", PROJECT_ID, "expenses", id.toString()),
          oldData
        )
    );
  };

  const addPackingItem = async (name) => {
    const docId = Date.now().toString();
    await setDoc(doc(db, "artifacts", PROJECT_ID, "packingItems", docId), {
      id: docId,
      name,
      checkedHM: false,
      checkedCY: false,
      createdAt: Date.now(),
    });
  };
  const updatePackingItem = async (id, newData) => {
    await setDoc(
      doc(db, "artifacts", PROJECT_ID, "packingItems", id.toString()),
      { ...newData, id: id.toString() }
    );
  };
  const deletePackingItem = async (id) => {
    await deleteDoc(
      doc(db, "artifacts", PROJECT_ID, "packingItems", id.toString())
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4 font-sans text-stone-800">
        <style>{` ::-webkit-scrollbar { display: none; } html { -ms-overflow-style: none; scrollbar-width: none; } `}</style>
        <div className="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-sm text-center border border-stone-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-stone-100 rounded-full blur-3xl opacity-60"></div>
          <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md relative z-10">
            <Plane className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-black text-stone-900 mb-2 tracking-tight relative z-10">
            Busan Trip.
          </h1>
          <p className="text-stone-400 mb-8 text-sm font-medium relative z-10">
            家族旅行財務與準備嚮導
          </p>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            {USERS.map((user) => {
              const IconComp = user.icon;
              return (
                <button
                  key={user.name}
                  onClick={() => handleLogin(user.name)}
                  className={`py-4 px-2 bg-stone-50 hover:bg-stone-100 border border-stone-200/60 rounded-2xl transition-all flex flex-col items-center gap-3 active:scale-95 group ${
                    user.isChild
                      ? "col-span-2 mx-10 border-amber-200 bg-amber-50"
                      : ""
                  }`}
                >
                  <div
                    className={`${user.color} text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-110 transition-transform`}
                  >
                    {user.initial ? (
                      user.initial
                    ) : (
                      <IconComp className="w-6 h-6" strokeWidth={2} />
                    )}
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-stone-700 text-sm">
                      {user.name}
                    </span>
                    {user.fullName && (
                      <span className="text-[10px] text-stone-400 font-medium mt-0.5">
                        {user.fullName}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 max-w-md mx-auto relative font-sans overflow-x-hidden text-stone-800 antialiased shadow-2xl">
      <style>{` ::-webkit-scrollbar { display: none; } html { -ms-overflow-style: none; scrollbar-width: none; } @keyframes slide-up { from { transform: translateY(10%); opacity: 0; } to { transform: translateY(0); opacity: 1; } } .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1); } `}</style>
      {undoNotification && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[99999] bg-stone-800/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-4 animate-slide-up w-11/12 max-w-sm border border-stone-700">
          <span className="flex-1 text-sm font-medium truncate">
            {undoNotification.msg}
          </span>
          <button
            onClick={executeUndo}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all"
          >
            <Undo2 className="w-4 h-4" /> 復原
          </button>
        </div>
      )}
      <header className="bg-stone-900 text-white pt-12 pb-5 px-6 rounded-b-[2rem] shadow-lg z-10 flex-shrink-0 relative">
        <div className="flex justify-between items-center mb-1 relative z-10">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Busan Trip.</h1>
            <p className="text-stone-400 text-sm mt-1 flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5" /> 歡迎, {currentUser}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 bg-stone-800 rounded-full hover:bg-stone-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <button
        onClick={() => setShowCalculator(true)}
        className="absolute right-4 bottom-24 z-30 w-14 h-14 bg-stone-900 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
      >
        <Calculator className="w-6 h-6" />
      </button>

      <main className="flex-1 overflow-y-auto pb-24 relative bg-stone-50 min-h-[80vh]">
        {activeTab === "expenses" && (
          <ExpenseView
            expenses={expenses}
            currentUser={currentUser}
            onAddExpense={addExpense}
            onUpdateExpense={updateExpense}
            onDeleteExpense={deleteExpense}
            onToggleSettle={toggleSettleStatus}
          />
        )}
        {activeTab === "tools" && (
          <PackingListView
            packingItems={packingItems}
            recommendedItems={recommendedItems}
            setRecommendedItems={setRecommendedItems}
            onAddPackingItem={addPackingItem}
            onUpdatePackingItem={updatePackingItem}
            onDeletePackingItem={deletePackingItem}
          />
        )}
      </main>

      <nav className="fixed bottom-0 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-stone-200 flex justify-around p-2 pb-[calc(env(safe-area-inset-bottom)+1rem)] z-40">
        <button
          onClick={() => setActiveTab("expenses")}
          className={`flex flex-col items-center p-2 w-1/2 rounded-2xl transition-all duration-300 ${
            activeTab === "expenses"
              ? "text-stone-900 bg-stone-100"
              : "text-stone-400 hover:bg-stone-50"
          }`}
        >
          <Wallet
            className="w-6 h-6 mb-1"
            strokeWidth={activeTab === "expenses" ? 2.5 : 1.5}
          />
          <span className="text-[10px] font-bold tracking-wide">記帳結算</span>
        </button>
        <button
          onClick={() => setActiveTab("tools")}
          className={`flex flex-col items-center p-2 w-1/2 rounded-2xl transition-all duration-300 ${
            activeTab === "tools"
              ? "text-stone-900 bg-stone-100"
              : "text-stone-400 hover:bg-stone-50"
          }`}
        >
          <Package
            className="w-6 h-6 mb-1"
            strokeWidth={activeTab === "tools" ? 2.5 : 1.5}
          />
          <span className="text-[10px] font-bold tracking-wide">
            旅行百寶箱
          </span>
        </button>
      </nav>
      {showCalculator && (
        <QuickCalculatorModal onClose={() => setShowCalculator(false)} />
      )}
    </div>
  );
}

// ==========================================
// 🧮 懸浮匯率計算機元件
// ==========================================
function QuickCalculatorModal({ onClose }) {
  const [krw, setKrw] = useState("");
  return (
    <div
      className="fixed inset-0 bg-stone-900/40 z-[9999] flex items-end justify-center sm:items-center p-4 pb-20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-slide-up relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-black text-stone-800 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-stone-500" /> 快速匯率換算
          </h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:bg-stone-100 p-1.5 rounded-full"
          >
            <span className="font-bold text-xs px-1">✕</span>
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <label className="block text-[10px] font-bold text-stone-400 mb-1 uppercase tracking-widest">
              輸入韓元標價 (KRW)
            </label>
            <div className="flex items-center text-3xl font-black text-stone-800">
              <span className="mr-2 text-stone-400">₩</span>
              <input
                type="number"
                value={krw}
                onChange={(e) => setKrw(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent outline-none"
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-center">
            <ArrowDown className="w-5 h-5 text-stone-300" />
          </div>
          <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 text-white">
            <label className="block text-[10px] font-bold text-stone-400 mb-1 uppercase tracking-widest">
              大約台幣 (TWD)
            </label>
            <div className="flex items-center text-4xl font-black">
              <span className="mr-2 text-stone-400">$</span>
              <span>
                {krw
                  ? Math.round(
                      parseFloat(krw) / EXCHANGE_RATE_TWD_TO_KRW
                    ).toLocaleString()
                  : "0"}
              </span>
            </div>
          </div>
          <p className="text-center text-[10px] text-stone-400 font-medium pt-2">
            此換算不留紀錄。參考匯率 1 : {EXCHANGE_RATE_TWD_TO_KRW}
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 💰 記帳結算主系統元件
// ==========================================
function ExpenseView({
  expenses,
  currentUser,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onToggleSettle,
}) {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [showFamilyCostModal, setShowFamilyCostModal] = useState(false);
  const [showSettledHistory, setShowSettledHistory] = useState(false);
  const [expandedFamily, setExpandedFamily] = useState(null);
  const [sortMode, setSortMode] = useState("time"); // 'time' 或 'category'

  const [editingId, setEditingId] = useState(null);
  const [expenseDate, setExpenseDate] = useState(""); // 新增：日期時間狀態
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("飲食");
  const [customCategory, setCustomCategory] = useState("");
  const [amountTWD, setAmountTWD] = useState("");
  const [amountKRW, setAmountKRW] = useState("");
  const [payer, setPayer] = useState(currentUser);
  const [splitType, setSplitType] = useState("大家共同");
  const [personalTarget, setPersonalTarget] = useState(currentUser);

  const [hasExtra, setHasExtra] = useState(false);
  const [extraTarget, setExtraTarget] = useState("邱袁共同");
  const [extraAmountKRW, setExtraAmountKRW] = useState("");
  const [extraAmountTWD, setExtraAmountTWD] = useState("");

  const pendingExpenses = expenses.filter((exp) => !exp.isSettled);
  const settledExpenses = expenses.filter((exp) => exp.isSettled);
  const pendingTotalTWD = pendingExpenses.reduce(
    (sum, exp) => sum + exp.amountTWD,
    0
  );

  // 排序邏輯：根據時間或類別
  const sortedPendingExpenses = useMemo(() => {
    return [...pendingExpenses].sort((a, b) => {
      if (sortMode === "category") {
        const catCompare = (a.category || "").localeCompare(b.category || "");
        if (catCompare !== 0) return catCompare;
      }
      return new Date(b.date) - new Date(a.date);
    });
  }, [pendingExpenses, sortMode]);

  const sortedSettledExpenses = useMemo(() => {
    return [...settledExpenses].sort((a, b) => {
      if (sortMode === "category") {
        const catCompare = (a.category || "").localeCompare(b.category || "");
        if (catCompare !== 0) return catCompare;
      }
      return new Date(b.date) - new Date(a.date);
    });
  }, [settledExpenses, sortMode]);

  const personalCosts = useMemo(() => {
    const costs = { 黃子庭: 0, 馬國郡: 0, 邱靖涵: 0, 袁家駿: 0 };
    pendingExpenses.forEach((exp) => {
      let mainAmount = exp.amountTWD;
      if (exp.extra) {
        mainAmount -= exp.extra.amountTWD;
        const extraTargets = getSplitIndividuals(
          exp.extra.target,
          exp.payer,
          null
        );
        const extraPerPerson = exp.extra.amountTWD / extraTargets.length;
        extraTargets.forEach((person) => {
          if (costs[person] !== undefined) costs[person] += extraPerPerson;
        });
      }
      const mainTargets = getSplitIndividuals(
        exp.splitType,
        exp.payer,
        exp.personalTarget
      );
      if (mainTargets.length > 0) {
        const mainPerPerson = mainAmount / mainTargets.length;
        mainTargets.forEach((person) => {
          if (costs[person] !== undefined) costs[person] += mainPerPerson;
        });
      }
    });
    return costs;
  }, [pendingExpenses]);

  const familyDetails = useMemo(() => {
    const initData = () => ({ total: 0, categories: {} });
    const result = {
      HM: { total: 0, shared: initData(), Huang: initData(), Ma: initData() },
      CY: { total: 0, shared: initData(), Chiu: initData(), Yuan: initData() },
    };

    expenses.forEach((exp) => {
      let mainAmount = exp.amountTWD;
      const cat = exp.category || "其他";

      const addAmountToData = (targets, amount, label) => {
        if (amount <= 0) return;
        const perPerson = amount / targets.length;
        const processFamily = (fKey, members, pMap) => {
          const fTargets = targets.filter((t) => members.includes(t));
          if (fTargets.length > 0) {
            const fTotal = perPerson * fTargets.length;
            result[fKey].total += fTotal;
            const targetData =
              fTargets.length === members.length || targets.length === 4
                ? result[fKey].shared
                : result[fKey][pMap[fTargets[0]]];
            targetData.total += fTotal;
            if (!targetData.categories[cat])
              targetData.categories[cat] = { total: 0, items: [] };
            targetData.categories[cat].total += fTotal;
            targetData.categories[cat].items.push({
              title: exp.title + label,
              amount: fTotal,
            });
          }
        };
        processFamily("HM", ["黃子庭", "馬國郡"], {
          黃子庭: "Huang",
          馬國郡: "Ma",
        });
        processFamily("CY", ["邱靖涵", "袁家駿"], {
          邱靖涵: "Chiu",
          袁家駿: "Yuan",
        });
      };

      if (exp.extra) {
        mainAmount -= exp.extra.amountTWD;
        addAmountToData(
          getSplitIndividuals(exp.extra.target, exp.payer, null),
          exp.extra.amountTWD,
          " (專屬)"
        );
      }
      addAmountToData(
        getSplitIndividuals(exp.splitType, exp.payer, exp.personalTarget),
        mainAmount,
        ""
      );
    });
    return result;
  }, [expenses]);

  const hmFamilyTotal = familyDetails.HM.total;
  const cyFamilyTotal = familyDetails.CY.total;
  const isHM = ["黃子庭", "馬國郡"].includes(currentUser);
  const isCY = ["邱靖涵", "袁家駿"].includes(currentUser);

  const calculateSettlement = () => {
    const balances = { 黃子庭: 0, 馬國郡: 0, 邱靖涵: 0, 袁家駿: 0 };
    pendingExpenses.forEach((exp) => {
      balances[exp.payer] += exp.amountTWD;
      let mainAmount = exp.amountTWD;
      if (exp.extra) {
        mainAmount -= exp.extra.amountTWD;
        const extraTargets = getSplitIndividuals(
          exp.extra.target,
          exp.payer,
          null
        );
        const extraPerPerson = exp.extra.amountTWD / extraTargets.length;
        extraTargets.forEach((p) => {
          balances[p] -= extraPerPerson;
        });
      }
      const mainTargets = getSplitIndividuals(
        exp.splitType,
        exp.payer,
        exp.personalTarget
      );
      if (mainTargets.length > 0) {
        const mainPerPerson = mainAmount / mainTargets.length;
        mainTargets.forEach((p) => {
          balances[p] -= mainPerPerson;
        });
      }
    });
    let debtors = [];
    let creditors = [];
    for (let p in balances) {
      if (balances[p] < -0.1)
        debtors.push({ name: p, amount: Math.abs(balances[p]) });
      else if (balances[p] > 0.1)
        creditors.push({ name: p, amount: balances[p] });
    }
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);
    const ts = [];
    let i = 0,
      j = 0;
    while (i < debtors.length && j < creditors.length) {
      let amt = Math.min(debtors[i].amount, creditors[j].amount);
      if (amt > 0)
        ts.push({
          from: debtors[i].name,
          to: creditors[j].name,
          amount: Math.round(amt),
        });
      debtors[i].amount -= amt;
      creditors[j].amount -= amt;
      if (debtors[i].amount < 0.1) i++;
      if (creditors[j].amount < 0.1) j++;
    }
    return ts;
  };

  const handleTWDChange = (e) => {
    const val = e.target.value;
    setAmountTWD(val);
    if (val)
      setAmountKRW(
        Math.round(parseFloat(val) * EXCHANGE_RATE_TWD_TO_KRW).toString()
      );
    else setAmountKRW("");
  };
  const handleKRWChange = (e) => {
    const val = e.target.value;
    setAmountKRW(val);
    if (val)
      setAmountTWD(
        Math.round(parseFloat(val) / EXCHANGE_RATE_TWD_TO_KRW).toString()
      );
    else setAmountTWD("");
  };
  const handleExtraTWDChange = (e) => {
    const val = e.target.value;
    setExtraAmountTWD(val);
    if (val)
      setExtraAmountKRW(
        Math.round(parseFloat(val) * EXCHANGE_RATE_TWD_TO_KRW).toString()
      );
    else setExtraAmountKRW("");
  };
  const handleExtraKRWChange = (e) => {
    const val = e.target.value;
    setExtraAmountKRW(val);
    if (val)
      setExtraAmountTWD(
        Math.round(parseFloat(val) / EXCHANGE_RATE_TWD_TO_KRW).toString()
      );
    else setExtraAmountTWD("");
  };

  const handleAddClick = () => {
    setEditingId(null);
    setTitle("");
    setAmountTWD("");
    setAmountKRW("");
    setSplitType("大家共同");
    setPayer(currentUser);
    setPersonalTarget(currentUser);
    setCategory("飲食");
    setCustomCategory("");
    setHasExtra(false);
    setExtraTarget("邱袁共同");
    setExtraAmountKRW("");
    setExtraAmountTWD("");
    setExpenseDate(formatForInput(new Date().toISOString())); // 設定為現在時間
    setShowAddExpense(true);
  };

  const handleEditClick = (exp) => {
    setEditingId(exp.id);
    setTitle(exp.title);
    setAmountTWD(exp.amountTWD.toString());
    setAmountKRW(exp.amountKRW.toString());
    setPayer(exp.payer);
    setSplitType(exp.splitType);
    setPersonalTarget(exp.personalTarget || exp.payer);
    setExpenseDate(formatForInput(exp.date)); // 載入舊的時間
    const isStandard = CATEGORIES.some((c) => c.name === exp.category);
    if (isStandard) {
      setCategory(exp.category);
      setCustomCategory("");
    } else {
      setCategory("自定義");
      setCustomCategory(exp.category);
    }
    if (exp.extra) {
      setHasExtra(true);
      setExtraTarget(exp.extra.target);
      setExtraAmountTWD(exp.extra.amountTWD.toString());
      setExtraAmountKRW(exp.extra.amountKRW.toString());
    } else {
      setHasExtra(false);
      setExtraAmountTWD("");
      setExtraAmountKRW("");
    }
    setShowAddExpense(true);
  };

  const handleSubmitExpense = () => {
    if (!title || (!amountTWD && !amountKRW)) return;
    const finalCategory =
      category === "自定義" ? customCategory.trim() || "其他" : category;
    let extraData = null;
    if (hasExtra && extraAmountTWD && parseFloat(extraAmountTWD) > 0) {
      extraData = {
        target: extraTarget,
        amountTWD: parseFloat(extraAmountTWD),
        amountKRW: parseFloat(extraAmountKRW),
      };
    }
    const finalDateStr = expenseDate
      ? new Date(expenseDate).toISOString()
      : new Date().toISOString();

    const expenseData = {
      payer,
      title,
      category: finalCategory,
      amountTWD: parseFloat(amountTWD || 0),
      amountKRW: parseFloat(amountKRW || 0),
      splitType,
      personalTarget: splitType === "個人專屬" ? personalTarget : null,
      extra: extraData,
      date: finalDateStr,
      isSettled: false,
    };
    if (editingId) onUpdateExpense(editingId, expenseData);
    else onAddExpense(expenseData);
    setShowAddExpense(false);
  };

  const isExtraInvalid =
    hasExtra &&
    extraAmountTWD &&
    amountTWD &&
    parseFloat(extraAmountTWD) >= parseFloat(amountTWD);

  const renderCategoryDetail = (data, titleText, IconComp, colorClass) => {
    if (data.total === 0) return null;
    return (
      <div className="mt-4">
        <h5
          className={`flex items-center gap-1.5 text-xs font-bold mb-2 bg-white px-3 py-2.5 rounded-xl border border-stone-100 shadow-sm ${colorClass}`}
        >
          <IconComp className="w-4 h-4" /> {titleText}
          <span className="ml-auto font-black">
            ${Math.round(data.total).toLocaleString()}
          </span>
        </h5>
        <div className="space-y-2 pl-2 border-l-[3px] border-stone-100/80 ml-2.5">
          {Object.entries(data.categories).map(([catName, catData]) => {
            const standardCat = CATEGORIES.find((c) => c.name === catName);
            const CatIcon = standardCat ? standardCat.icon : Tag;
            return (
              <div
                key={catName}
                className="bg-white rounded-xl p-3 border border-stone-100 shadow-sm ml-2"
              >
                <h4 className="flex items-center justify-between text-[11px] font-black text-stone-600 mb-2 pb-2 border-b border-stone-50">
                  <span className="flex items-center gap-1.5">
                    <CatIcon className="w-3.5 h-3.5 text-stone-400" /> {catName}
                  </span>
                  <span className="text-stone-700">
                    ${Math.round(catData.total).toLocaleString()}
                  </span>
                </h4>
                <div className="space-y-1.5">
                  {catData.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-[10px] text-stone-500"
                    >
                      <span className="truncate pr-2 font-medium flex-1">
                        • {item.title}
                      </span>
                      <span className="font-bold text-stone-400 flex-shrink-0">
                        ${Math.round(item.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 pb-10">
      <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-[2rem] p-6 text-white mb-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10 blur-2xl"></div>
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              待結算總金額
            </p>
            <h2 className="text-4xl font-black tracking-tighter flex items-baseline gap-1">
              <span className="text-xl text-stone-500 font-bold">$</span>
              {pendingTotalTWD.toLocaleString()}
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowSettlement(true)}
              className="bg-stone-700 hover:bg-stone-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Receipt className="w-4 h-4" /> 產生結算表
            </button>
            <button
              onClick={() => setShowFamilyCostModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-900/50 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <PieChart className="w-4 h-4" /> 家族與個人開銷
            </button>
          </div>
        </div>
        <div className="bg-stone-800/50 rounded-2xl p-4 border border-stone-700/50 relative z-10">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <User className="w-3 h-3" /> 目前每人各自應付
          </p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(personalCosts).map(([n, c]) => (
              <div
                key={n}
                className="flex justify-between items-center bg-stone-800/80 px-3 py-2 rounded-lg"
              >
                <span className="text-xs font-bold text-stone-300">{n}</span>
                <span className="text-sm font-black text-white">
                  ${Math.round(c).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ⭐️ 新增：排序切換區塊 */}
      <div className="flex justify-between items-end mb-4 px-1">
        <div>
          <h3 className="font-black text-stone-800 text-lg tracking-tight mb-2">
            待結算明細
          </h3>
          <div className="flex bg-stone-200/50 p-1 rounded-lg w-fit">
            <button
              onClick={() => setSortMode("time")}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                sortMode === "time"
                  ? "bg-white shadow-sm text-stone-800"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <CalendarClock className="w-3 h-3" />
              時間排序
            </button>
            <button
              onClick={() => setSortMode("category")}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                sortMode === "category"
                  ? "bg-white shadow-sm text-stone-800"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <Tag className="w-3 h-3" />
              類別分類
            </button>
          </div>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-stone-900 text-white p-2.5 px-4 rounded-full shadow-md hover:bg-stone-800 transition-all flex items-center gap-1 text-xs font-bold active:scale-95 mb-1"
        >
          <Plus className="w-4 h-4" /> 記一筆
        </button>
      </div>

      <div className="space-y-3 mb-8">
        {sortedPendingExpenses.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-[1.5rem] border border-stone-200 border-dashed">
            <CheckCircle
              className="w-10 h-10 mx-auto mb-2 text-emerald-300"
              strokeWidth={1.5}
            />
            <p className="text-sm font-bold text-stone-400">
              所有帳款都已結清！
            </p>
          </div>
        ) : (
          sortedPendingExpenses.map((exp) => {
            const standardCat = CATEGORIES.find((c) => c.name === exp.category);
            const CatIcon = standardCat ? standardCat.icon : Tag;
            let badgeColor = "bg-stone-100 text-stone-500";
            let badgeText = exp.splitType;
            if (exp.splitType === "黃馬共同")
              badgeColor = "bg-blue-50 text-blue-600 border border-blue-100";
            if (exp.splitType === "邱袁共同")
              badgeColor = "bg-amber-50 text-amber-600 border border-amber-100";
            if (exp.splitType === "大家共同")
              badgeColor = "bg-stone-800 text-white";
            if (exp.splitType === "個人專屬") {
              badgeColor =
                "bg-purple-50 text-purple-600 border border-purple-100";
              badgeText = `${exp.personalTarget || exp.payer} 個人`;
            }

            const dateObj = new Date(exp.date);
            const dateStr = !isNaN(dateObj)
              ? `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${dateObj
                  .getHours()
                  .toString()
                  .padStart(2, "0")}:${dateObj
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")}`
              : "";

            return (
              <div
                key={exp.id}
                className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-stone-200 flex items-center justify-between group transition-all relative overflow-hidden"
              >
                <div
                  className="flex items-center gap-3 relative z-10 w-full overflow-hidden cursor-pointer hover:opacity-80 active:opacity-60 transition-opacity"
                  onClick={() => handleEditClick(exp)}
                >
                  <div className="w-11 h-11 rounded-[14px] bg-stone-50 flex items-center justify-center border border-stone-100 flex-shrink-0 text-stone-600 relative">
                    <CatIcon
                      className="w-5 h-5 group-hover:opacity-0 transition-opacity"
                      strokeWidth={1.5}
                    />
                    <Edit3
                      className="w-5 h-5 absolute text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="overflow-hidden w-full">
                    <h4 className="font-bold text-stone-800 text-sm mb-0.5 truncate pr-2">
                      {exp.title}
                    </h4>
                    {dateStr && (
                      <span className="text-[9px] text-stone-400 font-bold block mb-1.5">
                        {dateStr}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-bold">
                        {exp.payer} 墊付
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${badgeColor}`}
                      >
                        {badgeText}
                      </span>
                      {exp.extra && (
                        <span className="text-[10px] bg-orange-50 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                          <SplitSquareVertical className="w-3 h-3" /> 含{" "}
                          {exp.extra.target.slice(0, 2)} 專屬 $
                          {exp.extra.amountTWD.toLocaleString()}
                        </span>
                      )}
                      <span className="text-[11px] font-black text-stone-900 ml-1 block sm:inline">
                        ${exp.amountTWD.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 relative z-10 pl-2">
                  <button
                    onClick={() => onToggleSettle(exp.id)}
                    className="flex flex-col items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-100 px-3 py-2 rounded-xl transition-colors active:scale-95"
                    title="標記為已結清"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[9px] font-bold mt-0.5">結清</span>
                  </button>
                  <button
                    onClick={() => onDeleteExpense(exp.id)}
                    className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {sortedSettledExpenses.length > 0 && (
        <div className="mt-8 border-t border-stone-200 pt-6">
          <button
            onClick={() => setShowSettledHistory(!showSettledHistory)}
            className="w-full flex items-center justify-between px-2 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />{" "}
              已結清歷史紀錄 ({sortedSettledExpenses.length})
            </h3>
            {showSettledHistory ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {showSettledHistory && (
            <div className="space-y-3 mt-4 animate-in slide-in-from-top-4 opacity-70 hover:opacity-100 transition-opacity">
              {sortedSettledExpenses.map((exp) => {
                const standardCat = CATEGORIES.find(
                  (c) => c.name === exp.category
                );
                const CatIcon = standardCat ? standardCat.icon : Tag;
                const dateObj = new Date(exp.date);
                const dateStr = !isNaN(dateObj)
                  ? `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${dateObj
                      .getHours()
                      .toString()
                      .padStart(2, "0")}:${dateObj
                      .getMinutes()
                      .toString()
                      .padStart(2, "0")}`
                  : "";

                return (
                  <div
                    key={exp.id}
                    className="bg-stone-100 p-3.5 rounded-[1.5rem] border border-stone-200 flex items-center justify-between group cursor-pointer hover:bg-stone-200"
                  >
                    <div
                      className="flex items-center gap-3 opacity-60 flex-1"
                      onClick={() => handleEditClick(exp)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-stone-200 flex items-center justify-center text-stone-500 relative">
                        <CatIcon
                          className="w-4 h-4 group-hover:opacity-0 transition-opacity"
                          strokeWidth={1.5}
                        />
                        <Edit3
                          className="w-4 h-4 absolute text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          strokeWidth={2}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-stone-600 text-xs mb-0.5 line-through">
                          {exp.title}
                        </h4>
                        {dateStr && (
                          <span className="text-[8px] text-stone-400 font-bold block mb-1">
                            {dateStr}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] text-stone-400 font-bold">
                            ${exp.amountTWD.toLocaleString()}
                          </span>
                          <span className="text-[9px] bg-stone-200 text-stone-500 px-1.5 py-0.5 rounded font-bold">
                            {exp.payer} 墊付
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => onToggleSettle(exp.id)}
                        className="flex flex-col items-center justify-center text-stone-400 hover:text-stone-700 bg-white border border-stone-200 px-3 py-1.5 rounded-xl transition-colors active:scale-95 shadow-sm"
                        title="取消結清，加回待結算"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold mt-0.5">
                          復原
                        </span>
                      </button>
                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors active:scale-95"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showFamilyCostModal && (
        <div
          className="fixed inset-0 bg-stone-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setShowFamilyCostModal(false)}
        >
          <div
            className="bg-white rounded-[2rem] w-full max-w-sm max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-stone-900 p-6 text-white text-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              <PieChart className="w-8 h-8 mx-auto mb-3 text-stone-300" />
              <h2 className="text-xl font-black tracking-wide">
                家族與個人總開銷
              </h2>
              <p className="text-stone-400 text-xs mt-1 font-medium">
                查看各自家族需負擔的所有花費 (含已結清)
              </p>
            </div>
            <div className="p-6 bg-stone-50 space-y-5">
              <div
                className={`p-4 rounded-3xl border transition-all ${
                  isHM
                    ? "bg-blue-50/50 border-blue-200 shadow-md ring-2 ring-blue-500/20"
                    : "bg-white border-stone-200"
                }`}
              >
                <h3
                  className={`font-black text-xl mb-4 flex items-center justify-between ${
                    isHM ? "text-blue-900" : "text-stone-700"
                  }`}
                >
                  <span>
                    黃馬家{" "}
                    <span className="text-[11px] font-bold text-stone-400 ml-1">
                      子庭&國郡
                    </span>
                  </span>
                  <span className="text-2xl">
                    ${Math.round(hmFamilyTotal).toLocaleString()}
                  </span>
                </h3>
                <div className="space-y-2">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-stone-100 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-stone-500 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> 共同分擔
                      </span>
                    </div>
                    <span className="font-black text-lg text-stone-700">
                      $
                      {Math.round(
                        familyDetails.HM.shared.total
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-white p-3 rounded-2xl border flex-1 flex flex-col">
                      <span className="text-xs font-bold text-blue-600 mb-1">
                        子庭個人
                      </span>
                      <span className="font-black text-lg text-blue-900">
                        $
                        {Math.round(
                          familyDetails.HM.Huang.total
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border flex-1 flex flex-col">
                      <span className="text-xs font-bold text-blue-600 mb-1">
                        國郡個人
                      </span>
                      <span className="font-black text-lg text-blue-900">
                        $
                        {Math.round(familyDetails.HM.Ma.total).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setExpandedFamily(expandedFamily === "HM" ? null : "HM")
                  }
                  className="w-full mt-4 py-2.5 bg-white rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {expandedFamily === "HM" ? "收起詳細" : "展開詳細"}
                  {expandedFamily === "HM" ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
                {expandedFamily === "HM" && (
                  <div className="mt-2 pt-2 border-t border-stone-200 animate-slide-up pb-2">
                    {renderCategoryDetail(
                      familyDetails.HM.shared,
                      "👨‍👩‍👦 家族共同",
                      Users,
                      "text-stone-700"
                    )}
                    {renderCategoryDetail(
                      familyDetails.HM.Huang,
                      "🧑 子庭專屬",
                      User,
                      "text-blue-700"
                    )}
                    {renderCategoryDetail(
                      familyDetails.HM.Ma,
                      "🧑 國郡專屬",
                      User,
                      "text-blue-700"
                    )}
                  </div>
                )}
              </div>
              <div
                className={`p-4 rounded-3xl border transition-all ${
                  isCY
                    ? "bg-amber-50/50 border-amber-200 shadow-md ring-2 ring-amber-500/20"
                    : "bg-white border-stone-200"
                }`}
              >
                <h3
                  className={`font-black text-xl mb-4 flex items-center justify-between ${
                    isCY ? "text-amber-900" : "text-stone-700"
                  }`}
                >
                  <span>
                    邱袁家{" "}
                    <span className="text-[11px] font-bold text-stone-400 ml-1">
                      含樂樂
                    </span>
                  </span>
                  <span className="text-2xl">
                    ${Math.round(cyFamilyTotal).toLocaleString()}
                  </span>
                </h3>
                <div className="space-y-2">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-stone-100 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-stone-500 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> 共同分擔
                      </span>
                    </div>
                    <span className="font-black text-lg text-stone-700">
                      $
                      {Math.round(
                        familyDetails.CY.shared.total
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-white p-3 rounded-2xl border flex-1 flex flex-col">
                      <span className="text-xs font-bold text-amber-600 mb-1">
                        靖涵個人
                      </span>
                      <span className="font-black text-lg text-amber-900">
                        $
                        {Math.round(
                          familyDetails.CY.Chiu.total
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border flex-1 flex flex-col">
                      <span className="text-xs font-bold text-amber-600 mb-1">
                        家駿個人
                      </span>
                      <span className="font-black text-lg text-amber-900">
                        $
                        {Math.round(
                          familyDetails.CY.Yuan.total
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setExpandedFamily(expandedFamily === "CY" ? null : "CY")
                  }
                  className="w-full mt-4 py-2.5 bg-white rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {expandedFamily === "CY" ? "收起詳細" : "展開詳細"}
                  {expandedFamily === "CY" ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
                {expandedFamily === "CY" && (
                  <div className="mt-2 pt-2 border-t border-stone-200 animate-slide-up pb-2">
                    {renderCategoryDetail(
                      familyDetails.CY.shared,
                      "👨‍👩‍👦 家族共同",
                      Users,
                      "text-stone-700"
                    )}
                    {renderCategoryDetail(
                      familyDetails.CY.Chiu,
                      "🧑 靖涵專屬",
                      User,
                      "text-amber-700"
                    )}
                    {renderCategoryDetail(
                      familyDetails.CY.Yuan,
                      "🧑 家駿專屬",
                      User,
                      "text-amber-700"
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowFamilyCostModal(false)}
                className="w-full mt-4 py-3.5 bg-stone-200 text-stone-800 rounded-xl font-bold active:scale-95 sticky bottom-0"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddExpense && (
        <div className="fixed inset-0 bg-stone-900/60 z-[9999] flex items-end justify-center sm:items-center p-4 pb-0 backdrop-blur-sm">
          <div className="bg-white rounded-t-[2rem] sm:rounded-[2rem] p-6 w-full max-w-md max-h-[95vh] overflow-y-auto animate-slide-up shadow-2xl">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-2 border-b border-stone-100">
              <h2 className="text-xl font-black text-stone-800">
                {editingId ? "修改花費" : "新增花費"}
              </h2>
              <button
                onClick={() => setShowAddExpense(false)}
                className="text-stone-400 hover:bg-stone-100 p-2 rounded-full"
              >
                <span className="font-bold text-sm px-1">✕</span>
              </button>
            </div>
            <div className="space-y-6 pb-6">
              {/* ⭐️ 新增：消費時間選擇 */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 mb-2 uppercase tracking-widest">
                  消費時間
                </label>
                <input
                  type="datetime-local"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 font-bold text-stone-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 mb-2 uppercase tracking-widest">
                  誰先墊錢的？
                </label>
                <div className="flex gap-2">
                  {USERS.filter((u) => !u.isChild).map((u) => (
                    <button
                      key={u.name}
                      onClick={() => setPayer(u.name)}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                        payer === u.name
                          ? "bg-stone-900 text-white border-stone-900 shadow-md"
                          : "bg-white border-stone-200 text-stone-500 hover:bg-stone-50"
                      }`}
                    >
                      {u.initial}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 mb-2 uppercase tracking-widest">
                  花費名稱
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：海雲台海鮮餐廳..."
                  className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 font-bold text-stone-800 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 mb-2 uppercase tracking-widest">
                    總金額 韓元
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 font-bold text-stone-400">
                      ₩
                    </span>
                    <input
                      type="number"
                      value={amountKRW}
                      onChange={handleKRWChange}
                      placeholder="0"
                      className="w-full pl-8 pr-3 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 font-black text-stone-800 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 mb-2 uppercase tracking-widest">
                    總金額 台幣
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 font-bold text-stone-400">
                      $
                    </span>
                    <input
                      type="number"
                      value={amountTWD}
                      onChange={handleTWDChange}
                      placeholder="0"
                      className="w-full pl-8 pr-3 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 font-black text-stone-800 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 mb-2 uppercase tracking-widest">
                  分類標籤
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setCategory(c.name)}
                      className={`flex-shrink-0 px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all font-bold text-xs border ${
                        category === c.name
                          ? "bg-stone-900 text-white border-stone-900"
                          : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <c.icon className="w-3.5 h-3.5" /> {c.name}
                    </button>
                  ))}
                  <button
                    onClick={() => setCategory("自定義")}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all font-bold text-xs border ${
                      category === "自定義"
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-white border-blue-200 text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Pencil className="w-3.5 h-3.5" /> 自定義
                  </button>
                </div>
                {category === "自定義" && (
                  <div className="mt-3 animate-slide-up">
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="請輸入類別名稱，例如：門票、藥妝..."
                      className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-900 text-sm"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 mb-2 uppercase tracking-widest">
                  由誰負擔？
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SPLIT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSplitType(opt.id)}
                      className={`flex items-start gap-2 p-3.5 border rounded-xl transition-all text-left ${
                        splitType === opt.id
                          ? "bg-blue-50 border-blue-200 ring-1 ring-blue-500"
                          : "bg-white border-stone-200"
                      }`}
                    >
                      <opt.icon
                        className={`w-4 h-4 mt-0.5 ${
                          splitType === opt.id
                            ? "text-blue-600"
                            : "text-stone-400"
                        }`}
                      />
                      <div>
                        <p
                          className={`font-bold text-xs ${
                            splitType === opt.id
                              ? "text-blue-900"
                              : "text-stone-600"
                          }`}
                        >
                          {opt.label}
                        </p>
                        <p className="text-[9px] text-stone-400">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {splitType === "個人專屬" && (
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex gap-2">
                  {USERS.filter((u) => !u.isChild).map((u) => (
                    <button
                      key={u.name}
                      onClick={() => setPersonalTarget(u.name)}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs border ${
                        personalTarget === u.name
                          ? "bg-purple-600 text-white"
                          : "bg-white text-purple-600"
                      }`}
                    >
                      {u.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="pt-2 border-t border-stone-100">
                <button
                  onClick={() => setHasExtra(!hasExtra)}
                  className="flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-4 py-3 rounded-xl transition-colors w-full border border-orange-100"
                >
                  {hasExtra ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}{" "}
                  + 包含特定家族的專屬花費嗎？(例如兒童餐)
                </button>
                {hasExtra && (
                  <div className="mt-3 p-4 bg-orange-50/50 rounded-2xl border border-orange-200 space-y-4 animate-slide-up">
                    <div>
                      <label className="block text-[10px] font-bold text-orange-700 mb-2 uppercase tracking-widest">
                        這筆專屬費用是誰的？
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setExtraTarget("邱袁共同")}
                          className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                            extraTarget === "邱袁共同"
                              ? "bg-orange-500 text-white border-orange-600 shadow-sm"
                              : "bg-white border-orange-200 text-orange-600 hover:bg-orange-100"
                          }`}
                        >
                          邱袁家 (含樂樂)
                        </button>
                        <button
                          onClick={() => setExtraTarget("黃馬共同")}
                          className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                            extraTarget === "黃馬共同"
                              ? "bg-blue-500 text-white border-blue-600 shadow-sm"
                              : "bg-white border-blue-200 text-blue-600 hover:bg-blue-50"
                          }`}
                        >
                          黃馬家
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-orange-700 mb-1.5 uppercase tracking-widest">
                          專屬金額 (KRW)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 font-bold text-orange-400">
                            ₩
                          </span>
                          <input
                            type="number"
                            value={extraAmountKRW}
                            onChange={handleExtraKRWChange}
                            placeholder="0"
                            className="w-full pl-8 pr-3 py-2.5 bg-white border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-black text-orange-900 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-orange-700 mb-1.5 uppercase tracking-widest">
                          專屬金額 (TWD)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 font-bold text-orange-400">
                            $
                          </span>
                          <input
                            type="number"
                            value={extraAmountTWD}
                            onChange={handleExtraTWDChange}
                            placeholder="0"
                            className="w-full pl-8 pr-3 py-2.5 bg-white border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-black text-orange-900 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    {isExtraInvalid && (
                      <p className="text-xs text-red-500 font-bold bg-red-50 p-2 rounded-lg flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />{" "}
                        專屬金額不能大於或等於總金額喔！
                      </p>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={handleSubmitExpense}
                disabled={!title || !amountTWD || isExtraInvalid}
                className="w-full py-4 mt-2 bg-stone-900 text-white rounded-xl font-bold text-sm shadow-lg active:scale-95"
              >
                {editingId ? "儲存修改" : "新增花費"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettlement && (
        <div
          className="fixed inset-0 bg-stone-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setShowSettlement(false)}
        >
          <div
            className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden animate-slide-up shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-stone-900 p-6 text-white text-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              <Receipt className="w-8 h-8 mx-auto mb-3 text-stone-300" />
              <h2 className="text-xl font-black tracking-wide">待轉帳結算單</h2>
            </div>
            <div className="p-6 bg-stone-50">
              {calculateSettlement().length === 0 ? (
                <div className="text-center font-bold py-6">
                  無待結算帳款！🎉
                </div>
              ) : (
                <div className="space-y-3">
                  {calculateSettlement().map((t, i) => (
                    <div
                      key={i}
                      className="bg-white p-4 rounded-2xl border flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-stone-700">
                          {t.from}
                        </span>
                        <ArrowRightCircle className="w-5 h-5 text-stone-300" />
                        <span className="font-bold text-stone-700">{t.to}</span>
                      </div>
                      <span className="font-black text-lg text-red-500">
                        ${t.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowSettlement(false)}
                className="w-full mt-6 py-3.5 bg-stone-200 rounded-xl font-bold"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 🎒 家族共同行李清單元件
// ==========================================
function PackingListView({
  packingItems,
  onAddPackingItem,
  onUpdatePackingItem,
  onDeletePackingItem,
  recommendedItems,
  setRecommendedItems,
}) {
  const [newItemName, setNewItemName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const toggleHM = (id) => {
    const item = packingItems.find((i) => i.id === id);
    onUpdatePackingItem(id, { ...item, checkedHM: !item.checkedHM });
  };
  const toggleCY = (id) => {
    const item = packingItems.find((i) => i.id === id);
    onUpdatePackingItem(id, { ...item, checkedCY: !item.checkedCY });
  };
  const handleAddCustom = () => {
    if (!newItemName.trim()) return;
    onAddPackingItem(newItemName.trim());
    setNewItemName("");
  };
  const handleAddRecommended = (itemStr) => {
    onAddPackingItem(itemStr);
    setRecommendedItems((prev) => prev.filter((i) => i !== itemStr));
  };
  const handleSaveEdit = (id) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    const item = packingItems.find((i) => i.id === id);
    onUpdatePackingItem(id, { ...item, name: editName.trim() });
    setEditingId(null);
  };
  return (
    <div className="p-4 pb-10">
      <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-[2rem] p-6 text-white mb-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 mb-1">
          <Package className="w-6 h-6 text-stone-400" /> 共同行李清單
        </h2>
        <p className="text-xs text-stone-400 font-medium leading-relaxed">
          輸入各自需要帶的東西。
          <br />
          右側可分別標記是否準備完成。
        </p>
      </div>
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="必備物品..."
          className="flex-1 px-4 py-3.5 bg-white border border-stone-200 rounded-xl font-bold text-stone-800 text-sm shadow-sm"
        />
        <button
          onClick={handleAddCustom}
          disabled={!newItemName.trim()}
          className="bg-stone-900 text-white px-5 rounded-xl font-bold active:scale-95 shadow-sm"
        >
          新增
        </button>
      </div>
      <div className="space-y-3 mb-8">
        {packingItems.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-[1.5rem] border border-stone-200 border-dashed">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 text-stone-300" />
            <p className="text-sm font-bold text-stone-400">目前清單空空的</p>
          </div>
        ) : (
          packingItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-3.5 pr-2 rounded-[1.5rem] shadow-sm border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2 flex-1 pl-1">
                {editingId === item.id ? (
                  <div className="flex w-full items-center gap-2 pr-2">
                    <input
                      autoFocus
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 border-b-2 border-stone-800 focus:outline-none text-sm font-bold text-stone-800 py-1"
                    />
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="p-1.5 bg-stone-800 text-white rounded-lg"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span
                    onClick={() => {
                      setEditingId(item.id);
                      setEditName(item.name);
                    }}
                    className="font-bold text-sm text-stone-800 cursor-text hover:text-blue-600 transition-colors flex items-center gap-2"
                  >
                    {item.name}{" "}
                    <Edit3 className="w-3 h-3 text-stone-300 opacity-0 group-hover:opacity-100" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => toggleHM(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-[11px] transition-all ${
                    item.checkedHM ? "bg-blue-600 text-white" : "bg-stone-50"
                  }`}
                >
                  {item.checkedHM ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Circle className="w-3.5 h-3.5" />
                  )}{" "}
                  黃馬
                </button>
                <button
                  onClick={() => toggleCY(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-[11px] transition-all ${
                    item.checkedCY ? "bg-amber-500 text-white" : "bg-stone-50"
                  }`}
                >
                  {item.checkedCY ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Circle className="w-3.5 h-3.5" />
                  )}{" "}
                  邱袁
                </button>
                <button
                  onClick={() => onDeletePackingItem(item.id)}
                  className="p-1.5 text-stone-300 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {recommendedItems.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 px-1">
            <Sparkles className="w-3.5 h-3.5" /> 釜山推薦必備清單
          </h3>
          <div className="flex flex-wrap gap-2">
            {recommendedItems.map((itemStr, idx) => (
              <button
                key={idx}
                onClick={() => handleAddRecommended(itemStr)}
                className="bg-white border border-stone-200 text-stone-600 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-stone-50 transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-stone-400" /> {itemStr}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
