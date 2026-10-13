export type UserRole = 'SUPER_ADMIN' | 'ROUTER_OWNER' | 'CUSTOMER' | 'TECHNICIAN';

export type SubscriptionStatus =
  | 'TRIAL'
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'GRACE_PERIOD'
  | 'SUSPENDED'
  | 'CANCELLED';

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'WARNING' | 'MAINTENANCE';

export type VoucherStatus = 'UNUSED' | 'REDEEMED' | 'EXPIRED' | 'CANCELLED';

export type PaymentStatus =
  | 'WAITING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'TIMEOUT';

export type PaymentType =
  | 'CUSTOMER_WIFI'
  | 'ROUTER_OWNER_SUBSCRIPTION'
  | 'INSTALLATION'
  | 'OTHER';

export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export type InstallationStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'ASSIGNED'
  | 'ON_THE_WAY'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'UNVERIFIED';
}

export interface CustomerProfile {
  id: string;
  userId: string;
  currentPackage?: CustomerPackage;
  internetStatus: 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED';
  currentNetwork: string;
  currentSpeed: string;
  dataUsageMb: number;
  walletBalance: number;
  referralCode: string;
  totalReferrals: number;
  commissionEarned: number;
  availableCommission: number;
}

export interface RouterOwnerProfile {
  id: string;
  userId: string;
  businessName: string;
  subscriptionPlanId: string;
  subscriptionStatus: SubscriptionStatus;
  trialStartedAt: string;
  trialEndsAt: string;
  subscriptionExpiresAt: string;
  maxRouters: number;
  maxAccessPoints: number;
  maxCustomers: number;
  darajaConfigured: boolean;
  whatsappConfigured: boolean;
  emailConfigured: boolean;
}

export interface WifiPackage {
  id: string;
  name: string;
  durationHours: number;
  durationLabel: string;
  priceKes: number;
  speedLabel: string;
  downloadSpeedMbps: number;
  uploadSpeedMbps: number;
  category: 'HOURLY' | 'DAILY' | 'MULTI_DAY' | 'MONTHLY';
  deviceLimit: number;
  fairUsageGb?: number;
  isPopular?: boolean;
  description: string;
}

export interface CustomerPackage {
  id: string;
  packageId: string;
  packageName: string;
  activatedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  speed: string;
  isFreeWelcomePackage?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceKes: number;
  durationDays: number;
  maxRouters: number;
  maxAccessPoints: number;
  maxCustomers: number;
  maxVouchers: number;
  features: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

export interface RouterDevice {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  location: string;
  networkName: string;
  model: string;
  ipAddress: string;
  routerOsVersion: string;
  status: DeviceStatus;
  cpuLoadPercent: number;
  ramUsagePercent: number;
  uptime: string;
  internetStatus: 'ONLINE' | 'OFFLINE';
  activeUsers: number;
  uploadTrafficMbps: number;
  downloadTrafficMbps: number;
  lastHeartbeat: string;
  connectionMethod: 'RouterOS API' | 'WireGuard' | 'REST API' | 'BRISK Setup Script' | 'Manual';
}

export interface AccessPoint {
  id: string;
  routerId: string;
  routerName: string;
  name: string;
  location: string;
  ssid: string;
  ipAddress: string;
  model: string;
  status: DeviceStatus;
  connectedUsers: number;
  trafficMbps: number;
  uptime: string;
  lastSeen: string;
}

export interface WifiSession {
  id: string;
  customerId: string;
  customerName: string;
  routerId: string;
  routerName: string;
  apName: string;
  ipAddress: string;
  macAddress: string;
  packageName: string;
  speed: string;
  connectedAt: string;
  usageMb: number;
  remainingSeconds: number;
}

export interface PppoeUser {
  id: string;
  username: string;
  ipAddress: string;
  routerName: string;
  speed: string;
  downloadMb: number;
  uploadMb: number;
  connectedDuration: string;
  expiresAt: string;
  status: 'CONNECTED' | 'DISCONNECTED';
}

export interface Voucher {
  id: string;
  code: string;
  packageId: string;
  packageName: string;
  durationHours: number;
  priceKes: number;
  speed: string;
  routerId?: string;
  network: string;
  status: VoucherStatus;
  createdAt: string;
  expiresAt: string;
  redeemedByCustomerName?: string;
  redeemedAt?: string;
  batchNumber?: string;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  userId: string;
  userName: string;
  type: PaymentType;
  packageName?: string;
  amountKes: number;
  paymentMethod: 'M-PESA' | 'VOUCHER' | 'COMMISSION_BALANCE';
  reference: string;
  status: PaymentStatus;
  createdAt: string;
  mpesaPhone?: string;
}

export interface ReferralCommission {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUserName: string;
  purchasePackage: string;
  purchaseAmountKes: number;
  commissionKes: number;
  ratePercent: number;
  createdAt: string;
  status: 'EARNED' | 'PAID' | 'WITHDRAWN';
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  amountKes: number;
  paymentMethod: 'M-PESA';
  phone: string;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
  notes?: string;
}

export interface InstallationRequest {
  id: string;
  userId: string;
  userName: string;
  phone: string;
  type: 'WIRED' | 'WIRELESS';
  priceKes: number;
  location: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  status: InstallationStatus;
  assignedTechnicianName?: string;
  technicianPhone?: string;
  createdAt: string;
  photoUrls?: string[];
}

export interface NetworkIncident {
  id: string;
  incidentNumber: string;
  networkName: string;
  routerName: string;
  status: 'OPEN' | 'RESOLVED';
  startedAt: string;
  lastHeartbeat: string;
  affectedUsers: number;
  resolvedAt?: string;
  downtimeMinutes?: number;
}

export interface BusinessProfile {
  handle: string;
  businessName: string;
  logoUrl: string;
  coverImageUrl: string;
  description: string;
  location: string;
  phone: string;
  whatsapp: string;
  email: string;
  openingHours: string;
  services: string[];
  wifiAvailability: string;
  supportContact: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  category: 'PAYMENT' | 'ROUTER' | 'WIFI' | 'VOUCHER' | 'SUBSCRIPTION' | 'INSTALLATION' | 'ACCOUNT' | 'TECHNICAL' | 'OTHER';
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  replies: Array<{
    id: string;
    senderName: string;
    isAdmin: boolean;
    message: string;
    createdAt: string;
  }>;
}

export interface AuditLog {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  ipAddress: string;
  timestamp: string;
  result: 'SUCCESS' | 'FAILED' | 'WARNING';
  details?: string;
}

export interface HostApplication {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  location: string;
  internetProvider: string;
  speedMbps: number;
  routerModel: string;
  availability: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}
