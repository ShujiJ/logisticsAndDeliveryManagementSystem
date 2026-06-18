import dashboardRepository from "../repositories/dashboardRepository";

type Granularity = "daily" | "weekly" | "monthly";

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // back to Sunday
  return d;
}

function buildRevenueStats(
  paidPayments: any[],
  fromDate: Date,
  toDate: Date,
  granularity: Granularity,
): { period: string; revenue: number }[] {
  if (granularity === "daily") {
    const keys: string[] = [];
    const cursor = new Date(fromDate);
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= toDate) {
      keys.push(cursor.toLocaleDateString("en-CA"));
      cursor.setDate(cursor.getDate() + 1);
    }
    const map: Record<string, number> = Object.fromEntries(keys.map((k) => [k, 0]));
    for (const p of paidPayments) {
      const key = new Date(p.paidAt).toLocaleDateString("en-CA");
      if (key in map) map[key] = (map[key] ?? 0) + Number(p.amount);
    }
    return keys.map((k) => ({ period: k, revenue: map[k] ?? 0 }));
  }

  if (granularity === "weekly") {
    const keys: string[] = [];
    const cursor = new Date(getWeekStart(fromDate));
    while (cursor <= toDate) {
      keys.push(cursor.toLocaleDateString("en-CA"));
      cursor.setDate(cursor.getDate() + 7);
    }
    const map: Record<string, number> = Object.fromEntries(keys.map((k) => [k, 0]));
    for (const p of paidPayments) {
      const key = getWeekStart(new Date(p.paidAt)).toLocaleDateString("en-CA");
      if (key in map) map[key] = (map[key] ?? 0) + Number(p.amount);
    }
    return keys.map((k) => ({ period: k, revenue: map[k] ?? 0 }));
  }

  // monthly
  const keys: string[] = [];
  const cursor = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
  while (cursor <= toDate) {
    keys.push(cursor.toLocaleDateString("en-CA").slice(0, 7));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  const map: Record<string, number> = Object.fromEntries(keys.map((k) => [k, 0]));
  for (const p of paidPayments) {
    const key = new Date(p.paidAt).toLocaleDateString("en-CA").slice(0, 7);
    if (key in map) map[key] = (map[key] ?? 0) + Number(p.amount);
  }
  return keys.map((k) => ({ period: k, revenue: map[k] ?? 0 }));
}

class DashboardService {
  getAdminDashboardService = async (
    fromDate: Date,
    toDate: Date,
  ) => {
    const rangeDays = Math.round(
      (toDate.getTime() - fromDate.getTime()) / (24 * 60 * 60 * 1000),
    );
    const granularity: Granularity =
      rangeDays <= 31 ? "daily" : rangeDays <= 180 ? "weekly" : "monthly";

    const [
      shipmentCounts,
      paymentSummaryRaw,
      paidPayments,
      agents,
      totalPerAgent,
      completedPerAgent,
      complaintsRaw,
    ] = await Promise.all([
      dashboardRepository.getShipmentCounts(fromDate, toDate),
      dashboardRepository.getPaymentSummary(fromDate, toDate),
      dashboardRepository.getPaidPaymentsInRange(fromDate, toDate),
      dashboardRepository.getAllAgentsWithUser(),
      dashboardRepository.getTotalShipmentsPerAgent(),
      dashboardRepository.getCompletedShipmentsPerAgent(),
      dashboardRepository.getRecentComplaints(),
    ]);

    let totalRevenue = 0;
    for (const payment of paidPayments) {
      totalRevenue += Number(payment.amount);
    }

    const revenueStats = buildRevenueStats(paidPayments, fromDate, toDate, granularity);

    const paymentSummary = { paid: 0, pending: 0, failed: 0 };
    for (const row of paymentSummaryRaw) {
      if (row.paymentStatus === "PAID") paymentSummary.paid = Number(row.count);
      if (row.paymentStatus === "PENDING")
        paymentSummary.pending = Number(row.count);
      if (row.paymentStatus === "FAILED")
        paymentSummary.failed = Number(row.count);
    }

    const totalMap: Record<number, number> = {};
    for (const row of totalPerAgent) {
      totalMap[row.deliveryAgentId] = Number(row.count);
    }

    const completedMap: Record<number, number> = {};
    for (const row of completedPerAgent) {
      completedMap[row.deliveryAgentId] = Number(row.count);
    }

    const agentPerformance = agents
      .map((agent: any) => ({
        agentId: agent.id,
        agentName: agent.user?.name ?? null,
        totalDeliveries: totalMap[agent.id] ?? 0,
        activeShipments: agent.shipmentCount ?? 0,
        completedShipments: completedMap[agent.id] ?? 0,
      }))
      .sort((a: any, b: any) => b.totalDeliveries - a.totalDeliveries)
      .slice(0, 10);

    return {
      totalShipments: Number(shipmentCounts.total ?? 0),
      deliveredShipments: Number(shipmentCounts.delivered ?? 0),
      activeDeliveries: Number(shipmentCounts.active ?? 0),
      delayedShipments: Number(shipmentCounts.delayed ?? 0),
      totalRevenue,
      granularity,
      revenueStats,
      paymentSummary,
      agentPerformance,
      complaints: complaintsRaw.map((c: any) => ({
        complaintId: c.id,
        trackingId: c.shipment?.trackingId ?? null,
        customerName: c.customer?.name ?? null,
        message: c.description,
        status: c.status,
        shipmentStatus: c.shipment?.shipmentStatus ?? null,
        isDelayed: c.shipment?.shipmentStatus === "DELAYED",
        resolvedAt: c.status === "RESOLVED" ? c.updatedAt : null,
        createdAt: c.createdAt,
      })),
    };
  };

  getCustomerDashboardService = async (customerId: number) => {
    const [
      counts,
      unreadNotifications,
      recentShipmentsRaw,
      paymentHistoryRaw,
      chatsRaw,
    ] = await Promise.all([
      dashboardRepository.getCustomerShipmentCounts(customerId),
      dashboardRepository.getCustomerUnreadNotifications(customerId),
      dashboardRepository.getCustomerRecentShipments(customerId),
      dashboardRepository.getCustomerPaymentHistory(customerId),
      dashboardRepository.getCustomerRecentChats(customerId),
    ]);

    const recentShipments = recentShipmentsRaw.map((s: any) => ({
      shipmentId: s.id,
      trackingId: s.trackingId,
      itemName: s.itemName,
      shipmentStatus: s.shipmentStatus,
      paymentStatus: s.paymentStatus,
      deliveryAddress: s.deliveryAddress,
      deliveryCity: s.deliveryCity,
      createdAt: s.createdAt,
    }));

    const paymentHistory = paymentHistoryRaw.map((p: any) => ({
      paymentId: p.id,
      shipmentId: p.shipmentId,
      amount: p.amount,
      paymentStatus: p.paymentStatus,
      paidAt: p.paidAt,
    }));

    // Keep only the latest message per shipment
    const seenShipments = new Set<number>();
    const recentSupportChats = (chatsRaw as any[])
      .filter((m) => {
        if (seenShipments.has(m.shipmentId)) return false;
        seenShipments.add(m.shipmentId);
        return true;
      })
      .slice(0, 5)
      .map((m) => ({
        shipmentId: m.shipmentId,
        trackingId: m.shipment?.trackingId ?? null,
        lastMessage: m.message,
        lastMessageBy: m.senderRole,
        updatedAt: m.createdAt,
      }));
    return {
      activeShipments: counts.active,
      totalShipments: counts.total,
      deliveredShipments: counts.delivered,
      pendingShipments: counts.pending,
      pendingPayments: counts.pendingPayments,
      unreadNotifications,
      recentShipments,
      paymentHistory,
      recentSupportChats,
    };
  };

  getAgentDashboardService = async (userId: number) => {
    const agent = await dashboardRepository.getAgentByUserId(userId);
    if (!agent) throw new Error("Delivery agent not found");

    const agentId = agent.id as number;

    const [counts, scheduleRaw, messagesRaw] = await Promise.all([
      dashboardRepository.getAgentShipmentCounts(agentId),
      dashboardRepository.getAgentTodaysSchedule(agentId),
      dashboardRepository.getAgentCustomerMessages(agentId),
    ]);

    const todaysSchedule = (scheduleRaw as any[]).map((s) => ({
      shipmentId: s.id,
      trackingId: s.trackingId,
      receiverName: s.receiverName,
      deliveryAddress: s.deliveryAddress,
      deliveryCity: s.deliveryCity,
      slotStart: s.deliverySlot?.startTime ?? null,
      slotEnd: s.deliverySlot?.endTime ?? null,
      slotDate: s.deliverySlot?.date ?? null,
      shipmentStatus: s.shipmentStatus,
    }));
    const customerMessages = (messagesRaw as any[]).map((m) => ({
      shipmentId: m.shipmentId,
      trackingId: m.shipment?.trackingId ?? null,
      customerName: m.sender?.name ?? null,
      message: m.message,
      sentAt: m.createdAt,
    }));

    return {
      isActive: agent.isActive,
      availabilityStatus: agent.availabilityStatus,
      assignedDeliveries: counts.assigned,
      activeShipments: counts.active,
      completedDeliveries: counts.completed,
      pendingAssignments: counts.pending,
      todaysSchedule,
      customerMessages,
    };
  };
}

export default new DashboardService();
