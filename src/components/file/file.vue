<template>
  <Card>
    <div>
      <div slot="title" style="padding-bottom: 30px;">
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

      <Card>
        <!--外div稍微大一点以放置上传列表-->
        <div :style="{height: defaultHeight+100+'px'}" style="clear:both">       
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
                    <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                    <p>{{ $t('uploadTips') }}</p>
                  </div>
                </div>
              </Upload>        
            </div>
          </Row>
        </div>
      </Card>

      
      <Modal v-model="createDirFlag" width="50%" :closable="false">
        <div>
           <Input v-model="createDirName" :placeholder="$t('inputFilenameTips')" clearable/>
        </div>
        <div slot="footer">
          <Button type="primary"  @click="realCreateDir">{{ $t('create') }}</Button>
        </div>
      </Modal>

    </div>
  </Card>
  

</template>

<script>
// import axios from 'axios'
import file from '@/api/file'
import util from '@/libs/util'
import fileList from './components/fileList.vue'
export default {
  components: {
    fileList
  },
  data () {
    return {
      baseurl: this.$store.getters.sessionGet('baseurl'),
      currentDirs: [],
      currentFiles: [],
      currentPath: '/',
      fullCurrentPath: '',
      createDirFlag: false,
      createDirName: '',
      myheader: {
        'Authorization': sessionStorage.getItem('jwt')
      },
      defaultHeight: 600,
      changeHeight: 0
    }
  },
  computed: {
    uploadUrl () {
      return this.baseurl + '/file/?path=' + this.currentPath
    },
    // downloadUrlRoot () {
    //   return this.baseurl + '/file/download?file=' + this.currentPath
    // },
  },
  methods: {
    // clearFiles () {
    //   this.$refs.upload.clearFiles();
    // },
    refresh (f) {
      util.notice(this, f.msg, 'info')
      this.getFileInfo(this.currentPath)
    },
    realCreateDir () {
      // this.createDirName = this.createDirName.trim()
      if (this.createDirName === '') {
        this.$Message.error(this.$t('shouldNotEmpty'))
      } else if (util.existSpace(this.createDirName)) {
        this.$Message.error(this.$t('shouldNoSpaceLR'))
      } else {
        this.createDirFlag = false
        let path = this.currentPath + '/' + this.createDirName
        path = path.replace('//','/')
        this.$Message.success(this.$t('commitBegin'))
        // axios.get(`${this.baseurl}/file/create?path=${path}`)
        file.createPath(path)
          .then(res => {
            // console.log(res.data)
            if (res.data['status'] > 0) {
              this.getFileInfo(path)
            } else {
              util.notice(this, res.data['msg'], 'error')
            }
          }).catch(error => {
            util.notice(this, error, 'error')
          });
      }
    },
    changedir (folder) {
      this.currentPath = this.currentPath + '/' +folder
      this.getFileInfo(this.currentPath)
    },
    copypath (filename) {
      let fullpath = this.fullCurrentPath + '/' + filename
      fullpath = fullpath.replace('///','/')
      fullpath = fullpath.replace('//','/')
      fullpath = fullpath.replace('/./','/')
      util.copy(this,fullpath)
    },
    download(filename) {
      file.download(this.currentPath+'/'+filename)
        .then(res => {
          util.notice(this, filename+' downloading...', 'fast')
          let blob = new Blob([res.data])
          util.downloadBlob(blob,filename)
        }).catch(error => {
          util.notice(this, error, 'error')
        })
    },
    gobackdir () {
      this.currentPath = this.currentPath
      if (this.currentPath != '/' && this.currentPath != '') {
        this.currentPath = util.getPrePath(this.currentPath)
      } else {
        util.notice(this, this.$t('noPreDirTips'), 'info')
      }
      this.getFileInfo(this.currentPath)
    },
    getFileInfo (path){
      // axios.get(`${this.baseurl}/file/list?path=${path}`)
      // let prePath = path
      file.getFileList(path)
        .then(res => {
          if (res.data['status'] > 0) {
            this.currentFiles = res.data['files']
            this.currentDirs = res.data['dirs']
            this.currentPath = path.replace('//','/')
            sessionStorage.setItem('fileCurrentPath',this.currentPath)
            this.fullCurrentPath = res.data['path']
            this.changeHeight = (this.currentFiles.length+this.currentDirs.length)*32
            // console.log(this.changeHeight)
          } else {
            util.notice(this, res.data['msg'], 'error')
          }
        }).catch(error => {
          // this.currentPath = prePath
          util.notice(this, error, 'error')
        });
    }
  },
  mounted () {
    let p = sessionStorage.getItem('fileCurrentPath')
    if ( p ){
      this.currentPath = p
    }
    this.getFileInfo(this.currentPath)
    // 页面渲染完成后的回调
    // this.$nextTick(()=>{ 
    // })
  }
};
</script>