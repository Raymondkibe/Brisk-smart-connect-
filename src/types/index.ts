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
  | 'TIMEOUT'
  | 'PENDING';

export type PaymentType =
  | 'CUSTOMER_WIFI'
  | 'CUSTOMER_PPPOE'
  | 'ROUTER_OWNER_SUBSCRIPTION'
  | 'INSTALLATION'
  | 'OTHER';

export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type PaymentMethodType = 'MPESA_TILL' | 'MPESA_PAYBILL' | 'MPESA_PHONE' | 'BANK';

export interface OwnerPaymentMethod {
  id: string;
  owner_id: string;
  owner_name: string;
  phone: string;
  type: PaymentMethodType;
  label: string;
  number: string;
  business_name: string;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  verified_at?: string;
  bank_name?: string;
  account_name?: string;
}

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
  connectionStatus?: 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED';
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
  businessLocation?: string;
  supportContact?: string;
  mpesaNumber?: string;
  subscriptionPlanId: string;
  subscriptionStatus: SubscriptionStatus;
  trialStartedAt: string;
  trialEndsAt: string;
  subscriptionExpiresAt: string;
  subscriptionEndDate?: string;
  subscriptionExpiry?: string;
  primaryNetworkSsid?: string;
  maxRouters: number;
  maxAccessPoints: number;
  maxCustomers: number;
  darajaConfigured: boolean;
  whatsappConfigured: boolean;
  emailConfigured: boolean;
  referralCode?: string;
  walletBalanceKes?: number;
  totalReferrals?: number;
  commissionEarned?: number;
  availableCommission?: number;
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
  category: 'HOURLY' | 'DAILY' | 'MULTI_DAY' | 'MONTHLY' | 'TV';
  deviceLimit: number;
  fairUsageGb?: number;
  isPopular?: boolean;
  description: string;
  isCustom?: boolean;
  tenantId?: string;
  expiryDate?: string;
}

export interface CustomerPackage {
  id: string;
  packageId: string;
  packageName: string;
  name?: string;
  activatedAt: string;
  expiresAt: string;
  expiryDate?: string;
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
  enrollmentToken?: string;
  firmwareVersion?: string;
  lastSeen?: string;
  isAntiBypassActive?: boolean;
  wifiPassword?: string;
  wifiSecurityMode?: string;
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
  expiryDate?: string;
  status: 'CONNECTED' | 'DISCONNECTED';
  password?: string;
  phone?: string;
  monthlyFeeKes?: number;
  customerName?: string;
  allocatedSpeed?: string;
  uptime?: string;
  macAddress?: string;
  routerId?: string;
}

export interface Voucher {
  id: string;
  code: string;
  packageId: string;
  packageName: string;
  durationHours: number;
  priceKes: number;
  speed: string;
  downloadSpeedMbps?: number;
  uploadSpeedMbps?: number;
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
  flowCategory?: 'PLATFORM_SAAS' | 'ISP_REVENUE';
  ispBusinessName?: string;
  recipientAccount?: string;
  beneficiaryName?: string;
  packageName?: string;
  amountKes: number;
  paymentMethod: 'M-PESA' | 'VOUCHER' | 'COMMISSION_BALANCE' | 'OTHER' | 'BANK' | 'CASH';
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
  packageName?: string;
  purchaseAmountKes: number;
  packagePriceKes?: number;
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
  amount?: number;
  feeKes?: number;
  netAmountKes?: number;
  feePercent?: number;
  paymentMethod: 'M-PESA';
  phone: string;
  status: WithdrawalStatus;
  requestedAt: string;
  createdAt?: string;
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
  companyName?: string;
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

// CAPTIVE PORTAL DESIGNER & CUSTOMIZATION TYPES
export interface PortalConfig {
  id: string;
  tenantId: string;
  portalName: string;
  businessDisplayName: string;
  locationName: string;
  welcomeHeading: string;
  welcomeDescription: string;
  logoPath: string;
  backgroundImagePath: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  theme: 'modern' | 'classic' | 'minimal' | 'aurora';
  fontFamily: string;
  defaultLanguage: string;
  enabledAuthMethods: Array<'ACCOUNT' | 'REGISTER' | 'MPESA' | 'VOUCHER' | 'TRIAL'>;
  supportPhone: string;
  supportEmail: string;
  termsUrl: string;
  privacyUrl: string;
  postLoginDestination: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  isDarkMode: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
}

export interface PortalPageContent {
  welcomeHeading?: string;
  welcomeSubheading?: string;
  welcomeButtonText?: string;
  loginHeading?: string;
  loginSubheading?: string;
  registerHeading?: string;
  packagesHeading?: string;
  packagesSubheading?: string;
  paymentNotice?: string;
  successTitle?: string;
  successMessage?: string;
  supportHelpText?: string;
  termsNotice?: string;
}

export interface PortalPage {
  id: string;
  portalConfigId: string;
  pageKey: 'WELCOME' | 'LOGIN' | 'REGISTER' | 'PACKAGES' | 'PAYMENT' | 'ACTIVE_SESSION' | 'SUPPORT' | 'TERMS';
  pageContent: PortalPageContent;
  visibilitySettings: Record<string, boolean>;
  updatedAt: string;
}

export interface PortalPackageAssignment {
  id: string;
  tenantId: string;
  portalConfigId: string;
  officialPackageId: string;
  isEnabled: boolean;
  displayOrder: number;
  isHighlighted: boolean;
  customDescription?: string;
}

export interface PortalDraft {
  id: string;
  tenantId: string;
  portalConfigId: string;
  configurationJson: PortalConfig & {
    pages: Record<string, PortalPageContent>;
    packageAssignments: PortalPackageAssignment[];
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortalVersion {
  id: string;
  tenantId: string;
  portalConfigId: string;
  versionNumber: number;
  publishedConfiguration: PortalConfig & {
    pages: Record<string, PortalPageContent>;
    packageAssignments: PortalPackageAssignment[];
  };
  publishedBy: string;
  publishedAt: string;
  summary: string;
}

export interface PortalRouterAssignment {
  id: string;
  tenantId: string;
  portalConfigId: string;
  routerId: string;
  hotspotIdentifier: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export type IntegrationProviderType = 'mpesa' | 'whatsapp' | 'sms' | 'email';
export type IntegrationStatus = 'NOT_CONNECTED' | 'NEEDS_ATTENTION' | 'SANDBOX_CONNECTED' | 'CONNECTED';

export interface OwnerIntegration {
  id: string;
  ownerId: string;
  providerType: IntegrationProviderType;
  providerName: string;
  environment: 'sandbox' | 'production';
  status: IntegrationStatus;
  publicConfiguration: Record<string, any>;
  secretReference?: string;
  lastTestedAt?: string;
  lastSuccessAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MpesaConfig {
  integrationName: string;
  environment: 'sandbox' | 'production';
  provider: 'daraja' | 'kopo_kopo' | 'custom';
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  accountReference: string;
  transactionDesc: string;
  callbackUrl: string;
  paymentsEnabled: boolean;
}

export interface WhatsappConfig {
  integrationName: string;
  provider: 'meta_cloud' | 'twilio' | 'custom';
  wabaId: string;
  phoneNumberId: string;
  displayPhoneNumber?: string;
  accessToken: string;
  appId?: string;
  appSecret?: string;
  webhookVerifyToken: string;
  webhookStatus: 'VERIFIED' | 'PENDING' | 'FAILED';
  defaultLanguage: string;
  enabledNotifications: {
    paymentConfirm: boolean;
    receipt: boolean;
    packageActive: boolean;
    expiryReminder: boolean;
    voucherDelivery: boolean;
    outageAlert: boolean;
    supportUpdate: boolean;
    securityAlert: boolean;
  };
}

export interface SmsConfig {
  provider: 'africas_talking' | 'twilio' | 'advanta' | 'sms_leopard';
  username: string;
  apiKey: string;
  senderId: string;
  apiEndpoint: string;
  remainingCredits?: number;
  status: 'NOT_CONNECTED' | 'CONNECTED' | 'FAILED';
  enabledNotifications: {
    paymentConfirm: boolean;
    voucherDelivery: boolean;
    expiryReminder: boolean;
  };
}

export interface EmailConfig {
  provider: 'resend' | 'brevo' | 'sendgrid' | 'smtp';
  apiKey: string;
  senderEmail: string;
  senderName: string;
  domainVerified: boolean;
  status: 'NOT_CONNECTED' | 'CONNECTED' | 'FAILED';
  testRecipient?: string;
}

export interface NotificationTemplate {
  id: string;
  ownerId: string;
  type:
    | 'PAYMENT_SUCCESS'
    | 'RECEIPT'
    | 'PACKAGE_ACTIVATED'
    | 'EXPIRING_SOON'
    | 'EXPIRED'
    | 'VOUCHER_CREATED'
    | 'SUPPORT_UPDATE'
    | 'MAINTENANCE';
  title: string;
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL';
  content: string;
  variables: string[];
  whatsappTemplateName?: string;
  updatedAt: string;
}

export interface NotificationLog {
  id: string;
  ownerId: string;
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL';
  notificationType: string;
  recipientMasked: string;
  provider: string;
  providerMessageId: string;
  status: 'DELIVERED' | 'SENT' | 'PENDING' | 'FAILED';
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface WebhookEndpoint {
  id: string;
  ownerId: string;
  provider: 'mpesa' | 'whatsapp' | 'sms' | 'email';
  endpointUrl: string;
  secretToken: string;
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'ERROR';
  eventsReceived: number;
  lastReceivedAt?: string;
  signatureHeader: string;
}

export interface IntegrationAuditLog {
  id: string;
  ownerId: string;
  action:
    | 'CREDENTIAL_CREATED'
    | 'CREDENTIAL_UPDATED'
    | 'CONNECTION_TESTED'
    | 'PAYMENTS_ENABLED'
    | 'PAYMENTS_DISABLED'
    | 'KEY_ROTATED'
    | 'INTEGRATION_DISCONNECTED'
    | 'WEBHOOK_VERIFIED';
  integrationId: string;
  providerType: string;
  timestamp: string;
  ipAddress: string;
  result: 'SUCCESS' | 'FAILED';
  details: string;
}

export type NetworkAuditCategory =
  | 'ROUTER_CONFIG'
  | 'GUEST_CONNECTION'
  | 'PAYMENT_AUTH'
  | 'SECURITY';

export interface NetworkAuditEvent {
  id: string;
  category: NetworkAuditCategory;
  eventType: string;
  title: string;
  description: string;
  severity: 'SUCCESS' | 'INFO' | 'WARNING' | 'CRITICAL';
  routerId?: string;
  routerName?: string;
  accessPointName?: string;
  actor: string;
  targetIp?: string;
  targetMac?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface GeneratedSetupScript {
  id: string;
  token: string;
  ownerId: string;
  routerName: string;
  vendor: 'mikrotik_v7' | 'mikrotik_v6' | 'openwrt' | 'tplink' | 'ubiquiti' | 'radius';
  vendorLabel: string;
  connectionMethod: string;
  scriptContent: string;
  rollbackContent: string;
  status: 'GENERATED' | 'DOWNLOADED' | 'AWAITING_INSTALLATION' | 'ENROLLED' | 'CONNECTED' | 'REVOKED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
  lastTestedAt?: string;
  apiEndpoint?: string;
}

export interface PortalManualPayment {
  id: string;
  paymentMethodId: string;
  methodLabel: string;
  methodType: string;
  accountOrTill: string;
  customerPhone: string;
  transactionReference: string;
  amountKes: number;
  packageId: string;
  packageName: string;
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
  submittedAt: string;
  notes?: string;
}

export interface RouterDiagnosticResult {
  routerId: string;
  routerName: string;
  targetHost: string;
  packetsTransmitted: number;
  packetsReceived: number;
  packetLossPercent: number;
  minLatencyMs: number;
  avgLatencyMs: number;
  maxLatencyMs: number;
  jitterMs: number;
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'DEGRADED' | 'FAILED';
  terminalOutput: string[];
  dnsStatus: {
    googleDns: boolean;
    cloudflareDns: boolean;
  };
  endpoints: {
    captivePortal: boolean;
    darajaMpesa: boolean;
  };
  testedAt: string;
}

export interface RouterLatencyHistoryPoint {
  date: string;
  fullDate: string;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  successRatePercent: number;
  packetLossPercent: number;
  totalPings: number;
  jitterMs: number;
}

export interface RouterAlert {
  id: string;
  routerId: string;
  routerName: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO' | 'RESOLVED';
  title: string;
  message: string;
  metricType: 'LATENCY' | 'PACKET_LOSS' | 'CONNECTIVITY' | 'HEARTBEAT';
  value?: number;
  threshold?: number;
  timestamp: string;
  read: boolean;
}

export interface RouterUsageHeatmapPoint {
  dayIndex: number;
  dayName: string;
  hour: number;
  hourLabel: string;
  activeUsers: number;
  bandwidthMbps: number;
  downloadTrafficMbps: number;
  uploadTrafficMbps: number;
  congestionScore: number;
  intensity: number;
  recommendation: string;
}

export interface SubscriptionActivationCode {
  id: string;
  code: string;
  planId: string;
  planName: string;
  durationDays: number;
  priceKes: number;
  targetOwnerId?: string;
  targetOwnerName?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  status: 'UNUSED' | 'REDEEMED' | 'REVOKED';
  redeemedByOwnerId?: string;
  redeemedByOwnerName?: string;
  redeemedAt?: string;
  notes?: string;
}

export interface ManualSubscriptionRequest {
  id: string;
  ownerId: string;
  ownerName: string;
  businessName: string;
  phone: string;
  planId: string;
  planName: string;
  amountKes: number;
  transactionReference: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  generatedCode?: string;
  submittedAt: string;
  approvedAt?: string;
  adminNotes?: string;
}



