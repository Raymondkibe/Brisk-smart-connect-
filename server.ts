import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  User,
  CustomerProfile,
  RouterOwnerProfile,
  WifiPackage,
  SubscriptionPlan,
  RouterDevice,
  AccessPoint,
  WifiSession,
  PppoeUser,
  Voucher,
  Transaction,
  ReferralCommission,
  WithdrawalRequest,
  InstallationRequest,
  NetworkIncident,
  BusinessProfile,
  SupportTicket,
  AuditLog,
  HostApplication,
} from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-Memory Database Store Initialized with Realistic Production Data
class BriskDatabase {
  users: User[] = [];
  customerProfiles: Map<string, CustomerProfile> = new Map();
  routerOwnerProfiles: Map<string, RouterOwnerProfile> = new Map();
  wifiPackages: WifiPackage[] = [];
  subscriptionPlans: SubscriptionPlan[] = [];
  routers: RouterDevice[] = [];
  accessPoints: AccessPoint[] = [];
  wifiSessions: WifiSession[] = [];
  pppoeUsers: PppoeUser[] = [];
  vouchers: Voucher[] = [];
  transactions: Transaction[] = [];
  commissions: ReferralCommission[] = [];
  withdrawals: WithdrawalRequest[] = [];
  installations: InstallationRequest[] = [];
  incidents: NetworkIncident[] = [];
  businessProfiles: Map<string, BusinessProfile> = new Map();
  tickets: SupportTicket[] = [];
  auditLogs: AuditLog[] = [];
  hostApplications: HostApplication[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    // 1. Initial Users
    const adminUser: User = {
      id: 'usr-admin-01',
      email: 'admin@briskconnect.co.ke',
      name: 'Super Admin (Platform)',
      phone: '0712345678',
      role: 'SUPER_ADMIN',
      createdAt: '2026-09-01T08:00:00Z',
      status: 'ACTIVE',
    };

    const ownerUser: User = {
      id: 'usr-owner-01',
      email: 'owner@briskconnect.co.ke',
      name: 'Raymond Kamau',
      phone: '0722000111',
      role: 'ROUTER_OWNER',
      createdAt: '2026-09-28T04:00:00Z',
      status: 'ACTIVE',
    };

    const customerUser: User = {
      id: 'usr-cust-01',
      email: 'customer@briskconnect.co.ke',
      name: 'John Doe',
      phone: '0799123456',
      role: 'CUSTOMER',
      createdAt: '2026-09-28T04:30:00Z',
      status: 'ACTIVE',
    };

    this.users = [adminUser, ownerUser, customerUser];

    // 2. Customer Profile with Active 3-Day Free Package
    const now = new Date('2026-09-28T04:56:00Z');
    const freeExpires = new Date('2026-10-01T04:56:00Z');

    this.customerProfiles.set(customerUser.id, {
      id: 'cp-01',
      userId: customerUser.id,
      internetStatus: 'CONNECTED',
      currentNetwork: 'BRISK Kiambu',
      currentSpeed: '10 Mbps',
      dataUsageMb: 1240,
      walletBalance: 1200,
      referralCode: 'RAYMOND123',
      totalReferrals: 23,
      commissionEarned: 1850,
      availableCommission: 1200,
      currentPackage: {
        id: 'cpkg-free-01',
        packageId: 'pkg-free-3d',
        packageName: '3 Days Free',
        activatedAt: now.toISOString(),
        expiresAt: freeExpires.toISOString(),
        status: 'ACTIVE',
        speed: '10 Mbps',
        isFreeWelcomePackage: true,
      },
    });

    // 3. Router Owner Profile with 14-Day Free Trial
    const trialStarted = new Date('2026-09-28T00:00:00Z');
    const trialEnds = new Date('2026-10-12T23:59:59Z');

    this.routerOwnerProfiles.set(ownerUser.id, {
      id: 'rop-01',
      userId: ownerUser.id,
      businessName: 'Kiambu Smart WiFi Networks',
      subscriptionPlanId: 'sub-plan-starter',
      subscriptionStatus: 'TRIAL',
      trialStartedAt: trialStarted.toISOString(),
      trialEndsAt: trialEnds.toISOString(),
      subscriptionExpiresAt: trialEnds.toISOString(),
      maxRouters: 5,
      maxAccessPoints: 20,
      maxCustomers: 3000,
      darajaConfigured: true,
      whatsappConfigured: true,
      emailConfigured: true,
    });

    // 4. Official Customer WiFi Packages (from spec)
    this.wifiPackages = [
      {
        id: 'pkg-1h',
        name: '1 Hour',
        durationHours: 1,
        durationLabel: '1 hour',
        priceKes: 20,
        speedLabel: '10 Mbps',
        downloadSpeedMbps: 10,
        uploadSpeedMbps: 5,
        category: 'HOURLY',
        deviceLimit: 1,
        description: 'Instant single-session quick browse',
      },
      {
        id: 'pkg-3h',
        name: '3 Hours',
        durationHours: 3,
        durationLabel: '3 hours',
        priceKes: 30,
        speedLabel: '10 Mbps',
        downloadSpeedMbps: 10,
        uploadSpeedMbps: 5,
        category: 'HOURLY',
        deviceLimit: 1,
        description: 'Study & research session access',
      },
      {
        id: 'pkg-6h',
        name: '6 Hours',
        durationHours: 6,
        durationLabel: '6 hours',
        priceKes: 50,
        speedLabel: '10 Mbps',
        downloadSpeedMbps: 10,
        uploadSpeedMbps: 5,
        category: 'HOURLY',
        deviceLimit: 1,
        description: 'Half-day stable connection',
      },
      {
        id: 'pkg-1d',
        name: '1 Day',
        durationHours: 24,
        durationLabel: '24 hours',
        priceKes: 80,
        speedLabel: '10 Mbps',
        downloadSpeedMbps: 10,
        uploadSpeedMbps: 5,
        category: 'DAILY',
        deviceLimit: 2,
        isPopular: true,
        description: 'Full 24-hour unlimited internet pass',
      },
      {
        id: 'pkg-1d-plus',
        name: '1 Day Plus',
        durationHours: 24,
        durationLabel: '24 hours',
        priceKes: 100,
        speedLabel: '15 Mbps',
        downloadSpeedMbps: 15,
        uploadSpeedMbps: 10,
        category: 'DAILY',
        deviceLimit: 2,
        description: 'Higher speed for streaming and video calls',
      },
      {
        id: 'pkg-2d',
        name: '2 Days',
        durationHours: 48,
        durationLabel: '48 hours',
        priceKes: 150,
        speedLabel: '15 Mbps',
        downloadSpeedMbps: 15,
        uploadSpeedMbps: 10,
        category: 'MULTI_DAY',
        deviceLimit: 2,
        description: 'Weekend uninterrupted access',
      },
      {
        id: 'pkg-3d',
        name: '3 Days',
        durationHours: 72,
        durationLabel: '72 hours',
        priceKes: 200,
        speedLabel: '15 Mbps',
        downloadSpeedMbps: 15,
        uploadSpeedMbps: 10,
        category: 'MULTI_DAY',
        deviceLimit: 3,
        isPopular: true,
        description: 'Great value for students and remote workers',
      },
      {
        id: 'pkg-4d',
        name: '4 Days',
        durationHours: 96,
        durationLabel: '96 hours',
        priceKes: 250,
        speedLabel: '15 Mbps',
        downloadSpeedMbps: 15,
        uploadSpeedMbps: 10,
        category: 'MULTI_DAY',
        deviceLimit: 3,
        description: 'Mid-week continuous productivity',
      },
      {
        id: 'pkg-5d',
        name: '5 Days',
        durationHours: 120,
        durationLabel: '120 hours',
        priceKes: 300,
        speedLabel: '15 Mbps',
        downloadSpeedMbps: 15,
        uploadSpeedMbps: 10,
        category: 'MULTI_DAY',
        deviceLimit: 3,
        description: 'Work week pass (Monday to Friday)',
      },
      {
        id: 'pkg-6d',
        name: '6 Days',
        durationHours: 144,
        durationLabel: '144 hours',
        priceKes: 400,
        speedLabel: '20 Mbps',
        downloadSpeedMbps: 20,
        uploadSpeedMbps: 15,
        category: 'MULTI_DAY',
        deviceLimit: 3,
        description: 'Extended multi-day access',
      },
      {
        id: 'pkg-7d',
        name: '7 Days',
        durationHours: 168,
        durationLabel: '168 hours',
        priceKes: 500,
        speedLabel: '20 Mbps',
        downloadSpeedMbps: 20,
        uploadSpeedMbps: 15,
        category: 'MULTI_DAY',
        deviceLimit: 4,
        isPopular: true,
        description: 'Full week high-speed broadband package',
      },
      // 30-Day Monthly Packages
      {
        id: 'pkg-month-basic',
        name: 'Monthly Basic',
        durationHours: 720,
        durationLabel: '30 days',
        priceKes: 1500,
        speedLabel: '10 Mbps',
        downloadSpeedMbps: 10,
        uploadSpeedMbps: 8,
        category: 'MONTHLY',
        deviceLimit: 4,
        fairUsageGb: 200,
        description: 'Home & apartment budget monthly connection',
      },
      {
        id: 'pkg-month-plus',
        name: 'Monthly Plus',
        durationHours: 720,
        durationLabel: '30 days',
        priceKes: 2000,
        speedLabel: '15 Mbps',
        downloadSpeedMbps: 15,
        uploadSpeedMbps: 12,
        category: 'MONTHLY',
        deviceLimit: 5,
        fairUsageGb: 350,
        description: 'Enhanced family internet for multi-device browsing',
      },
      {
        id: 'pkg-month-std',
        name: 'Monthly Standard',
        durationHours: 720,
        durationLabel: '30 days',
        priceKes: 2500,
        speedLabel: '20 Mbps',
        downloadSpeedMbps: 20,
        uploadSpeedMbps: 15,
        category: 'MONTHLY',
        deviceLimit: 6,
        isPopular: true,
        description: 'Optimal for home offices & entertainment streaming',
      },
      {
        id: 'pkg-month-adv',
        name: 'Monthly Advanced',
        durationHours: 720,
        durationLabel: '30 days',
        priceKes: 3500,
        speedLabel: '30 Mbps',
        downloadSpeedMbps: 30,
        uploadSpeedMbps: 25,
        category: 'MONTHLY',
        deviceLimit: 8,
        description: 'Heavy 4K streaming, uploads, and gaming',
      },
      {
        id: 'pkg-month-prem',
        name: 'Monthly Premium',
        durationHours: 720,
        durationLabel: '30 days',
        priceKes: 4500,
        speedLabel: '50 Mbps',
        downloadSpeedMbps: 50,
        uploadSpeedMbps: 40,
        category: 'MONTHLY',
        deviceLimit: 12,
        description: 'High-speed business or multiple tenancy bandwidth',
      },
      {
        id: 'pkg-month-biz',
        name: 'Monthly Business',
        durationHours: 720,
        durationLabel: '30 days',
        priceKes: 5500,
        speedLabel: '100 Mbps',
        downloadSpeedMbps: 100,
        uploadSpeedMbps: 80,
        category: 'MONTHLY',
        deviceLimit: 25,
        description: 'Enterprise grade unthrottled dedicated speed',
      },
    ];

    // 5. Router Owner Subscription Plans (from spec)
    this.subscriptionPlans = [
      {
        id: 'sub-plan-starter',
        name: 'Starter',
        priceKes: 400,
        durationDays: 30,
        maxRouters: 1,
        maxAccessPoints: 3,
        maxCustomers: 500,
        maxVouchers: 500,
        features: [
          '1 router management',
          '3 access points',
          '500 customers',
          'Basic reports',
          'Voucher management',
          'Customer management',
        ],
        status: 'ACTIVE',
      },
      {
        id: 'sub-plan-basic',
        name: 'Basic',
        priceKes: 750,
        durationDays: 30,
        maxRouters: 3,
        maxAccessPoints: 10,
        maxCustomers: 1500,
        maxVouchers: 2000,
        features: [
          '3 routers',
          '10 access points',
          '1,500 customers',
          'Advanced reports',
          'Network monitoring',
          'Voucher management',
        ],
        status: 'ACTIVE',
      },
      {
        id: 'sub-plan-standard',
        name: 'Standard',
        priceKes: 1500,
        durationDays: 30,
        maxRouters: 5,
        maxAccessPoints: 20,
        maxCustomers: 3000,
        maxVouchers: 5000,
        features: [
          '5 routers',
          '20 access points',
          '3,000 customers',
          'Advanced monitoring',
          'Automated outage alerts',
          'Multiple networks',
          'Priority support',
        ],
        status: 'ACTIVE',
      },
      {
        id: 'sub-plan-pro',
        name: 'Professional',
        priceKes: 2500,
        durationDays: 30,
        maxRouters: 10,
        maxAccessPoints: 40,
        maxCustomers: 10000,
        maxVouchers: 15000,
        features: [
          '10 routers',
          '40 access points',
          '10,000 customers',
          'Advanced analytics & PPPoE',
          'Multiple locations',
          'Priority 24/7 support',
        ],
        status: 'ACTIVE',
      },
      {
        id: 'sub-plan-biz',
        name: 'Business',
        priceKes: 3500,
        durationDays: 30,
        maxRouters: 25,
        maxAccessPoints: 100,
        maxCustomers: 25000,
        maxVouchers: 50000,
        features: [
          '25 routers',
          '100 access points',
          'Higher customer limits',
          'Multi-location management',
          'Advanced reporting',
          'Priority VIP support',
        ],
        status: 'ACTIVE',
      },
    ];

    // 6. Connected Routers
    this.routers = [
      {
        id: 'rtr-01',
        ownerId: ownerUser.id,
        ownerName: 'Raymond Kamau',
        name: 'Kiambu Main Gateway',
        location: 'Kiambu Central Market, 2nd Floor',
        networkName: 'BRISK Kiambu',
        model: 'MikroTik RB4011iGS+RM',
        ipAddress: '192.168.88.1',
        routerOsVersion: 'RouterOS 7.15.2',
        status: 'ONLINE',
        cpuLoadPercent: 18,
        ramUsagePercent: 32,
        uptime: '28d 14h 12m',
        internetStatus: 'ONLINE',
        activeUsers: 87,
        uploadTrafficMbps: 24.8,
        downloadTrafficMbps: 78.4,
        lastHeartbeat: '1 min ago',
        connectionMethod: 'RouterOS API',
      },
      {
        id: 'rtr-02',
        ownerId: ownerUser.id,
        ownerName: 'Raymond Kamau',
        name: 'Ndumberi Hub Router',
        location: 'Ndumberi Town Plaza, Wing B',
        networkName: 'BRISK Ndumberi',
        model: 'MikroTik hAP ac3',
        ipAddress: '192.168.89.1',
        routerOsVersion: 'RouterOS 7.14.3',
        status: 'ONLINE',
        cpuLoadPercent: 24,
        ramUsagePercent: 41,
        uptime: '14d 06h 40m',
        internetStatus: 'ONLINE',
        activeUsers: 30,
        uploadTrafficMbps: 8.5,
        downloadTrafficMbps: 32.1,
        lastHeartbeat: '2 mins ago',
        connectionMethod: 'BRISK Setup Script',
      },
      {
        id: 'rtr-03',
        ownerId: ownerUser.id,
        ownerName: 'Raymond Kamau',
        name: 'Tinganga Relay Node',
        location: 'Tinganga Shopping Complex',
        networkName: 'BRISK Tinganga',
        model: 'MikroTik CCR2004-16G-2S+',
        ipAddress: '192.168.90.1',
        routerOsVersion: 'RouterOS 7.15.1',
        status: 'WARNING',
        cpuLoadPercent: 78,
        ramUsagePercent: 62,
        uptime: '6d 18h 05m',
        internetStatus: 'ONLINE',
        activeUsers: 21,
        uploadTrafficMbps: 12.2,
        downloadTrafficMbps: 44.0,
        lastHeartbeat: '3 mins ago',
        connectionMethod: 'WireGuard',
      },
      {
        id: 'rtr-04',
        ownerId: ownerUser.id,
        ownerName: 'Raymond Kamau',
        name: 'Thika Road Edge Hub',
        location: 'Roysambu Commercial Center',
        networkName: 'BRISK Roysambu',
        model: 'OpenWrt AX3000 Custom',
        ipAddress: '192.168.91.1',
        routerOsVersion: 'OpenWrt 23.05.3',
        status: 'ONLINE',
        cpuLoadPercent: 12,
        ramUsagePercent: 28,
        uptime: '19d 02h 11m',
        internetStatus: 'ONLINE',
        activeUsers: 14,
        uploadTrafficMbps: 4.1,
        downloadTrafficMbps: 18.6,
        lastHeartbeat: '4 mins ago',
        connectionMethod: 'REST API',
      },
    ];

    // 7. Access Points
    this.accessPoints = [
      {
        id: 'ap-01',
        routerId: 'rtr-01',
        routerName: 'Kiambu Main Gateway',
        name: 'AP 01 Kiambu Market',
        location: 'Open Produce Section',
        ssid: 'BRISK_Smart_WiFi_Kiambu',
        ipAddress: '192.168.88.10',
        model: 'Ubiquiti UniFi U6-Pro',
        status: 'ONLINE',
        connectedUsers: 34,
        trafficMbps: 36.4,
        uptime: '28d 14h',
        lastSeen: 'Just now',
      },
      {
        id: 'ap-02',
        routerId: 'rtr-01',
        routerName: 'Kiambu Main Gateway',
        name: 'AP 02 Kiambu Stage',
        location: 'Bus Terminal Waiting Bay',
        ssid: 'BRISK_Smart_WiFi_Kiambu',
        ipAddress: '192.168.88.11',
        model: 'TP-Link Omada EAP650-Outdoor',
        status: 'ONLINE',
        connectedUsers: 53,
        trafficMbps: 42.0,
        uptime: '28d 14h',
        lastSeen: 'Just now',
      },
      {
        id: 'ap-03',
        routerId: 'rtr-02',
        routerName: 'Ndumberi Hub Router',
        name: 'AP 03 Ndumberi Town',
        location: 'Main Street Post Office',
        ssid: 'BRISK_Smart_WiFi_Ndumberi',
        ipAddress: '192.168.89.10',
        model: 'Ubiquiti UniFi AC-Lite',
        status: 'ONLINE',
        connectedUsers: 18,
        trafficMbps: 18.2,
        uptime: '14d 06h',
        lastSeen: 'Just now',
      },
      {
        id: 'ap-04',
        routerId: 'rtr-02',
        routerName: 'Ndumberi Hub Router',
        name: 'AP 04 Ndumberi Plaza',
        location: 'Plaza Food Court',
        ssid: 'BRISK_Smart_WiFi_Ndumberi',
        ipAddress: '192.168.89.11',
        model: 'TP-Link Omada EAP610',
        status: 'ONLINE',
        connectedUsers: 12,
        trafficMbps: 13.9,
        uptime: '14d 06h',
        lastSeen: 'Just now',
      },
      {
        id: 'ap-05',
        routerId: 'rtr-03',
        routerName: 'Tinganga Relay Node',
        name: 'AP 05 Tinganga Center',
        location: 'Shopping Hall Center',
        ssid: 'BRISK_Smart_WiFi_Tinganga',
        ipAddress: '192.168.90.10',
        model: 'MikroTik cAP ax',
        status: 'ONLINE',
        connectedUsers: 21,
        trafficMbps: 22.5,
        uptime: '6d 18h',
        lastSeen: 'Just now',
      },
    ];

    // 8. Active Sessions
    this.wifiSessions = [
      {
        id: 'sess-01',
        customerId: customerUser.id,
        customerName: 'John Doe',
        routerId: 'rtr-01',
        routerName: 'Kiambu Main Gateway',
        apName: 'AP 01 Kiambu Market',
        ipAddress: '192.168.88.142',
        macAddress: 'DC:A6:32:89:BC:11',
        packageName: '3 Days Free',
        speed: '10 Mbps',
        connectedAt: '2026-09-28T04:30:00Z',
        usageMb: 1240,
        remainingSeconds: 225120, // ~2.6 days
      },
      {
        id: 'sess-02',
        customerId: 'usr-cust-02',
        customerName: 'Mary Wambui',
        routerId: 'rtr-01',
        routerName: 'Kiambu Main Gateway',
        apName: 'AP 02 Kiambu Stage',
        ipAddress: '192.168.88.165',
        macAddress: '48:2C:6A:19:D4:F2',
        packageName: '1 Day',
        speed: '10 Mbps',
        connectedAt: '2026-09-28T02:15:00Z',
        usageMb: 820,
        remainingSeconds: 68400,
      },
      {
        id: 'sess-03',
        customerId: 'usr-cust-03',
        customerName: 'Kevin Omondi',
        routerId: 'rtr-02',
        routerName: 'Ndumberi Hub Router',
        apName: 'AP 03 Ndumberi Town',
        ipAddress: '192.168.89.122',
        macAddress: '80:7D:3A:45:90:E1',
        packageName: '7 Days',
        speed: '20 Mbps',
        connectedAt: '2026-09-26T11:00:00Z',
        usageMb: 8400,
        remainingSeconds: 432000,
      },
    ];

    // 9. PPPoE Users
    this.pppoeUsers = [
      {
        id: 'pppoe-01',
        username: 'hotel_kiambu_guest',
        ipAddress: '10.10.20.14',
        routerName: 'Kiambu Main Gateway',
        speed: '30 Mbps / 20 Mbps',
        downloadMb: 45200,
        uploadMb: 12300,
        connectedDuration: '12d 04h',
        expiresAt: '2026-10-15T23:59:59Z',
        status: 'CONNECTED',
      },
      {
        id: 'pppoe-02',
        username: 'cyber_ndumberi',
        ipAddress: '10.10.30.22',
        routerName: 'Ndumberi Hub Router',
        speed: '50 Mbps / 30 Mbps',
        downloadMb: 128400,
        uploadMb: 41200,
        connectedDuration: '18d 09h',
        expiresAt: '2026-10-20T23:59:59Z',
        status: 'CONNECTED',
      },
    ];

    // 10. Initial Vouchers
    this.vouchers = [
      {
        id: 'vch-01',
        code: 'BRK-8821-4920',
        packageId: 'pkg-1d',
        packageName: '1 Day',
        durationHours: 24,
        priceKes: 80,
        speed: '10 Mbps',
        network: 'BRISK Kiambu',
        status: 'UNUSED',
        createdAt: '2026-09-27T10:00:00Z',
        expiresAt: '2026-10-27T10:00:00Z',
        batchNumber: 'BATCH-2026-09-A',
      },
      {
        id: 'vch-02',
        code: 'BRK-3391-7712',
        packageId: 'pkg-3d',
        packageName: '3 Days',
        durationHours: 72,
        priceKes: 200,
        speed: '15 Mbps',
        network: 'BRISK Kiambu',
        status: 'UNUSED',
        createdAt: '2026-09-27T10:00:00Z',
        expiresAt: '2026-10-27T10:00:00Z',
        batchNumber: 'BATCH-2026-09-A',
      },
      {
        id: 'vch-03',
        code: 'BRK-5541-1299',
        packageId: 'pkg-7d',
        packageName: '7 Days',
        durationHours: 168,
        priceKes: 500,
        speed: '20 Mbps',
        network: 'BRISK Ndumberi',
        status: 'UNUSED',
        createdAt: '2026-09-27T10:00:00Z',
        expiresAt: '2026-10-27T10:00:00Z',
        batchNumber: 'BATCH-2026-09-B',
      },
      {
        id: 'vch-04',
        code: 'BRK-1122-3344',
        packageId: 'pkg-1d',
        packageName: '1 Day',
        durationHours: 24,
        priceKes: 80,
        speed: '10 Mbps',
        network: 'BRISK Kiambu',
        status: 'REDEEMED',
        createdAt: '2026-09-26T08:00:00Z',
        expiresAt: '2026-10-26T08:00:00Z',
        redeemedByCustomerName: 'Mary Wambui',
        redeemedAt: '2026-09-28T02:15:00Z',
        batchNumber: 'BATCH-2026-09-A',
      },
    ];

    // 11. Initial Transactions
    this.transactions = [
      {
        id: 'tx-01',
        receiptNumber: 'BRK-000001',
        userId: customerUser.id,
        userName: 'John Doe',
        type: 'CUSTOMER_WIFI',
        packageName: '3 Days Free',
        amountKes: 0,
        paymentMethod: 'VOUCHER',
        reference: 'BRK-FREE-WELCOME',
        status: 'SUCCESS',
        createdAt: '2026-09-28T04:30:00Z',
      },
      {
        id: 'tx-02',
        receiptNumber: 'BRK-000002',
        userId: 'usr-cust-02',
        userName: 'Mary Wambui',
        type: 'CUSTOMER_WIFI',
        packageName: '1 Day',
        amountKes: 80,
        paymentMethod: 'M-PESA',
        reference: 'QGK7294KLS',
        status: 'SUCCESS',
        createdAt: '2026-09-28T02:15:00Z',
        mpesaPhone: '0711987654',
      },
      {
        id: 'tx-03',
        receiptNumber: 'BRK-000003',
        userId: 'usr-cust-03',
        userName: 'Kevin Omondi',
        type: 'CUSTOMER_WIFI',
        packageName: '7 Days',
        amountKes: 500,
        paymentMethod: 'M-PESA',
        reference: 'QGK8819MPR',
        status: 'SUCCESS',
        createdAt: '2026-09-26T11:00:00Z',
        mpesaPhone: '0722334455',
      },
    ];

    // 12. Referral Commissions
    this.commissions = [
      {
        id: 'comm-01',
        referrerId: customerUser.id,
        referredUserId: 'usr-cust-02',
        referredUserName: 'Mary Wambui',
        purchasePackage: '7 Days (KES 500)',
        purchaseAmountKes: 500,
        commissionKes: 50,
        ratePercent: 10,
        createdAt: '2026-09-27T14:20:00Z',
        status: 'EARNED',
      },
      {
        id: 'comm-02',
        referrerId: customerUser.id,
        referredUserId: 'usr-cust-03',
        referredUserName: 'Kevin Omondi',
        purchasePackage: 'Monthly Standard (KES 2,500)',
        purchaseAmountKes: 2500,
        commissionKes: 250,
        ratePercent: 10,
        createdAt: '2026-09-26T11:05:00Z',
        status: 'EARNED',
      },
    ];

    // 13. Withdrawals
    this.withdrawals = [
      {
        id: 'wdr-01',
        userId: customerUser.id,
        userName: 'John Doe',
        userRole: 'CUSTOMER',
        amountKes: 650,
        paymentMethod: 'M-PESA',
        phone: '0799123456',
        status: 'COMPLETED',
        requestedAt: '2026-09-25T09:15:00Z',
        processedAt: '2026-09-25T09:45:00Z',
        notes: 'Disbursed via Safaricom B2C',
      },
    ];

    // 14. Installation Requests
    this.installations = [
      {
        id: 'inst-01',
        userId: ownerUser.id,
        userName: 'Raymond Kamau',
        phone: '0722000111',
        type: 'WIRED',
        priceKes: 2999,
        location: 'Kiambu Town Market Plaza, Unit 4',
        preferredDate: '2026-10-02',
        preferredTime: '10:00 AM',
        notes: 'Need outdoor Cat6 STP cabling to rooftop antenna',
        status: 'ASSIGNED',
        assignedTechnicianName: 'Francis Mwangi',
        technicianPhone: '0722888999',
        createdAt: '2026-09-27T16:00:00Z',
      },
      {
        id: 'inst-02',
        userId: 'usr-cust-04',
        userName: 'David Mutua',
        phone: '0714556677',
        type: 'WIRELESS',
        priceKes: 8499,
        location: 'Ndumberi Heights Residential Block C',
        preferredDate: '2026-10-04',
        preferredTime: '02:00 PM',
        notes: 'PTP link from water tower to building rooftop',
        status: 'CONFIRMED',
        createdAt: '2026-09-28T01:30:00Z',
      },
    ];

    // 15. Network Incidents
    this.incidents = [
      {
        id: 'inc-01',
        incidentNumber: 'BRK-000123',
        networkName: 'Kiambu Network',
        routerName: 'Kiambu Main Gateway',
        status: 'RESOLVED',
        startedAt: '2026-09-26T14:32:00Z',
        lastHeartbeat: '2026-09-26T14:31:00Z',
        affectedUsers: 84,
        resolvedAt: '2026-09-26T14:50:00Z',
        downtimeMinutes: 18,
      },
    ];

    // 16. Business Profile for Router Owner
    this.businessProfiles.set(ownerUser.id, {
      handle: 'kiambu_smart_wifi',
      businessName: 'Kiambu Smart WiFi Networks',
      logoUrl: '',
      coverImageUrl: '',
      description:
        'Official high-speed community WiFi hotspot and fiber provider across Kiambu Central Market, Bus Terminus, and Ndumberi.',
      location: 'Kiambu Central Market, 2nd Floor, Suite 210',
      phone: '+254 722 000 111',
      whatsapp: '+254 722 000 111',
      email: 'support@kiambuwifi.co.ke',
      openingHours: 'Mon - Sun: 6:00 AM - 11:00 PM',
      services: ['Public WiFi Hotspot', 'Home PPPoE Fiber', 'Voucher Cards', 'WiFi Host Setup'],
      wifiAvailability: '24/7 Uninterrupted with Backup Solar & Inverter',
      supportContact: 'Call / WhatsApp: 0722 000 111',
    });

    // 17. Support Tickets
    this.tickets = [
      {
        id: 'tkt-01',
        userId: customerUser.id,
        userName: 'John Doe',
        category: 'WIFI',
        subject: 'Signal coverage in Section 4 of Market',
        description: 'Internet is very fast at the gate, but gets lower at section 4 near the dairy depot.',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        assignedTo: 'Support Team',
        createdAt: '2026-09-27T12:00:00Z',
        updatedAt: '2026-09-27T13:10:00Z',
        replies: [
          {
            id: 'rep-01',
            senderName: 'BRISK Support',
            isAdmin: true,
            message: 'Hello John, we have scheduled a technician to install an outdoor booster AP at Section 4 this week.',
            createdAt: '2026-09-27T13:10:00Z',
          },
        ],
      },
    ];

    // 18. Audit Logs
    this.auditLogs = [
      {
        id: 'log-01',
        userName: 'Super Admin',
        userRole: 'SUPER_ADMIN',
        action: 'PLATFORM_BOOTSTRAP',
        resource: 'SYSTEM',
        ipAddress: '197.237.10.4',
        timestamp: '2026-09-28T04:00:00Z',
        result: 'SUCCESS',
        details: 'Initial system services and router monitors loaded.',
      },
      {
        id: 'log-02',
        userName: 'Raymond Kamau',
        userRole: 'ROUTER_OWNER',
        action: 'TRIAL_ACTIVATED',
        resource: 'ROUTER_OWNER',
        ipAddress: '105.160.28.91',
        timestamp: '2026-09-28T04:00:00Z',
        result: 'SUCCESS',
        details: '14-Day Free Trial initiated automatically.',
      },
      {
        id: 'log-03',
        userName: 'John Doe',
        userRole: 'CUSTOMER',
        action: 'FREE_PACKAGE_ACTIVATED',
        resource: 'CUSTOMER_WIFI',
        ipAddress: '192.168.88.142',
        timestamp: '2026-09-28T04:30:00Z',
        result: 'SUCCESS',
        details: 'Welcome 3-Day Free Package activated automatically.',
      },
    ];

    // 19. Host Applications
    this.hostApplications = [
      {
        id: 'host-01',
        fullName: 'Patrick Njoroge',
        phone: '0721445566',
        email: 'patrick@njoroge.co.ke',
        location: 'Kiambu Road Total Station Coffee House',
        internetProvider: 'Safaricom Home Fibre',
        speedMbps: 100,
        routerModel: 'Huawei HG8245H5 + UniFi AP',
        availability: '24 Hours',
        status: 'PENDING',
        submittedAt: '2026-09-27T18:00:00Z',
      },
    ];
  }
}

const db = new BriskDatabase();

// ==========================================
// API ROUTES
// ==========================================

// Auth Endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, role } = req.body;
  let user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());

  // If role is provided or user exists
  if (!user && role) {
    user = db.users.find((u) => u.role === role);
  }

  if (!user) {
    return res.status(401).json({ error: 'User not found. Please register or select a valid role.' });
  }

  return res.json({
    user,
    token: `brisk_jwt_${user.id}_${Date.now()}`,
    customerProfile: db.customerProfiles.get(user.id),
    ownerProfile: db.routerOwnerProfiles.get(user.id),
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, role } = req.body;
  if (!name || !email || !phone || !role) {
    return res.status(400).json({ error: 'All fields (name, email, phone, role) are required.' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newUser: User = {
    id: `usr-${Date.now()}`,
    name,
    email,
    phone,
    role: role as any,
    createdAt: new Date().toISOString(),
    status: 'ACTIVE',
  };

  db.users.push(newUser);

  // If registering as Customer: Give 3-day free package immediately
  if (role === 'CUSTOMER') {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const code = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

    const profile: CustomerProfile = {
      id: `cp-${Date.now()}`,
      userId: newUser.id,
      internetStatus: 'CONNECTED',
      currentNetwork: 'BRISK Kiambu',
      currentSpeed: '10 Mbps',
      dataUsageMb: 0,
      walletBalance: 0,
      referralCode: code,
      totalReferrals: 0,
      commissionEarned: 0,
      availableCommission: 0,
      currentPackage: {
        id: `cpkg-${Date.now()}`,
        packageId: 'pkg-free-3d',
        packageName: '3 Days Free',
        activatedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        status: 'ACTIVE',
        speed: '10 Mbps',
        isFreeWelcomePackage: true,
      },
    };
    db.customerProfiles.set(newUser.id, profile);

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userName: newUser.name,
      userRole: 'CUSTOMER',
      action: 'CUSTOMER_REGISTERED',
      resource: 'CUSTOMER_WIFI',
      ipAddress: req.ip || '127.0.0.1',
      timestamp: new Date().toISOString(),
      result: 'SUCCESS',
      details: 'Automatic 3-Day Free WiFi Package provisioned.',
    });
  }

  // If registering as Router Owner: Give 14-day free trial immediately
  if (role === 'ROUTER_OWNER') {
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const profile: RouterOwnerProfile = {
      id: `rop-${Date.now()}`,
      userId: newUser.id,
      businessName: `${newUser.name}'s WiFi Network`,
      subscriptionPlanId: 'sub-plan-starter',
      subscriptionStatus: 'TRIAL',
      trialStartedAt: now.toISOString(),
      trialEndsAt: trialEndsAt.toISOString(),
      subscriptionExpiresAt: trialEndsAt.toISOString(),
      maxRouters: 1,
      maxAccessPoints: 3,
      maxCustomers: 500,
      darajaConfigured: false,
      whatsappConfigured: false,
      emailConfigured: false,
    };
    db.routerOwnerProfiles.set(newUser.id, profile);

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userName: newUser.name,
      userRole: 'ROUTER_OWNER',
      action: 'ROUTER_OWNER_REGISTERED',
      resource: 'TRIAL_PERIOD',
      ipAddress: req.ip || '127.0.0.1',
      timestamp: new Date().toISOString(),
      result: 'SUCCESS',
      details: '14-Day Free Trial initiated.',
    });
  }

  return res.json({
    user: newUser,
    token: `brisk_jwt_${newUser.id}_${Date.now()}`,
    customerProfile: db.customerProfiles.get(newUser.id),
    ownerProfile: db.routerOwnerProfiles.get(newUser.id),
  });
});

app.get('/api/auth/me', (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  const user = db.users.find((u) => u.id === userId) || db.users[1]; // default to router owner or first
  return res.json({
    user,
    customerProfile: db.customerProfiles.get(user.id),
    ownerProfile: db.routerOwnerProfiles.get(user.id),
  });
});

// Packages & Plans
app.get('/api/packages', (_req, res) => {
  return res.json(db.wifiPackages);
});

app.get('/api/subscription-plans', (_req, res) => {
  return res.json(db.subscriptionPlans);
});

// M-Pesa STK Push Integration
app.post('/api/mpesa/stk-push', (req, res) => {
  const { phone, amount, type, reference, packageId } = req.body;

  if (!phone || !amount) {
    return res.status(400).json({ error: 'Valid M-Pesa phone number and amount are required.' });
  }

  // Validate Kenya phone number
  const cleanPhone = phone.replace(/\s+/g, '');
  const isValidPhone = /^(?:254|\+254|0)?(7|1)\d{8}$/.test(cleanPhone);
  if (!isValidPhone) {
    return res.status(400).json({
      error: 'Invalid Safaricom phone number. Please use 07XXXXXXXX, 01XXXXXXXX, or 2547XXXXXXXX.',
    });
  }

  const checkoutRequestId = `ws_CO_${Date.now()}_${Math.floor(10000 + Math.random() * 90000)}`;

  return res.json({
    success: true,
    checkoutRequestId,
    merchantRequestId: `MR_${Date.now()}`,
    responseCode: '0',
    customerMessage: `Success. An STK push prompt has been sent to ${phone}. Enter your M-Pesa PIN to complete payment of KES ${amount}.`,
    details: {
      phone,
      amount,
      type: type || 'CUSTOMER_WIFI',
      reference: reference || 'BRISK_WIFI',
      packageId,
    },
  });
});

// M-Pesa Callback / Confirmation & Package Activation
app.post('/api/mpesa/verify', (req, res) => {
  const { checkoutRequestId, phone, amount, type, packageId, userId } = req.body;

  const receiptNumber = `BRK-${String(db.transactions.length + 1).padStart(6, '0')}`;
  const mpesaRef = `QGK${Math.floor(1000000 + Math.random() * 9000000)}KES`;

  const targetUser = db.users.find((u) => u.id === userId) || db.users[2]; // default to customer
  let selectedPkg = db.wifiPackages.find((p) => p.id === packageId);

  // If customer wifi package: activate immediately
  if (type === 'CUSTOMER_WIFI' || !type) {
    if (!selectedPkg) {
      selectedPkg = db.wifiPackages[3]; // default 1 Day
    }

    const durationMs = selectedPkg.durationHours * 60 * 60 * 1000;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMs);

    let customerProf = db.customerProfiles.get(targetUser.id);
    if (!customerProf) {
      customerProf = {
        id: `cp-${Date.now()}`,
        userId: targetUser.id,
        internetStatus: 'CONNECTED',
        currentNetwork: 'BRISK Kiambu',
        currentSpeed: selectedPkg.speedLabel,
        dataUsageMb: 0,
        walletBalance: 0,
        referralCode: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        totalReferrals: 0,
        commissionEarned: 0,
        availableCommission: 0,
      };
      db.customerProfiles.set(targetUser.id, customerProf);
    }

    customerProf.internetStatus = 'CONNECTED';
    customerProf.currentSpeed = selectedPkg.speedLabel;
    customerProf.currentPackage = {
      id: `cpkg-${Date.now()}`,
      packageId: selectedPkg.id,
      packageName: selectedPkg.name,
      activatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'ACTIVE',
      speed: selectedPkg.speedLabel,
    };

    // Calculate 10% referral commission if referred
    const commissionAmt = Math.round(Number(amount) * 0.1);
    db.commissions.unshift({
      id: `comm-${Date.now()}`,
      referrerId: 'usr-cust-01',
      referredUserId: targetUser.id,
      referredUserName: targetUser.name,
      purchasePackage: `${selectedPkg.name} (KES ${amount})`,
      purchaseAmountKes: Number(amount),
      commissionKes: commissionAmt,
      ratePercent: 10,
      createdAt: now.toISOString(),
      status: 'EARNED',
    });
  }

  // If Router Owner 30-Day Subscription: activate router owner account
  if (type === 'ROUTER_OWNER_SUBSCRIPTION') {
    const ownerProf = db.routerOwnerProfiles.get(targetUser.id);
    if (ownerProf) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      ownerProf.subscriptionStatus = 'ACTIVE';
      ownerProf.subscriptionExpiresAt = expiresAt.toISOString();
    }
  }

  const tx: Transaction = {
    id: `tx-${Date.now()}`,
    receiptNumber,
    userId: targetUser.id,
    userName: targetUser.name,
    type: (type as any) || 'CUSTOMER_WIFI',
    packageName: selectedPkg?.name || 'WiFi Subscription',
    amountKes: Number(amount),
    paymentMethod: 'M-PESA',
    reference: mpesaRef,
    status: 'SUCCESS',
    createdAt: new Date().toISOString(),
    mpesaPhone: phone,
  };

  db.transactions.unshift(tx);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userName: targetUser.name,
    userRole: targetUser.role,
    action: 'PAYMENT_VERIFIED',
    resource: 'M-PESA',
    ipAddress: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString(),
    result: 'SUCCESS',
    details: `Receipt #${receiptNumber} generated for KES ${amount}. M-Pesa Ref: ${mpesaRef}`,
  });

  return res.json({
    success: true,
    transaction: tx,
    customerProfile: db.customerProfiles.get(targetUser.id),
    ownerProfile: db.routerOwnerProfiles.get(targetUser.id),
  });
});

// Customer Voucher Redemption
app.post('/api/customer/redeem-voucher', (req, res) => {
  const { code, userId } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Please enter a valid voucher code.' });
  }

  const voucher = db.vouchers.find(
    (v) => v.code.toUpperCase() === code.trim().toUpperCase() && v.status === 'UNUSED'
  );

  if (!voucher) {
    return res.status(404).json({
      error: 'Voucher code is invalid, already redeemed, or expired. Please check and try again.',
    });
  }

  const targetUser = db.users.find((u) => u.id === userId) || db.users[2];
  const now = new Date();
  const expiresAt = new Date(now.getTime() + voucher.durationHours * 60 * 60 * 1000);

  voucher.status = 'REDEEMED';
  voucher.redeemedByCustomerName = targetUser.name;
  voucher.redeemedAt = now.toISOString();

  let customerProf = db.customerProfiles.get(targetUser.id);
  if (!customerProf) {
    customerProf = {
      id: `cp-${Date.now()}`,
      userId: targetUser.id,
      internetStatus: 'CONNECTED',
      currentNetwork: voucher.network,
      currentSpeed: voucher.speed,
      dataUsageMb: 0,
      walletBalance: 0,
      referralCode: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      totalReferrals: 0,
      commissionEarned: 0,
      availableCommission: 0,
    };
    db.customerProfiles.set(targetUser.id, customerProf);
  }

  customerProf.internetStatus = 'CONNECTED';
  customerProf.currentSpeed = voucher.speed;
  customerProf.currentNetwork = voucher.network;
  customerProf.currentPackage = {
    id: `cpkg-${Date.now()}`,
    packageId: voucher.packageId,
    packageName: voucher.packageName,
    activatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'ACTIVE',
    speed: voucher.speed,
  };

  const receiptNumber = `BRK-${String(db.transactions.length + 1).padStart(6, '0')}`;
  const tx: Transaction = {
    id: `tx-${Date.now()}`,
    receiptNumber,
    userId: targetUser.id,
    userName: targetUser.name,
    type: 'CUSTOMER_WIFI',
    packageName: voucher.packageName,
    amountKes: voucher.priceKes,
    paymentMethod: 'VOUCHER',
    reference: voucher.code,
    status: 'SUCCESS',
    createdAt: now.toISOString(),
  };
  db.transactions.unshift(tx);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userName: targetUser.name,
    userRole: 'CUSTOMER',
    action: 'VOUCHER_REDEEMED',
    resource: 'VOUCHER',
    ipAddress: req.ip || '127.0.0.1',
    timestamp: now.toISOString(),
    result: 'SUCCESS',
    details: `Voucher ${voucher.code} redeemed for ${voucher.packageName}.`,
  });

  return res.json({
    success: true,
    message: `Voucher applied successfully! Enjoy your ${voucher.packageName} high-speed internet.`,
    voucher,
    customerProfile: customerProf,
  });
});

// Customer Withdrawals
app.post('/api/customer/withdraw', (req, res) => {
  const { userId, amount, phone } = req.body;
  if (!amount || amount < 100) {
    return res.status(400).json({ error: 'Minimum withdrawal amount is KES 100.' });
  }

  const targetUser = db.users.find((u) => u.id === userId) || db.users[2];
  const customerProf = db.customerProfiles.get(targetUser.id);

  if (customerProf && customerProf.availableCommission < amount) {
    return res.status(400).json({
      error: `Insufficient available balance. You have KES ${customerProf.availableCommission}.`,
    });
  }

  if (customerProf) {
    customerProf.availableCommission -= Number(amount);
  }

  const withdrawal: WithdrawalRequest = {
    id: `wdr-${Date.now()}`,
    userId: targetUser.id,
    userName: targetUser.name,
    userRole: targetUser.role,
    amountKes: Number(amount),
    paymentMethod: 'M-PESA',
    phone: phone || targetUser.phone,
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
  };

  db.withdrawals.unshift(withdrawal);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userName: targetUser.name,
    userRole: targetUser.role,
    action: 'WITHDRAWAL_REQUESTED',
    resource: 'M-PESA',
    ipAddress: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString(),
    result: 'SUCCESS',
    details: `Withdrawal request of KES ${amount} submitted for processing.`,
  });

  return res.json({ success: true, withdrawal, customerProfile: customerProf });
});

// Installation Requests
app.post('/api/installations/request', (req, res) => {
  const { userId, type, location, preferredDate, preferredTime, phone, notes } = req.body;
  if (!location || !phone || !type) {
    return res.status(400).json({ error: 'Installation type, location, and phone are required.' });
  }

  const targetUser = db.users.find((u) => u.id === userId) || db.users[1];
  const priceKes = type === 'WIRED' ? 2999 : 8499;

  const newInstallation: InstallationRequest = {
    id: `inst-${Date.now()}`,
    userId: targetUser.id,
    userName: targetUser.name,
    phone,
    type,
    priceKes,
    location,
    preferredDate: preferredDate || '2026-10-05',
    preferredTime: preferredTime || '10:00 AM',
    notes: notes || '',
    status: 'REQUESTED',
    createdAt: new Date().toISOString(),
  };

  db.installations.unshift(newInstallation);

  return res.json({ success: true, installation: newInstallation });
});

// Router Owner: Connect Router & Generate MikroTik Setup Script
app.post('/api/owner/routers/connect', (req, res) => {
  const {
    ownerId,
    name,
    location,
    networkName,
    model,
    ipAddress,
    connectionMethod,
  } = req.body;

  if (!name || !location || !model) {
    return res.status(400).json({ error: 'Router name, location, and model are required.' });
  }

  const targetUser = db.users.find((u) => u.id === ownerId) || db.users[1];

  const newRouter: RouterDevice = {
    id: `rtr-${Date.now()}`,
    ownerId: targetUser.id,
    ownerName: targetUser.name,
    name,
    location,
    networkName: networkName || 'BRISK Smart WiFi',
    model,
    ipAddress: ipAddress || '192.168.88.1',
    routerOsVersion: 'RouterOS 7.15',
    status: 'ONLINE',
    cpuLoadPercent: 14,
    ramUsagePercent: 29,
    uptime: '1h 10m',
    internetStatus: 'ONLINE',
    activeUsers: 0,
    uploadTrafficMbps: 0,
    downloadTrafficMbps: 0,
    lastHeartbeat: 'Just now',
    connectionMethod: connectionMethod || 'BRISK Setup Script',
  };

  db.routers.push(newRouter);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userName: targetUser.name,
    userRole: 'ROUTER_OWNER',
    action: 'ROUTER_CONNECTED',
    resource: 'ROUTER',
    ipAddress: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString(),
    result: 'SUCCESS',
    details: `Connected ${model} at ${location}`,
  });

  return res.json({ success: true, router: newRouter });
});

// Router Action (reboot, test, disconnect user)
app.post('/api/owner/routers/action', (req, res) => {
  const { routerId, action, targetSessionId } = req.body;
  const router = db.routers.find((r) => r.id === routerId);

  if (!router) {
    return res.status(404).json({ error: 'Router not found.' });
  }

  if (action === 'RESTART') {
    router.uptime = '0m';
    router.cpuLoadPercent = 10;
    return res.json({ success: true, message: `Router ${router.name} has been rebooted.` });
  }

  if (action === 'TEST_CONNECTION') {
    return res.json({
      success: true,
      pingMs: 14,
      packetLossPercent: 0,
      routerOs: router.routerOsVersion,
      hotspotActive: true,
      message: 'Connection verified. Router responded with zero packet loss in 14ms.',
    });
  }

  if (action === 'DISCONNECT_USER' && targetSessionId) {
    db.wifiSessions = db.wifiSessions.filter((s) => s.id !== targetSessionId);
    if (router.activeUsers > 0) router.activeUsers--;
    return res.json({ success: true, message: 'Session terminated and user disconnected.' });
  }

  return res.json({ success: true, message: 'Action executed successfully.' });
});

// Router Owner: Generate Vouchers (Single or Bulk)
app.post('/api/owner/vouchers/generate', (req, res) => {
  const { packageId, quantity, networkName } = req.body;
  const pkg = db.wifiPackages.find((p) => p.id === packageId) || db.wifiPackages[3];
  const count = Math.min(Math.max(Number(quantity) || 1, 1), 100);
  const batchNumber = `BATCH-${new Date().toISOString().slice(0, 10)}-${Math.floor(100 + Math.random() * 900)}`;

  const createdVouchers: Voucher[] = [];

  for (let i = 0; i < count; i++) {
    const part1 = Math.floor(1000 + Math.random() * 9000);
    const part2 = Math.floor(1000 + Math.random() * 9000);
    const code = `BRK-${part1}-${part2}`;

    const newVoucher: Voucher = {
      id: `vch-${Date.now()}-${i}`,
      code,
      packageId: pkg.id,
      packageName: pkg.name,
      durationHours: pkg.durationHours,
      priceKes: pkg.priceKes,
      speed: pkg.speedLabel,
      network: networkName || 'BRISK Kiambu',
      status: 'UNUSED',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      batchNumber,
    };

    createdVouchers.push(newVoucher);
    db.vouchers.unshift(newVoucher);
  }

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userName: 'Router Owner',
    userRole: 'ROUTER_OWNER',
    action: 'VOUCHERS_GENERATED',
    resource: 'VOUCHER',
    ipAddress: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString(),
    result: 'SUCCESS',
    details: `Generated ${count} vouchers for ${pkg.name}. Batch: ${batchNumber}`,
  });

  return res.json({ success: true, vouchers: createdVouchers, count, batchNumber });
});

// WiFi Host Application
app.post('/api/host-application', (req, res) => {
  const { fullName, phone, email, location, internetProvider, speedMbps, routerModel, availability } = req.body;

  if (!fullName || !phone || !location) {
    return res.status(400).json({ error: 'Name, phone, and location are required.' });
  }

  const newApp: HostApplication = {
    id: `host-${Date.now()}`,
    fullName,
    phone,
    email: email || '',
    location,
    internetProvider: internetProvider || 'Fiber Provider',
    speedMbps: Number(speedMbps) || 50,
    routerModel: routerModel || 'Standard WiFi Router',
    availability: availability || '24/7',
    status: 'PENDING',
    submittedAt: new Date().toISOString(),
  };

  db.hostApplications.unshift(newApp);

  return res.json({
    success: true,
    message: 'Your WiFi Host application has been received! Our operations team will contact you within 24 hours.',
    application: newApp,
  });
});

// Support Ticket Creation & Reply
app.post('/api/support/tickets', (req, res) => {
  const { userId, category, subject, description, priority } = req.body;
  const user = db.users.find((u) => u.id === userId) || db.users[2];

  const ticket: SupportTicket = {
    id: `tkt-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    category: category || 'WIFI',
    subject: subject || 'Network Question',
    description: description || '',
    priority: priority || 'MEDIUM',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    replies: [],
  };

  db.tickets.unshift(ticket);
  return res.json({ success: true, ticket });
});

app.post('/api/support/tickets/:id/reply', (req, res) => {
  const { message, senderName, isAdmin } = req.body;
  const ticket = db.tickets.find((t) => t.id === req.params.id);

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found.' });
  }

  ticket.replies.push({
    id: `rep-${Date.now()}`,
    senderName: senderName || 'Agent',
    isAdmin: Boolean(isAdmin),
    message: message || '',
    createdAt: new Date().toISOString(),
  });
  ticket.updatedAt = new Date().toISOString();

  return res.json({ success: true, ticket });
});

// Super Admin: Withdrawal Approval / Rejection
app.post('/api/admin/withdrawals/action', (req, res) => {
  const { withdrawalId, action, notes } = req.body;
  const item = db.withdrawals.find((w) => w.id === withdrawalId);

  if (!item) {
    return res.status(404).json({ error: 'Withdrawal not found.' });
  }

  if (action === 'APPROVE') {
    item.status = 'COMPLETED';
    item.processedAt = new Date().toISOString();
    item.notes = notes || 'Approved & Disbursed via M-Pesa B2C';
  } else if (action === 'REJECT') {
    item.status = 'REJECTED';
    item.notes = notes || 'Rejected due to verification failure';
  }

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userName: 'Super Admin',
    userRole: 'SUPER_ADMIN',
    action: action === 'APPROVE' ? 'WITHDRAWAL_APPROVED' : 'WITHDRAWAL_REJECTED',
    resource: 'WITHDRAWAL',
    ipAddress: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString(),
    result: 'SUCCESS',
    details: `Withdrawal #${item.id} of KES ${item.amountKes} was ${item.status}`,
  });

  return res.json({ success: true, withdrawal: item });
});

// Super Admin: User Status Toggle (Suspend / Reactivate)
app.post('/api/admin/users/toggle-status', (req, res) => {
  const { userId, status } = req.body;
  const user = db.users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  user.status = status;
  return res.json({ success: true, user });
});

// Global Data Endpoint to hydrate all views accurately
app.get('/api/state', (_req, res) => {
  return res.json({
    users: db.users,
    customerProfiles: Array.from(db.customerProfiles.entries()),
    routerOwnerProfiles: Array.from(db.routerOwnerProfiles.entries()),
    wifiPackages: db.wifiPackages,
    subscriptionPlans: db.subscriptionPlans,
    routers: db.routers,
    accessPoints: db.accessPoints,
    wifiSessions: db.wifiSessions,
    pppoeUsers: db.pppoeUsers,
    vouchers: db.vouchers,
    transactions: db.transactions,
    commissions: db.commissions,
    withdrawals: db.withdrawals,
    installations: db.installations,
    incidents: db.incidents,
    businessProfiles: Array.from(db.businessProfiles.entries()),
    tickets: db.tickets,
    auditLogs: db.auditLogs,
    hostApplications: db.hostApplications,
  });
});

// Mount Vite or serve static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BRISK Smart Connect] Server listening on port ${PORT}`);
  });
}

startServer();
