<template>
  <div>
    <div>
      运动方式
      <label>
        <input type="radio" value="linear" v-model="tweenFn" />
        线性
      </label>
      <label>
        <input type="radio" value="easeInQuad" v-model="tweenFn" />
        先慢后快
      </label>
      <label>
        <input type="radio" value="easeOutQuad" v-model="tweenFn" />
        先快后慢
      </label>
      <label>
        <input type="radio" value="easeInOutQuad" v-model="tweenFn" />
        先慢后快再慢
      </label>
      <label>
        <input type="radio" value="easeInOutBack" v-model="tweenFn" />
        回弹
      </label>
    </div>

    <div>运动时长: <input type="text" v-model.number="duration" /></div>

    <br />

    <div>
      <div>
        数字补间: {{ n(tween.state.number).fixed({ maxPrecision: 2 }) }}
      </div>
      <input v-once type="text" v-model.number="number" />
    </div>
    <div>
      <div>
        物体运动
        <v-button @click="handleStart">前进</v-button>
        <v-button @click="handleBack">后退</v-button>
      </div>

      <div class="box" ref="boxRef"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Tween, n } from '@cat-kit/fe'
import { reactive, shallowRef, watch } from 'vue'

const tweenFn = shallowRef('linear')
const duration = shallowRef(1000)

const number = shallowRef(0)

const tween = new Tween(
  reactive({
    number: number.value
  }),
  {
    onUpdate(state) {
      console.log(state.number)
    }
  }
)
watch(number, n =>
  tween.to(
    { number: n },
    { easingFunction: Tween.easing[tweenFn.value], duration: duration.value }
  )
)

// 物体运动
const boxRef = shallowRef<HTMLDivElement>()

let tween2 = new Tween(
  {
    x: 0,
    rotate: 0,
    radius: 0,
    r: 255,
    g: 0,
    b: 0,
    scaleY: 1
  },
  {
    onUpdate(state) {
      boxRef.value!.attributeStyleMap.set(
        'transform',
        `translateX(${state.x}px) rotate(${state.rotate}deg) scaleY(${state.scaleY})`
      )

      boxRef.value!.attributeStyleMap.set(
        'border-radius',
        `${state.radius < 0 ? 0 : state.radius}%`
      )

      boxRef.value!.attributeStyleMap.set(
        'background-color',
        `rgb(${Math.abs(state.r)},${Math.abs(state.g)},${Math.abs(state.b)})`
      )
      // boxRef.value!.style.transform = `translateX(${state.x}px) rotate(${state.rotate}deg)`
    }
  }
)

const handleStart = () => {
  tween2.to(
    { x: 200, rotate: 360, radius: 50, r: 0, g: 255, b: 0, scaleY: 0.3 },
    {
      duration: duration.value,
      easingFunction: Tween.easing[tweenFn.value]
    }
  )
}
const handleBack = async () => {
  tween2.back({
    duration: duration.value,
    easingFunction: Tween.easing[tweenFn.value]
  })
}
</script>

<style scoped>
.box {
  width: 50px;
  height: 50px;
  background-color: #f00;
}
</style>
