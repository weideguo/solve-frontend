
<template>
    <div v-if="listType === 'dir'">
      <Button type="text" @click="changedir"><Icon type="md-folder" color="#FFC125" /></Button>
      <Button type="text" @click="changedir">{{introText}}</Button>
    </div>
    <div v-else>
      <Button type="text" @click="download"><Icon type="md-document" /></Button>
      <!--<Button type="text" @click="download" icon="md-document"></Button>-->
      <Button type="text" @click="copypath">{{introText}}</Button>
    </div>
</template>

<script>
import util from '@/libs/util'
export default {
  name: 'fileList',
  props: {
    introText: String,
    listType: String
  },
  methods: {
    changedir () {
      this.$emit('changedir', this.introText) 
    },
    copypath () {
      this.$emit('copypath', this.introText) 
    },
    download () {
      //util.download(this, this.url + '/' + this.introText, this.introText)
      this.$emit('download', this.introText) 
    }
  }
};
</script>