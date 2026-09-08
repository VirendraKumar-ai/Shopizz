<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const unit = ref<'in' | 'cm'>('in')

const measurements = computed(() => {
  if (unit.value === 'in') {
    return [
      { size: 'XS', chest: '38', length: '27.5', shoulder: '17.5', sleeve: '24' },
      { size: 'S', chest: '40', length: '28.5', shoulder: '18.0', sleeve: '24.5' },
      { size: 'M', chest: '42', length: '29.5', shoulder: '18.5', sleeve: '25' },
      { size: 'L', chest: '44', length: '30.5', shoulder: '19.2', sleeve: '25.5' },
      { size: 'XL', chest: '46', length: '31.5', shoulder: '20.0', sleeve: '26' },
    ]
  }
  return [
    { size: 'XS', chest: '96.5', length: '70', shoulder: '44.5', sleeve: '61' },
    { size: 'S', chest: '101.5', length: '72.5', shoulder: '45.7', sleeve: '62.2' },
    { size: 'M', chest: '106.5', length: '75', shoulder: '47', sleeve: '63.5' },
    { size: 'L', chest: '111.8', length: '77.5', shoulder: '48.8', sleeve: '64.8' },
    { size: 'XL', chest: '116.8', length: '80', shoulder: '50.8', sleeve: '66' },
  ]
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm"
        @click="emit('close')"
      >
        <div
          class="w-full max-w-lg rounded-3xl bg-[#FAF8F5] border border-[#E8E2D8] p-6 sm:p-8 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Size Guide"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-[#E8E2D8]">
            <div class="flex items-center gap-2.5">
              <Icon name="ph:ruler-bold" class="h-5 w-5 text-[#94442A]" />
              <h3 class="font-serif text-xl font-medium text-[#1F2623]">Garment Size Guide</h3>
            </div>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 hover:bg-stone-200 transition-colors"
              aria-label="Close size guide"
              @click="emit('close')"
            >
              <Icon name="ph:x-bold" class="h-4 w-4" />
            </button>
          </div>

          <!-- Unit Selector -->
          <div class="mt-4 flex items-center justify-between">
            <p class="text-xs text-[#7A746B]">
              Relaxed fit. Take your true size for a standard drape.
            </p>
            <div class="flex items-center rounded-full bg-[#EDE6DC] p-0.5 text-xs font-semibold">
              <button
                type="button"
                class="rounded-full px-3 py-1 transition-all"
                :class="unit === 'in' ? 'bg-white text-[#1F2623] shadow-sm' : 'text-[#7A746B]'"
                @click="unit = 'in'"
              >
                Inches
              </button>
              <button
                type="button"
                class="rounded-full px-3 py-1 transition-all"
                :class="unit === 'cm' ? 'bg-white text-[#1F2623] shadow-sm' : 'text-[#7A746B]'"
                @click="unit = 'cm'"
              >
                CM
              </button>
            </div>
          </div>

          <!-- Measurement Table -->
          <div class="mt-4 overflow-hidden rounded-2xl border border-[#E8E2D8] bg-white">
            <table class="w-full text-left text-xs">
              <thead class="bg-[#F6F1E9] text-[#7A746B] uppercase tracking-wider font-semibold border-b border-[#E8E2D8]">
                <tr>
                  <th class="py-3 px-4">Size</th>
                  <th class="py-3 px-3">Chest</th>
                  <th class="py-3 px-3">Length</th>
                  <th class="py-3 px-3">Shoulder</th>
                  <th class="py-3 px-3">Sleeve</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#EFEAE2] text-[#1F2623]">
                <tr
                  v-for="row in measurements"
                  :key="row.size"
                  class="hover:bg-[#FAF8F5] transition-colors"
                >
                  <td class="py-3 px-4 font-bold">{{ row.size }}</td>
                  <td class="py-3 px-3 text-[#555]">{{ row.chest }}</td>
                  <td class="py-3 px-3 text-[#555]">{{ row.length }}</td>
                  <td class="py-3 px-3 text-[#555]">{{ row.shoulder }}</td>
                  <td class="py-3 px-3 text-[#555]">{{ row.sleeve }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Measuring instructions -->
          <div class="mt-5 rounded-2xl bg-[#F0EBE1] p-4 text-[11.5px] text-[#555] space-y-1.5 leading-relaxed">
            <p><strong>• Chest:</strong> Measure across the fullest part of the chest, under armpits.</p>
            <p><strong>• Length:</strong> Measure from the highest point of the shoulder down to the hem.</p>
          </div>

          <button
            type="button"
            class="mt-6 w-full rounded-full bg-[#1F2623] py-3 text-xs font-semibold text-white hover:bg-[#2e3b33] transition-colors"
            @click="emit('close')"
          >
            Got it, return to product
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
