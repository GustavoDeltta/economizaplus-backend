import { InterfaceUserRepository } from '../../domain/repositories/InterfaceUserRepository';
import { InterfaceTransactionRepository } from '../../domain/repositories/InterfaceTransactionRepository';

// ── DTOs existentes ───────────────────────────────────────────────────────────

export type AdminOverviewDTO = {
  totalUsers: number; totalUsersVariation: number;
  activeToday: number; activeTodayVariation: number;
  monthlyRevenue: number; monthlyRevenueVariation: number;
  premiumUsers: number; premiumUsersPct: number;
};
export type AdminDailySignupDTO    = { date: string; label: string; count: number };
export type AdminPlanDistributionDTO = { plan: string; count: number; color: string };
export type AdminTopUserDTO        = { id: string; name: string; plan: string; transactionCount: number; totalAmount: number };
export type AdminHealthMetricDTO   = { label: string; value: string; valueColor?: string };
export type AdminActivityItemDTO   = { id: string; type: 'signup'; message: string; highlight: string; timeLabel: string };
export type AdminStatsDTO = {
  overview: AdminOverviewDTO;
  dailySignups: AdminDailySignupDTO[];
  planDistribution: AdminPlanDistributionDTO[];
  topUsers: AdminTopUserDTO[];
  healthMetrics: AdminHealthMetricDTO[];
  recentActivity: AdminActivityItemDTO[];
};

// ── DTOs novos (CRUD) ─────────────────────────────────────────────────────────

export type AdminUserDetailDTO = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  authProvider: string;
  createdAt: string;
  transactionCount: number;
  totalAmount: number;
};

export type AdminUpdateUserDTO = {
  name?: string;
  email?: string;
  role?: 'COMMON' | 'ADMIN';
  plan?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const WEEK_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const PLAN_CONFIG: Record<string, { label: string; color: string }> = {
  PREMIUM:  { label: 'Premium', color: '#22C55E' },
  BASIC:    { label: 'Básico',  color: '#94A3B8' },
  INACTIVE: { label: 'Inativo', color: '#F43F5E' },
  LOCAL:    { label: 'Básico',  color: '#94A3B8' },
  GOOGLE:   { label: 'Básico',  color: '#94A3B8' }, 
};

function calcVariation(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

function timeAgo(date: Date): string {
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (diffMin < 1)  return 'agora';
  if (diffMin < 60) return `há ${diffMin} min`;    

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)   return `há ${diffH}h`;
  return `há ${Math.floor(diffH / 24)}d`;
}

// ── Service ───────────────────────────────────────────────────────────────────

export class AdminService {
  constructor(
    private userRepository: InterfaceUserRepository,
    private transactionRepository: InterfaceTransactionRepository,
  ) {}

  // ── Stats ─────────────────────────────────────────────────────────────────

  async getStats(): Promise<AdminStatsDTO> {
    const now = new Date();
    const startOfToday     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [allUsers, allTransactions] = await Promise.all([
      this.userRepository.findAll(),
      this.transactionRepository.findAll(),
    ]);

    const totalUsers          = allUsers.length;
    const newUsersThisMonth   = allUsers.filter((u) => u.createdAt >= startOfThisMonth).length;
    const newUsersLastMonth   = allUsers.filter((u) => u.createdAt >= startOfLastMonth && u.createdAt <= endOfLastMonth).length;
    const totalUsersVariation = calcVariation(newUsersThisMonth, newUsersLastMonth || 1);

    const userIdsActiveToday = new Set(
      allTransactions.filter((t) => t.createdAt != null && t.createdAt >= startOfToday).map((t) => t.userId),
    );
    const activeToday = userIdsActiveToday.size;
    const userIdsActiveLastMonthLastDay = new Set(
      allTransactions.filter((t) => {
        if (!t.createdAt) return false;
        const d = t.createdAt;
        return d.getFullYear() === endOfLastMonth.getFullYear() && d.getMonth() === endOfLastMonth.getMonth() && d.getDate() === endOfLastMonth.getDate();
      }).map((t) => t.userId),
    );
    const activeTodayVariation = calcVariation(activeToday, userIdsActiveLastMonthLastDay.size || 1);

    const monthlyRevenue    = allTransactions.filter((t) => t.type === 'INCOME' && t.createdAt != null && t.createdAt >= startOfThisMonth).reduce((s, t) => s + Number(t.amount), 0);
    const lastMonthRevenue  = allTransactions.filter((t) => t.type === 'INCOME' && t.createdAt != null && t.createdAt >= startOfLastMonth && t.createdAt <= endOfLastMonth).reduce((s, t) => s + Number(t.amount), 0);
    const monthlyRevenueVariation = calcVariation(monthlyRevenue, lastMonthRevenue || 1);

    const premiumUsers    = allUsers.filter((u) => u.plan === 'PREMIUM').length;
    const premiumUsersPct = totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0;

    const dailySignups: AdminDailySignupDTO[] = Array.from({ length: 7 }, (_, i) => {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
      const dayEnd   = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate(), 23, 59, 59, 999);
      return { date: dayStart.toISOString().slice(0, 10), label: WEEK_LABELS[dayStart.getDay()], count: allUsers.filter((u) => u.createdAt >= dayStart && u.createdAt <= dayEnd).length };
    });

    const planCountMap: Record<string, number> = {};
    for (const u of allUsers) planCountMap[u.plan] = (planCountMap[u.plan] ?? 0) + 1;
    const planDistribution = Object.entries(planCountMap).map(([plan, count]) => ({ plan: PLAN_CONFIG[plan]?.label ?? plan, count, color: PLAN_CONFIG[plan]?.color ?? '#94A3B8' }));

    const userStatsMap: Record<string, { count: number; total: number }> = {};
    for (const tx of allTransactions) {
      if (!tx.createdAt || tx.createdAt < startOfThisMonth) continue;
      userStatsMap[tx.userId] ??= { count: 0, total: 0 };
      userStatsMap[tx.userId].count += 1;
      userStatsMap[tx.userId].total += Number(tx.amount);
    }

    const topUsers = allUsers.map((u) => ({ id: u.id, name: u.name, plan: PLAN_CONFIG[u.plan]?.label ?? u.plan, transactionCount: userStatsMap[u.id]?.count ?? 0, totalAmount: userStatsMap[u.id]?.total ?? 0 })).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5);

    const healthMetrics: AdminHealthMetricDTO[] = [
      { label: 'Usuários totais',     value: totalUsers.toLocaleString('pt-BR') },
      { label: 'Novos este mês',      value: `+${newUsersThisMonth}` },
      { label: 'Ativos hoje',         value: activeToday.toLocaleString('pt-BR') },
      { label: 'Receita mensal',      value: monthlyRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), valueColor: '#22C55E' },
      { label: 'Variação de receita', value: `${monthlyRevenueVariation >= 0 ? '+' : ''}${monthlyRevenueVariation}%`, valueColor: monthlyRevenueVariation >= 0 ? '#22C55E' : '#F43F5E' },
      { label: 'Plano Premium',       value: `${premiumUsers} usuários (${premiumUsersPct}%)`, valueColor: '#A855F7' },
    ];

    const recentActivity = [...allUsers].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10).map((u) => ({ id: u.id, type: 'signup' as const, message: `Novo cadastro — ${u.name} aderiu ao plano ${PLAN_CONFIG[u.plan]?.label ?? u.plan}`, highlight: u.name, timeLabel: timeAgo(u.createdAt) }));

    return { overview: { totalUsers, totalUsersVariation, activeToday, activeTodayVariation, monthlyRevenue, monthlyRevenueVariation, premiumUsers, premiumUsersPct }, dailySignups, planDistribution, topUsers, healthMetrics, recentActivity };
  }

  // ── CRUD de usuários ──────────────────────────────────────────────────────

  private async _buildUserDetail(user: any, allTransactions: any[]): Promise<AdminUserDetailDTO> {
    const userTxs    = allTransactions.filter((t) => t.userId === user.id);
    const totalAmount = userTxs.reduce((s: number, t: any) => s + Number(t.amount), 0);
    return {
      id:               user.id,
      name:             user.name,
      email:            user.email,
      role:             user.role,
      plan:             user.plan,
      authProvider:     user.authProvider,
      createdAt:        user.createdAt.toISOString(),
      transactionCount: userTxs.length,
      totalAmount,
    };
  }

  async getAllUsers(): Promise<AdminUserDetailDTO[]> {
    const [allUsers, allTransactions] = await Promise.all([
      this.userRepository.findAll(),
      this.transactionRepository.findAll(),
    ]);
    return Promise.all(allUsers.map((u) => this._buildUserDetail(u, allTransactions)));
  }

  async getUserById(id: string): Promise<AdminUserDetailDTO> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error('Usuário não encontrado');
    const allTransactions = await this.transactionRepository.findAll();
    return this._buildUserDetail(user, allTransactions);
  }

  async updateUser(id: string, dto: AdminUpdateUserDTO): Promise<AdminUserDetailDTO> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error('Usuário não encontrado');

    const newName  = dto.name  ?? user.name;
    const newEmail = dto.email ?? user.email;
    await this.userRepository.update(id, newName, newEmail);

    if (dto.role !== undefined) {
      await this.userRepository.updateRole(id, dto.role);
    }
    if (dto.plan !== undefined) {
      await this.userRepository.updatePlan(id, dto.plan);
    }

    return this.getUserById(id);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error('Usuário não encontrado');
    await this.userRepository.delete(id);
  }
}