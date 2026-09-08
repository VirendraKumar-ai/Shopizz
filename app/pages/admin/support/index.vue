<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

interface SupportUser {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
}

interface SupportMessage {
  id: string
  conversationId: string
  senderId: string
  senderRole: 'BUYER' | 'ADMIN'
  message: string
  isRead: boolean
  createdAt: string
  sender?: SupportUser
}

interface SupportConversation {
  id: string
  userId: string
  subject: string
  topic: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
  createdAt: string
  updatedAt: string
  user?: SupportUser
  lastMessage?: SupportMessage
  unreadCount?: number
}

const authStore = useAuthStore()

// State
const conversations = ref<SupportConversation[]>([])
const selectedConversation = ref<SupportConversation | null>(null)
const messages = ref<SupportMessage[]>([])
const loadingConversations = ref(true)
const loadingMessages = ref(false)
const sendingMessage = ref(false)
const updatingStatus = ref(false)
const replyText = ref('')
const searchQuery = ref('')
const selectedStatusFilter = ref<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL')
const chatContainerRef = ref<HTMLElement | null>(null)

// Polling timer
let pollInterval: any = null

// Canned quick replies
const cannedReplies = [
  'Hello! I am reviewing your request right now.',
  'Your order has been verified and updated.',
  'Could you please share your Order ID or tracking number?',
  'We have processed your refund. It will reflect in 3-5 business days.',
  'Thank you for contacting Shopizz Concierge. Is there anything else I can help with?',
]

// Filtered conversations
const filteredConversations = computed(() => {
  return conversations.value.filter((conv: any) => {
    // Channel filter
    if (selectedStatusFilter.value !== 'ALL' && conv.channelType !== selectedStatusFilter.value) {
      return false
    }
    // Search query filter
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const subjectMatch = conv.subject?.toLowerCase().includes(q)
      const topicMatch = conv.category?.toLowerCase().includes(q)
      const nameMatch = conv.user?.name?.toLowerCase().includes(q)
      const emailMatch = conv.user?.email?.toLowerCase().includes(q)
      return subjectMatch || topicMatch || nameMatch || emailMatch
    }
    return true
  })
})

const openTicketsCount = computed(() => {
  return conversations.value.filter((c) => c.status === 'OPEN').length
})

const inProgressTicketsCount = computed(() => {
  return conversations.value.filter((c) => c.status === 'IN_PROGRESS').length
})

const formatTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
    }
  })
}

// Fetch all conversations
const fetchConversations = async (silent = false) => {
  if (!silent) loadingConversations.value = true
  try {
    const res = await $fetch<{ success: boolean; conversations: SupportConversation[] }>('/api/support/conversations')
    if (res.success && res.conversations) {
      conversations.value = res.conversations

      // If a conversation was selected, update its reference
      if (selectedConversation.value) {
        const updated = conversations.value.find((c) => c.id === selectedConversation.value?.id)
        if (updated) {
          selectedConversation.value = updated
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch support conversations:', err)
  } finally {
    if (!silent) loadingConversations.value = false
  }
}

// Fetch messages for active conversation
const fetchMessages = async (conversationId: string, silent = false) => {
  if (!silent) loadingMessages.value = true
  try {
    const res = await $fetch<{
      success: boolean
      conversation: SupportConversation
      messages: SupportMessage[]
    }>(`/api/support/conversations/${conversationId}/messages`)

    if (res.success) {
      messages.value = res.messages
      if (res.conversation) {
        selectedConversation.value = res.conversation
      }
      scrollToBottom()
    }
  } catch (err) {
    console.error('Failed to fetch messages:', err)
  } finally {
    if (!silent) loadingMessages.value = false
  }
}

// Select a conversation
const selectConversation = async (conv: SupportConversation) => {
  selectedConversation.value = conv
  // Optimistically clear unread count
  conv.unreadCount = 0
  await fetchMessages(conv.id)
}

// Send a message
const sendMessage = async () => {
  if (!replyText.value.trim() || !selectedConversation.value || sendingMessage.value) return

  const text = replyText.value.trim()
  replyText.value = ''
  sendingMessage.value = true

  // Optimistic message
  const tempMsg: SupportMessage = {
    id: 'temp-' + Date.now(),
    conversationId: selectedConversation.value.id,
    senderId: authStore.user?.id || 'admin',
    senderRole: 'ADMIN',
    message: text,
    isRead: true,
    createdAt: new Date().toISOString(),
    sender: {
      id: authStore.user?.id || 'admin',
      name: authStore.user?.name || 'Support Staff',
      email: authStore.user?.email || 'support@shopizz.com',
    },
  }
  messages.value.push(tempMsg)
  scrollToBottom()

  try {
    const res = await $fetch<{ success: boolean; message: SupportMessage; conversation: SupportConversation }>(
      `/api/support/conversations/${selectedConversation.value.id}/messages`,
      {
        method: 'POST',
        body: { message: text },
      }
    )

    if (res.success && res.message) {
      // Replace optimistic message
      const idx = messages.value.findIndex((m) => m.id === tempMsg.id)
      if (idx !== -1) {
        messages.value[idx] = res.message
      }
      if (res.conversation) {
        selectedConversation.value = res.conversation
      }
    }
  } catch (err) {
    console.error('Failed to send message:', err)
    // Remove optimistic message if failed
    messages.value = messages.value.filter((m) => m.id !== tempMsg.id)
    replyText.value = text
  } finally {
    sendingMessage.value = false
  }
}

// Update conversation status
const updateStatus = async (newStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => {
  if (!selectedConversation.value || updatingStatus.value) return
  updatingStatus.value = true

  try {
    const res = await $fetch<{ success: boolean; conversation: SupportConversation }>(
      `/api/support/conversations/${selectedConversation.value.id}/status`,
      {
        method: 'PATCH',
        body: { status: newStatus },
      }
    )

    if (res.success && res.conversation) {
      selectedConversation.value.status = newStatus
      const idx = conversations.value.findIndex((c) => c.id === selectedConversation.value?.id)
      if (idx !== -1) {
        conversations.value[idx].status = newStatus
      }
    }
  } catch (err) {
    console.error('Failed to update status:', err)
  } finally {
    updatingStatus.value = false
  }
}

// Quick apply canned response
const applyCannedReply = (text: string) => {
  replyText.value = text
}

// Handle keydown for Enter to send
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

onMounted(async () => {
  await fetchConversations()

  // Select first conversation by default if available
  if (conversations.value.length > 0 && !selectedConversation.value) {
    selectConversation(conversations.value[0])
  }

  // Set up polling every 6 seconds for fresh tickets and replies
  pollInterval = setInterval(() => {
    fetchConversations(true)
    if (selectedConversation.value) {
      fetchMessages(selectedConversation.value.id, true)
    }
  }, 6000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <section>
      <p class="text-xs font-medium uppercase tracking-[0.3em] text-[var(--shopizz-saffron)]">
        Customer Experience / Concierge
      </p>

      <div class="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-3xl font-medium tracking-tight text-[var(--shopizz-obsidian)] sm:text-4xl font-serif">
            Support & Concierge Inbox
          </h1>
          <p class="mt-2 text-sm text-[var(--shopizz-obsidian)]/60 max-w-2xl">
            Manage buyer inquiries, order assistance, artisan questions, and real-time live support tickets.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <span
            v-if="openTicketsCount > 0"
            class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200"
          >
            <span class="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            {{ openTicketsCount }} Open {{ openTicketsCount === 1 ? 'Ticket' : 'Tickets' }}
          </span>
          <span
            v-if="inProgressTicketsCount > 0"
            class="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 border border-blue-200"
          >
            {{ inProgressTicketsCount }} In Progress
          </span>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl border border-[var(--shopizz-obsidian)]/15 bg-white px-3 py-2 text-xs font-medium text-[var(--shopizz-obsidian)] hover:bg-[#FAF8F5] transition-colors shadow-sm"
            @click="fetchConversations(false)"
          >
            <svg class="h-3.5 w-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Main Two-Pane Chat Workspace -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[680px]">
      <!-- Left Pane: Conversations List (5 Cols) -->
      <div class="lg:col-span-5 flex flex-col rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white shadow-sm overflow-hidden h-[720px]">
        <!-- Search & Filter Bar -->
        <div class="p-4 border-b border-[var(--shopizz-obsidian)]/10 bg-[#FAF8F5]/60 space-y-3">
          <div class="relative">
            <svg class="absolute left-3.5 top-3 h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search by buyer, subject, topic..."
              class="w-full rounded-2xl border border-[var(--shopizz-obsidian)]/15 bg-white pl-10 pr-4 py-2 text-xs text-[var(--shopizz-obsidian)] placeholder:text-stone-400 focus:border-[#94442A] focus:ring-1 focus:ring-[#94442A] outline-none transition-all"
            />
          </div>

          <!-- Channel / Category Filter Tabs -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              :class="[
                'rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all shrink-0 cursor-pointer',
                selectedStatusFilter === 'ALL'
                  ? 'bg-[#94442A] text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
              ]"
              @click="selectedStatusFilter = 'ALL'"
            >
              All ({{ conversations.length }})
            </button>
            <button
              type="button"
              :class="[
                'rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all shrink-0 cursor-pointer',
                selectedStatusFilter === 'BUYER_TO_ADMIN'
                  ? 'bg-[#128C7E] text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
              ]"
              @click="selectedStatusFilter = 'BUYER_TO_ADMIN'"
            >
              🛍️ Buyer Tickets
            </button>
            <button
              type="button"
              :class="[
                'rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all shrink-0 cursor-pointer',
                selectedStatusFilter === 'OWNER_TO_ADMIN'
                  ? 'bg-[#075E54] text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
              ]"
              @click="selectedStatusFilter = 'OWNER_TO_ADMIN'"
            >
              🏪 Owner Help
            </button>
            <button
              type="button"
              :class="[
                'rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all shrink-0 cursor-pointer',
                selectedStatusFilter === 'AI_ASSISTANT'
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
              ]"
              @click="selectedStatusFilter = 'AI_ASSISTANT'"
            >
              🤖 AI Logs
            </button>
          </div>
        </div>

        <!-- Conversations Scroll List -->
        <div class="flex-1 overflow-y-auto divide-y divide-stone-100 scrollbar-thin">
          <!-- Loading State -->
          <div v-if="loadingConversations && !conversations.length" class="p-8 text-center">
            <div class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#94442A] border-t-transparent mb-2"></div>
            <p class="text-xs text-stone-500 font-medium">Loading support inquiries...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!filteredConversations.length" class="p-12 text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400 mb-3 text-lg">
              💬
            </div>
            <p class="text-sm font-serif font-medium text-[var(--shopizz-obsidian)]">No conversations found</p>
            <p class="text-xs text-stone-500 mt-1">There are no support threads matching your filter.</p>
          </div>

          <!-- Conversation Item -->
          <div
            v-for="conv in filteredConversations"
            v-else
            :key="conv.id"
            :class="[
              'p-4 transition-all cursor-pointer flex items-start gap-3.5',
              selectedConversation?.id === conv.id
                ? 'bg-[#FDF3EE] border-l-4 border-l-[#94442A]'
                : 'hover:bg-[#FAF8F5]/80',
            ]"
            @click="selectConversation(conv)"
          >
            <!-- User Avatar / Initial -->
            <div class="relative shrink-0">
              <div class="h-10 w-10 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center font-bold text-xs text-stone-700 overflow-hidden">
                <img
                  v-if="conv.user?.avatarUrl"
                  :src="conv.user.avatarUrl"
                  :alt="conv.user.name"
                  class="h-full w-full object-cover"
                />
                <span v-else>{{ conv.user?.name ? conv.user.name.charAt(0).toUpperCase() : 'U' }}</span>
              </div>
              <!-- Online/Unread Dot -->
              <span
                v-if="conv.unreadCount && conv.unreadCount > 0"
                class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#94442A] text-[10px] font-bold text-white shadow"
              >
                {{ conv.unreadCount }}
              </span>
            </div>

            <!-- Thread Details -->
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-1 mb-1">
                <p class="text-xs font-semibold text-[var(--shopizz-obsidian)] truncate">
                  {{ conv.user?.name || 'Customer' }}
                </p>
                <span class="text-[10px] text-stone-400 shrink-0">
                  {{ formatTime(conv.updatedAt || conv.createdAt) }}
                </span>
              </div>

              <p class="text-xs font-medium text-stone-800 truncate mb-1">
                {{ conv.subject }}
              </p>

              <p class="text-[11px] text-stone-500 truncate mb-2">
                {{ conv.lastMessage?.message || 'No messages yet' }}
              </p>

              <!-- Topic & Status Badges -->
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600 border border-stone-200">
                  {{ conv.topic }}
                </span>
                <span
                  :class="[
                    'rounded-md px-2 py-0.5 text-[10px] font-semibold border',
                    conv.status === 'OPEN'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : conv.status === 'IN_PROGRESS'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  ]"
                >
                  {{ conv.status.replace('_', ' ') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Pane: Active Chat Stream (7 Cols) -->
      <div class="lg:col-span-7 flex flex-col rounded-3xl border border-[var(--shopizz-obsidian)]/10 bg-white shadow-sm overflow-hidden h-[720px]">
        <!-- No Selection State -->
        <div v-if="!selectedConversation" class="m-auto p-12 text-center max-w-sm">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FAF8F5] text-2xl text-[#94442A] mb-4 border border-[var(--shopizz-obsidian)]/10">
            🌿
          </div>
          <h3 class="font-serif text-lg font-medium text-[var(--shopizz-obsidian)]">
            Select a Support Conversation
          </h3>
          <p class="text-xs text-stone-500 mt-2 leading-relaxed">
            Choose any customer inquiry from the left list to review ticket details, view full thread history, and reply directly.
          </p>
        </div>

        <template v-else>
          <!-- Chat Header -->
          <div class="p-4 border-b border-[var(--shopizz-obsidian)]/10 bg-[#FAF8F5] flex items-center justify-between gap-4">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <h3 class="font-serif text-base font-semibold text-[var(--shopizz-obsidian)] truncate">
                  {{ selectedConversation.subject }}
                </h3>
                <span class="rounded-md bg-stone-200/70 px-2 py-0.5 text-[10px] font-semibold text-stone-700">
                  {{ selectedConversation.topic }}
                </span>
              </div>
              <p class="text-xs text-stone-500 flex items-center gap-2">
                <span class="font-medium text-stone-700">{{ selectedConversation.user?.name }}</span>
                <span>•</span>
                <span>{{ selectedConversation.user?.email }}</span>
                <span>•</span>
                <span>Opened {{ formatDate(selectedConversation.createdAt) }}</span>
              </p>
            </div>

            <!-- Status Actions -->
            <div class="flex items-center gap-2 shrink-0">
              <button
                v-if="selectedConversation.status !== 'IN_PROGRESS' && selectedConversation.status !== 'RESOLVED'"
                type="button"
                :disabled="updatingStatus"
                class="rounded-xl border border-blue-300 bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                @click="updateStatus('IN_PROGRESS')"
              >
                Mark In Progress
              </button>

              <button
                v-if="selectedConversation.status !== 'RESOLVED'"
                type="button"
                :disabled="updatingStatus"
                class="rounded-xl bg-emerald-700 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer"
                @click="updateStatus('RESOLVED')"
              >
                ✓ Resolve Ticket
              </button>

              <button
                v-else
                type="button"
                :disabled="updatingStatus"
                class="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
                @click="updateStatus('OPEN')"
              >
                Reopen Ticket
              </button>
            </div>
          </div>

          <!-- Chat Messages Stream -->
          <div
            ref="chatContainerRef"
            class="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAF8F5]/40 scrollbar-thin"
          >
            <!-- Loading Messages -->
            <div v-if="loadingMessages && !messages.length" class="p-8 text-center">
              <div class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#94442A] border-t-transparent mb-2"></div>
              <p class="text-xs text-stone-500">Loading conversation history...</p>
            </div>

            <!-- Message Bubbles -->
            <div
              v-for="msg in messages"
              :key="msg.id"
              :class="[
                'flex flex-col max-w-[80%]',
                msg.senderRole === 'ADMIN' ? 'ml-auto items-end' : 'mr-auto items-start',
              ]"
            >
              <!-- Sender label -->
              <div class="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-stone-500">
                <span class="font-semibold" :class="msg.senderRole === 'ADMIN' ? 'text-[#94442A]' : 'text-stone-700'">
                  {{ msg.senderRole === 'ADMIN' ? 'Shopizz Support (You)' : (selectedConversation.user?.name || 'Buyer') }}
                </span>
                <span>•</span>
                <span>{{ formatTime(msg.createdAt) }}</span>
              </div>

              <!-- Message Bubble -->
              <div
                :class="[
                  'rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm',
                  msg.senderRole === 'ADMIN'
                    ? 'bg-[#94442A] text-white rounded-tr-none'
                    : 'bg-white text-stone-800 border border-[var(--shopizz-obsidian)]/10 rounded-tl-none',
                ]"
              >
                <p class="whitespace-pre-wrap">{{ msg.message }}</p>
              </div>
            </div>

            <div v-if="!loadingMessages && !messages.length" class="text-center py-10">
              <p class="text-xs text-stone-400">No messages in this inquiry yet.</p>
            </div>
          </div>

          <!-- Quick Canned Replies Bar -->
          <div class="p-3 border-t border-[var(--shopizz-obsidian)]/10 bg-[#FAF8F5]/60">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Quick Canned Replies:</p>
            <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                v-for="(reply, idx) in cannedReplies"
                :key="idx"
                type="button"
                class="rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] text-stone-600 hover:border-[#94442A] hover:text-[#94442A] transition-colors shrink-0 shadow-xs cursor-pointer"
                @click="applyCannedReply(reply)"
              >
                {{ reply }}
              </button>
            </div>
          </div>

          <!-- Reply Input Bar -->
          <div class="p-4 border-t border-[var(--shopizz-obsidian)]/10 bg-white">
            <div class="flex items-end gap-3">
              <textarea
                v-model="replyText"
                rows="2"
                placeholder="Type your response to the customer... (Press Enter to send, Shift+Enter for new line)"
                class="flex-1 rounded-2xl border border-[var(--shopizz-obsidian)]/15 bg-white p-3 text-xs text-[var(--shopizz-obsidian)] placeholder:text-stone-400 focus:border-[#94442A] focus:ring-1 focus:ring-[#94442A] outline-none resize-none transition-all"
                :disabled="sendingMessage"
                @keydown="handleKeydown"
              ></textarea>

              <button
                type="button"
                :disabled="!replyText.trim() || sendingMessage"
                class="rounded-2xl bg-[#94442A] px-5 py-3 text-xs font-semibold text-white shadow-sm hover:bg-[#7d3923] transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5 cursor-pointer"
                @click="sendMessage"
              >
                <span v-if="sendingMessage">Sending...</span>
                <template v-else>
                  <span>Reply</span>
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </template>
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
