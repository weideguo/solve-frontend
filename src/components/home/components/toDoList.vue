<template>
  <Card :style="{height: cardHeight}">

    <p slot="title">
      <Icon type="md-checkbox-outline"></Icon>
      {{ $t('todoTitle') }}
    </p>
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

    <!--使用:key可以实现在列表变动时 对应列表元素的状态可以保存-->
    <div v-for="(item, index) in toDoList" v-if="item.title != ''"  :key="item.title">
      <Col span="2">
        <Row type="flex" justify="center" align="middle">
          <Checkbox v-model="item.status"></Checkbox>
        </Row>
      </Col>
      <Col span="22">
        <Row type="flex" justify="start" align="middle">
          <p  @dblclick="delTodo(item)" >{{ item.title }}</p>
        </Row>
      </Col>
    </div>
    <Modal v-model="showAddNewTodo" :title="$t('addTodoTitle')" @on-ok="addTodo">
      <Row type="flex" justify="center">
        <Input v-model="newToDoItemValue" icon="md-checkbox-outline" :placeholder="$t('inputTips')" style="width: 100%" clearable/>
      </Row>
    </Modal>
  </Card>
</template>


<script>
export default {
  name: 'toDoList',
  data () {
    return {
      toDoList: [{}],
      todoitem: false,
      showAddNewTodo: false,
      newToDoItemValue: ''
    };
  },
  props: {
    cardHeight: {
      type: String,
      default: '300px'
    }
  },
  methods: {
    getTodo () {
      this.toDoList = [{'title': ''}];  // 如果为空 从零添加会导致首次渲染异常
      let todos = JSON.parse(localStorage.getItem('todolist'))
      if (todos) {
        todos.forEach((title, index) => {
          this.toDoList.push({'title': title, 'status':false})
        })
      }
      // this.$router.push({name: 'myhome'})
      // console.log(this.toDoList);
    },
    addTodo () {
      if (this.newToDoItemValue.length !== 0) {
        let todolist = JSON.parse(localStorage.getItem('todolist'));
        if (todolist === null) {
          todolist = []
        }
        todolist = [this.newToDoItemValue].concat(todolist);
        localStorage.setItem('todolist', JSON.stringify(todolist))
        this.toDoList.unshift({
          title: this.newToDoItemValue
        })
        this.getTodo()
      } else {
        this.$Message.error(this.$t('inputNotNull'))
      }
    },
    delTodo (item) {
      let todolist = []
      if (item.status) {
        JSON.parse(localStorage.getItem('todolist')).forEach((title, index) => {
          if (title !== item.title) {
            todolist.push(title)
          }
        })
        localStorage.setItem('todolist', JSON.stringify(todolist));
        this.getTodo();
      }
    },
    todoUp () {
        this.todoMove(false) 
    },
    todoDown () {
        this.todoMove(true) 
    },
    todoMove (isDown) {
        // isDown=true 实现反向操作
        let oldTodolist = JSON.parse(localStorage.getItem('todolist'))
        let todolistShow = this.toDoList
        if (isDown) { 
            oldTodolist = oldTodolist.reverse() 
            todolistShow = todolistShow.reverse() 
        }
        let newTodolist = []
        oldTodolist.forEach((title, index) => {
            let isMatch = false
            todolistShow.forEach((item, i) => {
                if (title === item.title &&  item.status) {
                    let preTitle = newTodolist[newTodolist.length-1]
                    newTodolist = newTodolist.slice(0,-1)
                    newTodolist.push(title)
                    if (preTitle != undefined) {
                        newTodolist.push(preTitle)
                    }
                    isMatch  = true
                }
            })
            if (!isMatch) {
                newTodolist.push(title)
            }
            
        })
        if (isDown) { newTodolist = newTodolist.reverse() }
        localStorage.setItem('todolist', JSON.stringify(newTodolist))
        this.getTodo()
    },
  },
  mounted () {
    this.getTodo()
  }
};
</script>

