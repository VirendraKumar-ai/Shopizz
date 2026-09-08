<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()

const isOpen = ref(false)
const activeTab = ref<'MAKERS' | 'ADMIN' | 'AI' | 'HISTORY'>('MAKERS')
const activeConversationId = ref<string | null>(null)
const activeConversation = ref<any>(null)
const messages = ref<any[]>([])

const conversations = ref<any[]>([])
const makers = ref<any[]>([])
const loadingMakers = ref(false)
const isSending = ref(false)
const isLoadingMessages = ref(false)
const replyText = ref('')
const newInquirySubject = ref('')
const newInquiryMessage = ref('')
const selectedMaker = ref<any>(null)
const showNewInquiryModal = ref(false)

const chatScrollContainer = ref<HTMLElement | null>(null)
let pollTimer: any = null

const unreadTotal = computed(() => {
  return conversations.value.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
})

// Scroll smoothly to bottom
const scrollToBottom = (smooth = true) => {
  nextTick(() => {
    if (chatScrollContainer.value) {
      chatScrollContainer.value.scrollTo({
        top: chatScrollContainer.value.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      })
    }
  })
}

// Fetch conversations
const fetchConversations = async () => {
  if (!authStore.loggedIn) return
  try {
    const res = await $fetch<{ success: boolean; conversations: any[] }>('/api/support/conversations')
    if (res?.success) {
      conversations.value = res.conversations
      if (activeConversationId.value) {
        const found = res.conversations.find((c) => c.id === activeConversationId.value)
        if (found) activeConversation.value = found
      }
    }
  } catch {
    // Non-blocking
  }
}

// Fetch approved makers
const fetchMakers = async () => {
  if (!authStore.loggedIn) return
  loadingMakers.value = true
  try {
    const res = await $fetch<{ success: boolean; makers: any[] }>('/api/support/makers')
    if (res?.success) {
      makers.value = res.makers
    }
  } catch {
    // Non-blocking
  } finally {
    loadingMakers.value = false
  }
}

// Fetch messages in active thread
const fetchMessages = async (id: string, scroll = false) => {
  if (!id || !authStore.loggedIn) return
  if (!messages.value.length) isLoadingMessages.value = true
  try {
    const res = await $fetch<{ success: boolean; conversation: any; messages: any[] }>(
      `/api/support/conversations/${id}/messages`
    )
    if (res?.success) {
      activeConversation.value = res.conversation
      messages.value = res.messages
      if (scroll) {
        scrollToBottom(false)
      }
    }
  } catch (err) {
    console.error('Error fetching messages:', err)
  } finally {
    isLoadingMessages.value = false
  }
}

// Open chat with conversation ID
const openConversation = async (convId: string) => {
  activeConversationId.value = convId
  await fetchMessages(convId, true)
}

// Start chat with Maker
const startChatWithMaker = (maker: any) => {
  if (!authStore.loggedIn) {
    router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
    isOpen.value = false
    return
  }

  // Check if existing conversation with this maker exists
  const existing = conversations.value.find(
    (c) => c.channelType === 'BUYER_TO_OWNER' && c.recipientId === maker.id
  )

  if (existing) {
    openConversation(existing.id)
    return
  }

  selectedMaker.value = maker
  newInquirySubject.value = `Inquiry for ${maker.shopName}`
  newInquiryMessage.value = ''
  showNewInquiryModal.value = true
}

// Start chat with Admin
const startChatWithAdmin = () => {
  if (!authStore.loggedIn) {
    router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
    isOpen.value = false
    return
  }

  // Check if existing conversation with admin exists
  const existing = conversations.value.find((c) => c.channelType === 'BUYER_TO_ADMIN')
  if (existing) {
    openConversation(existing.id)
    return
  }

  selectedMaker.value = null
  newInquirySubject.value = 'Shopizz Platform Support'
  newInquiryMessage.value = ''
  showNewInquiryModal.value = true
}

// Start chat with AI Assistant
const startChatWithAI = async () => {
  if (!authStore.loggedIn) {
    router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
    isOpen.value = false
    return
  }

  // Check if existing AI conversation exists
  const existing = conversations.value.find((c) => c.channelType === 'AI_ASSISTANT')
  if (existing) {
    openConversation(existing.id)
    return
  }

  // Auto-create initial AI thread
  isSending.value = true
  try {
    const res = await $fetch<{ success: boolean; conversation: any; message: any; botReply: any }>(
      '/api/support/conversations',
      {
        method: 'POST',
        body: {
          subject: '🤖 Shopizz AI Concierge',
          category: 'GENERAL',
          channelType: 'AI_ASSISTANT',
          message: 'Hello! I need assistance with my orders or shopping on Shopizz.',
        },
      }
    )

    if (res?.success) {
      await fetchConversations()
      await openConversation(res.conversation.id)
    }
  } catch (err) {
    console.error('Failed to start AI thread:', err)
  } finally {
    isSending.value = false
  }
}

// Submit new thread
const submitNewThread = async () => {
  if (!newInquirySubject.value.trim() || !newInquiryMessage.value.trim()) return

  isSending.value = true
  try {
    const channelType = selectedMaker.value ? 'BUYER_TO_OWNER' : 'BUYER_TO_ADMIN'
    const recipientId = selectedMaker.value ? selectedMaker.value.id : null

    const res = await $fetch<{ success: boolean; conversation: any; message: any }>(
      '/api/support/conversations',
      {
        method: 'POST',
        body: {
          subject: newInquirySubject.value.trim(),
          category: selectedMaker.value ? 'CUSTOM_INQUIRY' : 'GENERAL',
          channelType,
          recipientId,
          message: newInquiryMessage.value.trim(),
        },
      }
    )

    if (res?.success) {
      showNewInquiryModal.value = false
      newInquirySubject.value = ''
      newInquiryMessage.value = ''
      selectedMaker.value = null
      await fetchConversations()
      await openConversation(res.conversation.id)
    }
  } catch (err) {
    console.error('Failed to create thread:', err)
  } finally {
    isSending.value = false
  }
}

// Send message in current active conversation
const handleSendMessage = async () => {
  if (!replyText.value.trim() || !activeConversationId.value || isSending.value) return

  const textToSend = replyText.value.trim()
  replyText.value = ''
  isSending.value = true

  // Optimistic Message
  const tempMsg = {
    id: 'temp-' + Date.now(),
    conversationId: activeConversationId.value,
    senderId: authStore.user?.id,
    senderRole: authStore.user?.role || 'BUYER',
    senderName: authStore.user?.name || 'You',
    message: textToSend,
    isRead: false,
    createdAt: new Date().toISOString(),
  }
  messages.value.push(tempMsg)
  scrollToBottom(true)

  try {
    const res = await $fetch<{ success: boolean; message: any; botReply: any }>(
      `/api/support/conversations/${activeConversationId.value}/messages`,
      {
        method: 'POST',
        body: { message: textToSend },
      }
    )

    if (res?.success) {
      // Replace optimistic message
      const idx = messages.value.findIndex((m) => m.id === tempMsg.id)
      if (idx !== -1 && res.message) {
        messages.value[idx] = res.message
      }
      if (res.botReply) {
        messages.value.push(res.botReply)
      }
      scrollToBottom(true)
      fetchConversations()
    }
  } catch (err) {
    console.error('Failed to send reply:', err)
    messages.value = messages.value.filter((m) => m.id !== tempMsg.id)
    replyText.value = textToSend
  } finally {
    isSending.value = false
  }
}

// Toggle Widget
const toggleWidget = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    fetchConversations()
    fetchMakers()
    if (activeConversationId.value) {
      fetchMessages(activeConversationId.value, true)
    }
  }
}

// Back to channels
const goBack = () => {
  activeConversationId.value = null
  activeConversation.value = null
  messages.value = []
  showNewInquiryModal.value = false
  fetchConversations()
}

// Formatter for time
const formatTime = (iso: string) => {
  if (!iso) return ''
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso)).toLowerCase()
}

onMounted(() => {
  fetchConversations()
  fetchMakers()
  pollTimer = setInterval(() => {
    if (isOpen.value) {
      if (activeConversationId.value) {
        fetchMessages(activeConversationId.value, false)
      } else {
        fetchConversations()
      }
    }
  }, 4000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <div>
    <!-- Floating Trigger Button in Shopizz Terracotta -->
    <div class="fixed bottom-6 right-6 z-40">
      <button
        type="button"
        class="group relative flex items-center gap-2.5 rounded-full bg-[#94442A] hover:bg-[#7E3821] py-3.5 px-5 text-xs font-semibold text-white shadow-xl ring-4 ring-[#FAF8F5] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Shopizz Concierge & Artisan Chat"
        @click="toggleWidget"
      >
        <div class="relative flex h-5 w-5 items-center justify-center">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40" />
          <svg class="h-4 w-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.06c-1.52 0-3-.4-4.3-1.17l-.31-.18-3.19.84.85-3.11-.2-.32a8.107 8.107 0 01-1.25-4.31c0-4.48 3.65-8.12 8.13-8.12 2.17 0 4.21.85 5.74 2.38 1.54 1.54 2.39 3.58 2.39 5.76 0 4.48-3.65 8.12-8.14 8.12z" />
          </svg>
        </div>

        <span class="hidden sm:inline font-medium tracking-wide">Artisan Concierge</span>

        <!-- Unread Counter -->
        <span
          v-if="unreadTotal > 0"
          class="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-bold text-[#94442A] shadow-xs"
        >
          {{ unreadTotal }}
        </span>
      </button>
    </div>

    <!-- Shopizz Theme Chat Modal Container -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-6 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-6 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed bottom-22 right-4 sm:right-6 z-50 flex h-[620px] max-h-[85vh] w-[calc(100vw-32px)] sm:w-[420px] flex-col overflow-hidden rounded-3xl border border-[#E8E2D8] bg-[#FAF8F5] shadow-2xl font-sans"
      >
        <!-- Shopizz Terracotta Editorial Header -->
        <div class="relative flex items-center justify-between bg-[#94442A] px-4 py-3.5 text-white shadow-md select-none shrink-0 border-b border-white/15">
          <div class="flex items-center gap-3 min-w-0">
            <!-- Back Arrow -->
            <button
              v-if="activeConversationId || showNewInquiryModal"
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/20 transition-colors cursor-pointer shrink-0 text-white"
              @click="goBack"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <!-- Recipient Avatar -->
            <div class="relative h-10 w-10 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-base overflow-hidden shrink-0 text-white">
              <template v-if="activeConversation">
                <span v-if="activeConversation.channelType === 'AI_ASSISTANT'">🤖</span>
                <span v-else-if="activeConversation.channelType === 'BUYER_TO_OWNER'">🏪</span>
                <span v-else>🌿</span>
              </template>
              <template v-else>
                <span>🌿</span>
              </template>
            </div>

            <!-- Title & Status -->
            <div class="min-w-0 flex-1">
              <h3 class="text-sm font-semibold truncate leading-tight font-serif text-white">
                {{
                  activeConversation
                    ? (activeConversation.channelType === 'AI_ASSISTANT'
                        ? 'Shopizz AI Concierge'
                        : activeConversation.recipient?.name || activeConversation.subject)
                    : 'Shopizz Artisan Concierge'
                }}
              </h3>
              <p class="text-[11px] text-[#FAF0EB]/90 truncate flex items-center gap-1.5 mt-0.5">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block border border-white/40" />
                <span>{{ activeConversation ? 'Live Concierge' : 'Connect with makers & support' }}</span>
              </p>
            </div>
          </div>

          <!-- Close button -->
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/20 transition-colors cursor-pointer text-white/90 hover:text-white font-medium"
            @click="isOpen = false"
          >
            ✕
          </button>
        </div>

        <!-- VIEW 1: ACTIVE CHAT STREAM -->
        <div v-if="activeConversationId" class="flex-1 flex flex-col justify-between overflow-hidden bg-[#FAF8F5]">
          <!-- Linen Chat Wallpaper Message Container -->
          <div
            ref="chatScrollContainer"
            class="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin bg-[#FAF8F5]"
            style="background-image: radial-gradient(#e8e2d8 1px, transparent 1px); background-size: 18px 18px;"
          >
            <!-- Date Separator -->
            <div class="flex justify-center my-1">
              <span class="rounded-full bg-white/90 border border-[#E8E2D8] px-3.5 py-1 text-[10px] font-medium text-[#5A544A] shadow-2xs tracking-wider">
                {{ activeConversation?.channelType === 'AI_ASSISTANT' ? '🤖 AI Assistant' : 'Artisan Concierge Thread' }}
              </span>
            </div>

            <!-- Messages List -->
            <div
              v-for="msg in messages"
              :key="msg.id"
              :class="[
                'flex flex-col',
                msg.senderRole === 'BUYER' ? 'items-end' : 'items-start',
              ]"
            >
              <!-- Message Bubble in Shopizz Theme -->
              <div
                :class="[
                  'relative max-w-[82%] px-3.5 py-2.5 shadow-xs text-xs leading-relaxed transition-all',
                  msg.senderRole === 'BUYER'
                    ? 'bg-[#FAF0EB] text-[#1F2623] border border-[#F0DDD1] rounded-2xl rounded-tr-none'
                    : 'bg-white text-[#1F2623] rounded-2xl rounded-tl-none border border-[#E8E2D8]',
                ]"
              >
                <!-- Sender label for incoming messages -->
                <p
                  v-if="msg.senderRole !== 'BUYER'"
                  class="text-[10px] font-bold text-[#94442A] mb-1 flex items-center gap-1"
                >
                  <span v-if="msg.senderRole === 'SYSTEM'">🤖</span>
                  <span>{{ msg.senderName || 'Shopizz Concierge' }}</span>
                </p>

                <!-- Message Content with proper markdown lines -->
                <p class="whitespace-pre-wrap select-text pr-12 text-[#1F2623]">{{ msg.message }}</p>

                <!-- Micro Timestamp & Double Checkmarks (bottom right) -->
                <div class="absolute bottom-1 right-2 flex items-center gap-1 text-[9px] text-[#8C827A] select-none">
                  <span>{{ formatTime(msg.createdAt) }}</span>
                  <span
                    v-if="msg.senderRole === 'BUYER'"
                    class="text-[11px] leading-none"
                    :class="msg.isRead ? 'text-[#94442A] font-bold' : 'text-[#8C827A]'"
                  >
                    ✓✓
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Input Bar in Shopizz Theme -->
          <div class="bg-[#F8F5EE] p-2.5 flex items-center gap-2 border-t border-[#E8E2D8] shrink-0">
            <input
              v-model="replyText"
              type="text"
              placeholder="Type your message..."
              class="flex-1 rounded-full bg-white px-4 py-2.5 text-xs text-[#1F2623] placeholder:text-[#8C827A] border border-[#E8E2D8] focus:outline-none focus:border-[#94442A] focus:ring-1 focus:ring-[#94442A] shadow-2xs"
              :disabled="isSending"
              @keydown.enter="handleSendMessage"
            />

            <!-- Send Button -->
            <button
              type="button"
              :disabled="!replyText.trim() || isSending"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-[#94442A] hover:bg-[#7E3821] text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm shrink-0"
              @click="handleSendMessage"
            >
              <svg class="h-4 w-4 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- VIEW 2: NEW INQUIRY POPUP FORM -->
        <div v-else-if="showNewInquiryModal" class="flex-1 flex flex-col justify-between p-5 bg-white overflow-y-auto">
          <form class="space-y-4" @submit.prevent="submitNewThread">
            <div class="rounded-2xl bg-[#FAF0EB] p-4 border border-[#F0DDD1]">
              <p class="text-xs font-bold text-[#94442A]">
                {{ selectedMaker ? `Contact ${selectedMaker.shopName}` : 'Contact Shopizz Platform Helpdesk' }}
              </p>
              <p class="text-[11px] text-[#5A544A] mt-0.5 leading-relaxed">
                {{ selectedMaker ? `Send a direct message to ${selectedMaker.name} regarding custom sizing, craft inquiries, or availability.` : 'Our administrative desk assists with billing, returns, and platform questions.' }}
              </p>
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-[#5A544A] mb-1">
                Subject
              </label>
              <input
                v-model="newInquirySubject"
                type="text"
                class="w-full rounded-xl border border-[#D5CEC4] p-2.5 text-xs text-[#1F2623] focus:border-[#94442A] focus:outline-none"
                required
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-[#5A544A] mb-1">
                Your Message
              </label>
              <textarea
                v-model="newInquiryMessage"
                rows="4"
                placeholder="Type your question or request..."
                class="w-full rounded-xl border border-[#D5CEC4] p-2.5 text-xs text-[#1F2623] focus:border-[#94442A] focus:outline-none resize-none"
                required
              />
            </div>

            <div class="flex gap-2">
              <button
                type="button"
                class="flex-1 rounded-xl border border-[#D5CEC4] py-2.5 text-xs font-semibold text-[#5A544A] hover:bg-[#FAF8F5] cursor-pointer"
                @click="showNewInquiryModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSending"
                class="flex-1 rounded-xl bg-[#94442A] py-2.5 text-xs font-semibold text-white hover:bg-[#7E3821] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {{ isSending ? 'Sending...' : 'Start Chat →' }}
              </button>
            </div>
          </form>
        </div>

        <!-- VIEW 3: CHANNEL TABS (Makers, Admin, AI, History) -->
        <div v-else class="flex-1 flex flex-col bg-white overflow-hidden">
          <!-- Navigation Bar Tabs in Terracotta Theme -->
          <div class="flex border-b border-[#7E3821]/30 bg-[#7E3821] text-white shrink-0">
            <button
              type="button"
              :class="[
                'flex-1 py-2.5 text-xs font-semibold tracking-wide transition-all border-b-2 cursor-pointer',
                activeTab === 'MAKERS' ? 'border-white text-white bg-black/10' : 'border-transparent text-[#FAF0EB]/75 hover:text-white hover:bg-black/5',
              ]"
              @click="activeTab = 'MAKERS'"
            >
              🏪 Makers
            </button>
            <button
              type="button"
              :class="[
                'flex-1 py-2.5 text-xs font-semibold tracking-wide transition-all border-b-2 cursor-pointer',
                activeTab === 'ADMIN' ? 'border-white text-white bg-black/10' : 'border-transparent text-[#FAF0EB]/75 hover:text-white hover:bg-black/5',
              ]"
              @click="activeTab = 'ADMIN'"
            >
              🎧 Helpdesk
            </button>
            <button
              type="button"
              :class="[
                'flex-1 py-2.5 text-xs font-semibold tracking-wide transition-all border-b-2 cursor-pointer',
                activeTab === 'AI' ? 'border-white text-white bg-black/10' : 'border-transparent text-[#FAF0EB]/75 hover:text-white hover:bg-black/5',
              ]"
              @click="activeTab = 'AI'"
            >
              🤖 AI Bot
            </button>
            <button
              type="button"
              :class="[
                'flex-1 py-2.5 text-xs font-semibold tracking-wide transition-all border-b-2 cursor-pointer relative',
                activeTab === 'HISTORY' ? 'border-white text-white bg-black/10' : 'border-transparent text-[#FAF0EB]/75 hover:text-white hover:bg-black/5',
              ]"
              @click="activeTab = 'HISTORY'"
            >
              💬 Chats
              <span
                v-if="conversations.length > 0"
                class="ml-1 rounded-full bg-white px-1.5 py-0.2 text-[9px] text-[#94442A] font-bold"
              >
                {{ conversations.length }}
              </span>
            </button>
          </div>

          <!-- TAB CONTENT -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5]/60">
            <!-- TAB 1: ARTISAN MAKERS LIST -->
            <div v-if="activeTab === 'MAKERS'" class="space-y-2.5">
              <p class="text-[11px] font-semibold text-[#8C827A] uppercase tracking-wider px-1">
                Chat Directly with Shop Owners:
              </p>

              <div v-if="loadingMakers" class="py-12 text-center text-xs text-[#8C827A]">
                Loading artisan studios...
              </div>

              <div
                v-for="maker in makers"
                :key="maker.id"
                class="flex items-center justify-between rounded-2xl border border-[#E8E2D8] bg-white p-3 shadow-2xs hover:border-[#94442A] hover:bg-[#FAF0EB]/30 transition-all cursor-pointer group"
                @click="startChatWithMaker(maker)"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="h-11 w-11 rounded-full bg-[#FAF0EB] border border-[#F0DDD1] flex items-center justify-center font-bold text-sm text-[#94442A] overflow-hidden shrink-0">
                    <img v-if="maker.shopLogo" :src="maker.shopLogo" :alt="maker.shopName" class="h-full w-full object-cover" />
                    <span v-else>{{ maker.shopName ? maker.shopName.charAt(0) : 'S' }}</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-[#1F2623] group-hover:text-[#94442A] transition-colors truncate">
                      {{ maker.shopName }}
                    </p>
                    <p class="text-[11px] text-[#8C827A] truncate">
                      {{ maker.name }} &bull; Artisan Maker
                    </p>
                  </div>
                </div>

                <span class="rounded-full bg-[#FAF0EB] px-3 py-1 text-[10px] font-bold text-[#94442A] group-hover:bg-[#94442A] group-hover:text-white transition-all shrink-0">
                  Chat →
                </span>
              </div>

              <div v-if="!loadingMakers && !makers.length" class="text-center py-10 text-xs text-[#8C827A]">
                No active maker studios found.
              </div>
            </div>

            <!-- TAB 2: ADMIN HELPDESK -->
            <div v-else-if="activeTab === 'ADMIN'" class="space-y-4">
              <div class="rounded-2xl bg-white border border-[#E8E2D8] p-5 text-center shadow-xs space-y-3">
                <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF0EB] text-2xl text-[#94442A]">
                  🎧
                </div>
                <div>
                  <h4 class="text-sm font-bold text-[#1F2623] font-serif">Shopizz Support Helpdesk</h4>
                  <p class="text-xs text-[#5A544A] mt-1 leading-relaxed">
                    Have an issue with your order, returns, or payment? Connect with our staff support team.
                  </p>
                </div>
                <button
                  type="button"
                  class="w-full rounded-xl bg-[#94442A] py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#7E3821] transition-all cursor-pointer"
                  @click="startChatWithAdmin"
                >
                  Start Support Chat →
                </button>
              </div>
            </div>

            <!-- TAB 3: DEDICATED AI CONCIERGE -->
            <div v-else-if="activeTab === 'AI'" class="space-y-4">
              <div class="rounded-2xl bg-white border border-[#E8E2D8] p-5 text-center shadow-xs space-y-3">
                <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF0EB] text-2xl text-[#94442A]">
                  🤖
                </div>
                <div>
                  <h4 class="text-sm font-bold text-[#1F2623] font-serif">Dedicated AI Concierge</h4>
                  <p class="text-xs text-[#5A544A] mt-1 leading-relaxed">
                    Get instantaneous 24/7 automated order status lookups, return policy guidelines, and studio craft details.
                  </p>
                </div>
                <button
                  type="button"
                  class="w-full rounded-xl bg-[#94442A] py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#7E3821] transition-all cursor-pointer"
                  @click="startChatWithAI"
                >
                  Chat with AI Assistant →
                </button>
              </div>
            </div>

            <!-- TAB 4: PREVIOUS CONVERSATIONS (Chat List) -->
            <div v-else-if="activeTab === 'HISTORY'" class="space-y-2">
              <div v-if="!conversations.length" class="text-center py-12 text-xs text-[#8C827A]">
                No active chat conversations yet.
              </div>

              <div
                v-for="conv in conversations"
                :key="conv.id"
                class="flex items-center justify-between rounded-2xl border border-[#E8E2D8] bg-white p-3 shadow-2xs hover:border-[#94442A] transition-all cursor-pointer group"
                @click="openConversation(conv.id)"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="h-11 w-11 rounded-full bg-[#FAF0EB] border border-[#F0DDD1] flex items-center justify-center text-sm font-bold text-[#94442A] shrink-0">
                    <span v-if="conv.channelType === 'AI_ASSISTANT'">🤖</span>
                    <span v-else-if="conv.channelType === 'BUYER_TO_OWNER'">🏪</span>
                    <span v-else>🌿</span>
                  </div>

                  <div class="min-w-0">
                    <div class="flex items-center justify-between gap-1 mb-0.5">
                      <p class="text-xs font-bold text-[#1F2623] group-hover:text-[#94442A] transition-colors truncate">
                        {{ conv.channelType === 'AI_ASSISTANT' ? 'Shopizz AI Concierge' : conv.recipient?.name || conv.subject }}
                      </p>
                    </div>
                    <p class="text-[11px] text-[#5A544A] truncate">
                      {{ conv.lastMessage?.message || conv.subject }}
                    </p>
                  </div>
                </div>

                <div class="flex flex-col items-end gap-1 shrink-0 ml-2">
                  <span class="text-[9px] text-[#8C827A]">
                    {{ formatTime(conv.lastMessageAt || conv.createdAt) }}
                  </span>
                  <span
                    v-if="conv.unreadCount > 0"
                    class="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#94442A] px-1 text-[9px] font-bold text-white"
                  >
                    {{ conv.unreadCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
