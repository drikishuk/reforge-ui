<template>
  <main ref="pageRef" class="launch-page">
    <div
      ref="cursorRef"
      class="cursor-ident"
      :class="{
        'cursor-ident--active': isCursorActive,
        'cursor-ident--white': cursorStore.isWhite,
      }"
      aria-hidden="true"
    >
      <span class="cursor-ident__ring" />
      <span class="cursor-ident__core" />
    </div>

    <section ref="heroRef" class="launch-hero" aria-labelledby="hero-title">
      <div v-show="!isTerminalBlack" class="media-panel" aria-hidden="true">
        <video
          ref="videoRef"
          class="media-panel__video"
          :src="bgVideo"
          autoplay
          muted
          loop
          playsinline
        />
        <div class="media-panel__overlay" />
        <div class="media-panel__grid" />
        <div class="hud hud--right">
          <span>09</span>
          <span>357</span>
          <span>9F</span>
        </div>
      </div>

      <div
        ref="orangePanelRef"
        class="orange-panel"
        :class="{ 'orange-panel--expanded': isLoginExpanded }"
      >
        <div class="brand-lockup">
          <span class="decor decor--left">+</span>
          <h1 id="hero-title">
            <span class="headline-hidden-prefix">RE</span>FORGE
          </h1>
          <span class="decor decor--right">+</span>
        </div>

        <div class="orange-panel__center">
          <span class="decor decor--center">+</span>
        </div>

        <div class="logo-tab" aria-hidden="true">
          <img :src="logoMark" alt="" />
        </div>

        <form
          v-show="isLoginExpanded"
          class="login-form"
          aria-label="Login credentials"
          @submit.prevent="authoriseLogin"
        >
          <div class="login-form__rail" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <label
            class="login-field"
            @pointerenter="cursorStore.setCursorWhite"
            @pointerleave="cursorStore.setCursorBlack"
          >
            <span>Email</span>
            <input
              type="email"
              autocomplete="email"
              spellcheck="false"
              value="ben.aldrich@omc.com"
              @focus="cursorStore.setCursorWhite"
              @blur="cursorStore.setCursorBlack"
            />
          </label>

          <label
            class="login-field"
            @pointerenter="cursorStore.setCursorWhite"
            @pointerleave="cursorStore.setCursorBlack"
          >
            <span>Password</span>
            <input
              type="password"
              autocomplete="current-password"
              @focus="cursorStore.setCursorWhite"
              @blur="cursorStore.setCursorBlack"
            />
          </label>

          <button
            class="login-submit"
            type="submit"
            :disabled="isAuthorising"
            @pointerenter="cursorStore.setCursorWhite"
            @pointerleave="cursorStore.setCursorBlack"
            @focus="cursorStore.setCursorWhite"
            @blur="cursorStore.setCursorBlack"
          >
            Authorise
          </button>
        </form>

        <div class="start-panel">
          <button
            class="login-button pb-4"
            :class="{ 'login-button--waiting': isLoginWaiting }"
            type="button"
            :disabled="isPanelTransitioning || isLoginExpanded"
            @pointerenter="cursorStore.setCursorWhite"
            @pointerleave="cursorStore.setCursorBlack"
            @focus="cursorStore.setCursorWhite"
            @blur="cursorStore.setCursorBlack"
            @click="openLoginPanel"
          >
            <span class="login-prompt-frame">
              <Transition name="login-prompt-swap">
                <span
                  :key="isLoginWaiting ? 'waiting' : 'initial'"
                  class="login-prompt"
                >
                  {{ isLoginWaiting ? 'Waiting for Login...' : 'Initialise SSO Login' }}
                </span>
              </Transition>
            </span>
            <span v-if="!isLoginWaiting" class="login-arrow" aria-hidden="true" />
          </button>
          <div class="barcode-row">
            <span class="barcode" />
            <span class="crosshair">×</span>
            <span class="camera-dot" />
            <span>Version 0.1.0</span>
            <span class="signal" />
          </div>
        </div>

        <div class="escape-row">
          <!-- <kbd>Enter</kbd> -->
          <span>+ Scaled Global Automation +</span>
        </div>

      </div>

      <button
        v-show="isLoginExpanded"
        ref="closeButtonRef"
        class="panel-close"
        type="button"
        aria-label="Return to splash screen"
        :disabled="isPanelTransitioning"
        @pointerenter="cursorStore.setCursorWhite"
        @pointerleave="cursorStore.setCursorBlack"
        @focus="cursorStore.setCursorWhite"
        @blur="cursorStore.setCursorBlack"
        @click="closeLoginPanel"
      />

      <div
        v-show="showGridWipe"
        class="grid-wipe"
        :style="gridWipeStyle"
        aria-hidden="true"
      >
        <span v-for="cell in gridCellCount" :key="cell" class="grid-wipe__cell" />
      </div>

      <div v-show="showTerminalBackdrop" class="terminal-backdrop" aria-hidden="true" />

      <div v-show="showLoading" class="terminal-loading" aria-live="polite">
        <span>Welcome User. Please wait.</span>
      </div>

      <div class="hud hud--float" aria-hidden="true">
        <span>+</span>
      </div>
    </section>
  </main>
</template>

<script lang="ts" setup>
  import gsap from 'gsap'
  import Lenis from 'lenis'
  import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import bgVideo from '@/assets/bg-video-new.mp4'
  import logoMark from '@/assets/logo.svg'
  import { useCursorStore } from '@/stores/cursor'

  const router = useRouter()
  const cursorStore = useCursorStore()
  const pageRef = ref<HTMLElement | null>(null)
  const heroRef = ref<HTMLElement | null>(null)
  const orangePanelRef = ref<HTMLElement | null>(null)
  const cursorRef = ref<HTMLElement | null>(null)
  const videoRef = ref<HTMLVideoElement | null>(null)
  const closeButtonRef = ref<HTMLButtonElement | null>(null)
  const isLoginExpanded = ref(false)
  const isLoginWaiting = ref(false)
  const isAuthorising = ref(false)
  const isTerminalBlack = ref(false)
  const isPanelTransitioning = ref(false)
  const isCursorActive = ref(false)
  const showGridWipe = ref(false)
  const showTerminalBackdrop = ref(false)
  const showLoading = ref(false)
  const gridColumns = 36
  const gridRows = 27
  const gridCellCount = gridColumns * gridRows
  const gridWipeStyle = {
    '--grid-columns': String(gridColumns),
    '--grid-rows': String(gridRows),
  }

  let lenis: Lenis | null = null
  let animationFrame = 0
  let introTimeline: gsap.core.Timeline | null = null
  let panelTimeline: gsap.core.Timeline | null = null
  let authoriseTimeline: gsap.core.Timeline | null = null
  let headlineGlitchTimeline: gsap.core.Timeline | null = null
  let markerFadeTimeline: gsap.core.Timeline | null = null
  let dashboardRedirect: gsap.core.Tween | null = null
  let moveCursor: ((event: PointerEvent) => void) | null = null
  let hideCursor: (() => void) | null = null
  const overlayTextTargets = '.brand-lockup, .orange-panel__center, .start-panel, .escape-row, .login-form'
  const cursor = {
    active: false,
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
  }

  const setVideoPlaybackSpeed = () => {
    if (videoRef.value) videoRef.value.playbackRate = 1
  }

  const getSplashPanelWidth = () => (
    window.matchMedia('(max-width: 900px)').matches ? '72vw' : '50%'
  )

  const getExpandedPanelWidth = () => 'calc(100% + clamp(59px, 4.4vw, 88px))'

  const resetOverlayText = () => {
    gsap.set(overlayTextTargets, {
      autoAlpha: 1,
      clearProps: 'clipPath,filter,skewX,x,y',
    })
    gsap.set('.grid-wipe__cell', { autoAlpha: 0, scale: 1.02 })
    gsap.set('.terminal-loading', { autoAlpha: 0, clearProps: 'clipPath,filter,skewX,x,y' })
  }

  const addGlitchIn = (timeline: gsap.core.Timeline, target: gsap.TweenTarget, position?: gsap.Position) => {
    timeline
      .set(target, {
        autoAlpha: 0,
        clipPath: 'polygon(0 48%, 100% 48%, 100% 52%, 0 52%)',
        filter: 'contrast(2.4)',
        skewX: -8,
        x: -18,
      }, position)
      .to(target, {
        autoAlpha: 1,
        clipPath: 'polygon(0 0, 100% 0, 100% 18%, 0 18%, 0 42%, 100% 42%, 100% 56%, 0 56%, 0 100%, 100% 100%, 100% 100%, 0 100%)',
        duration: 0.05,
        skewX: 7,
        x: 14,
      })
      .to(target, {
        clipPath: 'polygon(0 12%, 100% 12%, 100% 30%, 0 30%, 0 64%, 100% 64%, 100% 76%, 0 76%)',
        duration: 0.05,
        skewX: -9,
        x: -16,
      })
      .to(target, {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        duration: 0.06,
        filter: 'contrast(1)',
        skewX: 0,
        x: 0,
      })
  }

  const addGlitchOut = (timeline: gsap.core.Timeline, target: gsap.TweenTarget, position?: gsap.Position) => {
    timeline
      .to(target, {
        clipPath: 'polygon(0 0, 100% 0, 100% 16%, 0 16%, 0 40%, 100% 40%, 100% 54%, 0 54%, 0 100%, 100% 100%, 100% 100%, 0 100%)',
        duration: 0.05,
        ease: 'steps(1)',
        filter: 'contrast(2)',
        skewX: -7,
        x: -14,
      }, position)
      .to(target, {
        clipPath: 'polygon(0 10%, 100% 10%, 100% 28%, 0 28%, 0 58%, 100% 58%, 100% 72%, 0 72%)',
        duration: 0.05,
        skewX: 9,
        x: 16,
      })
      .to(target, {
        autoAlpha: 0,
        clipPath: 'polygon(0 50%, 100% 50%, 100% 50%, 0 50%)',
        duration: 0.06,
        filter: 'contrast(3)',
        skewX: 0,
        x: 0,
      })
  }

  const createHeadlineGlitchTimeline = () => (
    gsap
      .timeline({
        repeat: -1,
        defaults: { ease: 'steps(1)' },
      })
      .to({}, { duration: 10 })
      .call(() => {
        const headline = document.querySelector<HTMLElement>('.brand-lockup h1')
        if (!headline) return

        headline.classList.add('headline--white')
        gsap.set(headline, { color: '#ffffff' })
      })
      .to('.brand-lockup h1', {
        clipPath: 'polygon(0 0, 100% 0, 100% 18%, 0 18%, 0 42%, 100% 42%, 100% 55%, 0 55%, 0 100%, 100% 100%, 100% 100%, 0 100%)',
        duration: 0.05,
        filter: 'contrast(1.9)',
        skewX: -6,
        x: -12,
      })
      .to('.brand-lockup h1', {
        clipPath: 'polygon(0 12%, 100% 12%, 100% 28%, 0 28%, 0 58%, 100% 58%, 100% 73%, 0 73%)',
        duration: 0.05,
        filter: 'contrast(2.5)',
        skewX: 8,
        x: 16,
      })
      .to('.brand-lockup h1', {
        clipPath: 'polygon(0 0, 100% 0, 100% 8%, 0 8%, 0 48%, 100% 48%, 100% 63%, 0 63%, 0 88%, 100% 88%, 100% 100%, 0 100%)',
        duration: 0.06,
        filter: 'contrast(1.7)',
        skewX: -9,
        x: -18,
      })
      .to('.brand-lockup h1', {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        duration: 0.08,
        filter: 'contrast(1)',
        skewX: 0,
        x: 0,
      })
      .to({}, { duration: 1 })
      .call(() => {
        const headline = document.querySelector<HTMLElement>('.brand-lockup h1')
        if (!headline) return

        headline.classList.remove('headline--white')
        gsap.set(headline, { color: '#080808' })
      })
      .to('.brand-lockup h1', {
        clipPath: 'polygon(0 0, 100% 0, 100% 18%, 0 18%, 0 42%, 100% 42%, 100% 55%, 0 55%, 0 100%, 100% 100%, 100% 100%, 0 100%)',
        duration: 0.05,
        filter: 'contrast(1.9)',
        skewX: -6,
        x: -12,
      })
      .to('.brand-lockup h1', {
        clipPath: 'polygon(0 12%, 100% 12%, 100% 28%, 0 28%, 0 58%, 100% 58%, 100% 73%, 0 73%)',
        duration: 0.05,
        filter: 'contrast(2.5)',
        skewX: 8,
        x: 16,
      })
      .to('.brand-lockup h1', {
        clipPath: 'polygon(0 0, 100% 0, 100% 8%, 0 8%, 0 48%, 100% 48%, 100% 63%, 0 63%, 0 88%, 100% 88%, 100% 100%, 0 100%)',
        duration: 0.06,
        filter: 'contrast(1.7)',
        skewX: -9,
        x: -18,
      })
      .to('.brand-lockup h1', {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        duration: 0.08,
        filter: 'contrast(1)',
        skewX: 0,
        x: 0,
      })
  )

  const createMarkerFadeTimeline = () => {
    gsap.set('.decor--center', { autoAlpha: 1 })
    gsap.set('.hud--float', { autoAlpha: 0 })

    return gsap
      .timeline({
        repeat: -1,
        defaults: { duration: 2, ease: 'power2.inOut' },
      })
      .to('.decor--center', { autoAlpha: 0 }, 0)
      .to('.hud--float', { autoAlpha: 1 }, 0)
      .to('.hud--float', { autoAlpha: 0 }, 2)
      .to('.decor--center', { autoAlpha: 1 }, 2)
  }

  const openLoginPanel = async () => {
    if (!orangePanelRef.value || isPanelTransitioning.value || isLoginExpanded.value) return

    cursorStore.setCursorBlack()
    introTimeline?.progress(1).pause()
    markerFadeTimeline?.pause()
    panelTimeline?.kill()
    authoriseTimeline?.kill()
    isAuthorising.value = false
    isTerminalBlack.value = false
    showGridWipe.value = false
    showTerminalBackdrop.value = false
    showLoading.value = false
    dashboardRedirect?.kill()
    isPanelTransitioning.value = true
    isLoginWaiting.value = true
    isLoginExpanded.value = true

    await nextTick()

    resetOverlayText()
    gsap.set(closeButtonRef.value, { autoAlpha: 0, scale: 0.92 })
    gsap.set('.decor--center', { autoAlpha: 0 })
    gsap.set('.login-form', { autoAlpha: 0, y: 24 })

    panelTimeline = gsap
      .timeline({
        defaults: { ease: 'power4.inOut' },
        onComplete: () => {
          isPanelTransitioning.value = false
          gsap.to(closeButtonRef.value, {
            autoAlpha: 1,
            duration: 0.28,
            ease: 'power2.out',
            scale: 1,
          })
        },
      })
      .to('.hud--float', { autoAlpha: 0, duration: 0.35 }, 0)
      .to(orangePanelRef.value, { duration: 1.05, width: getExpandedPanelWidth() }, 0)
      .to('.login-form', {
        autoAlpha: 1,
        duration: 0.48,
        ease: 'power3.out',
        y: 0,
      }, 0.56)
  }

  const closeLoginPanel = () => {
    if (!orangePanelRef.value || isPanelTransitioning.value || !isLoginExpanded.value) return

    cursorStore.setCursorBlack()
    authoriseTimeline?.kill()
    panelTimeline?.kill()
    isPanelTransitioning.value = true
    isAuthorising.value = false
    isTerminalBlack.value = false
    showGridWipe.value = false
    showTerminalBackdrop.value = false
    showLoading.value = false
    dashboardRedirect?.kill()
    isLoginWaiting.value = false

    resetOverlayText()

    panelTimeline = gsap
      .timeline({
        defaults: { ease: 'power4.inOut' },
        onComplete: () => {
          if (orangePanelRef.value) gsap.set(orangePanelRef.value, { clearProps: 'width' })
          gsap.set(closeButtonRef.value, { autoAlpha: 0, scale: 0.92 })
          gsap.set('.decor--center', { autoAlpha: 1 })
          isLoginExpanded.value = false
          isPanelTransitioning.value = false
          markerFadeTimeline?.restart()
        },
      })
      .to(closeButtonRef.value, {
        autoAlpha: 0,
        duration: 0.18,
        ease: 'power2.out',
        scale: 0.92,
      }, 0)
      .to('.login-form', {
        autoAlpha: 0,
        duration: 0.22,
        ease: 'power2.in',
        y: 18,
      }, 0)
      .to(orangePanelRef.value, { duration: 1.05, width: getSplashPanelWidth() }, 0.04)
      .to('.hud--float', { autoAlpha: 1, duration: 0.35 }, 0.55)
  }

  const authoriseLogin = async () => {
    if (isAuthorising.value || isPanelTransitioning.value || !isLoginExpanded.value) return

    cursorStore.setCursorBlack()
    authoriseTimeline?.kill()
    isAuthorising.value = true
    showGridWipe.value = true
    showTerminalBackdrop.value = false
    showLoading.value = true

    await nextTick()

    gsap.set('.grid-wipe__cell', { autoAlpha: 0, scale: 1.02 })
    gsap.set('.terminal-loading', {
      autoAlpha: 0,
      clipPath: 'polygon(0 48%, 100% 48%, 100% 52%, 0 52%)',
      filter: 'contrast(2.4)',
      skewX: -8,
      x: -18,
    })

    authoriseTimeline = gsap
      .timeline({
        defaults: { ease: 'steps(1)' },
        onComplete: () => {
          isAuthorising.value = false
        },
      })
      .to(closeButtonRef.value, {
        autoAlpha: 0,
        duration: 0.12,
        ease: 'power2.out',
        scale: 0.92,
      }, 0)
      .to(overlayTextTargets, {
        clipPath: 'polygon(0 0, 100% 0, 100% 18%, 0 18%, 0 34%, 100% 34%, 100% 47%, 0 47%, 0 100%, 100% 100%, 100% 100%, 0 100%)',
        duration: 0.06,
        filter: 'contrast(1.7)',
        skewX: -4,
        x: -12,
        y: 2,
      }, 0)
      .to(overlayTextTargets, {
        clipPath: 'polygon(0 0, 100% 0, 100% 9%, 0 9%, 0 44%, 100% 44%, 100% 62%, 0 62%, 0 82%, 100% 82%, 100% 100%, 0 100%)',
        duration: 0.05,
        filter: 'contrast(2)',
        skewX: 5,
        x: 16,
        y: -3,
      })
      .to(overlayTextTargets, {
        clipPath: 'polygon(0 11%, 100% 11%, 100% 27%, 0 27%, 0 52%, 100% 52%, 100% 58%, 0 58%, 0 77%, 100% 77%, 100% 91%, 0 91%)',
        duration: 0.05,
        filter: 'contrast(1.85)',
        skewX: -7,
        x: -20,
        y: 4,
      })
      .to(overlayTextTargets, {
        clipPath: 'polygon(0 42%, 100% 42%, 100% 51%, 0 51%, 0 64%, 100% 64%, 100% 68%, 0 68%)',
        duration: 0.07,
        filter: 'contrast(2.3)',
        skewX: 9,
        x: 22,
        y: -2,
      })
      .to(overlayTextTargets, {
        autoAlpha: 0,
        clipPath: 'polygon(0 50%, 100% 50%, 100% 50%, 0 50%)',
        duration: 0.04,
        filter: 'contrast(3)',
        x: 0,
        y: 0,
      })
      .add(() => {
        isTerminalBlack.value = true
      })
      .to('.grid-wipe__cell:nth-child(3n)', {
        autoAlpha: 0.9,
        duration: 0.04,
        ease: 'steps(1)',
        scale: 1.04,
        stagger: {
          amount: 0.08,
          from: 'random',
        },
      }, '+=0.03')
      .to('.grid-wipe__cell:nth-child(3n)', {
        autoAlpha: 0,
        duration: 0.03,
        ease: 'steps(1)',
      })
      .to('.grid-wipe__cell:nth-child(5n + 2)', {
        autoAlpha: 0.82,
        duration: 0.04,
        ease: 'steps(1)',
        scale: 1.04,
        stagger: {
          amount: 0.07,
          from: 'random',
        },
      })
      .to('.grid-wipe__cell:nth-child(5n + 2)', {
        autoAlpha: 0,
        duration: 0.03,
        ease: 'steps(1)',
      })
      .to('.grid-wipe__cell', {
        autoAlpha: 1,
        duration: 0.2,
        ease: 'power2.out',
        scale: 1.04,
        stagger: {
          amount: 0.34,
          from: 'random',
        },
      }, '-=0.01')
      .add(() => {
        showTerminalBackdrop.value = true
      })
      .to('.grid-wipe__cell', {
        autoAlpha: 0,
        duration: 0.18,
        ease: 'power2.in',
        scale: 1,
        stagger: {
          amount: 0.28,
          from: 'random',
        },
      })
      .add(() => {
        showGridWipe.value = false
      })

    addGlitchIn(authoriseTimeline, '.terminal-loading')
    addGlitchOut(authoriseTimeline, '.terminal-loading', '+=2')

    authoriseTimeline.add(() => {
      dashboardRedirect = gsap.delayedCall(0.35, () => {
        router.push('/dashboard')
      })
    })
  }

  onMounted(() => {
    const supportsFinePointer = window.matchMedia('(pointer: fine)').matches
    setVideoPlaybackSpeed()
    videoRef.value?.addEventListener('loadedmetadata', setVideoPlaybackSpeed)

    lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
    })

    moveCursor = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return

      cursor.targetX = event.clientX
      cursor.targetY = event.clientY

      if (!cursor.active) {
        cursor.active = true
        cursor.currentX = event.clientX
        cursor.currentY = event.clientY
        isCursorActive.value = true
      }
    }

    hideCursor = () => {
      cursor.active = false
      isCursorActive.value = false
    }

    if (supportsFinePointer) {
      document.documentElement.classList.add('has-retro-cursor')
      window.addEventListener('pointermove', moveCursor)
      window.addEventListener('pointerleave', hideCursor)
    }

    const raf = (time: number) => {
      lenis?.raf(time)

      if (cursor.active && cursorRef.value) {
        cursor.currentX += (cursor.targetX - cursor.currentX) * 0.18
        cursor.currentY += (cursor.targetY - cursor.currentY) * 0.18
        cursorRef.value.style.transform = `translate3d(${cursor.currentX - 37}px, ${cursor.currentY - 37}px, 0)`
      }

      animationFrame = requestAnimationFrame(raf)
    }

    animationFrame = requestAnimationFrame(raf)

    introTimeline = gsap
      .timeline({
        defaults: { duration: 1, ease: 'power3.out' },
        onComplete: () => {
          headlineGlitchTimeline = createHeadlineGlitchTimeline()
          markerFadeTimeline = createMarkerFadeTimeline()
        },
      })
      .from(orangePanelRef.value, { xPercent: -100 })
      .from('.brand-lockup h1', { yPercent: 115, opacity: 0 }, '-=0.45')
      .from('.logo-tab img', { autoAlpha: 0, scale: 0.92 }, '<')
      .from('.decor, .start-panel, .escape-row', { autoAlpha: 0, y: 18, stagger: 0.08 }, '-=0.35')
  })

  onBeforeUnmount(() => {
    introTimeline?.kill()
    panelTimeline?.kill()
    authoriseTimeline?.kill()
    headlineGlitchTimeline?.kill()
    markerFadeTimeline?.kill()
    dashboardRedirect?.kill()
    cursorStore.setCursorBlack()
    gsap.killTweensOf([orangePanelRef.value, closeButtonRef.value, '.brand-lockup h1', '.decor--center', '.login-form', '.terminal-loading', overlayTextTargets, '.hud--float'])
    lenis?.destroy()
    cancelAnimationFrame(animationFrame)
    videoRef.value?.removeEventListener('loadedmetadata', setVideoPlaybackSpeed)
    document.documentElement.classList.remove('has-retro-cursor')
    if (moveCursor) window.removeEventListener('pointermove', moveCursor)
    if (hideCursor) window.removeEventListener('pointerleave', hideCursor)
  })
</script>

<style scoped>
  :global(body) {
    margin: 0;
    background: #090b10;
  }

  :global(.has-retro-cursor),
  :global(.has-retro-cursor *) {
    cursor: none;
  }

  :global(.v-main) {
    --v-layout-top: 0px;
  }

  .cursor-ident {
    --cursor-core-scale: 1;
    --cursor-ring-scale: 1;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    width: 74px;
    height: 74px;
    color: #080808;
    opacity: 0;
    pointer-events: none;
    transform: translate3d(-100px, -100px, 0);
    transition: color 160ms ease, opacity 180ms ease;
    will-change: transform;
  }

  .cursor-ident--active {
    opacity: 1;
  }

  .cursor-ident--white {
    --cursor-core-scale: 0.65;
    --cursor-ring-scale: 0.62;
    color: #ffffff;
    opacity: 0.75;
  }

  .cursor-ident--white .cursor-ident__ring {
    animation-duration: 14s;
  }

  .cursor-ident--white .cursor-ident__core {
    opacity: 0.25;
  }

  .cursor-ident__ring,
  .cursor-ident__core {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .cursor-ident__ring {
    width: 46px;
    aspect-ratio: 1;
    animation: cursor-ring-spin 5.6s linear infinite;
    background:
      linear-gradient(currentColor 0 0) 50% 0 / 2px 9px no-repeat,
      linear-gradient(currentColor 0 0) 50% 100% / 2px 9px no-repeat,
      linear-gradient(currentColor 0 0) 0 50% / 9px 2px no-repeat,
      linear-gradient(currentColor 0 0) 100% 50% / 9px 2px no-repeat,
      conic-gradient(
        from 28deg,
        currentColor 0 52deg,
        transparent 52deg 102deg,
        currentColor 102deg 188deg,
        transparent 188deg 232deg,
        currentColor 232deg 316deg,
        transparent 316deg
    );
    border-radius: 50%;
    filter: drop-shadow(0 0 8px color-mix(in srgb, currentColor 30%, transparent));
    mask: radial-gradient(circle, transparent 0 51%, #000 52% 100%);
  }

  .cursor-ident__ring::before,
  .cursor-ident__ring::after {
    position: absolute;
    inset: -8px;
    content: '';
    border-radius: 50%;
    mask: radial-gradient(circle, transparent 0 58%, #000 59% 100%);
  }

  .cursor-ident__ring::before {
    animation: cursor-orbit-wide 2.8s linear infinite reverse;
    background:
      conic-gradient(from 12deg, transparent 0 38deg, currentColor 38deg 58deg, transparent 58deg 206deg, currentColor 206deg 224deg, transparent 224deg);
    opacity: 0.72;
  }

  .cursor-ident__ring::after {
    inset: 8px;
    animation: cursor-orbit-tight 1.8s ease-in-out infinite;
    background:
      conic-gradient(from 90deg, currentColor 0 34deg, transparent 34deg 176deg, currentColor 176deg 204deg, transparent 204deg);
    opacity: 0.55;
  }

  .cursor-ident__core {
    animation: cursor-core-pulse 1.8s ease-in-out infinite;
    width: 6px;
    aspect-ratio: 1;
    background: currentColor;
    border: 1px solid color-mix(in srgb, currentColor 90%, transparent);
    box-shadow:
      0 0 0 4px color-mix(in srgb, currentColor 12%, transparent),
      0 0 14px color-mix(in srgb, currentColor 28%, transparent);
  }

  @keyframes cursor-ring-spin {
    from {
      transform: translate(-50%, -50%) rotate(0deg) scale(var(--cursor-ring-scale));
    }

    to {
      transform: translate(-50%, -50%) rotate(360deg) scale(var(--cursor-ring-scale));
    }
  }

  @keyframes cursor-orbit-wide {
    0% {
      transform: rotate(0deg) scale(1);
    }

    50% {
      transform: rotate(180deg) scale(1.08);
    }

    100% {
      transform: rotate(360deg) scale(1);
    }
  }

  @keyframes cursor-orbit-tight {
    0%,
    100% {
      transform: rotate(0deg);
      opacity: 0.35;
    }

    50% {
      transform: rotate(-160deg);
      opacity: 0.78;
    }
  }

  @keyframes cursor-core-pulse {
    0%,
    100% {
      transform: translate(-50%, -50%) scale(var(--cursor-core-scale));
    }

    50% {
      transform: translate(-50%, -50%) scale(calc(var(--cursor-core-scale) * 1.35));
    }
  }

  .launch-page {
    min-height: 100vh;
    overflow: hidden;
    background: #090b10;
    color: #101010;
    font-family: 'Roboto Condensed', 'Roboto', Arial, sans-serif;
  }

  .launch-hero {
    position: relative;
    min-height: 100svh;
    overflow: hidden;
    background: #10141d;
  }

  .media-panel {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    background: #000000;
    isolation: isolate;
    pointer-events: none;
  }

  .media-panel__video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 80%;
    object-fit: cover;
    pointer-events: none;
    margin-left: 440px;
    top: 10%;
  }

  .media-panel::before,
  .media-panel::after {
    position: absolute;
    left: 0;
    right: 0;
    z-index: 2;
    content: '';
    pointer-events: none;
  }

  .media-panel::before {
    top: 0;
    height: 40%;
    background: linear-gradient(to bottom, #000000 0%, #000000 20%, transparent 100%)
  }

  .media-panel::after {
    bottom: 0;
    height: 40%;
    background: linear-gradient(to top, #000000 0%, #000000 20%, transparent 100%)
  }

  .media-panel__overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    /* background: rgba(0, 0, 0, 0.3); */
    /* filter: blur(100px); */
    pointer-events: none;
  }

  .media-panel__grid {
    position: absolute;
    z-index: 3;
    inset: 36% -10% -12% 42%;
    background-image:
      linear-gradient(rgba(109, 237, 255, 0.18) 1px, transparent 1px),
      linear-gradient(90deg, rgba(109, 237, 255, 0.16) 1px, transparent 1px);
    background-size: 84px 84px;
    opacity: 0.42;
    pointer-events: none;
    transform: perspective(520px) rotateX(58deg) rotateZ(-13deg);
    transform-origin: center top;
  }

  .orange-panel {
    position: relative;
    z-index: 2;
    width: 50%;
    min-height: 100svh;
    padding: clamp(36px, 6vw, 86px);
    background: #ee5e0e;
    box-shadow: 18px 0 34px rgba(0, 0, 0, 0.38);
  }

  .orange-panel--expanded {
    z-index: 5;
  }

  .panel-close {
    position: fixed;
    top: clamp(24px, 4vw, 52px);
    right: clamp(24px, 4vw, 52px);
    z-index: 8;
    width: 48px;
    height: 48px;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: none;
  }

  .panel-close::before,
  .panel-close::after {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 34px;
    height: 5px;
    content: '';
    background: #080808;
    transform-origin: center;
    transition: opacity 180ms ease, transform 180ms ease;
  }

  .panel-close::before {
    transform: translate(-50%, -50%) rotate(45deg);
  }

  .panel-close::after {
    transform: translate(-50%, -50%) rotate(-45deg);
  }

  .panel-close:hover::before,
  .panel-close:focus-visible::before {
    transform: translate(-50%, -50%) rotate(135deg);
  }

  .panel-close:hover::after,
  .panel-close:focus-visible::after {
    transform: translate(-50%, -50%) rotate(45deg);
  }

  .panel-close:focus-visible {
    outline: 2px solid rgba(8, 8, 8, 0.72);
    outline-offset: 6px;
  }

  .grid-wipe {
    position: fixed;
    inset: 0;
    z-index: 12;
    display: grid;
    grid-template-columns: repeat(var(--grid-columns), 1fr);
    grid-template-rows: repeat(var(--grid-rows), 1fr);
    overflow: hidden;
    pointer-events: none;
  }

  .grid-wipe__cell {
    display: block;
    width: 100%;
    height: 100%;
    background: #080808;
    box-shadow: 0 0 0 1.5px #080808;
    opacity: 0;
    transform-origin: center;
    will-change: opacity, transform;
  }

  .terminal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 11;
    background: #080808;
    pointer-events: none;
  }

  .terminal-loading {
    position: fixed;
    inset: 0;
    z-index: 13;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-size: clamp(0.84rem, 1.1vw, 2.4rem);
    font-weight: 900;
    line-height: 1;
    letter-spacing: 0;
    text-transform: uppercase;
    pointer-events: none;
  }

  .logo-tab {
    position: absolute;
    top: 50%;
    right: 0;
    z-index: 4;
    display: grid;
    width: clamp(118px, 8.8vw, 176px);
    aspect-ratio: 1;
    place-items: center;
    background: #ee5e0e;
    transform: translate(50%, -50%);
  }

  .logo-tab::after {
    position: absolute;
    inset: 0;
    z-index: 0;
    content: '';
    background: #ee5e0e;
    box-shadow: 18px 0 34px rgba(0, 0, 0, 0.58);
    clip-path: inset(-40px -60px -40px 50%);
  }

  .logo-tab img {
    position: relative;
    z-index: 1;
    display: block;
    width: 48%;
    max-height: 58%;
    object-fit: contain;
    margin-left: 55px;
  }

  .brand-lockup {
    position: relative;
    display: inline-grid;
    grid-template-columns: auto 1fr auto;
    gap: 16px;
    align-items: center;
    overflow: hidden;
    left: -46px;
  }

  .brand-lockup h1 {
    margin: 0;
    color: #080808;
    font-size: clamp(4.6rem, 7.2vw, 12rem);
    font-weight: 900;
    line-height: 0.76;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .brand-lockup h1 .headline-hidden-prefix {
    color: inherit;
    transition: color 80ms steps(1);
  }

  .brand-lockup h1.headline--white .headline-hidden-prefix {
    color: #ee5e0e;
  }

  .decor {
    color: rgba(0, 0, 0, 0.48);
    font-family: monospace;
    font-size: clamp(1.4rem, 2vw, 2.2rem);
    line-height: 1;
  }

  .orange-panel__center {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    align-items: center;
    transform: translateY(-50%) translateX(-50%);
  }

  .orange-panel__center .decor {
    font-size: 3rem;
  }

  .login-form {
    position: absolute;
    top: 48%;
    left: clamp(36px, 11.5vw, 176px);
    display: grid;
    grid-template-columns: 28px minmax(338px, 546px);
    gap: 18px 22px;
    align-items: end;
    width: min(672px, calc(100vw - 72px));
    color: #080808;
    text-transform: uppercase;
    transform: translateY(-50%);
  }

  .login-form__rail {
    display: grid;
    grid-row: span 3;
    gap: 8px;
    align-self: stretch;
    padding-block: 2px;
  }

  .login-form__rail span {
    display: block;
    width: 100%;
    min-height: 18px;
    background:
      repeating-linear-gradient(
        90deg,
        #080808 0 4px,
        transparent 4px 8px
      );
  }

  .login-field {
    display: grid;
    gap: 8px;
    font-family: monospace;
  }

  .login-field span {
    color: rgba(8, 8, 8, 0.62);
    font-size: clamp(0.78rem, 0.9vw, 0.95rem);
    letter-spacing: 0;
  }

  .login-field input {
    width: 100%;
    height: 54px;
    padding: 0 16px;
    border: 0;
    border-bottom: 5px solid #080808;
    color: #080808;
    background:
      linear-gradient(90deg, rgba(8, 8, 8, 0.12), rgba(8, 8, 8, 0.04));
    border-radius: 0;
    caret-color: #080808;
    font: inherit;
    font-size: clamp(1rem, 1.2vw, 1.25rem);
    outline: 1px solid rgba(8, 8, 8, 0.24);
    outline-offset: -1px;
    transition: background 180ms ease, outline-color 180ms ease;
  }

  .login-field input:focus {
    background:
      linear-gradient(90deg, rgba(8, 8, 8, 0.18), rgba(8, 8, 8, 0.07));
    outline-color: #080808;
  }

  .login-submit {
    justify-self: start;
    min-height: 44px;
    padding: 0 18px;
    border: 5px solid #080808;
    color: #080808;
    background: transparent;
    border-radius: 0;
    cursor: none;
    font: inherit;
    font-size: clamp(0.92rem, 1vw, 1.1rem);
    font-weight: 900;
    line-height: 1;
    text-transform: uppercase;
    transition: background 180ms ease, color 180ms ease;
  }

  .login-submit:hover,
  .login-submit:focus-visible {
    color: #ee5e0e;
    background: #080808;
    outline: none;
  }

  .start-panel {
    position: absolute;
    bottom: clamp(104px, 15vh, 180px);
    left: clamp(36px, 6vw, 86px);
    color: rgba(0, 0, 0, 0.48);
    text-transform: uppercase;
  }

  .login-button {
    appearance: none;
    border: 0;
    display: inline-flex;
    gap: 14px;
    align-items: center;
    margin: 0 0 8px;
    padding-inline: 0;
    color: #080808;
    background: transparent;
    cursor: none;
    font: inherit;
    font-size: clamp(1rem, 1.9vw, 2rem);
    font-weight: 900;
    line-height: 1;
    text-align: left;
    text-transform: inherit;
  }

  .login-button:disabled,
  .panel-close:disabled {
    pointer-events: none;
  }

  .login-button--waiting {
    pointer-events: none;
  }

  .login-prompt-frame {
    position: relative;
    display: inline-grid;
    align-items: center;
  }

  .login-prompt-frame .login-prompt {
    grid-area: 1 / 1;
  }

  .login-prompt {
    animation: login-pulse 2.4s ease-in-out infinite;
  }

  .login-button:not(.login-button--waiting):hover .login-prompt,
  .login-button:not(.login-button--waiting):focus-visible .login-prompt {
    animation: none;
    color: #080808;
  }

  .login-prompt-swap-enter-active,
  .login-prompt-swap-leave-active {
    transition: opacity 220ms ease;
  }

  .login-prompt-swap-leave-active {
    position: absolute;
    inset: 0 auto auto 0;
    width: max-content;
  }

  .login-prompt-swap-enter-from,
  .login-prompt-swap-leave-to {
    opacity: 0;
  }

  .login-arrow {
    position: relative;
    display: inline-block;
    width: 38px;
    height: 18px;
    flex: 0 0 auto;
    color: #080808;
    opacity: 0;
    transform: translateX(-10px);
    transition: opacity 240ms ease, transform 240ms ease;
  }

  .login-arrow::before,
  .login-arrow::after {
    position: absolute;
    top: 50%;
    right: 0;
    content: '';
    background: currentColor;
    transform-origin: left center;
    transition: transform 240ms ease;
  }

  .login-arrow::before {
    left: 0;
    height: 5px;
    transform: translateY(-50%) scaleX(0);
  }

  .login-arrow::after {
    width: 15px;
    height: 15px;
    border-top: 5px solid currentColor;
    border-right: 5px solid currentColor;
    background: transparent;
    transform: translateY(-50%) rotate(45deg) scale(0);
    transform-origin: center;
  }

  .login-button:not(.login-button--waiting):hover .login-arrow,
  .login-button:not(.login-button--waiting):focus-visible .login-arrow {
    opacity: 1;
    transform: translateX(0);
  }

  .login-button:not(.login-button--waiting):hover .login-arrow::before,
  .login-button:not(.login-button--waiting):focus-visible .login-arrow::before {
    transform: translateY(-50%) scaleX(1);
  }

  .login-button:not(.login-button--waiting):hover .login-arrow::after,
  .login-button:not(.login-button--waiting):focus-visible .login-arrow::after {
    transform: translateY(-50%) rotate(45deg) scale(1);
  }

  .login-button:focus-visible {
    outline: 2px solid rgba(8, 8, 8, 0.72);
    outline-offset: 8px;
  }

  @keyframes login-pulse {
    0%,
    100% {
      color: #080808;
    }

    50% {
      color: rgba(8, 8, 8, 0.42);
    }
  }

  .barcode-row {
    display: flex;
    gap: 10px;
    align-items: center;
    color: #080808;
    font-family: monospace;
    font-size: clamp(1.2rem, 2vw, 2rem);
    line-height: 1;
  }

  .barcode {
    width: clamp(92px, 7vw, 140px);
    height: 28px;
    background: repeating-linear-gradient(90deg, #080808 0 4px, transparent 4px 8px);
  }

  .crosshair {
    font-size: 2rem;
  }

  .camera-dot {
    width: 28px;
    aspect-ratio: 1;
    background: radial-gradient(circle, #ee5e0e 0 22%, #080808 24% 100%);
  }

  .signal {
    width: 30px;
    height: 18px;
    border-top: 5px solid #080808;
    border-bottom: 5px solid #080808;
  }

  .escape-row {
    position: absolute;
    bottom: clamp(38px, 6vw, 76px);
    left: clamp(36px, 6vw, 86px);
    display: flex;
    gap: 12px;
    align-items: center;
    color: rgba(0, 0, 0, 0.7);
    font-family: monospace;
    font-size: clamp(0.88rem, 1.2vw, 1.3rem);
    text-transform: uppercase;
  }

  kbd {
    padding: 2px 4px;
    color: #080808;
    background: rgba(255, 255, 255, 0.56);
    border: 1px solid rgba(0, 0, 0, 0.42);
    border-radius: 3px;
    box-shadow: inset 0 -2px rgba(0, 0, 0, 0.2);
  }

  .hud {
    position: absolute;
    z-index: 3;
    color: rgba(238, 94, 14, 0.78);
    font-family: monospace;
    pointer-events: none;
  }

  .hud--right {
    right: 10px;
    bottom: 10px;
    display: grid;
    color: rgba(113, 246, 255, 0.72);
    text-align: right;
  }

  .hud--float {
    position: fixed;
    top: 48%;
    left: 75%;
    display: flex;
    font-size: 3rem;
  }

  .placeholder-section {
    display: grid;
    gap: 16px;
    min-height: 72vh;
    padding: clamp(36px, 7vw, 96px);
    place-content: center start;
    background: #10141d;
    color: #f4f7fb;
  }

  .placeholder-section p {
    max-width: 620px;
    margin: 0;
    color: rgba(244, 247, 251, 0.68);
    font-size: clamp(1rem, 1.6vw, 1.35rem);
  }

  .placeholder-section h2 {
    max-width: 820px;
    margin: 0;
    font-size: clamp(2rem, 5vw, 5rem);
    line-height: 0.95;
    letter-spacing: 0;
  }

  @media (max-width: 900px) {
    .launch-hero {
      min-height: 100svh;
    }

    .orange-panel {
      width: 72vw;
      padding: 32px 24px;
    }

    .logo-tab {
      top: 45%;
      width: 96px;
    }

    .brand-lockup {
      gap: 8px;
    }

    .brand-lockup h1 {
      font-size: clamp(3rem, 16vw, 7rem);
      writing-mode: vertical-rl;
      text-orientation: mixed;
    }

    .orange-panel__center {
      right: 76px;
    }

    .login-form {
      top: 48%;
      left: 24px;
      grid-template-columns: 18px minmax(0, 1fr);
      gap: 14px;
      width: calc(100vw - 48px);
    }

    .login-field input {
      height: 48px;
    }

    .start-panel,
    .escape-row {
      left: 24px;
    }

    .hud--float {
      right: 5vw;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cursor-ident__ring,
    .cursor-ident__ring::before,
    .cursor-ident__ring::after,
    .cursor-ident__core {
      animation: none;
    }
  }
</style>
