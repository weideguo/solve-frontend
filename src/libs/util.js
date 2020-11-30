import axios from 'axios'
import { Base64 } from 'js-base64'
// import VueI18n from 'vue-i18n'

let util = {}

// iview方法二次封装
util.validatorGenerator = function(constrict) {
  return function(rule, value, callback) {
    // console.log(value, rule, constrict)
    if ( value instanceof Date){
      // 为时间时
      callback()
    }else if ((typeof constrict) === 'string') {
      let reg = new RegExp(constrict)
      if (value.search(reg) < 0) {
        callback(new Error('RegExp: '+constrict))
      } else {
        callback()
      }
    } else if ( value === undefined ) {
      callback(new Error('should not empty'))
    } else if ( value.length === 0 ) {
      callback(new Error('should not empty'))
    } else if (util.existSpace(value)) {
      callback(new Error('should no space in left and right'))
    } else {
      callback()
    }
  }

}

util.checkLogin = function (vm,error) {
  // console.log(error.response)
  if (error.response != undefined) {
    // 网络请求时则存在状态码
    if ( error.response.status === 401 ) {
      // 401 权限错误
      vm.$Message.error('Unauthorized')
      util.openPage(vm,'login')
    } else if ( error.response.status === 429 ) {
      // console.log(error.response)
      let msg=error.response.data['detail']
      if ( msg != undefined ) {
        vm.$Notice.error({title: 'ERROR', desc: msg})
      } else {
        vm.$Notice.error({title: 'ERROR', desc: error})
      }
    } else { 
      let e=error.response.data
      if ( e != '' ) {
        error=e
      } 
      vm.$Notice.error({title: 'ERROR', desc: error})
    }
  } else {
    vm.$Notice.error({title: 'ERROR', desc: error})
    /*
    try {
      let userinfo = JSON.parse(Base64.decode(sessionStorage.getItem('jwt').split('.')[1]+'==').split(' ')[0])
      console.log(userinfo)
      if (userinfo['exp']*1000 < (new Date()).getTime()) {
        console.log(userinfo['exp'])
        vm.$Message.error('登陆已经过期，请重新登陆')
        util.openPage(vm,'login')
      } else {
        vm.$Notice.error({title: 'ERROR', desc: error})
      }
    } catch (err) {
      vm.$Message.error('解析jwt失败，请重新登陆')
      util.openPage(vm,'login')
    }
    */
  }
}

util.notice = function (vm, error, level) {
  if (level === 'info') {
    vm.$Notice.info({title: 'INFO', desc: error})
  } else if (level === 'success') {
    vm.$Notice.success({title: 'SUCCESS', desc: error})
  } else if (level === 'warning') {
    vm.$Notice.warning({title: 'WARN', desc: error})
  } else if (level === 'error') {
    // vm.$Notice.error({title: 'ERROR', desc: error})
    // 在此判断登录是否过期 因为每后端请求都会有错误捕获 然后跳转到login？
    util.checkLogin(vm,error)
  } else if (level === 'fast') {
    vm.$Notice.info({title: 'INFO', desc: error, duration: 1})
  }
}

// 打开前的页面调用
util.openPage = function (vm, name) {
  vm.$router.push({name: name})
  vm.$store.commit('setTagBreadBeforeOpen', name);
}

util.openPageEx = function (vm, name, query) {
  vm.$router.push({name: name, query: query})
  vm.$store.commit('setTagBreadBeforeOpen', name);
}
//////////////////////////////////////////////////////////////
// 需要调用iview的函数

// 由url下载文件
util.download = function(vm, url, filename) {
  axios.defaults.headers.common['Authorization'] = sessionStorage.getItem('jwt')
  axios.get(url, {responseType: 'blob'})
    .then(res => {
      util.notice(vm, filename+' downloading...', 'fast')
      let blob = new Blob([res.data])
      let downloadElement = document.createElement('a');
      let href = window.URL.createObjectURL(blob);       
      downloadElement.href = href;
      downloadElement.download = filename;        
      document.body.appendChild(downloadElement);
      downloadElement.click();                           
      document.body.removeChild(downloadElement);        
      window.URL.revokeObjectURL(href);
    }).catch(error => {
      util.notice(vm, error, 'error')
    })
}

// 复制数据到粘贴板
util.copy = function (vm, data) {
  let myInput = document.createElement('input');
  myInput.value = data;
  document.body.appendChild(myInput);
  myInput.select();                               
  document.execCommand('copy')
  vm.$Message.info({'content':'path past success'})
  document.body.removeChild(myInput);
}

//////////////////////////////////////////////////////////

util.existSpace = function (s) {
  let r = s.slice(-1)
  let l = s.slice(0,1)
  if (r===' ' || l===' ') {
    return true
  } else {
    return false
  }
}

util.listDelete = function (list, delitem) {
  list.forEach((item, i) => {
    if(item === delitem){
      list.splice(i, 1)
    }
  })
  return list
}

util.listCombine = function (list1, list2) {
  list2.forEach((item, i) => {
    if ( list1.indexOf(item) < 0 ) {
      list1.push(item)
    }
  })
  return list1
}

util.formatDate = function (ts) {
  function p (s) {
       return s < 10 ? '0' + s : s;
  }
  let d = new Date(ts * 1000)
  let date = (d.getFullYear()) + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  return date
}

util.dictDeepCopy = function (dict) {
  return JSON.parse(JSON.stringify(dict))
}

util.dict2arry = function (dict, ktag='key', vtag='value',sort=[]) {
  let arr = [];
  let i = 0;
  sort.forEach((item,j) => {
     if (typeof(dict[item]) != 'undefined') { 
        arr[i] = {}
        arr[i][ktag] = item
        arr[i][vtag] = dict[item];
        delete dict[item]
        i = i + 1
     }
  })
  for (let k in dict) {
    arr[i] = {}
    arr[i][ktag] = k
    arr[i][vtag] = dict[k];
    i = i + 1
  }
  return arr
}

util.arry2dict = function (arr, ktag='key', vtag='value') {
  let dict = {};
  for (let i in arr) {
    let x = arr[i][vtag];
    if (x) {
      dict[arr[i][ktag]] = x
    } else {
      dict[arr[i][ktag]] = ''
    }
  }
  return dict
}

util.dictKeys = function (dict) {
  let keys = []
  for (let k in dict) {
    keys.push(k)
  }
  return keys
},

// 序列化与反序列化
util.formatDict = function (dict,padding='###') {
  let result=''
  for (let k in dict) {
    result += padding+k+padding+'\n'+dict[k]+'\n\n'
  }
  return result.slice(0,-2)
}

util.parseString2Dict = function  (string,boolean_key=[],padding='###', ) {
  let result = {}
  let block_list = string.split('\n\n'+padding)
  block_list[0] = block_list[0].slice(3)
  console.log(block_list)
  for (let i in block_list) {
    //console.log(block_list[i])
    let pair = block_list[i].split('###\n')
    let k = pair[0]
    let v =  pair[1]
    if (boolean_key.indexOf(k)>=0) {
      if (v === 'true' || v === '1') {
        v= Boolean(1) 
      }else{
        v= Boolean(0)    
      }
    }
    
    result[k] = v
  }
  return result
}
///////////////////////////////

// url解析参数成字典
util.parseUrlParams = function (location) {
  if (location.search.length <= 0) return {};
  let info = location.search.slice(1)
  let result = {}
  info.split('&').forEach((item,i) => {
    result[decodeURIComponent(item.split('=')[0])] = decodeURIComponent(item.split('=')[1])
  })
  return result
}

// 根据字符串以下划线分割构成树结构
util.getUniq = function (rawlist, prefix) {
  let uniqlist = []
  rawlist.forEach((val, index) => {
    if (val.indexOf(prefix) === 0) {
      let valx = val.replace(RegExp('^' + prefix), '')
      let x = valx.split('_')[0]
      if (uniqlist.indexOf(x) < 0) {
        uniqlist.push(x)
      }
    }
  })
  return uniqlist.sort()
}

util.getTreeStruct = function (rawlist, selectedItem, childrenlist, parentNode) {
  childrenlist.forEach((val, index) => {
    let i = val.split('_')
    let nexParentNode = {}
    let nextChildrenlist = []
    let x = util.getUniq(rawlist, val + '_')
    x.forEach((ival, index) => {
      nextChildrenlist.push(val + '_' + ival)
    })
    if (x.length) {
      nexParentNode = {
          title: i[i.length - 1],
          loading: false,
          children: []
        }
    } else {
      if (selectedItem.indexOf(val) < 0) {
        nexParentNode = {
          title: i[i.length - 1]
        }
      } else {
        // console.log(val)
        nexParentNode = {
          title: i[i.length - 1],
          checked: true
        }
      }
    }
    let nextNode = util.getTreeStruct(rawlist, selectedItem, nextChildrenlist, nexParentNode)
    parentNode['children'].push(nextNode)
  })
  return parentNode
}

util.formateTreeData = function (rawlist, selectedItem) {
  let secondList = util.getUniq(rawlist, '')
  // console.log(y)
  let rootNode = {
            title: '/',
            loading: false,
            expand: true,
            children: []
          }
  return util.getTreeStruct(rawlist, selectedItem, secondList, rootNode)
}
/////////////////////////

// 广度优先实现获取状态为checked的叶子节点
util.checkedLeaf = []

util.getLeaf = function (parent, prefixTitle, nextNodes) {
  if (nextNodes) {
    nextNodes.forEach((val, index) => {
      let fulltitle = prefixTitle + '_' + val.title
      util.getLeaf(val, fulltitle, val.children)
    })
  } else {
    if (parent.checked) {
      util.checkedLeaf.push(prefixTitle.split('/_/_')[1])
      // console.log(util.checkLead)
    }
  }
  return util.checkedLeaf
}

util.getCheckedLeaf = function (treeData) {
  util.checkedLeaf = []
  let p = {title: '/'}
  let checkedLeaf = util.getLeaf(p, p.title, treeData)
  return checkedLeaf
}
///////////////////////////

//文件操作
util.write = function (string, filename, filetype='text/plain') {
  var blob;
  if (typeof window.Blob == 'function') {
    blob = new Blob([string], {type: filetype});

  } else {
    // 旧版本的支持
    var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder;
    var bb = new BlobBuilder();
    bb.append(string);
    blob = bb.getBlob(filetype);

  }
  var URL = window.URL || window.webkitURL;
  var bloburl = URL.createObjectURL(blob);
  var anchor = document.createElement('a');
  
  if ('download' in anchor) {
    // 添加隐藏元素触发下载
    anchor.style.visibility = 'hidden';
    anchor.href = bloburl;
    anchor.download = filename;

    document.body.appendChild(anchor);

    var evt = document.createEvent('MouseEvents');
    evt.initEvent('click', true, true);

    anchor.dispatchEvent(evt);
    document.body.removeChild(anchor);

  } else if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, filename);
  } else {
    location.href = bloburl;
  }
}

util.read = function (blobfile,accepttype=['text/plain']) {
  // 异步读 
  return new Promise(function(resolve, reject) {
    let reader = new FileReader();
    if (accepttype.indexOf(blobfile.type)>=0) {
      reader.readAsText(blobfile);
      reader.onload = function(e, rs) {
        resolve(e.target.result);
      };
    }else{
      reject(blobfile.type+' is not a validated type')
    }
  });
}
///////////////////////////////

export default util
