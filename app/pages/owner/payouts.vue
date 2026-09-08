<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'owner'],
})

const {
  data,
  pending,
  refresh,
} = await useFetch<any>('/api/owner/payouts')

const summary = computed(() => data.value?.summary || {
  grossSalesPaise: 0,
  platformFeePaise: 0,
  netEarningsPaise: 0,
  availableBalancePaise: 0,
  nextPayoutDate: '16 Sep 2026',
  platformCommissionRate: '10%',
})

const payouts = computed(() => data.value?.payouts || [])

function formatCurrency(paise: number) {
  return '₹ ' + Math.round((paise || 0) / 100).toLocaleString('en-IN')
}

function handleDownloadStatement(payout: any) {
  const statementText = `
SHOPIZZ ARTISANAL MARKETPLACE - PAYOUT RECEIPT
------------------------------------------------
Payout Reference: ${payout.payoutNumber}
Date: ${payout.payoutDate}
Billing Period: ${payout.period}
Status: ${payout.status}
Bank Transfer UTR: ${payout.bankReference}

Gross Product Sales: ${formatCurrency(payout.grossAmount)}
Platform Fee (10%): -${formatCurrency(payout.platformFee)}
------------------------------------------------
Net Disbursed Amount: ${formatCurrency(payout.netAmount)}
------------------------------------------------
Thank you for creating with Shopizz!
`
  const blob = new Blob([statementText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Shopizz-Payout-${payout.payoutNumber}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-8">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-[#7A746B]">
      <NuxtLink to="/owner" class="hover:text-[#1F2623] transition-colors">Owner Workspace</NuxtLink>
      <span>&gt;</span>
      <span class="font-medium text-[#1F2623]">Payouts & Finances</span>
    </nav>

    <!-- Page Header -->
    <section class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E8E2D8]">
      <div>
        <h1 class="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1F2623]">
          Payouts & Finances
        </h1>
        <p class="mt-1 text-xs sm:text-sm text-[#7A746B]">
          Track gross sales, platform fee deductions, bank settlements, and download transfer receipts.
        </p>
      </div>

      <NuxtLink
        to="/owner/account"
        class="inline-flex items-center gap-2 rounded-full border border-[#D5CEC4] bg-white px-5 py-2 text-xs font-semibold text-[#1F2623] shadow-xs hover:bg-[#FAF8F5] transition-all"
      >
        <span>⚙️ Bank Settings</span>
      </NuxtLink>
    </section>

    <!-- 4 KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 1. Gross Sales -->
      <div class="rounded-3xl border border-[#E8E2D8] bg-white p-5 shadow-xs">
        <p class="text-xs text-[#7A746B]">Gross Marketplace Sales</p>
        <p class="font-serif text-2xl font-bold text-[#1F2623] mt-2">
          {{ formatCurrency(summary.grossSalesPaise) }}
        </p>
        <p class="text-[11px] text-[#2D5A43] font-medium mt-1">Total revenue generated</p>
      </div>

      <!-- 2. Net Earnings -->
      <div class="rounded-3xl border border-[#E8E2D8] bg-white p-5 shadow-xs">
        <p class="text-xs text-[#7A746B]">Total Settled Payouts</p>
        <p class="font-serif text-2xl font-bold text-[#2D5A43] mt-2">
          {{ formatCurrency(summary.netEarningsPaise - summary.availableBalancePaise) }}
        </p>
        <p class="text-[11px] text-[#7A746B] mt-1">Transferred to your bank</p>
      </div>

      <!-- 3. Pending Payout -->
      <div class="rounded-3xl border border-[#E8E2D8] bg-white p-5 shadow-xs">
        <p class="text-xs text-[#7A746B]">Upcoming Settlement</p>
        <p class="font-serif text-2xl font-bold text-[#94442A] mt-2">
          {{ formatCurrency(summary.availableBalancePaise) }}
        </p>
        <p class="text-[11px] text-[#7A746B] mt-1">Disbursing on {{ summary.nextPayoutDate }}</p>
      </div>

      <!-- 4. Platform Fee -->
      <div class="rounded-3xl border border-[#E8E2D8] bg-white p-5 shadow-xs">
        <p class="text-xs text-[#7A746B]">Commission Rate</p>
        <p class="font-serif text-2xl font-bold text-[#1F2623] mt-2">
          {{ summary.platformCommissionRate }}
        </p>
        <p class="text-[11px] text-[#7A746B] mt-1">Standard marketplace fee</p>
      </div>
    </div>

    <!-- Payout Destination Banner -->
    <div class="rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[#E8E2D8] text-xl shadow-xs text-[#94442A]">
          🏦
        </div>
        <div>
          <h4 class="font-serif text-base font-bold text-[#1F2623]">Payout Destination</h4>
          <p class="text-xs text-[#7A746B] mt-0.5">Direct NEFT/RTGS settlement to your verified HDFC Bank Account (•••• 4587).</p>
        </div>
      </div>

      <NuxtLink
        to="/owner/account"
        class="inline-flex items-center gap-1.5 rounded-full bg-[#1F2623] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#2E3C32] transition-colors self-start sm:self-auto"
      >
        <span>Update Bank Details →</span>
      </NuxtLink>
    </div>

    <!-- Payouts Table -->
    <div class="rounded-3xl border border-[#E8E2D8] bg-white p-6 shadow-xs space-y-5">
      <div class="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
        <h3 class="font-serif text-lg font-bold text-[#1F2623]">
          Settlement History & Statements
        </h3>
        <span class="text-xs text-[#7A746B]">{{ payouts.length }} settlements recorded</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-[#E8E2D8] text-[#7A746B] uppercase tracking-wider text-[10px]">
              <th class="pb-3 font-semibold">Reference</th>
              <th class="pb-3 font-semibold">Period</th>
              <th class="pb-3 font-semibold">Gross Sales</th>
              <th class="pb-3 font-semibold">Fee (10%)</th>
              <th class="pb-3 font-semibold">Net Payout</th>
              <th class="pb-3 font-semibold">Status</th>
              <th class="pb-3 font-semibold">Bank UTR</th>
              <th class="pb-3 font-semibold text-right">Receipt</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-[#E8E2D8]">
            <tr
              v-for="p in payouts"
              :key="p.id"
              class="hover:bg-[#FAF8F5] transition-colors"
            >
              <td class="py-4 font-mono font-bold text-[#1F2623]">{{ p.payoutNumber }}</td>
              <td class="py-4 text-[#5A544A]">{{ p.period }}</td>
              <td class="py-4 font-serif font-semibold text-[#1F2623]">{{ formatCurrency(p.grossAmount) }}</td>
              <td class="py-4 text-red-700 font-medium">-{{ formatCurrency(p.platformFee) }}</td>
              <td class="py-4 font-serif font-bold text-[#2D5A43]">{{ formatCurrency(p.netAmount) }}</td>
              <td class="py-4">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  :class="p.status === 'PAID' ? 'bg-[#EBF3EE] text-[#2D5A43]' : 'bg-amber-100 text-amber-800'"
                >
                  {{ p.status }}
                </span>
              </td>
              <td class="py-4 font-mono text-[11px] text-[#7A746B]">{{ p.bankReference }}</td>
              <td class="py-4 text-right">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-xl border border-[#D5CEC4] bg-white px-3 py-1 text-[11px] font-semibold text-[#1F2623] hover:bg-[#FAF8F5] shadow-xs transition-colors cursor-pointer"
                  @click="handleDownloadStatement(p)"
                >
                  <span>⬇ Receipt</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
