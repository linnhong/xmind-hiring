<template>
  <div>
    <div class="head">
      <div>
        <div>
          <span> 选择月份 : </span>
          <el-select
            v-model="monthType"
            class="m-2 select"
            @change="getTableData"
          >
            <el-option
              v-for="{ name, value } in monthTypes"
              :key="value"
              :label="name"
              :value="value"
            />
          </el-select>
        </div>
        <span class="count"> 所选月份收入总金额 : {{ income }} </span>
        <span class="count"> 所选月份支出总金额 : {{ expense }} </span>
        <el-button type="primary" @click="dialogVisible = true"
          >添加账单</el-button
        >
      </div>
      <div>
        <span
          class="category_expense"
          v-for="{ category, amount } in expenseList"
          :key="category"
        >
          本月{{ categoriesObj[category] }}支出 : {{ amount }}
        </span>
      </div>
      <div>
        <div>
          <span> 选择账单分类 : </span>
          <el-select
            v-model="category"
            class="m-2 select"
            @change="getTableData"
          >
            <el-option
              v-for="{ name, id } in categoriesList"
              :key="id"
              :label="name"
              :value="id"
            />
          </el-select>
        </div>
      </div>
    </div>
    <el-dialog
      v-model="dialogVisible"
      title="添加账单"
      width="30%"
      :before-close="() => (dialogVisible = false)"
    >
      <el-form
        :inline="true"
        :model="newData"
        class="demo-form-inline"
        :rules="rules"
        ref="form"
        label-width="80px"
      >
        <el-form-item label="账单类型" prop="type">
          <el-select
            v-model="newData.type"
            class="m-2 input"
            @change="checkCategory(newData.type, newData.category)"
          >
            <el-option label="支出" value="0" />
            <el-option label="收入" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="账单时间" prop="time">
          <el-date-picker
            class="input"
            v-model="newData.time"
            type="datetime"
          />
        </el-form-item>
        <el-form-item label="账单分类">
          <el-select v-model="newData.category" class="m-2 input">
            <el-option
              v-for="item in categoriesOption[newData.type]"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="账单金额" prop="amount">
          <el-input-number
            class="input"
            v-model="newData.amount"
            :min="0"
            :precision="2"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addData(newData)">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-table
      :data="tableData"
      style="width: 1000px; margin: auto"
      max-height="400"
    >
      <el-table-column
        prop="type"
        label="账单类型"
        :formatter="
          (item) => {
            return item.type === '1' ? '收入' : '支出';
          }
        "
      />
      <el-table-column prop="time" label="账单时间" />
      <el-table-column
        prop="category"
        label="账单分类"
        :formatter="
          (item) => {
            return categoriesObj[item.category];
          }
        "
      />
      <el-table-column prop="amount" label="账单金额" />
    </el-table>
  </div>
</template>

<script>
import readCsv from "@/common/readCsv.js";
import formatTime from "@/common/formatTime.js";

export default {
  name: "App",
  data() {
    return {
      categoriesOption: {}, //所有的账单分类选项,用于在新增账单表单中的选择框中选择账单分类
      categoriesObj: {}, //所有的账单分类列表,用于在表格中根据账单分类id显示对应的账单分类名称
      categoriesList: [], //所有的账单分类列表,用于在选择框中根据不同账单分类筛选表格数据
      tableData: [], //当前表格中展示的数据
      header: ["账单类型", "账单时间", "账单分类", "账单金额"], //表格头
      monthType: "allMonth", //当前显示的月份类型
      monthTypes: [
        { name: "全年", value: "allMonth" },
        { name: "1月", value: "1月" },
        { name: "2月", value: "2月" },
        { name: "3月", value: "3月" },
        { name: "4月", value: "4月" },
        { name: "5月", value: "5月" },
        { name: "6月", value: "6月" },
        { name: "7月", value: "7月" },
        { name: "8月", value: "8月" },
        { name: "9月", value: "9月" },
        { name: "10月", value: "10月" },
        { name: "11月", value: "11月" },
        { name: "12月", value: "12月" },
      ], //所有月份列表,包含显示名称和值
      dialogVisible: false, //是否显示添加数据的弹窗
      newData: { type: "0" }, //新添加的数据
      rules: {
        //表单校验规则
        type: [
          {
            required: true,
            message: "请输入账单类型",
            trigger: "blur",
          },
        ],
        time: [
          {
            required: true,
            message: "请输入账单时间",
            trigger: "blur",
          },
        ],
        amount: [
          {
            required: true,
            message: "请输入账单金额",
            trigger: "blur",
          },
        ],
      },
      category: "allCategories", //当前选择的账单分类
      expense: 0, //所有账单总支出金额
      income: 0, //所有账单总收入金额
      //billData是一个对象,以各个月份和各个账单分类为键,以符合条件的账单数据数组为值,
      // 当切换月份和账单分类时就可以方便地得出结果
      billData: {
        allMonth: [],
        "1月": [],
        "2月": [],
        "3月": [],
        "4月": [],
        "5月": [],
        "6月": [],
        "7月": [],
        "8月": [],
        "9月": [],
        "10月": [],
        "11月": [],
        "12月": [],
      },
      expenseObj: {
        allMonth: [],
        "1月": [],
        "2月": [],
        "3月": [],
        "4月": [],
        "5月": [],
        "6月": [],
        "7月": [],
        "8月": [],
        "9月": [],
        "10月": [],
        "11月": [],
        "12月": [],
      },
      expenseList: [],
    };
  },
  watch: {
    billData: {
      deep: true,
      handler(newValue) {
        const data = newValue[this.monthType];
        let expense = 0,
          income = 0;
        data.forEach((item) => {
          if (item.type === "1") {
            income += Number(item.amount);
          } else {
            expense += Number(item.amount);
          }
        });
        this.expense = expense;
        this.income = income;
      },
    },
    monthType: {
      handler(newValue) {
        const data = this.billData[newValue];
        let expense = 0,
          income = 0;
        data.forEach((item) => {
          if (item.type === "1") {
            income += Number(item.amount);
          } else {
            expense += Number(item.amount);
          }
        });
        this.expense = expense;
        this.income = income;
        this.expenseList = this.expenseObj[newValue];
      },
    },
  },
  methods: {
    //从csv文件中读取数据,并设置表单数据
    async getData() {
      //获取账单分类数据
      const categoriesData = await readCsv("/categories.csv"),
        categoriesOption = {},
        categoriesObj = {},
        categoriesList = [{ name: "所有账单分类", id: "allCategories" }];
      categoriesData.shift();
      for (const { type, id, name } of categoriesData) {
        if (!categoriesOption[type]) {
          categoriesOption[type] = [];
        }
        categoriesOption[type].push({ id, name });
        categoriesObj[id] = name;
        categoriesList.push({ name, id });
        this.billData[id] = [];
      }
      this.categoriesObj = categoriesObj;
      this.categoriesOption = categoriesOption;
      this.categoriesList = categoriesList;
      //获取账单数据
      const data = await readCsv("/bill.csv");
      data.shift();
      //将所有账单数据设置到billData的allMonth属性上
      this.billData.allMonth = JSON.parse(JSON.stringify(data));
      //将所有账单数据设置到billData的allCategories属性上
      this.billData.allCategories = JSON.parse(JSON.stringify(data));
      //循环账单,将账单的时间戳格式化为日期时间,并将账单数据添加到billData的对应月份上
      for (const i of data) {
        const { time, month } = formatTime(new Date(Number(i.time)));
        i.time = time;
        this.billData[month].push(i);
        this.billData[i.category].push(i);
      }
      //基于billData计算每个月按账单分类的支出金额
      for (const key in this.expenseObj) {
        const obj = {},
          data = this.billData[key];
        for (const { type, category, amount } of data) {
          //type为1代表是收入,不需要统计
          if (type === "1") {
            continue;
          }
          if (!obj[category]) {
            obj[category] = 0;
          }
          obj[category] += Number(amount);
        }
        let list = [];
        for (const category in obj) {
          list.push({ category, amount: obj[category] });
        }
        list = list.sort((a, b) => {
          return a.amount - b.amount;
        });
        this.expenseObj[key] = list;
      }
      this.expenseList = this.expenseObj.allMonth;
      //修改tableData,展示账单数据
      this.tableData = JSON.parse(JSON.stringify(data));
    },
    //添加账单数据
    addData(newData) {
      this.$refs.form.validate((valid, fields) => {
        if (valid) {
          this.dialogVisible = false;
          //获取新数据的月份
          const { time, month } = formatTime(newData.time),
            { category, type, amount } = newData,
            res = JSON.parse(JSON.stringify(newData));
          res.time = time;
          //将新数据添加到billData的allMonth和对应月份属性中
          this.billData.allMonth.push(res);
          this.billData[month].push(res);
          //将新数据添加到billData的allCategories和对应账单分类中
          this.billData.allCategories.push(res);
          this.billData[category].push(res);
          //如果type为0,表示是支出,修改expenseObj对应月份的数据
          if (type === "0") {
            let list1 = this.expenseObj.allMonth;
            //有可能expenseObj原本的账单类型中不包含本次添加的账单类型,需要先findIndex
            const index1 = list1.findIndex((item) => {
              return item.category === category;
            });
            if (index1 !== -1) {
              list1[index1].amount += amount;
            } else {
              list1.push({ category, amount });
            }
            list1 = list1.sort((a, b) => {
              return a.amount - b.amount;
            });
            let list2 = this.expenseObj[month];
            const index2 = list2.findIndex((item) => {
              return item.category === category;
            });
            if (index2 !== -1) {
              list2[index2].amount += amount;
            } else {
              list2.push({ category, amount });
            }
            list2 = list2.sort((a, b) => {
              return a.amount - b.amount;
            });
            this.expenseList = this.expenseObj[this.monthType];
          }
          //如果当前月份与新增账单月份相同,或者是全年,则修改总收入和总支出
          if(this.monthType === month || this.monthType === "allMonth"){
            if(type === "0"){
              this.expense += amount;
            }else{
              this.income += amount
            }
          }
          this.getTableData();
        } else {
          console.log("error submit!", fields);
        }
      });
    },
    //当账单分类发生变化时,账单分类可能和账单类型不符,需要校验
    checkCategory(type, category) {
      // 账单分类和账单类型不符时,清空账单分类
      if (
        this.categoriesOption[type].findIndex((item) => {
          return item.category === category;
        }) === -1
      ) {
        this.newData.category = "";
      }
    },
    //当账单的筛选条件,即月份和账单分类改变时调用,重新计算账单数据
    getTableData() {
      const monthType = this.billData[this.monthType],
        { category } = this;
      let res = [];
      if (category === "allCategories") {
        res = monthType;
      } else {
        for (const i of monthType) {
          if (i.category === category) {
            res.push(i);
          }
        }
      }
      this.tableData = [...res];
    },
  },
  created() {
    this.getData();
  },
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  div {
    box-sizing: border-box;
  }
  .head {
    width: 1000px;
    margin: auto;
    margin-bottom: 10px;
    > div {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      align-items: center;
      margin-bottom: 10px;
      .category_expense {
        margin-right: 10px;
        margin-bottom: 10px;
      }
    }
    .select {
      width: 100px;
      margin-right: 20px;
    }
    .count {
      margin-right: 20px;
    }
  }
  .input {
    width: 200px;
  }
}
</style>
