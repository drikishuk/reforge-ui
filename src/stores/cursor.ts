import { defineStore } from 'pinia'

type CursorTone = 'black' | 'white'

export const useCursorStore = defineStore('cursor', {
  state: () => ({
    tone: 'black' as CursorTone,
  }),

  getters: {
    isWhite: state => state.tone === 'white',
  },

  actions: {
    setCursorTone (tone: CursorTone) {
      this.tone = tone
    },

    setCursorWhite () {
      this.setCursorTone('white')
    },

    setCursorBlack () {
      this.setCursorTone('black')
    },

    toggleCursorTone () {
      this.tone = this.isWhite ? 'black' : 'white'
    },
  },
})
