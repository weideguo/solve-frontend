import config from '@/config/config'
import axios from 'axios'
import { Base64 } from 'js-base64'

let util = {}

util.platformname = config.platformname

util.title = function (title) {
  if (title) {
    title = util.platformname + ' - ' + title
  } else {
    title = util.platformname
  }
  window.document.title = title
}

util.existSpace = function (s) {
  let r = s.slice(-1)
  let l = s.slice(0,1)
  if (r===" " || l===" "){
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
    list1.push(item)
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

util.checkLogin = function (vm) {
  try {
    let userinfo = JSON.parse(Base64.decode(sessionStorage.getItem('jwt').split('.')[1]+"==").split(" ")[0])
    console.log(userinfo)
    if (userinfo['exp']*1000 < (new Date()).getTime()) {
      console.log(userinfo['exp'])
      vm.$Message.error('登陆已经过期，请重新登陆')
      util.openPage(vm,'login')
    }
  } catch (err) {
    vm.$Message.error('解析jwt失败，请重新登陆')
    util.openPage(vm,'login')
  }
}

util.notice = function (vm, desc, level) {
  if (level === 'info') {
    vm.$Notice.info({title: '通知', desc: desc})
  } else if (level === 'success') {
    vm.$Notice.success({title: '执行成功', desc: desc})
  } else if (level === 'warning') {
    vm.$Notice.warning({title: '警告', desc: desc})
  } else if (level === 'error') {
    vm.$Notice.error({title: '错误', desc: desc})
    // 在此判断登录是否过期 因为每后端请求都会有错误捕获 然后跳转到login？
    util.checkLogin(vm)
  } else if (level === 'fast') {
    vm.$Notice.info({title: '通知', desc: desc, duration: 1})
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
  return uniqlist
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

util.copy = function (vm, data) {
  let myInput = document.createElement('input');
  myInput.value = data;
  document.body.appendChild(myInput);
  myInput.select();                               
  document.execCommand("copy")
  vm.$Message.info({'content':'路径信息已经复制'})
  document.body.removeChild(myInput);
}

util.download = function(vm, url, filename) {
  axios.get(url, {responseType: 'blob'})
    .then(res => {
      util.notice(vm, filename+' 下载中...', 'fast')
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

util.noLeftAndRightSpaceCheck = function(rule, value, callback) {
  if (util.existSpace(value)) {
    callback(new Error('左右不能存在空格'))
  } else if ( ((typeof value) === 'object') && ( value.length === 0 )) {
    callback(new Error('不能为空'))
  } else {
    callback()
  }
}

util.validatorGenerator = function(constrict) {
  return function(rule, value, callback) {
    if ((typeof constrict) === 'string') {
      let reg = new RegExp(constrict)
      if (value.search(reg) < 0) {
        callback(new Error('需要符合正则表达式 '+constrict))
      } else {
        callback()
      }
      console.log(constrict)
    } else if (util.existSpace(value)) {
      callback(new Error('左右不能存在空格'))
    } else if ( ((typeof value) === 'object') && ( value.length === 0 )) {
      callback(new Error('不能为空'))
    } else {
      callback()
    }
  }

}

export default util
