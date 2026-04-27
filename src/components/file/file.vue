<template>
  <Card>
    <div>
      <div style="padding-bottom: 30px;">
        <div style="float:left">
          <Button  type="info" @click="createDirFlag = true">{{ $t('createDir') }}</Button>
          <Button  type="success" @click="gobackdir" style="margin-left: 0.2vw">{{ $t('preDir') }}</Button>
        </div>
        <div style="float:left;padding:5px">
          <p v-if="currentPath === ''" > | /</p>
          <p v-else> | {{currentPath}}</p>
        </div>
      </div>
      
      <br/>

      <!--外div稍微大一点以放置上传列表-->
      <div :style="{height: (defaultHeight > changeHeight ? defaultHeight : changeHeight)+100+'px'}" style="clear:both">       
        <Row>
          <div style="z-index: 1;">
            <file-list v-for="(item, i) in currentDirs" :key="item" :introText="item" listType="dir" @changedir="changedir">
            </file-list>
            <file-list v-for="(item, i) in currentFiles" :key="item" :introText="item" listType="file" @copypath="copypath" @download="download">
            </file-list>
            <!--div style="height:10vh">&ensp;</div-->
          </div>
          
          <div style="position:absolute;width: 98%">
            <Upload multiple type="drag" :action="uploadUrl" :headers='myheader' :on-success="refresh" ref="upload"> 
              <div :style="{height: (defaultHeight > changeHeight ? defaultHeight : changeHeight)+'px'}">
                <div style="margin-left: 30%" :style="{paddingTop: (defaultHeight > changeHeight ? defaultHeight/2 : changeHeight/2)+'px'}">
                  <Icon type="md-cloud-upload" size="52" style="color: #3399ff"></Icon>
                  <p>{{ $t('uploadTips') }}</p>
                </div>
              </div>
            </Upload>        
          </div>
        </Row>
      </div>
      
      <Modal v-model="createDirFlag" width="50%" :closable="false">
        <div>
           <Input v-model="createDirName" :placeholder="$t('inputFilenameTips')" clearable/>
        </div>
        <template #footer>
          <Button type="primary"  @click="realCreateDir">{{ $t('create') }}</Button>
        </template>
      </Modal>

    </div>
  </Card>
  

</template>

<script setup>
  //
  import { ref, computed, onMounted, getCurrentInstance } from 'vue'
  import { useI18n } from 'vue-i18n'
  import file from '@/api/file'
  import util from '@/libs/util'
  import fileList from './components/fileList.vue'
  
  const { t } = useI18n()
  const { proxy } = getCurrentInstance()
  
  const baseurl = ref(sessionStorage.getItem('baseurl'))
  const currentDirs = ref([])
  const currentFiles = ref([])
  const currentPath = ref('/')
  const fullCurrentPath = ref('')
  const createDirFlag = ref(false)
  const createDirName = ref('')
  const myheader = ref({
    'Authorization': sessionStorage.getItem('jwt')
  })
  const defaultHeight = ref(600)
  const changeHeight = ref(0)
  
  const uploadUrl = computed(() => {
    return baseurl.value + '/file/?path=' + currentPath.value
  })
  
  const refresh = (f) => {
    util.notice(proxy, f.msg, 'info')
    getFileInfo(currentPath.value)
  }
  
  const realCreateDir = () => {
    if (createDirName.value === '') {
      proxy.$Message.error(t('shouldNotEmpty'))
    } else if (util.existSpace(createDirName.value)) {
      proxy.$Message.error(t('shouldNoSpaceLR'))
    } else {
      createDirFlag.value = false
      let path = currentPath.value + '/' + createDirName.value
      path = path.replace('//','/')
      proxy.$Message.success(t('commitBegin'))
      file.createPath(path)
        .then(res => {
          if (res.data['status'] > 0) {
            getFileInfo(path)
          } else {
            util.notice(proxy, res.data['msg'], 'error')
          }
        }).catch(error => {
          util.notice(proxy, error, 'error')
        })
    }
  }
  
  const changedir = (folder) => {
    currentPath.value = currentPath.value + '/' + folder
    getFileInfo(currentPath.value)
  }
  
  const copypath = (filename) => {
    let fullpath = fullCurrentPath.value + '/' + filename
    fullpath = fullpath.replace('///','/')
    fullpath = fullpath.replace('//','/')
    fullpath = fullpath.replace('/./','/')
    // util.copy(proxy, fullpath)
    util.copyData(fullpath)
    proxy.$Message.info({'content': t('path copy success')})
  }
  
  const download = (filename) => {
    file.preDownload()
      .then(res => {
        util.notice(proxy, filename + ' downloading...', 'fast')
        if (res.data['status'] > 0 ) {
          let downloadUrl = `${baseurl.value}/fileDownload?file=${currentPath.value}/${filename}&temp_token=${res.data['temp_token']}`
          util.downloadUrl(downloadUrl)
        } else {
          util.notice(proxy, res.data['msg'], 'error')
        }
      }).catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  const gobackdir = () => {
    if (currentPath.value != '/' && currentPath.value != '') {
      currentPath.value = util.getPrePath(currentPath.value)
    } else {
      util.notice(proxy, t('noPreDirTips'), 'info')
    }
    getFileInfo(currentPath.value)
  }
  
  const getFileInfo = (path) => {
    file.getFileList(path)
      .then(res => {
        if (res.data['status'] > 0) {
          currentFiles.value = res.data['files']
          currentDirs.value = res.data['dirs']
          currentPath.value = path.replace('//','/')
          sessionStorage.setItem('fileCurrentPath', currentPath.value)
          fullCurrentPath.value = res.data['path']
          changeHeight.value = (currentFiles.value.length + currentDirs.value.length) * 32
        } else {
          util.notice(proxy, res.data['msg'], 'error')
        }
      }).catch(error => {
        util.notice(proxy, error, 'error')
      })
  }
  
  onMounted(() => {
    let p = sessionStorage.getItem('fileCurrentPath')
    if ( p ){
      currentPath.value = p
    }
    getFileInfo(currentPath.value)
  })
</script>