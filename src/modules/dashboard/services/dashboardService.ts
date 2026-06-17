import dashboardRepository from "../repositories/dashboardRepository";

// Returns the grouping key for a payment date based on the groupBy param
const getPeriodKey = (date: Date, groupBy: string): string => {
  if (groupBy === "monthly") return date.toISOString().slice(0, 7); // "YYYY-MM"
  if (groupBy === "weekly") {
    // Use the Sunday that starts the week as the period label
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    return weekStart.toISOString().slice(0, 10); // "YYYY-MM-DD" of week start
  }
  return date.toISOString().slice(0, 10); // "YYYY-MM-DD" for daily (default)
};

class DashboardService {
  getAdminDashboardService = async (fromDate: Date, toDate: Date, groupBy: string) => {
    // Previous period of same length — used for revenueChangePercent
    const periodMs = toDate.getTime() - fromDate.getTime();
    const prevToDate = new Date(fromDate.getTime() - 1);
    const prevFromDate = new Date(fromDate.getTime() - periodMs - 1);

    const [
      shipmentCounts,
      paymentSummaryRaw,
      paidPayments,
      previousRevenue,
      agents,
      totalPerAgent,
      completedPerAgent,
      recentShipmentsRaw,
      complaintsRaw,
    ] = await Promise.all([
      dashboardRepository.getShipmentCounts(fromDate, toDate),
      dashboardRepository.getPaymentSummary(fromDate, toDate),
      dashboardRepository.getPaidPaymentsInRange(fromDate, toDate),
      dashboardRepository.getRevenue(prevFromDate, prevToDate),
      dashboardRepository.getAllAgentsWithUser(),
      dashboardRepository.getTotalShipmentsPerAgent(),
      dashboardRepository.getCompletedShipmentsPerAgent(),
      dashboardRepository.getRecentShipments(),
      dashboardRepository.getRecentComplaints(),
    ]);

    // Compute totalRevenue and revenueStats from the same payment rows — no extra DB query
    let totalRevenue = 0;
    const statsMap: Record<string, number> = {};

    for (const payment of paidPayments) {
      const amount = Number(payment.amount);
      totalRevenue += amount;

      if (payment.paidAt) {
        const period = getPeriodKey(payment.paidAt as Date, groupBy);
        statsMap[period] = (statsMap[period] ?? 0) + amount;
      }
    }

    const revenueStats = Object.entries(statsMap)
      .map(([period, revenue]) => ({ period, revenue }))
      .sort((a, b) => a.period.localeCompare(b.period));

    // Percentage change vs previous period; null when there is no previous revenue to compare against
    const revenueChangePercent =
      previousRevenue > 0
        ? parseFloat((((totalRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1))
        : null;

    // Flatten payment rows into a single { paid, pending, failed } object
    const paymentSummary = { paid: 0, pending: 0, failed: 0 };
    for (const row of paymentSummaryRaw) {
      if (row.paymentStatus === "PAID") paymentSummary.paid = Number(row.count);
      if (row.paymentStatus === "PENDING") paymentSummary.pending = Number(row.count);
      if (row.paymentStatus === "FAILED") paymentSummary.failed = Number(row.count);
    }

    // Build lookup maps from the grouped count results
    const totalMap: Record<number, number> = {};
    for (const row of totalPerAgent) {
      totalMap[row.deliveryAgentId] = Number(row.count);
    }

    const completedMap: Record<number, number> = {};
    for (const row of completedPerAgent) {
      completedMap[row.deliveryAgentId] = Number(row.count);
    }

    // Merge agent rows with count maps, sort by totalDeliveries, take top 10
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

    const recentShipments = recentShipmentsRaw.map((s: any) => ({
      shipmentId: s.id,
      trackingId: s.trackingId,
      customerName: s.customer?.name ?? null,
      shipmentStatus: s.shipmentStatus,
      isDelayed: s.shipmentStatus === "DELAYED",
      paymentStatus: s.paymentStatus,
      createdAt: s.createdAt,
    }));

    return {
      totalShipments: Number(shipmentCounts.total ?? 0),
      deliveredShipments: Number(shipmentCounts.delivered ?? 0),
      activeDeliveries: Number(shipmentCounts.active ?? 0),
      delayedShipments: Number(shipmentCounts.delayed ?? 0),
      pendingShipments: Number(shipmentCounts.pending ?? 0),

      totalRevenue,
      revenueChangePercent,

      paymentSummary,
      revenueStats,
      agentPerformance,
      recentShipments,

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
    const [counts, unreadNotifications, recentShipmentsRaw, paymentHistoryRaw, chatsRaw] = await Promise.all([
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
    const recentSupportChats = (chatsRaw.messages as any[])
      .filter((m) => {
        if (seenShipments.has(m.shipmentId)) return false;
        seenShipments.add(m.shipmentId);
        return true;
      })
      .slice(0, 5)
      .map((m) => ({
        shipmentId: m.shipmentId,
        trackingId: (chatsRaw.trackingMap as any)[m.shipmentId] ?? null,
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

    const customerMessages = (messagesRaw.messages as any[]).map((m) => ({
      shipmentId: m.shipmentId,
      trackingId: (messagesRaw.trackingMap as any)[m.shipmentId] ?? null,
      customerName: m.sender?.name ?? null,
      message: m.message,
      sentAt: m.createdAt,
    }));

    return {
      isActive: agent.isActive,
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
