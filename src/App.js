import React, { useState, useMemo } from "react";
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
} from "lucide-react";

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
  { id: "個人專屬", label: "自己付", desc: "僅墊錢者", icon: User },
];

const getSplitIndividuals = (type, payerName) => {
  if (type === "大家共同") return ["黃子庭", "馬國郡", "邱靖涵", "袁家駿"];
  if (type === "黃馬共同") return ["黃子庭", "馬國郡"];
  if (type === "邱袁共同") return ["邱靖涵", "袁家駿"];
  if (type === "個人專屬") return [payerName];
  return [type];
};

// ==========================================
// 🚀 主應用程式元件
// ==========================================
export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("busan_trip_user") || null;
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState("expenses");
  const [showCalculator, setShowCalculator] = useState(false);

  const [expenses, setExpenses] = useState([
    {
      id: 1,
      payer: "黃子庭",
      title: "四人來回機票 (行前)",
      category: "機票",
      amountTWD: 34000,
      amountKRW: 1445000,
      splitType: "大家共同",
      extra: null,
      date: new Date().toISOString(),
      isSettled: false,
    },
    {
      id: 2,
      payer: "馬國郡",
      title: "西面味贊王烤肉",
      category: "飲食",
      amountTWD: 2200,
      amountKRW: 93500,
      splitType: "大家共同",
      extra: null,
      date: new Date().toISOString(),
      isSettled: false,
    },
    {
      id: 3,
      payer: "邱靖涵",
      title: "海雲台海鮮餐廳 (含樂樂)",
      category: "飲食",
      amountTWD: 20000,
      amountKRW: 850000,
      splitType: "大家共同",
      extra: { target: "邱袁共同", amountTWD: 2000, amountKRW: 85000 },
      date: new Date().toISOString(),
      isSettled: false,
    },
  ]);

  const [packingItems, setPackingItems] = useState([
    {
      id: 1,
      name: "護照 (檢查效期需滿6個月)",
      checkedHM: true,
      checkedCY: false,
    },
    {
      id: 2,
      name: "信用卡 (海外回饋高優先)",
      checkedHM: false,
      checkedCY: false,
    },
  ]);

  const [recommendedItems, setRecommendedItems] = useState([
    "⚡ 220V 圓頭轉接頭 (Type C/F)",
    "💳 T-money 或 WOWPASS 交通卡",
    "🛂 護照紙本影本 (備用)",
    "🧥 防風保暖外套 (海風大)",
  ]);

  const handleLogin = (name) => {
    setCurrentUser(name);
    localStorage.setItem("busan_trip_user", name);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("busan_trip_user");
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
      <style>{`
        ::-webkit-scrollbar { display: none; }
        html { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slide-up { from { transform: translateY(10%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>

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
            setExpenses={setExpenses}
            currentUser={currentUser}
          />
        )}
        {activeTab === "tools" && (
          <PackingListView
            packingItems={packingItems}
            setPackingItems={setPackingItems}
            recommendedItems={recommendedItems}
            setRecommendedItems={setRecommendedItems}
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
function ExpenseView({ expenses, setExpenses, currentUser }) {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [showSettledHistory, setShowSettledHistory] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("飲食");
  const [amountTWD, setAmountTWD] = useState("");
  const [amountKRW, setAmountKRW] = useState("");
  const [payer, setPayer] = useState(currentUser);
  const [splitType, setSplitType] = useState("大家共同");

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

  const personalCosts = useMemo(() => {
    const costs = { 黃子庭: 0, 馬國郡: 0, 邱靖涵: 0, 袁家駿: 0 };

    pendingExpenses.forEach((exp) => {
      let mainAmount = exp.amountTWD;

      if (exp.extra) {
        mainAmount -= exp.extra.amountTWD;
        const extraTargets = getSplitIndividuals(exp.extra.target, exp.payer);
        const extraPerPerson = exp.extra.amountTWD / extraTargets.length;
        extraTargets.forEach((person) => {
          if (costs[person] !== undefined) costs[person] += extraPerPerson;
        });
      }

      const mainTargets = getSplitIndividuals(exp.splitType, exp.payer);
      if (mainTargets.length > 0) {
        const mainPerPerson = mainAmount / mainTargets.length;
        mainTargets.forEach((person) => {
          if (costs[person] !== undefined) costs[person] += mainPerPerson;
        });
      }
    });
    return costs;
  }, [pendingExpenses]);

  const calculateSettlement = () => {
    const balances = { 黃子庭: 0, 馬國郡: 0, 邱靖涵: 0, 袁家駿: 0 };

    pendingExpenses.forEach((exp) => {
      balances[exp.payer] += exp.amountTWD;
      let mainAmount = exp.amountTWD;

      if (exp.extra) {
        mainAmount -= exp.extra.amountTWD;
        const extraTargets = getSplitIndividuals(exp.extra.target, exp.payer);
        const extraPerPerson = exp.extra.amountTWD / extraTargets.length;
        extraTargets.forEach((person) => {
          balances[person] -= extraPerPerson;
        });
      }

      const mainTargets = getSplitIndividuals(exp.splitType, exp.payer);
      if (mainTargets.length > 0) {
        const mainPerPerson = mainAmount / mainTargets.length;
        mainTargets.forEach((person) => {
          balances[person] -= mainPerPerson;
        });
      }
    });

    let debtors = [];
    let creditors = [];
    for (let person in balances) {
      if (balances[person] < -0.1)
        debtors.push({ name: person, amount: Math.abs(balances[person]) });
      else if (balances[person] > 0.1)
        creditors.push({ name: person, amount: balances[person] });
    }
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const transactions = [];
    let i = 0;
    let j = 0;
    while (i < debtors.length && j < creditors.length) {
      let amount = Math.min(debtors[i].amount, creditors[j].amount);
      if (amount > 0)
        transactions.push({
          from: debtors[i].name,
          to: creditors[j].name,
          amount: Math.round(amount),
        });
      debtors[i].amount -= amount;
      creditors[j].amount -= amount;
      if (debtors[i].amount < 0.1) i++;
      if (creditors[j].amount < 0.1) j++;
    }
    return transactions;
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

  const isExtraInvalid =
    hasExtra &&
    extraAmountTWD &&
    amountTWD &&
    parseFloat(extraAmountTWD) >= parseFloat(amountTWD);

  const handleAddExpense = () => {
    if (!title || (!amountTWD && !amountKRW) || isExtraInvalid) return;
    let extraData = null;
    if (hasExtra && extraAmountTWD && parseFloat(extraAmountTWD) > 0) {
      extraData = {
        target: extraTarget,
        amountTWD: parseFloat(extraAmountTWD),
        amountKRW: parseFloat(extraAmountKRW),
      };
    }
    setExpenses([
      {
        id: Date.now(),
        payer,
        title,
        category,
        amountTWD: parseFloat(amountTWD || 0),
        amountKRW: parseFloat(amountKRW || 0),
        splitType,
        extra: extraData,
        date: new Date().toISOString(),
        isSettled: false,
      },
      ...expenses,
    ]);

    setShowAddExpense(false);
    setTitle("");
    setAmountTWD("");
    setAmountKRW("");
    setSplitType("大家共同");
    setPayer(currentUser);
    setHasExtra(false);
    setExtraTarget("邱袁共同");
    setExtraAmountKRW("");
    setExtraAmountTWD("");
  };

  const handleDeleteExpense = (id) =>
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  const toggleSettleStatus = (id) =>
    setExpenses((prev) =>
      prev.map((exp) =>
        exp.id === id ? { ...exp, isSettled: !exp.isSettled } : exp
      )
    );

  return (
    <div className="p-4 pb-10">
      {/* 總看板 */}
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
          <button
            onClick={() => setShowSettlement(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-900/50 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Receipt className="w-4 h-4" /> 產生結算表
          </button>
        </div>

        {/* 各自花費儀表板 */}
        <div className="bg-stone-800/50 rounded-2xl p-4 border border-stone-700/50 relative z-10">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <User className="w-3 h-3" /> 目前每人各自應付
          </p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(personalCosts).map(([name, cost]) => (
              <div
                key={name}
                className="flex justify-between items-center bg-stone-800/80 px-3 py-2 rounded-lg"
              >
                <span className="text-xs font-bold text-stone-300">{name}</span>
                <span className="text-sm font-black text-white">
                  ${Math.round(cost).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-black text-stone-800 text-lg tracking-tight">
          待結算明細
        </h3>
        <button
          onClick={() => setShowAddExpense(true)}
          className="bg-stone-900 text-white p-2.5 px-4 rounded-full shadow-md hover:bg-stone-800 transition-all flex items-center gap-1 text-xs font-bold active:scale-95"
        >
          <Plus className="w-4 h-4" /> 記一筆
        </button>
      </div>

      {/* 待結算列表 */}
      <div className="space-y-3 mb-8">
        {pendingExpenses.length === 0 ? (
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
          pendingExpenses.map((exp) => {
            const catInfo =
              CATEGORIES.find((c) => c.name === exp.category) || CATEGORIES[0];
            const CatIcon = catInfo.icon;
            let badgeColor = "bg-stone-100 text-stone-500";
            if (exp.splitType === "黃馬共同")
              badgeColor = "bg-blue-50 text-blue-600 border border-blue-100";
            if (exp.splitType === "邱袁共同")
              badgeColor = "bg-amber-50 text-amber-600 border border-amber-100";
            if (exp.splitType === "大家共同")
              badgeColor = "bg-stone-800 text-white";

            return (
              <div
                key={exp.id}
                className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-stone-200 flex items-center justify-between group transition-all relative overflow-hidden"
              >
                <div className="flex items-center gap-3 relative z-10 w-full overflow-hidden">
                  <div className="w-11 h-11 rounded-[14px] bg-stone-50 flex items-center justify-center border border-stone-100 flex-shrink-0 text-stone-600">
                    <CatIcon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div className="overflow-hidden w-full">
                    <h4 className="font-bold text-stone-800 text-sm mb-1 truncate pr-2">
                      {exp.title}
                    </h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-bold">
                        {exp.payer} 墊付
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${badgeColor}`}
                      >
                        {exp.splitType}
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
                    onClick={() => toggleSettleStatus(exp.id)}
                    className="flex flex-col items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-100 px-3 py-2 rounded-xl transition-colors active:scale-95"
                    title="標記為已結清"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[9px] font-bold mt-0.5">結清</span>
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
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

      {/* 已結清歷史 */}
      {settledExpenses.length > 0 && (
        <div className="mt-8 border-t border-stone-200 pt-6">
          <button
            onClick={() => setShowSettledHistory(!showSettledHistory)}
            className="w-full flex items-center justify-between px-2 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />{" "}
              已結清歷史紀錄 ({settledExpenses.length})
            </h3>
            {showSettledHistory ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {showSettledHistory && (
            <div className="space-y-3 mt-4 animate-in slide-in-from-top-4 opacity-70 hover:opacity-100 transition-opacity">
              {settledExpenses.map((exp) => {
                const catInfo =
                  CATEGORIES.find((c) => c.name === exp.category) ||
                  CATEGORIES[0];
                const CatIcon = catInfo.icon;
                return (
                  <div
                    key={exp.id}
                    className="bg-stone-100 p-3.5 rounded-[1.5rem] border border-stone-200 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 opacity-60">
                      <div className="w-10 h-10 rounded-xl bg-stone-200 flex items-center justify-center text-stone-500">
                        <CatIcon className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-600 text-xs mb-1 line-through">
                          {exp.title}
                        </h4>
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
                        onClick={() => toggleSettleStatus(exp.id)}
                        className="flex flex-col items-center justify-center text-stone-400 hover:text-stone-700 bg-white border border-stone-200 px-3 py-1.5 rounded-xl transition-colors active:scale-95 shadow-sm"
                        title="取消結清，加回待結算"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold mt-0.5">
                          復原
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
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

      {/* 新增記帳 Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-stone-900/60 z-[9999] flex items-end justify-center sm:items-center p-4 pb-0 backdrop-blur-sm">
          <div className="bg-white rounded-t-[2rem] sm:rounded-[2rem] p-6 w-full max-w-md max-h-[95vh] overflow-y-auto animate-slide-up shadow-2xl">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-2 border-b border-stone-100">
              <h2 className="text-xl font-black text-stone-800">新增花費</h2>
              <button
                onClick={() => setShowAddExpense(false)}
                className="text-stone-400 hover:bg-stone-100 p-2 rounded-full"
              >
                <span className="font-bold text-sm px-1">✕</span>
              </button>
            </div>

            <div className="space-y-6 pb-6">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 mb-2 uppercase tracking-widest">
                  誰先墊錢的？(Payer)
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
                    總金額 韓元 (KRW)
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
                    總金額 台幣 (TWD)
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
                  剩餘金額由誰負擔？(Main Split)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SPLIT_OPTIONS.map((opt) => {
                    const OptIcon = opt.icon;
                    const isActive = splitType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSplitType(opt.id)}
                        className={`flex items-start gap-2 p-3.5 border rounded-xl transition-all text-left ${
                          isActive
                            ? "bg-blue-50 border-blue-200 ring-1 ring-blue-500"
                            : "bg-white border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        <OptIcon
                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            isActive ? "text-blue-600" : "text-stone-400"
                          }`}
                          strokeWidth={2}
                        />
                        <div>
                          <p
                            className={`font-bold text-xs leading-tight ${
                              isActive ? "text-blue-900" : "text-stone-600"
                            }`}
                          >
                            {opt.label}
                          </p>
                          <p
                            className={`text-[9px] mt-1 font-bold ${
                              isActive ? "text-blue-500" : "text-stone-400"
                            }`}
                          >
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 包含專屬費用 Toggle 區塊 */}
              <div className="pt-2 border-t border-stone-100">
                <button
                  onClick={() => setHasExtra(!hasExtra)}
                  className="flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-4 py-3 rounded-xl transition-colors w-full border border-orange-100"
                >
                  {hasExtra ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
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

              <div>
                <label className="block text-[10px] font-bold text-stone-400 mb-2 uppercase tracking-widest">
                  分類標籤
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                  {CATEGORIES.map((c) => {
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.name}
                        onClick={() => setCategory(c.name)}
                        className={`flex-shrink-0 px-4 py-3 rounded-xl flex items-center gap-1.5 transition-all font-bold text-xs border ${
                          category === c.name
                            ? "bg-stone-900 text-white border-stone-900"
                            : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" strokeWidth={2} />{" "}
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleAddExpense}
                disabled={!title || !amountTWD || isExtraInvalid}
                className="w-full py-4 mt-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-sm disabled:opacity-30 transition-all active:scale-95 flex justify-center items-center shadow-lg"
              >
                儲存花費
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 最終結算表 Modal */}
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
              <p className="text-stone-400 text-xs mt-1 font-medium">
                系統已自動為您抵銷複雜的代墊款與專屬費用
              </p>
            </div>
            <div className="p-6 bg-stone-50">
              {calculateSettlement().length === 0 ? (
                <div className="text-center text-stone-500 font-bold py-6">
                  無待結算帳款！🎉
                </div>
              ) : (
                <div className="space-y-3">
                  {calculateSettlement().map((t, i) => (
                    <div
                      key={i}
                      className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center justify-between shadow-sm"
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
                className="w-full mt-6 py-3.5 bg-stone-200 text-stone-800 rounded-xl font-bold hover:bg-stone-300 transition-colors active:scale-95"
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
  setPackingItems,
  recommendedItems,
  setRecommendedItems,
}) {
  const [newItemName, setNewItemName] = useState("");

  const toggleHM = (id) =>
    setPackingItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checkedHM: !item.checkedHM } : item
      )
    );
  const toggleCY = (id) =>
    setPackingItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checkedCY: !item.checkedCY } : item
      )
    );
  const deleteItem = (id) =>
    setPackingItems((prev) => prev.filter((item) => item.id !== id));

  const handleAddCustom = () => {
    if (!newItemName.trim()) return;
    setPackingItems([
      ...packingItems,
      {
        id: Date.now(),
        name: newItemName.trim(),
        checkedHM: false,
        checkedCY: false,
      },
    ]);
    setNewItemName("");
  };

  const handleAddRecommended = (itemStr) => {
    setPackingItems([
      ...packingItems,
      { id: Date.now(), name: itemStr, checkedHM: false, checkedCY: false },
    ]);
    setRecommendedItems((prev) => prev.filter((i) => i !== itemStr));
  };

  return (
    <div className="p-4 pb-10">
      <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-[2rem] p-6 text-white mb-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8 blur-2xl"></div>
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 mb-1">
          <Package className="w-6 h-6 text-stone-400" /> 共同行李清單
        </h2>
        <p className="text-xs text-stone-400 font-medium leading-relaxed">
          輸入各自需要帶的東西。
          <br />
          右側可分別標記「黃馬家」與「邱袁家」是否準備完成。
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="輸入你們想到的必備物品..."
          className="flex-1 px-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 font-bold text-stone-800 text-sm shadow-sm"
        />
        <button
          onClick={handleAddCustom}
          disabled={!newItemName.trim()}
          className="bg-stone-900 text-white px-5 rounded-xl font-bold flex items-center justify-center disabled:opacity-50 transition-all active:scale-95 shadow-sm hover:bg-stone-800"
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
                <span
                  className={`font-bold text-sm ${
                    item.checkedHM && item.checkedCY
                      ? "text-stone-400 line-through"
                      : "text-stone-800"
                  }`}
                >
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => toggleHM(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-[11px] transition-all ${
                    item.checkedHM
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-stone-50 border-stone-200 text-stone-400 hover:bg-stone-100"
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
                    item.checkedCY
                      ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                      : "bg-stone-50 border-stone-200 text-stone-400 hover:bg-stone-100"
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
                  onClick={() => deleteItem(item.id)}
                  className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
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
                className="bg-white border border-stone-200 text-stone-600 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-stone-50 hover:border-stone-300 transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
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
