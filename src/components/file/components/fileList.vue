
<template>
    <div v-if="listType === 'dir'">
      <Button type="text" @click="changedir"><Icon type="md-folder" color="#FFC125" /></Button>
      <Button type="text" @click="changedir">{{introText}}</Button>
    </div>
    <div v-else>
      <Button type="text" @click="download"><Icon type="md-document" /></Button>
      <Button type="text" @click="copypath">{{introText}}</Button>
    </div>
</template>

<script setup>
  //
  
  const props = defineProps({
    introText: String,
    listType: String
  })
  
  const emit = defineEmits(['changedir', 'copypath', 'download'])
  
  const changedir = () => {
    emit('changedir', props.introText)
  }
  
  const copypath = () => {
    emit('copypath', props.introText)
  }
  
  const download = () => {
    emit('download', props.introText)
  }
</script>