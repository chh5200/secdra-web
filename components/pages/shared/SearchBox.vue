<template>
  <form class="search-box" @submit.prevent="search">
    <Field
      v-model="tag"
      v-popover:history
      color="primary"
      placeholder="请输入标签搜索"
      shadow
      big
    >
      <template #right>
        <Btn v-tooltip="`搜索`" flat icon type="submit" @click.stop="() => {}">
          <i class="icon ali-icon-search"></i>
        </Btn>
      </template>
    </Field>
    <Popper
      ref="history"
      trigger="click"
      click-reference-keep
      @show="showHistory"
      @hide="hideHistory"
    >
      <ul class="history-box">
        <template v-for="(item, index) in searchHistoryReverse">
          <li
            v-if="index < historyThreshold"
            :key="index"
            :class="{ active: index === searchHistoryIndex }"
          >
            <nuxt-link
              v-ripple
              :to="`/picture/search/${encodeURIComponent(item)}`"
            >
              {{ item }}
            </nuxt-link>
          </li>
        </template>
      </ul>
    </Popper>
  </form>
</template>

<script>
import storageUtil from "../../../assets/script/util/storageUtil"
import { off, on } from "../../../assets/script/util/domUtil"

export default {
  props: {
    historyThreshold: {
      type: Number,
      default: 5
    }
  },
  data() {
    return {
      tag: "",
      searchHistory: [],
      searchHistoryIndex: -1
    }
  },
  computed: {
    searchHistoryReverse() {
      return this.searchHistory.reverse()
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.searchHistory = storageUtil.localGet("searchHistory", [])
    })
  },
  methods: {
    search() {
      if (this.tag) {
        const searchHistorySet = new Set(this.searchHistory)
        searchHistorySet.delete(this.tag)
        searchHistorySet.add(this.tag)
        this.searchHistory = storageUtil.localSet("searchHistory", [
          ...searchHistorySet
        ])
      }
      this.$router.push(`/picture/search/${encodeURIComponent(this.tag)}`)
    },
    onKey(event) {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return
      if (event.key === "ArrowUp") {
        this.searchHistoryIndex <= 0
          ? (this.searchHistoryIndex = this.searchHistory.length - 1)
          : this.searchHistoryIndex--
      } else if (event.key === "ArrowDown") {
        this.searchHistoryIndex >= this.searchHistory.length - 1
          ? (this.searchHistoryIndex = 0)
          : this.searchHistoryIndex++
      }
      this.tag = this.searchHistory[this.searchHistoryIndex]
    },
    showHistory() {
      on(document, "keydown", this.onKey)
    },
    hideHistory() {
      off(document, "keydown", this.onKey)
    }
  }
}
</script>

<style type="text/less" lang="less" scoped>
@import "../../../assets/style/color";
@import "../../../assets/style/config";
@import "../../../assets/style/mixin";

@input-size: 550px;

.search-box {
  font-size: 0;
  .input {
    width: @input-size;
  }
}

.history-box {
  width: @input-size;
  li {
    &.active,
    &:hover {
      background-color: @font-color-dark-line;
    }
    a {
      line-height: 40px;
      padding: 0 15px;
      display: block;
    }
  }
}
</style>
