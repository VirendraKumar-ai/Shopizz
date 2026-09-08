<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'owner'],
})

const authStore = useAuthStore()

const conversations = ref<any[]>([])
const selectedConversation = ref<any>(null)
const messages = ref<any[]>([])
const loadingConversations = ref(true)
const loadingMessages = ref(false)
const sendingMessage = ref(false)
const replyText = ref('')
const searchQuery = ref('')
const selectedChannelFilter = ref<'ALL' | 'BUYER' | 'ADMIN'>('ALL')
const chatScrollRef = ref<HTMLElement | null>(null)

let pollTimer: any = null

const cannedReplies = [
  'Hello! Thank you for reaching out to our studio.',
  'We are currently preparing your handcrafted piece for dispatch.',
  'Yes, custom sizing and custom engraving are available!',
  'Your order has been packaged and handed over to the courier partner.',
  'Please let us know if you have any questions regarding materials or dimensions.',
]

const filteredConversations = computed(() => {
  return conversations.value.filter((conv) => {
    if (selectedChannelFilter.value === 'BUYER' && conv.channelType !== 'BUYER_TO_OWNER') {
      return false
    }
    if (selectedChannelFilter.value === 'ADMIN' && conv.channelType !== 'OWNER_TO_ADMIN') {
      return false
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const subjectMatch = conv.subject?.toLowerCase().includes(q)
      const nameMatch = conv.user?.name?.toLowerCase().includes(q)
      const msgMatch = conv.lastMessage?.message?.toLowerCase().includes(q)
      return subjectMatch || nameMatch || msgMatch
    }
    return true
  })
})

const scrollToBottom = () => {
  nextTick(() => {
    if (chatScrollRef.value) {
      chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight
    }
  })
}

// Fetch all conversations for this Owner
const fetchConversations = async (silent = false) => {
  if (!silent) loadingConversations.value = true
  try {
    const res = await $fetch<{ success: boolean; conversations: any[] }>('/api/support/conversations')
    if (res.success && res.conversations) {
      conversations.value = res.conversations
      if (selectedConversation.value) {
        const found = res.conversations.find((c) => c.id === selectedConversation.value.id)
        if (found) selectedConversation.value = found
      }
    }
  } catch (err) {
    console.error('Failed to fetch owner conversations:', err)
  } finally {
    if (!silent) loadingConversations.value = false
  }
}

// Fetch messages for selected thread
const fetchMessages = async (id: string, silent = false) => {
  if (!silent) loadingMessages.value = true
  try {
    const res = await $fetch<{ success: boolean; conversation: any; messages: any[] }>(
      `/api/support/conversations/${id}/messages`
    )
    if (res.success) {
      messages.value = res.messages
      if (res.conversation) selectedConversation.value = res.conversation
      scrollToBottom()
    }
  } catch (err) {
    console.error('Failed to fetch messages:', err)
  } finally {
    if (!silent) loadingMessages.value = false
  }
}

// Select a conversation
const selectConversation = async (conv: any) => {
  selectedConversation.value = conv
  conv.unreadCount = 0
  await fetchMessages(conv.id)
}

// Start conversation with Admin
const startChatWithAdmin = async () => {
  const existing = conversations.value.find((c) => c.channelType === 'OWNER_TO_ADMIN')
  if (existing) {
    selectConversation(existing)
    return
  }

  try {
    const res = await $fetch<{ success: boolean; conversation: any; message: any }>(
      '/api/support/conversations',
      {
        method: 'POST',
        body: {
          subject: 'Artisan Owner Support Request',
          category: 'GENERAL',
          channelType: 'OWNER_TO_ADMIN',
          message: 'Hello Admin desk, I need assistance regarding my shop settings and payouts.',
        },
      }
    )
    if (res.success) {
      await fetchConversations()
      selectConversation(res.conversation)
    }
  } catch (err) {
    console.error('Failed to start chat with admin:', err)
  }
}

// Send message
const sendMessage = async () => {
  if (!replyText.value.trim() || !selectedConversation.value || sendingMessage.value) return

  const textToSend = replyText.value.trim()
  replyText.value = ''
  sendingMessage.value = true

  const tempMsg = {
    id: 'temp-' + Date.now(),
    conversationId: selectedConversation.value.id,
    senderId: authStore.user?.id,
    senderRole: 'OWNER',
    senderName: authStore.user?.name || 'Artisan Owner',
    message: textToSend,
    isRead: false,
    createdAt: new Date().toISOString(),
  }
  messages.value.push(tempMsg)
  scrollToBottom()

  try {
    const res = await $fetch<{ success: boolean; message: any }>(
      `/api/support/conversations/${selectedConversation.value.id}/messages`,
      {
        method: 'POST',
        body: { message: textToSend },
      }
    )

    if (res.success && res.message) {
      const idx = messages.value.findIndex((m) => m.id === tempMsg.id)
      if (idx !== -1) {
        messages.value[idx] = res.message
      }
    }
    fetchConversations(true)
  } catch (err) {
    console.error('Failed to send message:', err)
    messages.value = messages.value.filter((m) => m.id !== tempMsg.id)
    replyText.value = textToSend
  } finally {
    sendingMessage.value = false
  }
}

const formatTime = (iso: string) => {
  if (!iso) return ''
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso)).toLowerCase()
}

onMounted(async () => {
  await fetchConversations()
  if (conversations.value.length > 0 && !selectedConversation.value) {
    selectConversation(conversations.value[0])
  }

  pollTimer = setInterval(() => {
    fetchConversations(true)
    if (selectedConversation.value) {
      fetchMessages(selectedConversation.value.id, true)
    }
  }, 4000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <div class="space-y-6 font-sans">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-[#94442A]">
          Studio Communications / Customer Desk
        </p>
        <h1 class="font-serif text-3xl font-bold text-[#1F2623] mt-1">
          Artisan Messages & Inquiries
        </h1>
        <p class="text-xs text-[#5A544A] mt-1">
          Chat directly with buyers about your handcrafted pieces, custom orders, and contact Admin support.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-xl bg-[#94442A] hover:bg-[#7E3821] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer shrink-0"
        @click="startChatWithAdmin"
      >
        <span>🎧</span>
        <span>Contact Admin Desk</span>
      </button>
    </div>

    <!-- Editorial Two-Pane Box -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[680px]">
      <!-- Left List Pane (5 cols) -->
      <div class="lg:col-span-5 flex flex-col rounded-3xl border border-[#E8E2D8] bg-white shadow-sm overflow-hidden h-[700px]">
        <!-- Search & Filter Bar -->
        <div class="p-4 border-b border-[#E8E2D8] bg-[#FAF8F5] space-y-3">
          <div class="relative">
            <svg class="absolute left-3.5 top-3 h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search chats by buyer, item, or keyword..."
              class="w-full rounded-2xl border border-[#E8E2D8] bg-white pl-10 pr-4 py-2 text-xs text-[#1F2623] placeholder:text-[#8C827A] focus:outline-none focus:border-[#94442A] focus:ring-1 focus:ring-[#94442A]"
            />
          </div>

          <!-- Channel Filter Tabs -->
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              :class="[
                'rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all cursor-pointer shrink-0',
                selectedChannelFilter === 'ALL'
                  ? 'bg-[#94442A] text-white shadow-xs'
                  : 'bg-white text-[#5A544A] hover:bg-[#FAF8F5] border border-[#E8E2D8]',
              ]"
              @click="selectedChannelFilter = 'ALL'"
            >
              All ({{ conversations.length }})
            </button>
            <button
              type="button"
              :class="[
                'rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all cursor-pointer shrink-0',
                selectedChannelFilter === 'BUYER'
                  ? 'bg-[#94442A] text-white shadow-xs'
                  : 'bg-white text-[#5A544A] hover:bg-[#FAF8F5] border border-[#E8E2D8]',
              ]"
              @click="selectedChannelFilter = 'BUYER'"
            >
              Customer Chats
            </button>
            <button
              type="button"
              :class="[
                'rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all cursor-pointer shrink-0',
                selectedChannelFilter === 'ADMIN'
                  ? 'bg-[#94442A] text-white shadow-xs'
                  : 'bg-white text-[#5A544A] hover:bg-[#FAF8F5] border border-[#E8E2D8]',
              ]"
              @click="selectedChannelFilter = 'ADMIN'"
            >
              Admin Desk
            </button>
          </div>
        </div>

        <!-- Scrollable Conversation List -->
        <div class="flex-1 overflow-y-auto divide-y divide-[#E8E2D8]/60 scrollbar-thin">
          <div v-if="loadingConversations && !conversations.length" class="p-8 text-center text-xs text-[#8C827A]">
            Loading conversations...
          </div>

          <div v-else-if="!filteredConversations.length" class="p-12 text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF0EB] text-[#94442A] mb-3 text-lg">
              💬
            </div>
            <p class="text-sm font-semibold text-[#1F2623]">No conversations</p>
            <p class="text-xs text-[#5A544A] mt-1">Incoming buyer inquiries will appear here.</p>
          </div>

          <div
            v-for="conv in filteredConversations"
            v-else
            :key="conv.id"
            :class="[
              'p-4 transition-all cursor-pointer flex items-center justify-between gap-3',
              selectedConversation?.id === conv.id
                ? 'bg-[#FAF0EB] border-l-4 border-l-[#94442A]'
                : 'hover:bg-[#FAF8F5]',
            ]"
            @click="selectConversation(conv)"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="h-11 w-11 rounded-full bg-[#FAF0EB] border border-[#F0DDD1] flex items-center justify-center font-bold text-sm text-[#94442A] overflow-hidden shrink-0">
                <span v-if="conv.channelType === 'OWNER_TO_ADMIN'">🎧</span>
                <span v-else>{{ conv.user?.name ? conv.user.name.charAt(0) : 'U' }}</span>
              </div>

              <div class="min-w-0">
                <p class="text-xs font-bold text-[#1F2623] truncate">
                  {{ conv.channelType === 'OWNER_TO_ADMIN' ? 'Shopizz Platform Admin' : conv.user?.name }}
                </p>
                <p class="text-[11px] text-[#5A544A] truncate mt-0.5">
                  {{ conv.lastMessage?.message || conv.subject }}
                </p>
                <div class="flex items-center gap-1.5 mt-1">
                  <span class="rounded-md bg-stone-100 px-1.5 py-0.5 text-[9px] font-semibold text-[#5A544A] border border-[#E8E2D8]">
                    {{ conv.subject }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-col items-end gap-1 shrink-0">
              <span class="text-[10px] text-[#8C827A]">
                {{ formatTime(conv.lastMessageAt || conv.createdAt) }}
              </span>
              <span
                v-if="conv.unreadCount > 0"
                class="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#94442A] px-1 text-[10px] font-bold text-white shadow-xs"
              >
                {{ conv.unreadCount }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Chat Stream Pane (7 cols) -->
      <div class="lg:col-span-7 flex flex-col rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] shadow-sm overflow-hidden h-[700px]">
        <div v-if="!selectedConversation" class="m-auto p-12 text-center max-w-sm">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl text-[#94442A] mb-4 shadow-sm border border-[#E8E2D8]">
            💬
          </div>
          <h3 class="font-serif text-lg font-bold text-[#1F2623]">
            Select a Conversation
          </h3>
          <p class="text-xs text-[#5A544A] mt-2 leading-relaxed">
            Choose a customer or admin thread from the left to view message history and send replies.
          </p>
        </div>

        <template v-else>
          <!-- Header in Terracotta Theme -->
          <div class="bg-[#94442A] px-5 py-3.5 text-white flex items-center justify-between gap-4 shrink-0 shadow-md border-b border-white/15">
            <div class="flex items-center gap-3 min-w-0">
              <div class="h-10 w-10 rounded-full bg-white/15 border border-white/30 flex items-center justify-center font-bold text-sm text-white shrink-0">
                <span v-if="selectedConversation.channelType === 'OWNER_TO_ADMIN'">🎧</span>
                <span v-else>{{ selectedConversation.user?.name?.charAt(0) || 'U' }}</span>
              </div>
              <div class="min-w-0">
                <h3 class="text-sm font-bold truncate font-serif text-white">
                  {{ selectedConversation.channelType === 'OWNER_TO_ADMIN' ? 'Shopizz Platform Admin' : selectedConversation.user?.name }}
                </h3>
                <p class="text-[11px] text-[#FAF0EB]/90 truncate">
                  {{ selectedConversation.user?.email }} &bull; {{ selectedConversation.subject }}
                </p>
              </div>
            </div>

            <span class="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold text-white">
              {{ selectedConversation.status }}
            </span>
          </div>

          <!-- Messages Area -->
          <div
            ref="chatScrollRef"
            class="flex-1 overflow-y-auto p-5 space-y-3.5 scrollbar-thin bg-[#FAF8F5]"
            style="background-image: radial-gradient(#e8e2d8 1px, transparent 1px); background-size: 18px 18px;"
          >
            <div
              v-for="msg in messages"
              :key="msg.id"
              :class="[
                'flex flex-col',
                msg.senderRole === 'OWNER' ? 'items-end' : 'items-start',
              ]"
            >
              <div
                :class="[
                  'relative max-w-[80%] px-3.5 py-2.5 shadow-xs text-xs leading-relaxed',
                  msg.senderRole === 'OWNER'
                    ? 'bg-[#FAF0EB] text-[#1F2623] rounded-2xl rounded-tr-none border border-[#F0DDD1]'
                    : 'bg-white text-[#1F2623] rounded-2xl rounded-tl-none border border-[#E8E2D8]',
                ]"
              >
                <p
                  v-if="msg.senderRole !== 'OWNER'"
                  class="text-[10px] font-bold text-[#94442A] mb-1"
                >
                  {{ msg.senderName }}
                </p>
                <p class="whitespace-pre-wrap select-text pr-12">{{ msg.message }}</p>

                <div class="absolute bottom-1 right-2 flex items-center gap-1 text-[9px] text-[#8C827A] select-none">
                  <span>{{ formatTime(msg.createdAt) }}</span>
                  <span
                    v-if="msg.senderRole === 'OWNER'"
                    class="text-[11px] leading-none"
                    :class="msg.isRead ? 'text-[#94442A] font-bold' : 'text-[#8C827A]'"
                  >
                    ✓✓
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Canned Replies Bar -->
          <div class="p-2.5 bg-[#F8F5EE] border-t border-[#E8E2D8] flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
            <button
              v-for="(reply, idx) in cannedReplies"
              :key="idx"
              type="button"
              class="rounded-full bg-white border border-[#E8E2D8] px-3 py-1 text-[11px] text-[#5A544A] hover:border-[#94442A] hover:text-[#94442A] transition-colors shrink-0 shadow-2xs cursor-pointer"
              @click="replyText = reply"
            >
              {{ reply }}
            </button>
          </div>

          <!-- Bottom Input Bar -->
          <div class="bg-[#F8F5EE] p-3 flex items-center gap-2.5 border-t border-[#E8E2D8] shrink-0">
            <input
              v-model="replyText"
              type="text"
              placeholder="Type your reply to customer..."
              class="flex-1 rounded-full bg-white px-4 py-2.5 text-xs text-[#1F2623] placeholder:text-[#8C827A] border border-[#E8E2D8] focus:outline-none focus:border-[#94442A] focus:ring-1 focus:ring-[#94442A] shadow-2xs"
              :disabled="sendingMessage"
              @keydown.enter="sendMessage"
            />

            <button
              type="button"
              :disabled="!replyText.trim() || sendingMessage"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-[#94442A] hover:bg-[#7E3821] text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm shrink-0"
              @click="sendMessage"
            >
              <svg class="h-4 w-4 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
