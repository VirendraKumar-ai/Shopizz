<script setup lang="ts">
export interface OrderHistoryItem {
  id?: string
  status: string
  message?: string | null
  createdAt: string | Date
}

const props = defineProps<{
  currentStatus: string
  history?: OrderHistoryItem[]
}>()

const STAGES = [
  { key: 'PLACED', title: 'Order Placed', subtitle: 'Order received & logged' },
  { key: 'CONFIRMED', title: 'Confirmed', subtitle: 'Verified by shop owner' },
  { key: 'PROCESSING', title: 'Crafting / Packing', subtitle: 'Preparing curated pieces' },
  { key: 'SHIPPED', title: 'Dispatched', subtitle: 'In transit with courier' },
  { key: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', subtitle: 'Arriving today' },
  { key: 'DELIVERED', title: 'Delivered', subtitle: 'Safely fulfilled' },
]

const stageOrder = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']

const currentStageIndex = computed(() => {
  const s = props.currentStatus?.toUpperCase()
  return stageOrder.indexOf(s)
})

const getHistoryRecord = (stageKey: string) => {
  if (!props.history || !props.history.length) return null
  return props.history.find((h) => h.status?.toUpperCase() === stageKey)
}

const formatDate = (date: string | Date | undefined) => {
  if (!date) return ''
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white/40 p-6 sm:p-8">
    <div class="flex items-center justify-between border-b border-[var(--shopizz-obsidian)]/10 pb-4">
      <div>
        <p class="text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--shopizz-saffron)]">
          Live Fulfillment Journey
        </p>
        <h3 class="text-base font-medium tracking-tight">
          Tracking & Status Timeline
        </h3>
      </div>

      <OrderStatusBadge :status="currentStatus" />
    </div>

    <!-- Stepper List -->
    <div class="mt-8 space-y-6">
      <div
        v-for="(stage, idx) in STAGES"
        :key="stage.key"
        class="relative flex items-start gap-4"
      >
        <!-- Connecting Line -->
        <div
          v-if="idx < STAGES.length - 1"
          class="absolute left-3.5 top-7 -bottom-6 w-0.5"
          :class="
            currentStageIndex >= idx + 1
              ? 'bg-[var(--shopizz-moss)]'
              : 'bg-[var(--shopizz-obsidian)]/10'
          "
        />

        <!-- Node Icon -->
        <div
          class="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all"
          :class="[
            currentStageIndex > idx
              ? 'bg-[var(--shopizz-moss)] text-white'
              : currentStageIndex === idx
              ? 'bg-[var(--shopizz-saffron)] text-white ring-4 ring-[var(--shopizz-saffron)]/20'
              : 'border border-[var(--shopizz-obsidian)]/15 bg-white text-[var(--shopizz-obsidian)]/30'
          ]"
        >
          <span v-if="currentStageIndex > idx">✓</span>
          <span v-else-if="currentStageIndex === idx">●</span>
          <span v-else>{{ idx + 1 }}</span>
        </div>

        <!-- Details -->
        <div class="flex-1 min-w-0 pt-0.5">
          <div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
            <h4
              class="text-xs font-medium"
              :class="
                currentStageIndex >= idx
                  ? 'text-[var(--shopizz-obsidian)] font-semibold'
                  : 'text-[var(--shopizz-obsidian)]/40'
              "
            >
              {{ stage.title }}
            </h4>

            <span
              v-if="getHistoryRecord(stage.key)"
              class="text-[10px] font-mono text-[var(--shopizz-obsidian)]/50"
            >
              {{ formatDate(getHistoryRecord(stage.key)?.createdAt) }}
            </span>
          </div>

          <p
            class="text-[11px] mt-0.5"
            :class="
              currentStageIndex >= idx
                ? 'text-[var(--shopizz-obsidian)]/60'
                : 'text-[var(--shopizz-obsidian)]/30'
            "
          >
            {{ getHistoryRecord(stage.key)?.message || stage.subtitle }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
