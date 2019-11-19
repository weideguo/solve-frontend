<template>
  <Card :style="{height: cardHeight}">

    <p slot="title">
      <Icon type="md-checkbox-outline"></Icon>
      待办事项
    </p>
    <a type="text" slot="extra" @click.prevent="showAddNewTodo=!showAddNewTodo">
      <Icon type="md-add"></Icon>
    </a>

    <!--使用:key可以实现在列表变动时 对应列表元素的状态可以保存-->
    <div v-for="(item, index) in toDoList" v-if="item.title != ''"  :key="item.title">
      <Col span="2">
        <Row type="flex" justify="center" align="middle">
          <Checkbox></Checkbox>
        </Row>
      </Col>
      <Col span="22">
        <Row type="flex" justify="start" align="middle">
          <p  @dblclick="delTodo(item.title)" >{{ item.title }}</p>
        </Row>
      </Col>
    </div>
    <Modal v-model="showAddNewTodo" title="添加新的待办事项" @on-ok="addTodo">
      <Row type="flex" justify="center">
        <Input v-model="newToDoItemValue" icon="md-checkbox-outline" placeholder="请输入..." style="width: 100%" clearable/>
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
      let x = JSON.parse(localStorage.getItem('todolist'))
      if (x) {
        x.forEach((val, index) => {
          this.toDoList.push({'title': val})
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
        this.$Message.error('请输入待办事项内容')
      }
    },
    delTodo (val) {
      let todolist = []
      JSON.parse(localStorage.getItem('todolist')).forEach((valx, index) => {
        if (valx !== val) {
          todolist.push(valx)
        }
        })
      localStorage.setItem('todolist', JSON.stringify(todolist));
      this.getTodo();
    }
  },
  mounted () {
    this.getTodo()
  }
};
</script>

