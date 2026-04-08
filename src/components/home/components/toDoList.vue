<template>
  <Card :style="{height: cardHeight}" style="width:100%">
    <template #title>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <p>
          <Icon type="md-checkbox-outline"></Icon>
          {{ $t('todoTitle') }}
        </p>
        <div style="width: 100px">
          <a type="text" slot="extra" @click.prevent="todoUp()">
            <Icon type="md-arrow-up"></Icon>
          </a>
          <a type="text" slot="extra">&nbsp; &nbsp;</a>
          <a type="text" slot="extra" @click.prevent="todoDown()">
            <Icon type="md-arrow-down"></Icon>
          </a>
          <a type="text" slot="extra">&nbsp; &nbsp;</a>
          <a type="text" slot="extra" @click.prevent="showAddNewTodo=!showAddNewTodo">
            <Icon type="md-add"></Icon>
          </a>
        </div>
      </div>
    </template>

    <!--使用:key可以实现在列表变动时 对应列表元素的状态可以保存-->
    <div v-for="(item, index) in toDoList" :key="item.title">
      <Row>
        <Col span="2">
          <Checkbox v-model="item.status"></Checkbox>
        </Col>
        <Col span="22">
          <p  @dblclick="delTodo(item)" >{{ item.title }}</p>
        </Col>
      </Row>
    </div>
    <Modal v-model="showAddNewTodo" :title="$t('addTodoTitle')" @on-ok="addTodo">
      <Input v-model="newToDoItemValue" icon="md-checkbox-outline" :placeholder="$t('inputTips')" style="width: 100%" clearable/>
    </Modal>
  </Card>
</template>


<script setup>
  //
  import { ref, onMounted, getCurrentInstance } from 'vue'
  import { useI18n } from 'vue-i18n'
  
  const props = defineProps({
    cardHeight: {
      type: String,
      default: '300px'
    }
  })
  
  const { t } = useI18n()
  const { proxy } = getCurrentInstance()
  
  const toDoList = ref([])
  const todoitem = ref(false)
  const showAddNewTodo = ref(false)
  const newToDoItemValue = ref('')
  
  const getTodo = () => {
    toDoList.value = [{'title': ''}]
    let todos = JSON.parse(localStorage.getItem('todolist'))
    if (todos && Array.isArray(todos)) {
      todos.forEach((title, index) => {
        if (title != '') {
          toDoList.value.push({'title': title, 'status': false})
        }
      })
    }
    toDoList.value.splice(0, 1)
  }
  
  const addTodo = () => {
    if (newToDoItemValue.value.length !== 0) {
      let todolist = JSON.parse(localStorage.getItem('todolist'))
      if (todolist === null) {
        todolist = []
      }
      todolist = [newToDoItemValue.value].concat(todolist)
      localStorage.setItem('todolist', JSON.stringify(todolist))
      toDoList.value.unshift({
        title: newToDoItemValue.value
      })
      getTodo()
    } else {
      proxy.$Message.error(t('inputNotNull'))
    }
  }
  
  const delTodo = (item) => {
    let todolist = []
    if (item.status) {
      JSON.parse(localStorage.getItem('todolist')).forEach((title, index) => {
        if (title !== item.title) {
          todolist.push(title)
        }
      })
      localStorage.setItem('todolist', JSON.stringify(todolist))
      getTodo()
    }
  }
  
  const todoUp = () => {
    todoMove(false)
  }
  
  const todoDown = () => {
    todoMove(true)
  }
  
  const todoMove = (isDown) => {
    let oldTodolist = JSON.parse(localStorage.getItem('todolist'))
    let todolistShow = toDoList.value
    if (isDown) {
      oldTodolist = oldTodolist.reverse()
      todolistShow = todolistShow.reverse()
    }
    let newTodolist = []
    oldTodolist.forEach((title, index) => {
      let isMatch = false
      todolistShow.forEach((item, i) => {
        if (title === item.title && item.status) {
          let preTitle = newTodolist[newTodolist.length - 1]
          newTodolist = newTodolist.slice(0, -1)
          newTodolist.push(title)
          if (preTitle != undefined) {
            newTodolist.push(preTitle)
          }
          isMatch = true
        }
      })
      if (!isMatch) {
        newTodolist.push(title)
      }
    })
    if (isDown) { newTodolist = newTodolist.reverse() }
    localStorage.setItem('todolist', JSON.stringify(newTodolist))
    getTodo()
  }
  
  onMounted(() => {
    getTodo()
  })
</script>

