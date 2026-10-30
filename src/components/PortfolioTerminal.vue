<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  resolveTerminalCommand,
  type TerminalCommandResult,
} from '../utils/terminalCommands'

interface TerminalEntry extends TerminalCommandResult {
  id: number
  command: string
}

const router = useRouter()
const isOpen = ref(false)
const input = ref('')
const inputElement = ref<HTMLInputElement | null>(null)
const terminalBody = ref<HTMLDivElement | null>(null)
const toggleButton = ref<HTMLButtonElement | null>(null)
const entries = ref<TerminalEntry[]>([])
const history: string[] = []
let historyPosition = 0
let nextEntryId = 0

const toggleTerminal = async () => {
  isOpen.value = !isOpen.value

  if (isOpen.value) {
    await nextTick()
    inputElement.value?.focus()
  }
}

const closeTerminal = () => {
  isOpen.value = false
  toggleButton.value?.focus()
}

const scrollToLatest = async () => {
  await nextTick()
  if (terminalBody.value) {
    terminalBody.value.scrollTop = terminalBody.value.scrollHeight
  }
}

const executeCommand = async () => {
  const command = input.value.trim()
  if (!command) return

  input.value = ''
  history.push(command)
  historyPosition = history.length

  if (command.toLowerCase() === 'clear') {
    entries.value = []
    return
  }

  const response = resolveTerminalCommand(command)
  const entry: TerminalEntry = {
    id: nextEntryId++,
    command,
    ...response,
  }
  entries.value.push(entry)

  if (response.action === 'open-cv') await router.push('/cv')

  await scrollToLatest()
}

const navigateHistory = (direction: -1 | 1) => {
  historyPosition = Math.max(
    0,
    Math.min(history.length, historyPosition + direction),
  )
  input.value = history[historyPosition] ?? ''
}
</script>

<template>
  <div class="portfolio-terminal">
    <button
      ref="toggleButton"
      class="terminal-toggle"
      type="button"
      :aria-expanded="isOpen"
      aria-label="Toggle portfolio terminal"
      title="Toggle terminal"
      @click="toggleTerminal"
    >
      <span aria-hidden="true">&gt;_</span>
    </button>

    <Transition name="terminal-window">
      <section
        v-if="isOpen"
        class="terminal-window"
        role="dialog"
        aria-labelledby="terminal-title"
        aria-modal="false"
        @keydown.esc="closeTerminal"
      >
        <header class="terminal-titlebar">
          <div class="terminal-lights" aria-hidden="true">
            <i></i><i></i><i></i>
          </div>
          <h2 id="terminal-title">ramon@portfolio: ~</h2>
          <button
            class="terminal-close"
            type="button"
            aria-label="Close terminal"
            title="Close terminal"
            @click="closeTerminal"
          >
            ×
          </button>
        </header>

        <div ref="terminalBody" class="terminal-body" aria-live="polite">
          <p class="terminal-welcome">
            Welcome to ramon.dev <span>v1.0.0</span>
          </p>
          <p class="terminal-hint">
            Type <code>help</code> to inspect the available commands.
          </p>
          <div v-for="entry in entries" :key="entry.id" class="terminal-entry">
            <p class="terminal-command">
              <span>ramon@portfolio:~$</span> {{ entry.command }}
            </p>
            <p
              v-for="(line, index) in entry.lines"
              :key="index"
              class="terminal-line"
              :class="{ 'terminal-line--error': entry.isError }"
            >
              {{ line }}
            </p>
            <a
              v-if="entry.href"
              class="terminal-result-link"
              :href="entry.href"
              :target="entry.href.startsWith('http') ? '_blank' : undefined"
              :rel="
                entry.href.startsWith('http')
                  ? 'noopener noreferrer'
                  : undefined
              "
            >
              {{ entry.linkLabel }}
            </a>
          </div>
        </div>

        <form class="terminal-form" @submit.prevent="executeCommand">
          <label class="terminal-prompt" for="terminal-command">$</label>
          <input
            id="terminal-command"
            ref="inputElement"
            v-model="input"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            aria-label="Terminal command"
            @keydown.up.prevent="navigateHistory(-1)"
            @keydown.down.prevent="navigateHistory(1)"
          />
          <button type="submit" aria-label="Run command" title="Run command">
            ↵
          </button>
        </form>
      </section>
    </Transition>
  </div>
</template>

<style src="./PortfolioTerminal.css"></style>
