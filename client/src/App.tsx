import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './store';
import * as dashboardActions from './store/dashboardSlice';
import {
  Eye,
  Pencil,
  LayoutDashboard,
  KeyRound,
  Play,
  Square,
  Terminal,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Plus,
  Trash2,
  Settings,
  Cpu,
  CheckCircle2,
  XCircle,
  Bell,
  Briefcase,
  Search,
  Sliders,
  Sun,
  Moon,
  LogOut,
  Users,
  CreditCard,
  FileSpreadsheet,
  FileText,
  Shield,
  Ban,
  User as UserIcon,
  Layers,
  Lock,
  RefreshCw,
  AlertOctagon,
  Info,
  HelpCircle,
  Send,
  Database,
  MoreVertical,
  LayoutGrid,
  List,
  Menu
} from 'lucide-react';

// Interfaces for our state
interface Credential {
  id: string;
  broker: string;
  name: string;
  apiKey: string;
  userId: string;
  status: 'connected' | 'disconnected' | 'error';
  lastConnected: string | null;
  funds?: number;
  margin?: number;
  holdings?: number;
  clientName?: string;
  totpSecret?: string;
  accessToken?: string | null;
}

interface Strategy {
  id: string;
  name: string;
  instrument: string;
  type: string;
  status: 'active' | 'inactive';
  capital: number;
  pnl: number;
  tradesCount: number;
  settings: Record<string, any>;
}

interface Trade {
  id: string;
  strategyId: string;
  strategyName: string;
  instrument: string;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  value: number;
  pnl?: number;
  timestamp: string;
}

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  source: string;
  message: string;
}

interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  maxLotLimit: number;
  maxCapital: number;
  maxOpenPositions: number;
  status: 'active' | 'inactive';
  billingCycle?: string;
}

interface PaymentRecord {
  id: string;
  userEmail: string;
  planName: string;
  amount: number;
  status: 'success' | 'pending' | 'refunded';
  date: string;
}

interface TradingSignal {
  id: string;
  instrument: string;
  type: 'BUY' | 'SELL';
  price: number;
  time: string;
  status: string;
}

interface AuditLogEntry {
  timestamp: string;
  type: string;
  source: string;
  message: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  lotMultiplier: number;
  status?: 'active' | 'suspended';
  createdAt?: string;
  lastLogin?: string;
  riskSettings?: {
    defaultLotSize: number;
    dailyRiskLimit: number;
    stopLossPct: number;
    targetPct: number;
    maxOpenTrades: number;
  };
}

// Custom interactive SVG chart components for Admin Dashboard
interface AreaChartProps {
  data: { label: string; value1: number; value2: number }[];
}

function AreaChart({ data }: AreaChartProps) {
  const width = 600;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const maxVal = Math.max(...data.map(d => Math.max(d.value1, d.value2)), 10);
  
  const getPoints = (valKey: 'value1' | 'value2') => {
    return data.map((d, index) => {
      const x = paddingX + (index / (data.length - 1)) * chartWidth;
      const y = paddingY + chartHeight - (d[valKey] / maxVal) * chartHeight;
      return { x, y };
    });
  };

  const pts1 = getPoints('value1');
  const pts2 = getPoints('value2');

  const pathD1 = pts1.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
  const areaD1 = `${pathD1} L ${pts1[pts1.length - 1].x} ${height - paddingY} L ${pts1[0].x} ${height - paddingY} Z`;

  const pathD2 = pts2.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
  const areaD2 = `${pathD2} L ${pts2[pts2.length - 1].x} ${height - paddingY} L ${pts2[0].x} ${height - paddingY} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-foreground/50">
      <defs>
        <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0.0" />
        </linearGradient>
        <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      
      {/* Grid Lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
        const y = paddingY + chartHeight * r;
        const val = Math.round(maxVal * (1 - r));
        return (
          <g key={i} className="opacity-10">
            <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="currentColor" strokeWidth={1} strokeDasharray="4 4" />
            <text x={paddingX - 10} y={y + 4} fill="currentColor" fontSize="10" textAnchor="end">{val}</text>
          </g>
        );
      })}

      {/* X Axis labels */}
      {data.map((d, index) => {
        const x = paddingX + (index / (data.length - 1)) * chartWidth;
        return (
          <text key={index} x={x} y={height - 10} fill="currentColor" className="opacity-40" fontSize="10" textAnchor="middle">
            {d.label}
          </text>
        );
      })}

      {/* Area Fills */}
      <path d={areaD1} fill="url(#grad1)" />
      <path d={areaD2} fill="url(#grad2)" />

      {/* Lines */}
      <path d={pathD1} fill="none" stroke="var(--chart-1)" strokeWidth={2.5} strokeLinecap="round" />
      <path d={pathD2} fill="none" stroke="var(--secondary)" strokeWidth={2.5} strokeLinecap="round" />

      {/* Interactive Dots */}
      {pts1.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="var(--chart-1)" stroke="var(--background)" strokeWidth={1.5} className="cursor-pointer" />
      ))}
      {pts2.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="var(--secondary)" stroke="var(--background)" strokeWidth={1.5} className="cursor-pointer" />
      ))}
    </svg>
  );
}

interface BarChartProps {
  data: { label: string; value: number }[];
}

function BarChart({ data }: BarChartProps) {
  const width = 400;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const maxVal = Math.max(...data.map(d => d.value), 10);
  const barWidth = (chartWidth / data.length) * 0.55;
  const gap = (chartWidth / data.length) * 0.45;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-foreground/50">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Grid Lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
        const y = paddingY + chartHeight * r;
        const val = Math.round(maxVal * (1 - r));
        return (
          <g key={i} className="opacity-10">
            <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="currentColor" strokeWidth={1} />
            <text x={paddingX - 10} y={y + 4} fill="currentColor" fontSize="10" textAnchor="end">{val}</text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, index) => {
        const x = paddingX + index * (barWidth + gap) + gap / 2;
        const barHeight = (d.value / maxVal) * chartHeight;
        const y = paddingY + chartHeight - barHeight;

        return (
          <g key={index} className="group">
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="url(#barGrad)"
              className="transition-all duration-300 hover:opacity-85"
            />
            <text
              x={x + barWidth / 2}
              y={y - 6}
              fill="currentColor"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            >
              {d.value}
            </text>
            <text
              x={x + barWidth / 2}
              y={height - 10}
              fill="currentColor"
              className="opacity-40"
              fontSize="10"
              textAnchor="middle"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
}

function DonutChart({ data }: DonutChartProps) {
  const size = 200;
  const radius = 60;
  const strokeWidth = 16;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="relative w-36 h-36 shrink-0 mx-auto sm:mx-0">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
          <circle cx={center} cy={center} r={radius} fill="transparent" stroke="var(--border)" strokeWidth={strokeWidth} className="opacity-25" />
          {data.map((d, index) => {
            const percent = d.value / total;
            const strokeDashoffset = circumference - percent * circumference;
            const rotationOffset = (accumulatedPercent * 360);
            accumulatedPercent += percent;

            return (
              <circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={d.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(${rotationOffset} ${center} ${center})`}
                strokeLinecap="square"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Total</span>
          <span className="text-lg font-black text-foreground">{total}</span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-col gap-2 flex-1">
        {data.map((d, index) => {
          const pct = ((d.value / total) * 100).toFixed(0);
          return (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground font-medium truncate max-w-[120px]">{d.label}</span>
              </div>
              <span className="font-bold text-foreground font-mono">${pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface SparklineProps {
  points: number[];
  color: string;
}

function Sparkline({ points, color }: SparklineProps) {
  const width = 120;
  const height = 30;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min;

  const pts = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        points={pts}
      />
    </svg>
  );
}

// URL <-> tab mapping
const TAB_TO_URL: Record<string, string> = {
  admin_dashboard:     '/admin/dashboard',
  admin_users:         '/admin/users',
  admin_subscriptions: '/admin/subscriptions',
  admin_brokers:       '/admin/brokers',
  admin_trading:       '/admin/trading',
  admin_risk:          '/admin/risk',
  admin_signals:       '/admin/signals',
  admin_payments:      '/admin/payments',
  admin_reports:       '/admin/reports',
  admin_notifications: '/admin/notifications',
  admin_settings:      '/admin/settings',
  admin_audit:         '/admin/audit',
  user_dashboard:         '/user/dashboard',
  user_broker:            '/user/broker',
  user_subscription:      '/user/subscription',
  user_trading_settings:  '/user/trading-settings',
  user_orders_reports:    '/user/orders',
  user_profile:           '/user/profile',
};
const URL_TO_TAB: Record<string, string> = Object.fromEntries(
  Object.entries(TAB_TO_URL).map(([k, v]) => [v, k])
);

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'https://black-rox.onrender.com';

const WS_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'ws://localhost:5000'
  : 'wss://black-rox.onrender.com';

export function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = useAppSelector(state => state.dashboard.isLoggedIn);
  const authToken = useAppSelector(state => state.dashboard.authToken);
  const user = useAppSelector(state => state.dashboard.user);
  const activeTab = useAppSelector(state => state.dashboard.activeTab);
  const credentials = useAppSelector(state => state.dashboard.credentials);
  const strategies = useAppSelector(state => state.dashboard.strategies);
  const trades = useAppSelector(state => state.dashboard.trades);
  const logs = useAppSelector(state => state.dashboard.logs);
  const overallPnl = useAppSelector(state => state.dashboard.overallPnl);
  const isDarkMode = useAppSelector(state => state.dashboard.isDarkMode);

  // Sync Redux activeTab from URL on load/navigation
  useEffect(() => {
    const tab = URL_TO_TAB[location.pathname];
    if (tab && tab !== activeTab) {
      dispatch(dashboardActions.setActiveTab(tab));
    }
  }, [location.pathname]);

  const setIsLoggedIn = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isLoggedIn) : val;
    dispatch(dashboardActions.setAuth({ token: nextVal ? authToken : null, user: nextVal ? user : null }));
  };

  const setAuthToken = (val: string | null | ((prev: string | null) => string | null)) => {
    const nextVal = typeof val === 'function' ? val(authToken) : val;
    dispatch(dashboardActions.setAuth({ token: nextVal, user }));
  };

  const setUser = (val: User | null | ((prev: User | null) => User | null)) => {
    const nextVal = typeof val === 'function' ? val(user) : val;
    dispatch(dashboardActions.setAuth({ token: authToken, user: nextVal }));
  };

  // setActiveTab now ALSO updates the browser URL
  const setActiveTab = (val: string | ((prev: string) => string)) => {
    const nextVal = typeof val === 'function' ? val(activeTab) : val;
    dispatch(dashboardActions.setActiveTab(nextVal));
    const url = TAB_TO_URL[nextVal];
    if (url && location.pathname !== url) navigate(url);
  };

  const setCredentials = (val: Credential[] | ((prev: Credential[]) => Credential[])) => {
    const nextVal = typeof val === 'function' ? val(credentials) : val;
    dispatch(dashboardActions.setCredentials(nextVal));
  };

  const setStrategies = (val: Strategy[] | ((prev: Strategy[]) => Strategy[])) => {
    const nextVal = typeof val === 'function' ? val(strategies) : val;
    dispatch(dashboardActions.setStrategies(nextVal));
  };

  const setTrades = (val: Trade[] | ((prev: Trade[]) => Trade[])) => {
    const nextVal = typeof val === 'function' ? val(trades) : val;
    dispatch(dashboardActions.setTrades(nextVal));
  };

  const setLogs = (val: LogEntry[] | ((prev: LogEntry[]) => LogEntry[])) => {
    const nextVal = typeof val === 'function' ? val(logs) : val;
    dispatch(dashboardActions.setLogs(nextVal));
  };

  const setOverallPnl = (val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(overallPnl) : val;
    dispatch(dashboardActions.setOverallPnl(nextVal));
  };

  const setIsDarkMode = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isDarkMode) : val;
    dispatch(dashboardActions.setDarkMode(nextVal));
  };

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [pnlHistory, setPnlHistory] = useState<{ time: string; pnl: number }[]>([
    { time: '15:10', pnl: 1000 },
    { time: '15:15', pnl: 1100 },
    { time: '15:20', pnl: 950 },
    { time: '15:25', pnl: 1200 },
    { time: '15:30', pnl: 1150 }
  ]);

  useEffect(() => {
    if (!isLoggedIn) {
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    } else if (user) {
      if (location.pathname === '/login' || location.pathname === '/') {
        if (user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
          dispatch(dashboardActions.setActiveTab('admin_dashboard'));
        } else {
          navigate('/user/dashboard', { replace: true });
          dispatch(dashboardActions.setActiveTab('user_dashboard'));
        }
      } else {
        if (user.role === 'admin') {
          if (!activeTab.startsWith('admin_')) {
            navigate('/admin/dashboard', { replace: true });
            dispatch(dashboardActions.setActiveTab('admin_dashboard'));
          }
        } else {
          if (!activeTab.startsWith('user_')) {
            navigate('/user/dashboard', { replace: true });
            dispatch(dashboardActions.setActiveTab('user_dashboard'));
          }
        }
      }
    }
  }, [isLoggedIn, user?.role, location.pathname]);

  // Live prices
  const [ticks, setTicks] = useState<Record<string, number>>({
    'NIFTY 50': 24350.25,
    'RELIANCE': 2460.50,
    'BTC/USDT': 64520.00,
    'ETH/USDT': 3450.75
  });

  // Keep track of tick directions for green/red flash animation
  const [tickDirections, setTickDirections] = useState<Record<string, 'up' | 'down' | 'neutral'>>({});
  const lastTicksRef = useRef<Record<string, number>>({ ...ticks });

  // WebSockets and connection state
  const isConnected = useAppSelector(state => state.dashboard.isConnected);
  const isConnecting = useAppSelector(state => state.dashboard.isConnecting);

  const setIsConnected = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isConnected) : val;
    dispatch(dashboardActions.setConnectionState({ connected: nextVal, connecting: isConnecting }));
  };

  const setIsConnecting = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isConnecting) : val;
    dispatch(dashboardActions.setConnectionState({ connected: isConnected, connecting: nextVal }));
  };
  
  // Toast notifications state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Add credentials form state
  const [showAddCredModal, setShowAddCredModal] = useState(false);
  const [newCred, setNewCred] = useState({
    broker: 'Zerodha Kite',
    name: '',
    apiKey: '',
    apiSecret: '',
    userId: '',
    totpSecret: ''
  });

  // Simulated OAuth flow state
  const [isOAuthSimulating, setIsOAuthSimulating] = useState(false);
  const [oauthStep, setOauthStep] = useState(0); // 0: idle, 1: connecting, 2: verifying, 3: success

  // Strategy Configuration Modal State
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);

  // Search and Filters
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');
  const [logSearch, setLogSearch] = useState('');

  // User & Risk Management States
  const [customMultiplier, setCustomMultiplier] = useState('');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');

  // Personalized Risk & Parameter States
  const [riskDefaultLotSize, setRiskDefaultLotSize] = useState('1');
  const [riskDailyLimit, setRiskDailyLimit] = useState('10000');
  const [riskStopLoss, setRiskStopLoss] = useState('2.0');
  const [riskTarget, setRiskTarget] = useState('4.0');
  const [riskMaxTrades, setRiskMaxTrades] = useState('5');
  const [isUpdatingRiskSettings, setIsUpdatingRiskSettings] = useState(false);

  // New Admin & User Dashboard tabs states
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [paymentsList, setPaymentsList] = useState<PaymentRecord[]>([]);
  const [signalsList, setSignalsList] = useState<TradingSignal[]>([]);
  const [auditLogsList, setAuditLogsList] = useState<AuditLogEntry[]>([]);

  const [subscriptionViewMode, setSubscriptionViewMode] = useState<'table' | 'grid'>('table');
  const [brokerViewMode, setBrokerViewMode] = useState<'table' | 'grid'>('table');

  // Subscriptions Modal / Edit States
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [newPlanDuration, setNewPlanDuration] = useState('30');
  const [newPlanBillingCycle, setNewPlanBillingCycle] = useState('Monthly');
  const [newPlanMaxLot, setNewPlanMaxLot] = useState('2');
  const [newPlanMaxCapital, setNewPlanMaxCapital] = useState('100000');
  const [newPlanMaxOpenPositions, setNewPlanMaxOpenPositions] = useState('5');

  // Subscription View/Edit sheet states
  const [showViewPlanModal, setShowViewPlanModal] = useState(false);
  const [selectedPlanForView, setSelectedPlanForView] = useState<SubscriptionPlan | null>(null);

  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<SubscriptionPlan | null>(null);
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanPrice, setEditPlanPrice] = useState('');
  const [editPlanBillingCycle, setEditPlanBillingCycle] = useState('Monthly');
  const [editPlanDuration, setEditPlanDuration] = useState('30');
  const [editPlanMaxLot, setEditPlanMaxLot] = useState('2');
  const [editPlanMaxCapital, setEditPlanMaxCapital] = useState('100000');
  const [editPlanMaxOpenPositions, setEditPlanMaxOpenPositions] = useState('5');

  // Signals Modal / Broadcast States
  const [showBroadcastSignalModal, setShowBroadcastSignalModal] = useState(false);
  const [sigInstrument, setSigInstrument] = useState('NIFTY 50');
  const [sigType, setSigType] = useState<'BUY' | 'SELL'>('BUY');
  const [sigPrice, setSigPrice] = useState('24350.25');

  // User subscription assign states
  const [selectedUserForPlan, setSelectedUserForPlan] = useState<User | null>(null);
  const [showAssignPlanModal, setShowAssignPlanModal] = useState(false);
  const [assignedPlanId, setAssignedPlanId] = useState('');
  // User View, Edit & Delete Modal States
  const [selectedUserForView, setSelectedUserForView] = useState<User | null>(null);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState<'admin' | 'user'>('user');
  const [editUserMultiplier, setEditUserMultiplier] = useState('1.0');
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<User | null>(null);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);

  // Broker View/Edit/Delete states
  const [showViewBrokerModal, setShowViewBrokerModal] = useState(false);
  const [selectedBrokerForView, setSelectedBrokerForView] = useState<any | null>(null);
  const [showEditBrokerModal, setShowEditBrokerModal] = useState(false);
  const [selectedBrokerForEdit, setSelectedBrokerForEdit] = useState<any | null>(null);
  const [editBrokerName, setEditBrokerName] = useState('');
  const [editBrokerId, setEditBrokerId] = useState('');
  const [showDeleteBrokerModal, setShowDeleteBrokerModal] = useState(false);
  const [selectedBrokerForDelete, setSelectedBrokerForDelete] = useState<any | null>(null);

  // Signal View/Delete states
  const [signalViewMode, setSignalViewMode] = useState<'table' | 'grid'>('table');
  const [showViewSignalModal, setShowViewSignalModal] = useState(false);
  const [selectedSignalForView, setSelectedSignalForView] = useState<TradingSignal | null>(null);
  const [showDeleteSignalModal, setShowDeleteSignalModal] = useState(false);
  const [selectedSignalForDelete, setSelectedSignalForDelete] = useState<TradingSignal | null>(null);

  // User Demat Connection form inputs
  const [brokerKey, setBrokerKey] = useState('');
  const [brokerSecret, setBrokerSecret] = useState('');
  const [brokerUserId, setBrokerUserId] = useState('');
  const [brokerTotp, setBrokerTotp] = useState('');
  const [brokerSelect, setBrokerSelect] = useState('zerodha');

  // Auto-trading toggle
  const [isAutoTradingOn, setIsAutoTradingOn] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    if (user?.riskSettings) {
      setRiskDefaultLotSize(user.riskSettings.defaultLotSize?.toString() || '1');
      setRiskDailyLimit(user.riskSettings.dailyRiskLimit?.toString() || '10000');
      setRiskStopLoss(user.riskSettings.stopLossPct?.toString() || '2.0');
      setRiskTarget(user.riskSettings.targetPct?.toString() || '4.0');
      setRiskMaxTrades(user.riskSettings.maxOpenTrades?.toString() || '5');
    }
  }, [user]);

  const handleUpdateRiskSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingRiskSettings(true);

    const body = {
      defaultLotSize: parseFloat(riskDefaultLotSize) || 1,
      dailyRiskLimit: parseFloat(riskDailyLimit) || 10000,
      stopLossPct: parseFloat(riskStopLoss) || 2.0,
      targetPct: parseFloat(riskTarget) || 4.0,
      maxOpenTrades: parseInt(riskMaxTrades) || 5
    };

    if (!isConnected) {
      const updatedUser = { ...user!, riskSettings: body };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      addToast('success', 'Risk Settings Updated (Offline)', 'Applied configuration to local sandbox.');
      setIsUpdatingRiskSettings(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/risk-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        const updatedUser = { ...user!, riskSettings: data.riskSettings };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        addToast('success', 'Risk Controls Configured', 'Successfully updated server-side risk parameters.');
      } else {
        const err = await response.json();
        addToast('error', 'Update Failed', err.error || 'Server error occurred.');
      }
    } catch (e) {
      console.error(e);
      addToast('error', 'Connection Error', 'Could not reach server to update risk controls.');
    } finally {
      setIsUpdatingRiskSettings(false);
    }
  };

  const handleUpdateLotMultiplier = async (val: number) => {
    if (isNaN(val) || val <= 0) return;
    
    // Offline simulation fallback
    if (!isConnected) {
      const updatedUser = { ...user!, lotMultiplier: val };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      addToast('success', 'Risk Settings Updated', `Lot size multiplier set to ${val}x (Offline Mode)`);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ lotMultiplier: val })
      });
      if (response.ok) {
        const data = await response.json();
        const updatedUser = { ...user!, lotMultiplier: data.lotMultiplier };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        addToast('success', 'Risk Settings Updated', `Lot size multiplier successfully set to ${data.lotMultiplier}x`);
      }
    } catch (e) {
      console.error(e);
      addToast('error', 'Update Failed', 'Failed to update multiplier settings on backend.');
    }
  };

  const getPlanBillingCycleText = (plan: SubscriptionPlan) => {
    if (plan.billingCycle) {
      return plan.billingCycle;
    }
    switch (plan.durationDays) {
      case 30: return 'Monthly';
      case 90: return 'Quarterly';
      case 180: return 'Half-Yearly';
      case 365: return 'Yearly';
      default: return `${plan.durationDays} Days`;
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName || !newPlanPrice || !newPlanDuration) return;

    const body = {
      name: newPlanName,
      price: parseFloat(newPlanPrice),
      durationDays: parseInt(newPlanDuration),
      maxLotLimit: parseInt(newPlanMaxLot),
      maxCapital: parseFloat(newPlanMaxCapital),
      maxOpenPositions: parseInt(newPlanMaxOpenPositions),
      billingCycle: newPlanBillingCycle === 'Custom' ? `${newPlanDuration} Days` : newPlanBillingCycle
    };

    if (!isConnected) {
      const mockPlan: SubscriptionPlan = {
        id: 'plan_' + Date.now(),
        ...body,
        status: 'active'
      };
      setPlans(prev => [...prev, mockPlan]);
      setShowAddPlanModal(false);
      setNewPlanName('');
      setNewPlanPrice('');
      addToast('success', 'Plan Created (Offline)', `Mock plan ${newPlanName} created.`);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/subscription-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setShowAddPlanModal(false);
        setNewPlanName('');
        setNewPlanPrice('');
      } else {
        const err = await response.json();
        addToast('error', 'Failed to Create Plan', err.error || 'Server error.');
      }
    } catch (err) {
      addToast('error', 'Connection Error', 'Could not reach server.');
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!isConnected) {
      setPlans(prev => prev.filter(p => p.id !== id));
      addToast('warning', 'Plan Deleted (Offline)', 'Removed locally.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/subscription-plans/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        const err = await response.json();
        addToast('error', 'Delete Failed', err.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openViewPlanDrawer = (plan: SubscriptionPlan) => {
    setSelectedPlanForView(plan);
    setShowViewPlanModal(true);
  };

  const openEditPlanDrawer = (plan: SubscriptionPlan) => {
    setSelectedPlanForEdit(plan);
    setEditPlanName(plan.name);
    setEditPlanPrice(plan.price.toString());
    setEditPlanMaxLot(plan.maxLotLimit.toString());
    setEditPlanMaxCapital(plan.maxCapital.toString());
    setEditPlanMaxOpenPositions(plan.maxOpenPositions.toString());
    
    let cycle = plan.billingCycle || 'Monthly';
    if (cycle !== 'Monthly' && cycle !== 'Quarterly' && cycle !== 'Half-Yearly' && cycle !== 'Yearly') {
      setEditPlanBillingCycle('Custom');
    } else {
      setEditPlanBillingCycle(cycle);
    }
    setEditPlanDuration(plan.durationDays.toString());
    
    setShowEditPlanModal(true);
  };

  const handleUpdatePlanDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForEdit || !editPlanName || !editPlanPrice || !editPlanDuration) return;

    const body = {
      id: selectedPlanForEdit.id,
      name: editPlanName,
      price: parseFloat(editPlanPrice),
      durationDays: parseInt(editPlanDuration),
      maxLotLimit: parseInt(editPlanMaxLot),
      maxCapital: parseFloat(editPlanMaxCapital),
      maxOpenPositions: parseInt(editPlanMaxOpenPositions),
      billingCycle: editPlanBillingCycle === 'Custom' ? `${editPlanDuration} Days` : editPlanBillingCycle
    };

    if (!isConnected) {
      setPlans(prev => prev.map(p => p.id === selectedPlanForEdit.id ? { ...p, ...body } : p));
      setShowEditPlanModal(false);
      addToast('success', 'Plan Updated (Offline)', `Plan ${editPlanName} updated locally.`);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/subscription-plans/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setShowEditPlanModal(false);
        addToast('success', 'Plan Template Updated', `Successfully updated plan "${editPlanName}"`);
      } else {
        const err = await response.json();
        addToast('error', 'Failed to Update Plan', err.error || 'Server error.');
      }
    } catch (err) {
      addToast('error', 'Connection Error', 'Could not reach server.');
    }
  };

  const handleToggleBroker = async (id: string) => {
    if (!isConnected) {
      setBrokers(prev => prev.map(b => b.id === id ? { ...b, enabled: !b.enabled, status: !b.enabled ? 'active' : 'inactive' } : b));
      addToast('info', 'Broker Toggled (Offline)', 'Toggled state locally.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/brokers/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        const err = await response.json();
        addToast('error', 'Broker Update Failed', err.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBrokerName) {
      addToast('error', 'Validation Error', 'Broker Name is required.');
      return;
    }

    if (!isConnected) {
      setBrokers(prev => prev.map(b => b.id === editBrokerId ? { ...b, name: editBrokerName } : b));
      setShowEditBrokerModal(false);
      addToast('success', 'Broker Updated (Offline)', 'Updated locally.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/brokers/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ id: editBrokerId, name: editBrokerName })
      });

      if (response.ok) {
        setShowEditBrokerModal(false);
        addToast('success', 'Broker Updated', 'Successfully updated broker template details.');
      } else {
        const err = await response.json();
        addToast('error', 'Update Failed', err.error);
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Connection Error', 'Could not save changes.');
    }
  };

  const handleDeleteBroker = async (id: string) => {
    if (!isConnected) {
      setBrokers(prev => prev.filter(b => b.id !== id));
      setShowDeleteBrokerModal(false);
      addToast('success', 'Broker Deleted (Offline)', 'Removed template locally.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/brokers/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        setShowDeleteBrokerModal(false);
        addToast('success', 'Broker Deleted', 'Broker gateway configuration deleted successfully.');
      } else {
        const err = await response.json();
        addToast('error', 'Deletion Failed', err.error);
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Connection Error', 'Could not delete broker.');
    }
  };

  const handleDeleteSignal = async (id: string) => {
    if (!isConnected) {
      setSignalsList(prev => prev.filter(s => s.id !== id));
      setShowDeleteSignalModal(false);
      addToast('success', 'Signal Deleted (Offline)', 'Removed signal locally.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/signals/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        setShowDeleteSignalModal(false);
        addToast('success', 'Signal Deleted', 'Trading signal deleted successfully.');
      } else {
        const err = await response.json();
        addToast('error', 'Deletion Failed', err.error);
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Connection Error', 'Could not delete signal.');
    }
  };

  const handleBroadcastSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sigInstrument || !sigPrice) return;

    const body = {
      instrument: sigInstrument,
      type: sigType,
      price: parseFloat(sigPrice)
    };

    if (!isConnected) {
      const mockSig: TradingSignal = {
        id: 'SIG' + Date.now(),
        instrument: sigInstrument,
        type: sigType,
        price: parseFloat(sigPrice),
        time: new Date().toISOString(),
        status: 'executed'
      };
      setSignalsList(prev => [mockSig, ...prev]);
      setShowBroadcastSignalModal(false);
      addToast('success', 'Signal Broadcasted (Offline)', `Mock ${sigType} signal sent.`);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/signals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setShowBroadcastSignalModal(false);
      } else {
        const err = await response.json();
        addToast('error', 'Broadcast Failed', err.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmergencySquareOff = async () => {
    if (!isConnected) {
      addToast('error', 'Emergency Square-Off', 'Initiated offline emergency square off.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/square-off`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        addToast('success', 'Square-Off Successful', `Terminated ${data.countSquaredOff} active trades.`);
      } else {
        const err = await response.json();
        addToast('error', 'Emergency Call Failed', err.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetUserApi = async (userId: string) => {
    if (!isConnected) {
      addToast('warning', 'API Reset (Offline)', `Removed API parameters locally for User: ${userId}`);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/reset-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ id: userId })
      });
      if (response.ok) {
        addToast('warning', 'API Reset Successful', `Removed API parameters & severed live execution session for User: ${userId}`);
      } else {
        const err = await response.json();
        addToast('error', 'Reset API Failed', err.error || 'Server error');
      }
    } catch (e) {
      addToast('error', 'Reset API Failed', 'Network error');
    }
  };

  const handleAssignPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPlan || !assignedPlanId) return;
    const plan = plans.find(p => p.id === assignedPlanId);
    if (!isConnected) {
      addToast('success', 'Plan Assigned (Offline)', `Assigned plan ${plan?.name || assignedPlanId} to user ${selectedUserForPlan.name}`);
      setShowAssignPlanModal(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/assign-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ userId: selectedUserForPlan.id, planId: assignedPlanId })
      });
      if (response.ok) {
        // Update user state locally
        setUsersList(prev => prev.map(u => u.id === selectedUserForPlan.id ? { ...u, planId: assignedPlanId } : u));
        addToast('success', 'Plan Assigned Successfully', `Assigned plan ${plan?.name || assignedPlanId} to user ${selectedUserForPlan.name}`);
        setShowAssignPlanModal(false);
      } else {
        const err = await response.json();
        addToast('error', 'Assign Plan Failed', err.error || 'Server error');
      }
    } catch (e) {
      addToast('error', 'Assign Plan Failed', 'Network error');
    }
  };
  
  const handleConnectDemat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerUserId || !brokerKey) return;
    const mockCred: Credential = {
      id: Date.now().toString(),
      broker: brokerSelect === 'zerodha' ? 'Zerodha Kite' : brokerSelect === 'angelone' ? 'Angel One' : brokerSelect === 'upstox' ? 'Upstox' : 'Dhan',
      name: `${user?.name || 'User'}'s Demat`,
      apiKey: brokerKey,
      userId: brokerUserId,
      status: 'connected',
      lastConnected: new Date().toISOString(),
      funds: 125000,
      margin: 45000,
      holdings: 85000,
      accessToken: 'token_' + Math.random().toString(36).slice(2)
    };
    setCredentials(prev => [...prev, mockCred]);
    addToast('success', 'Broker Session Authenticated', `Successfully linked broker ${mockCred.broker}`);
    setBrokerKey('');
    setBrokerSecret('');
    setBrokerUserId('');
    setBrokerTotp('');
  };
  
  const handleDisconnectBroker = (id: string) => {
    setCredentials(prev => prev.filter(c => c.id !== id));
    addToast('warning', 'Broker Disconnected', 'Demat API link severed successfully');
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsersList(data);
        return;
      }
    } catch (e) {
      console.error('Failed to fetch users from server:', e);
    }
    // Fallback: if server unreachable, show mock data
    setUsersList([
      { id: 'u1', name: 'Terminal Admin', email: 'admin@back.com', role: 'admin', lotMultiplier: 1.0, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), lastLogin: new Date().toISOString() },
      { id: 'u2', name: 'Mani Sharma', email: 'user@back.com', role: 'user', lotMultiplier: 1.0, createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), lastLogin: new Date(Date.now() - 3600000).toISOString() }
    ]);
  };

  useEffect(() => {
    if (isLoggedIn && activeTab === 'admin_users') {
      fetchUsers();
    }
  }, [isLoggedIn, activeTab]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword || !newUserRole) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole
        })
      });

      if (response.ok) {
        addToast('success', 'User Created', `Successfully generated profile for ${newUserName}`);
        setShowAddUserModal(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        fetchUsers();
      } else {
        const err = await response.json();
        addToast('error', 'Creation Failed', err.error || 'Server error occurred.');
      }
    } catch (e) {
      // Fallback: server unreachable, create locally
      const mockNewUser: User = {
        id: 'u' + Date.now(),
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        lotMultiplier: 1.0,
        createdAt: new Date().toISOString()
      };
      setUsersList(prev => [...prev, mockNewUser]);
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      addToast('warning', 'User Created (Offline)', `Account for ${newUserName} saved locally only.`);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    if (userId === user?.id) {
      addToast('error', 'Action Prohibited', 'You cannot suspend your own administrative session.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ id: userId })
      });
      if (response.ok) {
        addToast('success', 'User Status Updated', 'Modified authorization status successfully.');
        fetchUsers();
      }
    } catch (e) {
      setUsersList(prev =>
        prev.map(u =>
          u.id === userId
            ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' }
            : u
        )
      );
      addToast('warning', 'Account Modified (Offline)', 'Toggled user authorization status locally.');
    }
  };

  const handleUpdateUserDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          id: selectedUserForEdit.id,
          name: editUserName,
          email: editUserEmail,
          role: editUserRole,
          lotMultiplier: parseFloat(editUserMultiplier) || 1.0
        })
      });

      if (response.ok) {
        addToast('success', 'User Updated', `Successfully updated profile details for ${editUserName}`);
        setShowEditUserModal(false);
        fetchUsers();
      } else {
        const err = await response.json();
        addToast('error', 'Update Failed', err.error || 'Server error occurred.');
      }
    } catch (e) {
      // Fallback: update locally
      setUsersList(prev =>
        prev.map(u =>
          u.id === selectedUserForEdit.id
            ? { ...u, name: editUserName, email: editUserEmail, role: editUserRole, lotMultiplier: parseFloat(editUserMultiplier) || 1.0 }
            : u
        )
      );
      setShowEditUserModal(false);
      addToast('warning', 'User Updated (Offline)', `Profile updates saved locally only.`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      addToast('error', 'Action Prohibited', 'You cannot delete your own administrative session.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ id: userId })
      });

      if (response.ok) {
        addToast('success', 'User Deleted', 'Successfully purged user account from records.');
        setShowDeleteUserModal(false);
        fetchUsers();
      } else {
        const err = await response.json();
        addToast('error', 'Deletion Failed', err.error || 'Server error occurred.');
      }
    } catch (e) {
      // Fallback: delete locally
      setUsersList(prev => prev.filter(u => u.id !== userId));
      setShowDeleteUserModal(false);
      addToast('warning', 'User Deleted (Offline)', 'Removed user profile record locally.');
    }
  };

  // Handle Dark Mode toggle effect on HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle role-user class on HTML element for dynamic theme color
  useEffect(() => {
    if (isLoggedIn && user?.role === 'user') {
      document.documentElement.classList.add('role-user');
    } else {
      document.documentElement.classList.remove('role-user');
    }
  }, [isLoggedIn, user?.role]);

  // Add Toast Notification helper
  const addToast = (type: Toast['type'], title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    const toast: Toast = { id, type, title, message, timestamp: new Date().toLocaleTimeString() };
    setToasts(prev => [toast, ...prev].slice(0, 5));
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Connect to websocket server
  useEffect(() => {
    if (!isLoggedIn) return;

    let ws: WebSocket;
    let reconnectTimeout: any;

    const connectWS = () => {
      setIsConnecting(true);
      // Backend is on port 5000 - pass token in query parameter for security verification
      ws = new WebSocket(`${WS_BASE_URL}?token=${authToken}`);

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        addToast('success', 'Backend Connected', 'Real-time market feeds & bot connection active');
      };

      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        const { type, data } = payload;

        switch (type) {
          case 'INIT':
            setStrategies(data.strategies);
            setCredentials(data.credentials);
            setTrades(data.trades);
            setLogs(data.logs);
            setOverallPnl(data.overallPnl);
            if (data.subscriptionPlans) setPlans(data.subscriptionPlans);
            if (data.supportedBrokers) setBrokers(data.supportedBrokers);
            if (data.payments) setPaymentsList(data.payments);
            if (data.signals) setSignalsList(data.signals);
            if (data.auditLogs) setAuditLogsList(data.auditLogs);
            // Populate initial P&L history
            if (data.overallPnl !== undefined) {
              setPnlHistory(prev => {
                const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                return [...prev.slice(-15), { time: now, pnl: data.overallPnl }];
              });
            }
            break;

          case 'TICKS':
            setTickDirections(prevDirs => {
              const newDirs: Record<string, 'up' | 'down' | 'neutral'> = {};
              Object.keys(data).forEach(key => {
                const prevPrice = lastTicksRef.current[key] || data[key];
                if (data[key] > prevPrice) {
                  newDirs[key] = 'up';
                } else if (data[key] < prevPrice) {
                  newDirs[key] = 'down';
                } else {
                  newDirs[key] = prevDirs[key] || 'neutral';
                }
              });
              return newDirs;
            });
            lastTicksRef.current = { ...data };
            setTicks(data);
            break;

          case 'STRATEGY_TOGGLED':
            setStrategies(prev => prev.map(s => s.id === data.id ? data : s));
            addToast(
              data.status === 'active' ? 'success' : 'warning',
              data.status === 'active' ? 'Strategy Started' : 'Strategy Stopped',
              `${data.name} is now ${data.status === 'active' ? 'monitoring the markets' : 'paused'}`
            );
            break;

          case 'CREDENTIAL_ADDED':
            setCredentials(prev => [...prev, data]);
            addToast('success', 'API Connected', `Connected to ${data.broker} successfully`);
            break;

          case 'CREDENTIAL_DELETED':
            setCredentials(prev => prev.filter(c => c.id !== data));
            addToast('warning', 'API Deleted', 'Broker credentials removed successfully');
            break;

          case 'TRADE_EXECUTED':
            // Append trade
            setTrades(prev => [data.trade, ...prev].slice(0, 100));
            // Update strategies state
            setStrategies(prev => prev.map(s => s.id === data.strategy.id ? data.strategy : s));
            // Update total P&L
            setOverallPnl(data.overallPnl);
            // Add P&L to history
            setPnlHistory(prev => {
              const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              return [...prev.slice(-15), { time: now, pnl: data.overallPnl }];
            });
            // Show custom toast notification
            addToast(
              data.trade.type === 'BUY' ? 'info' : (data.trade.pnl >= 0 ? 'success' : 'error'),
              `${data.trade.type === 'BUY' ? 'BUY Order Filled' : 'SELL Order Filled'}`,
              `${data.trade.strategyName} executed ${data.trade.quantity} ${data.trade.instrument} @ ${data.trade.price.toLocaleString()}`
            );
            break;

          case 'NEW_LOG':
            setLogs(prev => [data, ...prev].slice(0, 200));
            break;

          case 'SUBSCRIPTION_PLAN_ADDED':
            setPlans(prev => [...prev, data]);
            addToast('success', 'Plan Created', `Subscription plan '${data.name}' has been created`);
            break;

          case 'SUBSCRIPTION_PLAN_DELETED':
            setPlans(prev => prev.filter(p => p.id !== data));
            addToast('warning', 'Plan Deleted', 'Subscription plan was removed from catalog.');
            break;

          case 'BROKER_TOGGLED':
            setBrokers(prev => prev.map(b => b.id === data.id ? data : b));
            addToast('info', 'Broker Modified', `${data.name} is now ${data.enabled ? 'Enabled' : 'Disabled'}`);
            break;

          case 'BROKERS_UPDATED':
            setBrokers(data);
            break;

          case 'SIGNAL_BROADCASTED':
            setSignalsList(prev => [data, ...prev]);
            addToast('success', 'Signal Alert', `New ${data.type} signal broadcasted on ${data.instrument}`);
            break;

          case 'SIGNALS_UPDATED':
            setSignalsList(data);
            break;

          case 'SQUARE_OFF_ALL':
            addToast('error', 'Emergency Stop', `Emergency Square-Off initiated. Squared off ${data.count} position(s).`);
            break;

          case 'USER_PLAN_UPDATED':
            if (user && user.id === data.userId) {
              setUser(prev => prev ? { ...prev, planId: data.planId } : null);
            }
            setUsersList(prev => prev.map(u => u.id === data.userId ? { ...u, planId: data.planId } : u));
            break;

          case 'CREDENTIALS_RESET_FOR_USER':
            if (user && user.id === data.userId) {
              setCredentials([]);
            }
            break;

          case 'USER_SETTINGS_UPDATED':
            if (user && user.id === data.userId) {
              setUser(prev => prev ? { ...prev, lotMultiplier: data.lotMultiplier } : null);
            }
            setUsersList(prev => prev.map(u => u.id === data.userId ? { ...u, lotMultiplier: data.lotMultiplier } : u));
            break;

          case 'USER_RISK_SETTINGS_UPDATED':
            if (user && user.id === data.userId) {
              setUser(prev => prev ? { ...prev, riskSettings: data.riskSettings } : null);
            }
            setUsersList(prev => prev.map(u => u.id === data.userId ? { ...u, riskSettings: data.riskSettings } : u));
            break;

          default:
            break;
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        // Retry connection after 5 seconds
        reconnectTimeout = setTimeout(connectWS, 5000);
      };

      ws.onerror = () => {
        setIsConnected(false);
        setIsConnecting(false);
        ws.close();
      };
    };

    connectWS();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [isLoggedIn, authToken]);

  // Auth Handler: Login
  // Auth Handler: Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
      }

      const data = await response.json();
      if (data.success) {
        dispatch(dashboardActions.setAuth({ token: data.token, user: data.user }));
        addToast('success', 'Welcome Back', `Logged in as ${data.user.name}`);
      }
    } catch (err: any) {
      console.error(err);
      // Local fallback simulation if server is offline
      if (authEmail === 'admin@back.com' && authPassword === 'Test@123') {
        const fallbackUser: User = {
          id: 'u1',
          name: 'Terminal Admin',
          email: 'admin@back.com',
          role: 'admin',
          lotMultiplier: 1.0
        };
        const fallbackToken = 'blackrox_jwt_mock_token_admin@back.com';
        dispatch(dashboardActions.setAuth({ token: fallbackToken, user: fallbackUser }));
        addToast('success', 'Logged In (Offline Mode)', 'Authenticated successfully via local credentials.');
      } else if (authEmail === 'user@back.com' && authPassword === 'Test@123') {
        const fallbackUser: User = {
          id: 'u2',
          name: 'Mani Sharma',
          email: 'user@back.com',
          role: 'user',
          lotMultiplier: 1.0
        };
        const fallbackToken = 'blackrox_jwt_mock_token_user@back.com';
        dispatch(dashboardActions.setAuth({ token: fallbackToken, user: fallbackUser }));
        addToast('success', 'Logged In (Offline Mode)', 'Authenticated successfully via local credentials.');
      } else {
        setAuthError(err.message || 'Invalid email or password');
        addToast('error', 'Auth Failed', err.message || 'Invalid credentials');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Auth Handler: Logout
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setAuthToken(null);
    setUser(null);
    setIsLoggedIn(false);
    setIsConnected(false);
    addToast('warning', 'Session Closed', 'You have been logged out of the terminal.');
  };

  // API Call: Toggle Strategy status
  const handleToggleStrategy = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/strategies/toggle`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ id })
      });
      if (!response.ok) throw new Error('Failed to toggle strategy');
    } catch (error) {
      addToast('error', 'Action Failed', 'Failed to toggle strategy. Backend might be unreachable.');
      // Local fallback simulation if server is disconnected
      if (!isConnected) {
        setStrategies(prev =>
          prev.map(s => {
            if (s.id === id) {
              const nextStatus = s.status === 'active' ? 'inactive' : 'active';
              addToast(nextStatus === 'active' ? 'success' : 'warning', 'Mock strategy status updated', `${s.name} is now ${nextStatus}`);
              return { ...s, status: nextStatus };
            }
            return s;
          })
        );
      }
    }
  };

  // Simulated OAuth flow for Demat Accounts
  const simulateOAuthLogin = () => {
    if (!newCred.userId || !newCred.name) {
      addToast('warning', 'Missing Fields', 'Please enter Connection Name and Client ID/User ID first.');
      return;
    }
    
    setIsOAuthSimulating(true);
    setOauthStep(1); // Connecting to broker API
    
    setTimeout(() => {
      setOauthStep(2); // Redirecting & verifying 2FA TOTP
      setTimeout(() => {
        setOauthStep(3); // Generating access tokens
        setTimeout(() => {
          const generatedToken = newCred.broker.toLowerCase().replace(' ', '_') + '_tok_' + Math.random().toString(36).substring(2, 9).toUpperCase();
          const generatedSecret = 'sec_' + Math.random().toString(36).substring(2, 15);
          
          setNewCred(prev => ({
            ...prev,
            apiKey: generatedToken,
            apiSecret: generatedSecret,
            totpSecret: prev.totpSecret || 'JBSWY3DPEHPK3PXP'
          }));
          
          setIsOAuthSimulating(false);
          setOauthStep(0);
          addToast('success', 'Demat API Authorized', `Successfully linked with ${newCred.broker} Secure Login API!`);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  // API Call: Add API Credentials
  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCred.name || !newCred.apiKey || !newCred.userId) {
      addToast('warning', 'Missing Fields', 'Please fill out all required fields or use the OAuth button to authenticate.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/credentials`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(newCred)
      });
      if (!response.ok) throw new Error('Failed to add credential');
      
      setShowAddCredModal(false);
      setNewCred({ broker: 'Zerodha Kite', name: '', apiKey: '', apiSecret: '', userId: '', totpSecret: '' });
    } catch (error) {
      addToast('error', 'Connection Error', 'Could not save credentials to backend server.');
      // Local fallback simulation if server is disconnected
      if (!isConnected) {
        const mockNew: Credential = {
          id: Date.now().toString(),
          broker: newCred.broker,
          name: newCred.name,
          apiKey: newCred.apiKey.slice(0, 5) + '...' + newCred.apiKey.slice(-3),
          userId: newCred.userId,
          status: 'connected',
          lastConnected: new Date().toISOString(),
          funds: parseFloat((50000 + Math.random() * 150000).toFixed(2)),
          margin: parseFloat((10000 + Math.random() * 30000).toFixed(2)),
          holdings: parseFloat((80000 + Math.random() * 500000).toFixed(2)),
          clientName: 'Mani Sharma',
          totpSecret: newCred.totpSecret || 'JBSWY3DPEHPK3PXP',
          accessToken: newCred.broker.toLowerCase().replace(' ', '') + '_acc_' + Math.random().toString(36).substring(2, 10)
        };
        setCredentials(prev => [...prev, mockNew]);
        setShowAddCredModal(false);
        setNewCred({ broker: 'Zerodha Kite', name: '', apiKey: '', apiSecret: '', userId: '', totpSecret: '' });
        addToast('success', 'Mock API Saved', 'Running in offline simulation mode.');
      }
    }
  };

  // API Call: Delete API Credentials
  const handleDeleteCredential = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/credentials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete credentials');
    } catch (error) {
      addToast('error', 'Action Failed', 'Failed to delete credentials.');
      // Local fallback
      if (!isConnected) {
        setCredentials(prev => prev.filter(c => c.id !== id));
        addToast('warning', 'Mock API Deleted', 'Removed in offline mode.');
      }
    }
  };

  // SVG Chart points calculator
  const getChartPoints = () => {
    if (pnlHistory.length === 0) return '';
    const height = 180;
    const padding = 15;
    
    const pnls = pnlHistory.map(h => h.pnl);
    const minPnl = Math.min(...pnls, 0) - 100;
    const maxPnl = Math.max(...pnls, 500) + 100;
    const range = maxPnl - minPnl || 1;

    const points = pnlHistory.map((h, i) => {
      // Inline SVGs need actual dimensions, width is 600
      const x = padding + (i / (pnlHistory.length - 1)) * (600 - padding * 2);
      const y = height - padding - ((h.pnl - minPnl) / range) * (height - padding * 2);
      return `${x},${y}`;
    });

    return points.join(' ');
  };

  const getChartAreaPoints = () => {
    const pointsStr = getChartPoints();
    if (!pointsStr) return '';
    const height = 180;
    const padding = 15;

    const pointsArray = pointsStr.split(' ');
    const firstPoint = pointsArray[0].split(',');
    const lastPoint = pointsArray[pointsArray.length - 1].split(',');

    return `${firstPoint[0]},${height - padding} ${pointsStr} ${lastPoint[0]},${height - padding}`;
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = logFilter === 'all' || log.type === logFilter;
    const matchesSearch = log.message.toLowerCase().includes(logSearch.toLowerCase()) || 
                          log.source.toLowerCase().includes(logSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Render Login page if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground flex font-sans antialiased transition-colors duration-300 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-screen">
          {/* Left panel: Login Form */}
          <div className="col-span-1 flex flex-col justify-between p-8 md:p-12 lg:p-16 relative bg-background">
            
            {/* Theme toggler inside login */}
            <div className="absolute top-8 right-8">
              <button
                onClick={() => setIsDarkMode(prev => !prev)}
                className="p-2 border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer rounded-none"
                title="Toggle theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex flex-col items-start">
              <div className="w-10 h-10 bg-primary flex items-center justify-center text-primary-foreground font-black text-xl select-none rounded-none shadow-sm">
                B
              </div>
              <span className="text-[9px] tracking-[0.25em] font-bold text-primary mt-2 select-none">
                BLACKROX
              </span>
            </div>
 
            {/* Login Center Form */}
            <div className="w-full max-w-[320px] mx-auto my-auto py-12 flex flex-col justify-center">
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">
                Login to your account
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                Enter your email below to login to your account
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                {authError && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-none flex items-center gap-2 font-semibold">
                    <XCircle className="w-4 h-4 shrink-0" />
                    {authError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="m@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-none px-4 py-2 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                      Password
                    </label>
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault();
                        addToast('info', 'Forgot Password', 'Password recovery is managed by your organization administrator.');
                      }}
                      className="text-xs text-foreground font-bold hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-none px-4 py-2 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded-none border-border bg-background w-4 h-4 cursor-pointer accent-primary"
                    />
                    Remember me
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded-none border-border bg-background w-4 h-4 cursor-pointer accent-primary"
                    />
                    Enforce 2FA Authenticator Token
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-2.5 px-4 transition-colors select-none cursor-pointer flex items-center justify-center gap-2 rounded-none mt-6 shadow-lg shadow-primary/10"
                >
                  {isAuthLoading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    'Login'
                  )}
                </button>
              </form>

              {/* Demo Credentials Helper */}
              <div className="mt-8 pt-6 border-t border-border/40 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthEmail('admin@back.com');
                    setAuthPassword('Test@123');
                    addToast('info', 'Autofilled Credentials', 'Demo login credentials have been pre-filled.');
                  }}
                  className="text-xs uppercase font-bold tracking-wider text-primary bg-primary/10 hover:bg-primary/15 px-4 py-2 transition-all cursor-pointer inline-flex items-center gap-1.5 rounded-none"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Use Demo Account (Autofill)
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center lg:text-left">
              <p className="text-[10px] text-muted-foreground/60 select-none">
                © 2026 BlackRox Inc. All rights reserved. v0.0.1
              </p>
            </div>
          </div>

          {/* Right panel: Vibrant Brand Gradient & Minimal Glass Logo */}
          <div className="col-span-1 hidden lg:flex relative h-screen overflow-hidden bg-gradient-to-tr from-[#1e1b4b] via-[#581c87] to-[#9d174d] flex-col items-center justify-center p-12 border-l border-white/10">
            {/* Soft decorative light flares */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-white/10 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-primary/20 blur-[60px] pointer-events-none" />

            {/* Glowing Core Brand Emblem */}
            <div className="relative flex items-center justify-center w-72 h-72 z-10">
              {/* Concentric Glass Rings */}
              <div className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-[2px]" />
              <div className="absolute inset-6 rounded-full border border-white/15 bg-white/[0.03] backdrop-blur-[4px]" />
              <div className="absolute inset-12 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-[6px]" />

              {/* Floating Solid White Logo */}
              <div className="absolute w-28 h-28 bg-white text-[#581c87] flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform duration-500 rounded-none">
                <span className="text-[#9d174d] text-6xl font-black font-sans tracking-tighter select-none">B</span>
              </div>
            </div>

            {/* Platform Title */}
            <div className="mt-8 text-center space-y-1.5 z-10">
              <h3 className="text-xl font-black tracking-widest text-white uppercase font-sans">BLACKROX</h3>
              <p className="text-[10px] font-mono tracking-[0.25em] text-white/70 uppercase select-none">
                QUANTITATIVE TRADING PLATFORM
              </p>
            </div>

            {/* Bottom Info HUD */}
            <div className="absolute bottom-6 left-12 right-12 flex justify-between items-center text-[9px] font-mono text-white/40 select-none z-10">
              <span>SECURE NODE CONNECTION</span>
              <span>EST. 2026</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard terminal page
  return (
    <div className="h-screen overflow-hidden bg-background text-foreground flex font-sans select-none antialiased transition-colors duration-300">
      
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-none border backdrop-blur-xl shadow-2xl transition-all duration-300 transform translate-y-0 animate-slide-in-right ${
              toast.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300' :
              toast.type === 'error' ? 'bg-rose-950/80 border-rose-500/30 text-rose-300' :
              toast.type === 'warning' ? 'bg-amber-950/80 border-amber-500/30 text-amber-300' :
              'bg-card/90 border-border/50 text-primary'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 mt-0.5 text-rose-400 shrink-0" />}
            {toast.type === 'warning' && <Activity className="w-5 h-5 mt-0.5 text-amber-400 shrink-0" />}
            {toast.type === 'info' && <Bell className="w-5 h-5 mt-0.5 text-primary shrink-0" />}
            <div className="flex-1">
              <h4 className="font-semibold text-xs uppercase tracking-wider">{toast.title}</h4>
              <p className="text-sm mt-0.5 opacity-90 text-foreground">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <aside className="w-72 border-r border-border bg-background flex flex-col shrink-0 h-screen sticky top-0 hidden md:flex transition-colors duration-300">
        {/* Logo Branding inside Sidebar */}
        <div className="h-[73px] border-b border-border px-6 flex items-center gap-3 bg-background shrink-0">
          <div className="bg-primary p-2 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5 text-primary-foreground animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground leading-none">
              BlackRox <span className="text-primary font-semibold text-[9px] align-super ml-0.5">ALGO</span>
            </h1>
            <p className="text-[9px] text-muted-foreground mt-0.5">High-Frequency Algo Terminal</p>
          </div>
        </div>
        <div className="flex-1 py-4 px-3 flex flex-col gap-0.5 overflow-y-auto scrollbar-none">
          {user?.role === 'admin' ? (
            [
              { id: 'admin_dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'admin_users', label: 'User Management', icon: Users },
              { id: 'admin_subscriptions', label: 'Subscription Plans', icon: Briefcase },
              { id: 'admin_brokers', label: 'Broker Management', icon: KeyRound },
              { id: 'admin_trading', label: 'Trading Management', icon: Cpu },
              { id: 'admin_risk', label: 'Risk Management', icon: Sliders },
              { id: 'admin_signals', label: 'Signal Management', icon: Activity },
              { id: 'admin_payments', label: 'Payment Control', icon: CreditCard },
              { id: 'admin_reports', label: 'Reports & Sheets', icon: FileSpreadsheet },
              { id: 'admin_notifications', label: 'Notifications Center', icon: Bell },
              { id: 'admin_settings', label: 'System Settings', icon: Settings },
              { id: 'admin_audit', label: 'Audit Logs', icon: Terminal }
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 w-full px-3 py-3 rounded-none text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })
          ) : (
            [
              { id: 'user_dashboard', label: 'Dashboard Terminal', icon: LayoutDashboard },
              { id: 'user_broker', label: 'Broker Connection', icon: KeyRound },
              { id: 'user_subscription', label: 'Subscription Plan', icon: Briefcase },
              { id: 'user_trading_settings', label: 'Trading Settings', icon: Sliders },
              { id: 'user_orders_reports', label: 'Orders & Reports', icon: FileText },
              { id: 'user_profile', label: 'Profile & Security', icon: UserIcon }
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 w-full px-3 py-3.5 rounded-none text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })
          )}
        </div>

        <div className="p-6 border-t border-border flex flex-col gap-4 shrink-0">
            {user && (
              <div className="flex items-center gap-3 bg-muted/40 border border-border p-3 rounded-none">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary capitalize shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize font-semibold">{user.role} account</p>
                </div>
              </div>
            )}

            <div className="bg-card border border-border p-4 rounded-none">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Active Bots Capital</span>
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <p className="text-xl font-bold mt-1 text-foreground">
                ₹{strategies.filter(s => s.status === 'active').reduce((acc, s) => acc + s.capital, 0).toLocaleString()}
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-none border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              Sign Out Session
            </button>

            <div className="text-center">
              <p className="text-[10px] text-muted-foreground/60">v0.0.1 • Connected to local server</p>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer overlay */}
        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
              onClick={() => setShowMobileSidebar(false)}
            />
            {/* Drawer Content container */}
            <aside className="relative w-72 bg-background border-r border-border h-full flex flex-col animate-slide-in-right shadow-2xl z-10 transition-colors duration-300">
              {/* Close button inside sidebar header */}
              <div className="h-[73px] border-b border-border px-6 flex items-center justify-between bg-background shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-2 flex items-center justify-center shrink-0">
                    <Cpu className="w-5 h-5 text-primary-foreground animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-base font-bold tracking-tight text-foreground leading-none">
                      BlackRox <span className="text-primary font-semibold text-[9px] align-super ml-0.5">ALGO</span>
                    </h1>
                    <p className="text-[9px] text-muted-foreground mt-0.5">High-Frequency Algo Terminal</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-1 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              
              {/* Tab Items List */}
              <div className="flex-1 py-4 px-3 flex flex-col gap-0.5 overflow-y-auto scrollbar-none">
                {user?.role === 'admin' ? (
                  [
                    { id: 'admin_dashboard', label: 'Dashboard', icon: LayoutDashboard },
                    { id: 'admin_users', label: 'User Management', icon: Users },
                    { id: 'admin_subscriptions', label: 'Subscription Plans', icon: Briefcase },
                    { id: 'admin_brokers', label: 'Broker Management', icon: KeyRound },
                    { id: 'admin_trading', label: 'Trading Management', icon: Cpu },
                    { id: 'admin_risk', label: 'Risk Management', icon: Sliders },
                    { id: 'admin_signals', label: 'Signal Management', icon: Activity },
                    { id: 'admin_payments', label: 'Payment Control', icon: CreditCard },
                    { id: 'admin_reports', label: 'Reports & Sheets', icon: FileSpreadsheet },
                    { id: 'admin_notifications', label: 'Notifications Center', icon: Bell },
                    { id: 'admin_settings', label: 'System Settings', icon: Settings },
                    { id: 'admin_audit', label: 'Audit Logs', icon: Terminal }
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setShowMobileSidebar(false);
                        }}
                        className={`flex items-center gap-3 w-full px-3 py-3 rounded-none text-xs font-semibold transition-all duration-200 cursor-pointer ${
                          activeTab === item.id
                            ? 'bg-primary text-primary-foreground font-bold'
                            : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {item.label}
                      </button>
                    );
                  })
                ) : (
                  [
                    { id: 'user_dashboard', label: 'Dashboard Terminal', icon: LayoutDashboard },
                    { id: 'user_broker', label: 'Broker Connection', icon: KeyRound },
                    { id: 'user_subscription', label: 'Subscription Plan', icon: Briefcase },
                    { id: 'user_trading_settings', label: 'Trading Settings', icon: Sliders },
                    { id: 'user_orders_reports', label: 'Orders & Reports', icon: FileText },
                    { id: 'user_profile', label: 'Profile & Security', icon: UserIcon }
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setShowMobileSidebar(false);
                        }}
                        className={`flex items-center gap-3 w-full px-3 py-3.5 rounded-none text-xs font-semibold transition-all duration-200 cursor-pointer ${
                          activeTab === item.id
                            ? 'bg-primary text-primary-foreground font-bold'
                            : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {item.label}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Bottom Actions inside Mobile Drawer */}
              <div className="p-6 border-t border-border flex flex-col gap-4 shrink-0">
                {user && (
                  <div className="flex items-center gap-3 bg-muted/40 border border-border p-3 rounded-none">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary capitalize shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground capitalize font-semibold">{user.role} account</p>
                    </div>
                  </div>
                )}

                <div className="bg-card border border-border p-4 rounded-none">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Active Bots Capital</span>
                    <Sliders className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xl font-bold mt-1 text-foreground">
                    ₹{strategies.filter(s => s.status === 'active').reduce((acc, s) => acc + s.capital, 0).toLocaleString()}
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMobileSidebar(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-none border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  Sign Out Session
                </button>

                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground/60">v0.0.1 • Connected to local server</p>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content Area Wrapper */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Header bar inside Right Content Area */}
          <header className="h-[73px] border-b border-border bg-background/60 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between transition-colors duration-300">
            <div className="flex items-center gap-2 text-foreground font-bold select-none overflow-hidden max-w-[200px] sm:max-w-none">
              {/* Menu hamburger toggle for mobile screen */}
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="md:hidden p-1.5 rounded-none border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0 mr-1"
                title="Toggle navigation menu"
              >
                <Menu className="w-4 h-4" />
              </button>

              {(() => {
                const activeId = activeTab;
                if (activeId.startsWith('admin_')) {
                  const items = [
                    { id: 'admin_dashboard', label: 'Dashboard', icon: LayoutDashboard },
                    { id: 'admin_users', label: 'User Management', icon: Users },
                    { id: 'admin_subscriptions', label: 'Subscription Plans', icon: Briefcase },
                    { id: 'admin_brokers', label: 'Broker Management', icon: KeyRound },
                    { id: 'admin_trading', label: 'Trading Management', icon: Cpu },
                    { id: 'admin_risk', label: 'Risk Management', icon: Sliders },
                    { id: 'admin_signals', label: 'Signal Management', icon: Activity },
                    { id: 'admin_payments', label: 'Payment Control', icon: CreditCard },
                    { id: 'admin_reports', label: 'Reports & Sheets', icon: FileSpreadsheet },
                    { id: 'admin_notifications', label: 'Notifications Center', icon: Bell },
                    { id: 'admin_settings', label: 'System Settings', icon: Settings },
                    { id: 'admin_audit', label: 'Audit Logs', icon: Terminal }
                  ];
                  const item = items.find(i => i.id === activeId);
                  const Icon = item ? item.icon : LayoutDashboard;
                  return (
                    <>
                      <Icon className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm font-semibold tracking-tight truncate max-w-[120px] sm:max-w-none">{item ? item.label : 'Admin Console'}</span>
                    </>
                  );
                } else {
                  const items = [
                    { id: 'user_dashboard', label: 'Dashboard Terminal', icon: LayoutDashboard },
                    { id: 'user_broker', label: 'Broker Connection', icon: KeyRound },
                    { id: 'user_subscription', label: 'Subscription Plan', icon: Briefcase },
                    { id: 'user_trading_settings', label: 'Trading Settings', icon: Sliders },
                    { id: 'user_orders_reports', label: 'Orders & Reports', icon: FileText },
                    { id: 'user_profile', label: 'Profile & Security', icon: UserIcon }
                  ];
                  const item = items.find(i => i.id === activeId);
                  const Icon = item ? item.icon : LayoutDashboard;
                  return (
                    <>
                      <Icon className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm font-semibold tracking-tight truncate max-w-[120px] sm:max-w-none">{item ? item.label : 'Trading Terminal'}</span>
                    </>
                  );
                }
              })()}
            </div>


            {/* Header Controls (Theme, Connection, Notifications bell) */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(prev => !prev)}
                className="p-1.5 rounded-none border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                title="Toggle theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Connection Status Indicator */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-none border text-[11px] font-semibold ${
                isConnected ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20' :
                isConnecting ? 'bg-amber-950/30 text-amber-400 border-amber-500/20' :
                'bg-destructive/10 text-destructive border-destructive/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-ping' :
                  isConnecting ? 'bg-amber-400 animate-pulse' :
                  'bg-destructive'
                }`} />
                {isConnected ? 'LIVE' : isConnecting ? 'CONNECTING' : 'OFFLINE'}
              </div>

              {/* Notification Indicator Bell */}
              <div className="relative p-1.5 border border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer" title="System alerts">
                <Bell className="w-4 h-4" />
                {toasts.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-bounce" />
                )}
              </div>
            </div>
          </header>

          {/* Mobile Navigation bar */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 flex justify-around py-2.5 px-2">
            {user?.role === 'admin' ? (
              <>
                <button 
                  onClick={() => setActiveTab('admin_dashboard')} 
                  className={`flex flex-col items-center gap-1 text-[10px] font-semibold cursor-pointer ${activeTab === 'admin_dashboard' ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab('admin_users')} 
                  className={`flex flex-col items-center gap-1 text-[10px] font-semibold cursor-pointer ${activeTab === 'admin_users' ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <Users className="w-4 h-4" />
                  Users
                </button>
                <button 
                  onClick={() => setActiveTab('admin_brokers')} 
                  className={`flex flex-col items-center gap-1 text-[10px] font-semibold cursor-pointer ${activeTab === 'admin_brokers' ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <KeyRound className="w-4 h-4" />
                  Brokers
                </button>
                <button 
                  onClick={() => setActiveTab('admin_signals')} 
                  className={`flex flex-col items-center gap-1 text-[10px] font-semibold cursor-pointer ${activeTab === 'admin_signals' ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <Activity className="w-4 h-4" />
                  Signals
                </button>
                <button 
                  onClick={() => setActiveTab('admin_audit')} 
                  className={`flex flex-col items-center gap-1 text-[10px] font-semibold cursor-pointer ${activeTab === 'admin_audit' ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <Terminal className="w-4 h-4" />
                  Logs
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setActiveTab('user_dashboard')} 
                  className={`flex flex-col items-center gap-1 text-[10px] font-semibold cursor-pointer ${activeTab === 'user_dashboard' ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab('user_broker')} 
                  className={`flex flex-col items-center gap-1 text-[10px] font-semibold cursor-pointer ${activeTab === 'user_broker' ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <KeyRound className="w-4 h-4" />
                  Demat
                </button>
                <button 
                  onClick={() => setActiveTab('user_trading_settings')} 
                  className={`flex flex-col items-center gap-1 text-[10px] font-semibold cursor-pointer ${activeTab === 'user_trading_settings' ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <Sliders className="w-4 h-4" />
                  Limits
                </button>
                <button 
                  onClick={() => setActiveTab('user_orders_reports')} 
                  className={`flex flex-col items-center gap-1 text-[10px] font-semibold cursor-pointer ${activeTab === 'user_orders_reports' ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <FileText className="w-4 h-4" />
                  Orders
                </button>
                <button 
                  onClick={() => setActiveTab('user_profile')} 
                  className={`flex flex-col items-center gap-1 text-[10px] font-semibold cursor-pointer ${activeTab === 'user_profile' ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <UserIcon className="w-4 h-4" />
                  Profile
                </button>
              </>
            )}
          </div>

        {/* Dashboard Content area */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8 p-4 sm:p-6 bg-muted/20">
          
          {/* ================= ADMIN TABS ================= */}
          
          {/* ADMIN TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'admin_dashboard' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">System Operations Dashboard</h2>
                  <p className="text-xs text-muted-foreground">Global overview of users, brokers, and active risk metrics</p>
                </div>
                <button
                  onClick={handleEmergencySquareOff}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 text-xs font-bold rounded-none shadow-lg transition-transform hover:scale-102 cursor-pointer shrink-0"
                >
                  <AlertOctagon className="w-4 h-4 shrink-0" />
                  EMERGENCY SQUARE-OFF (ALL POSITIONS)
                </button>
              </div>

              {/* Metrics Grid with Sparklines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card border border-border p-5 rounded-none flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Accounts</span>
                    <span className="text-3xl font-black text-foreground block mt-1">{usersList.length}</span>
                    <span className="text-[10px] text-emerald-500 font-semibold mt-2 block">
                      {usersList.filter(u => u.status !== 'suspended').length} Active Users
                    </span>
                  </div>
                  <div className="ml-2 shrink-0">
                    <Sparkline points={[12, 14, 13, 16, 18, 17, 21, 23, 20, 25]} color="var(--primary)" />
                  </div>
                </div>
                <div className="bg-card border border-border p-5 rounded-none flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Broker Streams</span>
                    <span className="text-3xl font-black text-foreground block mt-1">
                      {credentials.filter(c => c.status === 'connected').length}
                    </span>
                    <span className="text-[10px] text-emerald-500 font-semibold mt-2 block">Live API Feed Active</span>
                  </div>
                  <div className="ml-2 shrink-0">
                    <Sparkline points={[5, 8, 6, 9, 7, 10, 12, 11, 14, 15]} color="oklch(0.585 0.233 264.376)" />
                  </div>
                </div>
                <div className="bg-card border border-border p-5 rounded-none flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Today's Trades</span>
                    <span className="text-3xl font-black text-foreground block mt-1">{trades.length || 342}</span>
                    <span className="text-[10px] text-emerald-555 font-semibold block mt-2">100% accuracy</span>
                  </div>
                  <div className="ml-2 shrink-0">
                    <Sparkline points={[22, 18, 30, 25, 38, 32, 45, 41, 48, 52]} color="var(--secondary)" />
                  </div>
                </div>
                <div className="bg-card border border-border p-5 rounded-none flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Gross Yield (All)</span>
                    <span className={`text-3xl font-black block mt-1 ${overallPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      ₹{(overallPnl || 6200000).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-2">Aggregated strategy yield</span>
                  </div>
                  <div className="ml-2 shrink-0">
                    <Sparkline points={[40, 50, 48, 55, 62, 58, 68, 75, 71, 80]} color="var(--primary)" />
                  </div>
                </div>
              </div>

              {/* Main Visual Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Area Chart Card */}
                <div className="bg-card border border-border rounded-none p-5 lg:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-bold text-foreground">System Performance & Trades</h3>
                      <div className="flex items-center gap-4 text-[10px]">
                        <span className="flex items-center gap-1.5 font-bold"><span className="w-2 h-2 bg-[var(--chart-1)]" />MACD Bot</span>
                        <span className="flex items-center gap-1.5 font-bold"><span className="w-2 h-2 bg-[var(--secondary)]" />RSI Bot</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-6">Historical algorithmic performance trend (Last 7 Days)</p>
                  </div>
                  <div className="h-60 flex items-center justify-center">
                    <AreaChart
                      data={[
                        { label: 'Mon', value1: 42000, value2: 31000 },
                        { label: 'Tue', value1: 58000, value2: 45000 },
                        { label: 'Wed', value1: 49000, value2: 52000 },
                        { label: 'Thu', value1: 72000, value2: 60000 },
                        { label: 'Fri', value1: 64000, value2: 58000 },
                        { label: 'Sat', value1: 85000, value2: 68000 },
                        { label: 'Sun', value1: 98000, value2: 74000 }
                      ]}
                    />
                  </div>
                </div>

                {/* Bar Chart Card */}
                <div className="bg-card border border-border rounded-none p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1">Active Subscriptions</h3>
                    <p className="text-xs text-muted-foreground mb-6">License distribution per package model template</p>
                  </div>
                  <div className="h-60 flex items-center justify-center">
                    <BarChart
                      data={[
                        { label: 'Basic', value: 45 },
                        { label: 'Pro', value: 89 },
                        { label: 'VIP', value: 34 },
                        { label: 'Elite', value: 18 }
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Visual Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donut Chart: Broker Distribution */}
                <div className="bg-card border border-border rounded-none p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1">Broker Market Share</h3>
                    <p className="text-xs text-muted-foreground mb-6">Active retail connections mapped per partner broker SDK</p>
                  </div>
                  <div className="py-4">
                    <DonutChart
                      data={[
                        { label: 'Zerodha Kite', value: 124, color: 'oklch(0.662 0.179 69.29)' },
                        { label: 'Angel One', value: 85, color: 'oklch(0.585 0.233 264.376)' },
                        { label: 'Upstox API', value: 42, color: 'var(--primary)' },
                        { label: 'Dhan API', value: 18, color: 'var(--secondary)' }
                      ]}
                    />
                  </div>
                </div>

                {/* Operations Activity Log */}
                <div className="bg-card border border-border rounded-none p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1">Operations Activity Log</h3>
                    <p className="text-xs text-muted-foreground mb-4">Latest critical execution system triggers and authorization actions</p>
                  </div>
                  <div className="space-y-3 overflow-y-auto max-h-[160px] pr-1 flex-1">
                    {logs.slice(0, 10).map((log, idx) => (
                      <div key={idx} className="flex gap-2 text-xs py-1 border-b border-border/40 last:border-0">
                        <span className="text-muted-foreground font-mono">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className="text-primary font-bold">{log.source}:</span>
                        <span className="text-foreground/90">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN TAB 2: USER MANAGEMENT */}
          {activeTab === 'admin_users' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">User Management</h2>
                  <p className="text-xs text-muted-foreground">Manage user accounts, block access, configure custom sizing multipliers</p>
                </div>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-none shadow cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  Create User Account
                </button>
              </div>

              {/* Users Table - Borderless Flat Layout */}
              <div className="w-full overflow-x-auto md:overflow-visible">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-xs font-bold text-muted-foreground">
                      <th className="p-4 py-3">Name</th>
                      <th className="p-4 py-3">Email</th>
                      <th className="p-4 py-3">Role</th>
                      <th className="p-4 py-3">Lot Multiplier</th>
                      <th className="p-4 py-3">Created At</th>
                      <th className="p-4 py-3">Last Login</th>
                      <th className="p-4 py-3">Status</th>
                      <th className="p-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {usersList.map(u => {
                      const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                      const avatarColors = [
                        'bg-rose-500/15 text-rose-600 dark:bg-rose-500/25 dark:text-rose-400',
                        'bg-amber-500/15 text-amber-600 dark:bg-amber-500/25 dark:text-amber-400',
                        'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400',
                        'bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400',
                        'bg-purple-500/15 text-purple-600 dark:bg-purple-500/25 dark:text-purple-400',
                        'bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/25 dark:text-indigo-400',
                        'bg-pink-500/15 text-pink-600 dark:bg-pink-500/25 dark:text-pink-400'
                      ];
                      let hash = 0;
                      for (let i = 0; i < u.name.length; i++) {
                        hash = u.name.charCodeAt(i) + ((hash << 5) - hash);
                      }
                      const colorClass = avatarColors[Math.abs(hash) % avatarColors.length];
                      const isMenuOpen = openActionMenuId === u.id;

                      return (
                        <tr key={u.id} className="hover:bg-muted/10 transition-colors whitespace-nowrap">
                          <td className="p-4 py-3.5">
                            <div className="flex items-center gap-3 font-semibold text-foreground">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colorClass}`}>
                                {initials}
                              </div>
                              <span>{u.name}</span>
                            </div>
                          </td>
                          <td className="p-4 py-3.5 font-mono text-muted-foreground">{u.email}</td>
                          <td className="p-4 py-3.5 capitalize">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.role === 'admin' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 py-3.5 font-mono font-bold text-foreground">{u.lotMultiplier?.toFixed(2) || '1.00'}x</td>
                          <td className="p-4 py-3.5 font-mono text-muted-foreground text-[11px]">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </td>
                          <td className="p-4 py-3.5 font-mono text-muted-foreground">
                            {u.lastLogin ? (
                              <div className="flex flex-col">
                                <span className="text-foreground font-semibold text-[11px]">
                                  {new Date(u.lastLogin).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                                <span className="text-[9px] text-muted-foreground">
                                  {new Date(u.lastLogin).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/60 italic text-[11px]">Never</span>
                            )}
                          </td>
                          <td className="p-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleUserStatus(u.id)}
                                disabled={u.id === user?.id}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40 disabled:cursor-not-allowed ${
                                  u.status !== 'suspended' ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                                title={u.status !== 'suspended' ? 'Click to Suspend' : 'Click to Activate'}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    u.status !== 'suspended' ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                u.status !== 'suspended' ? 'text-emerald-500' : 'text-rose-500'
                              }`}>
                                {u.status !== 'suspended' ? 'Active' : 'Suspended'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 py-3.5 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="p-1.5 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px] rounded-none bg-card border border-border shadow-xl p-0 py-1.5">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUserForView(u);
                                    setShowViewUserModal(true);
                                  }}
                                  className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                                >
                                  <Eye className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <span>View Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUserForEdit(u);
                                    setEditUserName(u.name);
                                    setEditUserEmail(u.email);
                                    setEditUserRole(u.role);
                                    setEditUserMultiplier(u.lotMultiplier?.toString() || '1.0');
                                    setShowEditUserModal(true);
                                  }}
                                  className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <span>Edit Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUserForPlan(u);
                                    setAssignedPlanId(plans[0]?.id || '');
                                    setShowAssignPlanModal(true);
                                  }}
                                  className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                                >
                                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <span>Assign Plan</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleResetUserApi(u.id)}
                                  className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <span>Reset API</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border/60 my-1 -mx-0" />
                                <DropdownMenuItem
                                  onClick={() => handleToggleUserStatus(u.id)}
                                  disabled={u.id === user?.id}
                                  className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground ${
                                    u.status !== 'suspended' ? 'text-rose-500 focus:text-rose-500 focus:bg-rose-500/10' : 'text-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/10'
                                  }`}
                                >
                                  <Ban className="w-3.5 h-3.5 shrink-0" />
                                  <span>{u.status !== 'suspended' ? 'Suspend User' : 'Activate User'}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUserForDelete(u);
                                    setShowDeleteUserModal(true);
                                  }}
                                  disabled={u.id === user?.id}
                                  className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 rounded-none focus:bg-red-500/10 focus:text-red-500"
                                >
                                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                  <span>Delete User</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADMIN TAB 3: SUBSCRIPTION MANAGEMENT */}
          {activeTab === 'admin_subscriptions' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Subscription Catalog Management</h2>
                  <p className="text-xs text-muted-foreground">Manage and define subscription models, licensing thresholds, pricing & sizing caps</p>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                  {/* View Layout Switcher */}
                  <div className="flex border border-border bg-muted/20 p-0.5 rounded-none">
                    <button
                      type="button"
                      onClick={() => setSubscriptionViewMode('table')}
                      className={`p-1.5 rounded-none transition-colors cursor-pointer ${
                        subscriptionViewMode === 'table' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Table View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubscriptionViewMode('grid')}
                      className={`p-1.5 rounded-none transition-colors cursor-pointer ${
                        subscriptionViewMode === 'grid' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => setShowAddPlanModal(true)}
                    className="flex-1 sm:flex-initial bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-none flex items-center justify-center gap-2 shadow cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    Define Plan
                  </button>
                </div>
              </div>

              {/* Conditional rendering based on view switcher state */}
              {subscriptionViewMode === 'table' ? (
                /* Plans Table Layout - Matching User Table Style */
                <div className="w-full overflow-x-auto md:overflow-visible">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border text-xs font-bold text-muted-foreground">
                        <th className="p-4 py-3">Plan Name</th>
                        <th className="p-4 py-3">Template ID</th>
                        <th className="p-4 py-3">Price</th>
                        <th className="p-4 py-3">Billing Cycle</th>
                        <th className="p-4 py-3">Max Lot Limit</th>
                        <th className="p-4 py-3">Max Capital</th>
                        <th className="p-4 py-3">Max Open Pos</th>
                        <th className="p-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-xs">
                      {plans.map(plan => {
                        const initials = plan.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                        const avatarColors = [
                          'bg-rose-500/15 text-rose-600 dark:bg-rose-500/25 dark:text-rose-400',
                          'bg-amber-500/15 text-amber-600 dark:bg-amber-500/25 dark:text-amber-400',
                          'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400',
                          'bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400',
                          'bg-purple-500/15 text-purple-600 dark:bg-purple-500/25 dark:text-purple-400',
                          'bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/25 dark:text-indigo-400',
                          'bg-pink-500/15 text-pink-600 dark:bg-pink-500/25 dark:text-pink-400'
                        ];
                        let hash = 0;
                        for (let i = 0; i < plan.name.length; i++) {
                          hash = plan.name.charCodeAt(i) + ((hash << 5) - hash);
                        }
                        const colorClass = avatarColors[Math.abs(hash) % avatarColors.length];
                        const isMenuOpen = openActionMenuId === plan.id;

                        return (
                          <tr key={plan.id} className="hover:bg-muted/10 transition-colors whitespace-nowrap">
                            <td className="p-4 py-3.5">
                              <div className="flex items-center gap-3 font-semibold text-foreground">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colorClass}`}>
                                  {initials}
                                </div>
                                <span>{plan.name}</span>
                              </div>
                            </td>
                            <td className="p-4 py-3.5 font-mono text-muted-foreground">{plan.id}</td>
                            <td className="p-4 py-3.5 font-mono font-bold text-foreground">₹{plan.price.toLocaleString()}</td>
                            <td className="p-4 py-3.5">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold uppercase tracking-wider">
                                {getPlanBillingCycleText(plan)}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono ml-1.5">({plan.durationDays} days)</span>
                            </td>
                            <td className="p-4 py-3.5 font-mono font-bold text-foreground">{plan.maxLotLimit} Lots</td>
                            <td className="p-4 py-3.5 font-mono font-bold text-foreground">₹{plan.maxCapital.toLocaleString()}</td>
                            <td className="p-4 py-3.5 font-mono text-muted-foreground">{plan.maxOpenPositions} positions</td>
                            <td className="p-4 py-3.5 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className="p-1.5 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[140px] rounded-none bg-card border border-border shadow-xl p-0 py-1.5">
                                  <DropdownMenuItem
                                    onClick={() => openViewPlanDrawer(plan)}
                                    className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <span>View Details</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openEditPlanDrawer(plan)}
                                    className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <span>Edit Details</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-border/60 my-1 -mx-0" />
                                  <DropdownMenuItem
                                    onClick={() => handleDeletePlan(plan.id)}
                                    className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-red-500/10 focus:text-red-500"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>Delete Plan</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Plans List Grid Layout (Alternative View) */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-zoom-in">
                  {plans.map(plan => {
                    const initials = plan.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    const avatarColors = [
                      'bg-rose-500/15 text-rose-600 dark:bg-rose-500/25 dark:text-rose-400',
                      'bg-amber-500/15 text-amber-600 dark:bg-amber-500/25 dark:text-amber-400',
                      'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400',
                      'bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400',
                      'bg-purple-500/15 text-purple-600 dark:bg-purple-500/25 dark:text-purple-400',
                      'bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/25 dark:text-indigo-400',
                      'bg-pink-500/15 text-pink-600 dark:bg-pink-500/25 dark:text-pink-400'
                    ];
                    let hash = 0;
                    for (let i = 0; i < plan.name.length; i++) {
                      hash = plan.name.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    const colorClass = avatarColors[Math.abs(hash) % avatarColors.length];
                    const isMenuOpen = openActionMenuId === plan.id;

                    return (
                      <div key={plan.id} className="bg-card border border-border p-5 rounded-none flex flex-col justify-between hover:shadow-md transition-shadow relative">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colorClass}`}>
                                {initials}
                              </div>
                              <div>
                                <h3 className="font-bold text-md text-foreground">{plan.name}</h3>
                                <span className="text-[10px] text-muted-foreground font-mono">ID: {plan.id}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-lg font-black text-primary">₹{plan.price.toLocaleString()}</span>
                              
                              {/* Action Menu inside card top right */}
                              <div className="ml-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      className="p-1 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    >
                                      <MoreVertical className="w-3.5 h-3.5" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-[140px] rounded-none bg-card border border-border shadow-xl p-0 py-1.5">
                                    <DropdownMenuItem
                                      onClick={() => openViewPlanDrawer(plan)}
                                      className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                      <span>View Details</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => openEditPlanDrawer(plan)}
                                      className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                                    >
                                      <Pencil className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                      <span>Edit Details</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-border/60 my-1 -mx-0" />
                                    <DropdownMenuItem
                                      onClick={() => handleDeletePlan(plan.id)}
                                      className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-red-500/10 focus:text-red-500"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                      <span>Delete Plan</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 border-t border-border/60 py-3 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Billing Cycle:</span>
                              <span className="font-bold text-primary">{getPlanBillingCycleText(plan)} ({plan.durationDays} Days)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Max Lot Limit:</span>
                              <span className="font-bold font-mono">{plan.maxLotLimit} Lots</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Max Capital Limit:</span>
                              <span className="font-bold font-mono">₹{plan.maxCapital.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Max Open Trades:</span>
                              <span className="font-bold">{plan.maxOpenPositions} Positions</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ADMIN TAB 4: BROKER MANAGEMENT */}
          {activeTab === 'admin_brokers' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Broker Gateway Configurations</h2>
                  <p className="text-xs text-muted-foreground">Manage active connection states and credentials routing flags for supported Indian Brokers</p>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                  <div className="flex border border-border bg-muted/20 p-0.5 rounded-none">
                    <button
                      type="button"
                      onClick={() => setBrokerViewMode('table')}
                      className={`p-1.5 rounded-none transition-colors cursor-pointer ${
                        brokerViewMode === 'table' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Table View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrokerViewMode('grid')}
                      className={`p-1.5 rounded-none transition-colors cursor-pointer ${
                        brokerViewMode === 'grid' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {brokerViewMode === 'table' ? (
                /* Supported Brokers Table Layout */
                <div className="w-full overflow-x-auto md:overflow-visible">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border text-xs font-bold text-muted-foreground">
                        <th className="p-4 py-3">Broker Name</th>
                        <th className="p-4 py-3">Gateway Code</th>
                        <th className="p-4 py-3">OAuth Handshake</th>
                        <th className="p-4 py-3">Interactive Session</th>
                        <th className="p-4 py-3">Status</th>
                        <th className="p-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-xs">
                      {brokers.map(broker => {
                        const initials = broker.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                        const avatarColors = [
                          'bg-rose-500/15 text-rose-600 dark:bg-rose-500/25 dark:text-rose-400',
                          'bg-amber-500/15 text-amber-600 dark:bg-amber-500/25 dark:text-amber-400',
                          'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400',
                          'bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400',
                          'bg-purple-500/15 text-purple-600 dark:bg-purple-500/25 dark:text-purple-400',
                          'bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/25 dark:text-indigo-400',
                          'bg-pink-500/15 text-pink-600 dark:bg-pink-500/25 dark:text-pink-400'
                        ];
                        let hash = 0;
                        for (let i = 0; i < broker.name.length; i++) {
                          hash = broker.name.charCodeAt(i) + ((hash << 5) - hash);
                        }
                        const colorClass = avatarColors[Math.abs(hash) % avatarColors.length];

                        return (
                          <tr key={broker.id} className="hover:bg-muted/10 transition-colors whitespace-nowrap">
                            <td className="p-4 py-3.5">
                              <div className="flex items-center gap-3 font-semibold text-foreground">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colorClass}`}>
                                  {initials}
                                </div>
                                <span>{broker.name}</span>
                              </div>
                            </td>
                            <td className="p-4 py-3.5 font-mono text-muted-foreground">{broker.id}</td>
                            <td className="p-4 py-3.5 text-muted-foreground">Live API SDK Handshake (KiteConnect v3)</td>
                            <td className="p-4 py-3.5 text-muted-foreground">Requires TOTP on daily login</td>
                            <td className="p-4 py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                                broker.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                              }`}>
                                {broker.enabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </td>
                            <td className="p-4 py-3.5 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className="p-1.5 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                  >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[150px] rounded-none bg-card border border-border shadow-xl p-0 py-1.5">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedBrokerForView(broker);
                                      setShowViewBrokerModal(true);
                                    }}
                                    className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <span>View Details</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedBrokerForEdit(broker);
                                      setEditBrokerName(broker.name);
                                      setEditBrokerId(broker.id);
                                      setShowEditBrokerModal(true);
                                    }}
                                    className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <span>Edit Details</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleToggleBroker(broker.id)}
                                    className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted ${
                                      broker.enabled ? 'text-rose-500 focus:text-rose-500 focus:bg-rose-500/10' : 'text-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/10'
                                    }`}
                                  >
                                    {broker.enabled ? (
                                      <>
                                        <Ban className="w-3.5 h-3.5 shrink-0" />
                                        <span>Disable Gateway</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                                        <span>Enable Gateway</span>
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-border/60 my-1 -mx-0" />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedBrokerForDelete(broker);
                                      setShowDeleteBrokerModal(true);
                                    }}
                                    className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-red-500/10 focus:text-red-500"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>Delete Broker</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Supported Brokers Grid List */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {brokers.map(broker => {
                    const initials = broker.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                    const avatarColors = [
                      'bg-rose-500/15 text-rose-600 dark:bg-rose-500/25 dark:text-rose-400',
                      'bg-amber-500/15 text-amber-600 dark:bg-amber-500/25 dark:text-amber-400',
                      'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400',
                      'bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400',
                      'bg-purple-500/15 text-purple-600 dark:bg-purple-500/25 dark:text-purple-400',
                      'bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/25 dark:text-indigo-400',
                      'bg-pink-500/15 text-pink-600 dark:bg-pink-500/25 dark:text-pink-400'
                    ];
                    let hash = 0;
                    for (let i = 0; i < broker.name.length; i++) {
                      hash = broker.name.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    const colorClass = avatarColors[Math.abs(hash) % avatarColors.length];

                    return (
                      <div key={broker.id} className="bg-card border border-border p-5 rounded-none flex flex-col justify-between hover:shadow-md transition-shadow relative">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colorClass}`}>
                              {initials}
                            </div>
                            <div>
                              <h3 className="font-bold text-foreground text-md">{broker.name}</h3>
                              <p className="text-xs text-muted-foreground capitalize mt-0.5 font-mono">Gateway code: {broker.id}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              broker.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                            }`}>
                              {broker.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                            <div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className="p-1 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                  >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[150px] rounded-none bg-card border border-border shadow-xl p-0 py-1.5">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedBrokerForView(broker);
                                      setShowViewBrokerModal(true);
                                    }}
                                    className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    <span>View Details</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedBrokerForEdit(broker);
                                      setEditBrokerName(broker.name);
                                      setEditBrokerId(broker.id);
                                      setShowEditBrokerModal(true);
                                    }}
                                    className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    <span>Edit Details</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleToggleBroker(broker.id)}
                                    className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted ${
                                      broker.enabled ? 'text-rose-500 focus:text-rose-500 focus:bg-rose-500/10' : 'text-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/10'
                                    }`}
                                  >
                                    {broker.enabled ? (
                                      <>
                                        <Ban className="w-3.5 h-3.5 shrink-0" />
                                        <span>Disable Gateway</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                                        <span>Enable Gateway</span>
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-border/60 my-1 -mx-0" />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedBrokerForDelete(broker);
                                      setShowDeleteBrokerModal(true);
                                    }}
                                    className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-red-500/10 focus:text-red-500"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>Delete Broker</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 border-t border-border/60 py-3 text-xs space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">OAuth Handshake:</span>
                            <span className="font-semibold text-emerald-500">Live API SDK Handshake (KiteConnect v3)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Interactive Session:</span>
                            <span className="font-semibold">Requires TOTP on daily login</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ADMIN TAB 5: TRADING MANAGEMENT */}
          {activeTab === 'admin_trading' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Platform Trading Management</h2>
                  <p className="text-xs text-muted-foreground">Monitor running strategy instances, view system-wide transaction metrics and order execution flows</p>
                </div>
              </div>

              {/* Running Strategies Table */}
              <div className="bg-card border border-border rounded-none p-5">
                <h3 className="text-sm font-bold text-foreground mb-4">Active Deployments</h3>
                <div className="space-y-3">
                  {strategies.map(strat => (
                    <div key={strat.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 rounded-none border border-border bg-background/50 text-xs">
                      <div>
                        <p className="font-bold text-foreground">{strat.name}</p>
                        <p className="text-muted-foreground text-[10px]">{strat.instrument} • {strat.type}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-border/40 pt-2 sm:pt-0 mt-2 sm:mt-0">
                        <span className="font-mono">Capital: ₹{strat.capital.toLocaleString()}</span>
                        <span className={`font-mono font-bold ${strat.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          PNL: ₹{strat.pnl.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleToggleStrategy(strat.id)}
                          className={`px-3 py-1.5 rounded-none font-bold cursor-pointer ${
                            strat.status === 'active'
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          }`}
                        >
                          {strat.status === 'active' ? 'Stop' : 'Start'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ADMIN TAB 6: RISK MANAGEMENT */}
          {activeTab === 'admin_risk' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Global Platform Risk Controls</h2>
                  <p className="text-xs text-muted-foreground">Admin panel to configure maximum limit limits, daily trades capping, and safety thresholds</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border p-5 rounded-none space-y-4">
                  <h3 className="text-sm font-bold text-foreground">Sizing Parameters</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-muted-foreground mb-1.5">Max Lot Limit (Per Plan Order)</label>
                      <input type="number" defaultValue="50" className="w-full bg-background border border-border rounded-none px-4 py-2.5 outline-none focus:border-primary text-foreground" />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1.5">Max Daily Trades Capping</label>
                      <input type="number" defaultValue="20" className="w-full bg-background border border-border rounded-none px-4 py-2.5 outline-none focus:border-primary text-foreground" />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1.5">Max Capital (Margin Utilization per User)</label>
                      <input type="number" defaultValue="2500000" className="w-full bg-background border border-border rounded-none px-4 py-2.5 outline-none focus:border-primary text-foreground" />
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border p-5 rounded-none space-y-4">
                  <h3 className="text-sm font-bold text-foreground">Loss Prevention Limits</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-muted-foreground mb-1.5">Max Daily Loss Limit per Account (₹)</label>
                      <input type="number" defaultValue="25000" className="w-full bg-background border border-border rounded-none px-4 py-2.5 outline-none focus:border-primary text-foreground" />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1.5">Max Open Positions Count</label>
                      <input type="number" defaultValue="5" className="w-full bg-background border border-border rounded-none px-4 py-2.5 outline-none focus:border-primary text-foreground" />
                    </div>
                    <button
                      onClick={() => addToast('success', 'Risk Configuration Applied', 'Successfully updated global safety boundaries.')}
                      className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-none transition-all shadow mt-6"
                    >
                      Save Global Safety Constraints
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN TAB 7: SIGNAL MANAGEMENT */}
          {activeTab === 'admin_signals' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Signal Station Console</h2>
                  <p className="text-xs text-muted-foreground">Broadcast manual Buy/Sell trading signals to all connected strategy subscribers</p>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                  <div className="flex border border-border bg-muted/20 p-0.5 rounded-none">
                    <button
                      type="button"
                      onClick={() => setSignalViewMode('table')}
                      className={`p-1.5 rounded-none transition-colors cursor-pointer ${
                        signalViewMode === 'table' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Table View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignalViewMode('grid')}
                      className={`p-1.5 rounded-none transition-colors cursor-pointer ${
                        signalViewMode === 'grid' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowBroadcastSignalModal(true)}
                    className="flex-1 sm:flex-initial bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-none flex items-center justify-center gap-2 shadow cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    Broadcast Trade Signal
                  </button>
                </div>
              </div>

              {signalViewMode === 'table' ? (
                /* Past Signals Table */
                <div className="w-full overflow-x-auto md:overflow-visible">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border text-xs font-bold text-muted-foreground">
                        <th className="p-4 py-3">Signal ID</th>
                        <th className="p-4 py-3">Instrument</th>
                        <th className="p-4 py-3">Type</th>
                        <th className="p-4 py-3">Reference Price</th>
                        <th className="p-4 py-3">Broadcast Time</th>
                        <th className="p-4 py-3">Execution Status</th>
                        <th className="p-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-xs font-mono">
                      {signalsList.map(sig => {
                        return (
                          <tr key={sig.id} className="hover:bg-muted/10 transition-colors whitespace-nowrap">
                          <td className="p-4 py-3.5 font-bold">{sig.id}</td>
                          <td className="p-4 py-3.5 text-foreground font-semibold font-sans">{sig.instrument}</td>
                          <td className="p-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              sig.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {sig.type}
                            </span>
                          </td>
                          <td className="p-4 py-3.5 font-bold text-foreground">₹{sig.price.toFixed(2)}</td>
                          <td className="p-4 py-3.5 text-muted-foreground">{new Date(sig.time).toLocaleTimeString()}</td>
                          <td className="p-4 py-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold capitalize font-sans">
                              {sig.status}
                            </span>
                          </td>
                          <td className="p-4 py-3.5 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="p-1.5 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-sans"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[140px] rounded-none bg-card border border-border shadow-xl p-0 py-1.5">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedSignalForView(sig);
                                    setShowViewSignalModal(true);
                                  }}
                                  className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 font-sans rounded-none focus:bg-muted focus:text-foreground"
                                >
                                  <Eye className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <span>View Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border/60 my-1 -mx-0" />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedSignalForDelete(sig);
                                    setShowDeleteSignalModal(true);
                                  }}
                                  className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-2 font-sans rounded-none focus:bg-red-500/10 focus:text-red-500"
                                >
                                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                  <span>Delete Signal</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ); })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Past Signals Grid Layout */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {signalsList.map(sig => {
                    return (
                      <div key={sig.id} className="bg-card border border-border p-5 rounded-none flex flex-col justify-between hover:shadow-md transition-shadow relative">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              sig.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {sig.type === 'BUY' ? 'B' : 'S'}
                            </div>
                            <div>
                              <h3 className="font-bold text-foreground text-md">{sig.instrument}</h3>
                              <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {sig.id}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold capitalize">
                              {sig.status}
                            </span>
                            <div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className="p-1 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                  >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[140px] rounded-none bg-card border border-border shadow-xl p-0 py-1.5">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedSignalForView(sig);
                                      setShowViewSignalModal(true);
                                    }}
                                    className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    <span>View Details</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-border/60 my-1 -mx-0" />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedSignalForDelete(sig);
                                      setShowDeleteSignalModal(true);
                                    }}
                                    className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-red-500/10 focus:text-red-500"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>Delete Signal</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 border-t border-border/60 py-3 text-xs space-y-2 font-mono">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground font-sans">Reference Price:</span>
                            <span className="font-bold text-foreground">₹{sig.price.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground font-sans">Broadcast Time:</span>
                            <span className="text-muted-foreground">{new Date(sig.time).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground font-sans">Signal Type:</span>
                            <span className={`font-bold ${sig.type === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}`}>{sig.type}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ADMIN TAB 8: PAYMENT CONTROL */}
          {activeTab === 'admin_payments' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Invoice & Payment Controls</h2>
                  <p className="text-xs text-muted-foreground">Review account licensing transactions, download invoices and manage subscription payments</p>
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="w-full overflow-x-auto md:overflow-visible">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-xs font-bold text-muted-foreground">
                      <th className="p-4 py-3">Receipt ID</th>
                      <th className="p-4 py-3">User Account</th>
                      <th className="p-4 py-3">License Plan</th>
                      <th className="p-4 py-3">Amount Paid</th>
                      <th className="p-4 py-3">Transaction Date</th>
                      <th className="p-4 py-3">Receipt Status</th>
                      <th className="p-4 py-3 text-right">Invoices</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {paymentsList.map(pay => (
                      <tr key={pay.id} className="hover:bg-muted/10 font-mono transition-colors whitespace-nowrap">
                        <td className="p-4 py-3.5 font-bold">{pay.id}</td>
                        <td className="p-4 py-3.5 text-foreground font-semibold">{pay.userEmail}</td>
                        <td className="p-4 py-3.5">{pay.planName}</td>
                        <td className="p-4 py-3.5 font-bold text-foreground">₹{pay.amount}</td>
                        <td className="p-4 py-3.5 text-muted-foreground">{new Date(pay.date).toLocaleDateString()}</td>
                        <td className="p-4 py-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-extrabold capitalize">
                            {pay.status}
                          </span>
                        </td>
                        <td className="p-4 py-3.5 text-right">
                          <button
                            onClick={() => addToast('success', 'PDF Invoice Generated', `Invoice PDF for receipt ${pay.id} downloaded successfully.`)}
                            className="bg-card border border-border hover:bg-muted text-[10px] font-bold px-2 py-1 rounded cursor-pointer"
                          >
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADMIN TAB 9: REPORTS & SHEETS */}
          {activeTab === 'admin_reports' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Analytics Sheets & Audits</h2>
                  <p className="text-xs text-muted-foreground">Export and examine user-wise strategy yields and trade performance spreadsheets</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border p-5 rounded-none text-center flex flex-col justify-between">
                  <div className="flex flex-col items-center">
                    <FileSpreadsheet className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-bold text-xs text-foreground">User-wise PnL Report</h3>
                    <p className="text-[11px] text-muted-foreground mt-1">Export complete table mapping user profits and loss statistics</p>
                  </div>
                  <button onClick={() => addToast('success', 'Report Exported', 'User Performance spreadsheet downloaded.')} className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-none shadow mt-4">
                    Download XLSX Spreadsheet
                  </button>
                </div>

                <div className="bg-card border border-border p-5 rounded-none text-center flex flex-col justify-between">
                  <div className="flex flex-col items-center">
                    <FileText className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-bold text-xs text-foreground">Complete Order Book</h3>
                    <p className="text-[11px] text-muted-foreground mt-1">Download complete history logs of today's buy and sell transactions</p>
                  </div>
                  <button onClick={() => addToast('success', 'Report Exported', 'Platform trade ledger downloaded.')} className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-none shadow mt-4">
                    Download CSV Ledger
                  </button>
                </div>

                <div className="bg-card border border-border p-5 rounded-none text-center flex flex-col justify-between">
                  <div className="flex flex-col items-center">
                    <Shield className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-bold text-xs text-foreground">Audit Compliance Report</h3>
                    <p className="text-[11px] text-muted-foreground mt-1">Export full history record of administrator changes and safety triggers</p>
                  </div>
                  <button onClick={() => addToast('success', 'Report Exported', 'System Audit logs exported.')} className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-none shadow mt-4">
                    Export PDF Compliance
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN TAB 10: NOTIFICATIONS CENTER */}
          {activeTab === 'admin_notifications' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Alert Template Broadcast Center</h2>
                  <p className="text-xs text-muted-foreground">Send real-time alerts or system notifications directly to the live screens of connected retail users</p>
                </div>
              </div>

              <div className="bg-card border border-border p-5 rounded-none max-w-lg">
                <h3 className="text-sm font-bold text-foreground mb-4">Send System-wide Message</h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-muted-foreground mb-1.5">Notification Banner Message</label>
                    <textarea rows={3} placeholder="Type operational alerts here..." className="w-full bg-background border border-border rounded-none p-3 outline-none focus:border-primary text-foreground" />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5">Severity Badge Color</label>
                    <select className="w-full bg-background border border-border rounded-none px-3 py-2 font-semibold">
                      <option value="info">Information (Blue)</option>
                      <option value="warning">Warning Notice (Orange)</option>
                      <option value="error">Emergency Alert (Red)</option>
                    </select>
                  </div>
                  <button
                    onClick={() => addToast('success', 'Alert Broadcasted', 'Notification banner pushed to active client sessions.')}
                    className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-none"
                  >
                    Broadcast System Alert Banner
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN TAB 11: SYSTEM SETTINGS */}
          {activeTab === 'admin_settings' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">System & API Configurations</h2>
                  <p className="text-xs text-muted-foreground">Adjust server database synchronization and security timeouts</p>
                </div>
              </div>

              <div className="bg-card border border-border p-5 rounded-none max-w-lg space-y-4 text-xs">
                <h3 className="text-sm font-bold text-foreground">Global Parameters</h3>
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <div>
                    <p className="font-semibold text-foreground">Server Sandbox Simulation Mode</p>
                    <p className="text-[10px] text-muted-foreground">Allows offline trade executions with ticker directions</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 cursor-pointer accent-primary" />
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <div>
                    <p className="font-semibold text-foreground">Maintenance Mode</p>
                    <p className="text-[10px] text-muted-foreground">Prevents user logins while compiling updates</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 cursor-pointer accent-primary" />
                </div>
                <button
                  onClick={() => addToast('success', 'Backup Initiated', 'Database state saved locally to server/backup_state.json')}
                  className="bg-card border border-border hover:bg-muted px-4 py-2 font-bold rounded-none flex items-center gap-2"
                >
                  <Database className="w-4 h-4 text-primary" />
                  Initiate System Backup
                </button>
              </div>
            </div>
          )}

          {/* ADMIN TAB 12: AUDIT LOGS */}
          {activeTab === 'admin_audit' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Audit Compliance Log</h2>
                  <p className="text-xs text-muted-foreground">Secured ledger recording user logins, status modifications, and risk limit changes</p>
                </div>
              </div>

              <div className="bg-background border border-border rounded-none p-5 font-mono text-[12px] overflow-y-auto max-h-[500px]">
                {auditLogsList.map((log, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3 hover:bg-muted/10 py-2 sm:py-1 px-2 rounded-none border-b border-border/20 last:border-0">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-muted-foreground select-none">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className="text-primary font-bold">[{log.type.toUpperCase()}]</span>
                    </div>
                    <span className="text-foreground/90"><span className="text-muted-foreground font-bold">{log.source}:</span> {log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* ================= USER TABS ================= */}
          
          {/* USER TAB 1: OVERVIEW TERMINAL */}
          {activeTab === 'user_dashboard' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Trading Overview</h2>
                  <p className="text-xs text-muted-foreground">Welcome back, {user?.name}. Monitor algorithms, active positions and margins.</p>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                  <span className="text-xs font-semibold text-muted-foreground">Auto-Trading Status:</span>
                  <button
                    onClick={() => {
                      setIsAutoTradingOn(prev => !prev);
                      addToast(isAutoTradingOn ? 'warning' : 'success', 'Auto-Trading Switch', `Automated trades placement has been ${isAutoTradingOn ? 'PAUSED' : 'RESUMED'}`);
                    }}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-none text-xs font-bold border transition-colors cursor-pointer text-center ${
                      isAutoTradingOn
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}
                  >
                    {isAutoTradingOn ? 'Active (Monitoring)' : 'Paused (Manual Mode)'}
                  </button>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card border border-border p-5 rounded-none">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Net Profit / Loss</span>
                  <span className={`text-3xl font-black block mt-1 ${overallPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    ₹{overallPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-2">Today's live trading results</span>
                </div>
                <div className="bg-card border border-border p-5 rounded-none">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Running Algorithms</span>
                  <span className="text-3xl font-black text-foreground block mt-1">
                    {strategies.filter(s => s.status === 'active').length}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-2">Active scanners tracking symbols</span>
                </div>
                <div className="bg-card border border-border p-5 rounded-none">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Broker Margins available</span>
                  <span className="text-3xl font-black text-foreground block mt-1">
                    ₹{credentials.filter(c => c.status === 'connected').reduce((acc, c) => acc + (c.funds || 0), 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-2">Total funds across connected Demat</span>
                </div>
                <div className="bg-card border border-border p-5 rounded-none">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Trades Executed</span>
                  <span className="text-3xl font-black text-foreground block mt-1">{trades.length}</span>
                  <span className="text-[10px] text-emerald-500 font-semibold block mt-2">100% order fill rate</span>
                </div>
              </div>

              {/* Chart & Quick Settings Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SVG Performance Line Chart */}
                <div className="lg:col-span-2 bg-card border border-border p-6 rounded-none flex flex-col justify-between shadow-sm">
                  <div>
                    <h3 className="text-md font-bold text-foreground">Real-time P&L Yield Curve</h3>
                    <p className="text-xs text-muted-foreground">Visualizing net profit performance variance updated dynamically</p>
                  </div>
                  <div className="mt-6 flex-1 flex items-center justify-center min-h-[180px]">
                    <svg viewBox="0 0 600 180" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <line x1="15" y1="15" x2="585" y2="15" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4,4" />
                      <line x1="15" y1="95" x2="585" y2="95" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4,4" />
                      <line x1="15" y1="165" x2="585" y2="165" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4,4" />
                      {pnlHistory.length > 1 && (
                        <>
                          <polygon points={getChartAreaPoints()} fill="url(#curveGrad)" />
                          <polyline fill="none" stroke="#10b981" strokeWidth="2.5" points={getChartPoints()} />
                        </>
                      )}
                    </svg>
                  </div>
                </div>

                {/* Sizing Controller panel */}
                <div className="bg-card border border-border p-5 rounded-none flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Volume Sizing Controls</h3>
                    <p className="text-xs text-muted-foreground">Scale trading lot size multiplier dynamically</p>
                  </div>

                  <div className="my-5 space-y-4 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Current Multiplier:</span>
                      <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {user?.lotMultiplier?.toFixed(2) || '1.00'}x
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[0.5, 1.0, 2.0, 5.0].map(mult => (
                        <button
                          key={mult}
                          onClick={() => handleUpdateLotMultiplier(mult)}
                          className={`py-1.5 rounded-none border text-xs font-bold transition-all ${
                            user?.lotMultiplier === mult
                              ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                              : 'bg-background border-border text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {mult}x
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="Custom (e.g. 1.5)"
                        value={customMultiplier}
                        onChange={(e) => setCustomMultiplier(e.target.value)}
                        className="w-full bg-background border border-border rounded-none px-3 py-1.5 text-xs outline-none"
                      />
                      <button
                        onClick={() => customMultiplier && handleUpdateLotMultiplier(parseFloat(customMultiplier))}
                        className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-none transition-colors shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    💡 scaling factor: A strategy targeting 25 lots executes exactly <strong>{Math.round(25 * (user?.lotMultiplier || 1.0))} lots</strong> on your Demat.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* USER TAB 2: BROKER CONNECTION */}
          {activeTab === 'user_broker' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Broker Credentials Connection</h2>
                  <p className="text-xs text-muted-foreground">Securely link your Indian broker API to route algorithmic trades directly into your demat</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="lg:col-span-1 bg-card border border-border p-5 rounded-none shadow-sm">
                  <h3 className="text-sm font-bold text-foreground mb-4">Connect Broker Gateway</h3>
                  <form onSubmit={handleConnectDemat} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-muted-foreground mb-1">Select Demat Broker</label>
                      <select
                        value={brokerSelect}
                        onChange={(e) => setBrokerSelect(e.target.value)}
                        className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none font-bold"
                      >
                        <option value="zerodha">Zerodha Kite</option>
                        <option value="angelone">Angel One</option>
                        <option value="upstox">Upstox</option>
                        <option value="dhan">Dhan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1">Broker User ID</label>
                      <input
                        type="text"
                        required
                        value={brokerUserId}
                        onChange={(e) => setBrokerUserId(e.target.value)}
                        placeholder="e.g. AB1234"
                        className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none focus:border-primary text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1">API Key</label>
                      <input
                        type="text"
                        required
                        value={brokerKey}
                        onChange={(e) => setBrokerKey(e.target.value)}
                        placeholder="KiteConnect api_key"
                        className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none focus:border-primary text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1">API Secret Key</label>
                      <input
                        type="password"
                        required
                        value={brokerSecret}
                        onChange={(e) => setBrokerSecret(e.target.value)}
                        placeholder="KiteConnect secret"
                        className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none focus:border-primary text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1">TOTP Secret (For 2FA Auto-Login)</label>
                      <input
                        type="text"
                        required
                        value={brokerTotp}
                        onChange={(e) => setBrokerTotp(e.target.value)}
                        placeholder="Google Authenticator secret string"
                        className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none focus:border-primary text-foreground"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-none mt-4"
                    >
                      Authenticate Session
                    </button>
                  </form>
                </div>

                {/* Linked Accounts */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-card border border-border p-5 rounded-none shadow-sm">
                    <h3 className="text-sm font-bold text-foreground mb-4">Active Broker Accounts</h3>
                    {credentials.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No active broker sessions found. Connect your credentials on the left.</p>
                    ) : (
                      <div className="space-y-4">
                        {credentials.map(cred => (
                          <div key={cred.id} className="p-4 bg-background border border-border rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                            <div>
                              <p className="font-bold text-foreground">{cred.broker} ({cred.userId})</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Session: Connected • Last sync {new Date(cred.lastConnected || '').toLocaleTimeString()}</p>
                              <div className="flex gap-4 mt-2 font-mono text-[10px]">
                                <span>Funds: ₹{cred.funds?.toLocaleString()}</span>
                                <span>Margin: ₹{cred.margin?.toLocaleString()}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDisconnectBroker(cred.id)}
                              className="w-full sm:w-auto px-3.5 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-bold rounded-none border border-rose-500/20 text-center shrink-0 cursor-pointer"
                            >
                              Sever Connection
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USER TAB 3: SUBSCRIPTION PLAN */}
          {activeTab === 'user_subscription' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">License & Subscription</h2>
                  <p className="text-xs text-muted-foreground">View current subscription allocation settings and license constraints</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Plan */}
                <div className="lg:col-span-1 bg-card border border-border p-5 rounded-none shadow-sm space-y-4">
                  <span className="text-[9px] uppercase font-extrabold tracking-wider bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
                    Current Active License
                  </span>
                  <div>
                    {(() => {
                      const activePlan = plans.find(p => p.id === user?.planId);
                      return (
                        <>
                          <h3 className="text-lg font-bold text-foreground">
                            {activePlan?.name || 'Pro Scalper'}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Billing Cycle: <strong className="text-primary">{activePlan ? getPlanBillingCycleText(activePlan) : 'Monthly'}</strong>
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Renewal due in {activePlan?.durationDays || 18} Days ({activePlan?.durationDays || 30}-day template)
                          </p>
                        </>
                      );
                    })()}
                  </div>
                  <div className="border-t border-border/60 pt-3 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Lot Size limit:</span>
                      <span className="font-bold font-mono">
                        {plans.find(p => p.id === user?.planId)?.maxLotLimit || 10} Lots
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Allocated Capital:</span>
                      <span className="font-bold font-mono">
                        ₹{(plans.find(p => p.id === user?.planId)?.maxCapital || 5000000).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Open Positions:</span>
                      <span className="font-bold">
                        {plans.find(p => p.id === user?.planId)?.maxOpenPositions || 5} Open Trades
                      </span>
                    </div>
                  </div>
                </div>

                {/* Available Plans Catalog */}
                <div className="lg:col-span-2 bg-card border border-border p-5 rounded-none shadow-sm">
                  <h3 className="text-sm font-bold text-foreground mb-4 font-bold">License Upgrades Directory</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {plans.filter(p => p.status === 'active' && p.id !== user?.planId).map(plan => (
                      <div key={plan.id} className="p-4 border border-border bg-background/50 rounded-none flex flex-col justify-between hover:border-primary/40 transition-colors">
                        <div>
                          <h4 className="font-bold text-xs text-foreground">{plan.name}</h4>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Limits: {plan.maxLotLimit} Lots • Max Cap ₹{plan.maxCapital.toLocaleString()}
                          </p>
                          <p className="text-sm font-black text-primary mt-2">
                            ₹{plan.price.toLocaleString()} / <span className="uppercase text-[10px] tracking-wider">{getPlanBillingCycleText(plan)}</span>
                          </p>
                        </div>
                        <button 
                          onClick={() => addToast('info', 'Upgrade Requested', `Upgrade request for ${plan.name} has been sent to support.`)} 
                          className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-none mt-4 hover:bg-primary/95 transition-colors cursor-pointer"
                        >
                          Request Upgrade
                        </button>
                      </div>
                    ))}
                    {plans.filter(p => p.status === 'active' && p.id !== user?.planId).length === 0 && (
                      <p className="text-xs text-muted-foreground col-span-2 py-4">No alternative license upgrade templates available at this time.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USER TAB 4: TRADING SETTINGS */}
          {activeTab === 'user_trading_settings' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Personalized Safety Limits & Risk Parameters</h2>
                  <p className="text-xs text-muted-foreground">Set your default lot sizes, stop loss rules, and maximum active positions</p>
                </div>
              </div>

              <div className="bg-card border border-border p-5 rounded-none max-w-lg shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-4">Risk Controls Configuration</h3>
                <form onSubmit={handleUpdateRiskSettings} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted-foreground mb-1">Default Lot Size (Sizing)</label>
                      <input
                        type="number"
                        required
                        value={riskDefaultLotSize}
                        onChange={(e) => setRiskDefaultLotSize(e.target.value)}
                        className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none text-foreground font-mono focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1">Daily Loss Limit (₹)</label>
                      <input
                        type="number"
                        required
                        value={riskDailyLimit}
                        onChange={(e) => setRiskDailyLimit(e.target.value)}
                        className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none text-foreground font-mono focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted-foreground mb-1">Stop Loss Percentage (SL%)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={riskStopLoss}
                        onChange={(e) => setRiskStopLoss(e.target.value)}
                        className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none text-foreground font-mono focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1">Target Profit Percentage (TP%)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={riskTarget}
                        onChange={(e) => setRiskTarget(e.target.value)}
                        className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none text-foreground font-mono focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-muted-foreground mb-1">Max Open Positions Count</label>
                    <input
                      type="number"
                      required
                      value={riskMaxTrades}
                      onChange={(e) => setRiskMaxTrades(e.target.value)}
                      className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none text-foreground font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingRiskSettings}
                    className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-none mt-4"
                  >
                    {isUpdatingRiskSettings ? 'Updating safety params...' : 'Save Safety Configurations'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* USER TAB 5: ORDERS & REPORTS */}
          {activeTab === 'user_orders_reports' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Transaction Ledgers & Reports</h2>
                  <p className="text-xs text-muted-foreground">Complete record of your demat buy and sell order fills</p>
                </div>
              </div>

              {/* Orders ledger */}
              <div className="w-full overflow-x-auto md:overflow-visible">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-xs font-bold text-muted-foreground">
                      <th className="p-4 py-3">Transaction ID</th>
                      <th className="p-4 py-3">Strategy Model</th>
                      <th className="p-4 py-3">Instrument</th>
                      <th className="p-4 py-3">Type</th>
                      <th className="p-4 py-3">Price</th>
                      <th className="p-4 py-3">Lots</th>
                      <th className="p-4 py-3 text-right">Yield</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs font-mono">
                    {trades.map(trade => (
                      <tr key={trade.id} className="hover:bg-muted/10 transition-colors whitespace-nowrap">
                        <td className="p-4 py-3.5 font-bold">{trade.id}</td>
                        <td className="p-4 py-3.5 text-foreground font-semibold">{trade.strategyName}</td>
                        <td className="p-4 py-3.5">{trade.instrument}</td>
                        <td className="p-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="p-4 py-3.5 text-foreground">₹{trade.price.toFixed(2)}</td>
                        <td className="p-4 py-3.5 font-bold">{trade.quantity}</td>
                        <td className="p-4 py-3.5 text-right">
                          {trade.pnl !== undefined ? (
                            <span className={`font-extrabold ${trade.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {trade.pnl >= 0 ? '+' : ''}₹{trade.pnl.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/45">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USER TAB 6: PROFILE & SECURITY */}
          {activeTab === 'user_profile' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Profile Settings</h2>
                  <p className="text-xs text-muted-foreground">Manage authorized email coordinates, credentials password and multi-factor safety tokens</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border p-5 rounded-none space-y-3.5 text-xs shadow-sm">
                  <h3 className="text-sm font-bold text-foreground mb-2">User Details</h3>
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <span className="text-muted-foreground font-semibold">Profile Name:</span>
                    <span className="font-bold text-foreground">{user?.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <span className="text-muted-foreground font-semibold">Registered Email:</span>
                    <span className="font-mono text-foreground">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <span className="text-muted-foreground font-semibold">Access Privilege:</span>
                    <span className="capitalize font-bold text-primary">{user?.role} Role</span>
                  </div>
                </div>

                <div className="bg-card border border-border p-5 rounded-none space-y-4 text-xs shadow-sm">
                  <h3 className="text-sm font-bold text-foreground">Security Toggles</h3>
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <div>
                      <p className="font-semibold text-foreground">Enforce 2FA Authenticator Token</p>
                      <p className="text-[10px] text-muted-foreground">Mandates typing 6-digit pin during login</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 cursor-pointer accent-primary" />
                  </div>
                  <button
                    onClick={() => addToast('success', 'Security Token Generated', 'New 2FA setup QR Code token generated.')}
                    className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-none mt-4"
                  >
                    Setup New Authenticator Token
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= GLOBAL DIALOG MODALS ================= */}

          {/* Modal 1: Add User Sheet (Side Drawer) */}
          {showAddUserModal && (
            <div className="fixed inset-0 z-50 flex justify-end">
              {/* Backdrop click outside to close */}
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddUserModal(false)} />
              
              <div className="bg-card border-l border-border w-full max-w-lg h-full shadow-2xl flex flex-col relative animate-slide-in-right z-10">
                {/* Form wraps the entire layout to keep submission and buttons linked */}
                <form onSubmit={handleCreateUser} className="flex flex-col h-full w-full justify-between">
                  {/* Header & Scrollable Fields */}
                  <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    <div className="flex justify-between items-center border-b border-border pb-4">
                      <div>
                        <h3 className="text-base font-bold text-foreground">Create User Account</h3>
                        <p className="text-xs text-muted-foreground mt-1">Provision a new retail trader or admin user to access the terminal</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddUserModal(false)}
                        className="p-1.5 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="block text-muted-foreground mb-1.5 font-semibold">Full Name</label>
                        <input 
                          type="text" 
                          required 
                          value={newUserName} 
                          onChange={(e) => setNewUserName(e.target.value)} 
                          className="w-full bg-background border border-border rounded-none px-3.5 py-2.5 outline-none focus:border-primary text-foreground font-semibold placeholder:text-muted-foreground/50 transition-colors"
                          placeholder="e.g. John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-muted-foreground mb-1.5 font-semibold">Email Address</label>
                        <input 
                          type="email" 
                          required 
                          value={newUserEmail} 
                          onChange={(e) => setNewUserEmail(e.target.value)} 
                          className="w-full bg-background border border-border rounded-none px-3.5 py-2.5 outline-none focus:border-primary text-foreground font-semibold placeholder:text-muted-foreground/50 transition-colors"
                          placeholder="e.g. john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-muted-foreground mb-1.5 font-semibold">Password</label>
                        <input 
                          type="password" 
                          required 
                          value={newUserPassword} 
                          onChange={(e) => setNewUserPassword(e.target.value)} 
                          className="w-full bg-background border border-border rounded-none px-3.5 py-2.5 outline-none focus:border-primary text-foreground font-semibold placeholder:text-muted-foreground/50 transition-colors"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-muted-foreground mb-1.5 font-semibold">Account Access Role</label>
                        <select 
                          value={newUserRole} 
                          onChange={(e: any) => setNewUserRole(e.target.value)} 
                          className="w-full bg-background border border-border rounded-none px-3.5 py-2.5 outline-none font-bold text-foreground"
                        >
                          <option value="user">Retail Trader (User)</option>
                          <option value="admin">System Operations (Admin)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Pinned Bottom Footer Action Row */}
                  <div className="p-6 border-t border-border bg-card flex justify-end gap-3 shrink-0">
                    <button 
                      type="button" 
                      onClick={() => setShowAddUserModal(false)} 
                      className="px-5 py-2.5 rounded-none border border-border text-muted-foreground hover:bg-muted font-bold transition-colors cursor-pointer text-xs"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-2.5 rounded-none bg-primary text-primary-foreground font-bold shadow-md hover:opacity-90 transition-opacity cursor-pointer text-xs"
                    >
                      Create User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal 2: Add Subscription Plan Modal */}
          {showAddPlanModal && (
            <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border w-full max-w-md rounded-none shadow-2xl p-6 relative animate-zoom-in">
                <button
                  onClick={() => setShowAddPlanModal(false)}
                  className="absolute right-4 top-4 p-1 rounded-none hover:bg-muted text-muted-foreground"
                >
                  <XCircle className="w-4 h-4" />
                </button>
                <h3 className="text-md font-bold text-foreground mb-1">Create Subscription Plan Template</h3>
                <p className="text-xs text-muted-foreground mb-5">Define a licensing model plan with specific sizing parameters</p>
                <form onSubmit={handleCreatePlan} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-muted-foreground mb-1">Plan Display Name</label>
                    <input type="text" required value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} placeholder="e.g. Premium Scalper" className="w-full bg-background border border-border rounded-none px-3 py-2 outline-none text-foreground" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-muted-foreground mb-1">Price (₹)</label>
                      <input type="number" required value={newPlanPrice} onChange={(e) => setNewPlanPrice(e.target.value)} placeholder="4999" className="w-full bg-background border border-border rounded-none px-3 py-2 outline-none text-foreground" />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1">Billing Cycle</label>
                      <select 
                        value={newPlanBillingCycle} 
                        onChange={(e) => {
                          const cycle = e.target.value;
                          setNewPlanBillingCycle(cycle);
                          if (cycle === 'Monthly') setNewPlanDuration('30');
                          else if (cycle === 'Quarterly') setNewPlanDuration('90');
                          else if (cycle === 'Half-Yearly') setNewPlanDuration('180');
                          else if (cycle === 'Yearly') setNewPlanDuration('365');
                        }}
                        className="w-full bg-background border border-border rounded-none px-3 py-2 outline-none text-foreground font-bold"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Half-Yearly">Half-Yearly</option>
                        <option value="Yearly">Yearly</option>
                        <option value="Custom">Custom Days</option>
                      </select>
                    </div>
                  </div>

                  {newPlanBillingCycle === 'Custom' && (
                    <div className="animate-zoom-in">
                      <label className="block text-muted-foreground mb-1">Custom Duration (Days)</label>
                      <input 
                        type="number" 
                        required 
                        value={newPlanDuration} 
                        onChange={(e) => setNewPlanDuration(e.target.value)} 
                        placeholder="e.g. 45" 
                        className="w-full bg-background border border-border rounded-none px-3 py-2 outline-none text-foreground font-mono" 
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-muted-foreground mb-1">Max Lot limit</label>
                      <input type="number" value={newPlanMaxLot} onChange={(e) => setNewPlanMaxLot(e.target.value)} className="w-full bg-background border border-border rounded-none px-3 py-2 outline-none text-foreground" />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1">Max Cap (₹)</label>
                      <input type="number" value={newPlanMaxCapital} onChange={(e) => setNewPlanMaxCapital(e.target.value)} className="w-full bg-background border border-border rounded-none px-3 py-2 outline-none text-foreground" />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1">Max Open Pos</label>
                      <input type="number" value={newPlanMaxOpenPositions} onChange={(e) => setNewPlanMaxOpenPositions(e.target.value)} className="w-full bg-background border border-border rounded-none px-3 py-2 outline-none text-foreground" />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end pt-4 border-t border-border mt-5">
                    <button type="button" onClick={() => setShowAddPlanModal(false)} className="px-4 py-2 rounded-none border border-border text-muted-foreground hover:bg-muted font-semibold">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-none bg-primary text-primary-foreground font-bold shadow">Save Plan</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal 3: Broadcast Signal Modal */}
          {showBroadcastSignalModal && (
            <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border w-full max-w-md rounded-none shadow-2xl p-6 relative animate-zoom-in">
                <button
                  onClick={() => setShowBroadcastSignalModal(false)}
                  className="absolute right-4 top-4 p-1 rounded-none hover:bg-muted text-muted-foreground"
                >
                  <XCircle className="w-4 h-4" />
                </button>
                <h3 className="text-md font-bold text-foreground mb-1">Broadcast Manual Order Signal</h3>
                <p className="text-xs text-muted-foreground mb-5">Instantly pushes buy/sell orders executing across subscribed user demat</p>
                <form onSubmit={handleBroadcastSignal} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-muted-foreground mb-1.5">Trade Instrument</label>
                    <select value={sigInstrument} onChange={(e) => setSigInstrument(e.target.value)} className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none font-bold">
                      <option value="NIFTY 50">NIFTY 50</option>
                      <option value="BANKNIFTY">BANKNIFTY</option>
                      <option value="FINNIFTY">FINNIFTY</option>
                      <option value="SENSEX">SENSEX</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5">Order Type Direction</label>
                    <select value={sigType} onChange={(e: any) => setSigType(e.target.value)} className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none font-bold">
                      <option value="BUY">BUY ORDER (Long)</option>
                      <option value="SELL">SELL ORDER (Short)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5">Execution Reference Price (₹)</label>
                    <input type="number" step="0.05" required value={sigPrice} onChange={(e) => setSigPrice(e.target.value)} className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none text-foreground font-mono font-bold" />
                  </div>
                  <div className="flex gap-3 justify-end pt-4 border-t border-border mt-5">
                    <button type="button" onClick={() => setShowBroadcastSignalModal(false)} className="px-4 py-2.5 rounded-none border border-border text-muted-foreground hover:bg-muted font-semibold">Cancel</button>
                    <button type="submit" className="px-4 py-2.5 rounded-none bg-primary text-primary-foreground font-bold shadow">Broadcast Live</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal 4: Assign Plan Modal */}
          {showAssignPlanModal && selectedUserForPlan && (
            <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border w-full max-w-md rounded-none shadow-2xl p-6 relative animate-zoom-in">
                <button
                  onClick={() => setShowAssignPlanModal(false)}
                  className="absolute right-4 top-4 p-1 rounded-none hover:bg-muted text-muted-foreground"
                >
                  <XCircle className="w-4 h-4" />
                </button>
                <h3 className="text-md font-bold text-foreground mb-1">Assign Subscription License</h3>
                <p className="text-xs text-muted-foreground mb-5">Link a specific subscription model to user: <strong>{selectedUserForPlan.name}</strong></p>
                <form onSubmit={handleAssignPlan} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-muted-foreground mb-1.5">Choose License Model Template</label>
                    <select
                      value={assignedPlanId}
                      onChange={(e) => setAssignedPlanId(e.target.value)}
                      className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none font-bold"
                    >
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3 justify-end pt-4 border-t border-border mt-5">
                    <button type="button" onClick={() => setShowAssignPlanModal(false)} className="px-4 py-2.5 rounded-none border border-border text-muted-foreground hover:bg-muted font-semibold">Cancel</button>
                    <button type="submit" className="px-4 py-2.5 rounded-none bg-primary text-primary-foreground font-bold shadow">Assign License</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal 5: View User Details Sheet (Side Drawer) */}
          {showViewUserModal && selectedUserForView && (
            <div className="fixed inset-0 z-50 flex justify-end">
              {/* Backdrop click outside to close */}
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowViewUserModal(false)} />
              
              <div className="bg-card border-l border-border w-full max-w-lg h-full shadow-2xl flex flex-col relative animate-slide-in-right z-10 justify-between">
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                  <div className="flex justify-between items-center border-b border-border pb-4">
                    <div>
                      <h3 className="text-base font-bold text-foreground font-sans">User Account Details</h3>
                      <p className="text-xs text-muted-foreground mt-1">Full system credentials and profile configurations for user</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowViewUserModal(false)}
                      className="p-1.5 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">User ID</span>
                      <span className="font-mono text-foreground font-semibold bg-muted px-2 py-0.5">{selectedUserForView.id}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">Full Name</span>
                      <span className="text-foreground font-bold text-sm">{selectedUserForView.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">Email Address</span>
                      <span className="font-mono text-foreground">{selectedUserForView.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">Access Privilege</span>
                      <span className="capitalize font-bold text-primary">{selectedUserForView.role} Role</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">Lot Size Multiplier</span>
                      <span className="font-mono font-bold text-foreground bg-primary/10 text-primary px-2 py-0.5">{selectedUserForView.lotMultiplier?.toFixed(2) || '1.00'}x</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">Authorization Status</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        selectedUserForView.status !== 'suspended' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {selectedUserForView.status !== 'suspended' ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">Profile Created At</span>
                      <span className="font-mono text-foreground">
                        {selectedUserForView.createdAt ? new Date(selectedUserForView.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">Last Session Login</span>
                      <span className="font-mono text-foreground">
                        {selectedUserForView.lastLogin ? new Date(selectedUserForView.lastLogin).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-muted/30 border-t border-border flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowViewUserModal(false)}
                    className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-none shadow hover:bg-primary/95 transition-colors cursor-pointer"
                  >
                    Close Sheet
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal 6: Edit User Details Sheet (Side Drawer) */}
          {showEditUserModal && selectedUserForEdit && (
            <div className="fixed inset-0 z-50 flex justify-end">
              {/* Backdrop click outside to close */}
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowEditUserModal(false)} />
              
              <div className="bg-card border-l border-border w-full max-w-lg h-full shadow-2xl flex flex-col relative animate-slide-in-right z-10 justify-between">
                <form onSubmit={handleUpdateUserDetails} className="flex flex-col h-full w-full justify-between">
                  <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    <div className="flex justify-between items-center border-b border-border pb-4">
                      <div>
                        <h3 className="text-base font-bold text-foreground">Edit User Profile</h3>
                        <p className="text-xs text-muted-foreground mt-1">Modify name, email, credentials and sizing coordinates for user</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowEditUserModal(false)}
                        className="p-1.5 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="block text-muted-foreground mb-1.5 font-semibold">Full Name</label>
                        <input 
                          type="text" 
                          required 
                          value={editUserName} 
                          onChange={(e) => setEditUserName(e.target.value)} 
                          className="w-full bg-background border border-border rounded-none px-3.5 py-2.5 outline-none focus:border-primary text-foreground font-semibold placeholder:text-muted-foreground/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-muted-foreground mb-1.5 font-semibold">Email Address</label>
                        <input 
                          type="email" 
                          required 
                          value={editUserEmail} 
                          onChange={(e) => setEditUserEmail(e.target.value)} 
                          className="w-full bg-background border border-border rounded-none px-3.5 py-2.5 outline-none focus:border-primary text-foreground font-semibold placeholder:text-muted-foreground/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-muted-foreground mb-1.5 font-semibold">System Privilege Role</label>
                        <select 
                          value={editUserRole} 
                          onChange={(e: any) => setEditUserRole(e.target.value)} 
                          className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none font-bold text-foreground"
                        >
                          <option value="user">User (Standard privilege)</option>
                          <option value="admin">Admin (Full administrative controls)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-muted-foreground mb-1.5 font-semibold">Lot Size Multiplier Factor</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          min="0.1"
                          required 
                          value={editUserMultiplier} 
                          onChange={(e) => setEditUserMultiplier(e.target.value)} 
                          className="w-full bg-background border border-border rounded-none px-3.5 py-2.5 outline-none focus:border-primary text-foreground font-semibold font-mono placeholder:text-muted-foreground/50 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-muted/30 border-t border-border flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowEditUserModal(false)}
                      className="px-5 py-2.5 rounded-none border border-border text-muted-foreground hover:bg-muted font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-none bg-primary text-primary-foreground font-bold shadow hover:bg-primary/95 transition-colors cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal 7: Delete User Confirmation Modal */}
          {showDeleteUserModal && selectedUserForDelete && (
            <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-rose-500/30 w-full max-w-md rounded-none shadow-2xl p-6 relative animate-zoom-in">
                <button
                  onClick={() => setShowDeleteUserModal(false)}
                  className="absolute right-4 top-4 p-1 rounded-none hover:bg-muted text-muted-foreground"
                >
                  <XCircle className="w-4 h-4" />
                </button>
                <h3 className="text-md font-bold text-red-500 mb-1">Purge User Profile</h3>
                <p className="text-xs text-muted-foreground mb-5">This action will completely remove this user account and sever all connected Indian broker gateway credentials.</p>
                
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs space-y-2 mb-5">
                  <p className="font-bold">Warning: Permanent Deletion</p>
                  <p>You are purging the profile of: <strong>{selectedUserForDelete.name}</strong> ({selectedUserForDelete.email}). There is no undo option.</p>
                </div>

                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowDeleteUserModal(false)} className="px-4 py-2.5 rounded-none border border-border text-muted-foreground hover:bg-muted font-semibold">Cancel</button>
                  <button type="button" onClick={() => handleDeleteUser(selectedUserForDelete.id)} className="px-4 py-2.5 rounded-none bg-red-600 hover:bg-red-700 text-white font-bold shadow">Permanently Delete</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal 8: View Subscription Plan Details Sheet (Side Drawer) */}
          {showViewPlanModal && selectedPlanForView && (
            <div className="fixed inset-0 z-50 flex justify-end">
              {/* Backdrop click outside to close */}
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowViewPlanModal(false)} />
              
              <div className="bg-card border-l border-border w-full max-w-lg h-full shadow-2xl flex flex-col relative animate-slide-in-right z-10 justify-between">
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                  <div className="flex justify-between items-center border-b border-border pb-4">
                    <div>
                      <h3 className="text-base font-bold text-foreground font-sans">Plan Template Details</h3>
                      <p className="text-xs text-muted-foreground mt-1">Full pricing schema, duration configuration, and lot/sizing parameters</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowViewPlanModal(false)}
                      className="p-1.5 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">Template ID</span>
                      <span className="font-mono text-foreground font-semibold bg-muted px-2 py-0.5">{selectedPlanForView.id}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">Plan Name</span>
                      <span className="text-foreground font-bold text-sm">{selectedPlanForView.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">Price</span>
                      <span className="font-bold text-foreground text-sm text-primary">₹{selectedPlanForView.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">Billing Cycle / Duration</span>
                      <span className="capitalize font-bold text-foreground">
                        {getPlanBillingCycleText(selectedPlanForView)} ({selectedPlanForView.durationDays} Days)
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">Max Lot Limit Cap</span>
                      <span className="font-mono font-bold text-foreground bg-primary/10 text-primary px-2 py-0.5">{selectedPlanForView.maxLotLimit} Lots</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">Max Capital Sizing Cap</span>
                      <span className="font-mono font-bold text-foreground">₹{selectedPlanForView.maxCapital.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">Max Open Positions Cap</span>
                      <span className="font-bold text-foreground">{selectedPlanForView.maxOpenPositions} Positions</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-muted/30 border-t border-border flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowViewPlanModal(false)}
                    className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-none shadow hover:bg-primary/95 transition-colors cursor-pointer text-xs"
                  >
                    Close Sheet
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal 9: Edit Subscription Plan Details Sheet (Side Drawer) */}
          {showEditPlanModal && selectedPlanForEdit && (
            <div className="fixed inset-0 z-50 flex justify-end">
              {/* Backdrop click outside to close */}
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowEditPlanModal(false)} />
              
              <div className="bg-card border-l border-border w-full max-w-lg h-full shadow-2xl flex flex-col relative animate-slide-in-right z-10 justify-between">
                <form onSubmit={handleUpdatePlanDetails} className="flex flex-col h-full w-full justify-between">
                  <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    <div className="flex justify-between items-center border-b border-border pb-4">
                      <div>
                        <h3 className="text-base font-bold text-foreground">Edit Subscription Plan Template</h3>
                        <p className="text-xs text-muted-foreground mt-1">Modify name, price, billing cycle duration and max risk coordinates for plan</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowEditPlanModal(false)}
                        className="p-1.5 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="block text-muted-foreground mb-1.5 font-semibold">Plan Display Name</label>
                        <input 
                          type="text" 
                          required 
                          value={editPlanName} 
                          onChange={(e) => setEditPlanName(e.target.value)} 
                          className="w-full bg-background border border-border rounded-none px-3.5 py-2.5 outline-none focus:border-primary text-foreground font-semibold placeholder:text-muted-foreground/50 transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-muted-foreground mb-1.5 font-semibold">Price (₹)</label>
                          <input 
                            type="number" 
                            required 
                            value={editPlanPrice} 
                            onChange={(e) => setEditPlanPrice(e.target.value)} 
                            className="w-full bg-background border border-border rounded-none px-3.5 py-2.5 outline-none focus:border-primary text-foreground font-semibold transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-muted-foreground mb-1.5 font-semibold">Billing Cycle</label>
                          <select 
                            value={editPlanBillingCycle} 
                            onChange={(e) => {
                              const cycle = e.target.value;
                              setEditPlanBillingCycle(cycle);
                              if (cycle === 'Monthly') setEditPlanDuration('30');
                              else if (cycle === 'Quarterly') setEditPlanDuration('90');
                              else if (cycle === 'Half-Yearly') setEditPlanDuration('180');
                              else if (cycle === 'Yearly') setEditPlanDuration('365');
                            }}
                            className="w-full bg-background border border-border rounded-none px-3.5 py-2.5 outline-none font-bold text-foreground"
                          >
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Half-Yearly">Half-Yearly</option>
                            <option value="Yearly">Yearly</option>
                            <option value="Custom">Custom Days</option>
                          </select>
                        </div>
                      </div>

                      {editPlanBillingCycle === 'Custom' && (
                        <div className="animate-zoom-in">
                          <label className="block text-muted-foreground mb-1.5 font-semibold">Custom Duration (Days)</label>
                          <input 
                            type="number" 
                            required 
                            value={editPlanDuration} 
                            onChange={(e) => setEditPlanDuration(e.target.value)} 
                            className="w-full bg-background border border-border rounded-none px-3.5 py-2.5 outline-none focus:border-primary text-foreground font-semibold font-mono transition-colors" 
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-muted-foreground mb-1.5 font-semibold">Max Lot Limit</label>
                          <input 
                            type="number" 
                            required
                            value={editPlanMaxLot} 
                            onChange={(e) => setEditPlanMaxLot(e.target.value)} 
                            className="w-full bg-background border border-border rounded-none px-3.5 py-2.5 outline-none focus:border-primary text-foreground font-semibold transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-muted-foreground mb-1.5 font-semibold">Max Cap (₹)</label>
                          <input 
                            type="number" 
                            required
                            value={editPlanMaxCapital} 
                            onChange={(e) => setEditPlanMaxCapital(e.target.value)} 
                            className="w-full bg-background border border-border rounded-none px-3.5 py-2.5 outline-none focus:border-primary text-foreground font-semibold transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-muted-foreground mb-1.5 font-semibold">Max Open Pos</label>
                          <input 
                            type="number" 
                            required
                            value={editPlanMaxOpenPositions} 
                            onChange={(e) => setEditPlanMaxOpenPositions(e.target.value)} 
                            className="w-full bg-background border border-border rounded-none px-3.5 py-2.5 outline-none focus:border-primary text-foreground font-semibold transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-muted/30 border-t border-border flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowEditPlanModal(false)}
                      className="px-5 py-2.5 rounded-none border border-border text-muted-foreground hover:bg-muted font-semibold cursor-pointer text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-none bg-primary text-primary-foreground font-bold shadow hover:bg-primary/95 transition-colors cursor-pointer text-xs"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal 10: View Broker Details Sheet (Side Drawer) */}
          {showViewBrokerModal && selectedBrokerForView && (
            <div className="fixed inset-0 z-50 flex justify-end">
              {/* Backdrop click outside to close */}
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowViewBrokerModal(false)} />
              
              <div className="bg-card border-l border-border w-full max-w-lg h-full shadow-2xl flex flex-col relative animate-slide-in-right z-10 justify-between">
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                  <div className="flex justify-between items-center border-b border-border pb-4">
                    <div>
                      <h3 className="text-base font-bold text-foreground font-sans">Broker Gateway Details</h3>
                      <p className="text-xs text-muted-foreground mt-1">Full configurations, parameters and live connection status</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowViewBrokerModal(false)}
                      className="p-1.5 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">Gateway Code</span>
                      <span className="font-mono text-foreground font-semibold bg-muted px-2 py-0.5">{selectedBrokerForView.id}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">Broker Name</span>
                      <span className="text-foreground font-bold text-sm">{selectedBrokerForView.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">OAuth Handshake Status</span>
                      <span className="font-semibold text-emerald-500">Live API SDK Handshake (KiteConnect v3)</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">Interactive Login Requirement</span>
                      <span className="font-semibold text-foreground">Requires TOTP on daily login</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">Gateway Status</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        selectedBrokerForView.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                      }`}>
                        {selectedBrokerForView.enabled ? 'Active / Enabled' : 'Inactive / Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-muted/30 border-t border-border flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowViewBrokerModal(false)}
                    className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-none shadow hover:bg-primary/95 transition-colors cursor-pointer text-xs"
                  >
                    Close Sheet
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal 11: Edit Broker Details Sheet (Side Drawer) */}
          {showEditBrokerModal && selectedBrokerForEdit && (
            <div className="fixed inset-0 z-50 flex justify-end">
              {/* Backdrop click outside to close */}
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowEditBrokerModal(false)} />
              
              <div className="bg-card border-l border-border w-full max-w-lg h-full shadow-2xl flex flex-col relative animate-slide-in-right z-10 justify-between">
                <form onSubmit={handleUpdateBroker} className="flex flex-col h-full w-full justify-between">
                  <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    <div className="flex justify-between items-center border-b border-border pb-4">
                      <div>
                        <h3 className="text-base font-bold text-foreground">Edit Broker Gateway</h3>
                        <p className="text-xs text-muted-foreground mt-1">Modify broker display name and connection routing parameters</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowEditBrokerModal(false)}
                        className="p-1.5 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="block text-muted-foreground mb-1.5 font-semibold">Broker Name</label>
                        <input 
                          type="text" 
                          required 
                          value={editBrokerName} 
                          onChange={(e) => setEditBrokerName(e.target.value)} 
                          className="w-full bg-background border border-border rounded-none px-3.5 py-2.5 outline-none focus:border-primary text-foreground font-semibold placeholder:text-muted-foreground/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-muted-foreground mb-1.5 font-semibold">Gateway Code (Read-Only)</label>
                        <input 
                          type="text" 
                          readOnly 
                          value={editBrokerId} 
                          className="w-full bg-muted border border-border rounded-none px-3.5 py-2.5 outline-none text-muted-foreground font-mono font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-muted/30 border-t border-border flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowEditBrokerModal(false)}
                      className="px-5 py-2.5 rounded-none border border-border text-muted-foreground hover:bg-muted font-semibold cursor-pointer text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-none bg-primary text-primary-foreground font-bold shadow hover:bg-primary/95 transition-colors cursor-pointer text-xs"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal 12: Delete Broker Confirmation Modal */}
          {showDeleteBrokerModal && selectedBrokerForDelete && (
            <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-rose-500/30 w-full max-w-md rounded-none shadow-2xl p-6 relative animate-zoom-in">
                <button
                  onClick={() => setShowDeleteBrokerModal(false)}
                  className="absolute right-4 top-4 p-1 rounded-none hover:bg-muted text-muted-foreground"
                >
                  <XCircle className="w-4 h-4" />
                </button>
                <h3 className="text-md font-bold text-red-500 mb-1">Delete Broker Template</h3>
                <p className="text-xs text-muted-foreground mb-5">This action will completely remove this broker gateway option from the list of supported integrations.</p>
                
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs space-y-2 mb-5">
                  <p className="font-bold">Warning: Permanent Deletion</p>
                  <p>You are purging the broker integration: <strong>{selectedBrokerForDelete.name}</strong> ({selectedBrokerForDelete.id}).</p>
                </div>

                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowDeleteBrokerModal(false)} className="px-4 py-2.5 rounded-none border border-border text-muted-foreground hover:bg-muted font-semibold">Cancel</button>
                  <button type="button" onClick={() => handleDeleteBroker(selectedBrokerForDelete.id)} className="px-4 py-2.5 rounded-none bg-red-600 hover:bg-red-700 text-white font-bold shadow">Permanently Delete</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal 13: View Signal Details Sheet (Side Drawer) */}
          {showViewSignalModal && selectedSignalForView && (
            <div className="fixed inset-0 z-50 flex justify-end">
              {/* Backdrop click outside to close */}
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowViewSignalModal(false)} />
              
              <div className="bg-card border-l border-border w-full max-w-lg h-full shadow-2xl flex flex-col relative animate-slide-in-right z-10 justify-between">
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                  <div className="flex justify-between items-center border-b border-border pb-4">
                    <div>
                      <h3 className="text-base font-bold text-foreground font-sans">Signal Details</h3>
                      <p className="text-xs text-muted-foreground mt-1">Full configurations, parameters and broadcast timestamp</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowViewSignalModal(false)}
                      className="p-1.5 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs font-mono">
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold font-sans">Signal ID</span>
                      <span className="text-foreground font-semibold bg-muted px-2 py-0.5">{selectedSignalForView.id}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold font-sans">Instrument</span>
                      <span className="text-foreground font-bold text-sm font-sans">{selectedSignalForView.instrument}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold font-sans">Signal Type</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        selectedSignalForView.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {selectedSignalForView.type}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold font-sans">Reference Price</span>
                      <span className="font-bold text-foreground">₹{selectedSignalForView.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold font-sans">Broadcast Time</span>
                      <span className="text-muted-foreground font-sans">{new Date(selectedSignalForView.time).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold font-sans">Status</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold capitalize font-sans">
                        {selectedSignalForView.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-muted/30 border-t border-border flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowViewSignalModal(false)}
                    className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-none shadow hover:bg-primary/95 transition-colors cursor-pointer text-xs"
                  >
                    Close Sheet
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal 14: Delete Signal Confirmation Modal */}
          {showDeleteSignalModal && selectedSignalForDelete && (
            <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-rose-500/30 w-full max-w-md rounded-none shadow-2xl p-6 relative animate-zoom-in">
                <button
                  onClick={() => setShowDeleteSignalModal(false)}
                  className="absolute right-4 top-4 p-1 rounded-none hover:bg-muted text-muted-foreground"
                >
                  <XCircle className="w-4 h-4" />
                </button>
                <h3 className="text-md font-bold text-red-500 mb-1">Delete Trading Signal</h3>
                <p className="text-xs text-muted-foreground mb-5">This action will completely remove this broadcast signal history log from the dashboard database.</p>
                
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs space-y-2 mb-5">
                  <p className="font-bold">Warning: Permanent Deletion</p>
                  <p>You are purging signal: <strong>{selectedSignalForDelete.id}</strong> ({selectedSignalForDelete.instrument} - {selectedSignalForDelete.type} @ ₹{selectedSignalForDelete.price}).</p>
                </div>

                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowDeleteSignalModal(false)} className="px-4 py-2.5 rounded-none border border-border text-muted-foreground hover:bg-muted font-semibold">Cancel</button>
                  <button type="button" onClick={() => handleDeleteSignal(selectedSignalForDelete.id)} className="px-4 py-2.5 rounded-none bg-red-600 hover:bg-red-700 text-white font-bold shadow">Permanently Delete</button>
                </div>
              </div>
            </div>
          )}

        </main>

      </div>
    </div>
  );
}

export default App;
